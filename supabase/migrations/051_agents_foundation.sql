-- ============================================================
-- Agentes de IA no CRM — fundação e conhecimento
--
-- Migra o sistema de três assistentes que hoje vive em Projetos do
-- Claude para dentro do CRM. O ganho não é conveniência: quatro coisas
-- que hoje dependem de disciplina passam a depender de estrutura.
--
--  1. Isolamento (princípio P6). O agente de Diagnóstico não pode ver
--     catálogo, custos nem comercial — senão um achado entra porque
--     "bate" com o que a Nova Era sabe vender, não porque é real.
--     Aqui isso vira agent_knowledge: sem linha, sem acesso. Não existe
--     prompt que contorne a ausência de um vínculo.
--
--  2. Paradas de fase. Hoje é instrução que o modelo cede mais cedo ou
--     mais tarde. Aqui a instrução da fase seguinte só entra na
--     requisição quando o artefato anterior está validado — a parada
--     deixa de depender de obediência.
--
--  3. Conhecimento vivo. Sai do arquivo e vira bloco editável pela
--     diretoria, versionado, com autor e data. Nada é sobrescrito.
--
--  4. Fases como DADO, não como código. Adicionar o agente de Contrato
--     depois é inserir linhas.
--
-- Tudo aditivo: nenhuma tabela existente é tocada.
-- ============================================================

-- ── Agentes ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agents (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id        UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  slug          TEXT NOT NULL,
  name          TEXT NOT NULL,
  tagline       TEXT,                      -- uma linha, para o cartão
  description   TEXT,                      -- o que faz, em um parágrafo
  never_does    TEXT,                      -- o que NUNCA faz — parte da definição
  system_prompt TEXT NOT NULL DEFAULT '',  -- identidade e conduta (o que não é de fase)
  model         TEXT NOT NULL DEFAULT 'claude-opus-5',
  accent        TEXT NOT NULL DEFAULT '#17A3E8',
  position      INT  NOT NULL DEFAULT 0,
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE (org_id, slug)
);

-- ── Fases ─────────────────────────────────────────────────────
-- O gate mora aqui: requires_artifacts diz o que precisa estar
-- validado antes desta fase poder rodar.
CREATE TABLE IF NOT EXISTS agent_phases (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id           UUID NOT NULL REFERENCES agents ON DELETE CASCADE,
  code               TEXT NOT NULL,                    -- 'A', 'B', 'C1', 'G'...
  name               TEXT NOT NULL,
  description        TEXT,
  instruction        TEXT NOT NULL,                    -- o que só vale nesta fase
  effort             TEXT NOT NULL DEFAULT 'high'
                     CHECK (effort IN ('low','medium','high','xhigh','max')),
  produces_artifact  TEXT,                             -- 'A1', 'A2', 'D1'...
  requires_artifacts TEXT[] NOT NULL DEFAULT '{}',     -- o gate
  output_schema      JSONB,
  position           INT NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now(),
  UNIQUE (agent_id, code)
);

CREATE INDEX IF NOT EXISTS idx_agent_phases_agent ON agent_phases(agent_id, position);

-- ── Bases de conhecimento ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS knowledge_bases (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id      UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  slug        TEXT NOT NULL,                -- NE-METODO-DIAGNOSTICO
  name        TEXT NOT NULL,
  description TEXT,
  position    INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (org_id, slug)
);

