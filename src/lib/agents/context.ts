import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type AdminClient = SupabaseClient<Database>;

export interface PhaseContext {
  agent: {
    id: string;
    slug: string;
    name: string;
    model: string;
    systemPrompt: string;
  };
  phase: {
    code: string;
    name: string;
    instruction: string;
    effort: string;
    producesArtifact: string | null;
    requiresArtifacts: string[];
  };
  /** Prompt + conhecimento. Estável entre chamadas — é o que vai em cache. */
  cacheableSystem: string;
  /** Regras ativas. Mudam de vez em quando; ficam depois do ponto de cache. */
  rulesBlock: string;
  /** Versão de cada bloco lido, para gravar no artefato. */
  kbVersions: Record<string, number>;
  knowledgeChars: number;
}

/**
 * Monta o contexto de uma fase.
 *
 * O isolamento acontece aqui e não no prompt: o conhecimento vem de
 * agent_knowledge, então um agente sem vínculo com o catálogo não tem
 * como recebê-lo — não existe instrução que contorne a ausência da linha.
 *
 * A ordem importa para o cache: prompt e conhecimento primeiro (estáveis),
 * regras depois. Assim mudar uma regra não invalida o cache do método.
 */
export async function buildPhaseContext(
  admin: AdminClient,
  agentId: string,
  phaseCode: string
): Promise<PhaseContext> {
  const { data: agentRow, error: agentErr } = await admin
    .from("agents")
    .select("id, slug, name, model, system_prompt")
    .eq("id", agentId)
    .single();
  if (agentErr || !agentRow) throw new Error("Agente não encontrado");

  const { data: phaseRow, error: phaseErr } = await admin
    .from("agent_phases")
    .select("code, name, instruction, effort, produces_artifact, requires_artifacts")
    .eq("agent_id", agentId)
    .eq("code", phaseCode)
    .single();
  if (phaseErr || !phaseRow) throw new Error(`Fase ${phaseCode} não encontrada`);

  // Só as bases vinculadas a ESTE agente.
  const { data: links } = await admin
    .from("agent_knowledge")
    .select("kb:knowledge_bases(id, slug, name)")
    .eq("agent_id", agentId);

  const bases = ((links ?? []) as unknown as {
    kb: { id: string; slug: string; name: string } | null;
  }[])
    .map((l) => l.kb)
    .filter((k): k is { id: string; slug: string; name: string } => !!k);

  const kbVersions: Record<string, number> = {};
  const knowledgeParts: string[] = [];

  for (const base of bases) {
    const { data: blocks } = await admin
      .from("knowledge_blocks")
      .select("title, content, version, always_active")
      .eq("kb_id", base.id)
      .order("position", { ascending: true });

    const rows = (blocks ?? []) as {
      title: string; content: string; version: number; always_active: boolean;
    }[];
    if (rows.length === 0) continue;

    // Hoje entra tudo. A base inteira cabe no contexto com folga, e método
    // recuperado por trecho deixa de ser método. always_active é o gancho
    // para quando a base crescer a ponto de valer seleção.
    const body = rows
      .map((b) => `### ${b.title}\n\n${b.content}`)
      .join("\n\n");

    knowledgeParts.push(`## ${base.slug} — ${base.name}\n\n${body}`);
    kbVersions[base.slug] = rows.reduce((max, b) => Math.max(max, b.version), 1);
  }

  const knowledge = knowledgeParts.length
    ? `\n\n---\n\n# CONHECIMENTO\n\nFonte de verdade factual. Se um arquivo contradiz as instruções em matéria de fato, o arquivo vence; em método e comportamento, as instruções vencem.\n\n${knowledgeParts.join("\n\n---\n\n")}`
    : "";

  const { data: ruleRows } = await admin
    .from("agent_rules")
    .select("content, phase_code")
    .eq("agent_id", agentId)
    .eq("active", true)
    .order("created_at", { ascending: true });

  const rules = ((ruleRows ?? []) as { content: string; phase_code: string | null }[])
    .filter((r) => !r.phase_code || r.phase_code === phaseCode);

  const rulesBlock = rules.length
    ? `\n\n---\n\n# REGRAS DA DIRETORIA\n\nCorreções promovidas a permanentes. Valem sobre qualquer outra orientação deste prompt.\n\n${rules.map((r, i) => `${i + 1}. ${r.content}`).join("\n")}`
    : "";

  return {
    agent: {
      id: agentRow.id as string,
      slug: agentRow.slug as string,
      name: agentRow.name as string,
      model: agentRow.model as string,
      systemPrompt: agentRow.system_prompt as string,
    },
    phase: {
      code: phaseRow.code as string,
      name: phaseRow.name as string,
      instruction: phaseRow.instruction as string,
      effort: phaseRow.effort as string,
      producesArtifact: (phaseRow.produces_artifact as string | null) ?? null,
      requiresArtifacts: (phaseRow.requires_artifacts as string[]) ?? [],
    },
    cacheableSystem: `${agentRow.system_prompt as string}${knowledge}`,
    rulesBlock,
    kbVersions,
    knowledgeChars: knowledge.length,
  };
}

