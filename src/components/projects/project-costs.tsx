"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, DollarSign } from "lucide-react";
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
import { formatCurrency, formatDate } from "@/lib/utils/format";
import {
  useProjectCosts,
  useCreateProjectCost,
  useUpdateProjectCost,
  useDeleteProjectCost,
  COST_TYPE_META,
  COST_CATEGORY_META,
  type ProjectCost,
} from "@/lib/hooks/use-project-costs";
import { useProjectProducts } from "@/lib/hooks/use-project-products";

interface Props {
  projectId: string;
  orgId: string;
}

const initialForm = {
  description: "",
  amount: "",
  cost_type: "implementacao" as ProjectCost["cost_type"],
  category: "outros" as ProjectCost["category"],
  product_id: null as string | null,
  incurred_date: "",
  notes: "",
  status: "previsto" as ProjectCost["status"],
};

export function ProjectCosts({ projectId, orgId }: Props) {
  const { data: costs = [], isLoading } = useProjectCosts(projectId);
  const { data: products = [] } = useProjectProducts(projectId);
  const createCost = useCreateProjectCost();
  const updateCost = useUpdateProjectCost();
  const deleteCost = useDeleteProjectCost();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectCost | null>(null);
  const [form, setForm] = useState(initialForm);

  const totals = useMemo(() => {
    const t = {
      total: 0,
      paid: 0,
      pending: 0,
      implementacao: 0,
      mensal: 0,
      eventual: 0,
    };
    for (const c of costs) {
      if (c.status === "cancelado") continue;
      const v = Number(c.amount);
      t.total += v;
      if (c.status === "pago") t.paid += v;
      else t.pending += v;
      if (c.cost_type === "implementacao") t.implementacao += v;
      else if (c.cost_type === "mensal_recorrente") t.mensal += v;
      else t.eventual += v;
    }
    return t;
  }, [costs]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setOpen(true);
  };

  const openEdit = (c: ProjectCost) => {
    setEditing(c);
    setForm({
      description: c.description,
      amount: String(c.amount),
      cost_type: c.cost_type,
      category: c.category,
      product_id: c.product_id,
      incurred_date: c.incurred_date ?? "",
      notes: c.notes ?? "",
      status: c.status,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.description.trim() || !form.amount) return;
    const payload = {
      description: form.description.trim(),
      amount: parseFloat(form.amount),
      cost_type: form.cost_type,
      category: form.category,
      product_id: form.product_id,
      incurred_date: form.incurred_date || null,
      notes: form.notes.trim() || null,
      status: form.status,
    };
    if (editing) {
      await updateCost.mutateAsync({ id: editing.id, projectId, ...payload });
    } else {
      await createCost.mutateAsync({ org_id: orgId, project_id: projectId, ...payload });
    }
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#0F172A]">Custos do Projeto</h3>
          <p className="text-xs text-text-muted mt-0.5">
            Implementação (one-time), mensal recorrente e eventual
          </p>
        </div>
        <Button size="sm" onClick={openCreate} style={{ background: "var(--primary)" }}>
          <Plus size={14} className="mr-1.5" />
          Novo Custo
        </Button>
      </div>

      {/* Summary */}
      {costs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <SummaryTile label="Total" value={totals.total} accent="#0F172A" />
          <SummaryTile label="Pago" value={totals.paid} accent="#10B981" />
          <SummaryTile label="A Pagar" value={totals.pending} accent="#F59E0B" />
          <SummaryTile label="Implementação" value={totals.implementacao} accent={COST_TYPE_META.implementacao.color} />
          <SummaryTile label="Mensal" value={totals.mensal} accent={COST_TYPE_META.mensal_recorrente.color} />
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-text-muted">Carregando...</p>
      ) : costs.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="Nenhum custo registrado"
          description="Adicione custos para acompanhar a saúde financeira do projeto."
          action={{ label: "Novo Custo", onClick: openCreate }}
        />
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {costs.map((c) => {
              const typeMeta = COST_TYPE_META[c.cost_type];
              const product = c.product_id ? products.find((p) => p.id === c.product_id) : null;
              return (
                <div
                  key={c.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => openEdit(c)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-[#0F172A] truncate">{c.description}</p>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ background: `${typeMeta.color}20`, color: typeMeta.color }}
                      >
                        {typeMeta.label}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {COST_CATEGORY_META[c.category].label}
                      </span>
                      {product && (
                        <span className="text-[10px] text-[#0B87C3]">⟶ {product.name}</span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
                      {c.incurred_date ? formatDate(c.incurred_date) : "Sem data"} •{" "}
                      <span className={c.status === "pago" ? "text-emerald-600" : c.status === "cancelado" ? "text-text-muted" : "text-amber-600"}>
                        {c.status === "pago" ? "Pago" : c.status === "cancelado" ? "Cancelado" : "Previsto"}
                      </span>
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[#0F172A] whitespace-nowrap">
                    {formatCurrency(Number(c.amount))}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Remover o custo "${c.description}"?`)) {
                        deleteCost.mutate({ id: c.id, projectId });
                      }
                    }}
                    className="p-1.5 rounded hover:bg-red-50 text-text-muted hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Custo" : "Novo Custo"}</DialogTitle>
            <DialogDescription>
              Custos one-time (implementação) ou recorrentes (mensal) do projeto.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label htmlFor="cost-desc">Descrição *</Label>
              <Input
                id="cost-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Ex: Servidor AWS, Licença Vercel..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cost-amount">Valor *</Label>
                <Input
                  id="cost-amount"
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="0,00"
                />
              </div>
              <div>
                <Label htmlFor="cost-date">Data</Label>
                <Input
                  id="cost-date"
                  type="date"
                  value={form.incurred_date}
                  onChange={(e) => setForm((f) => ({ ...f, incurred_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo *</Label>
                <Select
                  value={form.cost_type}
                  onValueChange={(v) => setForm((f) => ({ ...f, cost_type: v as ProjectCost["cost_type"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COST_TYPE_META).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoria</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v as ProjectCost["category"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COST_CATEGORY_META).map(([k, v]) => (
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
                  <SelectTrigger>
                    <SelectValue placeholder="Projeto inteiro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Projeto inteiro</SelectItem>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v as ProjectCost["status"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="previsto">Previsto</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="cost-notes">Notas</Label>
              <Textarea
                id="cost-notes"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.description.trim() || !form.amount}
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

function SummaryTile({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-lg p-3 bg-white/5 border border-border">
      <p className="text-[10px] text-text-muted uppercase tracking-wider">{label}</p>
      <p className="text-base font-bold mt-0.5" style={{ color: accent }}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}
