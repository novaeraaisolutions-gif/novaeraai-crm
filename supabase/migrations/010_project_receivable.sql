-- ============================================================
-- Valor a Receber (projeto) -> sincroniza automaticamente com Financeiro
-- ============================================================

ALTER TABLE projects ADD COLUMN IF NOT EXISTS receivable_value DECIMAL(12,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS receivable_due_date DATE;

-- Marca receitas geradas automaticamente a partir de um projeto,
-- para o trigger conseguir localizar e atualizar sem mexer em receitas manuais
ALTER TABLE revenues ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN NOT NULL DEFAULT false;

-- projects.business_unit já aceita 'intelligence' (V2); alinhar revenues para o mesmo domínio
ALTER TABLE revenues DROP CONSTRAINT IF EXISTS revenues_business_unit_check;
ALTER TABLE revenues ADD CONSTRAINT revenues_business_unit_check
  CHECK (business_unit = ANY (ARRAY['labs','advisory','enterprise','intelligence']));

CREATE OR REPLACE FUNCTION sync_project_receivable_revenue()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.receivable_value IS NULL OR NEW.receivable_value <= 0 THEN
    DELETE FROM revenues WHERE project_id = NEW.id AND auto_generated = true;
    RETURN NEW;
  END IF;

  UPDATE revenues
  SET value = NEW.receivable_value,
      due_date = NEW.receivable_due_date,
      description = 'Valor a receber - ' || NEW.name,
      business_unit = NEW.business_unit,
      company_id = NEW.company_id,
      contact_id = NEW.contact_id
  WHERE project_id = NEW.id AND auto_generated = true;

  IF NOT FOUND THEN
    INSERT INTO revenues (
      org_id, description, company_id, contact_id, project_id,
      business_unit, value, due_date, status, recurrence, category, auto_generated
    )
    VALUES (
      NEW.org_id, 'Valor a receber - ' || NEW.name, NEW.company_id, NEW.contact_id, NEW.id,
      NEW.business_unit, NEW.receivable_value, NEW.receivable_due_date, 'pendente', 'pontual', 'projeto', true
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_sync_project_receivable ON projects;
CREATE TRIGGER trg_sync_project_receivable
AFTER INSERT OR UPDATE OF receivable_value, receivable_due_date, name, business_unit, company_id, contact_id
ON projects
FOR EACH ROW EXECUTE FUNCTION sync_project_receivable_revenue();
