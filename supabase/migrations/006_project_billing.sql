-- ────────────────────────────────────────────────────────────────────────────
-- Feature 5: Prazos de contratos de mensalidade
--
-- Adiciona campos ao projeto para suportar contratos recorrentes:
--   - billing_day: dia do mês para cobrança (1-31)
--   - contract_start / contract_end: datas do contrato
--   - billing_amount: valor mensal
--   - renewal_type: como o contrato renova
--   - billing_status: estado atual do faturamento
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS billing_day      int  CHECK (billing_day BETWEEN 1 AND 31),
  ADD COLUMN IF NOT EXISTS billing_amount   numeric(12,2),
  ADD COLUMN IF NOT EXISTS contract_start   date,
  ADD COLUMN IF NOT EXISTS contract_end     date,
  ADD COLUMN IF NOT EXISTS renewal_type     text DEFAULT 'manual'
                            CHECK (renewal_type IN ('auto','manual','no_renewal')),
  ADD COLUMN IF NOT EXISTS billing_status   text DEFAULT 'sem_mensalidade'
                            CHECK (billing_status IN ('sem_mensalidade','ativo','suspenso','encerrado'));

CREATE INDEX IF NOT EXISTS idx_projects_contract_end ON projects(contract_end);
CREATE INDEX IF NOT EXISTS idx_projects_billing_status ON projects(billing_status);
