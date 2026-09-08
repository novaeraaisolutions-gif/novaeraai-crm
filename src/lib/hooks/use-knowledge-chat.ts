"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/types/database";

export type KnowledgeMessage = Database["public"]["Tables"]["agent_knowledge_messages"]["Row"];

export interface Proposal {
  tipo: "editar_bloco" | "criar_bloco" | "criar_regra";
  block_id?: string;
  kb_slug?: string;
  titulo?: string;
  conteudo?: string;
  phase_code?: string;
  motivo?: string;
}

// Uma conversa por agente, com memória própria. É a memória de curadoria
// daquele agente — separada das operações de cliente, que começam do zero.
export const useKnowledgeChat = (agentId?: string) => {
  const supabase = createClient();
  return useQuery({
    queryKey: ["knowledge-chat", agentId],
    enabled: !!agentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_knowledge_messages")
        .select("*")
        .eq("agent_id", agentId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as KnowledgeMessage[];
    },
  });
};

export const useSendKnowledgeMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ agentId, message }: { agentId: string; message: string }) => {
      const res = await fetch("/api/agents/knowledge-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, message }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Falha na conversa");
      return json as { text: string; proposal: Proposal | null };
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["knowledge-chat", vars.agentId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDecideProposal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      messageId, decision,
    }: { messageId: string; decision: "aplicar" | "descartar"; agentId: string }) => {
      const res = await fetch("/api/agents/knowledge-chat/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, decision }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Falha ao decidir");
      return json as { applied: boolean };
    },
    onSuccess: (data, vars) => {
      qc.invalidateQueries({ queryKey: ["knowledge-chat", vars.agentId] });
      qc.invalidateQueries({ queryKey: ["knowledge-bases"] });
      qc.invalidateQueries({ queryKey: ["knowledge-blocks"] });
      qc.invalidateQueries({ queryKey: ["agent-rules"] });
      toast.success(
        data.applied
          ? "Aplicado — vale a partir da próxima geração"
          : "Proposta descartada"
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
