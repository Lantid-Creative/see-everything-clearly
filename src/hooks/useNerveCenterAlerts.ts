import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface NerveAlert {
  id: string;
  type: "lead" | "workflow" | "email" | "team" | "inactivity";
  severity: "critical" | "warning" | "info" | "success";
  title: string;
  message: string;
  timestamp: string;
  dismissed: boolean;
  entityId?: string;
}

function makeId() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

export function useNerveCenterAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<NerveAlert[]>([]);

  const addAlert = useCallback((alert: Omit<NerveAlert, "id" | "dismissed">) => {
    setAlerts((prev) => {
      // Dedupe by title within last 5 min
      const isDupe = prev.some(
        (a) =>
          a.title === alert.title &&
          Date.now() - new Date(a.timestamp).getTime() < 5 * 60 * 1000
      );
      if (isDupe) return prev;
      return [{ ...alert, id: makeId(), dismissed: false }, ...prev].slice(0, 30);
    });
  }, []);

  // Scan workspace for proactive alerts on mount
  useEffect(() => {
    if (!user) return;

    async function scanWorkspace() {
      const now = Date.now();
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
      const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString();

      const [staleLeads, pendingEmails, undeployedWf, recentLeads] = await Promise.all([
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user!.id)
          .lt("updated_at", weekAgo),
        supabase
          .from("email_drafts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user!.id)
          .eq("sent", false),
        supabase
          .from("workflows")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user!.id)
          .eq("is_deployed", false),
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user!.id)
          .gte("created_at", threeDaysAgo),
      ]);

      const ts = new Date().toISOString();

      if ((staleLeads.count ?? 0) > 0) {
        addAlert({
          type: "lead",
          severity: "warning",
          title: `${staleLeads.count} leads need attention`,
          message: "These leads haven't been updated in over a week. Re-engage or archive them.",
          timestamp: ts,
        });
      }

      if ((pendingEmails.count ?? 0) >= 3) {
        addAlert({
          type: "email",
          severity: "info",
          title: `${pendingEmails.count} unsent email drafts`,
          message: "You have drafts ready to review and send.",
          timestamp: ts,
        });
      }

      if ((undeployedWf.count ?? 0) > 0) {
        addAlert({
          type: "workflow",
          severity: "info",
          title: `${undeployedWf.count} workflows not deployed`,
          message: "Deploy your workflows to start automating tasks.",
          timestamp: ts,
        });
      }

      if ((recentLeads.count ?? 0) >= 5) {
        addAlert({
          type: "lead",
          severity: "success",
          title: `${recentLeads.count} new leads this week`,
          message: "Your pipeline is growing. Consider prioritizing outreach.",
          timestamp: ts,
        });
      }
    }

    scanWorkspace();
  }, [user, addAlert]);

  // Realtime: watch for new leads
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("nerve-alerts-leads")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leads", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const lead = payload.new as any;
          addAlert({
            type: "lead",
            severity: "info",
            title: "New lead added",
            message: `${lead.name || "A new contact"} from ${lead.company || "unknown company"} was added.`,
            timestamp: new Date().toISOString(),
            entityId: lead.id,
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, addAlert]);

  // Realtime: watch for workflow deployments
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("nerve-alerts-workflows")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "workflows", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const wf = payload.new as any;
          if (wf.is_deployed && !(payload.old as any)?.is_deployed) {
            addAlert({
              type: "workflow",
              severity: "success",
              title: "Workflow deployed",
              message: `"${wf.name}" is now live and running.`,
              timestamp: new Date().toISOString(),
              entityId: wf.id,
            });
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, addAlert]);

  // Realtime: watch for sent emails
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("nerve-alerts-emails")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "email_drafts", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const email = payload.new as any;
          if (email.sent && !(payload.old as any)?.sent) {
            addAlert({
              type: "email",
              severity: "success",
              title: "Email sent",
              message: `"${email.subject || "Untitled"}" was sent successfully.`,
              timestamp: new Date().toISOString(),
              entityId: email.id,
            });
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, addAlert]);

  // Realtime: team activity
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("nerve-alerts-team")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "team_activity" },
        (payload) => {
          const activity = payload.new as any;
          if (activity.user_id !== user.id) {
            addAlert({
              type: "team",
              severity: "info",
              title: "Team activity",
              message: `A teammate ${activity.action} on ${activity.entity_name || activity.entity_type}.`,
              timestamp: new Date().toISOString(),
              entityId: activity.entity_id,
            });
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, addAlert]);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, dismissed: true } : a)));
  }, []);

  const dismissAll = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, dismissed: true })));
  }, []);

  const activeAlerts = alerts.filter((a) => !a.dismissed);

  return { alerts: activeAlerts, allAlerts: alerts, dismissAlert, dismissAll };
}
