-- ============================================================
-- Mensalidade: período de teste e ciclo mensal de verdade
--
-- Como funciona no comercial: entregue a solução, o cliente ganha 30 dias
-- de teste; quando acabam, paga a primeira mensalidade; a partir do mês
-- seguinte paga no dia que ele escolheu.
--
-- Nada disso existia no banco. Três defeitos vinham daí:
--
-- 1. O teste era só um rótulo na tela. Mover o projeto para "Ativo -
--    Mensalidade" gerava cobrança no mesmo mês, teste correndo ou não.
--
-- 2. Sem `billing_day`, o vencimento virava o dia em que alguém abriu o
--    Financeiro. É por isso que a Automarcas venceu dia 28, depois dia 1,
--    depois dia 12 — não foi o cliente mudando de ideia.
--
-- 3. O gerador só criava a receita do MÊS CORRENTE. Um mês em que ninguém
--    abrisse o Financeiro não ficava pendente: não era cobrado nunca.
--
-- Aditivo. Reaproveita `monthly_billing_start_date`, que existia desde a
-- 009, era exibido na tela e nunca foi escrito por nada.
-- ============================================================

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS trial_start_date DATE,
  ADD COLUMN IF NOT EXISTS trial_days INT NOT NULL DEFAULT 30;

COMMENT ON COLUMN projects.trial_start_date IS
  'Quando a solução foi entregue e o período de teste começou.';
COMMENT ON COLUMN projects.trial_days IS
  'Dias de teste. Padrão 30; os contratos-modelo usam 7 para escopos menores.';
COMMENT ON COLUMN projects.monthly_billing_start_date IS
  'Data da PRIMEIRA mensalidade — o dia em que o teste acaba. Do mês seguinte em diante vale billing_day.';

