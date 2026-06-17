"use client";

import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Circle,
  Phone,
  Mail,
  Users as MeetingIcon,
  StickyNote,
  FileText,
  RefreshCw,
  Pencil,
  ChevronDown,
  Plus,
} from "lucide-react";
import { formatRelative as fmtRel } from "@/lib/utils/format";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActivities, useAddActivity } from "@/lib/hooks/use-activities";
import { useLeadTasks, useToggleTask, useDeleteTask } from "@/lib/hooks/use-tasks";
import { useUpdateLead } from "@/lib/hooks/use-leads";
import { useUser } from "@/lib/hooks/use-user";
import type { Database } from "@/types/database";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];

interface Props {
  leadId: string;
  leadNotes: string | null;
  onOpenTaskForm: () => void;
  onEditTask: (taskId: string) => void;
}

type FeedItem =
  | { kind: "activity"; id: string; type: string; description: string; at: string; user: string | null }
  | {
      kind: "task";
      id: string;
      taskType: string;
      title: string;
      notes: string | null;
      due_date: string | null;
      status: Database["public"]["Tables"]["tasks"]["Row"]["status"];
      priority: Database["public"]["Tables"]["tasks"]["Row"]["priority"];
      created_at: string;
    };

const activityIconMap: Record<string, React.ElementType> = {
  call_made: Phone,
  email_sent: Mail,
  meeting_held: MeetingIcon,
  note_added: StickyNote,
  proposal_sent: FileText,
  proposal_accepted: FileText,
  task_completed: CheckCircle2,
  stage_changed: RefreshCw,
  created: Plus,
};

const activityLabelMap: Record<string, string> = {
  call_made: "Ligação",
  email_sent: "Email",
  meeting_held: "Reunião",
  note_added: "Nota",
  proposal_sent: "Proposta enviada",
  proposal_accepted: "Proposta aceita",
  proposal_declined: "Proposta recusada",
  task_completed: "Tarefa concluída",
  stage_changed: "Mudou de estágio",
  created: "Criado",
  file_uploaded: "Arquivo anexado",
  updated: "Atualizado",
};

const taskTypeLabel: Record<string, string> = {
  followup: "Follow-up",
  ligacao: "Ligação",
  email: "Email",
  reuniao: "Reunião",
  proposta: "Proposta",
  entrega: "Entrega",
  interno: "Interno",
  outro: "Outro",
};

const priorityColors: Record<string, string> = {
  baixa: "#10B981",
  media: "#6366F1",
  alta: "#F59E0B",
  urgente: "#EF4444",
};

type FilterKind = "all" | "contact" | "tasks" | "notes";

