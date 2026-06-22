"use client";

import { useState } from "react";
import { Plus, Trash2, Calendar, Star, AlertTriangle, ExternalLink, MessageSquare } from "lucide-react";
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
import { formatDate } from "@/lib/utils/format";
import { type ProjectWithRelations } from "@/lib/hooks/use-projects";
import {
  useProjectCheckins,
  useUpsertCheckin,
  useDeleteCheckin,
  type MonthlyCheckin,
} from "@/lib/hooks/use-checkins";
import { CHURN_RISK_OPTIONS } from "@/lib/utils/constants";

interface Props {
  project: ProjectWithRelations;
  orgId: string;
}

const initialForm = {
  reference_month: "",
  meeting_done: false,
  meeting_date: "",
  nps_score: "",
  report_url: "",
  crs_opened: "",
  crs_resolved: "",
  upsell_opportunity: "",
  churn_risk: "" as "" | "baixo" | "medio" | "alto",
  notes: "",
};

export function ProjectAftercare({ project, orgId }: Props) {
  const { data: checkins = [], isLoading } = useProjectCheckins(project.id);
  const upsert = useUpsertCheckin();
  const remove = useDeleteCheckin();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MonthlyCheckin | null>(null);
  const [form, setForm] = useState(initialForm);

  const openCreate = () => {
    setEditing(null);
    const now = new Date();
    setForm({
      ...initialForm,
      reference_month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`,
    });
    setOpen(true);
  };

  const openEdit = (c: MonthlyCheckin) => {
    setEditing(c);
    setForm({
      reference_month: c.reference_month,
      meeting_done: c.meeting_done,
      meeting_date: c.meeting_date ?? "",
      nps_score: c.nps_score?.toString() ?? "",
      report_url: c.report_url ?? "",
      crs_opened: c.crs_opened?.toString() ?? "",
      crs_resolved: c.crs_resolved?.toString() ?? "",
      upsell_opportunity: c.upsell_opportunity ?? "",
      churn_risk: (c.churn_risk ?? "") as typeof initialForm.churn_risk,
      notes: c.notes ?? "",
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.reference_month) return;
    await upsert.mutateAsync({
      org_id: orgId,
      project_id: project.id,
      reference_month: form.reference_month,
      meeting_done: form.meeting_done,
      meeting_date: form.meeting_date || null,
      nps_score: form.nps_score ? Number(form.nps_score) : null,
      report_url: form.report_url.trim() || null,
      crs_opened: form.crs_opened ? Number(form.crs_opened) : 0,
      crs_resolved: form.crs_resolved ? Number(form.crs_resolved) : 0,
      upsell_opportunity: form.upsell_opportunity.trim() || null,
      churn_risk: form.churn_risk || null,
      notes: form.notes.trim() || null,
    });
    setOpen(false);
  };

  const churnMeta = CHURN_RISK_OPTIONS.find((o) => o.value === project.churn_risk);

  return (
    <div className="space-y-4">
      {/* Top summary */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Pós-Entrega (Mensalidade)</h3>
            <p className="text-xs text-text-muted mt-0.5">
              NPS, reuniões mensais, CRs e risco de churn
            </p>
          </div>
          <Button size="sm" onClick={openCreate} style={{ background: "var(--primary)" }}>
            <Plus size={14} className="mr-1.5" />
            Novo Check-in
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Tile
            icon={Calendar}
            label="Início mensalidade"
            value={
              project.monthly_billing_start_date
                ? formatDate(project.monthly_billing_start_date)
                : "—"
            }
          />
          <Tile
            icon={Star}
            label="Último NPS"
            value={
              project.latest_nps_score != null
                ? `${project.latest_nps_score}/10`
                : "—"
            }
            accent={
              project.latest_nps_score != null
                ? project.latest_nps_score >= 9
                  ? "#10B981"
                  : project.latest_nps_score >= 7
                  ? "#F59E0B"
                  : "#EF4444"
                : undefined
            }
          />
          <Tile
            icon={MessageSquare}
            label="CRs mês"
            value={
              project.crs_opened_count != null
                ? `${project.crs_resolved_count ?? 0}/${project.crs_opened_count}`
                : "—"
            }
          />
          <Tile
            icon={AlertTriangle}
            label="Risco de churn"
            value={churnMeta?.label ?? "—"}
            accent={churnMeta?.color}
          />
        </div>

        {project.upsell_opportunity_note && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              Oportunidade de Upsell
            </p>
            <p className="text-sm text-emerald-700">{project.upsell_opportunity_note}</p>
          </div>
        )}
      </div>

      {/* Histórico de check-ins */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h4 className="text-sm font-semibold text-text-primary mb-3">Histórico de Check-ins Mensais</h4>

        {isLoading ? (
          <p className="text-sm text-text-muted">Carregando...</p>
        ) : checkins.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Nenhum check-in registrado"
            description="Registre o primeiro check-in mensal após a reunião com o cliente."
          />
        ) : (
          <div className="space-y-2">
            {checkins.map((c) => {
              const monthLabel = formatMonth(c.reference_month);
              const npsColor =
                c.nps_score != null
                  ? c.nps_score >= 9
                    ? "#10B981"
                    : c.nps_score >= 7
                    ? "#F59E0B"
                    : "#EF4444"
                  : undefined;
              return (
                <div
                  key={c.id}
                  onClick={() => openEdit(c)}
                  className="rounded-lg border border-border p-3 hover:border-primary/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-text-primary capitalize">{monthLabel}</p>
                        {c.meeting_done ? (
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700">
                            ✓ Reunião feita
                          </span>
                        ) : (
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700">
                            ⏳ Reunião pendente
                          </span>
                        )}
                        {c.nps_score != null && (
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{ background: `${npsColor}20`, color: npsColor }}
                          >
                            NPS {c.nps_score}/10
                          </span>
                        )}
                        {c.churn_risk && (
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{
                              background: `${CHURN_RISK_OPTIONS.find((o) => o.value === c.churn_risk)?.color}20`,
                              color: CHURN_RISK_OPTIONS.find((o) => o.value === c.churn_risk)?.color,
                            }}
                          >
                            Churn: {CHURN_RISK_OPTIONS.find((o) => o.value === c.churn_risk)?.label}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted mt-1">
                        CRs: {c.crs_resolved ?? 0}/{c.crs_opened ?? 0} resolvidos
                        {c.report_url && (
                          <>
                            {" • "}
                            <a
                              href={c.report_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-primary hover:underline inline-flex items-center gap-0.5"
                            >
                              <ExternalLink size={10} /> relatório
                            </a>
                          </>
                        )}
                      </p>
                      {c.upsell_opportunity && (
                        <p className="text-xs text-emerald-700 mt-1">💡 {c.upsell_opportunity}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Remover check-in de ${monthLabel}?`)) {
                          remove.mutate({ id: c.id, projectId: project.id });
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
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Check-in" : "Novo Check-in Mensal"}</DialogTitle>
            <DialogDescription>
              Registre o resultado da reunião mensal com o cliente. Atualiza automaticamente
              o NPS, CRs, churn risk e oportunidade de upsell no projeto.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Mês de referência *</Label>
                <Input
                  type="date"
                  value={form.reference_month}
                  onChange={(e) => setForm((f) => ({ ...f, reference_month: e.target.value }))}
                />
              </div>
              <div>
                <Label>Data da reunião</Label>
                <Input
                  type="date"
                  value={form.meeting_date}
                  onChange={(e) => setForm((f) => ({ ...f, meeting_date: e.target.value, meeting_done: !!e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>NPS (0-10)</Label>
                <Input
                  type="number"
                  min={0}
                  max={10}
                  value={form.nps_score}
                  onChange={(e) => setForm((f) => ({ ...f, nps_score: e.target.value }))}
                />
              </div>
              <div>
                <Label>CRs abertos</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.crs_opened}
                  onChange={(e) => setForm((f) => ({ ...f, crs_opened: e.target.value }))}
                />
              </div>
              <div>
                <Label>CRs resolvidos</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.crs_resolved}
                  onChange={(e) => setForm((f) => ({ ...f, crs_resolved: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Link do relatório mensal</Label>
              <Input
                value={form.report_url}
                onChange={(e) => setForm((f) => ({ ...f, report_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label>Risco de churn</Label>
              <Select
                value={form.churn_risk || "__none__"}
                onValueChange={(v) => setForm((f) => ({ ...f, churn_risk: (v === "__none__" ? "" : v) as typeof f.churn_risk }))}
              >
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Não avaliado</SelectItem>
                  {CHURN_RISK_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Oportunidade de upsell identificada?</Label>
              <Textarea
                rows={2}
                value={form.upsell_opportunity}
                onChange={(e) => setForm((f) => ({ ...f, upsell_opportunity: e.target.value }))}
                placeholder="Descreva o que poderia ser expandido..."
              />
            </div>

            <div>
              <Label>Notas internas</Label>
              <Textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSave}
              disabled={!form.reference_month || upsert.isPending}
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

function Tile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-lg p-3 bg-white/5 border border-border">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon size={12} className="text-text-muted" />
        <p className="text-[10px] text-text-muted uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-base font-bold" style={{ color: accent ?? "#0F172A" }}>{value}</p>
    </div>
  );
}

function formatMonth(refMonth: string) {
  // refMonth = "2026-05-01"
  const d = new Date(refMonth);
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}
