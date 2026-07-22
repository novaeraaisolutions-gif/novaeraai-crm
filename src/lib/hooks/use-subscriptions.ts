"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

export type ActiveSubscription = Pick<
  Database["public"]["Tables"]["projects"]["Row"],
  | "id"
  | "name"
  | "code"
  | "company_id"
  | "business_unit"
  | "billing_amount"
  | "billing_day"
  | "contract_start"
  | "contract_end"
  | "renewal_type"
  | "billing_status"
> & {
  company?: { id: string; name: string } | null;
};

export const useActiveSubscriptions = () => {
  const supabase = createClient();
  return useQuery({
    queryKey: ["subscriptions", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(
          "id, name, code, company_id, business_unit, billing_amount, billing_day, contract_start, contract_end, renewal_type, billing_status, company:companies(id, name)"
        )
        .eq("billing_status", "ativo")
        .order("billing_day", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data as unknown as ActiveSubscription[];
    },
  });
};

// Garante que toda mensalidade ativa tenha a receita do mês corrente no
// Financeiro, sem depender de um cron externo — roda uma vez ao abrir a página.
export const useEnsureMonthlyBilling = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  useEffect(() => {
    supabase.rpc("ensure_monthly_billing_revenues").then(({ error }) => {
      if (error) {
        console.error("Erro ao gerar receitas de mensalidade:", error);
        return;
      }
      qc.invalidateQueries({ queryKey: ["revenues"] });
      qc.invalidateQueries({ queryKey: ["subscriptions"] });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export const nextBillingDate = (billingDay: number | null): Date | null => {
  if (!billingDay) return null;
  const today = new Date();
  const daysInThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const day = Math.min(billingDay, daysInThisMonth);
  let next = new Date(today.getFullYear(), today.getMonth(), day);
  if (next < today) {
    const daysInNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0).getDate();
    next = new Date(today.getFullYear(), today.getMonth() + 1, Math.min(billingDay, daysInNextMonth));
  }
  return next;
};

export const RENEWAL_LABEL: Record<string, string> = {
  auto: "Automática",
  manual: "Manual",
  no_renewal: "Sem renovação",
};
