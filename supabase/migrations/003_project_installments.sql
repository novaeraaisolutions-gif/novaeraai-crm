-- ────────────────────────────────────────────────────────────────────────────
-- Feature 2: Recebíveis com parcelas (project_installments)
--
-- Modelo: configurável por projeto. Cada projeto pode ter N parcelas com %
-- e cada parcela pode estar vinculada a uma etapa (project_phase). Quando a
-- etapa é concluída, a parcela vira "faturado" automaticamente via trigger.
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS project_installments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id    uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  position      int  NOT NULL,
  description   text NOT NULL,
  percentage    numeric(5,2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),
  amount        numeric(12,2) NOT NULL DEFAULT 0,
  phase_id      uuid REFERENCES project_phases(id) ON DELETE SET NULL,
  due_date      date,
  status        text NOT NULL DEFAULT 'pendente'
                CHECK (status IN ('pendente','faturado','pago','atrasado','cancelado')),
  paid_at       timestamptz,
  invoice_url   text,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_installments_project ON project_installments(project_id);
CREATE INDEX IF NOT EXISTS idx_installments_org     ON project_installments(org_id);
CREATE INDEX IF NOT EXISTS idx_installments_phase   ON project_installments(phase_id);
CREATE INDEX IF NOT EXISTS idx_installments_status  ON project_installments(status);

-- Trigger: atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION trg_installments_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS installments_set_updated_at ON project_installments;
CREATE TRIGGER installments_set_updated_at
BEFORE UPDATE ON project_installments
FOR EACH ROW EXECUTE FUNCTION trg_installments_set_updated_at();

-- Trigger: quando uma phase é marcada como concluída, marcar as parcelas
-- vinculadas como 'faturado' (pronta pra cobrar). Status final 'pago' continua
-- sendo manual.
CREATE OR REPLACE FUNCTION trg_phase_complete_installment()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'concluida' AND (OLD.status IS DISTINCT FROM 'concluida') THEN
    UPDATE project_installments
       SET status = 'faturado'
     WHERE phase_id = NEW.id
       AND status = 'pendente';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS phase_complete_installment ON project_phases;
CREATE TRIGGER phase_complete_installment
AFTER UPDATE OF status ON project_phases
FOR EACH ROW EXECUTE FUNCTION trg_phase_complete_installment();

-- RLS
ALTER TABLE project_installments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS installments_select ON project_installments;
CREATE POLICY installments_select ON project_installments
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS installments_insert ON project_installments;
CREATE POLICY installments_insert ON project_installments
  FOR INSERT WITH CHECK (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS installments_update ON project_installments;
CREATE POLICY installments_update ON project_installments
  FOR UPDATE USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS installments_delete ON project_installments;
CREATE POLICY installments_delete ON project_installments
  FOR DELETE USING (
    org_id IN (SELECT org_id FROM users WHERE id = auth.uid())
  );
