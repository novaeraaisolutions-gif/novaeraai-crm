# NE-CASES
**Base de conhecimento · todos os assistentes · v1.0 · agosto/2026**

> Casos reais da Nova Era. Usados para **reconhecer padrão operacional** e como prova social — nunca como molde de solução.
> Estes registros foram reconstruídos a partir dos documentos entregues ao cliente. Por isso trazem o que foi diagnosticado, arquitetado e proposto, mas **não trazem o que aconteceu depois** — esforço real, o que quebrou, o que o cliente não absorveu. Esses campos estão marcados `[FALTA]` e só os sócios podem preenchê-los.

---

## CASO 01 · D'Paulla Advocacia
**Setor:** advocacia de massa, multi-comarca · **Praça:** Uberlândia/MG · **Data:** 2026

### Contexto
Escritório de volume, não boutique. Mix de causas de massa em quatro segmentos — cível, trabalhista, bancário e previdenciário — com atuação em mais de uma comarca. Volume de entrada alto, ticket individual moderado, margem dependente de padronização. Já havia software jurídico em uso, com mensalidade ativa.

### Material de origem
Uma **lista de 15 funcionalidades** produzida em reunião de levantamento (10 de cadastro, 5 de processos), mais conversa de repasse com quem conduziu o levantamento. Não houve transcrição de reunião de diagnóstico.

### Insumo escasso
Hora da sócia (fila de decisão de viabilidade) e hora do jurídico (interrompida por atendimento repetitivo).

### Gargalos (10)
| ID | Classe | Gargalo | Origem |
|---|---|---|---|
| G1 | Entrada | Dados entram redigitados e voltam a ser redigitados | pedido |
| G2 | Decisão | Triagem de viabilidade depende inteiramente da sócia | inferência |
| G3 | Memória | O que foi dito no atendimento vive na cabeça de quem atendeu | inferência |
| G4 | Receita | Cada pessoa tratada como uma causa, quando é uma carteira | inferência |
| G5 | Risco | A cadeia publicação → prazo → tarefa é 100% humana (6 elos em série) | pedido |
| G6 | Atenção | Comunicação com o cliente é integralmente reativa | pedido |
| G7 | Acervo | Documentos espalhados entre WhatsApp, e-mail, drive e papel | pedido |
| G8 | **Lacuna** | Não existe camada financeira — e ninguém pediu | omissão |
| G9 | **Lacuna** | Não existe painel de gestão — e ninguém pediu | omissão |
| G10 | **Lacuna** | Documentos de entrada montados à mão — o pedido parou no cadastro | omissão |

G5 foi classificado como *o maior passivo não precificado da operação* — único gargalo capaz de gerar responsabilidade civil. G10 como *o ganho mais barato e mais visível de todo o projeto*.

### Leituras não óbvias (7)
Reenquadramento (pediram CRM, a dor é originação) · sintoma vs. necessidade (vídeo é desconfiança do registro) · inversão de prioridade (o item de maior risco listado por último) · risco ético (busca de telefone por CPF vs. vedação à captação e LGPD) · correção técnica (não existe "integração com o governo": DJEN, DataJud e provedor comercial são camadas distintas) · requisito escondido ("acompanhamento opcional" é controle de orçamento) · fato comercial (software legado é argumento, dado e risco).

### Arquitetura
Seis camadas, três níveis cumulativos.
- **N1 Núcleo Operacional** — cadastro com OCR, ficha de atendimento por IA, central de documentos, gerador de peças, filtros, agenda manual de prazos, painel v1, governança. Resolve G1, G2, G3, G7, G9, G10. **Sem dependência externa.**
- **N2 Operação Inteligente (recomendado)** — captura DJEN, motor de prazos com confirmação humana, tradutor de publicações, monitoramento de andamentos, agente de WhatsApp do cliente, agente interno, módulo financeiro, painel completo, migração. Resolve G5, G6, G8.
- **N3 Completo** — busca processual por CPF, monitoramento com score, radar de oportunidades na carteira, enriquecimento governado, portal do cliente, assistente de minutas, inteligência de carteira. Resolve G4.

### Padrões usados
Níveis cumulativos (C1) · frente dupla no mesmo canal separada por contrato assinado (C2) · humano no ponto irreversível no motor de prazos (P3) · trava de arquitetura entre frentes (P2) · governança de custo no monitoramento por CPF (P7) · reenquadramento que muda o gatilho no enriquecimento de contato (P8) · gates comportamentais (E1).

### O que foi vendido
**Nível 1 — Núcleo Operacional.** R$ 4.500 de entrada + 6× R$ 4.250 = R$ 30.000. Mensalidade de infraestrutura "a calcular", fechada após confirmação de volumes e válida só após a implantação.
Movimento comercial: os dois agentes de WhatsApp, que na arquitetura eram item do nível superior, foram trazidos para o N1 **sem acréscimo no investimento**, com a justificativa declarada de que resolvem o problema mais caro e mais silencioso e funcionam sem depender de integração externa.

