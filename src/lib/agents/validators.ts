/**
 * As "regras duras" das instruções viram verificação de verdade.
 *
 * No prompt elas são orientação que o modelo cumpre quase sempre. Aqui
 * viram uma checagem: a saída que viola volta com o motivo e é regerada
 * antes de chegar no sócio. É a diferença entre uma regra que vale porque
 * alguém lembrou e uma que vale porque o sistema não deixa passar.
 *
 * Verificação é textual de propósito — os artefatos são markdown com
 * formato declarado, não JSON. Um schema rígido demais brigaria com o
 * formato que vocês já escreveram e validaram na prática.
 */

export interface ValidationIssue {
  rule: string;
  detail: string;
}

export interface ValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
}

const ok = (): ValidationResult => ({ ok: true, issues: [] });

/**
 * A2 — Diagnóstico. As travas vêm da Fase B das instruções:
 * achado sem evidência não entra, número sem premissa não entra,
 * mínimo de 3 achados latentes ou ocultos, e o Gargalo Âncora é único.
 */
function validateA2(text: string): ValidationResult {
  const issues: ValidationIssue[] = [];

  // Cada achado abre com um ID de lente: L1-01, L8-03...
  const findings = text.match(/L[1-8]-\d+/g) ?? [];
  const uniqueFindings = new Set(findings);

  if (uniqueFindings.size === 0) {
    issues.push({
      rule: "achados",
      detail: "Nenhum achado identificado no formato L#-##. O A2 precisa dos achados com ID.",
    });
    return { ok: false, issues };
  }

  // "Mínimo de 3 achados latentes ou ocultos. Se você só encontrou o que o
  // cliente já sabia, você não diagnosticou."
  const latentes = (text.match(/Classifica[çc][ãa]o:\s*(latente|oculto)/gi) ?? []).length;
  if (latentes < 3) {
    issues.push({
      rule: "latentes",
      detail: `Apenas ${latentes} achado(s) latente(s) ou oculto(s); o mínimo é 3. Achado que o cliente já sabia não é diagnóstico.`,
    });
  }

  // "O campo Origem é obrigatório e não pode ser omitido."
  const origens = (text.match(/^\s*Origem:/gim) ?? []).length;
  if (origens < uniqueFindings.size) {
    issues.push({
      rule: "origem",
      detail: `${uniqueFindings.size} achados mas ${origens} campos "Origem". Todo achado precisa declarar se veio de relato ou de inferência.`,
    });
  }

  // "Achado sem evidência não entra. Não existe achado por intuição."
  const evidencias = (text.match(/^\s*Evid[êe]ncia:/gim) ?? []).length;
  if (evidencias < uniqueFindings.size) {
    issues.push({
      rule: "evidencia",
      detail: `${uniqueFindings.size} achados mas ${evidencias} campos "Evidência". Achado sem evidência não entra.`,
    });
  }

  // "Número sem premissa explícita não entra."
  const quantificacoes = (text.match(/^\s*Quantifica[çc][ãa]o:/gim) ?? []).length;
  const premissas = (text.match(/Premissa:/gi) ?? []).length;
  if (quantificacoes > 0 && premissas < quantificacoes) {
    issues.push({
      rule: "premissa",
      detail: `${quantificacoes} quantificações mas ${premissas} premissas. Número sem premissa declarada não entra — inventar número é o pior erro possível.`,
    });
  }

  // "Eleja UM achado como Gargalo Âncora." Empate não é permitido.
  if (!/Gargalo\s+[ÂA]ncora/i.test(text)) {
    issues.push({
      rule: "ancora",
      detail: "Gargalo Âncora não foi eleito. É o que a solução tem obrigatoriamente que resolver.",
    });
  }

  // "Encerre a Fase B com o Custo Consolidado do Status Quo."
  if (!/Custo\s+Consolidado/i.test(text)) {
    issues.push({
      rule: "custo_status_quo",
      detail: "Falta o Custo Consolidado do Status Quo — é a âncora de tudo que vem depois.",
    });
  }

  // "Nunca proponha o que construir." O isolamento do catálogo é o
  // princípio mais importante do sistema; vale checar que não vazou.
  const vazamentos = [
    /\bvamos\s+(construir|desenvolver|implementar)\b/i,
    /\b(um|uma)\s+(agente|chatbot|bot)\s+(de\s+\w+\s+)?resolveria\b/i,
    /\brecomendo\s+(construir|implementar|criar)\b/i,
    /\ba\s+solu[çc][ãa]o\s+(seria|ser[áa])\b/i,
  ];
  if (vazamentos.some((re) => re.test(text))) {
    issues.push({
      rule: "isolamento",
      detail: "O texto sugere solução. O Diagnóstico para no gargalo e no custo — propor o que construir é trabalho do Assistente de Arquitetura.",
    });
  }

  return { ok: issues.length === 0, issues };
}

/**
 * A1 — Mapa de Operação. A trava aqui é de completude: campo não
 * informado tem que ser declarado como tal e virar lacuna, nunca sumir.
 */
function validateA1(text: string): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!/lacunas?/i.test(text)) {
    issues.push({
      rule: "lacunas",
      detail: 'Falta a Lista de Lacunas. É "assim que a próxima reunião fica melhor" — saída obrigatória da Fase A.',
    });
  }

  // "Fluxo de trabalho ponta a ponta — este é o campo mais importante do A1."
  if (!/fluxo/i.test(text)) {
    issues.push({
      rule: "fluxo",
      detail: "Falta o fluxo de trabalho ponta a ponta, que é o campo mais importante do A1.",
    });
  }

  return { ok: issues.length === 0, issues };
}

/**
 * D1 — Demonstrativo. "Zero preço, prazo comercial ou condição de
 * pagamento." O renderizador já não recebe campo de preço, mas o texto
 * gerado também não pode citar valor.
 */
function validateD1(text: string): ValidationResult {
  const issues: ValidationIssue[] = [];

  // Valor em reais no corpo do documento. O custo do status quo é a
  // exceção legítima — ele é análise, não oferta — então só acusamos
  // quando o valor aparece perto de vocabulário comercial.
  const comercial = /(investimento|parcel|entrada de|mensalidade|proposta comercial|condi[çc][õo]es de pagamento|honor[áa]rios)/i;
  const linhasComValor = text
    .split("\n")
    .filter((l) => /R\$\s*[\d.]/.test(l) && comercial.test(l));

  if (linhasComValor.length > 0) {
    issues.push({
      rule: "sem_preco",
      detail: `D1 não pode conter preço, prazo comercial ou condição de pagamento. Encontrado em: "${linhasComValor[0].trim().slice(0, 120)}"`,
    });
  }

  return { ok: issues.length === 0, issues };
}

const VALIDATORS: Record<string, (text: string) => ValidationResult> = {
  A1: validateA1,
  A2: validateA2,
  D1: validateD1,
};

export function validateArtifact(kind: string | null, text: string): ValidationResult {
  if (!kind) return ok();
  const validator = VALIDATORS[kind];
  return validator ? validator(text) : ok();
}

/** Vira a mensagem que pede a correção ao modelo, na regeração. */
export function issuesToPrompt(issues: ValidationIssue[]): string {
  return [
    "A entrega anterior não passou nas travas do próprio método. Corrija e reapresente a fase inteira:",
    "",
    ...issues.map((i) => `- ${i.detail}`),
    "",
    "Não comente o processo de correção — entregue a versão corrigida.",
  ].join("\n");
}
