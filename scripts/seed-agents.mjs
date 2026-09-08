/**
 * Importa os agentes, as fases e as bases de conhecimento a partir dos
 * arquivos em supabase/knowledge/.
 *
 * Idempotente por natureza: nada é sobrescrito. Um bloco de conhecimento que
 * já existe é deixado como está — depois da primeira importação a verdade
 * passa a ser o que a diretoria editou no CRM, não o arquivo do repositório.
 *
 *   node scripts/seed-agents.mjs
 */
import pg from "pg";
import fs from "fs";
import path from "path";

const ORG_ID = "ba7fb5b5-b459-45cd-a886-7086fb5c6c57";
const KNOWLEDGE_DIR = path.join(process.cwd(), "supabase", "knowledge");

const CONN =
  process.env.SUPABASE_DB_URL ??
  "postgresql://postgres.hiehsqmrggrwwzrpixbo:Novaera%402030@aws-1-sa-east-1.pooler.supabase.com:5432/postgres";

// ── Bases de conhecimento ────────────────────────────────────────────
const BASES = [
  { slug: "NE-METODO-DIAGNOSTICO", name: "Método de Diagnóstico", file: "NE-METODO-DIAGNOSTICO.md",
    description: "As oito lentes, o insumo escasso e os critérios de achado. É o método." },
  { slug: "NE-CASES", name: "Casos reais", file: "NE-CASES.md",
    description: "Casos entregues. Para reconhecer padrão operacional e como prova social — nunca como molde." },
  { slug: "NE-CATALOGO-CAPACIDADES", name: "Catálogo de Capacidades", file: "NE-CATALOGO-CAPACIDADES.md",
    description: "O que a Nova Era sabe construir, de que depende e com que esforço." },
  { slug: "NE-PADROES-ARQUITETURA", name: "Padrões de Arquitetura", file: "NE-PADROES-ARQUITETURA.md",
    description: "Padrões nomeados pelo problema operacional, nunca pelo setor." },
  { slug: "NE-IDENTIDADE", name: "Identidade", file: "NE-IDENTIDADE.md",
    description: "Voz, vocabulário e padrão de redação da Nova Era." },
  { slug: "NE-SCHEMAS", name: "Schemas dos artefatos", file: "NE-SCHEMAS.md",
    description: "Formato de cada artefato interno e de cada documento de cliente." },
  { slug: "NE-COMERCIAL", name: "Comercial", file: "NE-COMERCIAL.md",
    description: "Filosofia de preço, faixas praticadas, planos e garantia." },
  { slug: "NE-CUSTOS", name: "Custos", file: null,
    description: "Custo unitário de infraestrutura, API e mensageria por volume. Ainda não escrito — sem ele o agente monta a estrutura de cálculo e pergunta os números." },
];

