import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface AgentAction {
  id: string;
  action_type: string;
  title: string;
  description: string;
  status: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AgentRunResult {
  summary: string;
  actions: any[];
  actionsCount: number;
}

const AGENT_COOLDOWN_KEY = "lantid_agent_last_run";
const COOLDOWN_MS = 30 * 60 * 1000; // 30 min cooldown between auto-runs

export function useAutonomousAgent() {
  const { user } = useAuth();
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [running, setRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem("lantid_agent_enabled") !== "false"; }
    catch { return true; }
  });

  // Load recent actions from DB
  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data } = await supabase
        .from("agent_actions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setActions(data as AgentAction[]);
    }
    load();
  }, [user]);

  // Track last run time
  useEffect(() => {
    if (!user) return;
    const stored = localStorage.getItem(`${AGENT_COOLDOWN_KEY}_${user.id}`);
    if (stored) setLastRun(stored);
  }, [user]);

  const toggleEnabled = useCallback((val: boolean) => {
    setEnabled(val);
    try { localStorage.setItem("lantid_agent_enabled", String(val)); } catch {}
  }, []);

  const runAgent = useCallback(async () => {
    if (!user || running) return;
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("autonomous-agent");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const result = data as AgentRunResult;
      const now = new Date().toISOString();
      setLastRun(now);
      localStorage.setItem(`${AGENT_COOLDOWN_KEY}_${user.id}`, now);

      // Refresh actions list
      const { data: freshActions } = await supabase
        .from("agent_actions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (freshActions) setActions(freshActions as AgentAction[]);

      toast.success(`Agent completed: ${result.actionsCount} action${result.actionsCount !== 1 ? "s" : ""} taken`, {
        description: result.summary,
      });

      return result;
    } catch (e: any) {
      console.error("Agent run failed:", e);
      // Don't show toast for auth errors - these are expected when session expires
      if (!e.message?.includes("Unauthorized")) {
        toast.error(e.message || "Agent run failed");
      }
      // Mark cooldown to prevent immediate retries
      const now = new Date().toISOString();
      setLastRun(now);
      localStorage.setItem(`${AGENT_COOLDOWN_KEY}_${user.id}`, now);
    } finally {
      setRunning(false);
    }
  }, [user, running]);

  // Auto-run on mount if enabled and cooldown passed
  useEffect(() => {
    if (!user || !enabled || running || actions.length > 0) return;
    const last = localStorage.getItem(`${AGENT_COOLDOWN_KEY}_${user.id}`);
    if (last) {
      const elapsed = Date.now() - new Date(last).getTime();
      if (elapsed < COOLDOWN_MS) return;
    }
    // Small delay to not block initial render
    const timer = setTimeout(() => runAgent(), 3000);
    return () => clearTimeout(timer);
  }, [user, enabled, running, actions.length, runAgent]);

  const dismissAction = useCallback(async (actionId: string) => {
    await supabase
      .from("agent_actions")
      .update({ status: "dismissed" })
      .eq("id", actionId);
    setActions(prev => prev.map(a => a.id === actionId ? { ...a, status: "dismissed" } : a));
  }, []);

  return {
    actions,
    running,
    lastRun,
    enabled,
    toggleEnabled,
    runAgent,
    dismissAction,
  };
}