-- ── Blocos ────────────────────────────────────────────────────
-- Bloco, não arquivo. É o que a diretoria edita, e é o que permite
-- ligar seleção por trecho no futuro sem refazer nada: hoje todos os
-- blocos entram inteiros; quando a base crescer, always_active continua
-- entrando e o resto passa a ser escolhido.
CREATE TABLE IF NOT EXISTS knowledge_blocks (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kb_id         UUID NOT NULL REFERENCES knowledge_bases ON DELETE CASCADE,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  position      INT NOT NULL DEFAULT 0,
  always_active BOOLEAN NOT NULL DEFAULT true,
  tags          TEXT[] NOT NULL DEFAULT '{}',
  version       INT NOT NULL DEFAULT 1,
  updated_by    UUID REFERENCES users,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_blocks_kb ON knowledge_blocks(kb_id, position);

-- ── Histórico de blocos ───────────────────────────────────────
-- Nada é sobrescrito. Toda edição gera versão com autor e data — é o
-- que permite responder depois "o agente estava lendo qual versão?".
CREATE TABLE IF NOT EXISTS knowledge_block_versions (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  block_id   UUID NOT NULL REFERENCES knowledge_blocks ON DELETE CASCADE,
  version    INT NOT NULL,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  author_id  UUID REFERENCES users,
  note       TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (block_id, version)
);

-- ── Vínculo agente ↔ conhecimento (o isolamento P6) ───────────
CREATE TABLE IF NOT EXISTS agent_knowledge (
  agent_id UUID NOT NULL REFERENCES agents ON DELETE CASCADE,
  kb_id    UUID NOT NULL REFERENCES knowledge_bases ON DELETE CASCADE,
  PRIMARY KEY (agent_id, kb_id)
);

-- ── Regras ────────────────────────────────────────────────────
-- Correções que a diretoria promoveu a permanente. Entram no prompt
-- DEPOIS do conhecimento, o que mantém o cache do método intacto
-- quando uma regra muda.
CREATE TABLE IF NOT EXISTS agent_rules (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id   UUID NOT NULL REFERENCES agents ON DELETE CASCADE,
  phase_code TEXT,                          -- nulo = vale para todas as fases
  content    TEXT NOT NULL,
  active     BOOLEAN NOT NULL DEFAULT true,
  author_id  UUID REFERENCES users,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_rules_agent ON agent_rules(agent_id) WHERE active;

-- ── updated_at ────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_agents_updated_at ON agents;
CREATE TRIGGER trg_agents_updated_at BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_agent_phases_updated_at ON agent_phases;
CREATE TRIGGER trg_agent_phases_updated_at BEFORE UPDATE ON agent_phases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_knowledge_bases_updated_at ON knowledge_bases;
CREATE TRIGGER trg_knowledge_bases_updated_at BEFORE UPDATE ON knowledge_bases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_knowledge_blocks_updated_at ON knowledge_blocks;
CREATE TRIGGER trg_knowledge_blocks_updated_at BEFORE UPDATE ON knowledge_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_agent_rules_updated_at ON agent_rules;
CREATE TRIGGER trg_agent_rules_updated_at BEFORE UPDATE ON agent_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Versionamento automático dos blocos ───────────────────────
-- Guarda a versão ANTERIOR antes de sobrescrever, e incrementa o
-- contador. Feito no banco para valer em qualquer caminho de escrita.
CREATE OR REPLACE FUNCTION snapshot_knowledge_block()
RETURNS trigger AS $$
BEGIN
  IF NEW.title IS DISTINCT FROM OLD.title
     OR NEW.content IS DISTINCT FROM OLD.content THEN
    INSERT INTO knowledge_block_versions (block_id, version, title, content, author_id)
    VALUES (OLD.id, OLD.version, OLD.title, OLD.content, OLD.updated_by);
    NEW.version := OLD.version + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_snapshot_knowledge_block ON knowledge_blocks;
CREATE TRIGGER trg_snapshot_knowledge_block
  BEFORE UPDATE ON knowledge_blocks
  FOR EACH ROW EXECUTE FUNCTION snapshot_knowledge_block();

-- ── RLS ───────────────────────────────────────────────────────
-- Leitura por organização; escrita do CONHECIMENTO só para admin,
-- que hoje é a diretoria. Comercial e developer leem, não editam.
ALTER TABLE agents                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_phases             ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_bases          ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_blocks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_block_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_knowledge          ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_rules              ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_org_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

DROP POLICY IF EXISTS agents_read ON agents;
CREATE POLICY agents_read ON agents FOR SELECT
  USING (org_id = get_user_org_id());
DROP POLICY IF EXISTS agents_write ON agents;
CREATE POLICY agents_write ON agents FOR ALL
  USING (org_id = get_user_org_id() AND is_org_admin())
  WITH CHECK (org_id = get_user_org_id() AND is_org_admin());

DROP POLICY IF EXISTS agent_phases_read ON agent_phases;
CREATE POLICY agent_phases_read ON agent_phases FOR SELECT
  USING (agent_id IN (SELECT id FROM agents WHERE org_id = get_user_org_id()));
DROP POLICY IF EXISTS agent_phases_write ON agent_phases;
CREATE POLICY agent_phases_write ON agent_phases FOR ALL
  USING (is_org_admin() AND agent_id IN (SELECT id FROM agents WHERE org_id = get_user_org_id()))
  WITH CHECK (is_org_admin() AND agent_id IN (SELECT id FROM agents WHERE org_id = get_user_org_id()));

DROP POLICY IF EXISTS knowledge_bases_read ON knowledge_bases;
CREATE POLICY knowledge_bases_read ON knowledge_bases FOR SELECT
  USING (org_id = get_user_org_id());
DROP POLICY IF EXISTS knowledge_bases_write ON knowledge_bases;
CREATE POLICY knowledge_bases_write ON knowledge_bases FOR ALL
  USING (org_id = get_user_org_id() AND is_org_admin())
  WITH CHECK (org_id = get_user_org_id() AND is_org_admin());

DROP POLICY IF EXISTS knowledge_blocks_read ON knowledge_blocks;
CREATE POLICY knowledge_blocks_read ON knowledge_blocks FOR SELECT
  USING (kb_id IN (SELECT id FROM knowledge_bases WHERE org_id = get_user_org_id()));
DROP POLICY IF EXISTS knowledge_blocks_write ON knowledge_blocks;
CREATE POLICY knowledge_blocks_write ON knowledge_blocks FOR ALL
  USING (is_org_admin() AND kb_id IN (SELECT id FROM knowledge_bases WHERE org_id = get_user_org_id()))
  WITH CHECK (is_org_admin() AND kb_id IN (SELECT id FROM knowledge_bases WHERE org_id = get_user_org_id()));

DROP POLICY IF EXISTS knowledge_block_versions_read ON knowledge_block_versions;
CREATE POLICY knowledge_block_versions_read ON knowledge_block_versions FOR SELECT
  USING (block_id IN (
    SELECT b.id FROM knowledge_blocks b
    JOIN knowledge_bases k ON k.id = b.kb_id
    WHERE k.org_id = get_user_org_id()
  ));

DROP POLICY IF EXISTS agent_knowledge_read ON agent_knowledge;
CREATE POLICY agent_knowledge_read ON agent_knowledge FOR SELECT
  USING (agent_id IN (SELECT id FROM agents WHERE org_id = get_user_org_id()));
DROP POLICY IF EXISTS agent_knowledge_write ON agent_knowledge;
CREATE POLICY agent_knowledge_write ON agent_knowledge FOR ALL
  USING (is_org_admin() AND agent_id IN (SELECT id FROM agents WHERE org_id = get_user_org_id()))
  WITH CHECK (is_org_admin() AND agent_id IN (SELECT id FROM agents WHERE org_id = get_user_org_id()));

DROP POLICY IF EXISTS agent_rules_read ON agent_rules;
CREATE POLICY agent_rules_read ON agent_rules FOR SELECT
  USING (agent_id IN (SELECT id FROM agents WHERE org_id = get_user_org_id()));
DROP POLICY IF EXISTS agent_rules_write ON agent_rules;
CREATE POLICY agent_rules_write ON agent_rules FOR ALL
  USING (is_org_admin() AND agent_id IN (SELECT id FROM agents WHERE org_id = get_user_org_id()))
  WITH CHECK (is_org_admin() AND agent_id IN (SELECT id FROM agents WHERE org_id = get_user_org_id()));
