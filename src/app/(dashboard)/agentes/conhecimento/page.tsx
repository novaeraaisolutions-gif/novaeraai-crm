"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen, ArrowLeft, Plus, History, Trash2, Save, X, Eye, AlertTriangle, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useKnowledgeBases, useKnowledgeBlocks, useBlockVersions,
  useUpdateKnowledgeBlock, useCreateKnowledgeBlock, useDeleteKnowledgeBlock,
  estimateTokens, type KnowledgeBlock,
} from "@/lib/hooks/use-agents";
import { useUser } from "@/lib/hooks/use-user";
import { formatDateTime } from "@/lib/utils/format";

export default function ConhecimentoPage() {
  const { user } = useUser();
  const isAdmin = user?.role === "admin";

  const { data: bases = [], isLoading } = useKnowledgeBases();
  const [selectedKb, setSelectedKb] = useState<string | undefined>();
  const { data: blocks = [] } = useKnowledgeBlocks(selectedKb);

  const [editing, setEditing] = useState<KnowledgeBlock | null>(null);
  const [creating, setCreating] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [historyFor, setHistoryFor] = useState<KnowledgeBlock | null>(null);
  const [deleting, setDeleting] = useState<KnowledgeBlock | null>(null);

  const { data: versions = [] } = useBlockVersions(historyFor?.id);
  const updateBlock = useUpdateKnowledgeBlock();
  const createBlock = useCreateKnowledgeBlock();
  const deleteBlock = useDeleteKnowledgeBlock();

  // Abre na primeira base assim que a lista chega.
  useEffect(() => {
    if (!selectedKb && bases.length) setSelectedKb(bases[0].id);
  }, [bases, selectedKb]);

  const base = useMemo(() => bases.find((b) => b.id === selectedKb), [bases, selectedKb]);
  const totalChars = bases.reduce((s, b) => s + b.charCount, 0);

  const openEdit = (b: KnowledgeBlock) => {
    setDraftTitle(b.title);
    setDraftContent(b.content);
    setEditing(b);
  };

  const openCreate = () => {
    setDraftTitle("");
    setDraftContent("");
    setCreating(true);
  };

  const handleSave = async () => {
    if (!user || !draftTitle.trim() || !draftContent.trim()) return;
    if (editing) {
      await updateBlock.mutateAsync({
        id: editing.id, title: draftTitle, content: draftContent, userId: user.id,
      });
      setEditing(null);
    } else if (creating && selectedKb) {
      await createBlock.mutateAsync({
        kbId: selectedKb, title: draftTitle, content: draftContent,
        position: blocks.length, userId: user.id,
      });
      setCreating(false);
    }
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
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link
            href="/agentes"
            className="text-xs flex items-center gap-1.5 mb-2"
            style={{ color: "#7BA3C6" }}
          >
            <ArrowLeft size={12} /> Agentes
          </Link>
          <h1 className="font-display font-bold text-3xl tracking-tight" style={{ color: "#E2EBF8" }}>
            Conhecimento
          </h1>
          <p className="text-sm mt-1" style={{ color: "#7BA3C6" }}>
            O que os agentes leem. Toda edição vira versão nova, com autor e data.
          </p>
        </div>
        <div
          className="rounded-lg px-4 py-2.5 text-right"
          style={{ background: "rgba(12,21,38,0.8)", border: "1px solid rgba(11,135,195,0.15)" }}
        >
          <p className="font-mono text-lg font-semibold" style={{ color: "#0CA8F5" }}>
            {estimateTokens(totalChars).toLocaleString("pt-BR")}
          </p>
          <p className="text-[10px]" style={{ color: "#3D5A78" }}>tokens no total</p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-sm" style={{ color: "#3D5A78" }}>Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-5">

          {/* ── bases ── */}
          <div className="flex flex-col gap-2">
            {bases.map((b) => {
              const active = b.id === selectedKb;
              const empty = b.blockCount === 0;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedKb(b.id)}
                  className="text-left rounded-lg p-3 transition-colors"
                  style={{
                    background: active ? "rgba(11,135,195,0.1)" : "rgba(12,21,38,0.8)",
                    border: `1px solid ${active ? "rgba(11,135,195,0.35)" : "rgba(11,135,195,0.12)"}`,
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="font-mono text-[11.5px] truncate"
                      style={{ color: active ? "#0CA8F5" : "#93B3D2" }}
                    >
                      {b.slug}
                    </span>
                    <span
                      className="text-[10px] font-mono flex-shrink-0"
                      style={{ color: empty ? "#f59e0b" : "#3D5A78" }}
                    >
                      {empty ? "vazia" : `${b.blockCount}`}
                    </span>
                  </div>
                  {b.readers.length > 0 ? (
                    <p className="text-[10.5px] mt-1.5 leading-snug" style={{ color: "#3D5A78" }}>
                      {b.readers.join(" · ")}
                    </p>
                  ) : (
                    <p className="text-[10.5px] mt-1.5" style={{ color: "#3D5A78" }}>
                      nenhum agente lê
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── blocos ── */}
          <div className="flex flex-col gap-4">
            {base && (
              <div
                className="rounded-xl p-4 flex items-start justify-between gap-4 flex-wrap"
                style={{ background: "rgba(12,21,38,0.8)", border: "1px solid rgba(11,135,195,0.15)" }}
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <h2 className="font-display font-semibold text-base" style={{ color: "#E2EBF8" }}>
                    {base.name}
                  </h2>
                  {base.description && (
                    <p className="text-[13px] leading-relaxed" style={{ color: "#7BA3C6" }}>
                      {base.description}
                    </p>
                  )}
                  <p className="text-[11px] mt-1 font-mono" style={{ color: "#3D5A78" }}>
                    {base.blockCount} blocos · {estimateTokens(base.charCount).toLocaleString("pt-BR")} tokens
                    {base.readers.length > 0 && ` · lida por ${base.readers.join(", ")}`}
                  </p>
                </div>
                <Button size="sm" onClick={openCreate} className="flex-shrink-0">
                  <Plus size={13} className="mr-1.5" /> Novo bloco
                </Button>
              </div>
            )}

            {base && base.blockCount === 0 && (
              <div
                className="rounded-xl p-4 flex gap-3"
                style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.22)" }}
              >
                <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
                <p className="text-[13px] leading-relaxed" style={{ color: "#7BA3C6" }}>
                  Base vazia. O agente que a lê continua funcionando — ele monta a estrutura e
                  pergunta os números em vez de inventar. Mas não fecha conta sozinho.
                </p>
              </div>
            )}

            {blocks.map((b) => (
              <div
                key={b.id}
                className="rounded-xl overflow-hidden"
                style={{ background: "rgba(12,21,38,0.8)", border: "1px solid rgba(11,135,195,0.12)" }}
              >
                <div
                  className="px-4 py-3 flex items-center justify-between gap-3"
                  style={{ borderBottom: "1px solid rgba(11,135,195,0.1)" }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <BookOpen size={13} className="flex-shrink-0" style={{ color: "#3D5A78" }} />
                    <span className="text-sm font-medium truncate" style={{ color: "#E2EBF8" }}>
                      {b.title}
                    </span>
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ background: "rgba(11,135,195,0.1)", color: "#0CA8F5" }}
                    >
                      v{b.version}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {b.version > 1 && (
                      <button
                        onClick={() => setHistoryFor(b)}
                        title="Histórico de versões"
                        className="p-1.5 rounded transition-colors"
                        style={{ color: "#7BA3C6" }}
                      >
                        <History size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(b)}
                      title="Editar"
                      className="p-1.5 rounded transition-colors"
                      style={{ color: "#7BA3C6" }}
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      onClick={() => setDeleting(b)}
                      title="Remover"
                      className="p-1.5 rounded transition-colors"
                      style={{ color: "#7BA3C6" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <p
                    className="text-[12.5px] leading-relaxed whitespace-pre-wrap"
                    style={{
                      color: "#7BA3C6",
                      display: "-webkit-box",
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {b.content}
                  </p>
                  <p className="text-[10.5px] mt-2 font-mono" style={{ color: "#3D5A78" }}>
                    {b.content.length.toLocaleString("pt-BR")} caracteres ·{" "}
                    {estimateTokens(b.content.length).toLocaleString("pt-BR")} tokens
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── editor ── */}
      <Dialog
        open={!!editing || creating}
        onOpenChange={(v) => { if (!v) { setEditing(null); setCreating(false); } }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar bloco" : "Novo bloco"}</DialogTitle>
            <DialogDescription>
              {editing
                ? `Versão atual v${editing.version}. Salvar guarda a anterior no histórico — nada é sobrescrito.`
                : "O bloco entra no fim da base. A ordem pode ser ajustada depois."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-1">
            <div className="space-y-1.5">
              <Label>Título</Label>
              <Input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="Ex: As oito lentes"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Conteúdo</Label>
              <Textarea
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                rows={18}
                className="font-mono text-[12.5px] leading-relaxed"
                placeholder="Markdown. É este texto que vai para o contexto do agente."
              />
              <p className="text-[11px] font-mono" style={{ color: "#3D5A78" }}>
                {draftContent.length.toLocaleString("pt-BR")} caracteres ·{" "}
                {estimateTokens(draftContent.length).toLocaleString("pt-BR")} tokens
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setEditing(null); setCreating(false); }}
              >
                <X size={13} className="mr-1.5" /> Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!draftTitle.trim() || !draftContent.trim() || updateBlock.isPending || createBlock.isPending}
              >
                <Save size={13} className="mr-1.5" />
                {editing ? "Salvar nova versão" : "Criar bloco"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── histórico ── */}
      <Dialog open={!!historyFor} onOpenChange={(v) => !v && setHistoryFor(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico · {historyFor?.title}</DialogTitle>
            <DialogDescription>
              Versões anteriores, da mais recente para a mais antiga. Elas são o que permite
              responder depois qual conhecimento o agente estava lendo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-1">
            {versions.length === 0 ? (
              <p className="text-sm py-4 text-center" style={{ color: "#3D5A78" }}>
                Ainda sem versões anteriores.
              </p>
            ) : (
              versions.map((v) => (
                <div
                  key={v.id}
                  className="rounded-lg overflow-hidden"
                  style={{ background: "rgba(11,135,195,0.04)", border: "1px solid rgba(11,135,195,0.12)" }}
                >
                  <div
                    className="px-3 py-2 flex items-center justify-between gap-3"
                    style={{ borderBottom: "1px solid rgba(11,135,195,0.1)" }}
                  >
                    <span className="text-[11px] font-mono" style={{ color: "#0CA8F5" }}>v{v.version}</span>
                    <span className="text-[11px]" style={{ color: "#3D5A78" }}>
                      {v.author?.full_name ?? "—"} · {formatDateTime(v.created_at)}
                    </span>
                  </div>
                  <p
                    className="px-3 py-2 text-[12px] leading-relaxed whitespace-pre-wrap font-mono"
                    style={{
                      color: "#7BA3C6",
                      display: "-webkit-box",
                      WebkitLineClamp: 6,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {v.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── remoção ── */}
      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover bloco?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleting?.title}</strong> sai do conhecimento dos agentes que leem esta
              base. O histórico de versões vai junto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (deleting) {
                  await deleteBlock.mutateAsync(deleting.id);
                  setDeleting(null);
                }
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
