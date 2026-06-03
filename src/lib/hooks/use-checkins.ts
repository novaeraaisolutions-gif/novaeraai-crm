"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/types/database";

export type MonthlyCheckin = Database["public"]["Tables"]["project_monthly_checkins"]["Row"];
type Insert = Database["public"]["Tables"]["project_monthly_checkins"]["Insert"];
type Update = Database["public"]["Tables"]["project_monthly_checkins"]["Update"];

export const useProjectCheckins = (projectId: string) => {
  const supabase = createClient();
  return useQuery({
    queryKey: ["checkins", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_monthly_checkins")
        .select("*")
        .eq("project_id", projectId)
        .order("reference_month", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MonthlyCheckin[];
    },
    enabled: !!projectId,
  });
};

export const useUpsertCheckin = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Insert) => {
      // unique constraint: (project_id, reference_month)
      const { data, error } = await supabase
        .from("project_monthly_checkins")
        .upsert(input, { onConflict: "project_id,reference_month" })
        .select()
        .single();
      if (error) throw error;
      return data as MonthlyCheckin;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["checkins", vars.project_id] });
      qc.invalidateQueries({ queryKey: ["project", vars.project_id] });
      toast.success("Check-in mensal salvo!");
    },
    onError: () => toast.error("Erro ao salvar check-in"),
  });
};

export const useUpdateCheckin = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projectId, ...data }: Update & { id: string; projectId: string }) => {
      const { error } = await supabase.from("project_monthly_checkins").update(data).eq("id", id);
      if (error) throw error;
      return projectId;
    },
    onSuccess: (projectId) => {
      qc.invalidateQueries({ queryKey: ["checkins", projectId] });
      qc.invalidateQueries({ queryKey: ["project", projectId] });
    },
    onError: () => toast.error("Erro ao atualizar check-in"),
  });
};

export const useDeleteCheckin = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase.from("project_monthly_checkins").delete().eq("id", id);
      if (error) throw error;
      return projectId;
    },
    onSuccess: (projectId) => {
      qc.invalidateQueries({ queryKey: ["checkins", projectId] });
      qc.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Check-in removido!");
    },
    onError: () => toast.error("Erro ao remover check-in"),
  });
};
