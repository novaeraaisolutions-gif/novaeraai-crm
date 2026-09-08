"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Ban, ArrowRight, Layers, Lock, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAgents, useKnowledgeBases, estimateTokens } from "@/lib/hooks/use-agents";
import { useAgentRuns, useCreateRun } from "@/lib/hooks/use-agent-runs";
import { useCompanies } from "@/lib/hooks/use-companies";
import { useUser } from "@/lib/hooks/use-user";
import { formatDateTime } from "@/lib/utils/format";

const EFFORT_LABEL: Record<string, string> = {
  low: "baixo", medium: "médio", high: "alto", xhigh: "muito alto", max: "máximo",
};

export default function AgentesPage() {
  const { data: agents = [], isLoading } = useAgents();
  const { data: bases = [] } = useKnowledgeBases();
  const { data: runs = [] } = useAgentRuns();
  const { data: companies = [] } = useCompanies();
  const { user } = useUser();
  const router = useRouter();
  const createRun = useCreateRun();
  const isAdmin = user?.role === "admin";

  const [openFor, setOpenFor] = useState<{ id: string; name: string } | null>(null);
  const [title, setTitle] = useState("");
  const [companyId, setCompanyId] = useState("__none__");

  const startRun = async () => {
    if (!user || !openFor || !title.trim()) return;
    const created = await createRun.mutateAsync({
      orgId: user.org_id,
      agentId: openFor.id,
      title: title.trim(),
      companyId: companyId !== "__none__" ? companyId : null,
      userId: user.id,
    });
    setOpenFor(null);
    setTitle("");
    setCompanyId("__none__");
    router.push(`/agentes/${created.id}`);
  };

  const runsByAgent = (agentId: string) =>
    runs.filter((r) => r.agent_id === agentId && r.status === "em_andamento");

  // Contexto fixo de cada agente: o prompt mais tudo que ele lê. É o
  // número que decide se um dia vale ligar seleção por trecho.
  const charsByBase = new Map(bases.map((b) => [b.id, b.charCount]));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-3xl tracking-tight" style={{ color: "#E2EBF8" }}>
            Agentes
          </h1>
          <p className="text-sm mt-1" style={{ color: "#7BA3C6" }}>
            Diagnóstico, arquitetura e proposta assistidos — cada um isolado do que não
            deve enxergar
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/agentes/conhecimento"
            className="flex items-center gap-2 text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
            style={{ background: "rgba(11,135,195,0.1)", border: "1px solid rgba(11,135,195,0.25)", color: "#0CA8F5" }}
          >
            <BookOpen size={15} />
            Conhecimento
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-sm" style={{ color: "#3D5A78" }}>Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {agents.map((agent) => {
            const knowledgeChars = agent.knowledge.reduce(
              (sum, k) => sum + (charsByBase.get(k.id) ?? 0), 0
            );
            const contextTokens = estimateTokens(knowledgeChars + agent.system_prompt.length);
            const disabled = !agent.active;

            return (
              <div
                key={agent.id}
                className="rounded-xl overflow-hidden flex flex-col"
                style={{
                  background: "rgba(12,21,38,0.8)",
                  border: "1px solid rgba(11,135,195,0.15)",
                  opacity: disabled ? 0.62 : 1,
                }}
              >
                {/* cabeçalho */}
                <div className="p-5 pb-4 flex flex-col gap-2.5" style={{ borderBottom: "1px solid rgba(11,135,195,0.1)" }}>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-display font-semibold text-lg flex items-center gap-2.5" style={{ color: "#E2EBF8" }}>
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: agent.accent }} />
                      {agent.name}
                    </h2>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                      style={
                        disabled
                          ? { background: "rgba(255,255,255,0.04)", color: "#3D5A78" }
                          : { background: "rgba(11,135,195,0.12)", color: "#0CA8F5" }
                      }
                    >
                      {disabled
                        ? "aguardando material"
                        : runsByAgent(agent.id).length > 0
                        ? `${runsByAgent(agent.id).length} em andamento`
                        : `${agent.phases.length} fases`}
                    </span>
                  </div>
                  {agent.tagline && (
                    <p className="text-sm" style={{ color: "#93B3D2" }}>{agent.tagline}</p>
                  )}
                </div>

                {/* corpo */}
                <div className="p-5 flex flex-col gap-4 flex-1">
                  {agent.description && (
                    <p className="text-sm leading-relaxed" style={{ color: "#7BA3C6" }}>
                      {agent.description}
                    </p>
                  )}

                  {agent.phases.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#3D5A78" }}>
                        Fases
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {agent.phases.map((p) => (
                          <span
                            key={p.id}
                            title={`${p.name} · esforço ${EFFORT_LABEL[p.effort] ?? p.effort}${p.produces_artifact ? ` · produz ${p.produces_artifact}` : ""}`}
                            className="text-[11px] px-2 py-1 rounded font-mono"
                            style={{
                              background: "rgba(11,135,195,0.06)",
                              border: "1px solid rgba(11,135,195,0.15)",
                              color: p.produces_artifact ? "#0CA8F5" : "#7BA3C6",
                            }}
                          >
                            {p.code}
                            {p.produces_artifact && (
                              <span style={{ color: "#3D5A78" }}> → {p.produces_artifact}</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {agent.knowledge.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "#3D5A78" }}>
                        <Layers size={10} /> Lê
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {agent.knowledge.map((k) => (
                          <span
                            key={k.id}
                            className="text-[10.5px] px-2 py-0.5 rounded font-mono"
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(11,135,195,0.12)", color: "#7BA3C6" }}
                          >
                            {k.slug.replace(/^NE-/, "")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* o que ele nunca faz — parte da definição, não rodapé */}
                  {agent.never_does && (
                    <div
                      className="rounded-r-lg p-3 flex gap-2.5"
                      style={{ background: "rgba(239,68,68,0.06)", borderLeft: "2px solid rgba(239,68,68,0.6)" }}
                    >
                      <Ban size={13} className="flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} />
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#ef4444" }}>
                          Nunca
                        </span>
                        <p className="text-[12.5px] leading-relaxed" style={{ color: "#C99" }}>
                          {agent.never_does}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* rodapé */}
                <div
                  className="px-5 py-3 flex items-center justify-between gap-3"
                  style={{ borderTop: "1px solid rgba(11,135,195,0.1)", background: "rgba(11,135,195,0.03)" }}
                >
                  <span className="text-[11px] font-mono" style={{ color: "#3D5A78" }}>
                    {disabled ? "—" : `${contextTokens.toLocaleString("pt-BR")} tokens de contexto fixo`}
                  </span>
                  <button
                    onClick={() => !disabled && setOpenFor({ id: agent.id, name: agent.name })}
                    disabled={disabled}
                    className="text-[12px] font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 disabled:cursor-not-allowed"
                    style={
                      disabled
                        ? { border: "1px solid rgba(11,135,195,0.15)", color: "#3D5A78" }
                        : { background: "linear-gradient(135deg,#0B87C3,#0CA8F5)", color: "#fff" }
                    }
                  >
                    <Plus size={12} /> Nova operação
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* operações */}
      {runs.length > 0 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "rgba(12,21,38,0.8)", border: "1px solid rgba(11,135,195,0.15)" }}
        >
          <div
            className="px-5 py-3 text-[10px] font-mono uppercase tracking-wider flex items-center gap-2"
            style={{ borderBottom: "1px solid rgba(11,135,195,0.1)", color: "#3D5A78" }}
          >
            <Clock size={11} /> Operações
          </div>
          {runs.slice(0, 12).map((r) => (
            <Link
              key={r.id}
              href={`/agentes/${r.id}`}
              className="px-5 py-3 flex items-center gap-3"
              style={{ borderBottom: "1px solid rgba(11,135,195,0.08)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: r.agent?.accent ?? "#3D5A78" }}
              />
              <span className="text-sm flex-1 truncate" style={{ color: "#E2EBF8" }}>{r.title}</span>
              <span className="text-[11px] hidden sm:inline" style={{ color: "#7BA3C6" }}>{r.agent?.name}</span>
              {r.current_phase && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: "rgba(11,135,195,0.1)", color: "#0CA8F5" }}>
                  Fase {r.current_phase}
                </span>
              )}
              <span className="text-[11px] hidden md:inline" style={{ color: "#3D5A78" }}>
                {formatDateTime(r.created_at)}
              </span>
              <ArrowRight size={12} style={{ color: "#3D5A78" }} />
            </Link>
          ))}
        </div>
      )}

      {!isAdmin && (
        <p className="text-[12px] flex items-center gap-1.5" style={{ color: "#3D5A78" }}>
          <Lock size={11} /> A edição do conhecimento é restrita à diretoria.
        </p>
      )}

      <Dialog open={!!openFor} onOpenChange={(v) => !v && setOpenFor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova operação · {openFor?.name}</DialogTitle>
            <DialogDescription>
              Cada cliente é uma operação nova, começando do zero. Nada da conversa de um
              cliente atravessa para a de outro.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-1">
            <div className="space-y-1.5">
              <Label>Identificação *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Trietel · Diagnóstico"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cliente</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sem cliente vinculado</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={() => setOpenFor(null)}>Cancelar</Button>
              <Button size="sm" onClick={startRun} disabled={!title.trim() || createRun.isPending}>
                Abrir operação
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
