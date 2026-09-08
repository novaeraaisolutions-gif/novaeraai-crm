import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadValidatedArtifacts } from "@/lib/agents/context";
import type { Json } from "@/types/database";

export const maxDuration = 180;

/**
 * Fecha o ciclo: a proposta aceita vira projeto no CRM.
 *
 * O caminho óbvio seria varrer o HTML do D2 atrás de "R$". Ele quebra na
 * primeira proposta com parcelamento diferente, e quebra em silêncio —
 * um projeto entra com o valor errado e ninguém percebe até a cobrança.
 *
 * Aqui o próprio agente relê o que ele mesmo produziu e preenche um
 * formulário de campos fixos. O schema é `strict`, então o que volta ou
 * cabe nos campos ou a chamada falha; não existe meio-termo silencioso.
 *
 * E ele não escreve nada. Isto produz um rascunho de fechamento que
 * alguém confere e corrige antes de virar linha no financeiro.
 */

const CATEGORIAS = ["pessoal", "infraestrutura", "software", "terceiros", "marketing", "outros"];

const TOOL: Anthropic.Tool = {
  name: "registrar_fechamento",
  description:
    "Transcreve a proposta aprovada para os campos do CRM. Todos os valores vêm dos artefatos; nunca invente número que não esteja lá.",
  input_schema: {
    type: "object",
    properties: {
      projeto: {
        type: "object",
        properties: {
          nome: { type: "string", description: "Ex.: 'Automarcas - CRM & AI AGENT'" },
          descricao: { type: "string", description: "O escopo fechado em até 5 linhas" },
          nivel: { type: "string", description: "Enxuta, Ideal ou Completa — o nível aprovado" },
          valor_implementacao: { type: "number", description: "Investimento de implementação, em reais" },
          valor_mensal: { type: "number", description: "Mensalidade recomendada, em reais. 0 se não houver" },
          plano: {
            type: "string",
            description: "core, evolucao, parceiro, ou vazio se a proposta não define plano",
          },
          prazo_dias: { type: "number", description: "Prazo de entrega em dias corridos, do cronograma" },
        },
        required: ["nome", "descricao", "nivel", "valor_implementacao", "valor_mensal", "plano", "prazo_dias"],
        additionalProperties: false,
      },
      parcelas: {
        type: "array",
        description: "O parcelamento por marco, exatamente como está na proposta.",
        items: {
          type: "object",
          properties: {
            descricao: { type: "string", description: "Ex.: 'Entrada' ou 'Parcela 2/3 — homologação'" },
            valor: { type: "number" },
            percentual: { type: "number", description: "Percentual do total de implementação" },
            marco: { type: "string", description: "O marco verificável que libera esta parcela" },
            dias_apos_inicio: { type: "number", description: "Vencimento em dias após o início do projeto" },
          },
          required: ["descricao", "valor", "percentual", "marco", "dias_apos_inicio"],
          additionalProperties: false,
        },
      },
      fases: {
        type: "array",
        description: "As fases do cronograma, na ordem, com seus marcos.",
        items: {
          type: "object",
          properties: {
            nome: { type: "string" },
            dias_apos_inicio: { type: "number", description: "Quando esta fase termina" },
            marcos: { type: "array", items: { type: "string" } },
          },
          required: ["nome", "dias_apos_inicio", "marcos"],
          additionalProperties: false,
        },
      },
      custos: {
        type: "array",
        description:
          "Os custos do A4 — implementação e recorrentes. É o que permite ver a margem real do projeto depois.",
        items: {
          type: "object",
          properties: {
            descricao: { type: "string" },
            categoria: { type: "string", enum: CATEGORIAS },
            tipo: { type: "string", enum: ["implementacao", "mensal_recorrente", "eventual"] },
            valor: { type: "number" },
          },
          required: ["descricao", "categoria", "tipo", "valor"],
          additionalProperties: false,
        },
      },
      observacoes: {
        type: "string",
        description:
          "O que você não conseguiu extrair com segurança, ou onde a proposta está ambígua. Diga aqui em vez de chutar no campo.",
      },
    },
    required: ["projeto", "parcelas", "fases", "custos", "observacoes"],
    additionalProperties: false,
  },
  strict: true,
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY não configurada." }, { status: 503 });
  }

  const { runId } = (await req.json().catch(() => ({}))) as { runId?: string };
  if (!runId) return Response.json({ error: "runId obrigatório" }, { status: 400 });

  const admin = createAdminClient();

  const { data: me } = await admin
    .from("users").select("org_id").eq("id", user.id).maybeSingle();
  if (!me) return Response.json({ error: "forbidden" }, { status: 403 });

  const { data: run } = await admin
    .from("agent_runs")
    .select("id, org_id, agent_id, title, closed_project_id")
    .eq("id", runId)
    .maybeSingle();
  if (!run || run.org_id !== me.org_id) {
    return Response.json({ error: "Operação não encontrada" }, { status: 404 });
  }
  if (run.closed_project_id) {
    return Response.json(
      { error: "Esta operação já foi fechada em um projeto." },
      { status: 409 }
    );
  }

  const artifacts = await loadValidatedArtifacts(admin, runId);
  const kinds = new Set(artifacts.map((a) => a.kind));

  // Sem D2 não existe proposta aprovada, e sem A4 não existem custos —
  // o projeto entraria sem base de margem, que é metade do motivo de
  // registrar isto no CRM.
  const missing = ["A3", "A4", "D2"].filter((k) => !kinds.has(k));
  if (missing.length > 0) {
    return Response.json(
      {
        error: `Faltam artefatos validados: ${missing.join(", ")}. O fechamento se apoia no escopo (A3), nos custos (A4) e na proposta (D2).`,
        missing,
      },
      { status: 409 }
    );
  }

  const dossie = artifacts
    .map((a) => `# ${a.kind}\n\n${a.content_md ?? a.content_html ?? ""}`)
    .join("\n\n---\n\n");

  const anthropic = new Anthropic({ apiKey });

  try {
    const res = await anthropic.messages.create({
      model: "claude-opus-5",
      max_tokens: 8000,
      system: [
        {
          type: "text",
          text: [
            "Você está transcrevendo uma proposta aprovada da Nova Era AI para os campos do CRM.",
            "",
            "Isto não é uma nova análise. Todo número que você preencher tem que estar nos artefatos abaixo — se um valor não está lá, não invente: registre a ausência em `observacoes`.",
            "",
            "O nível aprovado é o **recomendado** no A3, salvo indicação em contrário no D2.",
            "",
            "Os custos vêm do A4: implementação (dias-dev × custo/dia) e recorrentes mensais. São eles que permitem ver a margem real depois — um projeto sem custos registrados parece lucrativo até a hora de fechar o mês.",
          ].join("\n"),
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: dossie }],
      tools: [TOOL],
      tool_choice: { type: "tool", name: "registrar_fechamento" },
      thinking: { type: "adaptive" },
      output_config: { effort: "high" },
    });

    const toolUse = res.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
    );
    if (!toolUse) {
      return Response.json(
        { error: "O agente não conseguiu preencher o fechamento a partir dos artefatos." },
        { status: 422 }
      );
    }

    const payload = JSON.parse(JSON.stringify(toolUse.input)) as Json;

    // Guardado como artefato: o fechamento é rastreável como qualquer
    // outra saída, e um rascunho novo substitui o anterior.
    await admin
      .from("agent_artifacts")
      .update({ status: "substituido" })
      .eq("run_id", runId)
      .eq("kind", "FECHAMENTO")
      .eq("status", "rascunho");

    const { data: created, error } = await admin
      .from("agent_artifacts")
      .insert({
        run_id: runId,
        kind: "FECHAMENTO",
        phase_code: null,
        content_json: payload,
        status: "rascunho",
        model: "claude-opus-5",
        effort: "high",
      })
      .select("id")
      .single();
    if (error) throw error;

    return Response.json({ ok: true, artifactId: created.id, fechamento: payload });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[agents/close/extract]", detail);
    return Response.json({ error: detail }, { status: 500 });
  }
}
