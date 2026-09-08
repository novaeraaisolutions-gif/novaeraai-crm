# NE-SCHEMAS
**Base de conhecimento · todos os assistentes · v1.0 · agosto/2026**

> Formatos dos artefatos internos e dos documentos de cliente, extraídos dos entregáveis reais.

---

## PARTE 1 · ARTEFATOS INTERNOS

### A1 — Mapa de Operação
Verdade factual. Zero interpretação. Todo item marcado `[dito pelo cliente]`, `[inferido]` ou `[verificado por nós]`.

1. Empresa e contexto — o que faz, para quem, nicho, tempo, posição no mercado
2. **Porte e volume** — pessoas, faturamento se citado, volume por período, ticket médio, sazonalidade
3. **Modelo de negócio** — volume ou profundidade? recorrente ou pontual? *(determina o insumo escasso)*
4. Pessoas e papéis — quem faz o quê, quem decide o quê, quem é gargalo
5. **Fluxo ponta a ponta, por setor** — do primeiro contato ao pós-venda, com os improvisos *(campo mais importante)*
6. Ferramentas e sistemas — o que usam, quem usa de verdade, o que não conversa com o quê, **custo mensal atual**
7. Números — todos, com marcação de origem
8. Canais
9. Dores verbalizadas — **citação literal entre aspas**
10. Sinais não verbalizados — hesitações, contradições, redundâncias no pedido, assuntos evitados
11. Visão de futuro — onde ele quer estar em 3 anos
12. Objetivos e restrições
13. Pedidos de solução feitos pelo cliente — registrados como expectativa, não avaliados
14. **Contexto externo a verificar** — prazos legais, mudanças normativas, restrições regulatórias do setor

**+ Lista de Lacunas** — ordenada por criticidade, cada uma com por que importa.

---

### A2 — Diagnóstico

**Abertura obrigatória: o insumo escasso.** Qual recurso limita esta empresa, e por que isso muda o critério de avaliação de todos os achados.

**Formato de achado:**
```
[ID] G# · Classe: entrada | decisão | memória | receita | risco | atenção | acervo | lacuna
Título:
Classificação: explícito | latente | oculto
Origem: relato do cliente | inferência a partir de [dado] | verificação independente
Evidência: "citação literal" ou referência ao A1
Mecanismo: a cadeia causal completa
Custo real: o que isso CAUSA — dinheiro, risco jurídico, exposição regulatória,
   envelhecimento silencioso, desgaste de gente qualificada
Quantificação: [número ou faixa] · Premissa: [origem] · Confiança: alta|média|baixa
Impacto: alto | crítico | risco máximo   ·   Esforço: muito baixo | baixo | médio | alto
Indica outros gargalos? [IDs / não]
Se não resolver: consequência em 12 meses
```

**Decomposição em travas** — quando um gargalo tem mais de uma consequência qualitativamente distinta, decomponha. Cada trava exige resposta diferente da solução.

**Leituras não óbvias** — mínimo três. Cada uma com tipo (reenquadramento · sintoma vs. necessidade · inversão de prioridade · risco ético/legal · correção técnica · requisito escondido · fato comercial), o que muda no desenho da solução, e a consequência.

**Alavancas** — ativo dormente · assimetria de fluxo · momento de verdade · vantagem estrutural.

**Restrições reais do terreno** — tabela: restrição · o que significa na prática · como a arquitetura responde.

**Matriz impacto × esforço** — quatro quadrantes, com os achados distribuídos. É o que determina a divisão em níveis.

**Priorização** — impacto financeiro 40% · dor percebida 35% · velocidade de prova 25%, com os três critérios de sobreposição: janela, alavancagem, base.

**Gargalo Âncora** — um só, com justificativa e os achados que arrasta.

**Identificado, não priorizado** — o que ficou de fora conscientemente.

**Custo Consolidado do Status Quo** — soma dos quantificáveis, premissas visíveis, corte de recuperação aplicado, e a seção "o que não cabe em horas".

**Pontos a validar** — com por que cada um importa. Inclua ao menos uma pergunta desconfortável.

---

### A3 — Arquitetura

**Formato de componente:**
```
Nome: [nome próprio, pela função real]
Camada: dados | ingestão | inteligência | operação | interface externa | governança
Função: o que faz, em uma frase de negócio
Resolve: [IDs de gargalo]
Como funciona na prática, passo a passo:
   1. gatilho — o que dispara
   2. o que o sistema faz
   3. o que a pessoa faz, se faz
   4. onde o resultado aparece e para quem
O que passa a ser automático:
O que continua manual:  ← obrigatório; se nada, escreva "nada"
Mecanismo de diferenciação: P1..P9 | nenhum (é base)
Esforço: [dias-dev] · Origem: catálogo | estimativa sem catálogo
Depende de terceiros:
Custo variável que gera: [se gera, a governança que nasce junto]
Riscos:
```