export function LeadActivityFeed({ leadId, leadNotes, onOpenTaskForm, onEditTask }: Props) {
  const { user } = useUser();
  const { data: activitiesRaw = [] } = useActivities("lead", leadId);
  const activities = activitiesRaw as Array<{
    id: string;
    type: string;
    description: string;
    created_at: string;
    user?: { full_name?: string } | null;
  }>;
  const { data: tasks = [] } = useLeadTasks(leadId);
  const addActivity = useAddActivity();
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();
  const updateLead = useUpdateLead();

  const [noteText, setNoteText] = useState("");
  const [filter, setFilter] = useState<FilterKind>("all");
  const [notesOpen, setNotesOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(leadNotes ?? "");

  const handleAddNote = async () => {
    if (!noteText.trim() || !user?.org_id) return;
    await addActivity.mutateAsync({
      entity_type: "lead",
      entity_id: leadId,
      type: "note_added",
      description: noteText.trim(),
      org_id: user.org_id,
      created_by: user.id,
    });
    setNoteText("");
  };

  const handleSaveLeadNotes = async () => {
    await updateLead.mutateAsync({ id: leadId, notes: notesDraft });
    setEditingNotes(false);
  };

  // Merge activities + tasks into single feed sorted by date desc
  const feed = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];

    for (const a of activities) {
      items.push({
        kind: "activity",
        id: a.id,
        type: a.type,
        description: a.description,
        at: a.created_at,
        user: (a as { user?: { full_name?: string } | null }).user?.full_name ?? null,
      });
    }

    for (const t of tasks) {
      items.push({
        kind: "task",
        id: t.id,
        taskType: t.type,
        title: t.title,
        notes: t.notes,
        due_date: t.due_date,
        status: t.status,
        priority: t.priority,
        created_at: t.created_at,
      });
    }

    // Sort: pending tasks with future due_date appear on top (em ordem da próxima),
    // depois o restante em ordem decrescente de created_at/due_date.
    const now = new Date();
    items.sort((a, b) => {
      const aDateRaw =
        a.kind === "task" ? a.due_date ?? a.created_at : a.at;
      const bDateRaw =
        b.kind === "task" ? b.due_date ?? b.created_at : b.at;

      const aIsFutureTask =
        a.kind === "task" && a.status === "pendente" && a.due_date && new Date(a.due_date) >= now;
      const bIsFutureTask =
        b.kind === "task" && b.status === "pendente" && b.due_date && new Date(b.due_date) >= now;

      if (aIsFutureTask && !bIsFutureTask) return -1;
      if (!aIsFutureTask && bIsFutureTask) return 1;
      if (aIsFutureTask && bIsFutureTask) {
        return new Date(aDateRaw).getTime() - new Date(bDateRaw).getTime();
      }
      return new Date(bDateRaw).getTime() - new Date(aDateRaw).getTime();
    });

    return items;
  }, [activities, tasks]);

  const filtered = useMemo(() => {
    if (filter === "all") return feed;
    return feed.filter((item) => {
      if (filter === "tasks") return item.kind === "task";
      if (filter === "notes") return item.kind === "activity" && item.type === "note_added";
      if (filter === "contact") {
        return item.kind === "activity" && ["call_made", "email_sent", "meeting_held"].includes(item.type);
      }
      return true;
    });
  }, [feed, filter]);

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5">
      {/* Notas internas do lead (campo livre) */}
      <div>
        <button
          onClick={() => setNotesOpen((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronDown
            size={14}
            className={`transition-transform ${notesOpen ? "" : "-rotate-90"}`}
          />
          <Pencil size={13} />
          Notas internas do lead
          {leadNotes && !notesOpen && (
            <span className="text-xs text-text-muted ml-1 truncate max-w-[300px]">
              · {leadNotes.slice(0, 60)}{leadNotes.length > 60 ? "..." : ""}
            </span>
          )}
        </button>

        {notesOpen && (
          <div className="mt-3 pl-6">
            {editingNotes ? (
              <div className="space-y-2">
                <Textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  rows={4}
                  placeholder="Anotações livres do lead..."
                />
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => { setEditingNotes(false); setNotesDraft(leadNotes ?? ""); }}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSaveLeadNotes} disabled={updateLead.isPending} style={{ background: "var(--primary)" }}>
                    Salvar
                  </Button>
                </div>
              </div>
            ) : leadNotes ? (
              <div className="space-y-2">
                <p className="text-sm text-text-secondary whitespace-pre-wrap">{leadNotes}</p>
                <button
                  onClick={() => { setEditingNotes(true); setNotesDraft(leadNotes); }}
                  className="text-xs text-primary hover:underline"
                >
                  Editar
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-text-muted italic">Sem notas internas.</p>
                <button
                  onClick={() => { setEditingNotes(true); setNotesDraft(""); }}
                  className="text-xs text-primary hover:underline mt-1"
                >
                  Adicionar notas
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick actions: nota + tarefa */}
      <div className="space-y-2 border-t border-border pt-4">
        <Label className="text-xs text-text-muted uppercase tracking-wide">
          Adicionar nota rápida
        </Label>
        <Textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Escreva uma nota rápida (aparece na timeline)..."
          rows={2}
        />
        <div className="flex justify-between items-center">
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenTaskForm}
          >
            <Plus size={13} className="mr-1.5" />
            Criar tarefa / follow-up
          </Button>
          <Button
            size="sm"
            onClick={handleAddNote}
            disabled={!noteText.trim() || addActivity.isPending}
            style={{ background: "var(--primary)" }}
          >
            Adicionar nota
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 border-t border-border pt-4 flex-wrap">
        {([
          { key: "all", label: "Tudo" },
          { key: "contact", label: "Contatos (call/email/reunião)" },
          { key: "tasks", label: "Tarefas" },
          { key: "notes", label: "Notas" },
        ] as const).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as FilterKind)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === f.key
                ? "bg-primary text-white"
                : "bg-white/5 text-text-muted hover:text-text-primary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline unificada */}
      <div>
        {filtered.length === 0 ? (
          <p className="text-sm text-text-muted py-6 text-center">
            Nenhuma atividade ainda. Crie uma tarefa ou adicione uma nota acima.
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <FeedRow
                key={`${item.kind}-${item.id}`}
                item={item}
                onToggleTask={(id, status) => toggleTask.mutate({ id, currentStatus: status })}
                onEditTask={(id) => onEditTask(id)}
                onDeleteTask={(id) => deleteTask.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FeedRow({
  item,
  onToggleTask,
  onEditTask,
  onDeleteTask,
}: {
  item: FeedItem;
  onToggleTask: (id: string, status: Database["public"]["Tables"]["tasks"]["Row"]["status"]) => void;
  onEditTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}) {
  if (item.kind === "task") {
    const isDone = item.status === "concluida";
    const isCancelled = item.status === "cancelada";
    const isOverdue =
      !isDone && !isCancelled && item.due_date && new Date(item.due_date) < new Date();
    return (
      <div className="flex gap-3 group">
        <button
          onClick={() => onToggleTask(item.id, item.status)}
          className="flex-shrink-0 mt-0.5 hover:scale-110 transition-transform"
          title={isDone ? "Marcar como pendente" : "Marcar como concluída"}
        >
          {isDone ? (
            <CheckCircle2 size={18} className="text-emerald-500" />
          ) : (
            <Circle size={18} className={isOverdue ? "text-red-500" : "text-text-muted"} />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-medium ${isDone ? "line-through text-text-muted" : "text-text-primary"}`}>
              {item.title}
            </p>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-text-muted">
              {taskTypeLabel[item.taskType] ?? item.taskType}
            </span>
            <span
              className="text-[10px] font-medium"
              style={{ color: priorityColors[item.priority] }}
            >
              ● {item.priority}
            </span>
            {isOverdue && (
              <span className="text-[10px] text-red-500 font-medium">atrasada</span>
            )}
          </div>
          {item.notes && (
            <p className="text-xs text-text-muted mt-1 whitespace-pre-wrap">{item.notes}</p>
          )}
          <p className="text-[11px] text-text-muted mt-1">
            {item.due_date ? (
              <>
                Vence em{" "}
                <span className={isOverdue ? "text-red-500 font-medium" : ""}>
                  {format(parseISO(item.due_date), "dd MMM yyyy", { locale: ptBR })}
                </span>
              </>
            ) : (
              <>Sem data · criada {fmtRel(item.created_at)}</>
            )}
          </p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEditTask(item.id)}
            className="p-1 rounded hover:bg-white/5 text-text-muted hover:text-primary"
            title="Editar"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={() => {
              if (confirm(`Remover a tarefa "${item.title}"?`)) onDeleteTask(item.id);
            }}
            className="p-1 rounded hover:bg-red-950/40 text-text-muted hover:text-red-500"
            title="Remover"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  // activity
  const Icon = activityIconMap[item.type] ?? StickyNote;
  const label = activityLabelMap[item.type] ?? item.type;
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 mt-0.5">
        <div className="w-[18px] h-[18px] rounded-full bg-white/5 flex items-center justify-center text-text-muted">
          <Icon size={11} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm text-text-primary">
            <span className="text-text-muted text-xs">{label}: </span>
            {item.description}
          </p>
        </div>
        <p className="text-[11px] text-text-muted mt-0.5">
          {fmtRel(item.at)}
          {item.user ? ` · ${item.user}` : ""}
        </p>
      </div>
    </div>
  );
}

// Re-export for the page (avoids unused import warning)
export type { LeadRow };
