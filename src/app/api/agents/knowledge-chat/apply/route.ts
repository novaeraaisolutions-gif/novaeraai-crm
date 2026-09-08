import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Aplica uma proposta que a diretoria confirmou.
 *
 * A escrita acontece aqui e não no cliente por dois motivos: a decisão
 * fica registrada com quem confirmou e quando, e a mesma ação alimenta o
 * log de correções — que é o que permite, meses depois, saber por que o
 * conhecimento está do jeito que está.
 */

interface Proposal {
  tipo: "editar_bloco" | "criar_bloco" | "criar_regra";
  block_id?: string;
  kb_slug?: string;
  titulo?: string;
  conteudo?: string;
  phase_code?: string;
  motivo?: string;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { messageId, decision } = (await req.json().catch(() => ({}))) as {
    messageId?: string;
    decision?: "aplicar" | "descartar";
  };
  if (!messageId || !decision) {
    return Response.json({ error: "messageId e decision obrigatórios" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: me } = await admin
    .from("users").select("org_id, role").eq("id", user.id).maybeSingle();
  if (!me || me.role !== "admin") {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const { data: msg } = await admin
    .from("agent_knowledge_messages")
    .select("id, agent_id, org_id, proposal, status")
    .eq("id", messageId)
    .maybeSingle();

  if (!msg || msg.org_id !== me.org_id) {
    return Response.json({ error: "Proposta não encontrada" }, { status: 404 });
  }
  if (msg.status !== "pendente") {
    return Response.json({ error: "Esta proposta já foi decidida." }, { status: 409 });
  }

  if (decision === "descartar") {
    await admin
      .from("agent_knowledge_messages")
      .update({ status: "descartada", decided_by: user.id, decided_at: new Date().toISOString() })
      .eq("id", messageId);
    return Response.json({ ok: true, applied: false });
  }

  const proposal = msg.proposal as unknown as Proposal;
  const agentId = msg.agent_id as string;

  let blockId: string | null = null;
  let ruleId: string | null = null;

  try {
    if (proposal.tipo === "editar_bloco") {
      if (!proposal.block_id) throw new Error("Proposta sem bloco de destino.");

      // Confere que o bloco pertence a uma base que ESTE agente lê. Sem
      // isso, uma proposta malformada poderia editar o conhecimento de
      // outro agente e furar o isolamento pela porta dos fundos.
      const { data: allowed } = await admin
        .from("knowledge_blocks")
        .select("id, kb_id")
        .eq("id", proposal.block_id)
        .maybeSingle();
      if (!allowed) throw new Error("Bloco não encontrado.");

      const { data: link } = await admin
        .from("agent_knowledge")
        .select("kb_id")
        .eq("agent_id", agentId)
        .eq("kb_id", allowed.kb_id)
        .maybeSingle();
      if (!link) throw new Error("Este bloco não pertence ao conhecimento deste agente.");

      const { error } = await admin
        .from("knowledge_blocks")
        .update({
          title: proposal.titulo ?? "",
          content: proposal.conteudo ?? "",
          updated_by: user.id,
        })
        .eq("id", proposal.block_id);
      if (error) throw error;
      blockId = proposal.block_id;

    } else if (proposal.tipo === "criar_bloco") {
      const { data: base } = await admin
        .from("knowledge_bases")
        .select("id")
        .eq("org_id", me.org_id)
        .eq("slug", proposal.kb_slug ?? "")
        .maybeSingle();
      if (!base) throw new Error(`Base ${proposal.kb_slug} não encontrada.`);

      const { data: link } = await admin
        .from("agent_knowledge")
        .select("kb_id")
        .eq("agent_id", agentId)
        .eq("kb_id", base.id)
        .maybeSingle();
      if (!link) throw new Error("Esta base não faz parte do conhecimento deste agente.");

      const { count } = await admin
        .from("knowledge_blocks")
        .select("id", { count: "exact", head: true })
        .eq("kb_id", base.id);

      const { data: created, error } = await admin
        .from("knowledge_blocks")
        .insert({
          kb_id: base.id,
          title: proposal.titulo ?? "Sem título",
          content: proposal.conteudo ?? "",
          position: count ?? 0,
          updated_by: user.id,
        })
        .select("id")
        .single();
      if (error) throw error;
      blockId = created.id as string;

    } else if (proposal.tipo === "criar_regra") {
      // O código de fase precisa existir de verdade. Um código inventado
      // ("PROPOSTA" em vez de "K") seria gravado sem erro e a regra
      // nunca se aplicaria a fase nenhuma — falha silenciosa, que é
      // exatamente o que este sistema existe para evitar. Na dúvida, a
      // regra vale para todas as fases.
      let phase: string | null = null;
      if (proposal.phase_code && proposal.phase_code.toLowerCase() !== "todas") {
        const { data: match } = await admin
          .from("agent_phases")
          .select("code")
          .eq("agent_id", agentId)
          .eq("code", proposal.phase_code)
          .maybeSingle();
        phase = match ? (match.code as string) : null;
      }

      const { data: created, error } = await admin
        .from("agent_rules")
        .insert({
          agent_id: agentId,
          phase_code: phase,
          content: proposal.conteudo ?? "",
          author_id: user.id,
        })
        .select("id")
        .single();
      if (error) throw error;
      ruleId = created.id as string;

    } else {
      throw new Error("Tipo de proposta desconhecido.");
    }

    await admin
      .from("agent_knowledge_messages")
      .update({
        status: "aplicada",
        applied_block_id: blockId,
        applied_rule_id: ruleId,
        decided_by: user.id,
        decided_at: new Date().toISOString(),
      })
      .eq("id", messageId);

    // O log de correções: liga a mudança ao que a motivou.
    await admin.from("agent_corrections").insert({
      org_id: me.org_id,
      agent_id: agentId,
      content: proposal.motivo ?? "",
      resolution: proposal.tipo === "criar_regra" ? "regra" : "conhecimento",
      resolved_rule_id: ruleId,
      resolved_block_id: blockId,
      author_id: user.id,
      confirmed_by: user.id,
      confirmed_at: new Date().toISOString(),
    });

    return Response.json({ ok: true, applied: true, blockId, ruleId });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[knowledge-chat/apply]", detail);
    return Response.json({ error: detail }, { status: 400 });
  }
}
