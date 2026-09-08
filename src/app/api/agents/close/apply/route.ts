import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Escreve o fechamento no CRM: proposta, projeto, parcelas, cronograma e
 * custos.
 *
 * Recebe o fechamento já revisado pela tela — não relê o artefato. Quem
 * confirma pode ter corrigido um valor, e o que vale é o que a pessoa viu
 * na hora de clicar, não o que o modelo escreveu vinte minutos antes.
 */

interface Fechamento {
  projeto: {
    nome: string;
    descricao: string;
    nivel: string;
    valor_implementacao: number;
    valor_mensal: number;
    plano: string;
    prazo_dias: number;
  };
  parcelas: { descricao: string; valor: number; percentual: number; marco: string; dias_apos_inicio: number }[];
  fases: { nome: string; dias_apos_inicio: number; marcos: string[] }[];
  custos: { descricao: string; categoria: string; tipo: string; valor: number }[];
  observacoes?: string;
}

const PLANOS = new Set(["core", "evolucao", "parceiro"]);
const CATEGORIAS = new Set(["pessoal", "infraestrutura", "software", "terceiros", "marketing", "outros"]);
const TIPOS = new Set(["implementacao", "mensal_recorrente", "eventual"]);

const addDays = (base: Date, days: number): string => {
  const d = new Date(base);
  d.setDate(d.getDate() + Math.round(days || 0));
  return d.toISOString().slice(0, 10);
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const { runId, fechamento, startDate } = (await req.json().catch(() => ({}))) as {
    runId?: string;
    fechamento?: Fechamento;
    startDate?: string;
  };
  if (!runId || !fechamento) {
    return Response.json({ error: "runId e fechamento obrigatórios" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: me } = await admin
    .from("users").select("org_id, role").eq("id", user.id).maybeSingle();
  if (!me) return Response.json({ error: "forbidden" }, { status: 403 });

  const { data: run } = await admin
    .from("agent_runs")
    .select("id, org_id, title, lead_id, company_id, closed_project_id")
    .eq("id", runId)
    .maybeSingle();
  if (!run || run.org_id !== me.org_id) {
    return Response.json({ error: "Operação não encontrada" }, { status: 404 });
  }
  if (run.closed_project_id) {
    return Response.json({ error: "Esta operação já virou projeto." }, { status: 409 });
  }

  // Projeto sem empresa não existe no banco (company_id é NOT NULL), e
  // não deveria mesmo: é a empresa que liga contrato, cobrança e carteira.
  const companyId = run.company_id as string | null;
  if (!companyId) {
    return Response.json(
      {
        error:
          "Esta operação não está ligada a nenhuma empresa. Vincule a empresa à operação antes de fechar — é ela que amarra contrato, cobrança e carteira.",
      },
      { status: 409 }
    );
  }

  const orgId = me.org_id as string;
  const start = startDate ? new Date(`${startDate}T12:00:00`) : new Date();
  const startIso = start.toISOString().slice(0, 10);

  // ── numeração ──
  // Lê o maior sufixo existente em vez de contar linhas: um projeto
  // apagado no passado faria a contagem repetir um código já usado.
  const { data: codes } = await admin
    .from("projects").select("code").eq("org_id", orgId);
  const maxCode = ((codes ?? []) as { code: string }[]).reduce((max, c) => {
    const n = parseInt((c.code ?? "").replace(/\D/g, ""), 10);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  const projectCode = `PROJ-${String(maxCode + 1).padStart(3, "0")}`;

  const year = start.getFullYear();
  const { count: propCount } = await admin
    .from("proposals")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId);
  const proposalNumber = `PROP-${year}-${String((propCount ?? 0) + 1).padStart(4, "0")}`;

  const impl = Number(fechamento.projeto.valor_implementacao) || 0;
  const mensal = Number(fechamento.projeto.valor_mensal) || 0;
  const plano = PLANOS.has(fechamento.projeto.plano) ? fechamento.projeto.plano : null;

  let proposalId: string | null = null;
  let projectId: string | null = null;

  try {
    // ── proposta ──
    const { data: prop, error: propErr } = await admin
      .from("proposals")
      .insert({
        org_id: orgId,
        number: proposalNumber,
        lead_id: (run.lead_id as string | null) ?? null,
        company_id: companyId,
        business_unit: "intelligence",
        total: impl,
        status: "aceita",
        accepted_at: new Date().toISOString(),
        conditions: fechamento.projeto.descricao,
        created_by: user.id,
      })
      .select("id")
      .single();
    if (propErr) throw new Error(`proposta: ${propErr.message}`);
    proposalId = prop.id as string;

    // ── projeto ──
    const { data: proj, error: projErr } = await admin
      .from("projects")
      .insert({
        org_id: orgId,
        code: projectCode,
        name: fechamento.projeto.nome,
        company_id: companyId,
        lead_id: (run.lead_id as string | null) ?? null,
        proposal_id: proposalId,
        business_unit: "intelligence",
        status: "contrato_assinado",
        start_date: startIso,
        expected_end_date: addDays(start, fechamento.projeto.prazo_dias),
        contract_value: impl,
        billing_amount: mensal || null,
        billing_status: mensal > 0 ? "ativo" : "sem_mensalidade",
        contract_plan: plano as "core" | "evolucao" | "parceiro" | null,
        contract_start: startIso,
        description: fechamento.projeto.descricao,
        created_by: user.id,
      })
      .select("id")
      .single();
    if (projErr) throw new Error(`projeto: ${projErr.message}`);
    projectId = proj.id as string;

    // ── cronograma ──
    // As fases antes das parcelas: a parcela aponta para o marco que a
    // libera, e sem a fase existir esse vínculo se perde.
    const phaseIdByName = new Map<string, string>();
    let position = 0;
    for (const fase of fechamento.fases ?? []) {
      const { data: created, error } = await admin
        .from("project_phases")
        .insert({
          project_id: projectId,
          name: fase.nome,
          position: position++,
          status: "pendente",
          start_date: null,
          end_date: addDays(start, fase.dias_apos_inicio),
        })
        .select("id")
        .single();
      if (error) throw new Error(`fase "${fase.nome}": ${error.message}`);

      phaseIdByName.set(fase.nome.toLowerCase(), created.id as string);

      for (const marco of fase.marcos ?? []) {
        const { error: mErr } = await admin.from("project_milestones").insert({
          phase_id: created.id as string,
          name: marco,
          completed: false,
          due_date: addDays(start, fase.dias_apos_inicio),
        });
        if (mErr) throw new Error(`marco "${marco}": ${mErr.message}`);
      }
    }

    // ── parcelas ──
    const parcelas = fechamento.parcelas ?? [];
    const fases = Array.from(phaseIdByName.entries());
    let instPos = 1;

    for (const p of parcelas) {
      // Liga a parcela à fase cujo nome o marco menciona. Não achar é
      // normal — a parcela existe com ou sem fase, e o vínculo é
      // conveniência de acompanhamento, não regra de cobrança.
      const alvo = `${p.marco} ${p.descricao}`.toLowerCase();
      const match = fases.find(([nome]) => alvo.includes(nome));

      // percentage é NOT NULL com CHECK entre 0 e 100. Quando o agente
      // não traz o percentual, deriva-se do valor; num negócio só de
      // mensalidade, onde não há total de implementação para dividir,
      // sobra a divisão igual entre as parcelas.
      const derivado = impl > 0 ? (Number(p.valor) / impl) * 100 : 100 / (parcelas.length || 1);
      const bruto = Number(p.percentual) > 0 ? Number(p.percentual) : derivado;
      const percentage = Math.min(100, Math.max(0.01, Number(bruto.toFixed(2))));

      const { error } = await admin.from("project_installments").insert({
        org_id: orgId,
        project_id: projectId,
        position: instPos++,
        description: p.marco ? `${p.descricao} — ${p.marco}` : p.descricao,
        percentage,
        amount: Number(p.valor) || 0,
        phase_id: match ? match[1] : null,
        due_date: addDays(start, p.dias_apos_inicio),
        status: "pendente",
      });
      if (error) throw new Error(`parcela "${p.descricao}": ${error.message}`);
    }

    // ── custos ──
    for (const c of fechamento.custos ?? []) {
      if (!CATEGORIAS.has(c.categoria) || !TIPOS.has(c.tipo)) continue;
      const { error } = await admin.from("project_costs").insert({
        org_id: orgId,
        project_id: projectId,
        category: c.categoria as "pessoal" | "infraestrutura" | "software" | "terceiros" | "marketing" | "outros",
        cost_type: c.tipo as "implementacao" | "mensal_recorrente" | "eventual",
        description: c.descricao,
        amount: Number(c.valor) || 0,
        status: "previsto",
        notes: `Origem: fechamento do agente Custos e Proposta (${proposalNumber})`,
      });
      if (error) throw new Error(`custo "${c.descricao}": ${error.message}`);
    }

    // ── vínculo de volta ──
    await admin
      .from("agent_runs")
      .update({
        closed_project_id: projectId,
        closed_proposal_id: proposalId,
        closed_at: new Date().toISOString(),
        closed_by: user.id,
        status: "concluida",
      })
      .eq("id", runId);

    return Response.json({
      ok: true,
      projectId,
      projectCode,
      proposalId,
      proposalNumber,
    });
  } catch (err) {
    // Sem transação através do PostgREST, um erro no meio deixaria um
    // projeto pela metade no financeiro — pior que nenhum. Desfaz o que
    // deu para desfazer e devolve o motivo.
    if (projectId) await admin.from("projects").delete().eq("id", projectId);
    if (proposalId) await admin.from("proposals").delete().eq("id", proposalId);

    const detail = err instanceof Error ? err.message : String(err);
    console.error("[agents/close/apply]", detail);
    return Response.json(
      { error: `Nada foi criado. Falhou em: ${detail}` },
      { status: 400 }
    );
  }
}
