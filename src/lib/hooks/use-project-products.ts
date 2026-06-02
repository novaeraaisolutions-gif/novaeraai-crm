"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/types/database";

export type ProjectProduct = Database["public"]["Tables"]["project_products"]["Row"];
export type ProductStage = Database["public"]["Tables"]["project_product_stages"]["Row"];
type ProductInsert = Database["public"]["Tables"]["project_products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["project_products"]["Update"];
type StageInsert = Database["public"]["Tables"]["project_product_stages"]["Insert"];
type StageUpdate = Database["public"]["Tables"]["project_product_stages"]["Update"];

export type ProductWithStages = ProjectProduct & {
  stages: ProductStage[];
};

export const useProjectProducts = (projectId: string) => {
  const supabase = createClient();
  return useQuery({
    queryKey: ["project-products", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_products")
        .select("*, stages:project_product_stages(*)")
        .eq("project_id", projectId)
        .order("position", { ascending: true });
      if (error) throw error;
      const products = (data ?? []) as ProductWithStages[];
      return products.map((p) => ({
        ...p,
        stages: [...(p.stages ?? [])].sort((a, b) => a.position - b.position),
      }));
    },
    enabled: !!projectId,
  });
};

export const useCreateProduct = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProductInsert) => {
      const { data, error } = await supabase
        .from("project_products")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as ProjectProduct;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["project-products", vars.project_id] });
      toast.success("Produto adicionado!");
    },
    onError: () => toast.error("Erro ao adicionar produto"),
  });
};

export const useUpdateProduct = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projectId, ...data }: ProductUpdate & { id: string; projectId?: string }) => {
      const { error } = await supabase.from("project_products").update(data).eq("id", id);
      if (error) throw error;
      return projectId;
    },
    onSuccess: (projectId) => {
      if (projectId) qc.invalidateQueries({ queryKey: ["project-products", projectId] });
      else qc.invalidateQueries({ queryKey: ["project-products"] });
      toast.success("Produto atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar produto"),
  });
};

export const useDeleteProduct = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase.from("project_products").delete().eq("id", id);
      if (error) throw error;
      return projectId;
    },
    onSuccess: (projectId) => {
      qc.invalidateQueries({ queryKey: ["project-products", projectId] });
      toast.success("Produto removido!");
    },
    onError: () => toast.error("Erro ao remover produto"),
  });
};

export const useCreateStage = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, ...input }: StageInsert & { projectId: string }) => {
      const { data, error } = await supabase
        .from("project_product_stages")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return { stage: data as ProductStage, projectId };
    },
    onSuccess: ({ projectId }) => {
      qc.invalidateQueries({ queryKey: ["project-products", projectId] });
      toast.success("Etapa adicionada!");
    },
    onError: () => toast.error("Erro ao adicionar etapa"),
  });
};

export const useUpdateStage = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projectId, ...data }: StageUpdate & { id: string; projectId: string }) => {
      const { error } = await supabase.from("project_product_stages").update(data).eq("id", id);
      if (error) throw error;
      return projectId;
    },
    onSuccess: (projectId) => {
      qc.invalidateQueries({ queryKey: ["project-products", projectId] });
    },
    onError: () => toast.error("Erro ao atualizar etapa"),
  });
};

export const useDeleteStage = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase.from("project_product_stages").delete().eq("id", id);
      if (error) throw error;
      return projectId;
    },
    onSuccess: (projectId) => {
      qc.invalidateQueries({ queryKey: ["project-products", projectId] });
      toast.success("Etapa removida!");
    },
    onError: () => toast.error("Erro ao remover etapa"),
  });
};

export const PRODUCT_STATUS_META: Record<ProjectProduct["status"], { label: string; color: string }> = {
  planejado: { label: "Planejado", color: "#94A3B8" },
  em_andamento: { label: "Em andamento", color: "#0B87C3" },
  concluido: { label: "Concluído", color: "#10B981" },
  cancelado: { label: "Cancelado", color: "#64748B" },
};

export const STAGE_STATUS_META: Record<ProductStage["status"], { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "#94A3B8" },
  em_andamento: { label: "Em andamento", color: "#0B87C3" },
  concluida: { label: "Concluída", color: "#10B981" },
  bloqueada: { label: "Bloqueada", color: "#EF4444" },
};
