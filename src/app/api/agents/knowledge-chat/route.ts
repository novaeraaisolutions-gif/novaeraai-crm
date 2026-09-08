import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";

export const maxDuration = 120;

/**
 * Conversa de curadoria: a diretoria diz o que mudou, o agente lê o que
 * ele mesmo sabe e propõe onde aquilo entra.
 *
 * O agente NUNCA aplica. Ele propõe, e a proposta fica pendente até
 * alguém confirmar — aplicar direto seria deixar o modelo reescrever o
 * próprio método sem ninguém olhando.
 */

const TOOLS: Anthropic.Tool[] = [
  {
    name: "editar_bloco",
    description:
      "Propõe reescrever um bloco de conhecimento existente. Use quando a informação já está registrada em algum lugar e mudou, ou está errada. Sempre prefira editar a criar duplicata.",
    input_schema: {
      type: "object",
      properties: {
        block_id: { type: "string", description: "id do bloco a alterar" },
        titulo: { type: "string", description: "título, novo ou mantido" },
        conteudo: {
          type: "string",
          description:
            "conteúdo COMPLETO do bloco depois da alteração, não só o trecho que muda",
        },
        motivo: { type: "string", description: "o que muda e por quê, em uma frase" },
      },
      required: ["block_id", "titulo", "conteudo", "motivo"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    name: "criar_bloco",
    description:
      "Propõe um bloco novo numa base. Use quando o assunto ainda não existe em lugar nenhum do conhecimento.",
    input_schema: {
      type: "object",
      properties: {
        kb_slug: { type: "string", description: "slug da base, ex: NE-COMERCIAL" },
        titulo: { type: "string" },
        conteudo: { type: "string" },
        motivo: { type: "string" },
      },
      required: ["kb_slug", "titulo", "conteudo", "motivo"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    name: "criar_regra",
    description:
      "Propõe uma regra permanente de comportamento. Use para instrução sobre COMO o agente deve agir ('nunca recomende plano abaixo de X', 'sempre cite a fonte'), não para fato. Fato vai em bloco de conhecimento.",
    input_schema: {
      type: "object",
      properties: {
        conteudo: { type: "string", description: "a regra, direta e verificável" },
        phase_code: {
          type: "string",
          description: "código da fase em que vale, ou 'todas'",
        },
        motivo: { type: "string" },
      },
      required: ["conteudo", "phase_code", "motivo"],
      additionalProperties: false,
    },
    strict: true,
  },
];

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY não configurada." }, { status: 503 });
  }

  const { agentId, message } = (await req.json().catch(() => ({}))) as {
    agentId?: string; message?: string;
  };
  if (!agentId || !message?.trim()) {
    return Response.json({ error: "agentId e mensagem obrigatórios" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Curadoria é da diretoria.
  const { data: me } = await admin
    .from("users").select("org_id, role").eq("id", user.id).maybeSingle();
  if (!me || me.role !== "admin") {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const { data: agentRow } = await admin
    .from("agents").select("id, name, slug, model, org_id").eq("id", agentId).maybeSingle();
  if (!agentRow || agentRow.org_id !== me.org_id) {
    return Response.json({ error: "Agente não encontrado" }, { status: 404 });
  }

  // O conhecimento deste agente, com os ids — o agente precisa saber qual
  // bloco alterar, então aqui os identificadores entram junto do texto.
  const { data: links } = await admin
    .from("agent_knowledge")
    .select("kb:knowledge_bases(id, slug, name)")
    .eq("agent_id", agentId);

  const bases = ((links ?? []) as unknown as {
    kb: { id: string; slug: string; name: string } | null;
  }[]).map((l) => l.kb).filter((k): k is NonNullable<typeof k> => !!k);

  const parts: string[] = [];
  for (const base of bases) {
    const { data: blocks } = await admin
      .from("knowledge_blocks")
      .select("id, title, content, version")
      .eq("kb_id", base.id)
      .order("position", { ascending: true });

    const rows = (blocks ?? []) as {
      id: string; title: string; content: string; version: number;
    }[];

    parts.push(
      `## ${base.slug} — ${base.name}${rows.length === 0 ? "\n\n(base vazia)" : ""}\n\n` +
        rows
          .map((b) => `### [${b.id}] ${b.title} (v${b.version})\n\n${b.content}`)
          .join("\n\n")
    );
  }

  const { data: ruleRows } = await admin
    .from("agent_rules")
    .select("content, phase_code, active")
    .eq("agent_id", agentId)
    .eq("active", true);

  const rules = (ruleRows ?? []) as { content: string; phase_code: string | null }[];

  const { data: phaseRows } = await admin
    .from("agent_phases").select("code, name").eq("agent_id", agentId).order("position");
  const phases = (phaseRows ?? []) as { code: string; name: string }[];

  const system = [
    `Você cuida do conhecimento do agente **${agentRow.name}** da Nova Era AI.`,
    "",
    "Quem fala com você é da diretoria. Seu trabalho é manter o que esse agente sabe correto e atualizado — não é executar o trabalho dele.",
    "",
    "## Como agir",
    "",
    "1. Quando disserem que algo mudou ou está errado, **encontre onde aquilo vive** no conhecimento abaixo e proponha a alteração com a ferramenta certa.",
    "2. Prefira **editar** o bloco existente a criar bloco novo. Duplicata é pior que desatualização: o agente lê os dois e escolhe um arbitrariamente.",
    "3. Ao editar, devolva o **conteúdo completo** do bloco já corrigido, preservando o que não mudou.",
    "4. Distinga **fato** de **comportamento**. Fato ('a mensalidade da Automarcas é R$ 650') vira bloco. Comportamento ('nunca recomende plano abaixo do piso') vira regra.",
    "5. Se o pedido for ambíguo, ou couber em mais de um lugar, **pergunte antes de propor**. Uma proposta errada aplicada contamina todos os clientes seguintes, em silêncio.",
    "6. Se perguntarem o que você sabe sobre algo, apenas responda — nem toda conversa termina em mudança.",
    "",
    "Você **nunca aplica** nada. Toda proposta é confirmada por uma pessoa antes de valer.",
    "",
    phases.length ? `## Fases deste agente\n\n${phases.map((p) => `- \`${p.code}\` ${p.name}`).join("\n")}` : "",
    "",
    rules.length
      ? `## Regras já ativas\n\n${rules.map((r) => `- ${r.content}${r.phase_code ? ` (fase ${r.phase_code})` : ""}`).join("\n")}\n\nAntes de propor regra nova, verifique se ela contradiz alguma acima. Regras que se contradizem fazem o agente escolher uma arbitrariamente.`
      : "",
    "",
    "---",
    "",
    "# CONHECIMENTO ATUAL",
    "",
    "Cada bloco vem com seu id entre colchetes — use-o em `editar_bloco`.",
    "",
    parts.join("\n\n---\n\n"),
  ].filter(Boolean).join("\n");

  const { data: history } = await admin
    .from("agent_knowledge_messages")
    .select("role, content")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: true })
    .limit(60);

  const messages: Anthropic.MessageParam[] = [
    ...((history ?? []) as { role: string; content: string }[]).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  await admin.from("agent_knowledge_messages").insert({
    org_id: me.org_id,
    agent_id: agentId,
    role: "user",
    content: message,
    author_id: user.id,
  });

  const anthropic = new Anthropic({ apiKey });

  try {
    const res = await anthropic.messages.create({
      model: (agentRow.model as string) || "claude-opus-5",
      max_tokens: 16000,
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      messages,
      tools: TOOLS,
      thinking: { type: "adaptive" },
      output_config: { effort: "high" },
    });

    const text = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    const toolUse = res.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );

    // O tipo Json do Supabase não aceita Record<string, unknown> direto;
    // serializar e reler garante que só há valores JSON de verdade.
    const proposal = toolUse
      ? (JSON.parse(JSON.stringify({ tipo: toolUse.name, ...(toolUse.input as object) })) as Json)
      : null;

    const { data: saved } = await admin
      .from("agent_knowledge_messages")
      .insert({
        org_id: me.org_id,
        agent_id: agentId,
        role: "assistant",
        content: text || "(proposta abaixo)",
        proposal,
        status: proposal ? "pendente" : "sem_proposta",
        input_tokens: res.usage.input_tokens,
        output_tokens: res.usage.output_tokens,
      })
      .select("id")
      .single();

    return Response.json({
      ok: true,
      messageId: saved?.id ?? null,
      text,
      proposal,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[knowledge-chat]", detail);
    return Response.json({ error: detail }, { status: 500 });
  }
}
