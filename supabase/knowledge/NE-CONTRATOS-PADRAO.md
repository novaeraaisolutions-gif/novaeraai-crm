# NE-CONTRATOS-PADRÃO — Estrutura de cláusulas e boilerplate

Material de consulta: a estrutura de cláusulas e os textos-base que o
assistente reutiliza ao gerar contratos. Este arquivo é o **o quê**; as
regras de comportamento são as instruções do agente.

Extraído de `2_Referencia_Padrao_e_Boilerplate_NovaEraAI` e conferido
contra os três contratos assinados.

## Dados fixos da Contratada

**Nova Era AI** · CNPJ **40.644.314/0001-41** · Uberlândia — Minas Gerais
Representante: **Gustavo Henrique de Vasconcelos e Silva** (CEO).

CNPJ confirmado pela diretoria em 11/09/2026.

**Atenção:** os três contratos-modelo (Trietel, Áurea, Auto Marcas) trazem
o CNPJ `59.305.580/0001-78`. Ao reaproveitar texto desses modelos, **nunca
copie o CNPJ deles** — use sempre o desta seção.

`[FALTA]` Grafia oficial única. Os modelos alternam entre "NovaEra AI"
(29 ocorrências), "Nova Era AI" (23) e "Nova Era". O padrão adotado aqui é
**Nova Era AI**, com espaço.

## Os dois tipos de contrato

**TIPO A — Desenvolvimento / Implementação.** Cliente novo. Cobre o
desenvolvimento do sistema, o prazo de entrega, o pagamento da
implementação, o período de garantia/testes e a transição para a
mensalidade recorrente. Modelos: Trietel 2026 e Áurea Imóveis 2026.

**TIPO B — Mensalidade (Serviços Continuados / Plano Core).** Cliente que
já implementou e está migrando para manutenção e uso recorrente. Mais
enxuto, e **sempre** referencia o contrato de implementação anterior.
Modelo: Mensalidade Auto Marcas.

Nunca misture os dois num único documento. Se não estiver claro qual o
usuário quer, pergunte antes de gerar.

## Estrutura padrão — Tipo A (Implementação)

1. **Cabeçalho** — Nova Era AI, título, quadro com CONTRATANTE (razão
   social, CNPJ, representante, cidade) e CONTRATADA, número do contrato,
   data de emissão, vigência.
2. **Preâmbulo** — referência à proposta comercial de origem e declaração
   de aceite das partes.
3. **Cláusula 1 — Objeto do Contrato** — identificação das partes (1.1) e
   escopo completo (1.2), módulo por módulo, no formato
   `◆ Módulo N — Nome: descrição funcional detalhada`, com bullets
   operacionais específicos. O nível de detalhe do Trietel é a referência.
4. **Cláusula 2 — Prazo de Desenvolvimento e Entrega** — prazo total,
   cronograma por etapa, e o que a entrega inclui: sistema em produção,
   configuração inicial, onboarding, sessão de validação e aceite formal.
5. **Cláusula 3 — Valor e Condições de Pagamento (Implementação)** —
   valor total, parcelas, forma de pagamento, emissão de NF.
6. **Cláusula 4 — Treinamento / Onboarding** — só se o escopo envolver
   workshops de treinamento ou calibração de agente.
7. **Cláusula 5 — Garantia e Período de Teste** — dias de teste, devolução
   integral, prazo para reembolso.
8. **Cláusula 6 — Custos Recorrentes e Mensalidade** — os dois
   componentes, regra de início da cobrança, tabela de projeção se houver
   dados.
9. **Cláusula 7 — Plano Core: Suporte, Manutenção e SLA.**
10. **Cláusula 8 — Propriedade Intelectual e Exclusividade.**
11. **Cláusula 9 — Confidencialidade e Propriedade de Dados.**
12. **Cláusulas 10 e 11 — Obrigações da Contratada / da Contratante** —
    as específicas do escopo mais as padrão.
13. **Cláusula 12 — Limitação de Responsabilidade.**
14. **Cláusula 13 — Rescisão** — justa causa de cada parte, e rescisão
    imotivada da mensalidade com aviso de 30 dias, sem multa após o prazo
    mínimo.
15. **Cláusula 14 — Disposições Gerais** — integralidade, alteração só por
    aditivo escrito, canais de comunicação, foro.
16. **Bloco de assinaturas** — cidade e data em branco, CONTRATANTE (nome,
    CPF, cargo), CONTRATADA (representante, CEO, CPF/CNPJ). Testemunhas
    quando o valor for relevante (acima de ~R$ 5.000) ou a pedido.
