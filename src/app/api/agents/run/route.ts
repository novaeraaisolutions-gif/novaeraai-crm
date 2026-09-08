import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildPhaseContext, checkGate, loadValidatedArtifacts,
} from "@/lib/agents/context";
import { validateArtifact, issuesToPrompt } from "@/lib/agents/validators";
import { isDocumentKind, extractHtml } from "@/lib/agents/documents";

// As fases são longas — a Fase B roda no effort máximo sobre uma
// transcrição inteira. Streaming mantém a conexão viva e mostra o texto
// nascendo em vez de um spinner de dois minutos.
export const maxDuration = 300;

const EFFORT = new Set(["low", "medium", "high", "xhigh", "max"]);

interface RunBody {
  runId: string;
  /** Com phaseCode: executa a fase. Sem: conversa livre. */
  phaseCode?: string;
  message?: string;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY não configurada no ambiente." },
      { status: 503 }
    );
  }

  const { runId, phaseCode, message } = (await req.json().catch(() => ({}))) as RunBody;
  if (!runId) return Response.json({ error: "runId obrigatório" }, { status: 400 });

  const admin = createAdminClient();

  const { data: runRow } = await admin
    .from("agent_runs")
    .select("id, org_id, agent_id, title")
    .eq("id", runId)
    .maybeSingle();
  if (!runRow) return Response.json({ error: "Operação não encontrada" }, { status: 404 });

  const { data: me } = await admin
    .from("users").select("org_id").eq("id", user.id).maybeSingle();
  if (!me || me.org_id !== runRow.org_id) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const agentId = runRow.agent_id as string;

  // ── contexto ──
  // Numa conversa livre usamos a fase corrente só para carregar prompt e
  // conhecimento; a instrução da fase NÃO entra, senão o modelo executaria
  // a fase de novo a cada pergunta.
  const { data: firstPhase } = await admin
    .from("agent_phases")
    .select("code")
    .eq("agent_id", agentId)
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();

  const contextPhase = phaseCode ?? (firstPhase?.code as string | undefined);
  if (!contextPhase) {
    return Response.json({ error: "Este agente ainda não tem fases configuradas." }, { status: 400 });
  }

  let ctx;
  try {
    ctx = await buildPhaseContext(admin, agentId, contextPhase);
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Erro ao montar contexto" },
      { status: 400 }
    );
  }

  // ── gate ──
  // É aqui que a parada de fase deixa de depender de obediência: sem o
  // artefato exigido validado, a instrução da fase nem é montada.
  if (phaseCode) {
    const gate = await checkGate(admin, runId, ctx.phase.requiresArtifacts);
    if (!gate.ok) {
      return Response.json(
        {
          error: "gate",
          detail: `A fase ${phaseCode} exige ${gate.missing.join(" e ")} validado(s) antes de rodar.`,
          missing: gate.missing,
        },
        { status: 409 }
      );
    }
  }

  // ── histórico e artefatos ──
  const [{ data: history }, artifacts] = await Promise.all([
    admin
      .from("agent_messages")
      .select("role, content")
      .eq("run_id", runId)
      .order("created_at", { ascending: true }),
    loadValidatedArtifacts(admin, runId),
  ]);

  const messages: Anthropic.MessageParam[] = [];

  // Os artefatos validados entram como primeira mensagem. É o handoff —
  // a Arquitetura recebe A1+A2 e nada mais da conversa do Diagnóstico.
  // Vêm da corrente de operações, então atravessam a fronteira entre
  // agentes; o histórico do agente anterior, não.
  if (artifacts.length > 0) {
    messages.push({
      role: "user",
      content: artifacts
        .map((a) => `# ${a.kind} — validado\n\n${a.content_md ?? a.content_html ?? ""}`)
        .join("\n\n---\n\n"),
    });
    messages.push({
      role: "assistant",
      content: "Recebido. Aguardando a instrução da fase.",
    });
  }

  for (const m of (history ?? []) as { role: string; content: string }[]) {
    if (m.role === "user" || m.role === "assistant") {
      messages.push({ role: m.role, content: m.content });
    }
  }

  const turn = phaseCode
    ? `# EXECUTAR FASE ${ctx.phase.code} — ${ctx.phase.name}\n\n${ctx.phase.instruction}\n\nExecute apenas esta fase. Não avance para a seguinte.`
    : (message ?? "");

  if (!turn.trim()) {
    return Response.json({ error: "Mensagem vazia" }, { status: 400 });
  }
  messages.push({ role: "user", content: turn });

  // Registra o turno do usuário antes de chamar o modelo, para não perder
  // a pergunta se a geração falhar no meio.
  await admin.from("agent_messages").insert({
    run_id: runId,
    role: "user",
    content: phaseCode ? `▶ Executar Fase ${ctx.phase.code} — ${ctx.phase.name}` : turn,
    phase_code: phaseCode ?? null,
    is_phase_run: !!phaseCode,
    author_id: user.id,
  });

  const anthropic = new Anthropic({ apiKey });
  const effort = EFFORT.has(ctx.phase.effort) ? ctx.phase.effort : "high";

  // O cache cobre prompt + conhecimento; as regras ficam depois do ponto
  // de corte, então mudar uma regra não invalida o cache do método.
  const system: Anthropic.TextBlockParam[] = [
    { type: "text", text: ctx.cacheableSystem, cache_control: { type: "ephemeral" } },
  ];
  if (ctx.rulesBlock) system.push({ type: "text", text: ctx.rulesBlock });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      const generate = async (msgs: Anthropic.MessageParam[]) => {
        let text = "";
        const run = anthropic.messages.stream({
          model: ctx.agent.model || "claude-opus-5",
          max_tokens: 32000,
          system,
          messages: msgs,
          thinking: { type: "adaptive" },
          output_config: { effort: effort as "low" | "medium" | "high" | "xhigh" | "max" },
        });

        run.on("text", (chunk) => {
          text += chunk;
          send("text", { chunk });
        });

        const final = await run.finalMessage();
        return { text, usage: final.usage };
      };

      try {
        send("start", { phase: phaseCode ?? null, effort });

        let { text, usage } = await generate(messages);

        // ── travas do método ──
        // Só na execução de fase: conversa livre não produz artefato.
        let revalidated = false;
        if (phaseCode && ctx.phase.producesArtifact) {
          const check = validateArtifact(ctx.phase.producesArtifact, text);
          if (!check.ok) {
            send("revalidating", { issues: check.issues });
            const retryMessages: Anthropic.MessageParam[] = [
              ...messages,
              { role: "assistant", content: text },
              { role: "user", content: issuesToPrompt(check.issues) },
            ];
            const retry = await generate(retryMessages);
            text = retry.text;
            usage = retry.usage;
            revalidated = true;
          }
        }

        // ── grava ──
        await admin.from("agent_messages").insert({
          run_id: runId,
          role: "assistant",
          content: text,
          phase_code: phaseCode ?? null,
          is_phase_run: !!phaseCode,
          input_tokens: usage.input_tokens,
          output_tokens: usage.output_tokens,
          cache_read_tokens: usage.cache_read_input_tokens ?? 0,
        });

        let artifactId: string | null = null;
        if (phaseCode && ctx.phase.producesArtifact) {
          // Rascunho novo substitui o rascunho anterior do mesmo tipo; o
          // que já foi validado é preservado.
          await admin
            .from("agent_artifacts")
            .update({ status: "substituido" })
            .eq("run_id", runId)
            .eq("kind", ctx.phase.producesArtifact)
            .eq("status", "rascunho");

          const { data: prev } = await admin
            .from("agent_artifacts")
            .select("version")
            .eq("run_id", runId)
            .eq("kind", ctx.phase.producesArtifact)
            .order("version", { ascending: false })
            .limit(1)
            .maybeSingle();

          // D1 e D2 saem em HTML porque vão para o cliente. O texto bruto
          // é preservado junto: se a extração falhar, ainda há o que ler.
          const html = isDocumentKind(ctx.phase.producesArtifact)
            ? extractHtml(text)
            : null;

          const { data: created } = await admin
            .from("agent_artifacts")
            .insert({
              run_id: runId,
              kind: ctx.phase.producesArtifact,
              version: ((prev?.version as number | undefined) ?? 0) + 1,
              phase_code: phaseCode,
              content_md: text,
              content_html: html,
              status: "rascunho",
              kb_versions: ctx.kbVersions,
              model: ctx.agent.model,
              effort,
            })
            .select("id")
            .single();
          artifactId = (created?.id as string) ?? null;
        }

        await admin
          .from("agent_runs")
          .update({ current_phase: phaseCode ?? null })
          .eq("id", runId);

        send("done", {
          artifactId,
          artifactKind: ctx.phase.producesArtifact,
          revalidated,
          usage: {
            input: usage.input_tokens,
            output: usage.output_tokens,
            cacheRead: usage.cache_read_input_tokens ?? 0,
            cacheWrite: usage.cache_creation_input_tokens ?? 0,
          },
        });
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        console.error("[agents/run]", detail);
        send("error", { detail });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
