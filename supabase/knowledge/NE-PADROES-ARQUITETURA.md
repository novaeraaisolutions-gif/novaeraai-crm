# NE-PADROES-ARQUITETURA
**Base de conhecimento · Assistente de Arquitetura Nova Era AI · v1.0 · agosto/2026**

> Padrões extraídos de arquiteturas reais entregues pela Nova Era. São analogia e biblioteca — **nunca molde**. Duas empresas do mesmo setor têm operações diferentes, e copiar arquitetura porque o setor bate é o erro que este arquivo mais precisa impedir.
> Por isso todo padrão é nomeado pelo **problema operacional**, nunca pelo setor.

---

## 1. Princípios de arquitetura

Cinco decisões estruturais que valem para qualquer solução Nova Era.

| Princípio | Consequência no desenho |
|---|---|
| **Infraestrutura, não ferramenta** | O sistema é construído sobre o modelo de operação do cliente — seus tipos de trabalho, seus segmentos, seu fluxo real — e não sobre uma categorização genérica de software. Nenhum processo do cliente é dobrado para caber em tela pronta. |
| **A IA entrega decisão, não tela** | Cada agente termina produzindo algo acionável: uma ficha pronta para aprovação, um prazo pronto para confirmação, uma resposta pronta para o cliente. Nunca um resumo que alguém ainda precisa interpretar. |
| **Humano no ponto de risco** | Automação total onde o erro é reversível. Confirmação humana obrigatória onde o erro é irreversível. |
| **Dependência externa isolada** | Toda integração vive em uma camada de conectores com contrato interno estável. Trocar de provedor ou absorver mudança de API não toca o resto do sistema. |
| **Valor visível cedo** | Fases curtas com entrega utilizável ao final de cada uma. Em substituição de sistema legado, adoção é o risco maior que qualquer risco técnico — e adoção se compra com ganho percebido nas primeiras semanas. |

---

## 2. As seis camadas

A mesma espinha dorsal atende todos os níveis de solução. O que muda entre níveis é **quanto** de cada camada é ativado — não a estrutura. É isso que permite subir de nível sem reconstruir.

| # | Camada | O que contém |
|---|---|---|
| 01 | **Dados** | Base relacional única. Isolamento por perfil, trilha de auditoria e política de retenção desde o primeiro dia. |
| 02 | **Ingestão** | Tudo que entra: OCR, transcrição de áudio, conectores externos, upload, importação de base legada. |
| 03 | **Inteligência** | Os agentes que transformam dado bruto em decisão. |
| 04 | **Operação** | O sistema que a equipe usa: cadastros, listas, agenda, documentos, painéis. |
| 05 | **Interface externa** | Onde o cliente do cliente aparece: agentes de mensageria, portal web. |
| 06 | **Governança** | Transversal. Consentimento e base legal, permissões por perfil, log de acesso, painel de consumo de consultas externas. |

**Frase de venda derivada, usada em documento real:** *"Subir de nível é ativar camada, não reconstruir sistema. Nada do que for feito aqui é jogado fora depois."*

---

## 3. Padrões de mecanismo

Os mecanismos que produzem diferenciação. Um componente que não usa nenhum destes provavelmente é base — necessário, mas não é o que diferencia a Nova Era.

### P1 · Inteligência antes do humano
Algo qualifica, tria ou prepara antes de a pessoa entrar.
**Aplica quando:** existe fila de decisão, ou quem atende não é quem decide.
**Exemplo real:** ficha de atendimento por IA — o áudio vira relato, pretensão, documentos faltantes, indício de prescrição, tese possível e viabilidade sugerida, entrando na fila de revisão já priorizada. A sócia passa a revisar uma ficha em minutos, não um áudio de meia hora.
**Efeito colateral que vale nomear:** ficha estruturada é consultável, comparável e mensurável. Gravação não é.

### P2 · Trava de arquitetura, não de instrução
A restrição é imposta pela estrutura do sistema, não por orientação ao modelo.
**Formulação real:** *"As travas são de arquitetura, não de instrução. A frente comercial não tem acesso a dado de processo. O agente não é orientado a evitar esses assuntos: ele simplesmente não os alcança."*
E no Click Lazer: *"invariante de arquitetura aplicada no servidor — não instrução de comportamento, que qualquer atualização de modelo poderia contornar."*
**Aplica quando:** há segregação de informação sensível, risco financeiro ou risco regulatório.
**É o padrão mais forte do repertório.** Sempre que a resposta natural for "instruímos o agente a não fazer X", pergunte se dá para tornar X inalcançável.

