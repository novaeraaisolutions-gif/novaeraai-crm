-- ────────────────────────────────────────────────────────────────────────────
-- Reestruturação completa da aba Projetos (V2)
--
-- Baseado no doc "Sistema de Controle - Estrutura da Aba Projetos":
--   - Nova frente: Intelligence (além de Labs/Advisory/Enterprise legados)
--   - Pipeline de status com 7 estágios (contrato_assinado → ... → churned)
--   - Plano contratado: Core / Evolução / Parceiro
--   - Campos de desenvolvimento (repo, arquitetura, code review, homolog)
--   - Campos de pós-entrega/mensalidade (NPS, reunião mensal, churn risk)
--   - Comissão DEV calculada (20% default)
--   - Custos de infraestrutura (implementação + mensal)
-- ────────────────────────────────────────────────────────────────────────────

-- 1) Expandir frente (business_unit) para incluir 'intelligence'
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_business_unit_check;
ALTER TABLE projects ADD CONSTRAINT projects_business_unit_check
  CHECK (business_unit IN ('labs','advisory','enterprise','intelligence'));

-- 2) Expandir pipeline de status com os 7 novos estágios + manter legados
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check
  CHECK (status IN (
    -- novo pipeline V2
    'contrato_assinado',
    'em_desenvolvimento',
    'em_validacao_interna',
    'entregue_tet',
    'ativo_mensalidade',
    'upsell_identificado',
    'churned',
    -- legacy (manter pra projetos existentes)
    'kickoff','em_andamento','pausado','em_revisao','concluido','cancelado'
  ));

-- 3) Identificação e contexto
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS niche               text,
  ADD COLUMN IF NOT EXISTS primary_contact_name     text,
  ADD COLUMN IF NOT EXISTS primary_contact_whatsapp text,
  ADD COLUMN IF NOT EXISTS closed_by_user_id        uuid REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS closed_by_external_label text,  -- "Indicação X" quando não é usuário
  ADD COLUMN IF NOT EXISTS developer_user_id        uuid REFERENCES users(id) ON DELETE SET NULL;

-- 4) Financeiro do projeto
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS contract_plan         text
                            CHECK (contract_plan IN ('core','evolucao','parceiro') OR contract_plan IS NULL),
  ADD COLUMN IF NOT EXISTS dev_commission_pct    numeric(5,2) DEFAULT 20,
  ADD COLUMN IF NOT EXISTS infra_setup_cost      numeric(12,2),  -- one-time
  ADD COLUMN IF NOT EXISTS infra_monthly_cost    numeric(12,2);  -- recorrente

-- 5) Campos de desenvolvimento
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS repo_url              text,
  ADD COLUMN IF NOT EXISTS architecture_doc_url  text,
  ADD COLUMN IF NOT EXISTS dev_started_at        date,
  ADD COLUMN IF NOT EXISTS promised_delivery_date date,  -- data acordada com cliente
  ADD COLUMN IF NOT EXISTS completion_percent    int CHECK (completion_percent BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS risks_blockers        text,
  ADD COLUMN IF NOT EXISTS code_review_done      boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS homologation_url      text,
  ADD COLUMN IF NOT EXISTS implementation_notes  text;

-- 6) Campos de pós-entrega / mensalidade
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS monthly_billing_start_date  date,
  ADD COLUMN IF NOT EXISTS latest_nps_score        int CHECK (latest_nps_score BETWEEN 0 AND 10),
  ADD COLUMN IF NOT EXISTS latest_nps_date         date,
  ADD COLUMN IF NOT EXISTS latest_meeting_date     date,
  ADD COLUMN IF NOT EXISTS latest_report_url       text,
  ADD COLUMN IF NOT EXISTS crs_opened_count        int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS crs_resolved_count      int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS upsell_opportunity_note text,
  ADD COLUMN IF NOT EXISTS churn_risk              text
                            CHECK (churn_risk IN ('baixo','medio','alto') OR churn_risk IS NULL);

-- 7) Histórico mensal de check-ins (NPS + reunião + relatório)
CREATE TABLE IF NOT EXISTS project_monthly_checkins (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id    uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  reference_month  date NOT NULL,  -- yyyy-mm-01 (sempre dia 1)
  nps_score        int CHECK (nps_score BETWEEN 0 AND 10),
  meeting_done     boolean DEFAULT false,
  meeting_date     date,
  report_url       text,
  crs_opened       int DEFAULT 0,
  crs_resolved     int DEFAULT 0,
  upsell_opportunity text,
  churn_risk         text CHECK (churn_risk IN ('baixo','medio','alto') OR churn_risk IS NULL),
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, reference_month)
);

CREATE INDEX IF NOT EXISTS idx_checkins_project ON project_monthly_checkins(project_id);
CREATE INDEX IF NOT EXISTS idx_checkins_month   ON project_monthly_checkins(reference_month);

DROP TRIGGER IF EXISTS checkins_updated_at ON project_monthly_checkins;
CREATE TRIGGER checkins_updated_at
BEFORE UPDATE ON project_monthly_checkins
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at_generic();

-- Sincroniza o último check-in com as colunas "latest_*" do projeto
CREATE OR REPLACE FUNCTION trg_sync_project_latest_checkin()
RETURNS trigger AS $$
BEGIN
  UPDATE projects
     SET latest_nps_score = NEW.nps_score,
         latest_nps_date  = COALESCE(NEW.meeting_date, NEW.reference_month),
         latest_meeting_date = NEW.meeting_date,
         latest_report_url = NEW.report_url,
         crs_opened_count = COALESCE(NEW.crs_opened, 0),
         crs_resolved_count = COALESCE(NEW.crs_resolved, 0),
         upsell_opportunity_note = NEW.upsell_opportunity,
         churn_risk = NEW.churn_risk
   WHERE id = NEW.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_project_latest_checkin ON project_monthly_checkins;
CREATE TRIGGER sync_project_latest_checkin
AFTER INSERT OR UPDATE ON project_monthly_checkins
FOR EACH ROW EXECUTE FUNCTION trg_sync_project_latest_checkin();

ALTER TABLE project_monthly_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pmc_select ON project_monthly_checkins;
CREATE POLICY pmc_select ON project_monthly_checkins FOR SELECT
  USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS pmc_insert ON project_monthly_checkins;
CREATE POLICY pmc_insert ON project_monthly_checkins FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS pmc_update ON project_monthly_checkins;
CREATE POLICY pmc_update ON project_monthly_checkins FOR UPDATE
  USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS pmc_delete ON project_monthly_checkins;
CREATE POLICY pmc_delete ON project_monthly_checkins FOR DELETE
  USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));
