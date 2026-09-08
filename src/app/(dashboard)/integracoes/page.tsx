"use client";

import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { IntegrationsTab } from "@/components/settings/integrations-tab";

/**
 * Integrações da conta — de cada pessoa, não da organização.
 *
 * Isto morava dentro de Configurações, que é administração da empresa e
 * por isso é fechada para os papéis comercial e developer. O efeito
 * colateral era que ninguém fora da diretoria conseguia conectar o
 * próprio Google Calendar: a tela existia e era inalcançável.
 *
 * Conectar a agenda pessoal nunca foi configuração da organização. Numa
 * página própria, cada um cuida da sua conta sem que isso implique
 * acesso a pipelines, time ou papéis.
 */
export default function IntegracoesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Integrações"
        description="Conecte suas contas em plataformas externas. Vale só para você — ninguém mais vê nem usa esta conexão."
      />

      {/* IntegrationsTab lê o retorno do OAuth pela query string */}
      <Suspense fallback={<p className="text-xs text-text-muted">Carregando...</p>}>
        <IntegrationsTab />
      </Suspense>
    </div>
  );
}
