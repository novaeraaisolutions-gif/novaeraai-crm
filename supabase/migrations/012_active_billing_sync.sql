-- ============================================================
-- Mensalidades ativas: ao mover o projeto para "Ativo - Mensalidade"
-- no kanban, ativa a cobrança e já gera a receita do mês corrente.
-- Uma função auxiliar garante a receita do mês para todas as
-- mensalidades ativas sempre que o Financeiro é aberto (sem depender
-- de cron externo).
-- ============================================================

ALTER TABLE revenues DROP CONSTRAINT IF EXISTS revenues_auto_source_check;
ALTER TABLE revenues ADD CONSTRAINT revenues_auto_source_check
  CHECK (auto_source IN ('project_receivable', 'project_received', 'project_monthly_billing'));

CREATE OR REPLACE FUNCTION activate_billing_on_status()
RETURNS TRIGGER AS $$
DECLARE
  v_due_date DATE;
BEGIN
  IF NEW.billing_status IS NULL OR NEW.billing_status = 'sem_mensalidade' THEN
    NEW.billing_status := 'ativo';
  END IF;
  IF NEW.contract_start IS NULL THEN
    NEW.contract_start := CURRENT_DATE;
  END IF;

  IF NEW.billing_amount IS NOT NULL AND NEW.billing_amount > 0 THEN
    v_due_date := make_date(
      EXTRACT(YEAR FROM CURRENT_DATE)::int,
      EXTRACT(MONTH FROM CURRENT_DATE)::int,
      LEAST(COALESCE(NEW.billing_day, EXTRACT(DAY FROM CURRENT_DATE)::int), 28)
    );

    IF NOT EXISTS (
      SELECT 1 FROM revenues
      WHERE project_id = NEW.id AND auto_source = 'project_monthly_billing'
        AND date_trunc('month', due_date) = date_trunc('month', v_due_date)
    ) THEN
      INSERT INTO revenues (
        org_id, description, company_id, contact_id, project_id,
        business_unit, value, due_date, status, recurrence, category,
        auto_generated, auto_source
      ) VALUES (
        NEW.org_id, 'Mensalidade - ' || NEW.name, NEW.company_id, NEW.contact_id, NEW.id,
        NEW.business_unit, NEW.billing_amount, v_due_date, 'pendente', 'mensal', 'assinatura',
        true, 'project_monthly_billing'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_activate_billing_on_status ON projects;
CREATE TRIGGER trg_activate_billing_on_status
BEFORE UPDATE OF status ON projects
FOR EACH ROW
WHEN (NEW.status = 'ativo_mensalidade' AND OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION activate_billing_on_status();

-- Garante a receita do mês corrente para toda mensalidade já ativa
-- (cobre os meses seguintes, chamada sempre que o Financeiro carrega)
CREATE OR REPLACE FUNCTION ensure_monthly_billing_revenues()
RETURNS void AS $$
DECLARE
  p RECORD;
  v_due_date DATE;
BEGIN
  FOR p IN
    SELECT * FROM projects
    WHERE billing_status = 'ativo' AND billing_amount IS NOT NULL AND billing_amount > 0
  LOOP
    v_due_date := make_date(
      EXTRACT(YEAR FROM CURRENT_DATE)::int,
      EXTRACT(MONTH FROM CURRENT_DATE)::int,
      LEAST(COALESCE(p.billing_day, EXTRACT(DAY FROM CURRENT_DATE)::int), 28)
    );

    IF NOT EXISTS (
      SELECT 1 FROM revenues
      WHERE project_id = p.id AND auto_source = 'project_monthly_billing'
        AND date_trunc('month', due_date) = date_trunc('month', v_due_date)
    ) THEN
      INSERT INTO revenues (
        org_id, description, company_id, contact_id, project_id,
        business_unit, value, due_date, status, recurrence, category,
        auto_generated, auto_source
      ) VALUES (
        p.org_id, 'Mensalidade - ' || p.name, p.company_id, p.contact_id, p.id,
        p.business_unit, p.billing_amount, v_due_date, 'pendente', 'mensal', 'assinatura',
        true, 'project_monthly_billing'
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION ensure_monthly_billing_revenues() TO authenticated;