-- ── A data da primeira mensalidade ────────────────────────────
-- Uma função só, para que tela, trigger e gerador respondam a mesma
-- coisa. Antes a previsão era calculada no componente React e o banco
-- não sabia dela.
CREATE OR REPLACE FUNCTION project_first_billing_date(p projects)
RETURNS DATE AS $$
BEGIN
  RETURN COALESCE(
    p.monthly_billing_start_date,
    p.predicted_first_billing_override,
    CASE WHEN p.trial_start_date IS NOT NULL
         THEN p.trial_start_date + COALESCE(p.trial_days, 30) END,
    CASE WHEN p.promised_delivery_date IS NOT NULL
         THEN p.promised_delivery_date + COALESCE(p.trial_days, 30) END,
    p.contract_start
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ── O vencimento de um mês ────────────────────────────────────
-- No mês da primeira mensalidade, vence no dia exato em que o teste
-- acabou. Nos seguintes, no dia escolhido pelo cliente.
--
-- O dia é limitado ao último dia do mês, e não a 28 fixo: quem escolhe
-- dia 30 é cobrado dia 30 em novembro e dia 28 em fevereiro, em vez de
-- sempre dia 28. Sem `billing_day`, herda o dia da primeira mensalidade —
-- determinístico, nunca "o dia em que a tela foi aberta".
CREATE OR REPLACE FUNCTION project_due_date_for_month(
  p projects, p_month DATE
) RETURNS DATE AS $$
DECLARE
  v_first DATE := project_first_billing_date(p);
  v_day   INT;
  v_last  INT;
BEGIN
  IF v_first IS NULL THEN RETURN NULL; END IF;

  IF date_trunc('month', p_month) = date_trunc('month', v_first) THEN
    RETURN v_first;
  END IF;

  v_day  := COALESCE(p.billing_day, EXTRACT(DAY FROM v_first)::int);
  v_last := EXTRACT(DAY FROM (date_trunc('month', p_month) + INTERVAL '1 month - 1 day'))::int;

  RETURN make_date(
    EXTRACT(YEAR  FROM p_month)::int,
    EXTRACT(MONTH FROM p_month)::int,
    LEAST(GREATEST(v_day, 1), v_last)
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ── O gerador ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION ensure_monthly_billing_revenues()
RETURNS void AS $$
DECLARE
  -- %ROWTYPE e não RECORD: as funções acima recebem o tipo `projects`, e
  -- um RECORD não é convertido para ele. Com RECORD isto compila e só
  -- quebra na hora de rodar.
  p         projects%ROWTYPE;
  v_first   DATE;
  v_cursor  DATE;
  v_last_ok DATE;
  v_due     DATE;
BEGIN
  FOR p IN
    SELECT * FROM projects
    WHERE billing_status = 'ativo'
      AND billing_amount IS NOT NULL AND billing_amount > 0
  LOOP
    v_first := project_first_billing_date(p);

    -- Sem data de início não há o que cobrar, e teste correndo não gera
    -- receita nenhuma: é a trava que faltava.
    CONTINUE WHEN v_first IS NULL OR v_first > CURRENT_DATE;

    -- De onde varrer: do mês da última mensalidade já gerada, ou do mês
    -- da primeira cobrança se ainda não houver nenhuma. Não se inventa
    -- histórico anterior ao que já existe — só se fecham os buracos
    -- daqui pra frente.
    SELECT MAX(date_trunc('month', due_date))::date INTO v_last_ok
      FROM revenues
     WHERE project_id = p.id AND auto_source = 'project_monthly_billing';

    v_cursor := COALESCE(v_last_ok, date_trunc('month', v_first)::date);

    WHILE v_cursor <= date_trunc('month', CURRENT_DATE)::date LOOP
      v_due := project_due_date_for_month(p, v_cursor);

      IF v_due IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM revenues
         WHERE project_id = p.id
           AND auto_source = 'project_monthly_billing'
           AND date_trunc('month', due_date) = date_trunc('month', v_cursor)
      ) THEN
        INSERT INTO revenues (
          org_id, description, company_id, contact_id, project_id,
          business_unit, value, due_date, status, recurrence, category,
          auto_generated, auto_source
        ) VALUES (
          p.org_id, 'Mensalidade - ' || p.name, p.company_id, p.contact_id, p.id,
          p.business_unit, p.billing_amount, v_due, 'pendente', 'mensal', 'assinatura',
          true, 'project_monthly_billing'
        );
      END IF;

      v_cursor := (v_cursor + INTERVAL '1 month')::date;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION ensure_monthly_billing_revenues() TO authenticated;

-- ── Ativação e sincronização ──────────────────────────────────
-- Quem está ativo hoje é `sync_project_billing()`, com os gatilhos
-- `trg_sync_billing_on_status` e `trg_sync_billing_on_fields` — a 013
-- removeu o antigo `trg_activate_billing_on_status` e o substituiu.
-- Recriar aquele aqui deixaria dois gatilhos disputando o mesmo trabalho,
-- então o que se faz é corrigir este.
--
-- A mudança: ele para de cobrar o mês corrente por reflexo. Só cobra se a
-- data da primeira mensalidade já chegou. É o que faz o período de teste
-- existir de verdade — era ele, e não o gerador, que cobrava no meio do
-- teste ao mudar o billing_status.
CREATE OR REPLACE FUNCTION sync_project_billing()
RETURNS TRIGGER AS $$
DECLARE
  v_first DATE;
  v_due   DATE;
BEGIN
  -- Mover pro kanban "Ativo - Mensalidade" é uma ativação explícita:
  -- sempre reativa a cobrança, não importa o estado anterior.
  IF TG_OP = 'UPDATE' AND NEW.status = 'ativo_mensalidade'
     AND OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.billing_status := 'ativo';
    IF NEW.contract_start IS NULL THEN
      NEW.contract_start := CURRENT_DATE;
    END IF;

    -- Entrou em mensalidade sem ninguém ter marcado a entrega: o teste
    -- começa agora. Melhor um teste que começa tarde do que uma cobrança
    -- que começa cedo.
    IF NEW.trial_start_date IS NULL
       AND NEW.monthly_billing_start_date IS NULL
       AND NEW.predicted_first_billing_override IS NULL THEN
      NEW.trial_start_date := COALESCE(NEW.promised_delivery_date, CURRENT_DATE);
    END IF;

    IF NEW.monthly_billing_start_date IS NULL THEN
      NEW.monthly_billing_start_date := project_first_billing_date(NEW);
    END IF;
  END IF;

  IF NEW.billing_status IS DISTINCT FROM 'ativo'
     OR NEW.billing_amount IS NULL OR NEW.billing_amount <= 0 THEN
    DELETE FROM revenues
     WHERE project_id = NEW.id
       AND auto_source = 'project_monthly_billing'
       AND status = 'pendente';
    RETURN NEW;
  END IF;

  v_first := project_first_billing_date(NEW);

  -- Teste correndo: nada a cobrar ainda.
  IF v_first IS NULL OR v_first > CURRENT_DATE THEN
    RETURN NEW;
  END IF;

  v_due := project_due_date_for_month(NEW, CURRENT_DATE);

  IF v_due IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM revenues
     WHERE project_id = NEW.id
       AND auto_source = 'project_monthly_billing'
       AND date_trunc('month', due_date) = date_trunc('month', v_due)
  ) THEN
    INSERT INTO revenues (
      org_id, description, company_id, contact_id, project_id,
      business_unit, value, due_date, status, recurrence, category,
      auto_generated, auto_source
    ) VALUES (
      NEW.org_id, 'Mensalidade - ' || NEW.name, NEW.company_id, NEW.contact_id, NEW.id,
      NEW.business_unit, NEW.billing_amount, v_due, 'pendente', 'mensal', 'assinatura',
      true, 'project_monthly_billing'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Garantia de que o gatilho removido pela 013 não volta por engano.
DROP TRIGGER IF EXISTS trg_activate_billing_on_status ON projects;

-- ── Âncora para quem já está cobrando ─────────────────────────
-- Sem isto o gerador não teria de onde partir nos projetos existentes.
UPDATE projects
   SET monthly_billing_start_date = COALESCE(predicted_first_billing_override, contract_start)
 WHERE billing_status = 'ativo'
   AND monthly_billing_start_date IS NULL
   AND COALESCE(predicted_first_billing_override, contract_start) IS NOT NULL;

INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('055', 'trial_and_monthly_billing')
ON CONFLICT (version) DO NOTHING;
