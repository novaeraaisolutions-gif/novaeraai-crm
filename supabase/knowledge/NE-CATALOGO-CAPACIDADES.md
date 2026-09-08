# NE-CATALOGO-CAPACIDADES
**Base de conhecimento · Assistente de Arquitetura · v0.5 · agosto/2026**

> ⚠️ **Este arquivo está incompleto e o assistente precisa saber disso.**
> As capacidades abaixo foram extraídas de soluções que a Nova Era efetivamente desenhou e propôs a clientes. O que **não** existe aqui é o esforço real em dias-dev e o comportamento em produção — nenhum documento de cliente traz isso.
> **Enquanto o campo Esforço estiver `[FALTA]`, toda estimativa do assistente sai marcada como "estimativa sem catálogo — validar com o sócio".** Não invente dias-dev.

---

## Como ler este arquivo

Cada capacidade traz o que faz, onde já foi aplicada e — o campo mais importante — **do que ela depende**. É esse campo que impede o assistente descrever como automático algo que exige aprovação de terceiro, conta verificada ou volume que o plano não aguenta.

---

## CAMADA 02 · INGESTÃO

### OCR de documentos com preenchimento automático
Leitura de CNH, RG, CPF, CTPS e comprovante de endereço, preenchendo cadastro sem digitação. Validação de CPF, endereço por CEP.
**Aplicado em:** D'Paulla (N1).
**Depende de:** nada externo — construção interna. É o que permite entregar rápido.
**Refinamento observado:** na CTPS, somar períodos e apontar lacunas de vínculo — *"que é onde a tese costuma se decidir"*. O valor não está no OCR, está no que se faz com o texto extraído.
**Esforço:** `[FALTA]`

### Transcrição de áudio com estruturação
Áudio de reunião ou atendimento vira ficha estruturada com campos definidos pelo domínio, cada campo ligado ao minuto exato da gravação.
**Aplicado em:** D'Paulla (N1).
**Depende de:** modelo de linguagem — custo por uso proporcional ao volume.
**Esforço:** `[FALTA]`

### Importação de base legada
Migração estruturada com conferência e período de operação em paralelo.
**Aplicado em:** D'Paulla (N2).
**Depende de:** o que o sistema atual do cliente exporta. **Precisa ser fase com dono, nunca detalhe.**
**Esforço:** `[FALTA]`

### Conectores de dado público
**DJEN (CNJ)** — publicações centralizadas, consulta por OAB, nome de parte ou nº de processo. Sem custo de licença.
**DataJud (CNJ)** — capas e movimentos processuais, todas as instâncias, restrição para sigilosos. **Não serve para buscar processo por CPF.**
**Depende de:** disponibilidade e mudança de contrato de dados do CNJ. Mitigar com camada de conectores isolada e alternativa comercial mapeada.
**Esforço:** `[FALTA]`

### Provedores comerciais de dado processual
Busca e monitoramento por CPF/CNPJ (Judit, Escavador, Jusbrasil, Digesto e similares).
**Depende de:** contrato comercial. **Custo variável por consulta e por CPF monitorado.**
**Regra obrigatória:** nasce com governança de custo — cota, cache com validade, score de prioridade, painel de consumo. É tipicamente o único item de custo variável proporcional ao volume de um projeto, e o principal risco financeiro dele.
**Esforço:** `[FALTA]`

---

## CAMADA 03 · INTELIGÊNCIA

### Agente de atendimento externo em mensageria
Identifica quem fala pelo telefone, responde a partir do que está registrado no sistema, em linguagem comum; atualiza proativamente; cobra pendência; escalona para humano com histórico junto.
**Aplicado em:** D'Paulla (agentes Jurídico e Comercial), Click Lazer (Cléo).
**Depende de:** número dedicado e infraestrutura de conexão (Evolution API nos projetos observados). **Risco de bloqueio por comportamento de envio** — mitigar com aquecimento, volume controlado e conteúdo estritamente transacional ao próprio cliente.
**Trava obrigatória:** o agente não deve *ser instruído* a evitar assuntos — ele não deve *alcançá-los*. Segregação por arquitetura.
**Esforço:** `[FALTA]`

### Agente interno por mensageria
Consulta para quem está fora do escritório: compromissos da semana, ficha de um cliente, status, documentos de um caso.
**Aplicado em:** D'Paulla (N2).
**Esforço:** `[FALTA]`

### Classificador com sugestão e confirmação humana
Lê um documento de entrada, classifica, calcula consequência (prazo, providência, responsável) e cria tarefa **em estado pendente**.
**Aplicado em:** D'Paulla (motor de prazos, N2).
**Regra inegociável:** onde o erro é irreversível, IA sugere e humano confirma, com registro de quem confirmou e quando.
**Esforço:** `[FALTA]`

### Tradutor de linguagem técnica
Duas versões do mesmo conteúdo: técnica para a equipe, clara para o cliente.
**Aplicado em:** D'Paulla (N2).
**Esforço:** `[FALTA]`

### Agentes de vigilância operacional
Captura passiva de informação em conversas, detecção de risco de conta (ex.: reunião adiada duas vezes), higiene de dados.
**Aplicado em:** Ginga.
**Esforço:** `[FALTA]`

### Detector de oportunidade não registrada
Lê o atendimento inteiro e sinaliza pretensão mencionada de passagem que o atendente não registrou.
**Aplicado em:** D'Paulla.
**Por que importa:** é receita nova sobre cliente cujo custo de aquisição já foi pago.
**Esforço:** `[FALTA]`

### Cadastro conversacional
Fotos e áudio em mensageria viram cadastro completo, submetido à aprovação de quem o forneceu.
**Aplicado em:** Click Lazer.
**Resolve:** barreira de entrada em marketplace de dois lados.
**Esforço:** `[FALTA]`

