-- ────────────────────────────────────────────────────────────────────────────
-- Feature 7: Upsell sugerido por cliente/projeto
--
-- Combina sugestões manuais (cadastradas pelo usuário) com automáticas
-- (algoritmo no client). Esta tabela guarda apenas as manuais; o algoritmo
-- roda em memória no front comparando catálogo × projetos do cliente.
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS upsell_suggestions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  company_id      uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id      uuid REFERENCES projects(id) ON DELETE SET NULL,
  product_id      uuid REFERENCES products(id) ON DELETE SET NULL,
  title           text NOT NULL,
  description     text,
  reason          text,
  estimated_value numeric(12,2),
  priority        text NOT NULL DEFAULT 'media'
                  CHECK (priority IN ('baixa','media','alta','urgente')),
  status          text NOT NULL DEFAULT 'sugerido'
                  CHECK (status IN ('sugerido','em_negociacao','convertido','descartado')),
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_upsell_company ON upsell_suggestions(company_id);
CREATE INDEX IF NOT EXISTS idx_upsell_project ON upsell_suggestions(project_id);
CREATE INDEX IF NOT EXISTS idx_upsell_status  ON upsell_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_upsell_org     ON upsell_suggestions(org_id);

DROP TRIGGER IF EXISTS upsell_updated_at ON upsell_suggestions;
CREATE TRIGGER upsell_updated_at
BEFORE UPDATE ON upsell_suggestions
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at_generic();

ALTER TABLE upsell_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS us_select ON upsell_suggestions;
CREATE POLICY us_select ON upsell_suggestions FOR SELECT
  USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS us_insert ON upsell_suggestions;
CREATE POLICY us_insert ON upsell_suggestions FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS us_update ON upsell_suggestions;
CREATE POLICY us_update ON upsell_suggestions FOR UPDATE
  USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS us_delete ON upsell_suggestions;
CREATE POLICY us_delete ON upsell_suggestions FOR DELETE
  USING (org_id IN (SELECT org_id FROM users WHERE id = auth.uid()));
