-- ────────────────────────────────────────────────────────────────────────────
-- Feature 6: Melhorias por projeto (anotações de evoluções)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS project_improvements (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id    uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  product_id    uuid REFERENCES project_products(id) ON DELETE SET NULL,
  title         text NOT NULL,
  description   text,
  priority      text NOT NULL DEFAULT 'media'
                CHECK (priority IN ('baixa','media','alta','urgente')),
  status        text NOT NULL DEFAULT 'sugerida'
                CHECK (status IN ('sugerida','aprovada','em_desenvolvimento','entregue','rejeitada')),
  source        text DEFAULT 'interno'
                CHECK (source IN ('interno','cliente')),
  target_date   date,
  completed_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_improvements_project ON project_improvements(project_id);
CREATE INDEX IF NOT EXISTS idx_improvements_product ON project_improvements(product_id);
CREATE INDEX IF NOT EXISTS idx_improvements_status  ON project_improvements(status);
CREATE INDEX IF NOT EXISTS idx_improvements_org     ON project_improvements(org_id);

DROP TRIGGER IF EXISTS improvements_updated_at ON project_improvements;
CREATE TRIGGER improvements_updated_at
BEFORE UPDATE ON project_improvements
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at_generic();

CREATE OR REPLACE FUNCTION trg_improvement_complete_set_at()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'entregue' AND OLD.status IS DISTINCT FROM 'entregue' AND NEW.completed_at IS NULL THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS improvement_complete_at ON project_improvements;
CREATE TRIGGER improvement_complete_at
BEFORE UPDATE OF status ON project_improvements
FOR EACH ROW EXECUTE FUNCTION trg_improvement_complete_set_at();

ALTER TABLE project_improvements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pi_select ON project_improvements;
CREATE POLICY pi_select ON project_improvements FOR SELECT
  USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS pi_insert ON project_improvements;
CREATE POLICY pi_insert ON project_improvements FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS pi_update ON project_improvements;
CREATE POLICY pi_update ON project_improvements FOR UPDATE
  USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS pi_delete ON project_improvements;
CREATE POLICY pi_delete ON project_improvements FOR DELETE
  USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));
