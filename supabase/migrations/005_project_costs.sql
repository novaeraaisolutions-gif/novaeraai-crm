-- ────────────────────────────────────────────────────────────────────────────
-- Feature 4: Custos por projeto (implementação one-time, mensal, eventual)
--
-- Permite trackar custos de cada projeto separados em tipos. Pode estar
-- vinculado a um produto específico ou ao projeto como um todo.
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS project_costs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id    uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  product_id    uuid REFERENCES project_products(id) ON DELETE SET NULL,
  category      text NOT NULL DEFAULT 'outros'
                CHECK (category IN ('pessoal','infraestrutura','software','terceiros','marketing','outros')),
  cost_type     text NOT NULL
                CHECK (cost_type IN ('implementacao','mensal_recorrente','eventual')),
  description   text NOT NULL,
  amount        numeric(12,2) NOT NULL,
  incurred_date date,
  status        text NOT NULL DEFAULT 'previsto'
                CHECK (status IN ('previsto','pago','cancelado')),
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_costs_project ON project_costs(project_id);
CREATE INDEX IF NOT EXISTS idx_project_costs_product ON project_costs(product_id);
CREATE INDEX IF NOT EXISTS idx_project_costs_type    ON project_costs(cost_type);
CREATE INDEX IF NOT EXISTS idx_project_costs_org     ON project_costs(org_id);

DROP TRIGGER IF EXISTS project_costs_updated_at ON project_costs;
CREATE TRIGGER project_costs_updated_at
BEFORE UPDATE ON project_costs
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at_generic();

ALTER TABLE project_costs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pc_select ON project_costs;
CREATE POLICY pc_select ON project_costs FOR SELECT
  USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS pc_insert ON project_costs;
CREATE POLICY pc_insert ON project_costs FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS pc_update ON project_costs;
CREATE POLICY pc_update ON project_costs FOR UPDATE
  USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS pc_delete ON project_costs;
CREATE POLICY pc_delete ON project_costs FOR DELETE
  USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));
