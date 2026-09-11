# NE-CONTRATOS-MODELO — Os três contratos assinados

Contratos reais, do jeito que foram assinados. Servem como referência de
**redação e nível de detalhe** — nunca como molde para copiar escopo,
valor ou prazo de um cliente para outro.

**O CNPJ da Nova Era nestes três contratos (`59.305.580/0001-78`) é anterior
à transferência de CNPJ e não é mais o vigente.** O correto é `40.644.314/0001-41`, conforme `NE-CONTRATOS-PADRAO`.
Nunca copie o CNPJ daqui.

Cada cliente tem o escopo dele. O que se reaproveita daqui é a forma:
como uma cláusula é escrita, quanto detalhe um módulo carrega, como uma
tabela de parcelas é montada.

## Trietel 2026 — Tipo A (Implementação)

Referência principal de **nível de detalhe do escopo**. É o contrato mais
extenso dos três e o padrão de granularidade dos módulos.

```
NovaEra AI
Contrato de Desenvolvimento
Sistema de Gestão de Campo e Ativos Técnicos
Contrato que estabelece o escopo completo de desenvolvimento, as condições comerciais, garantias e cláusulas de exclusividade para a Trietel Comercial Ltda.

CONTRATANTE: Trietel Comercial Ltda · CNPJ 26.247.965/0001-77
CONTRATADA: NovaEra AI · CNPJ 59.305.580/0001-78 · Uberlândia, MG
OBJETO: Desenvolvimento de sistema de gestão de campo e ativos técnicos
Contrato emitido em Junho de 2026 · Confidencial

R$ 25.000  Investimento total de desenvolvimento · parcelável em 6×

R$ 1.500/mês  Mensalidade de serviço · condição especial a partir do 6º mês
28–45 dias  Prazo de entrega · prioridade para o prazo mínimo
30 dias  Período de testes e manutenções adaptativas pós-implementação

CLÁUSULA 1
Partes e objeto do contrato
1.1 · Identificação das partes
Contratante: Trietel Comercial Ltda, pessoa jurídica de direito privado, inscrita no CNPJ sob o n.º 26.247.965/0001-77, sediada em Uberlândia — MG, representada por seus sócios-administradores.
Contratada: NovaEra AI, empresa de tecnologia especializada em soluções de inteligência artificial para operações de campo, inscrita no CNPJ sob o n.º 59.305.580/0001-78, sediada em Uberlândia — MG.

1.2 · Descrição do objeto contratado
O presente contrato tem por objeto o desenvolvimento, implementação e operação contínua de um sistema completo de gestão de campo e ativos técnicos, composto por:
Agente de inteligência artificial no WhatsApp para técnicos de campo (gestão de OS, estoque, materiais e vídeos de prova de funcionamento)
Canal de WhatsApp para síndicos com interpretação de áudio e abertura de OS
Portal web do síndico para acompanhamento de OS e inventário de ativos
Dashboard administrativo completo (ERP operacional) para a equipe Trietel
Módulo de geração automática de relatório mensal (PDF de execuções + Excel financeiro + nomeação de vídeos por IA)
Integração com XML de notas fiscais para entrada de produtos no estoque
Módulo financeiro completo — Contas a Receber (OS concluída gera cobrança automática, boleto e NFS-e), Contas a Pagar, Conciliação Bancária (API bancária existente), DRE + Fluxo de Caixa e Relatórios Financeiros automáticos

Módulo financeiro incorporado ao escopo inicial: R$ 3.000,00 adicionais, totalizando R$ 25.000,00 no investimento de desenvolvimento.
O sistema será desenvolvido sob medida para a operação da Trietel, considerando os fluxos operacionais documentados nas reuniões de diagnóstico de Maio/Junho de 2026.

CLÁUSULA 2
Módulos e funcionalidades incluídos
Todos os módulos estão incluídos no investimento de R$ 25.000. O sistema é entregue completo — dos 8 módulos operacionais ao módulo financeiro integrado.

Módulo 1 · Agente WhatsApp do Técnico
IA conversacional que gerencia todo o ciclo de uma OS via WhatsApp, sem app adicional.
Recebimento de OS com endereço exato, localização no condomínio e histórico do equipamento
antes de listar o que vai levar, o executor informa se tem todos os itens necessários ou se precisará comprar/buscar algum — bifurcando o fluxo conforme o casoVerificação prévia de materiais:
quando há necessidade de compra, o executor lista os itens, a IA notifica o admin da Trietel para autorização, e após liberação o executor retira o material junto ao fornecedor (Trietel paga direto ao fornecedor)Fluxo de compra autorizada:
executor envia foto ou PDF da NF ao receber os materiais — IA armazena vinculada à OS como custo de materialRecebimento de NF de compra:
Listagem de materiais do estoque Trietel antes do deslocamento (texto ou áudio transcrito) + foto obrigatória sobre bancada
Confirmação de lista de produtos item por item com reserva automática no estoque
Aprovação de deslocamento após confirmação completa dos materiais (próprios + comprados + estoque)
Mecanismo "Cheguei" → envio de instruções de campo com localização exata no condomínio
Registro de foto do "antes" como início oficial do serviço
Baixa definitiva no estoque ao registrar o início do serviço
Mecanismos de início, pausa (com justificativa obrigatória) e retomada de OS
Prevenção de sobreposição de OS: executor não pode iniciar nova OS sem pausar a atual
Foto do depois + vídeo de funcionamento para encerramento da OS
Nomeação automática do vídeo pela IA com identificação da OS (ex: OS247_EdAmarelo_CorredorB.mp4)
após foto + vídeo, IA solicita dados de pagamento (PIX ou conta bancária, se não cadastrado) e NF do serviço prestado à TrietelEncerramento diferenciado para prestador externo:
ao receber NF e dados do prestador externo, IA encaminha tudo ao responsável financeiro para pagamento externoNotificação automática ao responsável Trietel:
Transcrição de áudios enviados pelo executor em qualquer etapa do fluxo

Módulo 2 · Canal WhatsApp do Síndico
Canal dedicado para que o síndico abra OS diretamente pelo WhatsApp, com ou sem voz.
Identificação automática do síndico e condomínio pelo número cadastrado
Abertura de OS por texto ou áudio (IA transcreve e confirma a transcrição com o síndico)
Confirmação da OS antes de registrar — evita erros de interpretação
Subida da OS ao portal da Trietel e sistema em tempo real após confirmação
Acompanhamento de status da OS pelo mesmo canal (chegada do técnico, conclusão)
Suporte a múltiplos síndicos por condomínio

Módulo 3 · Portal do Síndico
Portal web para cada síndico visualizar OS, ativos instalados e histórico de serviços.
Dashboard com OS abertas, em andamento, pausadas e concluídas do condomínio
Visualização de fotos antes/depois e vídeo de funcionamento em tempo real
Inventário completo de ativos instalados: modelo, serial, IP, senha, localização, histórico
Diferenciação visual de ativos Trietel (com NF) vs. ativos próprios do condomínio
Aprovação digital de OS concluídas
Acesso por login próprio — dados isolados por condomínio

Módulo 4 · Dashboard Administrativo (ERP Operacional)
Painel completo para a equipe Trietel gerenciar toda a operação em tempo real.
Gestão de OS: tabela com filtros por status, tipo, condomínio, executor e urgência
Atribuição e reatribuição de OS com notificação automática ao executor (interno ou externo)
nome, CPF/CNPJ, especialidade, WhatsApp e dados bancáriosCadastro de prestadores externos:
Badge de tipo de executor por OS: técnico interno ou prestador externo
NF e dados de pagamento do prestador externo armazenados no detalhe da OS
Status de pagamento do prestador externo: aguardando / realizado
NF de compra de material vinculada à OS com valor, fornecedor e itens adquiridos
notificação ao receber solicitação do executorAutorização de compra pelo admin:
Flag de urgência por OS (normal ou urgente)
Acompanhamento de OS pausadas com motivo registrado
Transferência de OS entre executores com fluxo de devolução ou alocação de material
Alertas automáticos para OS em atraso, estoque crítico, OS pausadas e NFs de prestador pendentes

Módulo 5 · Gestão de Estoque
Controle completo de estoque com dois tipos de produto e rastreabilidade total.
Dois estoques distintos: Estoque Trietel (com NF) e Estoque Condomínio (sem NF)
Reserva de produtos ao confirmar lista antes do deslocamento (sem baixa ainda)
Baixa efetiva apenas na foto de início do serviço em campo
Rastreabilidade por part number, serial e fornecedor
Histórico de movimentações com OS vinculada, técnico e condomínio destino
Integração com XML de notas fiscais para entrada de produtos (Explend → sistema)
Alertas de estoque mínimo configuráveis por produto
Fluxo de devolução de material com foto obrigatória (OS transferida)
Registro de material deixado em condomínio quando OS é transferida

Módulo 6 · Relatórios Automáticos
Geração automática do relatório mensal padrão da Trietel, sem trabalho manual.
PDF de execuções por condomínio: número de NF + foto antes e depois por OS
Excel financeiro mensal por condomínio com todas as OS e valores
Nomeação automática dos vídeos de funcionamento pela IA (OS + condomínio + local)
Vídeos armazenados e disponíveis para download vinculado à OS no sistema
Relatório construído 100% conforme o padrão atual da operação Trietel
KPIs operacionais: OS por semana, por tipo, por técnico, por condomínio
Exportação em PDF e Excel por período e por condomínio

Módulo 7 · Gestão de Ativos Técnicos
Inventário digital de todos os equipamentos instalados em cada condomínio.
Cadastro automático de ativo pela foto de após instalação (modelo, serial, IP)
Campos: tipo, modelo, fabricante, serial, IP, senha, localização física, data de instalação, NF de origem
Distinção entre ativo Trietel e ativo próprio do condomínio
Histórico completo de intervenções por equipamento
Acesso para técnico em campo antes da visita

Módulo 8 · Integração com ERP Atual (Explend)
Ponte de dados entre o sistema novo e o Explend atual, sem substituí-lo nesta fase.
Leitura de XML de notas fiscais para entrada de produtos no estoque
Sem necessidade de alteração no fluxo financeiro atual (Explend continua para boleto e NF)
Base preparada para integração do módulo financeiro completo em fase futura
Elimina necessidade de duplicar lançamento de entradas de estoque manualmente

Módulo 9 · Módulo Financeiro Completo
Controle financeiro integrado à operação. OS encerrada gera cobrança, NF de compra gera despesa, API bancária concilia automaticamente. Elimina o Excel da rotina administrativa.
OS encerrada → cobrança gerada automaticamente → boleto e NFS-e em 1 clique → baixa via API bancária existenteContas a Receber:
XML de NF cria despesa automaticamente → custos fixos recorrentes → lançamentos avulsos categorizados → DRE alimentada sem retrabalhoContas a Pagar:
API bancária da Trietel puxa extrato diariamente → match automático de pagamentos → fila de revisão apenas para exceçõesConciliação Bancária:
receita, custo de materiais, mão de obra, despesas operacionais → margem e resultado calculados automaticamente todo mêsDRE + Fluxo de Caixa:
quanto cada cliente gera e quanto custa para atender — visível sem compilação manualRentabilidade por condomínio:
DRE, aging de recebíveis, extrato categorizado, fluxo de caixa — PDF/Excel em 1 clique + envio automático mensal por e-mailRelatórios Financeiros Automáticos:

CLÁUSULA 3
Fluxos do agente de IA
Detalhamento completo de cada fluxo operacional. Estes fluxos definem o comportamento do sistema e são a base de aceite da entrega.

Fluxo 1 · Jornada completa do técnico em campo
1  Recebimento da OS
Técnico recebe no WhatsApp: endereço completo, localização exata no condomínio, tipo de serviço, dados do equipamento (modelo, serial, IP se houver), dados do síndico e flag de urgência.
2  Verificação prévia de materiais
A IA pergunta: "Você já tem todos os materiais necessários para esta OS, ou precisará comprar ou buscar algum item?" Executor responde: tenho tudo / precisarei comprar / tenho parte. A resposta define o caminho: listagem direta (padrão) ou fluxo de compra autorizada (Fluxo 5).
3  Listagem de materiais — áudio + foto obrigatória
Técnico descreve os materiais por áudio (IA transcreve) e envia foto sobre a bancada. IA confirma item por item e reserva no estoque — sem dar baixa ainda.
4  Aprovação de deslocamento
IA reserva os produtos e aprova o deslocamento: "Materiais reservados. Aprovado para deslocamento. Avise ao chegar."
5  Chegada — "Cheguei"
Técnico avisa chegada. IA envia localização exata do serviço dentro do condomínio, detalhes do equipamento a ser trabalhado e instrução para tirar foto do antes.
6  Foto do antes → início oficial
Técnico envia foto do estado atual. IA confirma, registra e realiza a baixa definitiva do estoque reservado. Serviço pode ser iniciado.
6a  Pausa (opcional com justificativa)
Técnico pode pausar a OS a qualquer momento. É obrigatório informar o motivo. Enquanto pausada, não pode iniciar nova OS. Admin da Trietel é notificado.
6b  Encerramento — foto depois + vídeo
Para encerrar: foto do estado final e vídeo de funcionamento. IA armazena o vídeo, nomeia automaticamente (ex: OS247_EdAmarelo_CorredorB.mp4), vincula à OS e aprova o encerramento. Síndico é notificado.

Fluxo 2 · Abertura de OS pelo síndico via WhatsApp
1  Síndico envia mensagem ou áudio
Síndico contata o canal WhatsApp da Trietel. A IA identifica o síndico e o condomínio pelo número cadastrado. Aceita texto ou áudio — no caso de áudio, transcreve e exibe para confirmação.
2  Confirmação com o síndico
A IA monta o resumo da OS e solicita confirmação antes de registrar. Apenas após a confirmação a OS é criada.
3  OS registrada em tempo real
A OS é subida ao portal da Trietel e ao dashboard do admin simultaneamente. Admin atribui técnico e o síndico acompanha o status.

Fluxo 3 · Transferência de OS entre executores
1  Executor pausa OS com justificativa
Executor informa motivo. Admin recebe notificação com contexto completo (OS, motivo, material em campo).
2  Admin redireciona a OS
Pelo dashboard, admin seleciona novo executor. O novo recebe notificação com todos os dados e histórico.
3  Executor original decide o material
IA notifica o executor original com duas opções: (A) devolver ao estoque da Trietel — foto obrigatória; (B) deixar no condomínio — foto do material deixado no local.
4  Novo executor recebe OS completa
OS transferida com histórico completo, material disponível, localização exata e tudo que o anterior já havia feito. Nenhuma informação é perdida.

Fluxo 4 · Geração do relatório mensal
1  Dados acumulados durante o mês
Todo mês, cada OS concluída gera automaticamente seu registro completo: fotos antes/depois, vídeo nomeado, NF vinculada, duração e responsável.
2  Geração automática em 1 clique
Admin seleciona o período e exporta: PDF de execuções com NF e fotos por OS; Excel financeiro mensal por condomínio.
3  Secretária anexa os vídeos e envia
Os vídeos já estão no sistema, nomeados pela IA. A secretária faz o download, anexa ao e-mail de envio para o adm externo do condomínio.

Fluxo 5 · Compra de materiais para a OS
1  Verificação prévia — precisa comprar?
Antes de listar materiais, IA pergunta. Se a resposta for que precisa comprar, executor lista os itens necessários e a IA notifica o admin para autorização.
2  Admin autoriza — executor retira no fornecedor
Admin autoriza pelo sistema. A Trietel contata o fornecedor (Trietel paga direto). Executor busca o material.
3  NF de compra recebida e armazenada
IA recebe a NF, armazena vinculada à OS como custo de material. Confirma ao executor que pode prosseguir.
4  Retomada do fluxo normal
Com materiais comprados confirmados e eventuais itens do estoque Trietel reservados, IA aprova o deslocamento. Fluxo segue normalmente.

Fluxo 6 · Encerramento com prestador externo
1  OS atribuída ao prestador externo
Admin seleciona ou cadastra o prestador. Prestador recebe a OS no WhatsApp e segue o mesmo fluxo do técnico interno.
2  Foto + vídeo enviados — IA detecta prestador externo
Ao receber a foto do depois e o vídeo, a IA identifica que o executor é prestador externo e ativa a etapa adicional de documentação financeira.
3  IA solicita dados de pagamento
Se o prestador não tem dados bancários cadastrados, a IA solicita: PIX ou dados bancários. Se já cadastrado, etapa pulada automaticamente.
4  IA solicita Nota Fiscal do serviço
Prestador envia NF ou recibo referente ao serviço prestado à Trietel. IA armazena vinculado à OS.
5  Notificação ao responsável da Trietel
OS encerrada. IA encaminha NF + dados bancários ao responsável financeiro para pagamento externo. Admin registra confirmação no sistema após pagar.

CLÁUSULA 4
Prazo de entrega, implementação e manutenções
4.1 · Prazo de desenvolvimento e entrega
28 a 45 dias corridos — prioridade para o prazo mínimo
O prazo de entrega é de 28 a 45 dias corridos a partir da confirmação do início do desenvolvimento (pagamento da 1ª parcela). A NovaEra AI adotará ordem de prioridade para entrega no prazo mínimo de 28 dias, sem comprometer a qualidade e o processo de confirmação de funcionamento.
A entrega inclui:
Sistema completo em produção, acessível via URL própria
Configuração inicial com dados da Trietel (condomínios, técnicos, produtos, prestadores externos)
Integração com a API bancária existente da Trietel
Onboarding da equipe administrativa e técnicos de campo
Treinamento da secretária (Elisangela) no módulo de relatórios
Sessão de validação e confirmação de funcionamento com a equipe Trietel para aceite formal

A contagem do período de 30 dias de testes inicia a partir da data de aceite formal da entrega pela Trietel.

4.2 · Período de testes e manutenções pós-implementação (30 dias)
30 dias de operação acompanhada com três categorias de manutenção
Após a implementação, a Trietel terá 30 dias de operação acompanhada pela NovaEra AI. Durante este período, a solução já operará em ambiente real.

Manutenções corretivas (SLA crítico: até 4 horas)
Correção de falhas que impeçam o funcionamento do sistema. Prazo máximo de 4 horas para incidentes críticos, previsto em contrato. Embora improvável dado o processo rigoroso de QA antes da implementação, este SLA garante continuidade operacional.

Manutenções adaptativas (conforme disponibilidade NovaEra AI)
Ajustes e refinamentos com base no uso real — adequações ao fluxo de IA, correções de comportamento em situações não mapeadas, ajustes de usabilidade. Executadas conforme disponibilidade da equipe NovaEra AI dentro dos 30 dias.

Manutenções aditivas (negociadas)
Novas funcionalidades ou expansões de escopo. Sempre orçadas e aprovadas pelas partes antes do desenvolvimento, independentemente do período de testes.

O período de 30 dias de testes não implica isenção de cobrança de infraestrutura. Os custos de infraestrutura são repassados mensalmente desde o primeiro mês de operação.

CLÁUSULA 5
Condições de pagamento — Desenvolvimento
5.1 · Valor e condição de pagamento
R$ 25.000 em 6 parcelas de ~R$ 4.167 — 1ª parcela na assinatura
O investimento total de desenvolvimento é de R$ 25.000,00 (vinte e cinco mil reais), dividido em 6 (seis) parcelas de aproximadamente R$ 4.167,00. O pagamento da 1ª parcela é condição obrigatória para a validade do contrato e o início do desenvolvimento.

Calendário padrão: parcela 1 na assinatura · parcelas 2 a 6 mensalmente, no mesmo dia do mês.

Formas de pagamento

① Pagamento integral ou quitação antecipada — 5% de desconto
Desconto de 5% sobre o valor total pago em uma única transferência — aplicável tanto ao pagamento integral na assinatura quanto à quitação antecipada do saldo em qualquer momento do parcelamento. Aceita PIX, boleto ou transferência bancária.
R$ 23.750,00 à vista  (5% de desconto · economia de R$ 1.250,00)
② Boleto bancário — 6× sem juros  ✓ Condição sugerida
Parcelamento em 6 boletos mensais, sem juros ou correção monetária. NovaEra AI emite os boletos com antecedência mínima de 5 dias úteis. 1º boleto com vencimento em até 3 dias úteis da assinatura. Desenvolvimento inicia após compensação bancária.
6× de R$ 4.167,00  sem juros · NFS-e emitida por parcela
③ Cartão de crédito — 6× com juros
Parcelamento em até 6× via link de pagamento seguro. Juros da operadora incidem a partir da 2ª parcela (aproximadamente 2% a 3% a.m.). Valor por parcela exibido no link antes da confirmação. Desenvolvimento inicia após confirmação da operadora (até 24h).
6× com juros da operadora
5.2 · Emissão de Notas Fiscais
A NovaEra AI emitirá Nota Fiscal de Serviço Eletrônica (NFS-e) em até 2 dias úteis após a confirmação de cada pagamento. Para pagamento à vista: uma única NFS-e do valor quitado. Para parcelamento: uma NFS-e por parcela de R$ 4.167,00, enviada ao e-mail do responsável financeiro da Trietel.

CLÁUSULA 6
Custos recorrentes e condição especial de mensalidade
6.1 · Estrutura de custos recorrentes
Dois componentes distintos: infraestrutura e serviço NovaEra AI
Os custos recorrentes após a implementação são compostos por dois componentes distintos com regras de cobrança diferentes:
Custos de infraestrutura: repassados à Trietel mensalmente desde o primeiro mês de operação, com prazos a combinar. Correspondem aos custos reais de servidores, banco de dados, armazenamento e APIs.
Mensalidade de serviço NovaEra AI (R$ 1.500/mês): cobre suporte, evolução contínua, reuniões mensais e manutenções. O início da cobrança é determinado pela forma de pagamento do desenvolvimento — conforme detalhado em 6.2.

6.2 · Início do contrato de mensalidade — regras por forma de pagamento
O contrato de mensalidade de serviço NovaEra AI poderá ou não ser ativado imediatamente após o período de 30 dias de testes e refinamento. A regra de ativação segue automaticamente a forma de pagamento contratada para o desenvolvimento.

Se o pagamento for parcelado (6×):
O contrato de mensalidade será assinado e a primeira cobrança de R$ 1.500/mês será realizada 30 dias após o pagamento da última (6ª) parcela do desenvolvimento — ou seja, aproximadamente no 7º mês. Durante os meses 1 a 6 (período das parcelas), a NovaEra AI garante o funcionamento correto do sistema, executa manutenções corretivas dentro do SLA de 4 horas e mantém o repasse mensal dos custos de infraestrutura. Ao assinarem o contrato de mensalidade, todas as categorias de manutenção passam a estar disponíveis.
Custos parcelado meses 1–6: parcela de desenvolvimento (~R$ 4.167) + infraestrutura (~R$ 400–600) · sem mensalidade de serviço
Mês 7 em diante: infraestrutura + mensalidade R$ 1.500 · todas as manutenções incluídas

Se o pagamento for à vista (com 5% de desconto):
Como benefício adicional pelo pagamento integral antecipado, a primeira mensalidade de serviço NovaEra AI será cobrada somente a partir do 6º mês após a implementação. Durante os meses 1 a 5 deste período isento, estão disponíveis:
✓  Custos de infraestrutura repassados mensalmente (conforme 6.3)
✓  Funcionamento correto e estável do sistema garantido
✓  Manutenções corretivas com SLA de 4 horas

✗  Manutenções adaptativas, evolutivas ou aditivas NÃO estão disponíveis durante os meses 1 a 5 — estas são disponibilizadas somente após o início do pagamento da mensalidade de serviço no 6º mês. O período de 30 dias de testes e refinamento (com manutenções adaptativas incluídas) é anterior e independente deste período, ocorre imediatamente após a implementação e é garantido em qualquer forma de pagamento.

A forma de pagamento escolhida determina automaticamente o modelo de mensalidade aplicável, sem necessidade de seleção adicional no momento da assinatura.

6.3 · Projeção de custos de infraestrutura
Os custos de infraestrutura são variáveis e escalam com o volume de OS processadas por mês. Serviços utilizados: Claude Sonnet (texto e visão) · Supabase Pro · VPS para integração WhatsApp.

Componente
Tipo
300 OS/mês
500 OS/mês
800 OS/mês
Supabase Pro
Fixo
R$ 125
R$ 125
R$ 125
VPS (WhatsApp layer)
Fixo
R$ 100
R$ 100
R$ 100
Claude Sonnet — Texto
Variável
~R$ 75
~R$ 130
~R$ 200
Claude Vision — Fotos e NFs
Variável
~R$ 35
~R$ 60
~R$ 95
Buffer / contingência (10%)
—
~R$ 34
~R$ 42
~R$ 52
Total estimado de infraestrutura
Mensal
~R$ 369
~R$ 457
~R$ 572
Valores convertidos a R$ 5,00/USD. Claude Sonnet: $3,00/1M tokens entrada · $15,00/1M saída.
6.4 · Planos Supabase — comparativo
Plano
Custo
Banco
Storage
Banda
Backups
Avaliação
Free
$0
500MB
1GB
5GB
—
Inadequado
Pro ✓ Selecionado
$25/mês
8GB
100GB
250GB
Diário 7d
Adequado anos 1–3
Team
$599/mês
Ilimitado
Ilimitado
Ilimitado
Diário 30d
Excesso
Storage adicional além de 100GB: $0,021/GB. Trietel consome ~36GB/ano — dentro do limite do plano Pro.
6.5 · Mensalidade de serviço — R$ 1.500/mês
A mensalidade de serviço de R$ 1.500,00 (mil e quinhentos reais) cobre, além dos custos de infraestrutura repassados separadamente:
Suporte técnico 24 horas com SLA crítico de 4 horas para manutenções corretivas
Manutenções adaptativas baseadas no uso real — ajustes de fluxo, comportamento de IA, usabilidade
Evolução contínua do sistema — melhorias mensais sem custo adicional
Reunião mensal de revisão operacional e alinhamento de melhoria contínua
Relatório mensal de desempenho operacional
O contrato de mensalidade tem duração inicial de 3 (três) meses, renovável por igual período. Não há multa por não renovação ao término do prazo.

CLÁUSULA 7
Cláusula de exclusividade

O sistema da Trietel não será revendido nem reaproveitado. Mas a NovaEra AI não se compromete a deixar de atender concorrentes.
A NovaEra AI é uma empresa de desenvolvimento de soluções personalizadas. Seu modelo de negócio é construir sistemas sob medida para cada cliente, mediante diagnóstico próprio. O compromisso assumido aqui é específico: este sistema — desenvolvido exclusivamente para a Trietel — não será revendido, licenciado ou reaproveitado como produto para outros clientes. O que a NovaEra AI pode e continuará fazendo é desenvolver novas soluções para empresas do mesmo setor, desde que essas soluções resultem de diagnóstico independente e não sejam fielmente idênticas ao sistema da Trietel.

7.1 · Propriedade intelectual e escopo do compromisso
O sistema é da NovaEra. O compromisso é não revendê-lo.
O software desenvolvido, incluindo código-fonte, arquitetura, fluxos de IA e documentação técnica, é e permanece propriedade intelectual da NovaEra AI. A Trietel Comercial Ltda adquire o direito de uso deste sistema pelo período de vigência do contrato de mensalidade.

O que a NovaEra AI se compromete a NÃO fazer:
Revender, licenciar ou transferir este sistema específico — desenvolvido para a Trietel — para qualquer outro cliente
Reaproveitar este sistema como produto de prateleira, template ou solução padrão para venda a terceiros
Criar, para outro cliente, um sistema que seja fielmente idêntico ao da Trietel em arquitetura, fluxos e funcionalidades — ou seja, uma cópia direta desta solução

O que a NovaEra AI mantém o direito de fazer:
Prestar serviços de desenvolvimento para empresas do mesmo setor (instalação e manutenção técnica, segurança eletrônica, condomínios), incluindo concorrentes diretas da Trietel
Desenvolver soluções personalizadas para esses clientes, baseadas em diagnóstico próprio e independente realizado com cada um deles
Criar sistemas que possam ter funcionalidades semelhantes às da Trietel — como agente WhatsApp, gestão de OS, controle de estoque — desde que resultem de trabalho autoral e diagnóstico específico daquele cliente, e não sejam uma reprodução fiel do sistema ora contratado

Em resumo: a NovaEra AI não vende produtos — vende desenvolvimento personalizado. Este sistema pertence ao portfólio de soluções criadas para a Trietel e não será reaproveitado como produto. Mas a NovaEra AI é livre para criar, mediante novo diagnóstico e desenvolvimento, soluções análogas para outros clientes do setor.

7.2 · Dados da Trietel
Dados são propriedade exclusiva da Trietel
Todos os dados gerados pela operação da Trietel no sistema — OS, ativos, fotos, vídeos, estoque, relatórios — são de propriedade exclusiva da Trietel Comercial Ltda.
Em caso de rescisão contratual por qualquer motivo, a NovaEra AI disponibilizará exportação completa de todos os dados em formato padronizado, sem custo adicional, em até 15 dias após a solicitação.
A NovaEra AI não utilizará os dados operacionais da Trietel para nenhuma finalidade além da operação do sistema contratado.

CLÁUSULA 8
Suporte técnico e SLA
24h  disponibilidade de suporte    4h  SLA crítico    99,9%  uptime contratual
8.1 · Canais de atendimento
WhatsApp direto: canal exclusivo com a equipe NovaEra AI para dúvidas, problemas e solicitações
E-mail: para solicitações formais, relatórios de incidente e documentação
Reunião mensal: videoconferência de revisão operacional, melhoria contínua e alinhamento

8.2 · Classificação de incidentes
Crítico (SLA 4h): sistema indisponível, técnicos não conseguem acessar, OS não são registradas
Alto (SLA 24h): funcionalidade principal comprometida mas sistema parcialmente operacional
Médio (SLA 72h): funcionalidade secundária com problema, sem impacto operacional imediato
Baixo (próxima sprint): melhorias, ajustes cosméticos ou novas funcionalidades

8.3 · Evolução contínua
A mensalidade inclui desenvolvimento contínuo de melhorias baseadas no uso real do sistema. A cada mês, ajustes e refinamentos são implementados sem custo adicional, incluindo:
Refinamentos nos fluxos de IA com base em feedbacks da equipe
Otimizações de performance e usabilidade
Adequações ao relatório mensal conforme necessidade da operação
Novas funcionalidades de escopo significativo (manutenções aditivas) serão sempre orçadas e aprovadas pela Trietel antes do desenvolvimento.

CLÁUSULA 9
Garantias e rescisão
9.1 · Garantia de entrega
Entrega conforme o escopo ou devolução integral
A NovaEra AI garante que o sistema será entregue conforme o escopo detalhado neste contrato nos prazos estabelecidos. Caso o sistema entregue não corresponda ao escopo contratado ou apresente mau funcionamento persistente durante o período de teste de 30 dias, a Trietel poderá solicitar:
Correção dos pontos identificados, com prazo acordado entre as partes; ou
Devolução integral de todos os valores pagos, com rescisão contratual sem penalidades
A solicitação de devolução deve ser feita dentro dos 30 dias do período de teste, acompanhada de descrição dos problemas identificados.

9.2 · Confidencialidade
Ambas as partes se comprometem a manter sigilo sobre informações confidenciais compartilhadas no âmbito deste contrato e contrato, incluindo dados operacionais, financeiros e estratégicos. A obrigação de confidencialidade permanece vigente por 2 (dois) anos após o encerramento do contrato.

9.3 · Rescisão
Rescisão pelo contratante:
A Trietel pode rescindir o contrato de mensalidade a qualquer momento, mediante notificação com 30 dias de antecedência. Ao término do período contratual (3 meses), não há multa. Em caso de rescisão antecipada, aplica-se multa de 20% sobre as parcelas remanescentes.
Rescisão pela contratada:
A NovaEra AI pode rescindir o contrato em caso de inadimplência superior a 30 dias, mediante notificação prévia de 15 dias.
Em qualquer hipótese de rescisão:
Todos os dados da Trietel serão exportados e disponibilizados em até 15 dias, sem custo.

9.4 · Disposições gerais
Este contrato regulamenta a relação entre Trietel Comercial Ltda e NovaEra AI. Eventuais divergências serão resolvidas primeiramente em comum acordo. Não havendo acordo, elege-se o foro da Comarca de Uberlândia — MG para dirimir quaisquer litígios. Alterações no escopo, prazo ou condições financeiras somente serão válidas mediante aditivo contratual assinado por ambas as partes.

Uberlândia — MG, _____ de ________________ de 2026.
Ivone dos Reis Pinto
CPF 171.017.781-00
Representante · Trietel Comercial Ltda · CNPJ 26.247.965/0001-77

Gustavo Henrique de Vasconcelos e Silva
CPF 165.804.406-19 · CEO
Representante · NovaEra AI · CNPJ 59.305.580/0001-78

CONTRATO DE DESENVOLVIMENTO · TRIETEL COMERCIAL LTDA · CONFIDENCIAL
```