**Matriz de rastreabilidade** — Achado × Componente. Achado prioritário sem cobertura é sinalizado.

**Três níveis** — cada um com: componentes, achados resolvidos, **achados NÃO resolvidos e o custo de deixá-los**, o que o nível torna possível, esforço, capacidade de absorção exigida.

**Roadmap** — fases com **gate comportamental**, nunca prazo.

---

## PARTE 2 · DOCUMENTOS DE CLIENTE

### D1 — Diagnóstico (e Arquitetura)

Duas configurações usadas na prática, ambas válidas:
- **Combinada** (D'Paulla): diagnóstico e arquitetura no mesmo documento, marcado "uso interno · pré-proposta"
- **Separada** (Valens): Documento 01 Diagnóstico · 02 Proposta · 03 Roadmap

Escolha pela complexidade: quando a arquitetura tem três níveis e rastreabilidade extensa, combine. Quando o diagnóstico sustenta uma frente única com janela temporal, separe.

**Estrutura combinada, seções na ordem:**
```
00 Sumário executivo — o que o material do cliente realmente está dizendo,
   em 2 a 4 "leituras", + recomendação em uma frase
01 Base e método do diagnóstico — qual material, e as camadas de leitura aplicadas
02 O retrato da operação — o que se lê · evidência · consequência prática
03 Mapa de gargalos G1..Gn — cada um com custo real e classe
04 Leituras não óbvias NO-1..n
05 Restrições reais do terreno
06 Matriz impacto × esforço
07 Princípios de arquitetura
08 Camadas da plataforma
09 Os níveis de solução
10 Comparativo de escopo — tabela capacidade × nível, com ● ◐ ○ —
11 Rastreabilidade dos requisitos originais — nenhum descartado sem justificativa,
   marcando Reenquadrado / Ampliado
12 Roadmap de implantação — fases com gate comportamental
13 Dependências externas — nível, natureza do custo, risco e mitigação
14 Recomendação técnica — qual nível, por quê, por que não o de cima,
   e o que dizer se o cliente escolher o de baixo
15 Premissas e pontos a validar
```
**Sem preço em nenhuma seção.** Formulação usada: *"Valores não fazem parte deste documento — a precificação é objeto da proposta comercial."*

---

### D2 — Demonstrativo de solução

Aplicação navegável em HTML com dados fictícios declarados. Estrutura observada:

- Cabeçalho com escopo, nº de módulos, nº de agentes ativos e **dependência externa** ("nenhuma" é argumento)
- **Modo explicação ligável** — caixas douradas explicando o que acontece por trás de cada tela; caixas vermelhas marcando os limites da configuração. Desligável para ver o produto limpo.
- Navegação lateral por grupo: Operação · Controle de risco · Inteligência · Direção · Proposta
- Cada tela abre com **"O que esta tela resolve — Gargalo G#"** e a frase do que mudou
- Seções finais: "o que fica de fora" e "investimento"

**Regra:** toda tela amarrada a um gargalo do diagnóstico. Tela sem gargalo não entra no demonstrativo.

---

### D3 — Proposta comercial

```
Cabeçalho — escopo · investimento · validade (30 dias)
01 Ponto de partida — o que entendemos da operação: 3 a 5 pares "Hoje / Consequência"
02 Escopo — o que será entregue, módulo a módulo, em linguagem de operação
03 Entrega adicional — quando algo do nível superior entra sem acréscimo, declarar
04 Impacto — os deslocamentos concretos, numerados, + "o ponto que costuma
   passar despercebido"
05 Custo de inércia — aviso de premissas conservadoras, linhas de cálculo abertas,
   total, corte de recuperação, "o que não cabe em horas", fecho que reposiciona
06 A relação — manutenção corretiva (com SLA), adaptativa, aditiva e evolutiva
07 Investimento — entrada + parcelas, total, mensalidade de infraestrutura
08 Implantação — fases com gate
09 Transparência — o que não está incluído, as consequências disso, e por que
   não é um beco
Próximo passo
```

---

## PARTE 3 · HANDOFF ENTRE ASSISTENTES

Texto estruturado, não HTML. Primeira linha:
`HANDOFF [ETAPA] — [CLIENTE] — pronto para o Assistente de [DESTINO]`

Conteúdo: artefatos completos + decisões já tomadas pelo sócio + o que ficou pendente de validação.

**Regra:** o handoff atravessa a fronteira entre projetos por cópia. Projetos não compartilham contexto, e conversas dentro do mesmo projeto também não. Cada cliente é uma conversa nova.
