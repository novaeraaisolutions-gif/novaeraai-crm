import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveRunChain } from "@/lib/agents/context";

/**
 * Passa o bastão para o próximo agente da esteira.
 *
 * Abre uma operação nova, encadeada na atual. O que atravessa são os
 * artefatos validados — e só eles. A conversa do agente anterior fica
 * para trás de propósito: a Arquitetura precisa ler o A2 como um
 * documento fechado, não acompanhar as dúvidas e os descartes de quem o
 * escreveu. Herdar a conversa inteira reintroduziria, pela porta dos
 * fundos, exatamente o vazamento que a separação em agentes evita.
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { runId } = (await req.json().catch(() => ({}))) as { runId?: string };
  if (!runId) return Response.json({ error: "runId obrigatório" }, { status: 400 });

  const admin = createAdminClient();

  const { data: me } = await admin
    .from("users").select("org_id").eq("id", user.id).maybeSingle();
  if (!me) return Response.json({ error: "forbidden" }, { status: 403 });

  const { data: run } = await admin
    .from("agent_runs")
    .select("id, org_id, agent_id, title, lead_id, company_id")
    .eq("id", runId)
    .maybeSingle();
  if (!run || run.org_id !== me.org_id) {
    return Response.json({ error: "Operação não encontrada" }, { status: 404 });
  }

  const { data: agent } = await admin
    .from("agents")
    .select("id, slug, name, next_agent_slug")
    .eq("id", run.agent_id as string)
    .maybeSingle();

  const nextSlug = agent?.next_agent_slug as string | null;
  if (!nextSlug) {
    return Response.json(
      { error: `${agent?.name ?? "Este agente"} é o último da esteira — não há para quem passar.` },
      { status: 400 }
    );
  }

  const { data: next } = await admin
    .from("agents")
    .select("id, name, slug, active")
    .eq("org_id", me.org_id)
    .eq("slug", nextSlug)
    .maybeSingle();

  if (!next) {
    return Response.json({ error: `Agente "${nextSlug}" não encontrado.` }, { status: 404 });
  }
  if (!next.active) {
    return Response.json(
      { error: `${next.name} ainda não está ativo.` },
      { status: 400 }
    );
  }

  // O gate da primeira fase do próximo agente, verificado aqui e não lá:
  // abrir uma operação que já nasce travada é pior do que não abrir, e a
  // mensagem de erro fica longe da ação que a causou.
  const { data: firstPhase } = await admin
    .from("agent_phases")
    .select("code, name, requires_artifacts")
    .eq("agent_id", next.id as string)
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();

  const requires = ((firstPhase?.requires_artifacts as string[] | null) ?? []);

  if (requires.length > 0) {
    const chain = await resolveRunChain(admin, runId);
    const { data: valid } = await admin
      .from("agent_artifacts")
      .select("kind")
      .in("run_id", chain)
      .eq("status", "validado");

    const have = new Set(((valid ?? []) as { kind: string }[]).map((a) => a.kind));
    const missing = requires.filter((r) => !have.has(r));

    if (missing.length > 0) {
      return Response.json(
        {
          error: `${next.name} precisa de ${missing.join(" e ")} validado(s). Valide o artefato antes de passar adiante.`,
          missing,
        },
        { status: 409 }
      );
    }
  }

  // Uma operação por agente para o mesmo cliente. Reabrir a segunda
  // Arquitetura do mesmo Diagnóstico é legítimo (o sócio pode querer
  // refazer), então isto não é bloqueado — mas avisamos no retorno.
  const { data: existing } = await admin
    .from("agent_runs")
    .select("id")
    .eq("parent_run_id", runId)
    .eq("agent_id", next.id as string)
    .limit(1)
    .maybeSingle();

  const { data: created, error } = await admin
    .from("agent_runs")
    .insert({
      org_id: me.org_id,
      agent_id: next.id as string,
      parent_run_id: runId,
      title: run.title as string,
      lead_id: (run.lead_id as string | null) ?? null,
      company_id: (run.company_id as string | null) ?? null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({
    ok: true,
    runId: created.id,
    agentName: next.name,
    duplicate: !!existing,
  });
}