## Áurea Imóveis 2026 — Tipo A (Implementação)

Segundo modelo de Tipo A, com escopo menor que o Trietel.

```
NOVA ERA AI

CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE
INTELIGÊNCIA ARTIFICIAL E TECNOLOGIA

CONTRATANTE

Áurea Imóveis
CNPJ: 46.161.906/0001-99
Repr.: Guilherme Raniery Ferreira
Uberlândia — Minas Gerais
CONTRATADA

Nova Era AI
CNPJ: 59.305.580/0001-78
Uberlândia — Minas Gerais

Nº DO CONTRATO
PROP-2026-001
DATA DE EMISSÃO
22 de maio de 2026
VIGÊNCIA
12 meses (recorrente)

PREÂMBULO
As partes acima qualificadas celebram o presente Contrato de Prestação de Serviços de Inteligência Artificial e Tecnologia, regido pelas cláusulas e condições abaixo, tendo como referência a Proposta Comercial PROP-2026-001, integrante deste instrumento como Anexo I.
As partes declaram ter lido, compreendido e aceito integralmente todas as condições aqui estabelecidas, reconhecendo que este contrato reflete fielmente os termos acordados.

CLÁUSULA 1ª — OBJETO DO CONTRATO
1.1  A CONTRATADA obriga-se a desenvolver, implementar e operar um ecossistema de inteligência artificial para a CONTRATANTE, composto pelos seguintes módulos:
◆  Módulo 1 — Agente SDR Imobiliário Avançado: agente de IA com LLM frontier (Claude Sonnet), RAG semântico em tempo real sobre o site aurea.com.br, memória persistente de leads via Obsidian e Supabase, score de temperatura automático (🔥 quente / 🟡 morno / ❄️ frio), atendimento 24/7 no WhatsApp da CONTRATANTE, distribuição de leads por roleta com critérios definidos pela Áurea, briefing automático ao corretor em até 60 segundos e registro automático no CRM no perfil do corretor selecionado pela roleta.
◆  Módulo 2 — CRM Imobiliário Customizado: sistema de gestão de leads com pipeline de vendas (8 estágios), 3 dashboards por perfil (Diretor, Gerente, Corretor), sistema de tarefas integrado ao pipeline, roleta inteligente com repasse automático por inatividade, alertas de inatividade (24h, 48h, 72h), dashboard financeiro (DRE, comissões, projeção de receita) e captura automática de leads provenientes de campanhas Meta Ads.
1.2  O agente verificará, via CRM, se o corretor confirmou contato com o lead dentro do prazo definido pela CONTRATANTE. Caso a confirmação não ocorra no prazo, o lead é repassado automaticamente ao próximo corretor da roleta. Os corretores devem registrar o contato no CRM para que o lead não seja redistribuído indevidamente.
1.3  A base de conhecimento do agente (RAG) será construída sobre o site aurea.com.br, atualizada periodicamente no ciclo mensal de manutenção, dispensando integração direta com o Kenlo. O agente será treinado com o DNA de vendas dos sócios por meio de dois workshops estruturados.
1.4  Após a implementação, a CONTRATADA prestará serviços mensais de suporte e manutenção nos termos do Plano Core, conforme Cláusula 6.
CLÁUSULA 2ª — PRAZO DE DESENVOLVIMENTO E ENTREGA
2.1  O prazo total para entrega dos 2 (dois) módulos operacionais é de 3 (três) semanas contadas da assinatura deste contrato, observado o cronograma de desenvolvimento abaixo. O cronograma de pagamento da implementação é independente e segue a cláusula 3.1.

PERÍODO
ENTREGA
D+0 · Assinatura
Kick-off + Workshop 1 agendado
Semana 1
Workshop 1 (DNA de vendas · 2h) + build do agente
Semana 2
Workshop 2 (validação · 2h) + Agente ao vivo no WhatsApp
Semana 3
CRM integrado ao vivo + todos os módulos operacionais
03/08/2026
4ª parcela de implementação + 1ª mensalidade + 1ª reunião de impacto (cláusula 3.5)

2.2  A entrega é considerada concluída quando os dois módulos estiverem operacionais em produção, validados em conjunto com os sócios da CONTRATANTE durante o Workshop 2.
CLÁUSULA 3ª — VALOR E CONDIÇÕES DE PAGAMENTO
3.1  IMPLEMENTAÇÃO — PARCELAMENTO EM 4× QUINZENAL: O valor total pelo desenvolvimento e entrega dos 2 módulos é de R$ 6.500,00 (seis mil e quinhentos reais), pago em 4 (quatro) parcelas iguais de R$ 1.625,00 cada, com vencimento a cada 2 (duas) semanas, via boleto bancário, com nota fiscal emitida a cada parcela:

PARCELA
VENCIMENTO
VALOR
FORMA
1ª parcela
22/06/2026 (segunda-feira)
R$ 1.625,00
Boleto + NF
2ª parcela
06/07/2026 (segunda-feira)
R$ 1.625,00
Boleto + NF
3ª parcela
20/07/2026 (segunda-feira)
R$ 1.625,00
Boleto + NF
4ª parcela
03/08/2026 (segunda-feira)
R$ 1.625,00
Boleto + NF
Total
22/06 a 03/08/2026
R$ 6.500,00
—

3.1.1  O parcelamento da implementação é independente do cronograma de desenvolvimento (cláusula 2.1) — os pagamentos seguem o calendário quinzenal acima mesmo que a entrega ocorra antes do término das 4 parcelas.
3.2  MENSALIDADE — R$500 FIXO + REPASSE DE INFRAESTRUTURA E TOKENS: A mensalidade mensal é composta por dois componentes:
◆  Componente fixo — R$ 500,00/mês: cobre os serviços da equipe Nova Era (sprint de manutenção, suporte técnico, relatório mensal e reunião de acompanhamento). Este valor não varia independentemente do volume de uso.
◆  Componente variável — repasse integral de custos de infraestrutura e tokens: os custos das ferramentas que sustentam a operação são repassados à CONTRATANTE pelo valor exato cobrado pelos fornecedores, sem qualquer margem adicional. Incluem: servidor VPS dedicado, Supabase (banco de dados e vetores), domínio e SSL, e tokens de processamento do modelo Claude Sonnet (Anthropic API).
3.3  Comprovação mensal — relatórios e recibos oficiais: todo mês a CONTRATADA encaminhará à CONTRATANTE, junto ao boleto da mensalidade, os seguintes documentos comprobatórios do consumo real:
◆  Fatura oficial da Anthropic com o consumo exato de tokens (input e output) do período, em USD, convertido para BRL pela taxa de câmbio do fechamento da fatura.
◆  Comprovante de pagamento do VPS e dos demais serviços de infraestrutura do mês de referência.
◆  Extrato consolidado emitido pela Nova Era com o detalhamento de cada item e o total da mensalidade.
A CONTRATANTE tem o direito de auditar qualquer comprovante apresentado. Não haverá cobrança de infraestrutura sem o respectivo recibo original do fornecedor.
3.4  Projeção de referência (valores estimados): as tabelas abaixo apresentam estimativas baseadas no uso típico de agentes imobiliários com o modelo Claude Sonnet. Os valores reais dependerão do volume de conversas e dos preços vigentes da Anthropic na data de cada fatura.

Componente
100 leads/mês
200 leads/mês
350 leads/mês
Nova Era (serviços fixos)
R$ 500
R$ 500
R$ 500
Infra fixa (VPS + Supabase + SSL)
R$ 175
R$ 175
R$ 175
Tokens Claude Sonnet (estimativa)
~R$ 90
~R$ 180
~R$ 315
Total estimado / mês
~R$ 765
~R$ 855
~R$ 990
* Tokens estimados com base em ~10.000 tokens por conversa qualificada (input + output + RAG). Valor real cobrado conforme fatura oficial Anthropic do mês de referência, convertido pelo câmbio USD/BRL da data do fechamento.

3.5  Início da mensalidade: a primeira parcela da mensalidade será cobrada em 03/08/2026, na mesma data da 4ª e última parcela da implementação. Esta primeira cobrança será composta integralmente pelo componente fixo Nova Era (R$ 500,00) somado aos custos reais de infraestrutura e tokens do período, conforme cláusula 3.2 — sem isenção ou desconto.
3.6  As mensalidades subsequentes vencem mensalmente, sempre no dia 03 de cada mês, seguindo a mesma composição (fixo Nova Era + repasse de infraestrutura e tokens ao custo real).
3.7  Formas de pagamento: as 4 parcelas de implementação são pagas exclusivamente via boleto bancário, com nota fiscal emitida a cada vencimento. A mensalidade (cláusula 3.6) pode ser paga via PIX (3% de desconto), boleto bancário ou cartão de crédito (até 3× sem juros), com nota fiscal emitida mensalmente.
3.8  O atraso no pagamento de qualquer parcela da implementação implica suspensão do desenvolvimento até a regularização. O atraso em qualquer mensalidade por mais de 10 (dez) dias corridos, após notificação de 5 dias, pode ensejar a suspensão dos serviços.
CLÁUSULA 4ª — TREINAMENTO E DESENVOLVIMENTO DO AGENTE
4.1  O treinamento do agente será realizado em 2 (dois) workshops com duração de 2 horas cada:
◆  Workshop 1 (Semana 1 · DNA de Vendas): mapeamento de objeções recorrentes, argumentos de fechamento eficazes no mercado de Uberlândia, perfis de cliente por bairro e tom de comunicação da Áurea. Esse conteúdo vira o caráter permanente do agente.
◆  Workshop 2 (Semana 2 · Validação e Go-live): simulação de cenários reais com os sócios, ajuste fino de tom e limites, configuração da roleta de corretores com os critérios da Áurea e ativação no WhatsApp oficial. Nenhum fluxo entra em produção sem aprovação prévia da CONTRATANTE.
4.2  Todo o funcionamento do agente é pactuado e validado previamente com a CONTRATANTE antes de qualquer implementação.
CLÁUSULA 5ª — GARANTIA E PERÍODO DE TESTE
5.1  A CONTRATANTE terá 7 (sete) dias corridos de período de teste, contados da entrega do sistema (cláusula 2.2), para avaliar se os sistemas funcionam conforme descrito neste contrato e na Proposta PROP-2026-001.
5.2  CLÁUSULA DE DEVOLUÇÃO INTEGRAL: Se durante os 7 dias de teste a CONTRATANTE identificar que:
◆  os sistemas não estão funcionando conforme especificado;
◆  o agente não realiza as funções descritas na cláusula 1.1;
◆  o CRM não opera com os módulos contratados; ou
◆  a entrega não corresponde ao que foi descrito e acordado;
a CONTRATANTE poderá solicitar a devolução integral do valor de implementação (R$ 6.500,00), sem necessidade de justificativa além da constatação, e sem qualquer penalidade.
5.3  O reembolso integral será processado em até 5 (cinco) dias úteis, via o mesmo meio de pagamento original ou outro acordado entre as partes.
5.4  Decorrido o período de 7 dias sem solicitação de devolução, considera-se que a CONTRATANTE aceitou a entrega. A mensalidade tem início na data fixa estabelecida na cláusula 3.5.
CLÁUSULA 6ª — PLANO CORE — SERVIÇOS MENSAIS INCLUÍDOS
6.1  O componente fixo de R$500,00/mês da mensalidade Nova Era (cláusula 3.2) contempla integralmente:
◆  Sprint mensal de manutenção: ajustes de fluxo do agente, atualização da base RAG com novos imóveis do site Áurea e correções de comportamento com base nas conversas reais do mês.
◆  Suporte técnico SLA 8h úteis / SLA 4h crítico: falhas gerais são respondidas em até 8 horas úteis; agente offline ou CRM inacessível recebem resolução em até 4 horas, 7 dias por semana.
◆  Relatório mensal de performance: número de leads atendidos, taxa de qualificação, conversão por estágio do funil, performance por corretor e ROI calculado da solução.
◆  Reunião mensal de acompanhamento: revisão de resultados, alinhamento de prioridades para o ciclo seguinte e apresentação de sugestões de evolução.
◆  Disponibilidade mínima de 99%: uptime mensal garantido para o agente e para o CRM.
6.2  A mensalidade não é cobrada durante o desenvolvimento. A primeira cobrança ocorre na data fixa estabelecida na cláusula 3.5.
6.3  O cancelamento da mensalidade pode ser solicitado a qualquer momento após o período de garantia, com aviso prévio de 30 (trinta) dias corridos, sem multa.
6.4  O componente fixo de R$500,00/mês (condição parceiro fundador) é garantido pelo prazo de 12 meses. Após esse período, poderá ser reajustado pelo IGP-M/FGV acumulado, com notificação de 30 dias de antecedência.
CLÁUSULA 7ª — OBRIGAÇÕES DA CONTRATADA
7.1  Desenvolver, implementar e entregar os módulos contratados dentro do prazo estabelecido na cláusula 2, com qualidade técnica aderente ao descrito neste instrumento e na Proposta PROP-2026-001.
7.2  Realizar os workshops de treinamento com a equipe da CONTRATANTE, garantindo que o agente incorpore o DNA de vendas da Áurea.
7.3  Fornecer suporte técnico nos prazos estabelecidos na cláusula 6.1, mantendo os sistemas com disponibilidade mínima de 99% ao mês.
7.4  Enviar mensalmente o extrato detalhado de consumo de infraestrutura com as faturas originais de cada fornecedor.
7.5  Manter sigilo sobre todas as informações da CONTRATANTE, conforme cláusula 9.
7.6  Não realizar qualquer alteração no funcionamento do agente ou do CRM sem validação prévia da CONTRATANTE.
CLÁUSULA 8ª — OBRIGAÇÕES DA CONTRATANTE
8.1  Realizar os pagamentos nas datas acordadas, conforme cláusula 3.
8.2  Participar ativamente dos workshops de treinamento, disponibilizando os sócios ou representantes nas datas agendadas.
8.3  Fornecer acesso às informações necessárias para configuração: número WhatsApp oficial, dados dos corretores (nome e WhatsApp) e acesso ao site aurea.com.br.
8.4  Garantir que os corretores registrem no CRM a confirmação de contato com os leads, para que a roleta e o repasse automático funcionem corretamente.
8.5  Validar fluxos e configurações do agente durante o Workshop 2 antes do go-live.
8.6  Não compartilhar, sublicenciar ou reproduzir a tecnologia, fluxos ou sistemas desenvolvidos pela CONTRATADA sem autorização expressa.
CLÁUSULA 9ª — CONFIDENCIALIDADE E PROPRIEDADE DE DADOS
9.1  A CONTRATADA compromete-se a manter absoluta confidencialidade sobre todos os dados, leads, conversas, informações de clientes, dados financeiros e estratégicos da CONTRATANTE, não podendo divulgar, compartilhar ou utilizar tais informações para qualquer finalidade que não seja a execução dos serviços contratados.
9.2  Todos os dados gerados — leads, conversas, histórico do CRM e dados financeiros — são de propriedade exclusiva da CONTRATANTE. A CONTRATADA atua como processadora de dados, sem qualquer direito de propriedade sobre eles.
9.3  Em caso de encerramento contratual, a CONTRATADA fornecerá exportação completa dos dados em formato padrão aberto (CSV/JSON) em até 10 (dez) dias úteis, sem custo adicional.
9.4  As obrigações de confidencialidade sobrevivem ao término deste contrato por prazo indeterminado.
CLÁUSULA 10ª — PROPRIEDADE INTELECTUAL
10.1  A metodologia, algoritmos, fluxos conversacionais, código-fonte e arquitetura técnica desenvolvidos pela CONTRATADA são de sua propriedade intelectual exclusiva, e não constituem objeto de cessão por este contrato.
10.2  A CONTRATANTE adquire o direito de uso dos sistemas enquanto vigente o contrato de mensalidade. O encerramento implica cessação do direito de uso, ressalvada a exportação dos dados conforme cláusula 9.3.
CLÁUSULA 11ª — RESCISÃO
11.1  Por justa causa da CONTRATANTE: inadimplemento material da CONTRATADA — entrega fora do prazo superior a 10 dias sem justificativa aceita, ou sistema inoperante após o período de garantia. A CONTRATANTE poderá rescindir com devolução proporcional dos valores pagos, sem penalidade.
11.2  Por justa causa da CONTRATADA: inadimplemento da CONTRATANTE por mais de 15 (quinze) dias corridos, após notificação prévia de 5 dias.
11.3  Rescisão imotivada da mensalidade: possível a qualquer momento após o período de garantia, mediante aviso de 30 dias corridos, sem multa.
11.4  O valor de implementação (R$6.500,00) não é reembolsável após o encerramento do período de garantia, exceto em justa causa imputável à CONTRATADA.
CLÁUSULA 12ª — LIMITAÇÃO DE RESPONSABILIDADE
12.1  A CONTRATADA não se responsabiliza por resultados comerciais específicos (número de vendas ou receita), que dependem de fatores externos ao escopo deste contrato.
12.2  A CONTRATADA não se responsabiliza por indisponibilidades decorrentes de falhas em serviços de terceiros (WhatsApp/Meta, servidores de nuvem, operadoras), desde que adote medidas razoáveis de mitigação.
12.3  A responsabilidade máxima da CONTRATADA por danos diretos é limitada ao valor total pago nos 3 (três) meses imediatamente anteriores ao evento danoso.
CLÁUSULA 13ª — DISPOSIÇÕES GERAIS
13.1  Este contrato representa o acordo integral entre as partes, substituindo quaisquer entendimentos anteriores verbais ou escritos.
13.2  A Proposta Comercial PROP-2026-001 é parte integrante deste instrumento como Anexo I.
13.3  Qualquer alteração a este contrato deve ser feita por escrito e assinada por ambas as partes.
13.4  As comunicações formais entre as partes serão realizadas por e-mail ou WhatsApp, com confirmação de recebimento.
13.5  Este contrato é regido pelas leis brasileiras. As partes elegem o Foro da Comarca de Uberlândia — MG, renunciando a qualquer outro por mais privilegiado que seja.

Uberlândia (MG), ________ de ____________________________ de 2026

CONTRATANTE
Áurea Imóveis — CNPJ 46.161.906/0001-99
Representante: Guilherme Raniery Ferreira
CPF: 015.113.676-95
E-mail: admin@aureaimoveis.com
Data:

CONTRATADA
Nova Era AI — CNPJ 59.305.580/0001-78
Representante: Gustavo — CEO
CPF/CNPJ: 59.305.580/0001-78
Data:

TESTEMUNHAS

1ª Testemunha
Nome:
CPF:

2ª Testemunha
Nome:
CPF:

ANEXO I — PROPOSTA COMERCIAL DE REFERÊNCIA

Proposta PROP-2026-001 · Nova Era AI × Áurea Imóveis · 22/05/2026

Resumo do Escopo e Valores Acordados

ITEM
CONDIÇÃO
Solução contratada
Agente SDR Avançado + CRM Imobiliário
Módulos incluídos
2 módulos integrados — entrega em 3 semanas
Implementação total
R$ 6.500,00 (4x R$ 1.625,00 quinzenal)
1ª parcela
R$ 1.625,00 — 22/06/2026 — boleto + NF
2ª, 3ª e 4ª parcelas
R$ 1.625,00 cada — 06/07, 20/07 e 03/08/2026
Mensalidade — fixo Nova Era
R$ 500,00/mês (serviços fixos)
Mensalidade — infra fixa
R$ 175,00/mês — repassada ao custo (VPS+Supabase+SSL)
Mensalidade — tokens IA
Claude Sonnet — repassado ao custo via fatura Anthropic
Comprovação mensal
Fatura Anthropic + recibos infra + extrato Nova Era
Estimativa referencial (100 leads)
~R$ 765,00/mês total
Fórmula mensal
R$500 + R$175 + (R$0,90 × leads)
Início da mensalidade
03/08/2026 — junto à 4ª parcela de implementação
Vencimento mensalidades seguintes
Dia 03 de cada mês
Período de garantia
7 dias corridos — devolução integral R$6.500
Prazo de desenvolvimento
3 semanas após assinatura (cronograma cl. 2.1)
Suporte incluído
SLA 8h (geral) · SLA 4h (crítico)
Workshops de treinamento
2 sessões de 2h com os sócios
Cancelamento mensalidade
Aviso prévio 30 dias · sem multa
Propriedade dos dados
100% da CONTRATANTE
Confidencialidade
Integral · perpetuidade após encerramento
Foro
Comarca de Uberlândia — MG

Nova Era AI  ·  CNPJ 59.305.580/0001-78  ·  Uberlândia, MG  ·  2026  ·  Proposta PROP-2026-001
Este documento é confidencial e destina-se exclusivamente às partes signatárias.
```

