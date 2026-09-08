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

  const { data } = await admin
    .from("agent_artifacts")
    .select("kind")
    .eq("run_id", runId)
    .eq("status", "validado");

  const validated = new Set(((data ?? []) as { kind: string }[]).map((a) => a.kind));
  const missing = requires.filter((r) => !validated.has(r));
  return { ok: missing.length === 0, missing };
}

/** Artefatos já validados, que são o que a fase seguinte recebe como entrada. */
export async function loadValidatedArtifacts(admin: AdminClient, runId: string) {
  const { data } = await admin
    .from("agent_artifacts")
    .select("kind, content_md")
    .eq("run_id", runId)
    .eq("status", "validado")
    .order("created_at", { ascending: true });

  return ((data ?? []) as { kind: string; content_md: string | null }[]).filter(
    (a) => !!a.content_md
  );
}
