"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/types/database";

export type Agent = Database["public"]["Tables"]["agents"]["Row"];
export type AgentPhase = Database["public"]["Tables"]["agent_phases"]["Row"];
export type KnowledgeBase = Database["public"]["Tables"]["knowledge_bases"]["Row"];
export type KnowledgeBlock = Database["public"]["Tables"]["knowledge_blocks"]["Row"];
export type KnowledgeBlockVersion = Database["public"]["Tables"]["knowledge_block_versions"]["Row"];
export type AgentRule = Database["public"]["Tables"]["agent_rules"]["Row"];

export type AgentWithDetail = Agent & {
  phases: Pick<
    AgentPhase,
    "id" | "code" | "name" | "effort" | "produces_artifact" | "requires_artifacts" | "position"
  >[];
  knowledge: Pick<KnowledgeBase, "id" | "slug" | "name">[];
};

// Os agentes com as fases e as bases que cada um lê. O vínculo de
// conhecimento é o isolamento: base que não aparece aqui, o agente não
// enxerga — não existe prompt que contorne a ausência da linha.
export const useAgents = () => {
  const supabase = createClient();
  return useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agents")
        .select(
          `*,
           phases:agent_phases(id, code, name, effort, produces_artifact, requires_artifacts, position),
           links:agent_knowledge(kb:knowledge_bases(id, slug, name))`
        )
        .order("position", { ascending: true });
      if (error) throw error;

      type Raw = Agent & {
        phases: AgentWithDetail["phases"];
        links: { kb: { id: string; slug: string; name: string } | null }[];
      };

      return ((data ?? []) as unknown as Raw[]).map((a): AgentWithDetail => ({
        ...a,
        phases: [...(a.phases ?? [])].sort((x, y) => x.position - y.position),
        knowledge: (a.links ?? []).map((l) => l.kb).filter((k): k is NonNullable<typeof k> => !!k),
      }));
    },
  });
};

export type KnowledgeBaseWithUsage = KnowledgeBase & {
  blockCount: number;
  charCount: number;
  readers: string[];
};

// As bases com quem as lê. Mostrar o leitor junto é o que faz alguém
// pensar duas vezes antes de vincular o catálogo ao Diagnóstico.
export const useKnowledgeBases = () => {
  const supabase = createClient();
  return useQuery({
    queryKey: ["knowledge-bases"],
    queryFn: async () => {
      const [basesRes, blocksRes, linksRes] = await Promise.all([
        supabase.from("knowledge_bases").select("*").order("position", { ascending: true }),
        supabase.from("knowledge_blocks").select("kb_id, content"),
        supabase.from("agent_knowledge").select("kb_id, agent:agents(name, position)"),
      ]);
      if (basesRes.error) throw basesRes.error;
      if (blocksRes.error) throw blocksRes.error;
      if (linksRes.error) throw linksRes.error;

      const blocks = (blocksRes.data ?? []) as { kb_id: string; content: string }[];
      const links = (linksRes.data ?? []) as unknown as {
        kb_id: string;
        agent: { name: string; position: number } | null;
      }[];

      return ((basesRes.data ?? []) as KnowledgeBase[]).map((b): KnowledgeBaseWithUsage => {
        const mine = blocks.filter((x) => x.kb_id === b.id);
        return {
          ...b,
          blockCount: mine.length,
          charCount: mine.reduce((s, x) => s + x.content.length, 0),
          readers: links
            .filter((l) => l.kb_id === b.id && l.agent)
            .sort((x, y) => (x.agent!.position ?? 0) - (y.agent!.position ?? 0))
            .map((l) => l.agent!.name),
        };
      });
    },
  });
};

export const useKnowledgeBlocks = (kbId?: string) => {
  const supabase = createClient();
  return useQuery({
    queryKey: ["knowledge-blocks", kbId],
    enabled: !!kbId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge_blocks")
        .select("*")
        .eq("kb_id", kbId!)
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as KnowledgeBlock[];
    },
  });
};

// O histórico. A versão anterior é gravada por trigger no banco, então
// vale para qualquer caminho de escrita — não depende desta tela.
export const useBlockVersions = (blockId?: string) => {
  const supabase = createClient();
  return useQuery({
    queryKey: ["knowledge-block-versions", blockId],
    enabled: !!blockId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge_block_versions")
        .select("*, author:users(full_name)")
        .eq("block_id", blockId!)
        .order("version", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as (KnowledgeBlockVersion & {
        author: { full_name: string } | null;
      })[];
    },
  });
};

export const useUpdateKnowledgeBlock = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id, title, content, userId,
    }: { id: string; title: string; content: string; userId: string }) => {
      const { error } = await supabase
        .from("knowledge_blocks")
        .update({ title, content, updated_by: userId })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge-blocks"] });
      qc.invalidateQueries({ queryKey: ["knowledge-block-versions"] });
      qc.invalidateQueries({ queryKey: ["knowledge-bases"] });
      toast.success("Bloco atualizado — versão anterior guardada");
    },
    onError: (e: Error) => toast.error(`Erro ao salvar: ${e.message}`),
  });
};

export const useCreateKnowledgeBlock = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      kbId, title, content, position, userId,
    }: { kbId: string; title: string; content: string; position: number; userId: string }) => {
      const { error } = await supabase
        .from("knowledge_blocks")
        .insert({ kb_id: kbId, title, content, position, updated_by: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge-blocks"] });
      qc.invalidateQueries({ queryKey: ["knowledge-bases"] });
      toast.success("Bloco criado!");
    },
    onError: (e: Error) => toast.error(`Erro ao criar: ${e.message}`),
  });
};

export const useDeleteKnowledgeBlock = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("knowledge_blocks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge-blocks"] });
      qc.invalidateQueries({ queryKey: ["knowledge-bases"] });
      toast.success("Bloco removido");
    },
    onError: (e: Error) => toast.error(`Erro ao remover: ${e.message}`),
  });
};

// Regras ativas por agente — as correções que a diretoria promoveu a
// permanente. Entram no prompt depois do conhecimento.
export const useAgentRules = () => {
  const supabase = createClient();
  return useQuery({
    queryKey: ["agent-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_rules")
        .select("*, agent:agents(name, slug), author:users(full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as (AgentRule & {
        agent: { name: string; slug: string } | null;
        author: { full_name: string } | null;
      })[];
    },
  });
};

export const useToggleAgentRule = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("agent_rules").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-rules"] });
      toast.success("Regra atualizada");
    },
    onError: () => toast.error("Erro ao atualizar regra"),
  });
};

// Estimativa do contexto fixo de cada agente: prompt + tudo que ele lê.
// É o número que decide se algum dia vale ligar seleção por trecho —
// e hoje ele mostra o quanto ainda falta pra isso importar.
export const estimateTokens = (chars: number) => Math.round(chars / 3.5);