### Custo de inércia calculado
46 h/mês em trabalho qualificado (~550 h/ano), com corte conservador para ~35 h/mês recuperáveis. Premissas declaradamente puxadas para baixo. Três custos não somados por falta de dado: cliente não atendido a tempo, causa que ninguém viu, risco de prazo.

### `[FALTA]`
Esforço real em dias-dev · o que quebrou · o que a equipe não absorveu · resultado medido depois · custo mensal real de infraestrutura.

---

## CASO 02 · Valens Consultoria
**Setor:** consultoria de gestão e BPO financeiro · **Praça:** Uberlândia/MG · **Data:** agosto/2026
**Interlocutor:** Gabriel Vieira, sócio

### Contexto
Poucos clientes por mês, todos de peso, com presença próxima e envolvimento direto dos sócios. Modelo de profundidade, não de volume.

### Insumo escasso
**Hora de sócio e de consultor sênior.** Declarado explicitamente como o eixo do diagnóstico: toda hora em trabalho repetitivo é hora que não virou consultoria vendida, e o teto de crescimento da carteira é exatamente esse.

### Gargalo priorizado
O estudo de impacto da reforma tributária está preso na planilha. **Decomposto em quatro travas:** não escala (cada estudo consome horas de sócio) · não é delegável (regra em fórmula de célula gera erro silencioso) · os parâmetros vão mudar mais de uma vez (e todo estudo entregue envelhece sem aviso) · o estudo não vira base (dado valioso produzido e não acumulado).

Síntese: *"Não é um problema de produtividade individual. É um problema de forma."*

### Verificação independente
Régua de datas da reforma levantada pela Nova Era, não pela reunião: janela de opção 01–30/09/2026, desistência até 30/11, alíquota de referência da CBS até 15/12/2026, CBS plena em 01/01/2027, IBS a partir de 2029, sistema pleno em 2033. Isso criou o critério de priorização "janela" e revelou uma segunda frente de trabalho (revisar em out/nov as decisões tomadas às pressas).

### Arquitetura
Motor de simulação tributária, com nove requisitos derivados — cada um amarrado a uma trava. Destaques: parâmetros em base editável e versionada com data de vigência, fonte legal e autor, **nunca dentro do código**; cálculo multi-regime ano a ano de 2026 a 2033; crédito transferível ao cliente PJ; efeito caixa do split payment separado do efeito de carga; análise de sensibilidade; rastreabilidade da conclusão até o parâmetro; relatório executivo com marca do cliente; painel de carteira; arquitetura isolada por empresa desde o início.

O último requisito não resolve trava atual — preserva a opção futura de oferecer o motor como produto sem reconstrução.

### Fronteira de responsabilidade
Declarada e indicada para o contrato: *"a Nova Era é dona do motor; a Valens é dona da tese tributária."*

### Identificado, não priorizado
Captura de documentos fiscais e contas a pagar (segunda maior prioridade, maior potencial de liberar horas) · ausência de benchmark de carteira · risco reputacional no BPO financeiro · dependência de uma pessoa para interpretar a norma, que o sistema reduz mas não elimina.

### Padrões usados
Codificar método em motor (P9) · verificação independente como fonte de achado · decomposição em travas · registro do não priorizado.

### Estrutura documental
Três documentos: 01 Diagnóstico · 02 Proposta Comercial · 03 Roadmap de Implementação. Diferente da D'Paulla, onde diagnóstico e arquitetura vieram juntos em D1.

### `[FALTA]`
Valor proposto e fechado · esforço real · se o motor foi entregue dentro da janela de setembro · o que aconteceu com a frente de contas a pagar.

---

## CASO 03 · Click Lazer
**Setor:** marketplace de locação de espaço por evento · **Natureza:** parceria com startup · **Data:** 2026

### Contexto
Lacuna de mercado real: Airbnb, Booking, VRBO e Trivago resolvem hospedagem; nenhum resolve locação de espaço por evento. Mercado de alta frequência, concentrado em fim de semana e feriado, hoje quase inteiramente informal — Facebook, indicação e WhatsApp. O cliente chegou com apresentação de projeto e plano, procurando quem desenvolvesse o aplicativo.

### Onde a Nova Era contrariou o cliente
Três pontos, por escrito, no próprio documento de proposta:
1. **O cronograma do plano estava vencido** — MVP previsto para meados de 2025. *"Indica que a barreira nunca foi a tese, e sim a capacidade de execução técnica."*
2. **As premissas de ocupação eram otimistas** — a projeção assumia cada espaço alugando mais de uma vez por semana, todas as semanas, sendo chácara ativo de fim de semana e temporada. *"A plataforma precisa ser desenhada para aumentar a ocupação, não para presumi-la — e isso é decisão de arquitetura, não de marketing."*
3. **Faltava o lado da oferta** — o plano descrevia como atrair quem procura, não como encher a plataforma de espaços.