17. **Anexo I — Resumo da Proposta Comercial** — tabela com valor,
    parcelas, mensalidade, garantia, prazo, SLA e foro. **Sempre** no
    Tipo A.

## Estrutura padrão — Tipo B (Mensalidade)

1. **Cabeçalho** — título "Contrato de Prestação de Serviços Continuados —
   Mensalidade de Parceria Tecnológica — [Cliente]", quadro
   CONTRATANTE/CONTRATADA, município e foro, nº de referência no formato
   `NEA-[ANO]-[CLIENTE]-MENS · v1.0`.
2. **Preâmbulo** — referencia a proposta e **o contrato de implementação
   anterior**, pelo número, afirmando continuidade.
3. **Cláusula 1 — Objeto** — soluções já implementadas que seguem
   mantidas, confirmação do fim do período de testes, continuidade.
4. **Cláusula 2 — Escopo dos Serviços Mensais (Plano Core)** — taxonomia
   de manutenção e SLA.
5. **Cláusula 3 — Valor e Forma de Pagamento** — valor mensal, o que
   cobre, início da cobrança, dia de vencimento fixo, forma de pagamento,
   consequência do atraso, encargos, reajuste anual pelo IPCA a partir do
   13º mês.
6. **Cláusula 4 — Vigência e Renovação** — prazo mínimo (padrão 6 meses),
   renovação automática, cancelamento após o mínimo com aviso de 30 dias
   sem multa.
7. **Cláusula 5 — Rescisão** — hipóteses de rescisão antecipada, multa
   (mensalidades restantes ou proporcional negociado), continuidade de
   acesso aos dados após o encerramento.
8. **Cláusula 6 — Responsabilidades das Partes** — versão resumida.
9. **Cláusula 7 — Confidencialidade e Proteção de Dados** — com LGPD.
10. **Cláusula 8 — Foro e Resolução de Conflitos.**
11. **Bloco de assinaturas** — sem testemunhas, salvo pedido.
12. **Rodapé** em itálico, confirmando que este contrato complementa e
    integra o contrato de implementação de referência, e que é documento
    confidencial de uso exclusivo entre as partes.

## Campos variáveis

**Obrigatórios — nunca invente, pergunte:** tipo de contrato · razão
social e CNPJ do cliente · representante legal e CPF · cidade/UF · escopo
(módulos e funcionalidades) · valor total · forma de pagamento.

**Opcionais — use o padrão da casa e sinalize no fechamento:**

| Campo | Padrão da casa |
|---|---|
| Prazo de entrega (Tipo A) | 28 a 45 dias corridos |
| Garantia / período de teste | 7 dias para escopos menores; 30 dias para escopos operacionais maiores |
| Manutenções adaptativas | 3 por mês, até 1h cada |
| Vigência mínima da mensalidade | 6 meses |
| Foro | Comarca de Uberlândia — MG |
| Testemunhas | Quando o valor for relevante (acima de ~R$ 5.000) ou a pedido |

## Formas de pagamento da implementação (Tipo A)

- **À vista / quitação antecipada:** 5% de desconto, via Pix, boleto ou
  transferência.
- **Boleto parcelado** (padrão sugerido): parcelas iguais, sem juros,
  primeira na assinatura ou em até 3 dias úteis, NFS-e por parcela.
- **Cartão de crédito:** parcelamento via link de pagamento, juros da
  operadora a partir da 2ª parcela, início após confirmação (até 24h).

## Estrutura da mensalidade

Dois componentes, nos dois tipos de contrato:

1. **Componente fixo Nova Era AI** — suporte técnico, manutenção corretiva
   e adaptativa dentro do limite, reunião mensal e relatório mensal de
   performance.
2. **Componente variável (repasse de infraestrutura e tokens)** —
   repassado ao valor **exato** cobrado pelos fornecedores (VPS, banco de
   dados, domínio/SSL, tokens de IA), **sem margem adicional**, comprovado
   mensalmente com fatura ou recibo original. O cliente tem direito de
   auditar.

## Taxonomia de manutenção — Plano Core

Toda solicitação é classificada em uma das quatro categorias **antes** de
iniciar a execução:

1. **Corretiva** — correção de bug ou falha de algo que já funcionava
   conforme acordado. Coberta integralmente, sem limite.
2. **Adaptativa** — ajuste de comportamento, tom ou fluxo de
   funcionalidade já existente. Calibração, não expansão. Incluída até
   3 por mês, até 1h cada; o excedente vira aditiva.
