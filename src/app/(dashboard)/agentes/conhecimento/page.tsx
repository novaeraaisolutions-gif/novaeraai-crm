"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Send, Check, X, Lock, Loader2, FileEdit, FilePlus, Scale, BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useAgents, useKnowledgeBases, useAgentRules, estimateTokens } from "@/lib/hooks/use-agents";
import {
  useKnowledgeChat, useSendKnowledgeMessage, useDecideProposal, type Proposal,
} from "@/lib/hooks/use-knowledge-chat";
import { useUser } from "@/lib/hooks/use-user";
import { formatDateTime } from "@/lib/utils/format";

const PROPOSAL_META: Record<string, { icon: typeof FileEdit; label: string; color: string }> = {
  editar_bloco: { icon: FileEdit, label: "Reescrever conhecimento", color: "#0CA8F5" },
  criar_bloco: { icon: FilePlus, label: "Adicionar conhecimento", color: "#22c55e" },
  criar_regra: { icon: Scale, label: "Nova regra de comportamento", color: "#f59e0b" },
};

export default function ConhecimentoPage() {
  const { user } = useUser();
  const isAdmin = user?.role === "admin";

  const { data: agents = [] } = useAgents();
  const { data: bases = [] } = useKnowledgeBases();
  const { data: rules = [] } = useAgentRules();

  const [agentId, setAgentId] = useState<string | undefined>();
  const { data: messages = [] } = useKnowledgeChat(agentId);
  const send = useSendKnowledgeMessage();
  const decide = useDecideProposal();

  const [draft, setDraft] = useState("");
  const [viewingRules, setViewingRules] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const usable = useMemo(() => agents.filter((a) => a.active), [agents]);

  useEffect(() => {
    if (!agentId && usable.length) setAgentId(usable[0].id);
  }, [usable, agentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, send.isPending]);

  const agent = useMemo(() => agents.find((a) => a.id === agentId), [agents, agentId]);
  const charsByBase = new Map(bases.map((b) => [b.id, b.charCount]));

  const agentRules = rules.filter((r) => r.agent_id === agentId && r.active);
  const knowledgeChars = (agent?.knowledge ?? []).reduce(
    (sum, k) => sum + (charsByBase.get(k.id) ?? 0), 0
  );

  const submit = async () => {
    const text = draft.trim();
    if (!text || !agentId || send.isPending) return;
    setDraft("");
    await send.mutateAsync({ agentId, message: text });
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Lock size={28} style={{ color: "#3D5A78" }} />
        <p className="text-sm" style={{ color: "#7BA3C6" }}>
          O conhecimento dos agentes é editável apenas pela diretoria.
        </p>
        <Link href="/agentes" className="text-sm" style={{ color: "#0CA8F5" }}>
          Voltar para Agentes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/agentes" className="text-xs flex items-center gap-1.5 mb-2" style={{ color: "#7BA3C6" }}>
          <ArrowLeft size={12} /> Agentes
        </Link>
        <h1 className="font-display font-bold text-3xl tracking-tight" style={{ color: "#E2EBF8" }}>
          Conhecimento
        </h1>
        <p className="text-sm mt-1" style={{ color: "#7BA3C6" }}>
          Converse com o agente sobre o que ele sabe. Ele propõe a alteração, você confirma.
        </p>
      </div>

      {/* seletor de agente — cada um tem a própria conversa e a própria memória */}
      <div className="flex gap-2 flex-wrap">
        {usable.map((a) => {
          const active = a.id === agentId;
          return (
            <button
              key={a.id}
              onClick={() => setAgentId(a.id)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm transition-colors"
              style={{
                background: active ? "rgba(11,135,195,0.12)" : "rgba(12,21,38,0.8)",
                border: `1px solid ${active ? "rgba(11,135,195,0.35)" : "rgba(11,135,195,0.12)"}`,
                color: active ? "#E2EBF8" : "#7BA3C6",
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: a.accent }} />
              {a.name}
            </button>
          );
        })}
      </div>

      {agent && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-5">

          {/* ── conversa ── */}
          <div className="flex flex-col gap-3">
            {messages.length === 0 && !send.isPending && (
              <div
                className="rounded-xl p-5 flex flex-col gap-2.5"
                style={{ background: "rgba(12,21,38,0.8)", border: "1px solid rgba(11,135,195,0.15)" }}
              >
                <p className="text-sm font-medium" style={{ color: "#E2EBF8" }}>
                  Diga o que mudou
                </p>
                <p className="text-[13px] leading-relaxed" style={{ color: "#7BA3C6" }}>
                  O {agent.name} conhece tudo o que ele mesmo lê. Escreva a correção em
                  linguagem normal — ele acha onde aquilo vive e propõe a mudança.
                </p>
                <div className="flex flex-col gap-1.5 mt-1">
                  {[
                    "O piso de mensalidade mudou para R$ 1.200.",
                    "Nunca recomende prazo de implementação menor que 45 dias.",
                    "O que você sabe sobre precificação de manutenção?",
                  ].map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setDraft(ex)}
                      className="text-left text-[12.5px] px-3 py-2 rounded-lg"
                      style={{ background: "rgba(11,135,195,0.05)", border: "1px solid rgba(11,135,195,0.12)", color: "#93B3D2" }}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => {
              const proposal = m.proposal as Proposal | null;
              const meta = proposal ? PROPOSAL_META[proposal.tipo] : null;
              const Icon = meta?.icon;

              return (
                <div key={m.id} className="flex flex-col gap-2">
                  <div
                    className={`rounded-xl px-4 py-3 ${m.role === "user" ? "self-end max-w-[88%]" : ""}`}
                    style={
                      m.role === "user"
                        ? { background: "rgba(11,135,195,0.1)", border: "1px solid rgba(11,135,195,0.25)" }
                        : { background: "rgba(12,21,38,0.8)", border: "1px solid rgba(11,135,195,0.12)" }
                    }
                  >
                    <p className="text-[10px] font-mono uppercase tracking-wider mb-1.5" style={{ color: "#3D5A78" }}>
                      {m.role === "user" ? "Você" : agent.name}
                    </p>
                    <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap" style={{ color: m.role === "user" ? "#E2EBF8" : "#C3D4E8" }}>
                      {m.content}
                    </p>
                  </div>

                  {proposal && meta && Icon && (
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{
                        background: "rgba(12,21,38,0.9)",
                        border: `1px solid ${m.status === "pendente" ? meta.color + "55" : "rgba(11,135,195,0.12)"}`,
                      }}
                    >
                      <div
                        className="px-4 py-2.5 flex items-center justify-between gap-3"
                        style={{ borderBottom: "1px solid rgba(11,135,195,0.1)" }}
                      >
                        <span className="text-[12px] font-medium flex items-center gap-2" style={{ color: meta.color }}>
                          <Icon size={13} /> {meta.label}
                        </span>
                        {m.status !== "pendente" && (
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded"
                            style={
                              m.status === "aplicada"
                                ? { background: "rgba(34,197,94,0.12)", color: "#22c55e" }
                                : { background: "rgba(255,255,255,0.04)", color: "#3D5A78" }
                            }
                          >
                            {m.status === "aplicada" ? "aplicada" : "descartada"}
                          </span>
                        )}
                      </div>

                      <div className="px-4 py-3 flex flex-col gap-2.5">
                        {proposal.motivo && (
                          <p className="text-[12.5px] leading-relaxed" style={{ color: "#93B3D2" }}>
                            {proposal.motivo}
                          </p>
                        )}
                        {proposal.titulo && (
                          <p className="text-[12px] font-mono" style={{ color: "#7BA3C6" }}>
                            {proposal.kb_slug ? `${proposal.kb_slug} · ` : ""}{proposal.titulo}
                          </p>
                        )}
                        {proposal.conteudo && (
                          <div
                            className="rounded-lg px-3 py-2.5 max-h-52 overflow-y-auto"
                            style={{ background: "rgba(11,135,195,0.04)", border: "1px solid rgba(11,135,195,0.1)" }}
                          >
                            <p className="text-[12px] leading-relaxed whitespace-pre-wrap font-mono" style={{ color: "#7BA3C6" }}>
                              {proposal.conteudo}
                            </p>
                          </div>
                        )}
                        {proposal.phase_code && (
                          <p className="text-[11px] font-mono" style={{ color: "#3D5A78" }}>
                            vale na fase {proposal.phase_code}
                          </p>
                        )}
                      </div>

                      {m.status === "pendente" && (
                        <div
                          className="px-4 py-2.5 flex items-center justify-between gap-3"
                          style={{ borderTop: "1px solid rgba(11,135,195,0.1)", background: "rgba(11,135,195,0.03)" }}
                        >
                          <span className="text-[11px]" style={{ color: "#3D5A78" }}>
                            Nada muda até você confirmar
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm" variant="outline"
                              disabled={decide.isPending}
                              onClick={() => decide.mutate({ messageId: m.id, decision: "descartar", agentId: agent.id })}
                            >
                              <X size={12} className="mr-1.5" /> Descartar
                            </Button>
                            <Button
                              size="sm"
                              disabled={decide.isPending}
                              onClick={() => decide.mutate({ messageId: m.id, decision: "aplicar", agentId: agent.id })}
                            >
                              <Check size={12} className="mr-1.5" /> Aplicar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {send.isPending && (
              <div
                className="rounded-xl px-4 py-3 flex items-center gap-2"
                style={{ background: "rgba(12,21,38,0.8)", border: "1px solid rgba(11,135,195,0.12)" }}
              >
                <Loader2 size={12} className="animate-spin" style={{ color: "#0CA8F5" }} />
                <span className="text-[12.5px]" style={{ color: "#7BA3C6" }}>
                  {agent.name} está lendo o que sabe...
                </span>
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
                placeholder={`O que mudou no conhecimento do ${agent.name}?`}
                rows={3}
                disabled={send.isPending}
                className="text-[13.5px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); submit(); }
                }}
              />
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px]" style={{ color: "#3D5A78" }}>⌘+Enter para enviar</span>
                <Button size="sm" onClick={submit} disabled={!draft.trim() || send.isPending}>
                  <Send size={13} className="mr-1.5" /> Enviar
                </Button>
              </div>
            </div>
          </div>

          {/* ── o que este agente sabe ── */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl overflow-hidden" style={{ background: "rgba(12,21,38,0.8)", border: "1px solid rgba(11,135,195,0.15)" }}>
              <div className="px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider flex items-center gap-2" style={{ background: "rgba(11,135,195,0.06)", borderBottom: "1px solid rgba(11,135,195,0.1)", color: "#3D5A78" }}>
                <BookOpen size={11} /> O que ele lê
              </div>
              {agent.knowledge.map((k) => {
                const b = bases.find((x) => x.id === k.id);
                return (
                  <div key={k.id} className="px-4 py-2.5 flex items-center justify-between gap-2" style={{ borderBottom: "1px solid rgba(11,135,195,0.08)" }}>
                    <span className="font-mono text-[11px] truncate" style={{ color: "#93B3D2" }}>{k.slug}</span>
                    <span className="text-[10.5px] font-mono flex-shrink-0" style={{ color: b?.blockCount ? "#3D5A78" : "#f59e0b" }}>
                      {b?.blockCount ? `${b.blockCount} blocos` : "vazia"}
                    </span>
                  </div>
                );
              })}
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-[11px]" style={{ color: "#3D5A78" }}>contexto fixo</span>
                <span className="text-[11px] font-mono" style={{ color: "#0CA8F5" }}>
                  {estimateTokens(knowledgeChars + agent.system_prompt.length).toLocaleString("pt-BR")} tokens
                </span>
              </div>
            </div>

            <button
              onClick={() => setViewingRules(true)}
              className="rounded-xl px-4 py-3 flex items-center justify-between gap-2 text-left"
              style={{ background: "rgba(12,21,38,0.8)", border: "1px solid rgba(11,135,195,0.15)" }}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px]" style={{ color: "#E2EBF8" }}>Regras ativas</span>
                <span className="text-[11px]" style={{ color: "#3D5A78" }}>
                  {agentRules.length === 0 ? "nenhuma ainda" : "podem se contradizer — vale revisar"}
                </span>
              </div>
              <span className="text-lg font-mono" style={{ color: agentRules.length ? "#f59e0b" : "#3D5A78" }}>
                {agentRules.length}
              </span>
            </button>

            <div
              className="rounded-xl p-4"
              style={{ background: "rgba(11,135,195,0.04)", border: "1px solid rgba(11,135,195,0.12)" }}
            >
              <p className="text-[12px] leading-relaxed" style={{ color: "#7BA3C6" }}>
                Correção aplicada vale na <strong style={{ color: "#93B3D2" }}>próxima geração</strong>.
                Não há reindexação nem espera. Cada artefato guarda a versão que estava
                valendo quando foi gerado.
              </p>
            </div>
          </div>
        </div>
      )}

      <Dialog open={viewingRules} onOpenChange={setViewingRules}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Regras ativas · {agent?.name}</DialogTitle>
            <DialogDescription>
              Entram no prompt depois do conhecimento, e valem sobre ele. Regras que se
              contradizem fazem o agente escolher uma arbitrariamente — vale podar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-1">
            {agentRules.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: "#3D5A78" }}>
                Nenhuma regra ainda. Elas nascem das correções que você promover a permanentes.
              </p>
            ) : (
              agentRules.map((r) => (
                <div
                  key={r.id}
                  className="rounded-lg px-3.5 py-3"
                  style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)" }}
                >
                  <p className="text-[13px] leading-relaxed" style={{ color: "#E2EBF8" }}>{r.content}</p>
                  <p className="text-[11px] mt-1.5 font-mono" style={{ color: "#3D5A78" }}>
                    {r.phase_code ? `fase ${r.phase_code} · ` : "todas as fases · "}
                    {r.author?.full_name ?? "—"} · {formatDateTime(r.created_at)}
                  </p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
