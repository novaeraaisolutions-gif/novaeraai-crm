-- ============================================================
-- Conhecimento por conversa
--
-- Navegar 67 blocos para achar o parágrafo certo é trabalho de arquivo,
-- não de diretoria. A curadoria passa a acontecer conversando com o
-- próprio agente: "o piso de mensalidade mudou para R$ 1.200" → ele lê o
-- que tem, propõe onde aquilo entra, e a diretoria confirma.
--
-- A confirmação continua obrigatória. Aplicar direto seria o mesmo que
-- deixar o modelo reescrever o próprio método sem ninguém olhando — e
-- classificar como permanente o que era pontual contamina todos os
-- clientes seguintes, em silêncio.
--
-- Uma conversa por agente, com memória: é a memória de curadoria daquele
-- agente, separada das operações de cliente.
--
-- Aditivo. Depende de 051 e 052.
-- ============================================================

CREATE TABLE IF NOT EXISTS agent_knowledge_messages (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id      UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  agent_id    UUID NOT NULL REFERENCES agents ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content     TEXT NOT NULL,

  -- Proposta estruturada, quando o agente sugere uma mudança.
  -- { tipo: 'editar_bloco'|'criar_bloco'|'criar_regra',
  --   block_id?, kb_slug?, titulo?, conteudo?, phase_code?, motivo }
  proposal    JSONB,
  status      TEXT NOT NULL DEFAULT 'sem_proposta'
              CHECK (status IN ('sem_proposta','pendente','aplicada','descartada')),

  applied_block_id UUID REFERENCES knowledge_blocks ON DELETE SET NULL,
  applied_rule_id  UUID REFERENCES agent_rules ON DELETE SET NULL,
  decided_by       UUID REFERENCES users,
  decided_at       TIMESTAMPTZ,

  author_id   UUID REFERENCES users,
  input_tokens  INT,
  output_tokens INT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_messages_agent
  ON agent_knowledge_messages(agent_id, created_at);

ALTER TABLE agent_knowledge_messages ENABLE ROW LEVEL SECURITY;

-- Curadoria é da diretoria. Ler também: uma conversa sobre o que o
-- agente sabe expõe o conhecimento inteiro, inclusive comercial e custos.
DROP POLICY IF EXISTS knowledge_messages_admin ON agent_knowledge_messages;
CREATE POLICY knowledge_messages_admin ON agent_knowledge_messages FOR ALL
  USING (org_id = get_user_org_id() AND is_org_admin())
  WITH CHECK (org_id = get_user_org_id() AND is_org_admin());
