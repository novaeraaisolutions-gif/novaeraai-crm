"use client";

import { useRouter } from "next/navigation";
import {
  Building2,
  User,
  Calendar,
  Pencil,
  Trash2,
  TrendingUp,
  CalendarPlus,
  Phone,
  Mail,
  Users as MeetingIcon,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { formatDistanceToNow, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { LeadWithRelations } from "@/lib/hooks/use-leads";
import { TEMPERATURES } from "@/lib/utils/constants";

const temperatureColors: Record<string, string> = {
  frio: "bg-blue-950/60 text-blue-300 border-blue-800/30",
  morno: "bg-orange-950/60 text-orange-300 border-orange-800/30",
  quente: "bg-red-950/60 text-red-300 border-red-800/30",
};

type LastContact = {
  at: string;
  type: "call_made" | "email_sent" | "meeting_held" | string;
  description: string;
} | null;

type NextTask = {
  id: string;
  due_date: string;
  title: string;
  type: string;
} | null;

interface LeadCardProps {
  lead: LeadWithRelations;
  onEdit: (lead: LeadWithRelations) => void;
  onDelete: (lead: LeadWithRelations) => void;
  onQuickTask?: (lead: LeadWithRelations) => void;
  lastContact?: LastContact;
  nextTask?: NextTask;
}

const contactIcon: Record<string, React.ElementType> = {
  call_made: Phone,
  email_sent: Mail,
  meeting_held: MeetingIcon,
};

const contactLabel: Record<string, string> = {
  call_made: "Ligação",
  email_sent: "Email",
  meeting_held: "Reunião",
};

export const LeadCard = ({
  lead,
  onEdit,
  onDelete,
  onQuickTask,
  lastContact,
  nextTask,
}: LeadCardProps) => {
  const router = useRouter();
  const tempLabel = TEMPERATURES.find((t) => t.value === lead.temperature)?.label;

  const LastIcon = lastContact ? contactIcon[lastContact.type] ?? Calendar : Calendar;
  const lastLabel = lastContact ? contactLabel[lastContact.type] ?? "Contato" : "";

  const nextTaskDays = nextTask ? differenceInDays(parseISO(nextTask.due_date), new Date()) : null;

  return (
    <div
      className="bg-card rounded-lg border border-border p-3 hover:border-primary/30 transition-all duration-200 group cursor-pointer"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
      onClick={() => router.push(`/leads/${lead.id}`)}
    >
      {/* Header: title + actions */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-text-primary line-clamp-2 flex-1">
          {lead.title}
        </p>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {onQuickTask && (
            <button
              onClick={(e) => { e.stopPropagation(); onQuickTask(lead); }}
              className="p-1 rounded hover:bg-green-950/40 text-text-muted hover:text-green-400 transition-colors"
              title="Criar follow-up"
            >
              <CalendarPlus size={11} />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(lead); }}
            className="p-1 rounded hover:bg-primary/10 text-text-muted hover:text-primary transition-colors"
            title="Editar lead"
          >
            <Pencil size={11} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(lead); }}
            className="p-1 rounded hover:bg-red-950/40 text-text-muted hover:text-danger transition-colors"
            title="Remover lead"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* Value */}
      {lead.value && (
        <div className="flex items-center gap-1 mt-2">
          <TrendingUp size={11} className="text-primary" />
          <p className="text-sm font-bold text-primary">
            {formatCurrency(lead.value)}
          </p>
        </div>
      )}

      {/* Meta info */}
      <div className="mt-2 space-y-1">
        {lead.company && (
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Building2 size={10} className="shrink-0" />
            <span className="truncate">{lead.company.name}</span>
          </div>
        )}
        {lead.contact && (
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <User size={10} className="shrink-0" />
            <span className="truncate">{lead.contact.full_name}</span>
          </div>
        )}
      </div>

      {/* Último e próximo contato */}
      {(lastContact || nextTask) && (
        <div className="mt-2 pt-2 border-t border-border/40 space-y-1">
          {lastContact && (
            <div className="flex items-center gap-1.5 text-[10px] text-text-muted" title={lastContact.description}>
              <LastIcon size={10} className="shrink-0 text-emerald-400" />
              <span className="truncate">
                <span className="text-emerald-400 font-medium">{lastLabel}</span>{" "}
                {formatDistanceToNow(parseISO(lastContact.at), { addSuffix: true, locale: ptBR })}
              </span>
            </div>
          )}
          {nextTask && (
            <div
              className={`flex items-center gap-1.5 text-[10px] ${
                nextTaskDays !== null && nextTaskDays <= 1
                  ? "text-amber-400"
                  : "text-text-muted"
              }`}
              title={nextTask.title}
            >
              <CalendarPlus size={10} className="shrink-0" />
              <span className="truncate">
                <span className="font-medium">Próximo:</span>{" "}
                {nextTaskDays === 0
                  ? "Hoje"
                  : nextTaskDays === 1
                  ? "Amanhã"
                  : nextTaskDays !== null && nextTaskDays > 0
                  ? `Em ${nextTaskDays} dias`
                  : formatDate(nextTask.due_date)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Footer: temperature + close date */}
      <div className="mt-2 flex items-center justify-between gap-2">
        {lead.temperature && (
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-medium ${temperatureColors[lead.temperature] ?? "bg-white/5 text-text-muted border-border"}`}>
            {tempLabel}
          </span>
        )}
        {lead.expected_close_date && (
          <span className="text-[10px] text-text-muted flex items-center gap-1">
            <Calendar size={9} />
            {formatDate(lead.expected_close_date)}
          </span>
        )}
      </div>
    </div>
  );
};
