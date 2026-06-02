"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight, Package, AlertTriangle, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils/format";
import { differenceInDays, parseISO } from "date-fns";
import {
  useProjectProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCreateStage,
  useUpdateStage,
  useDeleteStage,
  PRODUCT_STATUS_META,
  STAGE_STATUS_META,
  type ProjectProduct,
  type ProductStage,
} from "@/lib/hooks/use-project-products";

interface Props {
  projectId: string;
  orgId: string;
}

export function ProjectProducts({ projectId, orgId }: Props) {
  const { data: products = [], isLoading } = useProjectProducts(projectId);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProjectProduct | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    value: "",
    status: "planejado" as ProjectProduct["status"],
  });

  const openCreate = () => {
    setEditingProduct(null);
    setForm({ name: "", description: "", value: "", status: "planejado" });
    setProductDialogOpen(true);
  };

  const openEdit = (p: ProjectProduct) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      value: p.value?.toString() ?? "",
      status: p.status,
    });
    setProductDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      value: form.value ? parseFloat(form.value) : null,
      status: form.status,
    };
    if (editingProduct) {
      await updateProduct.mutateAsync({
        id: editingProduct.id,
        projectId,
        ...payload,
      });
    } else {
      await createProduct.mutateAsync({
        org_id: orgId,
        project_id: projectId,
        position: products.length,
        ...payload,
      });
    }
    setProductDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#0F172A]">Produtos do Projeto</h3>
          <p className="text-xs text-text-muted mt-0.5">
            Itens entregáveis com etapas de desenvolvimento (data prometida × prevista × real)
          </p>
        </div>
        <Button size="sm" onClick={openCreate} style={{ background: "var(--primary)" }}>
          <Plus size={14} className="mr-1.5" />
          Novo Produto
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-text-muted">Carregando...</p>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum produto cadastrado"
          description="Adicione produtos para acompanhar o desenvolvimento por etapas."
          action={{ label: "Novo Produto", onClick: openCreate }}
        />
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              projectId={projectId}
              orgId={orgId}
              onEdit={() => openEdit(product)}
              onDelete={() => {
                if (confirm(`Remover o produto "${product.name}" e todas as suas etapas?`)) {
                  deleteProduct.mutate({ id: product.id, projectId });
                }
              }}
            />
          ))}
        </div>
      )}

      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
            <DialogDescription>
              Defina um item entregável do projeto. Você poderá adicionar etapas em seguida.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="prod-name">Nome *</Label>
              <Input
                id="prod-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Módulo de relatórios"
              />
            </div>
            <div>
              <Label htmlFor="prod-desc">Descrição</Label>
              <Textarea
                id="prod-desc"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="O que esse produto entrega..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="prod-value">Valor (opcional)</Label>
                <Input
                  id="prod-value"
                  type="number"
                  step="0.01"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                  placeholder="0,00"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v as ProjectProduct["status"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRODUCT_STATUS_META).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!form.name.trim()} style={{ background: "var(--primary)" }}>
              {editingProduct ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductCard({
  product,
  projectId,
  orgId,
  onEdit,
  onDelete,
}: {
  product: ProjectProduct & { stages: ProductStage[] };
  projectId: string;
  orgId: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const productMeta = PRODUCT_STATUS_META[product.status];
  const completed = product.stages.filter((s) => s.status === "concluida").length;
  const progress = product.stages.length > 0 ? Math.round((completed / product.stages.length) * 100) : 0;

  const createStage = useCreateStage();
  const updateStage = useUpdateStage();
  const deleteStage = useDeleteStage();

  const [newStageName, setNewStageName] = useState("");
  const [adding, setAdding] = useState(false);

  const addStage = async () => {
    if (!newStageName.trim()) return;
    await createStage.mutateAsync({
      org_id: orgId,
      product_id: product.id,
      name: newStageName.trim(),
      position: product.stages.length,
      status: "pendente",
      projectId,
    });
    setNewStageName("");
    setAdding(false);
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="p-0.5 rounded hover:bg-white/5 text-text-muted"
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-[#0F172A]">{product.name}</p>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ background: `${productMeta.color}20`, color: productMeta.color }}
            >
              {productMeta.label}
            </span>
            {product.value && (
              <span className="text-xs text-text-muted">{formatCurrency(Number(product.value))}</span>
            )}
          </div>
          {product.description && (
            <p className="text-xs text-text-muted mt-1 line-clamp-2">{product.description}</p>
          )}
          {product.stages.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${progress}%`, background: productMeta.color }}
                />
              </div>
              <span className="text-[10px] text-text-muted whitespace-nowrap">
                {completed}/{product.stages.length} etapas
              </span>
            </div>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onEdit}>
          Editar
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600 hover:text-red-700" onClick={onDelete}>
          <Trash2 size={13} />
        </Button>
      </div>

      {expanded && (
        <div className="border-t border-border p-4 space-y-2">
          {product.stages.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-3">
              Nenhuma etapa. Adicione abaixo.
            </p>
          ) : (
            product.stages.map((stage) => (
              <StageRow
                key={stage.id}
                stage={stage}
                projectId={projectId}
                onUpdate={(patch) =>
                  updateStage.mutate({ id: stage.id, projectId, ...patch })
                }
                onDelete={() => {
                  if (confirm(`Remover a etapa "${stage.name}"?`)) {
                    deleteStage.mutate({ id: stage.id, projectId });
                  }
                }}
              />
            ))
          )}

          {adding ? (
            <div className="flex gap-2 pt-2 border-t border-border">
              <Input
                placeholder="Nome da etapa"
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addStage();
                  if (e.key === "Escape") {
                    setAdding(false);
                    setNewStageName("");
                  }
                }}
                autoFocus
                className="h-8 text-xs"
              />
              <Button size="sm" onClick={addStage} disabled={!newStageName.trim()} className="h-8 text-xs">
                Adicionar
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAdding(false)} className="h-8 text-xs">
                ×
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="w-full text-xs text-text-muted hover:text-primary border border-dashed border-border rounded-lg py-2 transition-colors"
            >
              <Plus size={11} className="inline mr-1" />
              Adicionar etapa
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function StageRow({
  stage,
  onUpdate,
  onDelete,
}: {
  stage: ProductStage;
  projectId: string;
  onUpdate: (patch: Partial<ProductStage>) => void;
  onDelete: () => void;
}) {
  const meta = STAGE_STATUS_META[stage.status];
  const promised = stage.promised_date ? parseISO(stage.promised_date) : null;
  const forecast = stage.forecast_date ? parseISO(stage.forecast_date) : null;
  const actualEnd = stage.actual_end_date ? parseISO(stage.actual_end_date) : null;

  const slipDays =
    promised && (forecast || actualEnd)
      ? differenceInDays((actualEnd ?? forecast)!, promised)
      : null;

  return (
    <div className="grid grid-cols-[1fr_140px_140px_140px_120px_30px] gap-2 items-center text-xs p-2 rounded-lg hover:bg-white/5 transition-colors">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-[#0F172A] truncate">{stage.name}</p>
          {slipDays !== null && slipDays > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-red-600 whitespace-nowrap">
              <AlertTriangle size={10} />
              +{slipDays}d
            </span>
          )}
          {slipDays !== null && slipDays < 0 && (
            <span className="text-[10px] text-emerald-600 whitespace-nowrap">{slipDays}d</span>
          )}
        </div>
        {stage.notes && <p className="text-[10px] text-text-muted line-clamp-1">{stage.notes}</p>}
      </div>

      {/* Status */}
      <Select
        value={stage.status}
        onValueChange={(v) => onUpdate({ status: v as ProductStage["status"] })}
      >
        <SelectTrigger className="h-8 text-xs" style={{ borderColor: meta.color, color: meta.color }}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(STAGE_STATUS_META).map(([k, v]) => (
            <SelectItem key={k} value={k}>{v.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Datas */}
      <div title="Prometida (contrato)">
        <Input
          type="date"
          value={stage.promised_date ?? ""}
          onChange={(e) => onUpdate({ promised_date: e.target.value || null })}
          className="h-8 text-xs"
        />
        <p className="text-[9px] text-text-muted mt-0.5">Prometida</p>
      </div>

      <div title="Prevista (atual)">
        <Input
          type="date"
          value={stage.forecast_date ?? ""}
          onChange={(e) => onUpdate({ forecast_date: e.target.value || null })}
          className="h-8 text-xs"
        />
        <p className="text-[9px] text-text-muted mt-0.5">Prevista</p>
      </div>

      <div title="Real">
        <Input
          type="date"
          value={stage.actual_end_date ?? ""}
          onChange={(e) => onUpdate({ actual_end_date: e.target.value || null })}
          className="h-8 text-xs"
          disabled={stage.status !== "concluida"}
        />
        <p className="text-[9px] text-text-muted mt-0.5">
          {actualEnd ? "Concluída" : <span className="flex items-center gap-1"><CalendarClock size={9} />Aguardando</span>}
        </p>
      </div>

      <button
        onClick={onDelete}
        className="p-1 rounded hover:bg-red-50 text-text-muted hover:text-red-600 transition-colors"
        title="Remover"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
