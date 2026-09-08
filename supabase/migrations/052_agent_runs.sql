-- ============================================================
-- Agentes — execução: operações, conversa e artefatos
--
-- Uma operação (agent_run) é o trabalho de UM agente para UM cliente.
-- É também o escopo da memória: cada cliente é uma conversa nova,
-- começando do zero de propósito. Memória global vazaria contexto de um
-- cliente para outro e quebraria o isolamento que o desenho protege.
--
-- O artefato guarda as versões de conhecimento e de prompt que estavam
-- valendo quando ele foi gerado. É o que permite responder depois
-- "por que esse diagnóstico saiu raso?" olhando o que o agente lia na
-- época — sem isso, calibrar vira opinião.
--
-- Aditivo. Depende da migration 051.
-- ============================================================

CREATE TABLE IF NOT EXISTS agent_runs (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id       UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  agent_id     UUID NOT NULL REFERENCES agents ON DELETE CASCADE,
  lead_id      UUID REFERENCES leads ON DELETE SET NULL,
  company_id   UUID REFERENCES companies ON DELETE SET NULL,
  title        TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'em_andamento'
               CHECK (status IN ('em_andamento','concluida','arquivada')),
  current_phase TEXT,
  created_by   UUID REFERENCES users,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_runs_org   ON agent_runs(org_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_runs_agent ON agent_runs(agent_id);

-- ── Conversa ──────────────────────────────────────────────────
-- Dois tipos de turno convivem aqui: conversa livre (o sócio pergunta,
-- discorda, corrige) e execução de fase. O segundo é disparado por ação
-- explícita, não por pedido ao modelo — é assim que a parada de fase
-- deixa de depender de obediência.
CREATE TABLE IF NOT EXISTS agent_messages (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id      UUID NOT NULL REFERENCES agent_runs ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content     TEXT NOT NULL,
  phase_code  TEXT,                      -- nulo = conversa, preenchido = execução de fase
  is_phase_run BOOLEAN NOT NULL DEFAULT false,
  input_tokens  INT,
  output_tokens INT,
  cache_read_tokens INT,
  author_id   UUID REFERENCES users,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_messages_run ON agent_messages(run_id, created_at);

-- ── Artefatos ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_artifacts (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id        UUID NOT NULL REFERENCES agent_runs ON DELETE CASCADE,
  kind          TEXT NOT NULL,            -- A1, A2, A3, A4, A5, D1, D2
  version       INT  NOT NULL DEFAULT 1,
  phase_code    TEXT,
  content_md    TEXT,                     -- o artefato como texto
  content_json  JSONB,                    -- quando houver schema
  status        TEXT NOT NULL DEFAULT 'rascunho'
                CHECK (status IN ('rascunho','validado','substituido')),
  validated_by  UUID REFERENCES users,
  validated_at  TIMESTAMPTZ,
  -- rastreabilidade: o que o agente estava lendo quando gerou isto
  kb_versions   JSONB NOT NULL DEFAULT '{}'::jsonb,
  model         TEXT,
  effort        TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_artifacts_run ON agent_artifacts(run_id, kind, version DESC);

-- Só um artefato validado por tipo em cada operação — o gate seguinte
-- precisa saber qual é "o" A1, sem ambiguidade.
CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_artifacts_validated
  ON agent_artifacts(run_id, kind) WHERE status = 'validado';

-- ── Correções ─────────────────────────────────────────────────
-- O log de correções, com o ciclo fechado: em vez de alimentar uma
-- revisão manual de prompt, alimenta o agente. A classificação é
-- proposta pelo sistema e SEMPRE confirmada por gente — classificar como
-- permanente o que era pontual contamina todos os clientes seguintes,
-- em silêncio.
CREATE TABLE IF NOT EXISTS agent_corrections (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id         UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  run_id         UUID REFERENCES agent_runs ON DELETE SET NULL,
  artifact_id    UUID REFERENCES agent_artifacts ON DELETE SET NULL,
  agent_id       UUID NOT NULL REFERENCES agents ON DELETE CASCADE,
  phase_code     TEXT,
  content        TEXT NOT NULL,
  -- taxonomia da Nova Era, do log de correções do documento de setup
  classification TEXT CHECK (classification IN
                   ('fato_errado','achado_fraco','arquitetura_inadequada',
                    'custo','preco','tom','clareza')),
  resolution     TEXT CHECK (resolution IN ('pontual','regra','conhecimento')),
  resolved_rule_id  UUID REFERENCES agent_rules ON DELETE SET NULL,
  resolved_block_id UUID REFERENCES knowledge_blocks ON DELETE SET NULL,
  author_id      UUID REFERENCES users,
  confirmed_by   UUID REFERENCES users,
  confirmed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_corrections_agent ON agent_corrections(agent_id, created_at DESC);

-- ── updated_at ────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_agent_runs_updated_at ON agent_runs;
CREATE TRIGGER trg_agent_runs_updated_at BEFORE UPDATE ON agent_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_agent_artifacts_updated_at ON agent_artifacts;
CREATE TRIGGER trg_agent_artifacts_updated_at BEFORE UPDATE ON agent_artifacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS ───────────────────────────────────────────────────────
-- Operação é trabalho comercial: quem tem acesso à organização opera.
-- A restrição de escrita a admin vale para o CONHECIMENTO, não para o uso.
ALTER TABLE agent_runs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_messages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_artifacts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_corrections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS agent_runs_org ON agent_runs;
CREATE POLICY agent_runs_org ON agent_runs FOR ALL
  USING (org_id = get_user_org_id())
  WITH CHECK (org_id = get_user_org_id());

DROP POLICY IF EXISTS agent_messages_org ON agent_messages;
CREATE POLICY agent_messages_org ON agent_messages FOR ALL
  USING (run_id IN (SELECT id FROM agent_runs WHERE org_id = get_user_org_id()))
  WITH CHECK (run_id IN (SELECT id FROM agent_runs WHERE org_id = get_user_org_id()));

DROP POLICY IF EXISTS agent_artifacts_org ON agent_artifacts;
CREATE POLICY agent_artifacts_org ON agent_artifacts FOR ALL
  USING (run_id IN (SELECT id FROM agent_runs WHERE org_id = get_user_org_id()))
  WITH CHECK (run_id IN (SELECT id FROM agent_runs WHERE org_id = get_user_org_id()));

DROP POLICY IF EXISTS agent_corrections_org ON agent_corrections;
CREATE POLICY agent_corrections_org ON agent_corrections FOR ALL
  USING (org_id = get_user_org_id())
  WITH CHECK (org_id = get_user_org_id());
