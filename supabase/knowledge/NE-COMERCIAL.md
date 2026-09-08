# NE-COMERCIAL
**Base de conhecimento · Assistente de Custos e Proposta · v0.5 · agosto/2026**

> ⚠️ **Arquivo parcial.** Tudo abaixo veio de propostas reais entregues. Mas **um caso não é uma política de preço** — as faixas, o piso e a margem só existem depois que os sócios os declararem.
> **Enquanto o piso e a estrutura de custo não estiverem preenchidos, o assistente não fecha preço: ele monta a estrutura de cálculo e pergunta.**

---

## 1. Filosofia de precificação

**O preço se ancora no custo da inércia, nunca em horas de trabalho.** A pergunta que o cliente responde é "quanto eu perco por mês hoje?", não "quantas horas isso levou?".

**A mensalidade se ancora no custo operacional real.** Toda solução tem custo mensal recorrente para a Nova Era. Mensalidade abaixo do custo mais margem é prejuízo com aparência de receita.

**Parcelamento acompanha o desenvolvimento**, com a lógica declarada ao cliente: *"o escritório não descapitaliza para implantar."*

**Risco declarado aumenta confiança.** Esconder risco gera atrito na execução.

---

## 2. Referência real praticada

**D'Paulla Advocacia · Nível 1 — Núcleo Operacional**
- Entrada: **R$ 4.500** (único valor na assinatura)
- Parcelas: **6× R$ 4.250**, sem juros, primeira 30 dias após a entrada
- Total de implementação: **R$ 30.000**
- Mensalidade de infraestrutura: **a calcular** — fechada após confirmação de volumes
- Validade da proposta: **30 dias**

**Escopo entregue por esse valor:** 8 módulos integrados + 3 agentes de IA, sem dependência externa paga. Incluídos no investimento: desenvolvimento sob medida de todos os módulos, implantação, carga inicial, treinamento da equipe e acompanhamento da entrada em operação.

`[FALTA]` Faixas para Nível 2 e Nível 3. Faixas para outros portes. Valores dos demais projetos.

---

## 3. Mensalidade de infraestrutura

Tratamento usado na proposta real, e que deve ser mantido:

> *"Corresponde à infraestrutura de funcionamento do sistema na prática — servidor, banco de dados, armazenamento de documentos e áudios, número de WhatsApp, processamento das transcrições e das análises de inteligência, além da sustentação. É proporcional ao volume de atendimentos e ao acervo armazenado, fechada após a confirmação desses números, e passa a valer **somente depois da implantação concluída**."*

Três decisões embutidas nessa formulação, todas boas:
1. A mensalidade é **explicada por composição**, não apresentada como número solto.
2. Fecha depois, com dado real — não se chuta na proposta.
3. Só começa a valer depois do go-live — o cliente não paga sustentação de algo que ainda não usa.

`[FALTA]` **Piso de mensalidade e margem alvo.** Sem isso não há como o assistente validar se um valor proposto é sustentável.

---

## 4. Manutenção e relação

**Corretiva — sempre inclusa**

| Severidade | Definição | SLA |
|---|---|---|
| Crítica | Operação parada ou risco imediato — prazo, dado ou acesso comprometido | até 4h |
| Normal | Falha que atrapalha mas não impede a operação de seguir | até 24h |
| Baixa | Comportamento incorreto sem impacto operacional relevante | próxima sprint |

Argumento usado com o cliente: *"SLA de até 4 horas para severidade crítica é uma exceção no mercado. Num escritório onde uma indisponibilidade em dia de prazo tem consequência real, esse número não é detalhe contratual — é o que separa um susto de um problema."*

**Adaptativa — inclusa.** *"Nenhum sistema nasce calibrado. O que muda mês a mês é o tom do agente, a ordem de um fluxo, um campo que a equipe passou a usar de outro jeito. Isso não é escopo novo — é afinação."*

**Aditiva — orçada.** Funcionalidade que não existia no escopo, **inclusive a ativação das camadas do nível superior**. Orçamento apresentado e aprovado antes de qualquer desenvolvimento, sempre sobre a base já implantada.

**Evolutiva — reprojeto.** O cliente mudou: nova área, filial, novo modelo de trabalho.

`[FALTA]` Valores dos planos de manutenção. Existe plano nomeado com preço, ou tudo entra na mensalidade de infraestrutura?

---

## 5. Movimentos comerciais observados

**Entrega adicional declarada.** Trazer algo do nível superior sem acréscimo, **dizendo que está trazendo e por quê**. Na D'Paulla: *"Na arquitetura apresentada no diagnóstico, qualquer agente de WhatsApp era item do nível superior. Foram trazidos para esta proposta porque resolvem o problema mais caro e mais silencioso da rotina — e porque funcionam sem depender de integração externa."*
Reforça valor em vez de escondê-lo, e ancora o que o nível superior contém.

**Absorção de custo existente como argumento.** Quando há software legado pagando conta hoje: *"a comparação não é 'custo novo versus zero', é 'custo novo versus custo atual mais tudo o que ele não faz'."*
**Cuidado correspondente:** se o nível vendido não substitui o legado, dizer isso — na proposta da D'Paulla está escrito que a mensalidade atual continua sendo paga porque é o legado que ainda entrega o Diário Oficial.

**Prova antes do acordo.** No Click Lazer, diagnóstico, arquitetura e demonstrativo funcional navegável foram produzidos antes de qualquer acordo comercial. *"É assim que trabalhamos quando o projeto ainda é uma conversa. Vocês já sabem o que esperar."*

**Transparência como argumento de venda.** Seção obrigatória do que não está incluído, com as consequências ditas, seguida de por que não é um beco.

---

## 6. Custo de inércia — como se calcula

Ver `NE-METODO-DIAGNOSTICO`, seção 10. Regras que valem na proposta:

1. **Premissas deliberadamente puxadas para baixo**, e isso dito ao cliente antes dos números.
2. Cada linha com o cálculo aberto: N unidades × M minutos = X h/mês.
3. Total bruto, depois **corte de recuperação** declarado, depois o número recuperável.
4. Seção **"o que não cabe em horas"** — os custos reais não somados por falta de dado.
5. Fecho que reposiciona: *"O custo de inércia é pago todo mês, para sempre. O investimento é pago uma vez. Manter a operação como está não é a opção neutra."*

**Use sempre o número conservador na proposta.** Um custo de inércia que o cliente derruba com uma pergunta destrói a proposta inteira.

---

## 7. Fronteira de responsabilidade

Quando a solução depende de conhecimento ou decisão que é do cliente, declarar e indicar para o contrato. Modelo (Valens): *"a Nova Era é dona do motor; o cliente é dono da tese."*

Decisões que travam etapas técnicas quando adiadas devem ser listadas explicitamente, com a recomendação da Nova Era e a decisão atribuída ao cliente.

---

## LACUNAS CRÍTICAS

1. **Piso de preço** — abaixo de quanto não se fecha, mesmo querendo o cliente.
2. **Margem alvo** sobre o custo mensal.
3. **Faixas por porte de solução** — pequena, média, grande.
4. **Custo interno por dia-dev.**
5. **Regras de desconto** — quando, até quanto, o que se pede em troca.
6. **Objeções recorrentes** com as palavras do cliente, e em qual delas ele tem razão.
7. **Quando não vender** — sinais de cliente que não vale a pena.
8. **Garantia** — o que cobre, por quanto tempo, o que não cobre.
