"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/types/database";

export type AgentRun = Database["public"]["Tables"]["agent_runs"]["Row"];
export type AgentMessage = Database["public"]["Tables"]["agent_messages"]["Row"];
export type AgentArtifact = Database["public"]["Tables"]["agent_artifacts"]["Row"];

export type RunWithAgent = AgentRun & {
  agent: { id: string; name: string; slug: string; accent: string } | null;
  company: { id: string; name: string } | null;
  lead: { id: string; title: string } | null;
};

export const useAgentRuns = (agentId?: string) => {
  const supabase = createClient();
  return useQuery({
    queryKey: ["agent-runs", agentId ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("agent_runs")
        .select(
          `*, agent:agents(id, name, slug, accent),
           company:companies(id, name), lead:leads(id, title)`
        )
        .order("created_at", { ascending: false });
      if (agentId) query = query.eq("agent_id", agentId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as RunWithAgent[];
    },
  });
};

export const useAgentRun = (runId?: string) => {
  const supabase = createClient();
  return useQuery({
    queryKey: ["agent-run", runId],
    enabled: !!runId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_runs")
        .select(
          `*, agent:agents(id, name, slug, accent),
           company:companies(id, name), lead:leads(id, title)`
        )
        .eq("id", runId!)
        .single();
      if (error) throw error;
      return data as unknown as RunWithAgent;
    },
  });
};

export const useRunMessages = (runId?: string) => {
  const supabase = createClient();
  return useQuery({
    queryKey: ["agent-messages", runId],
    enabled: !!runId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_messages")
        .select("*")
        .eq("run_id", runId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as AgentMessage[];
    },
  });
};

export const useRunArtifacts = (runId?: string) => {
  const supabase = createClient();
  return useQuery({
    queryKey: ["agent-artifacts", runId],
    enabled: !!runId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_artifacts")
        .select("*")
        .eq("run_id", runId!)
        .neq("status", "substituido")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as AgentArtifact[];
    },
  });
};

export const useCreateRun = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      orgId: string; agentId: string; title: string;
      companyId?: string | null; leadId?: string | null; userId: string;
    }) => {
      const { data, error } = await supabase
        .from("agent_runs")
        .insert({
          org_id: input.orgId,
          agent_id: input.agentId,
          title: input.title,
          company_id: input.companyId ?? null,
          lead_id: input.leadId ?? null,
          created_by: input.userId,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data as { id: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-runs"] });
    },
    onError: (e: Error) => toast.error(`Erro ao abrir operação: ${e.message}`),
  });
};

// Validar é o gate. Enquanto o artefato está em rascunho, a fase
// seguinte não roda — a parada não depende do modelo obedecer.
export const useValidateArtifact = () => {
  const supabase = createClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { error } = await supabase
        .from("agent_artifacts")
        .update({ status: "validado", validated_by: userId, validated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["agent-artifacts"] });
      qc.invalidateQueries({ queryKey: ["agent-run"] });
      toast.success("Artefato validado — próxima fase liberada");
    },
    onError: (e: Error) => toast.error(`Erro ao validar: ${e.message}`),
  });
};

export interface RunStreamHandlers {
  onText: (chunk: string) => void;
  onRevalidating?: (issues: { rule: string; detail: string }[]) => void;
  onDone: (payload: {
    artifactId: string | null;
    artifactKind: string | null;
    revalidated: boolean;
    usage: { input: number; output: number; cacheRead: number; cacheWrite: number };
  }) => void;
  onError: (detail: string) => void;
}

/**
 * Consome o SSE da rota de execução. Streaming não é enfeite: as fases
 * demoram, e sem ele a requisição estoura o limite de tempo da Vercel.
 */
export async function runAgentPhase(
  body: { runId: string; phaseCode?: string; message?: string },
  handlers: RunStreamHandlers
) {
  const res = await fetch("/api/agents/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => ({ error: "falha" }));
    handlers.onError(err.detail ?? err.error ?? "Falha ao executar");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";

    for (const block of blocks) {
      const eventLine = block.split("\n").find((l) => l.startsWith("event: "));
      const dataLine = block.split("\n").find((l) => l.startsWith("data: "));
      if (!eventLine || !dataLine) continue;

      const event = eventLine.slice(7).trim();
      const data = JSON.parse(dataLine.slice(6));

      if (event === "text") handlers.onText(data.chunk);
      else if (event === "revalidating") handlers.onRevalidating?.(data.issues);
      else if (event === "done") handlers.onDone(data);
      else if (event === "error") handlers.onError(data.detail);
    }
  }
}
