"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/types/database";

export type Improvement = Database["public"]["Tables"]["project_improvements"]["Row"];
type ImprovementInsert = Database["public"]["Tables"]["project_improvements"]["Insert"];
type ImprovementUpdate = Database["public"]["Tables"]["project_improvements"]["Update"];

export const useProjectImprovements = (projectId: string) => {
  const supabase = createClient();
  return useQuery({
    queryKey: ["improvements", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_improvements")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Improvement[];
    },
    enabled: !!projectId,
  });
};

export const useCreateImprovement = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ImprovementInsert) => {
      const { data, error } = await supabase.from("project_improvements").insert(input).select().single();
      if (error) throw error;
      return data as Improvement;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["improvements", vars.project_id] });
      toast.success("Melhoria adicionada!");
    },
    onError: () => toast.error("Erro ao adicionar melhoria"),
  });
};

export const useUpdateImprovement = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projectId, ...data }: ImprovementUpdate & { id: string; projectId: string }) => {
      const { error } = await supabase.from("project_improvements").update(data).eq("id", id);
      if (error) throw error;
      return projectId;
    },
    onSuccess: (projectId) => {
      qc.invalidateQueries({ queryKey: ["improvements", projectId] });
    },
    onError: () => toast.error("Erro ao atualizar melhoria"),
  });
};

export const useDeleteImprovement = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase.from("project_improvements").delete().eq("id", id);
      if (error) throw error;
      return projectId;
    },
    onSuccess: (projectId) => {
      qc.invalidateQueries({ queryKey: ["improvements", projectId] });
      toast.success("Melhoria removida!");
    },
    onError: () => toast.error("Erro ao remover melhoria"),
  });
};

export const IMPROVEMENT_STATUS_META: Record<Improvement["status"], { label: string; color: string }> = {
  sugerida:             { label: "Sugerida", color: "#94A3B8" },
  aprovada:             { label: "Aprovada", color: "#0B87C3" },
  em_desenvolvimento:   { label: "Em desenvolvimento", color: "#8B5CF6" },
  entregue:             { label: "Entregue", color: "#10B981" },
  rejeitada:            { label: "Rejeitada", color: "#64748B" },
};

export const IMPROVEMENT_PRIORITY_META: Record<Improvement["priority"], { label: string; color: string }> = {
  baixa:    { label: "Baixa", color: "#10B981" },
  media:    { label: "Média", color: "#6366F1" },
  alta:     { label: "Alta", color: "#F59E0B" },
  urgente:  { label: "Urgente", color: "#EF4444" },
};
