"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/types/database";

export type ProjectCost = Database["public"]["Tables"]["project_costs"]["Row"];
type CostInsert = Database["public"]["Tables"]["project_costs"]["Insert"];
type CostUpdate = Database["public"]["Tables"]["project_costs"]["Update"];

export const useProjectCosts = (projectId: string) => {
  const supabase = createClient();
  return useQuery({
    queryKey: ["project-costs", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_costs")
        .select("*")
        .eq("project_id", projectId)
        .order("incurred_date", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as ProjectCost[];
    },
    enabled: !!projectId,
  });
};

export const useCreateProjectCost = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CostInsert) => {
      const { data, error } = await supabase.from("project_costs").insert(input).select().single();
      if (error) throw error;
      return data as ProjectCost;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["project-costs", vars.project_id] });
      toast.success("Custo adicionado!");
    },
    onError: () => toast.error("Erro ao adicionar custo"),
  });
};

export const useUpdateProjectCost = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projectId, ...data }: CostUpdate & { id: string; projectId: string }) => {
      const { error } = await supabase.from("project_costs").update(data).eq("id", id);
      if (error) throw error;
      return projectId;
    },
    onSuccess: (projectId) => {
      qc.invalidateQueries({ queryKey: ["project-costs", projectId] });
    },
    onError: () => toast.error("Erro ao atualizar custo"),
  });
};

export const useDeleteProjectCost = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase.from("project_costs").delete().eq("id", id);
      if (error) throw error;
      return projectId;
    },
    onSuccess: (projectId) => {
      qc.invalidateQueries({ queryKey: ["project-costs", projectId] });
      toast.success("Custo removido!");
    },
    onError: () => toast.error("Erro ao remover custo"),
  });
};

export const COST_TYPE_META = {
  implementacao:       { label: "Implementação (one-time)", color: "#0B87C3" },
  mensal_recorrente:   { label: "Mensal recorrente",         color: "#8B5CF6" },
  eventual:            { label: "Eventual",                  color: "#F59E0B" },
} as const;

export const COST_CATEGORY_META = {
  pessoal:         { label: "Pessoal" },
  infraestrutura:  { label: "Infraestrutura" },
  software:        { label: "Software / SaaS" },
  terceiros:       { label: "Terceiros" },
  marketing:       { label: "Marketing" },
  outros:          { label: "Outros" },
} as const;
