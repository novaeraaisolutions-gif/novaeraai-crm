"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Send, Play, CheckCircle2, Lock, FileText, AlertTriangle, Loader2, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useAgents } from "@/lib/hooks/use-agents";
import {
  useAgentRun, useRunMessages, useRunArtifacts, useValidateArtifact,
  runAgentPhase, type AgentArtifact,
} from "@/lib/hooks/use-agent-runs";
import { useUser } from "@/lib/hooks/use-user";
import { useQueryClient } from "@tanstack/react-query";
import { formatDateTime } from "@/lib/utils/format";
import { toast } from "sonner";

export default function OperacaoPage() {
  const { runId } = useParams<{ runId: string }>();
  const { user } = useUser();
  const qc = useQueryClient();

  const { data: run } = useAgentRun(runId);
  const { data: agents = [] } = useAgents();
  const { data: messages = [] } = useRunMessages(runId);
  const { data: artifacts = [] } = useRunArtifacts(runId);
  const validate = useValidateArtifact();

  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [revalidating, setRevalidating] = useState<{ rule: string; detail: string }[] | null>(null);
  const [viewing, setViewing] = useState<AgentArtifact | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const agent = useMemo(
    () => agents.find((a) => a.id === run?.agent_id),
    [agents, run?.agent_id]
  );

  const validatedKinds = useMemo(
    () => new Set(artifacts.filter((a) => a.status === "validado").map((a) => a.kind)),
    [artifacts]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, streamText]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["agent-messages", runId] });
    qc.invalidateQueries({ queryKey: ["agent-artifacts", runId] });
    qc.invalidateQueries({ queryKey: ["agent-run", runId] });
  };

  const execute = async (body: { phaseCode?: string; message?: string }) => {
    setStreaming(true);
    setStreamText("");
    setRevalidating(null);
    await runAgentPhase(
      { runId, ...body },
      {
        onText: (chunk) => setStreamText((t) => t + chunk),
        onRevalidating: (issues) => setRevalidating(issues),
        onDone: (payload) => {
          setStreaming(false);
          setStreamText("");
          setRevalidating(null);
          refresh();
          if (payload.revalidated) {
            toast.warning("A primeira entrega não passou nas travas do método — foi regerada.");
          }
          if (payload.artifactKind) {
            toast.success(`${payload.artifactKind} gerado — revise e valide para liberar a próxima fase.`);
          }
        },
        onError: (detail) => {
          setStreaming(false);
          setStreamText("");
          setRevalidating(null);
          toast.error(detail);
        },
      }
    );
  };

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || streaming) return;
    setDraft("");
    await execute({ message: text });
  };

  if (!run || !agent) {
    return <div className="p-12 text-center text-sm" style={{ color: "#3D5A78" }}>Carregando...</div>;
  }

  const pendingArtifact = artifacts.find((a) => a.status === "rascunho");

  return (
    <div className="space-y-5">
      {/* cabeçalho */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link href="/agentes" className="text-xs flex items-center gap-1.5 mb-2" style={{ color: "#7BA3C6" }}>
            <ArrowLeft size={12} /> Agentes
          </Link>
          <h1 className="font-display font-bold text-2xl tracking-tight flex items-center gap-2.5" style={{ color: "#E2EBF8" }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: agent.accent }} />
            {run.title}
          </h1>
          <p className="text-sm mt-1" style={{ color: "#7BA3C6" }}>
            {agent.name}
            {run.company && ` · ${run.company.name}`}
            {` · aberta em ${formatDateTime(run.created_at)}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-5">

        {/* ── conversa ── */}
        <div className="flex flex-col gap-3">
          {messages.length === 0 && !streaming && (
            <div
              className="rounded-xl p-5 flex gap-3"
              style={{ background: "rgba(12,21,38,0.8)", border: "1px solid rgba(11,135,195,0.15)" }}
            >
              <Layers size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#0CA8F5" }} />
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-medium" style={{ color: "#E2EBF8" }}>Operação vazia</p>
                <p className="text-[13px] leading-relaxed" style={{ color: "#7BA3C6" }}>
                  Cole a transcrição ou o material na caixa abaixo e depois rode a primeira
                  fase pelo painel à direita. Conversar e executar fase são coisas diferentes:
                  conversa você usa para corrigir; fase é o botão.
                </p>
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl px-4 py-3 ${m.role === "user" ? "self-end max-w-[88%]" : ""}`}
              style={
                m.role === "user"
                  ? { background: "rgba(11,135,195,0.1)", border: "1px solid rgba(11,135,195,0.25)" }
                  : { background: "rgba(12,21,38,0.8)", border: "1px solid rgba(11,135,195,0.12)" }
              }
            >
              <p className="text-[10px] font-mono uppercase tracking-wider mb-1.5" style={{ color: "#3D5A78" }}>
                {m.role === "user" ? "Você" : agent.name}
                {m.phase_code && ` · Fase ${m.phase_code}`}
                {m.output_tokens ? ` · ${m.output_tokens.toLocaleString("pt-BR")} tokens` : ""}
              </p>
              <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap" style={{ color: m.role === "user" ? "#E2EBF8" : "#C3D4E8" }}>
                {m.content}
              </p>
            </div>
          ))}

          {revalidating && (
            <div
              className="rounded-xl px-4 py-3 flex gap-3"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)" }}
            >
              <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
              <div className="flex flex-col gap-1">
                <p className="text-[13px] font-medium" style={{ color: "#fcd34d" }}>
                  A entrega não passou nas travas do método — regerando
                </p>
                {revalidating.map((i, idx) => (
                  <p key={idx} className="text-[12px] leading-relaxed" style={{ color: "#7BA3C6" }}>
                    · {i.detail}
                  </p>
                ))}
              </div>
            </div>
          )}

          {streaming && (
            <div
              className="rounded-xl px-4 py-3"
              style={{ background: "rgba(12,21,38,0.8)", border: "1px solid rgba(11,135,195,0.12)" }}
            >
              <p className="text-[10px] font-mono uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: "#0CA8F5" }}>
                <Loader2 size={10} className="animate-spin" /> {agent.name} escrevendo
              </p>
              <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap" style={{ color: "#C3D4E8" }}>
                {streamText || "pensando..."}
              </p>
            </div>
          )}

          <div ref={bottomRef} />

          <div
            className="rounded-xl p-3 flex flex-col gap-2 sticky bottom-0"
            style={{ background: "rgba(12,21,38,0.95)", border: "1px solid rgba(11,135,195,0.15)" }}
          >
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Cole a transcrição, responda uma lacuna ou discorde de um achado..."
              rows={3}
              disabled={streaming}
              className="text-[13.5px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); sendMessage(); }
              }}
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px]" style={{ color: "#3D5A78" }}>⌘+Enter para enviar</span>
              <Button size="sm" onClick={sendMessage} disabled={!draft.trim() || streaming}>
                <Send size={13} className="mr-1.5" /> Enviar
              </Button>
            </div>
          </div>
        </div>

        {/* ── trilho ── */}
        <div className="flex flex-col gap-4">

          <div className="rounded-xl overflow-hidden" style={{ background: "rgba(12,21,38,0.8)", border: "1px solid rgba(11,135,195,0.15)" }}>
            <div className="px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider" style={{ background: "rgba(11,135,195,0.06)", borderBottom: "1px solid rgba(11,135,195,0.1)", color: "#3D5A78" }}>
              Fases
            </div>
            <div className="flex flex-col">
              {agent.phases.map((p) => {
                const produced = p.produces_artifact;
                const done = !!produced && validatedKinds.has(produced);
                const draftExists = artifacts.some((a) => a.kind === produced && a.status === "rascunho");
                return (
                  <div
                    key={p.id}
                    className="px-4 py-2.5 flex items-center gap-3"
                    style={{ borderBottom: "1px solid rgba(11,135,195,0.08)" }}
                  >
                    <span className="font-mono text-[11px] w-6 flex-shrink-0" style={{ color: "#3D5A78" }}>{p.code}</span>
                    <span className="text-[13px] flex-1 truncate" style={{ color: done ? "#7BA3C6" : "#E2EBF8" }}>
                      {p.name}
                    </span>
                    {done ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>
                        <CheckCircle2 size={9} /> validada
                      </span>
                    ) : draftExists ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: "rgba(11,135,195,0.12)", color: "#0CA8F5" }}>
                        revisar
                      </span>
                    ) : (
                      <button
                        onClick={() => execute({ phaseCode: p.code })}
                        disabled={streaming}
                        className="text-[11px] px-2 py-1 rounded flex items-center gap-1 disabled:opacity-40"
                        style={{ background: "rgba(11,135,195,0.1)", border: "1px solid rgba(11,135,195,0.25)", color: "#0CA8F5" }}
                      >
                        <Play size={9} /> rodar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {pendingArtifact && (
            <div
              className="rounded-xl p-4 flex flex-col gap-2.5"
              style={{ background: "rgba(11,135,195,0.06)", border: "1px dashed rgba(11,135,195,0.35)" }}
            >
              <p className="text-[13px] font-medium" style={{ color: "#E2EBF8" }}>
                {pendingArtifact.kind} aguardando validação
              </p>
              <p className="text-[12px] leading-relaxed" style={{ color: "#7BA3C6" }}>
                A próxima fase não roda enquanto isso não for validado. Revise antes —
                erro aqui contamina tudo que vem depois.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setViewing(pendingArtifact)}>
                  <FileText size={12} className="mr-1.5" /> Ler
                </Button>
                <Button
                  size="sm"
                  onClick={() => user && validate.mutate({ id: pendingArtifact.id, userId: user.id })}
                  disabled={validate.isPending}
                >
                  <CheckCircle2 size={12} className="mr-1.5" /> Validar
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-xl overflow-hidden" style={{ background: "rgba(12,21,38,0.8)", border: "1px solid rgba(11,135,195,0.15)" }}>
            <div className="px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider" style={{ background: "rgba(11,135,195,0.06)", borderBottom: "1px solid rgba(11,135,195,0.1)", color: "#3D5A78" }}>
              Artefatos
            </div>
            {artifacts.length === 0 ? (
              <p className="px-4 py-3 text-[12px]" style={{ color: "#3D5A78" }}>Nenhum ainda.</p>
            ) : (
              artifacts.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setViewing(a)}
                  className="px-4 py-2.5 flex items-center gap-3 w-full text-left"
                  style={{ borderBottom: "1px solid rgba(11,135,195,0.08)" }}
                >
                  <span className="font-mono text-[11px] w-6" style={{ color: "#3D5A78" }}>{a.kind}</span>
                  <span className="text-[13px] flex-1" style={{ color: "#E2EBF8" }}>v{a.version}</span>
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded"
                    style={
                      a.status === "validado"
                        ? { background: "rgba(34,197,94,0.12)", color: "#22c55e" }
                        : { background: "rgba(11,135,195,0.12)", color: "#0CA8F5" }
                    }
                  >
                    {a.status}
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="rounded-xl overflow-hidden" style={{ background: "rgba(12,21,38,0.8)", border: "1px solid rgba(11,135,195,0.15)" }}>
            <div className="px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider" style={{ background: "rgba(11,135,195,0.06)", borderBottom: "1px solid rgba(11,135,195,0.1)", color: "#3D5A78" }}>
              Conhecimento em uso
            </div>
            {agent.knowledge.map((k) => (
              <div key={k.id} className="px-4 py-2 flex items-center justify-between gap-2" style={{ borderBottom: "1px solid rgba(11,135,195,0.08)" }}>
                <span className="font-mono text-[11px] truncate" style={{ color: "#7BA3C6" }}>{k.slug}</span>
              </div>
            ))}
            <div className="px-4 py-2.5 flex items-center gap-2">
              <Lock size={10} style={{ color: "#3D5A78" }} />
              <span className="text-[11px]" style={{ color: "#3D5A78" }}>
                o resto do conhecimento não é acessível a este agente
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* leitor de artefato */}
      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewing?.kind} · v{viewing?.version}</DialogTitle>
            <DialogDescription>
              {viewing?.status === "validado"
                ? "Validado — é o que a próxima fase recebe como entrada."
                : "Rascunho. Validar libera a fase seguinte."}
              {viewing?.model && ` · ${viewing.model} · esforço ${viewing.effort}`}
            </DialogDescription>
          </DialogHeader>
          <p className="text-[13px] leading-relaxed whitespace-pre-wrap mt-1" style={{ color: "#C3D4E8" }}>
            {viewing?.content_md}
          </p>
          {viewing?.status === "rascunho" && user && (
            <div className="flex justify-end pt-3">
              <Button
                size="sm"
                onClick={() => { validate.mutate({ id: viewing.id, userId: user.id }); setViewing(null); }}
              >
                <CheckCircle2 size={13} className="mr-1.5" /> Validar {viewing.kind}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
