"use client";

import { PageHeader } from "@/components/shared/page-header";
import { UpsellList } from "@/components/upsells/upsell-list";
import { useUser } from "@/lib/hooks/use-user";

export default function UpsellsPage() {
  const { user } = useUser();
  if (!user?.org_id) {
    return <div className="p-6 text-text-muted">Carregando...</div>;
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title="Upsell & Cross-sell"
        description="Oportunidades sugeridas automaticamente e cadastradas manualmente"
      />
      <UpsellList scope="global" orgId={user.org_id} />
    </div>
  );
}