---

## CAMADA 04 · OPERAÇÃO

### Cadastro unificado pessoa + objeto de trabalho
Nasce completo, sem redigitação, alimentando tudo o que vem depois.
**Esforço:** `[FALTA]`

### Gerador de documentos a partir do cadastro
Peças de entrada derivadas do dado já existente, nos modelos do cliente.
**Aplicado em:** D'Paulla (procuração, contrato de honorários, declaração de hipossuficiência, termo de consentimento, checklist).
**Por que importa:** costuma ser o ganho mais barato e mais visível do projeto inteiro, com retorno percebido pela equipe já na primeira semana. **Sempre avaliar se cabe no nível enxuto.**
**Esforço:** `[FALTA]`

### Central de documentos
Versionamento, busca, checklist de pendências por tipo, permissão por perfil, log de acesso.
**Esforço:** `[FALTA]`

### Agenda com alertas em cascata
Cálculo de termo final em dias úteis considerando feriados, responsável obrigatório, alertas D-10 / D-5 / D-2 / D-1 e no dia.
**Refinamento:** item sem responsável designado sobe ao topo da tela da direção.
**Esforço:** `[FALTA]`

### Lista de trabalho com situação interna
Coluna de situação que mostra o andamento dentro da casa — e sinaliza sozinha item parado ou sem responsável.
**Esforço:** `[FALTA]`

### Módulo financeiro
Contrato, parcelamento, recebimentos, inadimplência, êxito, e os instrumentos específicos do setor (alvarás e RPV no jurídico; comissionamento e prestação de contas em agência).
**Esforço:** `[FALTA]`

### Comissionamento com regra versionada
Regra com vigência declarada e apuração que trava após aprovação — ajuste só por estorno registrado.
**Aplicado em:** Ginga.
**Esforço:** `[FALTA]`

### Pipelines múltiplos
Cada natureza de receita com estágios próprios.
**Aplicado em:** Ginga.
**Esforço:** `[FALTA]`

### Motor de disponibilidade
Bloco de uso e intervalo de virada em vez de diária. Exclusividade garantida na base de dados, não por processo.
**Aplicado em:** Click Lazer.
**Esforço:** `[FALTA]`

### Motor de cálculo parametrizado
Regra de negócio em base editável e versionada com data de vigência, fonte e autor — nunca no código. Rastreabilidade da conclusão até o parâmetro.
**Aplicado em:** Valens (simulação tributária multi-regime 2026–2033).
**Aplica quando:** o ativo do cliente é um método que hoje vive em planilha ou na cabeça de alguém.
**Esforço:** `[FALTA]`

---

## CAMADA 05 · INTERFACE EXTERNA

### Portal do cliente final
Acompanhamento, documentos e situação financeira em área web própria.
**Esforço:** `[FALTA]`

### Aplicação web responsiva
**Stack observado:** Next.js / React.
**Esforço:** `[FALTA]`

### Pagamento com custódia e repasse
Sinal e saldo, parcelamento, retenção até depois da entrega, repasse com extrato.
**Aplicado em:** Click Lazer.
**Depende de:** **parceiro de pagamento licenciado.** Reter dinheiro de terceiros envolve obrigações regulatórias que recaem sobre o cliente, não sobre a Nova Era. A escolha precisa ser feita cedo para não travar a construção.
**Esforço:** `[FALTA]`

### Contrato com assinatura eletrônica
Geração a partir de template por modalidade, assinatura pelas partes, registro de integridade.
**Depende de:** provedor de assinatura. **Validação jurídica do template é do cliente.**
**Esforço:** `[FALTA]`

### Verificação de identidade e antifraude
Documento com selfie, comprovação de vínculo com o bem, detecção de padrão suspeito, suspensão automática com revisão humana.
**Esforço:** `[FALTA]`

---

## CAMADA 06 · GOVERNANÇA

Transversal, entregue desde o Nível 1. Perfis de acesso, mascaramento de campo por papel, trilha de auditoria, isolamento por linha no banco, criptografia, política de retenção, log de acesso a documento, consentimento e base legal por titular, painel de consumo de consultas externas.

**Formulação usada com cliente:** *"num escritório de advocacia isso não é assunto de TI, é responsabilidade profissional."* Adapte ao setor, mas nunca trate governança como item técnico opcional.
**Esforço:** `[FALTA]`

---

## STACK OBSERVADO

| Camada | Tecnologia citada em documento |
|---|---|
| Dados | PostgreSQL / Supabase |
| Ingestão | OCR + STT + conectores |
| Inteligência | Python + Claude API |
| Operação | Next.js / React |
| Interface externa | Evolution API (WhatsApp) |

`[FALTA]` — confirmar se este é o stack padrão ou se variou por projeto.

---

## O QUE A NOVA ERA NÃO FAZ

Declarado em documento de cliente:
- Operação comercial e captação em campo
- Gestão de mídia e campanhas
- Atendimento humano do dia a dia
- Serviços jurídicos e contábeis — *"não somos nem substituímos nenhum dos dois"*
- Licenciamento e credenciamento financeiro
- Produção de conteúdo (fotografia, criação)

---

## LACUNAS CRÍTICAS DESTE ARQUIVO

1. **Esforço real em dias-dev de cada capacidade.** Sem isso o Assistente de Arquitetura estima no escuro e o de Custos não tem base de implementação.
2. **O que já quebrou em produção**, e em qual capacidade.
3. **O que parece simples e não é** — e o inverso.
4. **Capacidades que existem e não aparecem em nenhum documento de cliente.**
5. **Confirmação do stack padrão.**