## Auto Marcas — Tipo B (Mensalidade / Plano Core)

Único modelo de Tipo B. Referencia o contrato de implementação anterior,
como todo Tipo B deve fazer.

```
CONTRATO DE PRESTAÇÃO DE SERVIÇOS CONTINUADOS
Mensalidade de Parceria Tecnológica — Auto Marcas
CONTRATANTE
Auto Marcas (Jeane — Responsável)
CONTRATADA
Nova Era AI
MUNICÍPIO / FORO
Uberlândia, MG
REFERÊNCIA
NEA-2025-AUTOMARCAS-MENS · v1.0
Pelo presente instrumento particular, de um lado Auto Marcas, neste ato representada por Jeane, doravante denominada CONTRATANTE, e de outro lado Nova Era AI, doravante denominada CONTRATADA, têm entre si justo e acordado o presente Contrato de Prestação de Serviços Continuados ("Contrato de Mensalidade"), que se rege pelas cláusulas e condições a seguir, em complemento e continuidade à Proposta Comercial e Contrato de Serviços Ref. NEA-2025-AUTOMARCAS, firmada anteriormente entre as partes para a implementação das soluções ora mantidas.
CLÁUSULA 1 — OBJETO DO CONTRATO
1. O presente contrato tem por objeto a prestação continuada, pela CONTRATADA, de serviços de manutenção e evolução técnica, bem como o licenciamento de uso, sobre as soluções previamente implementadas na operação da CONTRATANTE, a saber: (a) o Agente de Atendimento Inteligente via WhatsApp — Recepção (Larissa Digital); e (b) o Sistema ERP/CRM da Auto Marcas, composto pelos módulos de Pipeline de Sinistros, Controle de Materiais de Laboratório, CRM de Clientes, Dashboard por Seguradora e Financeiro.
2. O período de testes em produção real, previsto na Cláusula 4 do Contrato de Implementação Ref. NEA-2025-AUTOMARCAS, foi efetivamente praticado por 30 (trinta) dias corridos e já se encontra concluído, com a continuidade da parceria confirmada pela CONTRATANTE. Este contrato de mensalidade entra, portanto, em vigência a partir da presente data.
CLÁUSULA 2 — ESCOPO DOS SERVIÇOS MENSAIS — PLANO CORE
Este contrato corresponde ao Plano Core da Nova Era AI. Todas as solicitações de alteração enviadas pela CONTRATANTE são classificadas pela CONTRATADA em uma das 4 (quatro) categorias de manutenção abaixo, conforme a Taxonomia de Manutenção Nova Era AI, antes do início de qualquer execução.
1. Manutenção corretiva: correção de bug, falha técnica ou comportamento incorreto de algo que foi entregue e funcionava conforme acordado na proposta original. Este serviço é coberto integralmente pela mensalidade, sem limite de quantidade.
Severidade
Prazo de atendimento (SLA — Plano Core)
Crítica (impede o uso normal)
4 (quatro) horas
Normal (impacto parcial)
24 (vinte e quatro) horas
Baixa (cosmético, sem impacto operacional)
Próxima sprint semanal

2. Manutenção adaptativa: ajuste de comportamento, tom, fluxo ou parâmetro de uma funcionalidade já existente e entregue à CONTRATANTE — o sistema continua fazendo o que foi prometido, porém de forma diferente (calibração, não expansão). São incluídas na mensalidade até 3 (três) manutenções adaptativas por mês (até 1 hora de execução cada); solicitações excedentes a esse limite serão tratadas e orçadas como manutenção aditiva, conforme item 3 abaixo.
3. Manutenção aditiva: nova funcionalidade, novo fluxo, nova integração ou novo módulo que não estava no escopo original da proposta — trabalho novo, e não ajuste do que já foi entregue. Este serviço não está incluído na mensalidade e é cobrado à parte, com valor definido conforme o nível de complexidade de cada solicitação, sempre em condição de preço parceiro e critérios coerentes com a relação comercial entre as partes. O orçamento de cada manutenção aditiva será apresentado à CONTRATANTE e por ela aprovado antes do início da execução — nenhuma manutenção aditiva é iniciada sem essa aprovação prévia.
4. Manutenção evolutiva: reengenharia parcial ou total das soluções em razão de mudança significativa no contexto de negócio da CONTRATANTE — como mudança de modelo de negócio, expansão para novas unidades, substituição de ferramenta central (ex.: troca do CRM) ou crescimento que exija reestruturação da arquitetura. Este tipo de manutenção é tratado como novo projeto, com diagnóstico, nova proposta comercial e contrato específico para o escopo evolutivo, mediante acordo entre as partes; a mensalidade vigente permanece cobrindo o sistema anterior até a conclusão da migração.
5. Critério decisivo entre adaptativa e aditiva: se a funcionalidade solicitada já existe no sistema entregue e a CONTRATANTE deseja apenas que ela funcione de forma diferente, é manutenção adaptativa; se a funcionalidade não existe, ainda que em parte, e precisa ser construída, é manutenção aditiva.
CLÁUSULA 3 — VALOR E FORMA DE PAGAMENTO
MENSALIDADE — PLANO CORE
R$ 650,00 / mês
Referente ao uso e à manutenção da totalidade das soluções: Agente Larissa Digital (WhatsApp) + Sistema ERP/CRM

1. O valor da mensalidade é de R$ 650,00 (seiscentos e cinquenta reais) e remunera, conjuntamente: (a) os serviços de manutenção corretiva e de manutenção adaptativa, esta última limitada a 3 (três) por mês, conforme Cláusula 2; e (b) o direito de uso e licenciamento do Agente Larissa Digital e do Sistema ERP/CRM descritos na Cláusula 1, não havendo cobrança adicional separada por agente, por módulo do ERP, ou por uso dos sistemas. Os serviços de manutenção aditiva, quando solicitados, são cobrados à parte, conforme Cláusula 2.3.
2. O período de testes de 30 (trinta) dias corridos, previsto no Contrato de Implementação, já se encontra concluído, com a continuidade da parceria confirmada pela CONTRATANTE. Dessa forma, a primeira cobrança da mensalidade ocorrerá na presente data de assinatura deste contrato, 29 de julho de 2026.
3. O vencimento mensal fixo é todo dia 12 (doze) de cada mês. Em razão de a primeira cobrança ocorrer na assinatura (29/07/2026), o primeiro ciclo terá duração inferior a um mês completo, compreendendo o período de 29/07/2026 a 12/08/2026, sem prejuízo da cobrança do valor integral da mensalidade nesse primeiro ciclo; a partir do segundo ciclo, o vencimento passa a ser fixo todo dia 12 de cada mês. O pagamento será realizado via Pix ou transferência bancária, conforme dados a serem fornecidos pela CONTRATADA.
4. Em caso de atraso no pagamento superior a 10 (dez) dias corridos, a CONTRATADA poderá suspender os serviços de manutenção corretiva e adaptativa previstos na Cláusula 2, mantendo apenas o funcionamento técnico das soluções já implementadas, até a regularização do pagamento.
5. Em caso de atraso no pagamento, incidirão sobre o valor em atraso, de forma cumulativa e a partir do primeiro dia posterior ao vencimento até a data da efetiva quitação: (a) multa moratória de 2% (dois por cento), cobrada uma única vez sobre o valor da parcela em atraso; (b) juros de mora de 1% (um por cento) ao mês, calculados pro rata die (0,033% ao dia); e (c) correção monetária pelo IPCA (Índice Nacional de Preços ao Consumidor Amplo) acumulado no período de atraso.
6. O valor da mensalidade poderá ser reajustado anualmente, a partir do 13º (décimo terceiro) mês de vigência, mediante comunicação por escrito com antecedência mínima de 30 (trinta) dias, com base na variação do IPCA acumulado no período ou em novo acordo entre as partes.
7. Independentemente do reajuste anual previsto no item 6, o valor da mensalidade poderá ser atualizado a qualquer momento em razão do crescimento dos custos relacionados ao funcionamento da solução e das ferramentas e plataformas que compõem a infraestrutura utilizada (incluindo, entre outras, APIs, provedores de hospedagem, modelos de Inteligência Artificial e demais serviços de terceiros essenciais à operação), mediante aviso prévio por escrito à CONTRATANTE com antecedência mínima de 30 (trinta) dias.
8. A renovação do contrato prevista na Cláusula 4 poderá ser acompanhada de reajuste no valor da mensalidade referente aos serviços da Nova Era AI, a ser comunicado à CONTRATANTE previamente ao início do novo período de vigência.
CLÁUSULA 4 — VIGÊNCIA E RENOVAÇÃO
1. O presente contrato tem prazo mínimo de vigência de 6 (seis) meses, contados a partir da data de início da cobrança da mensalidade, conforme Cláusula 3.
2. Ao final do prazo mínimo, o contrato será renovado automaticamente por iguais e sucessivos períodos, salvo manifestação em contrário por qualquer das partes, mediante aviso prévio por escrito com antecedência mínima de 30 (trinta) dias.
3. Após o cumprimento do prazo mínimo de 6 (seis) meses, a CONTRATANTE poderá solicitar o cancelamento do contrato a qualquer momento, mediante aviso prévio por escrito com antecedência mínima de 30 (trinta) dias, sem multa rescisória.
4. O cancelamento do contrato de mensalidade não afeta a titularidade da CONTRATANTE sobre os dados operacionais gerados no uso das soluções (clientes, ordens de serviço, histórico), conforme já estabelecido na Cláusula 9 do Contrato de Implementação.
CLÁUSULA 5 — RESCISÃO
1. O presente contrato poderá ser rescindido antecipadamente, antes do término do prazo mínimo, nas seguintes hipóteses: (a) descumprimento reiterado e não sanado das obrigações previstas neste instrumento, mediante notificação prévia com prazo de 10 (dez) dias úteis para regularização; (b) inadimplemento superior a 30 (trinta) dias corridos; ou (c) acordo mútuo entre as partes.
2. Em caso de rescisão por iniciativa da CONTRATANTE antes do término do prazo mínimo de 6 (seis) meses, sem justa causa atribuível à CONTRATADA, será devida multa equivalente às mensalidades restantes até o completar do prazo mínimo, ou a critério da CONTRATADA, valor proporcional a ser negociado entre as partes.
3. Encerrado o contrato, a CONTRATADA cessará a manutenção ativa, permanecendo as soluções em funcionamento até a data de encerramento acordada, sem prejuízo do acesso da CONTRATANTE aos seus próprios dados operacionais.
CLÁUSULA 6 — RESPONSABILIDADES DAS PARTES
1. Cabe à CONTRATANTE: designar um ponto focal para comunicação contínua com a Nova Era AI; comunicar tempestivamente mudanças na operação que possam impactar o funcionamento das soluções; e manter em dia o pagamento da mensalidade.
2. Cabe à CONTRATADA: prestar os serviços de manutenção e evolução descritos na Cláusula 2 com qualidade e prazo compatíveis com a natureza continuada do serviço; comunicar proativamente qualquer impedimento técnico ou risco operacional com antecedência mínima de 48 (quarenta e oito) horas; e manter sigilo absoluto sobre as informações operacionais, financeiras e comerciais da CONTRATANTE.
CLÁUSULA 7 — CONFIDENCIALIDADE E PROTEÇÃO DE DADOS
1. Ambas as partes comprometem-se a manter sigilo sobre todas as informações trocadas no âmbito da execução deste contrato, incluindo dados operacionais, comerciais e estratégicos da CONTRATANTE.
2. O tratamento de dados pessoais dos clientes da Auto Marcas seguirá as disposições da Lei nº 13.709/2018 (LGPD), permanecendo a CONTRATADA responsável pelo tratamento técnico dos dados no âmbito das soluções operadas, e a CONTRATANTE responsável pela coleta e pela finalidade do uso desses dados junto aos seus clientes.
CLÁUSULA 8 — FORO E RESOLUÇÃO DE CONFLITOS
1. As partes elegem o foro da comarca de Uberlândia, MG, para dirimir quaisquer controvérsias decorrentes deste contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
2. Antes de qualquer medida judicial, as partes comprometem-se a buscar a resolução amigável do conflito, mediante comunicação formal, com prazo de resposta de até 10 (dez) dias úteis.
E, por estarem assim justas e contratadas, as partes assinam o presente instrumento, em vias de igual teor, para que produza seus efeitos legais.
Uberlândia, 29 de julho de 2026.
CONTRATANTE
Jeane — Auto Marcas
CONTRATADA
Representante Legal — Nova Era AI
Este contrato complementa e integra o Contrato de Implementação Ref. NEA-2025-AUTOMARCAS. Documento de uso exclusivo e confidencial entre as partes.
```
