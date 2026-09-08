-- ============================================================
-- Esteira: o handoff entre agentes
--
-- Até aqui cada operação era uma ilha. O gate da Arquitetura exige A2
-- validado, mas o A2 nasce numa operação do Diagnóstico — outro run_id.
-- Na prática isso significava que as fases C1..E nunca passariam do gate:
-- o agente estava configurado e era inalcançável.
--
-- A ligação é um encadeamento explícito: a operação de Arquitetura aponta
-- para a de Diagnóstico, a de Custos aponta para a de Arquitetura. O gate
-- e o handoff passam a enxergar a corrente inteira.
--
-- Encadear em vez de juntar tudo num "dossiê" preserva o que protege o
-- sistema: cada agente continua com sua própria conversa e seu próprio
-- conhecimento. O que atravessa é só o artefato validado — nunca o
-- histórico do agente anterior. A Arquitetura recebe o A2; não recebe a
-- transcrição, nem as dúvidas, nem os descartes do Diagnóstico.
--
-- Aditivo. Depende de 052.
-- ============================================================

ALTER TABLE agent_runs
  ADD COLUMN IF NOT EXISTS parent_run_id UUID REFERENCES agent_runs ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_agent_runs_parent ON agent_runs(parent_run_id);

-- D1 e D2 saem em HTML, não em markdown: são documentos que vão para o
-- cliente. Guardar no content_md e renderizar como texto perderia o
-- documento; guardar em coluna própria deixa explícito o que é análise
-- interna (md) e o que é entregável (html).
ALTER TABLE agent_artifacts
  ADD COLUMN IF NOT EXISTS content_html TEXT;

-- Quem vem depois na esteira. Fica como dado e não como constante no
-- código porque o agente de Contrato ainda vai entrar no fim da fila —
-- e quando entrar deve ser uma linha alterada, não um deploy.
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS next_agent_slug TEXT;

UPDATE agents SET next_agent_slug = 'arquitetura'      WHERE slug = 'diagnostico'     AND next_agent_slug IS NULL;
UPDATE agents SET next_agent_slug = 'custos-proposta'  WHERE slug = 'arquitetura'     AND next_agent_slug IS NULL;

-- ── Fechamento ────────────────────────────────────────────────
-- O que a proposta aceita virou no CRM. Guardado para que a resposta a
-- "de onde veio esse projeto?" seja um link, não uma lembrança.
ALTER TABLE agent_runs
  ADD COLUMN IF NOT EXISTS closed_project_id  UUID REFERENCES projects  ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS closed_proposal_id UUID REFERENCES proposals ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS closed_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS closed_by          UUID REFERENCES users;