### P3 · Humano no ponto irreversível
IA sugere, humano confirma, e a confirmação fica registrada com autor e hora.
**Exemplo real:** o motor de prazos classifica a publicação, calcula o prazo em dias úteis e sugere a providência — mas cria a tarefa em estado pendente. *"O prazo só entra na agenda oficial após confirmação humana registrada."*
**Regra:** *"Automação cega em prazo fatal transfere um risco jurídico para dentro do software, e isso nunca é aceitável."*

### P4 · Mecanismo que cria comportamento
A arquitetura induz o incentivo certo sozinha, sem gestão manual cobrando.
**Exemplo real:** distribuição de lead ponderada por performance — quem responde rápido recebe mais.
**Exemplo real:** prazo sem responsável designado sobe ao topo da tela da direção.

### P5 · Rede de segurança
Algo impede a perda acontecer mesmo quando a pessoa falha.
**Exemplos reais:** rotina semanal do agente capturando o que foi fechado fora da plataforma e convertendo em bloqueio de agenda; retomada automática de quem iniciou contato e não voltou; sinalização automática de caso parado ou sem responsável.

### P6 · Fechamento do ciclo de dado
O que a operação gera vira visão para quem decide, sem ninguém preencher nada.
**Formulação real:** *"Nada é digitado: os números são subproduto da operação acontecendo."*

### P7 · Governança de custo embutida
Quando um componente tem custo variável proporcional ao volume, a governança nasce junto com ele.
**Composição real:** cota mensal + cache com validade + score de prioridade sugerindo quem entra + painel de consumo visível a quem decide.
**Regra:** *"É a diferença entre uma funcionalidade que se paga e uma linha de custo que ninguém entende."*

### P8 · Reenquadramento que mantém a função e muda o gatilho
Quando um pedido é legítimo na função e arriscado na forma, não se recusa: condiciona-se.
**Exemplo real:** enriquecimento de contato habilitado apenas para quem tem vínculo ou consentimento registrado, com finalidade e base legal gravadas e auditoria de cada consulta. *"A funcionalidade continua existindo; o que muda é o gatilho que a libera."*

### P9 · Codificar método em motor
Quando o ativo do cliente é um método que vive em planilha ou na cabeça de alguém, o padrão é transformá-lo em motor parametrizado — com parâmetros em base editável e versionada, com data de vigência, fonte e autor, **nunca dentro do código**.
**O que isso resolve de uma vez:** escala (o que era montado à mão passa a ser gerado), delegabilidade (vira auditável, logo delegável), atualização (mudança normativa vira recálculo da carteira em vez de retrabalho) e acumulação (cada execução alimenta uma base comparável).
**Regra associada:** rastreabilidade da conclusão até o parâmetro e a regra que a geraram.

---

## 4. Padrões de composição

### C1 · Níveis cumulativos sobre espinha dorsal única
Três níveis, cada um contendo integralmente o anterior. Não são produtos concorrentes — são três profundidades da mesma infraestrutura.
- **Nível 1 (Enxuto):** alto impacto, baixo esforço, **sem dependência externa paga**. É o que pode ser implantado rápido e sem custo variável.
- **Nível 2 (Ideal, recomendado):** acrescenta o que exige integração e remove o risco. É tipicamente o nível em que o sistema **substitui integralmente a ferramenta atual**, encerrando o custo mensal já pago hoje.
- **Nível 3 (Completo):** acrescenta o que muda receita e carrega custo variável ou complexidade regulatória.

**Argumento de sequência, não de valor:** não se recomenda o Nível 3 de largada porque a decisão de quanto gastar em custo variável depende de dados que o cliente ainda não tem — e que passam a existir com o painel do Nível 2. *"Entrar no Nível 3 depois de dois ou três meses de operação medida significa calibrar com base em comportamento real, não em estimativa."*

**Quando o cliente escolhe o Nível 1:** dizer por escrito o que continua sendo risco, para que a implantação não crie a falsa sensação de que aquilo foi endereçado.

