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

/**
 * Os artefatos da corrente inteira, separando o que nasceu aqui do que
 * veio de trás.
 *
 * A separação existe porque a origem muda o que se pode fazer: o A2
 * herdado do Diagnóstico libera o gate da Arquitetura, mas quem quiser
 * corrigi-lo tem que voltar para a operação onde ele nasceu.
 */
export const useChainArtifacts = (runId?: string) => {
  const supabase = createClient();
  return useQuery({
    queryKey: ["agent-chain-artifacts", runId],
    enabled: !!runId,
    queryFn: async () => {
      const chain: string[] = [];
      let current: string | null = runId!;

      while (current && chain.length < 6 && !chain.includes(current)) {
        chain.push(current);
        const res: { data: { parent_run_id: string | null } | null } = await supabase
          .from("agent_runs")
          .select("parent_run_id")
          .eq("id", current)
          .maybeSingle();
        current = res.data?.parent_run_id ?? null;
      }

      const { data, error } = await supabase
        .from("agent_artifacts")
        .select("*")
        .in("run_id", chain)
        .neq("status", "substituido")
        .order("created_at", { ascending: true });
      if (error) throw error;

      const all = (data ?? []) as AgentArtifact[];
      return {
        chain,
        own: all.filter((a) => a.run_id === runId),
        inherited: all.filter((a) => a.run_id !== runId && a.status === "validado"),
      };
    },
  });
};

// Passa o bastão: abre a operação do próximo agente, encadeada nesta.
export const useHandoff = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (runId: string) => {
      const res = await fetch("/api/agents/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Falha no handoff");
      return json as { runId: string; agentName: string; duplicate: boolean };
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["agent-runs"] });
      toast.success(
        d.duplicate
          ? `Nova operação em ${d.agentName} — já havia uma anterior a partir desta.`
          : `Operação aberta em ${d.agentName}, com os artefatos validados a tiracolo.`
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export interface Fechamento {
  projeto: {
    nome: string; descricao: string; nivel: string;
    valor_implementacao: number; valor_mensal: number; plano: string; prazo_dias: number;
  };
  parcelas: { descricao: string; valor: number; percentual: number; marco: string; dias_apos_inicio: number }[];
  fases: { nome: string; dias_apos_inicio: number; marcos: string[] }[];
  custos: { descricao: string; categoria: string; tipo: string; valor: number }[];
  observacoes?: string;
}

// O agente relê o que produziu e preenche o formulário do CRM. Não
// escreve nada: o retorno é um rascunho para alguém conferir.
export const useCloseExtract = () => {
  return useMutation({
    mutationFn: async (runId: string) => {
      const res = await fetch("/api/agents/close/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Falha ao montar o fechamento");
      return json as { artifactId: string; fechamento: Fechamento };
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useCloseApply = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { runId: string; fechamento: Fechamento; startDate: string }) => {
      const res = await fetch("/api/agents/close/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Falha ao criar o projeto");
      return json as {
        projectId: string; projectCode: string; proposalId: string; proposalNumber: string;
      };
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ["agent-run"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["proposals"] });
      qc.invalidateQueries({ queryKey: ["installments"] });
      toast.success(`${d.projectCode} criado a partir de ${d.proposalNumber}.`);
    },
    onError: (e: Error) => toast.error(e.message),
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