// ── Agentes ──────────────────────────────────────────────────────────
const AGENTS = [
  {
    slug: "diagnostico",
    name: "Diagnóstico",
    accent: "#17A3E8",
    position: 1,
    file: "01-PROJETO-Diagnostico-INSTRUCOES.md",
    tagline: "Enxerga na operação o que o próprio dono não enxerga",
    description:
      "Lê a transcrição da reunião e produz o mapa factual da operação e o diagnóstico: gargalos com evidência, quantificação com premissa declarada e o Gargalo Âncora eleito.",
    never_does:
      "Não propõe solução, não cita componente, não menciona preço. É isolado do catálogo por desenho — a garantia de que um achado entra por ser real, e não por combinar com algo que a Nova Era sabe vender.",
    knowledge: ["NE-METODO-DIAGNOSTICO", "NE-CASES"],
    phases: {
      A: { name: "Ingestão", effort: "medium", produces: "A1", requires: [] },
      B: { name: "Diagnóstico", effort: "max", produces: "A2", requires: ["A1"] },
    },
  },
  {
    slug: "arquitetura",
    name: "Arquitetura de Solução",
    accent: "#7C6CF5",
    position: 2,
    file: "02-PROJETO-Arquitetura-INSTRUCOES.md",
    tagline: "Traduz o diagnóstico em três níveis de solução",
    description:
      "Recebe o diagnóstico validado e desenha a solução nas quatro camadas Nova Era, com o Teste de Diferenciação em cada componente e rastreabilidade total até o achado que o originou.",
    never_does:
      "Não reabre, não requantifica e não reordena o diagnóstico. Não precifica — nenhum valor, prazo comercial ou condição de pagamento sai daqui.",
    knowledge: [
      "NE-CATALOGO-CAPACIDADES", "NE-PADROES-ARQUITETURA", "NE-CASES",
      "NE-IDENTIDADE", "NE-SCHEMAS", "NE-METODO-DIAGNOSTICO",
    ],
    phases: {
      "0":  { name: "Recebimento do handoff", effort: "low",    produces: null, requires: ["A2"] },
      C1:   { name: "Resolução por gargalo",  effort: "high",   produces: null, requires: ["A2"] },
      C2:   { name: "Convergência",           effort: "high",   produces: null, requires: ["A2"] },
      C3:   { name: "Arquitetura",            effort: "xhigh",  produces: null, requires: ["A2"] },
      D:    { name: "Três níveis de solução", effort: "high",   produces: "A3", requires: ["A2"] },
      E:    { name: "Demonstrativo",          effort: "medium", produces: "D1", requires: ["A3"] },
    },
  },
  {
    slug: "custos-proposta",
    name: "Custos e Proposta",
    accent: "#34D399",
    position: 3,
    file: "03-PROJETO-Custos-Proposta-INSTRUCOES.md",
    tagline: "Calcula o custo real, o custo da inércia e transforma em preço",
    description:
      "Existe separado porque cálculo de custo feito de passagem sai errado — e custo raso corrói a margem de todo contrato recorrente. Aqui o custo é o trabalho principal.",
    never_does:
      "Não inventa custo, preço ou faixa de mercado — pergunta. Não precifica sem o piso de mensalidade calculado. Não rediagnostica nem rearquiteta.",
    knowledge: ["NE-COMERCIAL", "NE-CUSTOS", "NE-CASES", "NE-IDENTIDADE", "NE-SCHEMAS"],
    phases: {
      F: { name: "Levantamento de variáveis", effort: "high",   produces: null, requires: ["A3"] },
      G: { name: "Modelo de custo",           effort: "high",   produces: "A4", requires: ["A3"] },
      H: { name: "Custo de inércia",          effort: "high",   produces: "A5", requires: ["A3"] },
      I: { name: "Precificação dos níveis",   effort: "high",   produces: null, requires: ["A4", "A5"] },
      J: { name: "Autocrítica",               effort: "xhigh",  produces: null, requires: ["A4", "A5"] },
      K: { name: "Proposta",                  effort: "medium", produces: "D2", requires: ["A4", "A5"] },
    },
  },
  {
    slug: "contrato",
    name: "Contrato",
    accent: "#5B7994",
    position: 4,
    file: null,
    active: false,
    tagline: "Preenche o contrato a partir do template e do escopo fechado",
    description:
      "Aguardando o material. Preenche o template com os dados do cliente e o escopo fechado na proposta aceita.",
    never_does: "Não redige cláusula nova. Cláusula nova entra no template, por decisão da diretoria.",
    knowledge: [],
    phases: {},
  },
];

// ── Quebra um markdown em blocos pelos títulos de nível 2 ────────────
function splitIntoBlocks(markdown) {
  const lines = markdown.split("\n");
  const blocks = [];
  let title = null;
  let buffer = [];

  const flush = () => {
    const content = buffer.join("\n").trim();
    if (content) blocks.push({ title: title ?? "Abertura", content });
    buffer = [];
  };

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+?)\s*$/);
    if (h2) {
      flush();
      title = h2[1].replace(/^\d+[.·)]\s*/, "").trim();
    } else {
      buffer.push(line);
    }
  }
  flush();
  return blocks;
}

