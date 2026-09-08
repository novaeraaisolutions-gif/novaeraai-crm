"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Send, Play, CheckCircle2, Lock, FileText, AlertTriangle, Loader2, Layers,
  ArrowRightCircle, Briefcase, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useAgents } from "@/lib/hooks/use-agents";
import {
  useAgentRun, useRunMessages, useValidateArtifact, useChainArtifacts,
  useHandoff, useCloseExtract, useCloseApply,
  runAgentPhase, type AgentArtifact, type Fechamento,
} from "@/lib/hooks/use-agent-runs";
import { wrapForPreview } from "@/lib/agents/documents";
import { formatCurrency } from "@/lib/utils/format";
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
  const { data: chain } = useChainArtifacts(runId);
  const validate = useValidateArtifact();
  const handoff = useHandoff();
  const extract = useCloseExtract();
  const applyClose = useCloseApply();

  const artifacts = useMemo(() => chain?.own ?? [], [chain]);
  const inherited = useMemo(() => chain?.inherited ?? [], [chain]);

  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [revalidating, setRevalidating] = useState<{ rule: string; detail: string }[] | null>(null);
  const [viewing, setViewing] = useState<AgentArtifact | null>(null);
  const [fechamento, setFechamento] = useState<Fechamento | null>(null);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const bottomRef = useRef<HTMLDivElement>(null);

  const agent = useMemo(
    () => agents.find((a) => a.id === run?.agent_id),
    [agents, run?.agent_id]
  );

  // O gate enxerga a corrente: o A2 herdado do Diagnóstico conta tanto
  // quanto um produzido aqui. Sem isso a Arquitetura nunca destravaria —
  // ela exige um artefato que, por desenho, nasce em outra operação.
  const validatedKinds = useMemo(
    () =>
      new Set(
        [...artifacts, ...inherited]
          .filter((a) => a.status === "validado")
          .map((a) => a.kind)
      ),
    [artifacts, inherited]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, streamText]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["agent-messages", runId] });
    qc.invalidateQueries({ queryKey: ["agent-chain-artifacts", runId] });
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

  const pendingArtifact = artifacts.find((a) => a.status === "rascunho" && a.kind !== "FECHAMENTO");

  // A esteira só avança quando o último artefato deste agente está
  // validado — é o mesmo critério do gate, aplicado à fronteira entre
  // agentes em vez de entre fases.
  const finalKind = [...agent.phases].reverse().find((p) => p.produces_artifact)?.produces_artifact;
  const readyToHandoff = !!finalKind && validatedKinds.has(finalKind) && !!agent.next_agent_slug;
  // Fechar depende do D2 validado, não de ser o último da esteira: quando
  // o agente de Contrato entrar na fila, a proposta continua fechável no
  // CRM sem depender de quem vem depois dela.
  const readyToClose = validatedKinds.has("D2") && !run.closed_project_id;

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
                const missing = ((p.requires_artifacts as string[] | null) ?? []).filter(
                  (r) => !validatedKinds.has(r)
                );
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
                    ) : missing.length > 0 ? (
                      <span
                        className="text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1"
                        style={{ background: "rgba(61,90,120,0.15)", color: "#3D5A78" }}
                        title={`Exige ${missing.join(" e ")} validado(s)`}
                      >
                        <Lock size={9} /> {missing.join("+")}
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

          {/* passagem de bastão */}
          {readyToHandoff && (
            <div
              className="rounded-xl p-4 flex flex-col gap-2.5"
              style={{ background: "rgba(34,197,94,0.06)", border: "1px dashed rgba(34,197,94,0.35)" }}
            >
              <p className="text-[13px] font-medium" style={{ color: "#E2EBF8" }}>
                {finalKind} validado — pronto para o próximo agente
              </p>
              <p className="text-[12px] leading-relaxed" style={{ color: "#7BA3C6" }}>
                Abre uma operação nova levando só os artefatos validados. A conversa
                daqui não vai junto: o próximo agente lê o documento fechado, não o
                caminho até ele.
              </p>
              <Button
                size="sm"
                onClick={() =>
                  handoff.mutate(runId, {
                    onSuccess: (d) => { window.location.href = `/agentes/${d.runId}`; },
                  })
                }
                disabled={handoff.isPending}
              >
                {handoff.isPending
                  ? <Loader2 size={13} className="mr-1.5 animate-spin" />
                  : <ArrowRightCircle size={13} className="mr-1.5" />}
                Passar adiante
              </Button>
            </div>
          )}

          {/* fechamento no CRM */}
          {readyToClose && (
            <div
              className="rounded-xl p-4 flex flex-col gap-2.5"
              style={{ background: "rgba(34,197,94,0.06)", border: "1px dashed rgba(34,197,94,0.35)" }}
            >
              <p className="text-[13px] font-medium" style={{ color: "#E2EBF8" }}>
                Proposta pronta — fechar no CRM
              </p>
              <p className="text-[12px] leading-relaxed" style={{ color: "#7BA3C6" }}>
                Cria projeto, proposta aceita, parcelas por marco, cronograma e os
                custos do A4. Você confere tudo antes de gravar.
              </p>
              <Button
                size="sm"
                onClick={() =>
                  extract.mutate(runId, { onSuccess: (d) => setFechamento(d.fechamento) })
                }
                disabled={extract.isPending}
              >
                {extract.isPending
                  ? <><Loader2 size={13} className="mr-1.5 animate-spin" /> Lendo a proposta…</>
                  : <><Briefcase size={13} className="mr-1.5" /> Montar fechamento</>}
              </Button>
            </div>
          )}

          {run.closed_project_id && (
            <Link
              href={`/projects/${run.closed_project_id}`}
              className="rounded-xl p-4 flex items-center gap-2.5"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)" }}
            >
              <CheckCircle2 size={15} style={{ color: "#22c55e" }} />
              <span className="text-[13px] flex-1" style={{ color: "#E2EBF8" }}>
                Virou projeto no CRM
              </span>
              <ExternalLink size={12} style={{ color: "#7BA3C6" }} />
            </Link>
          )}

          {inherited.length > 0 && (
            <div className="rounded-xl overflow-hidden" style={{ background: "rgba(12,21,38,0.8)", border: "1px solid rgba(11,135,195,0.15)" }}>
              <div className="px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider" style={{ background: "rgba(11,135,195,0.06)", borderBottom: "1px solid rgba(11,135,195,0.1)", color: "#3D5A78" }}>
                Herdados da esteira
              </div>
              {inherited.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setViewing(a)}
                  className="px-4 py-2.5 flex items-center gap-3 w-full text-left"
                  style={{ borderBottom: "1px solid rgba(11,135,195,0.08)" }}
                >
                  <span className="font-mono text-[11px] w-6" style={{ color: "#3D5A78" }}>{a.kind}</span>
                  <span className="text-[13px] flex-1" style={{ color: "#7BA3C6" }}>
                    de outra operação
                  </span>
                  <CheckCircle2 size={11} style={{ color: "#22c55e" }} />
                </button>
              ))}
              <p className="px-4 py-2.5 text-[11px] leading-relaxed" style={{ color: "#3D5A78" }}>
                Contam para o gate. Para corrigir um deles, volte à operação onde nasceu.
              </p>
            </div>
          )}

          <div className="rounded-xl overflow-hidden" style={{ background: "rgba(12,21,38,0.8)", border: "1px solid rgba(11,135,195,0.15)" }}>
            <div className="px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider" style={{ background: "rgba(11,135,195,0.06)", borderBottom: "1px solid rgba(11,135,195,0.1)", color: "#3D5A78" }}>
              Artefatos desta operação
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
          {viewing?.content_html ? (
            // D1 e D2 são documentos para o cliente. O sandbox sem
            // allow-scripts é o que separa "documento" de "código do
            // modelo rodando dentro da sessão autenticada do sócio".
            <iframe
              title={`${viewing.kind} v${viewing.version}`}
              sandbox=""
              srcDoc={wrapForPreview(viewing.content_html, `${viewing.kind} — ${run.title}`)}
              className="w-full rounded-lg bg-white"
              style={{ height: "62vh", border: "1px solid rgba(11,135,195,0.2)" }}
            />
          ) : (
            <p className="text-[13px] leading-relaxed whitespace-pre-wrap mt-1" style={{ color: "#C3D4E8" }}>
              {viewing?.content_md}
            </p>
          )}
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

      {/* conferência do fechamento */}
      <Dialog open={!!fechamento} onOpenChange={(v) => !v && setFechamento(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fechamento no CRM</DialogTitle>
            <DialogDescription>
              Transcrito da proposta pelo próprio agente. Confira os números antes de
              gravar — daqui eles vão para o financeiro.
            </DialogDescription>
          </DialogHeader>

          {fechamento && (
            <div className="flex flex-col gap-4 text-[13px]" style={{ color: "#C3D4E8" }}>
              <div className="rounded-lg p-3.5 flex flex-col gap-1.5" style={{ background: "rgba(11,135,195,0.06)", border: "1px solid rgba(11,135,195,0.15)" }}>
                <p className="font-medium text-[14px]" style={{ color: "#E2EBF8" }}>
                  {fechamento.projeto.nome}
                </p>
                <p className="text-[12px] leading-relaxed" style={{ color: "#7BA3C6" }}>
                  {fechamento.projeto.descricao}
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1.5 text-[12px]">
                  <span>Nível <b style={{ color: "#E2EBF8" }}>{fechamento.projeto.nivel}</b></span>
                  <span>Implementação <b style={{ color: "#E2EBF8" }}>{formatCurrency(fechamento.projeto.valor_implementacao)}</b></span>
                  <span>Mensalidade <b style={{ color: "#E2EBF8" }}>{formatCurrency(fechamento.projeto.valor_mensal)}</b></span>
                  <span>Prazo <b style={{ color: "#E2EBF8" }}>{fechamento.projeto.prazo_dias} dias</b></span>
                </div>
              </div>

              {fechamento.observacoes && (
                <div className="rounded-lg p-3 flex gap-2.5" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)" }}>
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
                  <p className="text-[12px] leading-relaxed" style={{ color: "#fcd34d" }}>
                    {fechamento.observacoes}
                  </p>
                </div>
              )}

              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider mb-1.5" style={{ color: "#3D5A78" }}>
                  Parcelas ({fechamento.parcelas.length})
                </p>
                {fechamento.parcelas.map((p, i) => (
                  <div key={i} className="flex items-baseline gap-3 py-1.5" style={{ borderBottom: "1px solid rgba(11,135,195,0.08)" }}>
                    <span className="flex-1">{p.descricao} <span style={{ color: "#3D5A78" }}>· {p.marco}</span></span>
                    <span className="font-mono text-[12px] tabular-nums" style={{ color: "#E2EBF8" }}>{formatCurrency(p.valor)}</span>
                    <span className="font-mono text-[11px] w-16 text-right" style={{ color: "#3D5A78" }}>D+{p.dias_apos_inicio}</span>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider mb-1.5" style={{ color: "#3D5A78" }}>
                  Cronograma ({fechamento.fases.length} fases)
                </p>
                {fechamento.fases.map((f, i) => (
                  <div key={i} className="py-1.5" style={{ borderBottom: "1px solid rgba(11,135,195,0.08)" }}>
                    <div className="flex items-baseline gap-3">
                      <span className="flex-1" style={{ color: "#E2EBF8" }}>{f.nome}</span>
                      <span className="font-mono text-[11px]" style={{ color: "#3D5A78" }}>D+{f.dias_apos_inicio}</span>
                    </div>
                    {f.marcos.length > 0 && (
                      <p className="text-[12px] mt-0.5" style={{ color: "#7BA3C6" }}>{f.marcos.join(" · ")}</p>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider mb-1.5" style={{ color: "#3D5A78" }}>
                  Custos ({fechamento.custos.length}) — é o que permite ver a margem real depois
                </p>
                {fechamento.custos.map((c, i) => (
                  <div key={i} className="flex items-baseline gap-3 py-1.5" style={{ borderBottom: "1px solid rgba(11,135,195,0.08)" }}>
                    <span className="flex-1">{c.descricao}</span>
                    <span className="font-mono text-[11px]" style={{ color: "#3D5A78" }}>{c.categoria} · {c.tipo}</span>
                    <span className="font-mono text-[12px] tabular-nums" style={{ color: "#E2EBF8" }}>{formatCurrency(c.valor)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-end justify-between gap-4 pt-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px]" style={{ color: "#7BA3C6" }}>
                    Início do projeto — as datas de parcela e fase saem daqui
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-44 text-[13px]"
                  />
                </div>
                <Button
                  onClick={() =>
                    applyClose.mutate(
                      { runId, fechamento, startDate },
                      { onSuccess: () => { setFechamento(null); refresh(); } }
                    )
                  }
                  disabled={applyClose.isPending}
                >
                  {applyClose.isPending
                    ? <><Loader2 size={13} className="mr-1.5 animate-spin" /> Gravando…</>
                    : <><Briefcase size={13} className="mr-1.5" /> Criar projeto no CRM</>}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
