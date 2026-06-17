"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

// Tipos de atividade que contam como "contato real" com o lead/contato
// (exclui notas internas, file uploads, mudanças de stage, etc)
export const CONTACT_ACTIVITY_TYPES = [
  "call_made",
  "email_sent",
  "meeting_held",
] as const;

type ContactSummary = {
  leadId: string;
  lastContact: {
    at: string;
    type: Database["public"]["Tables"]["activities"]["Row"]["type"];
    description: string;
  } | null;
  nextTask: {
    id: string;
    due_date: string;
    title: string;
    type: Database["public"]["Tables"]["tasks"]["Row"]["type"];
  } | null;
};

/**
 * Agrega para CADA lead da org:
 *   - lastContact: atividade mais recente do tipo call/email/meeting
 *   - nextTask: próxima tarefa pendente com due_date >= hoje
 *
 * Faz 2 queries client-side e agrega em memória. Custo OK para volumes
 * típicos (< 10k atividades, < 10k tarefas por org).
 */
export const useLeadsContactSummary = () => {
  const supabase = createClient();
  return useQuery({
    queryKey: ["leads-contact-summary"],
    staleTime: 30 * 1000,
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split("T")[0];

      const [actsResp, tasksResp] = await Promise.all([
        supabase
          .from("activities")
          .select("entity_id, entity_type, type, description, created_at")
          .eq("entity_type", "lead")
          .in("type", CONTACT_ACTIVITY_TYPES)
          .order("created_at", { ascending: false })
          .limit(2000),
        supabase
          .from("tasks")
          .select("id, lead_id, due_date, title, type, status")
          .not("lead_id", "is", null)
          .eq("status", "pendente")
          .gte("due_date", todayStr)
          .order("due_date", { ascending: true })
          .limit(2000),
      ]);

      if (actsResp.error) throw actsResp.error;
      if (tasksResp.error) throw tasksResp.error;

      const acts = (actsResp.data ?? []) as Array<{
        entity_id: string;
        type: ContactSummary["lastContact"] extends infer T
          ? T extends { type: infer U } ? U : never
          : never;
        description: string;
        created_at: string;
      }>;

      const tasks = (tasksResp.data ?? []) as Array<{
        id: string;
        lead_id: string;
        due_date: string;
        title: string;
        type: ContactSummary["nextTask"] extends infer T
          ? T extends { type: infer U } ? U : never
          : never;
      }>;

      const lastByLead = new Map<string, ContactSummary["lastContact"]>();
      for (const a of acts) {
        if (!lastByLead.has(a.entity_id)) {
          lastByLead.set(a.entity_id, {
            at: a.created_at,
            type: a.type,
            description: a.description,
          });
        }
      }

      const nextByLead = new Map<string, ContactSummary["nextTask"]>();
      for (const t of tasks) {
        if (!nextByLead.has(t.lead_id)) {
          nextByLead.set(t.lead_id, {
            id: t.id,
            due_date: t.due_date,
            title: t.title,
            type: t.type,
          });
        }
      }

      return { lastByLead, nextByLead };
    },
  });
};