### Reenquadramento central
*"Vocês procuraram alguém para desenvolver o aplicativo. Nossa avaliação é que o aplicativo é a parte menor do problema."* Um site é copiável em semanas; uma plataforma exige arquitetura — garantir a data, verificar o dono, gerar contrato, guardar o dinheiro, provar o estado do espaço, arbitrar conflito.

**Risco central identificado: desintermediação.** Num marketplace local as partes se conhecem no primeiro evento. Toda decisão de produto respondeu a uma pergunta: *"por que essa pessoa não sairia do trilho?"* — e a resposta não podia ser contrato de exclusividade.

### Tese
*"A Click Lazer não vende espaço. Vende certeza. O espaço é apenas o estoque."* Três consequências: a data é a interface · a inteligência é a operação · liquidez é local.

### Arquitetura
Quatro pilares (design de produto, arquitetura de domínio, camada de inteligência, plataforma técnica), três superfícies (quem aluga, quem oferta, operação do evento) e núcleo com motor de disponibilidade, pagamento e custódia, contratos, verificação e antifraude, reputação e disputa, praças e dados.

**Componente mais crítico:** motor de disponibilidade com bloco de uso e intervalo de virada em vez de diária — permite vender o mesmo dia mais de uma vez quando há tempo de limpeza. *"A exclusividade da data é garantida na própria base de dados: duas reservas simultâneas para o mesmo período são impossíveis por construção, não por processo."*

**Camada de inteligência:** Cléo, agente único com competências distintas por superfície. Limite declarado como parte da entrega: nenhum agente confirma reserva, move dinheiro, cancela, altera preço ou publica anúncio — *"invariante de arquitetura aplicada no servidor, não instrução de comportamento, que qualquer atualização de modelo poderia contornar."*

### Padrões usados
Agente único com competências por superfície (C3) · trava de arquitetura no servidor (P2) · humano no ponto irreversível (P3) · rede de segurança na proteção de agenda (P5) · horizontes H1/H2/H3.

### Escopo excluído, declarado
Operação comercial e captação · gestão de mídia · atendimento humano do dia a dia · serviços jurídicos e contábeis · licenciamento e credenciamento financeiro · produção de conteúdo dos anúncios.

### Movimento comercial notável
O diagnóstico, a arquitetura de domínio, o desenho das três superfícies e um demonstrativo funcional navegável foram produzidos **antes de qualquer acordo**. *"É assim que trabalhamos quando o projeto ainda é uma conversa. Vocês já sabem o que esperar."*

### `[FALTA]`
Formato de parceria acordado · se avançou · esforço estimado.

---

## CASO 04 · Ginga (CRM para agência de publicidade)
**Setor:** agência de publicidade com contas públicas · **Data:** 2026

### Contexto
Agência com quatro naturezas de receita estruturalmente diferentes: contas públicas via licitação (Lei 12.232/2010), fee mensal e projetos, veiculação e intermediação de mídia com comissionamento, e captação de cotas de projetos incentivados.

### Padrão central
**Pipelines múltiplos por natureza de receita** — cada uma com estágios próprios, não um funil único com campo "tipo":
- Licitação: edital monitorado → decisão de participar → proposta técnica → julgamento/habilitação → contrato
- Novos negócios: ciclo comercial clássico, com objetivo declarado de virar contrato recorrente, não venda única
- Veículos: apresentação de tabela → negociação comercial → acordo firmado
- Cotas: mapeamento de patrocinador → apresentação de cota → negociação de contrapartida

### Componentes notáveis
Comissionamento com **regra versionada e vigência** (v2 · de 01/2025 a 06/2026 · nova venda 6% · recorrente 2%) e apuração que trava após aprovação — *"a partir daqui, ajuste só por estorno registrado"*. Permissão por papel com **mascaramento de campo**, não só ocultação de registro. Trilha de auditoria. Agentes de captura passiva, risco de conta e higiene de dados. Sinal de risco explicitado na própria tarefa: *"já adiada duas vezes pelo cliente — sinal de risco na conta"*.

### Padrões usados
Pipelines múltiplos (C4) · fechamento do ciclo de dado (P6) · rede de segurança em prestação de contas com prazo contratual (P5) · governança com versionamento de regra.

### `[FALTA]`
Contexto real do cliente · gargalos diagnosticados · se foi vendido e por quanto · esforço.

---

## Padrões que se repetem entre casos

| Padrão | D'Paulla | Valens | Click Lazer | Ginga |
|---|---|---|---|---|
| Níveis cumulativos | ● | — | horizontes | — |
| Trava de arquitetura (P2) | ● | — | ● | ● |
| Humano no irreversível (P3) | ● | ● | ● | ● |
| Governança de custo (P7) | ● | — | — | — |
| Codificar método em motor (P9) | — | ● | — | ● |
| Contrariar o cliente por escrito | ● | ● | ● | `[FALTA]` |
| Registro do não priorizado | ● | ● | ● | `[FALTA]` |

**Leitura:** humano no ponto irreversível aparece nos quatro. Contrariar o cliente por escrito aparece em todos os que têm documento de diagnóstico. Nenhum dos dois é opcional.
