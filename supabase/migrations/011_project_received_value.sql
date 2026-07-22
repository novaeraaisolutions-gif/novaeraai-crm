-- ============================================================
-- Separa "Valor a Receber" (pendente) de "Valor Recebido" (já contabilizado
-- no faturamento). Cada um sincroniza com uma linha própria em revenues.
-- ============================================================

ALTER TABLE projects ADD COLUMN IF NOT EXISTS received_value DECIMAL(12,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS received_date DATE;

-- Identifica de qual campo do projeto cada receita automática veio,
-- já que agora um projeto pode gerar até duas linhas (pendente + recebido)
ALTER TABLE revenues ADD COLUMN IF NOT EXISTS auto_source TEXT
  CHECK (auto_source IN ('project_receivable', 'project_received'));

-- Migra o que já existia (gerado pela versão anterior do trigger) como "a receber"
UPDATE revenues SET auto_source = 'project_receivable'
WHERE auto_generated = true AND auto_source IS NULL;

CREATE OR REPLACE FUNCTION sync_project_receivable_revenue()
RETURNS TRIGGER AS $$
BEGIN
  -- Valor a Receber (pendente, ainda não conta no faturamento)
  IF NEW.receivable_value IS NULL OR NEW.receivable_value <= 0 THEN
    DELETE FROM revenues WHERE project_id = NEW.id AND auto_source = 'project_receivable';
  ELSE
    UPDATE revenues
    SET value = NEW.receivable_value,
        due_date = NEW.receivable_due_date,
        description = 'Valor a receber - ' || NEW.name,
        business_unit = NEW.business_unit,
        company_id = NEW.company_id,
        contact_id = NEW.contact_id,
        status = 'pendente'
    WHERE project_id = NEW.id AND auto_source = 'project_receivable';

    IF NOT FOUND THEN
      INSERT INTO revenues (
        org_id, description, company_id, contact_id, project_id,
        business_unit, value, due_date, status, recurrence, category,
        auto_generated, auto_source
      )
      VALUES (
        NEW.org_id, 'Valor a receber - ' || NEW.name, NEW.company_id, NEW.contact_id, NEW.id,
        NEW.business_unit, NEW.receivable_value, NEW.receivable_due_date, 'pendente', 'pontual', 'projeto',
        true, 'project_receivable'
      );
    END IF;
  END IF;

  -- Valor Recebido (já caiu, conta no faturamento total)
  IF NEW.received_value IS NULL OR NEW.received_value <= 0 THEN
    DELETE FROM revenues WHERE project_id = NEW.id AND auto_source = 'project_received';
  ELSE
    UPDATE revenues
    SET value = NEW.received_value,
        due_date = NEW.received_date,
        paid_at = NEW.received_date,
        description = 'Valor recebido - ' || NEW.name,
        business_unit = NEW.business_unit,
        company_id = NEW.company_id,
        contact_id = NEW.contact_id,
        status = 'pago'
    WHERE project_id = NEW.id AND auto_source = 'project_received';

    IF NOT FOUND THEN
      INSERT INTO revenues (
        org_id, description, company_id, contact_id, project_id,
        business_unit, value, due_date, paid_at, status, recurrence, category,
        auto_generated, auto_source
      )
      VALUES (
        NEW.org_id, 'Valor recebido - ' || NEW.name, NEW.company_id, NEW.contact_id, NEW.id,
        NEW.business_unit, NEW.received_value, NEW.received_date, NEW.received_date, 'pago', 'pontual', 'projeto',
        true, 'project_received'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_sync_project_receivable ON projects;
CREATE TRIGGER trg_sync_project_receivable
AFTER INSERT OR UPDATE OF
  receivable_value, receivable_due_date, received_value, received_date,
  name, business_unit, company_id, contact_id
ON projects
FOR EACH ROW EXECUTE FUNCTION sync_project_receivable_revenue();