### C2 · Frente dupla no mesmo canal, separada por estado
Um único número de mensageria, com o sistema — não a pessoa — decidindo qual frente assume, a partir de um estado verificável.
**Exemplo real:** frente comercial (antes do contrato) e frente jurídica (depois do contrato assinado). *"Quem decide qual frente assume a conversa não é a pessoa que escreveu: é o sistema, ao verificar se aquele telefone já tem contrato assinado."*
**Resolve:** o cliente que escreve no número errado e fica sem resposta.
**Sempre acompanhado de P2** — cada frente não alcança o que não é dela.

### C3 · Agente único, competências por superfície
Uma identidade só atendendo lados diferentes de uma operação, com competências e limites distintos em cada um.
**Exemplo real:** Cléo, no marketplace — converte e tranquiliza de um lado, opera e retém do outro.
**Aplica quando:** há mais de um público e a marca ganha em ter uma persona só.

### C4 · Pipelines múltiplos por natureza de receita
Quando a empresa ganha dinheiro de formas estruturalmente diferentes, cada uma vira um pipeline próprio com estágios próprios — não um funil único com campo "tipo".
**Exemplo real (agência):** contas públicas via licitação (edital monitorado → decisão de participar → proposta técnica → julgamento → contrato), veículos digitais (apresentação de tabela → negociação → acordo), captação de cotas de projeto (mapeamento → apresentação → contrapartida), e novos negócios clássico.

### C5 · Camada de conectores isolada
Toda dependência externa atrás de um contrato interno estável, com alternativa mapeada antes de ser necessária.

---

## 5. Padrões de entrega

### E1 · Gates comportamentais, não temporais
Uma fase só encerra quando a equipe está usando o que foi entregue, não quando o calendário diz que acabou.
**Exemplos reais de gate:** "uma semana inteira de atendimentos registrados no sistema, sem paralelo em planilha" · "ciclo de publicações sem divergência entre o motor e o controle manual" · "queda mensurável no volume de contatos manuais de status" · "fechamento de um mês inteiro com dados exclusivamente do novo sistema" · "custo de consultas externas estável e dentro da cota".

### E2 · Operação em paralelo durante calibração
Componente de risco entra rodando junto com o processo atual até não divergir.

### E3 · Piloto restrito antes de abertura
Agentes voltados ao cliente final começam com grupo pequeno e volume controlado.

### E4 · Migração é fase com dono
Base legada nunca vira surpresa na véspera do go-live.

---

## 6. Padrões de documento

### D1 · Transparência do que fica de fora
Seção obrigatória listando o que não está incluído, **com as consequências ditas**.
> *"Uma proposta que só mostra o que entrega esconde metade da decisão."*
Sempre seguida de por que isso não é um beco: as camadas são as mesmas, subir de nível é ativar camada.

### D2 · Entrega adicional declarada
Quando algo do nível superior é trazido sem acréscimo, dizer que está sendo trazido e por quê. Reforça o valor em vez de escondê-lo.

### D3 · Rastreabilidade item a item
Nenhum pedido do cliente descartado sem justificativa. Tabela com: item original → nível em que entra → **como é atendido e o que muda em relação ao pedido**, marcando `Reenquadrado` ou `Ampliado` quando for o caso.

### D4 · O ponto que costuma passar despercebido
Fecho de seção que nomeia o argumento que o cliente não perceberia sozinho.
**Exemplo real:** *"Nada disto depende de tribunal, de API pública ou de fornecedor de dados. Todo o valor acima é gerado dentro da operação, sobre informação que o escritório já produz todos os dias e hoje perde."*

---

## 7. Antipadrões

- **Copiar arquitetura porque o setor bate.** Padrão é analogia, nunca molde.
- **Tecnologia decorativa.** Se não dá para dizer em uma frase de negócio o que muda no resultado do cliente, não entra.
- **Prometer integração que não existe** como bloco único. Verifique as camadas reais antes.
- **Automatizar o irreversível** sem confirmação humana.
- **Componente com custo variável sem governança de custo** nascendo junto.
- **Escopo que o cliente não absorve.** Uma operação de 8 pessoas não absorve 5 agentes e 9 módulos de uma vez.
- **Começar pelas telas.** *"Um erro de modelagem descoberto depois do lançamento custa mais do que todo o desenho de interface do projeto."*

---

## Lacunas deste arquivo

`[LACUNA 1]` Esforço real em dias-dev por componente — nenhum documento de cliente traz isso.
`[LACUNA 2]` Padrão que vocês tentaram repetir e não funcionou em outro cliente, e por quê.
`[LACUNA 3]` Stack real: o que exige API oficial, o que já quebrou em produção, o que parece simples e não é.
