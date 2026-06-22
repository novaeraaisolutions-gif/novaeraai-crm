"use client";

import { useState } from "react";
import { Plus, Trash2, Lightbulb, User, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils/format";
import {
  useProjectImprovements,
  useCreateImprovement,
  useUpdateImprovement,
  useDeleteImprovement,
  IMPROVEMENT_STATUS_META,
  IMPROVEMENT_PRIORITY_META,
  type Improvement,
} from "@/lib/hooks/use-project-improvements";
import { useProjectProducts } from "@/lib/hooks/use-project-products";

interface Props {
  projectId: string;
  orgId: string;
}

const initialForm = {
  title: "",
  description: "",
  priority: "media" as Improvement["priority"],
  status: "sugerida" as Improvement["status"],
  source: "interno" as NonNullable<Improvement["source"]>,
  product_id: null as string | null,
  target_date: "",
};

export function ProjectImprovements({ projectId, orgId }: Props) {
  const { data: improvements = [], isLoading } = useProjectImprovements(projectId);
  const { data: products = [] } = useProjectProducts(projectId);
  const createImp = useCreateImprovement();
  const updateImp = useUpdateImprovement();
  const deleteImp = useDeleteImprovement();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Improvement | null>(null);
  const [form, setForm] = useState(initialForm);
  const [filter, setFilter] = useState<"all" | Improvement["status"]>("all");

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setOpen(true);
  };

  const openEdit = (imp: Improvement) => {
    setEditing(imp);
    setForm({
      title: imp.title,
      description: imp.description ?? "",
      priority: imp.priority,
      status: imp.status,
      source: imp.source ?? "interno",
      product_id: imp.product_id,
      target_date: imp.target_date ?? "",
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      priority: form.priority,
      status: form.status,
      source: form.source,
      product_id: form.product_id,
      target_date: form.target_date || null,
    };
    if (editing) {
      await updateImp.mutateAsync({ id: editing.id, projectId, ...payload });
    } else {
      await createImp.mutateAsync({ org_id: orgId, project_id: projectId, ...payload });
    }
    setOpen(false);
  };

  const filtered = filter === "all" ? improvements : improvements.filter((i) => i.status === filter);
  const groupedCount = {
    sugerida: improvements.filter((i) => i.status === "sugerida").length,
    aprovada: improvements.filter((i) => i.status === "aprovada").length,
    em_desenvolvimento: improvements.filter((i) => i.status === "em_desenvolvimento").length,
    entregue: improvements.filter((i) => i.status === "entregue").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Melhorias do Projeto</h3>
          <p className="text-xs text-text-muted mt-0.5">
            Anotações para próximas melhorias por produto ou do projeto
          </p>
        </div>
        <Button size="sm" onClick={openCreate} style={{ background: "var(--primary)" }}>
          <Plus size={14} className="mr-1.5" />
          Nova Melhoria
        </Button>
      </div>

      {/* Filter chips */}
      {improvements.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {([
            { value: "all", label: `Todas (${improvements.length})` },
            { value: "sugerida", label: `Sugeridas (${groupedCount.sugerida})` },
            { value: "aprovada", label: `Aprovadas (${groupedCount.aprovada})` },
            { value: "em_desenvolvimento", label: `Em dev (${groupedCount.em_desenvolvimento})` },
            { value: "entregue", label: `Entregues (${groupedCount.entregue})` },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                filter === opt.value
                  ? "border-[#0B87C3] text-primary bg-[#0B87C3]/10"
                  : "border-border text-text-muted hover:border-primary/30"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-text-muted">Carregando...</p>
      ) : improvements.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="Nenhuma melhoria registrada"
          description="Anote ideias e melhorias para o projeto."
          action={{ label: "Nova Melhoria", onClick: openCreate }}
        />
      ) : filtered.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-6">Nenhuma com esse filtro.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((imp) => {
            const statusMeta = IMPROVEMENT_STATUS_META[imp.status];
            const priorityMeta = IMPROVEMENT_PRIORITY_META[imp.priority];
            const product = imp.product_id ? products.find((p) => p.id === imp.product_id) : null;
            return (
              <div
                key={imp.id}
                onClick={() => openEdit(imp)}
                className="rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold text-text-primary">{imp.title}</p>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ background: `${statusMeta.color}20`, color: statusMeta.color }}
                      >
                        {statusMeta.label}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ background: `${priorityMeta.color}20`, color: priorityMeta.color }}
                      >
                        {priorityMeta.label}
                      </span>
                      {imp.source === "cliente" ? (
                        <span className="flex items-center gap-1 text-[10px] text-amber-700">
                          <User size={10} />
                          Pedido cliente
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-text-muted">
                          <Building size={10} />
                          Interno
                        </span>
                      )}
                      {product && (
                        <span className="text-[10px] text-primary">⟶ {product.name}</span>
                      )}
                    </div>
                    {imp.description && (
                      <p className="text-xs text-text-muted mt-1 line-clamp-2">{imp.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      {imp.target_date && (
                        <p className="text-[10px] text-text-muted">
                          🎯 Meta: {formatDate(imp.target_date)}
                        </p>
                      )}
                      {imp.completed_at && (
                        <p className="text-[10px] text-emerald-600">
                          ✓ Entregue {formatDate(imp.completed_at)}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Remover a melhoria "${imp.title}"?`)) {
                        deleteImp.mutate({ id: imp.id, projectId });
                      }
                    }}
                    className="p-1.5 rounded hover:bg-red-50 text-text-muted hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Melhoria" : "Nova Melhoria"}</DialogTitle>
            <DialogDescription>
              Anote ideias, sugestões e evoluções para esse projeto.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label htmlFor="imp-title">Título *</Label>
              <Input
                id="imp-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Adicionar exportação em PDF"
              />
            </div>

            <div>
              <Label htmlFor="imp-desc">Descrição</Label>
              <Textarea
                id="imp-desc"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Detalhes, contexto, motivação..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v as Improvement["status"] }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(IMPROVEMENT_STATUS_META).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prioridade</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm((f) => ({ ...f, priority: v as Improvement["priority"] }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(IMPROVEMENT_PRIORITY_META).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Produto (opcional)</Label>
                <Select
                  value={form.product_id ?? "__none__"}
                  onValueChange={(v) => setForm((f) => ({ ...f, product_id: v === "__none__" ? null : v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Projeto inteiro" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Projeto inteiro</SelectItem>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Origem</Label>
                <Select
                  value={form.source}
                  onValueChange={(v) => setForm((f) => ({ ...f, source: v as typeof f.source }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interno">Interno</SelectItem>
                    <SelectItem value="cliente">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="imp-date">Meta de entrega</Label>
              <Input
                id="imp-date"
                type="date"
                value={form.target_date}
                onChange={(e) => setForm((f) => ({ ...f, target_date: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.title.trim()}
              style={{ background: "var(--primary)" }}
            >
              {editing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
