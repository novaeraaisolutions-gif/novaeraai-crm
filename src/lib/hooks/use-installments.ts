"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/types/database";

export type Installment = Database["public"]["Tables"]["project_installments"]["Row"];
type InstallmentInsert = Database["public"]["Tables"]["project_installments"]["Insert"];
type InstallmentUpdate = Database["public"]["Tables"]["project_installments"]["Update"];

export type InstallmentWithRelations = Installment & {
  project?: { id: string; name: string; company_id: string | null } | null;
  phase?: { id: string; name: string; status: string } | null;
};

export const useProjectInstallments = (projectId: string) => {
  const supabase = createClient();
  return useQuery({
    queryKey: ["installments", "project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_installments")
        .select("*, phase:project_phases(id, name, status)")
        .eq("project_id", projectId)
        .order("position", { ascending: true });
      if (error) throw error;
      return data as InstallmentWithRelations[];
    },
    enabled: !!projectId,
  });
};

export const useAllInstallments = (statusFilter?: Installment["status"][]) => {
  const supabase = createClient();
  return useQuery({
    queryKey: ["installments", "all", statusFilter?.join(",") ?? "any"],
    queryFn: async () => {
      let query = supabase
        .from("project_installments")
        .select("*, project:projects(id, name, company_id), phase:project_phases(id, name, status)")
        .order("due_date", { ascending: true, nullsFirst: false });
      if (statusFilter && statusFilter.length > 0) {
        query = query.in("status", statusFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as InstallmentWithRelations[];
    },
  });
};

export const useCreateInstallment = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: InstallmentInsert) => {
      const { data, error } = await supabase
        .from("project_installments")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as Installment;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["installments"] });
      qc.invalidateQueries({ queryKey: ["installments", "project", vars.project_id] });
      toast.success("Parcela adicionada!");
    },
    onError: (err) => {
      console.error(err);
      toast.error("Erro ao adicionar parcela");
    },
  });
};

export const useUpdateInstallment = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: InstallmentUpdate & { id: string }) => {
      const { error } = await supabase.from("project_installments").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["installments"] });
      toast.success("Parcela atualizada!");
    },
    onError: () => toast.error("Erro ao atualizar parcela"),
  });
};

export const useDeleteInstallment = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_installments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["installments"] });
      toast.success("Parcela removida!");
    },
    onError: () => toast.error("Erro ao remover parcela"),
  });
};

export const useMarkInstallmentPaid = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("project_installments")
        .update({ status: "pago", paid_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["installments"] });
      toast.success("Parcela marcada como paga!");
    },
    onError: () => toast.error("Erro ao marcar como paga"),
  });
};

// Helper para gerar parcelas a partir de um split de % (ex: [50, 50] ou [30, 40, 30])
export const buildInstallmentsPayload = ({
  projectId,
  orgId,
  contractValue,
  splits,
}: {
  projectId: string;
  orgId: string;
  contractValue: number;
  splits: { description: string; percentage: number; phase_id?: string | null; due_date?: string | null }[];
}): InstallmentInsert[] => {
  return splits.map((s, idx) => ({
    org_id: orgId,
    project_id: projectId,
    position: idx + 1,
    description: s.description,
    percentage: s.percentage,
    amount: Math.round((contractValue * s.percentage) / 100 * 100) / 100,
    phase_id: s.phase_id ?? null,
    due_date: s.due_date ?? null,
    status: "pendente",
  }));
};

export const INSTALLMENT_STATUS_META: Record<Installment["status"], { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "#94A3B8" },
  faturado: { label: "Faturado", color: "#0B87C3" },
  pago: { label: "Pago", color: "#10B981" },
  atrasado: { label: "Atrasado", color: "#EF4444" },
  cancelado: { label: "Cancelado", color: "#64748B" },
};
