import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";
import { toast } from "sonner";

export interface PriorityAction {
  title: string;
  description: string;
  urgency: "critical" | "high" | "medium";
  action_type: "chat" | "workspace" | "workflow" | "spreadsheet" | "slides" | "command-center";
  action_prompt?: string;
}

export interface Anomaly {
  signal: string;
  severity: "warning" | "info";
  recommendation: string;
}

export interface SuggestedAction {
  label: string;
  prompt: string;
  reasoning: string;
}

export interface Briefing {
  summary: string;
  priority_actions: PriorityAction[];
  anomalies: Anomaly[];
  wins: string[];
  suggested_action: SuggestedAction;
  health_score: number;
  generated_at: string;
}

interface RecentActivity {
  lastConversation: string | null;
  lastLeadAdded: string | null;
  lastEmailSent: string | null;
  lastWorkflowUpdate: string | null;
  staleLeadsCount: number;
  undeployedWorkflows: number;
}

const CACHE_KEY = "lantid_nerve_center_briefing";
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours

function getCachedBriefing(userId: string): Briefing | null {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}_${userId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Briefing;
    const age = Date.now() - new Date(parsed.generated_at).getTime();
    if (age > CACHE_TTL) return null;
    return parsed;
  } catch {
    return null;
  }
}

function setCachedBriefing(userId: string, briefing: Briefing) {
  try {
    localStorage.setItem(`${CACHE_KEY}_${userId}`, JSON.stringify(briefing));
  } catch { /* ignore */ }
}

export function useNerveCenter() {
  const { user } = useAuth();
  const workspace = useWorkspaceContext();
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);

  // Fetch recent activity timestamps for anomaly detection
  useEffect(() => {
    if (!user) return;
    async function fetchActivity() {
      const [lastConv, lastLead, lastEmail, lastWorkflow, staleLeads, undeployed] = await Promise.all([
        supabase.from("conversations").select("updated_at").eq("user_id", user!.id).order("updated_at", { ascending: false }).limit(1),
        supabase.from("leads").select("created_at").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(1),
        supabase.from("email_drafts").select("created_at").eq("user_id", user!.id).eq("sent", true).order("created_at", { ascending: false }).limit(1),
        supabase.from("workflows").select("updated_at").eq("user_id", user!.id).order("updated_at", { ascending: false }).limit(1),
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("user_id", user!.id).lt("updated_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from("workflows").select("*", { count: "exact", head: true }).eq("user_id", user!.id).eq("is_deployed", false),
      ]);

      setRecentActivity({
        lastConversation: lastConv.data?.[0]?.updated_at || null,
        lastLeadAdded: lastLead.data?.[0]?.created_at || null,
        lastEmailSent: lastEmail.data?.[0]?.created_at || null,
        lastWorkflowUpdate: lastWorkflow.data?.[0]?.updated_at || null,
        staleLeadsCount: staleLeads.count || 0,
        undeployedWorkflows: undeployed.count || 0,
      });
    }
    fetchActivity();
  }, [user]);

  // Load cached briefing on mount
  useEffect(() => {
    if (!user) return;
    const cached = getCachedBriefing(user.id);
    if (cached) setBriefing(cached);
  }, [user]);

  const generateBriefing = useCallback(async () => {
    if (!user || !workspace) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("nerve-center", {
        body: {
          context: {
            ...workspace,
            recentActivity,
          },
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const newBriefing: Briefing = {
        ...data.briefing,
        generated_at: new Date().toISOString(),
      };
      setBriefing(newBriefing);
      setCachedBriefing(user.id, newBriefing);
    } catch (e: any) {
      console.error("Briefing generation failed:", e);
      toast.error(e.message || "Failed to generate briefing");
    } finally {
      setLoading(false);
    }
  }, [user, workspace, recentActivity]);

  // Auto-generate if no cache and workspace ready
  useEffect(() => {
    if (!user || !workspace || briefing || loading) return;
    generateBriefing();
  }, [user, workspace, briefing, loading, generateBriefing]);

  return { briefing, loading, generateBriefing, recentActivity };
}