/**
 * A corrente de operações, da atual para trás.
 *
 * O Diagnóstico produz A2 numa operação; a Arquitetura consome A2 em
 * outra. Sem a corrente, o gate olharia só para o próprio run e a
 * Arquitetura nunca sairia do lugar — ela exige um artefato que, por
 * desenho, nasce fora dela.
 *
 * O limite de profundidade não é defensivo contra a esteira, que tem três
 * elos: é contra um ciclo criado por engano, que aqui viraria loop
 * infinito no servidor.
 */
export async function resolveRunChain(
  admin: AdminClient,
  runId: string,
  maxDepth = 6
): Promise<string[]> {
  const chain: string[] = [];
  const seen = new Set<string>();
  let current: string | null = runId;

  while (current && chain.length < maxDepth && !seen.has(current)) {
    seen.add(current);
    chain.push(current);
    const res: { data: { parent_run_id: string | null } | null } = await admin
      .from("agent_runs")
      .select("parent_run_id")
      .eq("id", current)
      .maybeSingle();
    current = res.data?.parent_run_id ?? null;
  }

  return chain;
}

/**
 * O gate. A fase não roda enquanto o que ela exige não estiver validado.
 *
 * Isto é o que substitui "pare e aguarde validação" no prompt: a
 * instrução da fase seguinte simplesmente não entra na requisição.
 */
export async function checkGate(
  admin: AdminClient,
  runId: string,
  requires: string[]
): Promise<{ ok: boolean; missing: string[] }> {
  if (requires.length === 0) return { ok: true, missing: [] };

  const chain = await resolveRunChain(admin, runId);

  const { data } = await admin
    .from("agent_artifacts")
    .select("kind")
    .in("run_id", chain)
    .eq("status", "validado");

  const validated = new Set(((data ?? []) as { kind: string }[]).map((a) => a.kind));
  const missing = requires.filter((r) => !validated.has(r));
  return { ok: missing.length === 0, missing };
}

export interface ValidatedArtifact {
  kind: string;
  content_md: string | null;
  content_html: string | null;
  run_id: string;
}

/**
 * Artefatos validados da corrente — o que a fase seguinte recebe como
 * entrada, e a única coisa que atravessa a fronteira entre agentes.
 *
 * Quando o mesmo tipo aparece em mais de um elo, vence o mais próximo:
 * se esta operação revalidou o A3, é o A3 dela que vale, não o herdado.
 */
export async function loadValidatedArtifacts(
  admin: AdminClient,
  runId: string
): Promise<ValidatedArtifact[]> {
  const chain = await resolveRunChain(admin, runId);

  const { data } = await admin
    .from("agent_artifacts")
    .select("kind, content_md, content_html, run_id")
    .in("run_id", chain)
    .eq("status", "validado")
    .order("created_at", { ascending: true });

  const rows = (data ?? []) as ValidatedArtifact[];
  const distance = new Map(chain.map((id, i) => [id, i]));

  const nearest = new Map<string, ValidatedArtifact>();
  for (const row of rows) {
    const prev = nearest.get(row.kind);
    const d = distance.get(row.run_id) ?? Number.MAX_SAFE_INTEGER;
    const dPrev = prev ? distance.get(prev.run_id) ?? Number.MAX_SAFE_INTEGER : Infinity;
    if (!prev || d < dPrev) nearest.set(row.kind, row);
  }

  // Ordem estável por tipo: A1, A2, A3... é a ordem em que foram
  // produzidos, e é como o agente seguinte espera lê-los.
  return Array.from(nearest.values())
    .filter((a) => !!(a.content_md || a.content_html))
    .sort((a, b) => a.kind.localeCompare(b.kind));
}
