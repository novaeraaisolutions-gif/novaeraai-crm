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

/**
 * A3 — Três níveis de solução. "Sempre três. Não dois, não cinco."
 * E o nível Enxuto que não resolve o Gargalo Âncora não é enxuto, é
 * incompleto — a trava aqui é que os três existam e que os achados não
 * resolvidos apareçam com o custo de deixá-los.
 */
function validateA3(text: string): ValidationResult {
  const issues: ValidationIssue[] = [];

  const niveis = ["enxuta", "ideal", "completa"].filter((n) =>
    new RegExp(`\\b${n}\\b`, "i").test(text)
  );
  if (niveis.length < 3) {
    const faltam = ["Enxuta", "Ideal", "Completa"].filter(
      (n) => !niveis.includes(n.toLowerCase())
    );
    issues.push({
      rule: "tres_niveis",
      detail: `Faltam os níveis: ${faltam.join(", ")}. São sempre três — com um só a margem de acerto é baixa, com cinco os dois piores confundem quem apresenta.`,
    });
  }

  // "Achados NÃO resolvidos neste nível: [IDs] — e o custo mensal de
  // deixá-los." É o campo que impede vender a Enxuta como se fosse tudo.
  if (!/n[ãa]o\s+resolvidos/i.test(text)) {
    issues.push({
      rule: "nao_resolvidos",
      detail: 'Falta, por nível, a lista de "Achados NÃO resolvidos" com o custo mensal de deixá-los. Sem isso o nível enxuto parece completo.',
    });
  }

  if (!/recomenda[çc][ãa]o/i.test(text)) {
    issues.push({
      rule: "recomendacao",
      detail: "Falta a Recomendação explícita de qual nível levar, escrita para o sócio decidir.",
    });
  }

  // O roadmap do nível recomendado, em três horizontes.
  const horizontes = (text.match(/Horizonte\s*[123]/gi) ?? []).length;
  if (horizontes < 3) {
    issues.push({
      rule: "roadmap",
      detail: `Roadmap incompleto (${horizontes} de 3 horizontes). H1 prova valor no Âncora, H2 expande, H3 é o que só se torna possível depois que o dado existe.`,
    });
  }

  return { ok: issues.length === 0, issues };
}

/**
 * A4 — Modelo de custo. "Todo número tem fonte declarada." Esta é a
 * trava que impede a estimativa disfarçada de dado, que é o erro que
 * envenena a proposta inteira sem aparecer.
 */
function validateA4(text: string): ValidationResult {
  const issues: ValidationIssue[] = [];

  const fontes = (text.match(/Fonte:/gi) ?? []).length;
  if (fontes === 0) {
    issues.push({
      rule: "fonte",
      detail: 'Nenhum campo "Fonte:" declarado. Todo custo unitário precisa dizer se veio do NE-CUSTOS, do sócio, ou se não está disponível.',
    });
  }

  // "Apresente três cenários — volume baixo, esperado e alto — porque a
  // mensalidade precisa sobreviver ao cenário alto."
  const cenarios = ["baixo", "esperado", "alto"].filter((c) =>
    new RegExp(`\\b${c}\\b`, "i").test(text)
  );
  if (cenarios.length < 3) {
    issues.push({
      rule: "cenarios",
      detail: "Faltam os três cenários de volume (baixo, esperado, alto). A mensalidade precisa sobreviver ao cenário alto.",
    });
  }

  if (!/piso\s+(de\s+)?mensalidade/i.test(text)) {
    issues.push({
      rule: "piso",
      detail: "Falta o piso de mensalidade (custo no cenário esperado + margem alvo). Nenhum plano é recomendado abaixo dele.",
    });
  }

  if (!/margem/i.test(text)) {
    issues.push({
      rule: "margem",
      detail: "A margem usada no piso não foi declarada. Piso sem margem explícita não é piso.",
    });
  }

  return { ok: issues.length === 0, issues };
}

/**
 * A5 — Custo de inércia. A trava é a separação entre defensável e
 * estimado: "é melhor ancorar em R$ 18 mil defensáveis do que em R$ 40
 * mil discutíveis", porque um número que o cliente derruba com uma
 * pergunta destrói a proposta inteira.
 */
function validateA5(text: string): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!/defens[áa]vel|defens[áa]veis/i.test(text)) {
    issues.push({
      rule: "defensavel",
      detail: "Falta separar o custo defensável (premissa que o cliente confirmaria) do custo estimado (premissa nossa).",
    });
  }

  if (!/conservador/i.test(text)) {
    issues.push({
      rule: "conservador",
      detail: "Falta o número conservador, calculado só com o defensável. É ele que vai para a proposta; o completo fica como reserva de argumento.",
    });
  }

  if (!/premissa/i.test(text)) {
    issues.push({
      rule: "premissas",
      detail: "Cada parcela do custo precisa vir com sua premissa e nível de confiança.",
    });
  }

  return { ok: issues.length === 0, issues };
}

/**
 * D2 — Proposta. As seções que protegem a entrega são as que somem
 * primeiro quando o documento sai apressado: o que NÃO entra, as
 * dependências do cliente e os riscos.
 */
function validateD2(text: string): ValidationResult {
  const issues: ValidationIssue[] = [];

  const obrigatorias: [RegExp, string][] = [
    [/investimento/i, "Investimento — implementação e mensalidade, ancorados no custo de inércia."],
    [/parcelamento|parcela/i, "Parcelamento por marco."],
    [/cronograma/i, "Cronograma."],
    [/garantia/i, "Garantia."],
    [/depend[êe]ncias?\s+do\s+cliente|depend[êe]ncias/i, "Dependências do cliente, com prazo — é a seção que protege a entrega."],
    [/riscos?/i, "Riscos declarados."],
  ];

  for (const [re, nome] of obrigatorias) {
    if (!re.test(text)) issues.push({ rule: "secao", detail: `Falta a seção: ${nome}` });
  }

  // "Escopo fechado do nível recomendado, com o que entra e,
  // explicitamente, o que não entra."
  if (!/n[ãa]o\s+(entra|inclui|est[áa]\s+inclu)/i.test(text)) {
    issues.push({
      rule: "escopo_fechado",
      detail: 'Falta declarar explicitamente o que NÃO entra no escopo. Escopo sem exclusão declarada vira discussão na entrega.',
    });
  }

  return { ok: issues.length === 0, issues };
}

const VALIDATORS: Record<string, (text: string) => ValidationResult> = {
  A1: validateA1,
  A2: validateA2,
  A3: validateA3,
  A4: validateA4,
  A5: validateA5,
  D1: validateD1,
  D2: validateD2,
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