// ── Separa o prompt em "sistema" e uma instrução por fase ───────────
// As seções "### FASE X" viram instrução de fase; todo o resto do
// documento (identidade, conduta, passe de revisão) vira system_prompt.
// Nada se perde: o que não é fase permanece no sistema.
function splitPrompt(markdown) {
  const lines = markdown.split("\n");
  const phases = {};
  const systemLines = [];
  let current = null;
  let buffer = [];

  const flush = () => {
    if (current) phases[current] = buffer.join("\n").trim();
    buffer = [];
  };

  for (const line of lines) {
    const start = line.match(/^###\s+FASE\s+([A-Z0-9]+)\s*(?:—|-|–)?/i);
    // Um título de nível 2 encerra o bloco de fases e devolve ao sistema.
    const endsPhases = /^##\s+/.test(line);

    if (start) {
      flush();
      current = start[1].toUpperCase();
      buffer.push(line);
    } else if (current && endsPhases) {
      flush();
      current = null;
      systemLines.push(line);
    } else if (current) {
      buffer.push(line);
    } else {
      systemLines.push(line);
    }
  }
  flush();

  return { system: systemLines.join("\n").trim(), phases };
}

const read = (file) => fs.readFileSync(path.join(KNOWLEDGE_DIR, file), "utf8");

async function main() {
  const db = new pg.Client({ connectionString: CONN, ssl: { rejectUnauthorized: false } });
  await db.connect();
  const log = [];

  try {
    await db.query("BEGIN");

    // ── bases + blocos ──
    const kbIds = {};
    for (const base of BASES) {
      const existing = await db.query(
        "SELECT id FROM knowledge_bases WHERE org_id=$1 AND slug=$2",
        [ORG_ID, base.slug]
      );
      let kbId;
      if (existing.rows.length) {
        kbId = existing.rows[0].id;
      } else {
        const inserted = await db.query(
          `INSERT INTO knowledge_bases (org_id, slug, name, description, position)
           VALUES ($1,$2,$3,$4,$5) RETURNING id`,
          [ORG_ID, base.slug, base.name, base.description, BASES.indexOf(base)]
        );
        kbId = inserted.rows[0].id;
      }
      kbIds[base.slug] = kbId;

      if (!base.file) { log.push(`${base.slug}: sem arquivo (a escrever)`); continue; }

      const already = await db.query("SELECT count(*)::int n FROM knowledge_blocks WHERE kb_id=$1", [kbId]);
      if (already.rows[0].n > 0) {
        log.push(`${base.slug}: ${already.rows[0].n} blocos já existentes — preservados`);
        continue;
      }

      const blocks = splitIntoBlocks(read(base.file));
      for (const [i, b] of blocks.entries()) {
        await db.query(
          `INSERT INTO knowledge_blocks (kb_id, title, content, position) VALUES ($1,$2,$3,$4)`,
          [kbId, b.title, b.content, i]
        );
      }
      log.push(`${base.slug}: ${blocks.length} blocos importados`);
    }

    // ── agentes + fases + vínculos ──
    for (const agent of AGENTS) {
      const parsed = agent.file ? splitPrompt(read(agent.file)) : { system: "", phases: {} };

      const existing = await db.query("SELECT id FROM agents WHERE org_id=$1 AND slug=$2", [ORG_ID, agent.slug]);
      let agentId;
      if (existing.rows.length) {
        agentId = existing.rows[0].id;
        log.push(`agente ${agent.slug}: já existe — preservado`);
      } else {
        const inserted = await db.query(
          `INSERT INTO agents (org_id, slug, name, tagline, description, never_does,
                               system_prompt, accent, position, active)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
          [ORG_ID, agent.slug, agent.name, agent.tagline, agent.description, agent.never_does,
           parsed.system, agent.accent, agent.position, agent.active !== false]
        );
        agentId = inserted.rows[0].id;
        log.push(`agente ${agent.slug}: criado (${parsed.system.length} chars de prompt)`);
      }

      for (const kbSlug of agent.knowledge) {
        await db.query(
          `INSERT INTO agent_knowledge (agent_id, kb_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [agentId, kbIds[kbSlug]]
        );
      }

      let pos = 0;
      for (const [code, meta] of Object.entries(agent.phases)) {
        const instruction = parsed.phases[code];
        if (!instruction) { log.push(`  ⚠ fase ${code} sem instrução no arquivo`); continue; }
        await db.query(
          `INSERT INTO agent_phases (agent_id, code, name, instruction, effort,
                                     produces_artifact, requires_artifacts, position)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
           ON CONFLICT (agent_id, code) DO NOTHING`,
          [agentId, code, meta.name, instruction, meta.effort, meta.produces, meta.requires, pos++]
        );
      }
      if (Object.keys(agent.phases).length) log.push(`  ${pos} fases`);
    }

    await db.query("COMMIT");
    console.log(log.join("\n"));
    console.log("\n✓ importação concluída");
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("ERRO — nada foi gravado:", err.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

main();
