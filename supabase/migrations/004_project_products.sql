-- ────────────────────────────────────────────────────────────────────────────
-- Feature 3: Produtos dentro de projetos + etapas com data prometida/prevista/real
--
-- Cada projeto pode ter N "produtos" (itens entregáveis) e cada produto tem
-- N etapas. Etapas têm 3 datas:
--   - promised_date: assinada no contrato (não muda)
--   - forecast_date: previsão atual (ajustável conforme o projeto avança)
--   - actual_end_date: data real de conclusão
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS project_products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id    uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name          text NOT NULL,
  description   text,
  value         numeric(12,2),
  position      int NOT NULL DEFAULT 0,
  status        text NOT NULL DEFAULT 'planejado'
                CHECK (status IN ('planejado','em_andamento','concluido','cancelado')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_products_project ON project_products(project_id);
CREATE INDEX IF NOT EXISTS idx_project_products_org     ON project_products(org_id);

CREATE TABLE IF NOT EXISTS project_product_stages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  product_id      uuid NOT NULL REFERENCES project_products(id) ON DELETE CASCADE,
  name            text NOT NULL,
  position        int  NOT NULL DEFAULT 0,
  status          text NOT NULL DEFAULT 'pendente'
                  CHECK (status IN ('pendente','em_andamento','concluida','bloqueada')),
  promised_date   date,
  forecast_date   date,
  actual_end_date date,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_stages_product ON project_product_stages(product_id);
CREATE INDEX IF NOT EXISTS idx_product_stages_status  ON project_product_stages(status);

-- updated_at triggers
CREATE OR REPLACE FUNCTION trg_set_updated_at_generic()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS project_products_updated_at ON project_products;
CREATE TRIGGER project_products_updated_at
BEFORE UPDATE ON project_products
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at_generic();

DROP TRIGGER IF EXISTS product_stages_updated_at ON project_product_stages;
CREATE TRIGGER product_stages_updated_at
BEFORE UPDATE ON project_product_stages
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at_generic();

-- Trigger: ao marcar etapa como concluída, setar actual_end_date se vazio
CREATE OR REPLACE FUNCTION trg_stage_complete_set_actual_end()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'concluida' AND OLD.status IS DISTINCT FROM 'concluida' AND NEW.actual_end_date IS NULL THEN
    NEW.actual_end_date = CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stage_complete_actual_end ON project_product_stages;
CREATE TRIGGER stage_complete_actual_end
BEFORE UPDATE OF status ON project_product_stages
FOR EACH ROW EXECUTE FUNCTION trg_stage_complete_set_actual_end();

-- RLS
ALTER TABLE project_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_product_stages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pp_select ON project_products;
CREATE POLICY pp_select ON project_products FOR SELECT
  USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS pp_insert ON project_products;
CREATE POLICY pp_insert ON project_products FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS pp_update ON project_products;
CREATE POLICY pp_update ON project_products FOR UPDATE
  USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS pp_delete ON project_products;
CREATE POLICY pp_delete ON project_products FOR DELETE
  USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS pps_select ON project_product_stages;
CREATE POLICY pps_select ON project_product_stages FOR SELECT
  USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS pps_insert ON project_product_stages;
CREATE POLICY pps_insert ON project_product_stages FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS pps_update ON project_product_stages;
CREATE POLICY pps_update ON project_product_stages FOR UPDATE
  USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS pps_delete ON project_product_stages;
CREATE POLICY pps_delete ON project_product_stages FOR DELETE
  USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));