3. **Aditiva** — nova funcionalidade, fluxo ou integração fora do escopo
   original. Cobrada à parte, sempre orçada e aprovada antes da execução.
4. **Evolutiva** — reengenharia por mudança significativa do negócio do
   cliente. Tratada como novo projeto; a mensalidade vigente cobre o
   sistema atual até a migração.

**Critério decisivo:** a funcionalidade já existe e o cliente quer que
funcione diferente → **adaptativa**. A funcionalidade não existe e precisa
ser construída → **aditiva**.

## SLA padrão

| Severidade | Prazo |
|---|---|
| Crítica (impede o uso normal) | 4 horas |
| Normal / Alta (impacto parcial) | 24 horas |
| Baixa (cosmético) | Próxima sprint semanal |

Use a versão de quatro níveis — crítico 4h, alto 24h, médio 72h, baixo na
próxima sprint — apenas para escopos grandes, como um ERP completo, ou se
for pedido.

## Propriedade intelectual e exclusividade

O software desenvolvido — código-fonte, arquitetura, fluxos de IA,
metodologia, documentação — é e permanece propriedade intelectual
exclusiva da Nova Era AI, não constituindo objeto de cessão. O cliente
adquire direito de uso enquanto vigente o contrato de mensalidade; o
encerramento cessa esse direito, ressalvada a exportação de dados.

A Nova Era AI se compromete a **NÃO**: revender, licenciar ou transferir o
sistema deste cliente a outro; reaproveitá-lo como produto padrão ou
template para terceiros; criar para outro cliente um sistema fielmente
idêntico.

A Nova Era AI **mantém o direito de**: prestar serviços a outras empresas
do mesmo setor, incluindo concorrentes; desenvolver soluções
personalizadas com diagnóstico próprio e independente; criar sistemas com
funcionalidades semelhantes, desde que sejam trabalho autoral e
diagnóstico específico, não reprodução fiel.

## Propriedade e confidencialidade de dados

Todos os dados gerados pela operação do cliente no sistema são de
propriedade exclusiva do cliente. A Nova Era AI atua como operadora e
processadora, sem direito de propriedade, e não usa os dados para outra
finalidade. Em rescisão, exportação completa em formato aberto (CSV/JSON),
sem custo, em 10 a 15 dias úteis.

**LGPD (Lei nº 13.709/2018):** a Nova Era AI é responsável pelo tratamento
técnico; o cliente é responsável pela coleta e pela finalidade junto aos
seus próprios clientes.

Confidencialidade mútua, mínimo de 2 anos após o encerramento. Use "prazo
indeterminado" apenas se confirmado como condição negociada.

## Limitação de responsabilidade

A Nova Era AI não se responsabiliza por resultados comerciais específicos
(vendas, receita) nem por indisponibilidade de serviços de terceiros
(WhatsApp/Meta, nuvem, operadoras), desde que adote mitigação razoável.

Responsabilidade máxima por danos diretos: o valor pago nos 3 meses
anteriores ao evento.

## Disposições gerais e foro

Acordo integral entre as partes. Alteração de escopo, prazo ou condição
financeira só por aditivo assinado. Comunicação formal por e-mail ou
WhatsApp, com confirmação. Divergências resolvidas primeiro em comum
acordo, em até 10 dias úteis; sem acordo, foro da **Comarca de Uberlândia
— MG**, com renúncia a qualquer outro.

## Encargos por atraso

Vale para o Tipo B e para as mensalidades do Tipo A.

Multa moratória de 2%, uma única vez. Juros de mora de 1% ao mês, pro rata
die. Correção pelo IPCA acumulado. Atraso superior a 10 dias corridos,
após notificação de 5 dias, autoriza a suspensão da manutenção — mantendo
o funcionamento técnico já implementado.

## Nível de detalhe esperado num módulo de escopo

```
◆ Módulo 1 — Agente de Atendimento via WhatsApp: IA conversacional que
recebe o cliente 24/7, identifica a intenção, consulta a base de
conhecimento (RAG) e conduz até a qualificação ou a transferência para
um humano.

- Identificação automática do contato e histórico de conversas anteriores
- Resposta com base na base de conhecimento treinada (site e documentos
  do cliente)
- Escalonamento automático para atendente humano em casos fora do escopo
  do agente
- Registro de cada conversa no CRM com tag de qualificação
```

Este é o nível operacional exigido. Nunca frases genéricas como
"atendimento via IA" sem explicar o fluxo.
