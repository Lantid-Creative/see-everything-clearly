import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { useNerveCenter, type PriorityAction } from "@/hooks/useNerveCenter";
import { useNerveCenterAlerts } from "@/hooks/useNerveCenterAlerts";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Zap,
  AlertTriangle,
  Info,
  Trophy,
  ArrowRight,
  RefreshCw,
  Loader2,
  Activity,
  Users,
  MessageSquare,
  GitBranch,
  Mail,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Bell,
  X,
  CheckCircle2,
  Shield,
  Filter,
  Upload,
  Download,
  Radio,
  Gauge,
  Workflow as WorkflowIcon,
  Plus,
  Pause,
  Play,
  ChevronRight,
  Target,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import type { ViewMode } from "@/pages/Index";

interface NerveCenterViewProps {
  onNavigate: (view: ViewMode) => void;
  onNewChat: (prompt?: string) => void;
}

// Pulsing status dot — primary (orange) by default
function StatusDot({ tone = "primary" }: { tone?: "primary" | "muted" | "success" }) {
  const cls =
    tone === "primary" ? "bg-primary" : tone === "success" ? "bg-success" : "bg-muted-foreground";
  return (
    <span className="relative inline-flex items-center justify-center w-1.5 h-1.5">
      <span className={`absolute inset-0 rounded-full ${cls} opacity-40 animate-ping`} />
      <span className={`relative w-1.5 h-1.5 rounded-full ${cls}`} />
    </span>
  );
}

const URGENCY_BADGE: Record<PriorityAction["urgency"], string> = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-primary text-primary-foreground",
  medium: "bg-foreground text-background",
};

interface WorkflowRow {
  id: string;
  name: string;
  is_deployed: boolean | null;
  updated_at: string;
}

function useWorkflows() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<WorkflowRow[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase
      .from("workflows")
      .select("id, name, is_deployed, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(4)
      .then(({ data }) => setWorkflows(data || []));
  }, [user]);
  return workflows;
}

const sparkData = [
  { d: "M", v: 12 }, { d: "T", v: 18 }, { d: "W", v: 15 }, { d: "T", v: 23 },
  { d: "F", v: 31 }, { d: "S", v: 27 }, { d: "S", v: 34 },
];

export function NerveCenterView({ onNavigate, onNewChat }: NerveCenterViewProps) {
  const { briefing, loading, generateBriefing } = useNerveCenter();
  const { alerts, dismissAlert, dismissAll } = useNerveCenterAlerts();
  const workspace = useWorkspaceContext();
  const profile = useUserProfile();
  const workflows = useWorkflows();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleAction = (action: PriorityAction) => {
    if (action.action_type === "chat" && action.action_prompt) {
      onNewChat(action.action_prompt);
    } else {
      onNavigate(action.action_type as ViewMode);
    }
  };

  const firstName = profile?.displayName?.split(" ")[0] || "there";
  const priorityCount = briefing?.priority_actions.length ?? 0;

  // Build "opportunities" from real priority_actions (ranked, RICE-style scoring)
  const opportunities = (briefing?.priority_actions || []).map((a, i) => {
    const score =
      a.urgency === "critical" ? 480 + (3 - i) * 10 :
      a.urgency === "high" ? 320 + (3 - i) * 10 :
      180 + (3 - i) * 10;
    return {
      id: `OPP-${String(i + 1).padStart(3, "0")}`,
      title: a.title,
      cat: a.action_type.replace("-", " "),
      reach: workspace?.totalLeads ?? 0,
      impact: a.urgency === "critical" ? 3 : a.urgency === "high" ? 2 : 1,
      confidence: a.urgency === "critical" ? 92 : a.urgency === "high" ? 78 : 65,
      effort: a.urgency === "critical" ? 2 : 4,
      rice: score,
      action: a,
    };
  });

  // Build "synthesis feed" from anomalies + wins
  const feedItems = [
    ...(briefing?.anomalies || []).map((a, i) => ({
      type: a.severity === "warning" ? "anomaly" : "signal",
      title: a.signal,
      body: a.recommendation,
      key: `a-${i}`,
    })),
    ...(briefing?.wins || []).map((w, i) => ({
      type: "win",
      title: w,
      body: "Recent momentum in your workspace.",
      key: `w-${i}`,
    })),
  ];

  // Signal source distribution from real workspace counts
  const sources = (() => {
    const items = [
      { name: "Leads", count: workspace?.totalLeads ?? 0 },
      { name: "Conversations", count: workspace?.totalConversations ?? 0 },
      { name: "Workflows", count: workspace?.totalWorkflows ?? 0 },
      { name: "Emails sent", count: workspace?.emailsSent ?? 0 },
      { name: "Team members", count: workspace?.teamMembers ?? 0 },
    ];
    const total = items.reduce((s, i) => s + i.count, 0) || 1;
    return items.map((i) => ({ ...i, pct: Math.round((i.count / total) * 100) }));
  })();

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Topbar */}
      <header className="h-12 flex items-center justify-between px-4 border-b border-border shrink-0 bg-background/85 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="shrink-0" />
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Mission Control</span>
          <span className="ml-2 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <StatusDot /> Live
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={generateBriefing}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-accent text-foreground disabled:opacity-40 transition-colors"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </button>
          <NotificationBell />
          <button
            onClick={() => onNewChat()}
            className="hidden md:flex items-center gap-2 px-3 h-8 rounded-md font-medium text-[12px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            New signal
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-[1480px] mx-auto">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-end justify-between gap-6 flex-wrap"
          >
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] mb-2 text-muted-foreground inline-flex items-center gap-2">
                <StatusDot />
                Signal detection · live
              </div>
              <h1 className="font-serif text-4xl md:text-5xl leading-[1.05] text-foreground">
                {greeting()}, {firstName}.{" "}
                {priorityCount > 0 ? (
                  <em className="italic text-primary">
                    {priorityCount} new {priorityCount === 1 ? "signal" : "signals"}
                  </em>
                ) : (
                  <em className="italic text-muted-foreground">All clear</em>
                )}{" "}
                worth your attention.
              </h1>
              <p className="mt-3 text-[14px] max-w-xl text-muted-foreground leading-relaxed">
                {briefing?.summary ||
                  (loading
                    ? "Synthesizing your workspace…"
                    : "Lantid will surface what matters from your workspace.")}
              </p>
              {briefing && (
                <p className="text-[10px] text-muted-foreground/70 mt-2 font-mono">
                  Last updated {new Date(briefing.generated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate("workspace")}
                className="flex items-center gap-2 px-3 h-9 rounded-md border border-border text-[12px] font-medium hover:bg-accent transition-colors"
              >
                <Upload className="h-3.5 w-3.5" /> Upload sources
              </button>
              <button
                onClick={() => onNavigate("gtm")}
                className="flex items-center gap-2 px-3 h-9 rounded-md border border-border text-[12px] font-medium hover:bg-accent transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> Export report
              </button>
            </div>
          </motion.div>

          {/* Hero metrics strip */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-xl overflow-hidden border border-border bg-border mb-6"
          >
            {[
              {
                label: "Signals detected",
                value: String(
                  (workspace?.totalLeads ?? 0) +
                    (workspace?.totalConversations ?? 0) +
                    (workspace?.totalWorkflows ?? 0)
                ),
                delta: `+${workspace?.totalLeads ?? 0} this week`,
                trend: "up" as const,
                spark: true,
                note: `across ${workspace?.connectedIntegrations?.length ?? 0} sources`,
              },
              {
                label: "Priorities surfaced",
                value: String(priorityCount),
                delta: priorityCount > 0 ? "needs attention" : "all clear",
                trend: priorityCount > 0 ? ("up" as const) : ("flat" as const),
                spark: false,
                note: `${briefing?.anomalies.length ?? 0} anomalies`,
              },
              {
                label: "Conversations",
                value: String(workspace?.totalConversations ?? 0),
                delta: "active",
                trend: "flat" as const,
                spark: false,
                note: `${workspace?.totalWorkflows ?? 0} workflows`,
              },
              {
                label: "Health score",
                value: briefing ? String(briefing.health_score) : "—",
                delta: briefing ? (briefing.health_score >= 70 ? "healthy" : "watch") : "",
                trend: briefing && briefing.health_score >= 70 ? ("up" as const) : ("down" as const),
                spark: false,
                note: `${workspace?.emailsSent ?? 0} emails sent`,
              },
            ].map((m, i) => (
              <div key={i} className="p-5 relative overflow-hidden bg-card">
                <div className="font-mono text-[10px] uppercase tracking-[0.16em] mb-3 text-muted-foreground">
                  {m.label}
                </div>
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="font-serif text-4xl leading-none text-foreground">{m.value}</span>
                  {m.delta && (
                    <span
                      className={`flex items-center gap-1 text-[11px] font-mono ${
                        m.trend === "up"
                          ? "text-success"
                          : m.trend === "down"
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {m.trend === "up" && <TrendingUp className="h-3 w-3" />}
                      {m.trend === "down" && <TrendingDown className="h-3 w-3" />}
                      {m.delta}
                    </span>
                  )}
                </div>
                {m.note && <div className="text-[11px] text-muted-foreground">{m.note}</div>}
                {m.spark && (
                  <div className="absolute bottom-0 right-0 w-32 h-16 opacity-70 pointer-events-none">
                    <ResponsiveContainer>
                      <AreaChart data={sparkData}>
                        <defs>
                          <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={1.5} fill="url(#sg)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            ))}
          </motion.div>

          {/* Live alerts (slot above the main grid when present) */}
          <AnimatePresence>
            {alerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-6 rounded-xl border border-border bg-card overflow-hidden"
              >
                <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold text-foreground">Live alerts</h2>
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary text-primary-foreground">
                      {alerts.length}
                    </span>
                  </div>
                  <button
                    onClick={dismissAll}
                    className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dismiss all
                  </button>
                </div>
                <div className="p-3 space-y-1.5 max-h-56 overflow-y-auto">
                  {alerts.map((alert) => {
                    const cfg = {
                      critical: { bg: "bg-destructive/10", border: "border-destructive/30", icon: AlertTriangle, color: "text-destructive" },
                      warning: { bg: "bg-primary/10", border: "border-primary/30", icon: AlertTriangle, color: "text-primary" },
                      info: { bg: "bg-muted", border: "border-border", icon: Info, color: "text-muted-foreground" },
                      success: { bg: "bg-success/10", border: "border-success/30", icon: CheckCircle2, color: "text-success" },
                    }[alert.severity];
                    const AlertIcon = cfg.icon;
                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        className={`flex items-start gap-3 p-3 rounded-lg ${cfg.bg} border ${cfg.border} group`}
                      >
                        <AlertIcon className={`h-4 w-4 ${cfg.color} shrink-0 mt-0.5`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground">{alert.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{alert.message}</p>
                          <p className="text-[9px] text-muted-foreground/60 mt-1 font-mono">
                            {new Date(alert.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-accent"
                        >
                          <X className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Two-col main: Opportunities + Synthesis feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Opportunities */}
            <div className="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-xl text-foreground">Top priorities, ranked.</h2>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      RICE v3
                    </span>
                  </div>
                  <p className="text-[12px] mt-0.5 text-muted-foreground">
                    What to act on next, scored by urgency and impact.
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-md border border-border hover:bg-accent transition-colors">
                    <Filter className="h-3 w-3 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => onNavigate("command-center")}
                    className="text-[11px] font-medium flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground"
                  >
                    Command center <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-border">
                <div className="grid grid-cols-12 gap-3 px-5 py-2.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <div className="col-span-1">ID</div>
                  <div className="col-span-5">Opportunity</div>
                  <div className="col-span-1 text-right">Reach</div>
                  <div className="col-span-1 text-right">Impact</div>
                  <div className="col-span-1 text-right">Conf.</div>
                  <div className="col-span-1 text-right">Effort</div>
                  <div className="col-span-2 text-right">Score</div>
                </div>
                {opportunities.length === 0 ? (
                  <div className="p-10 text-center">
                    <Shield className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {loading ? "Generating priorities…" : "No urgent items right now."}
                    </p>
                  </div>
                ) : (
                  opportunities.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => handleAction(o.action)}
                      className="w-full grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-accent/40 transition-colors text-left"
                    >
                      <div className="col-span-1 font-mono text-[11px] text-muted-foreground">{o.id}</div>
                      <div className="col-span-5">
                        <span className="text-[13px] font-medium text-foreground">{o.title}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">
                            {o.cat}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground capitalize">
                            {o.action.urgency}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-1 text-right font-mono text-[12px] text-foreground">
                        {o.reach.toLocaleString()}
                      </div>
                      <div className="col-span-1 text-right font-mono text-[12px] text-foreground">{o.impact}x</div>
                      <div className="col-span-1 text-right font-mono text-[12px] text-foreground">{o.confidence}%</div>
                      <div className="col-span-1 text-right font-mono text-[12px] text-foreground">{o.effort}</div>
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full overflow-hidden bg-border">
                          <div
                            className={`h-full ${o.rice > 400 ? "bg-primary" : o.rice > 200 ? "bg-foreground" : "bg-muted-foreground"}`}
                            style={{ width: `${Math.min(100, o.rice / 5)}%` }}
                          />
                        </div>
                        <span
                          className={`font-mono text-[13px] font-semibold w-10 text-right ${
                            o.rice > 400 ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {o.rice}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Synthesis feed */}
            <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
              <div className="px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-primary" />
                  <h2 className="font-serif text-xl text-foreground">Synthesis feed</h2>
                </div>
                <p className="text-[12px] mt-0.5 text-muted-foreground">
                  Real-time patterns from your workspace.
                </p>
              </div>
              <div className="divide-y divide-border flex-1">
                {feedItems.length === 0 ? (
                  <div className="p-8 text-center">
                    <Activity className="h-7 w-7 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">
                      {loading ? "Listening for signals…" : "No new patterns yet."}
                    </p>
                  </div>
                ) : (
                  feedItems.map((s) => (
                    <div key={s.key} className="px-5 py-3.5 hover:bg-accent/40 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            s.type === "win"
                              ? "bg-success/15 text-success"
                              : s.type === "anomaly"
                              ? "bg-destructive/15 text-destructive"
                              : "bg-primary/15 text-primary"
                          }`}
                        >
                          {s.type}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">now</span>
                      </div>
                      <div className="text-[13px] font-medium mb-0.5 text-foreground">{s.title}</div>
                      <div className="text-[12px] leading-relaxed text-muted-foreground">{s.body}</div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-border">
                <button
                  onClick={() => onNavigate("chat")}
                  className="w-full text-[12px] font-medium py-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground"
                >
                  View all activity
                </button>
              </div>
            </div>
          </div>

          {/* Top recommendation banner */}
          {briefing?.suggested_action && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-6 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card to-primary/5 p-5 flex items-center gap-4 flex-wrap"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <Target className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-[240px]">
                <div className="font-mono text-[10px] uppercase tracking-widest text-primary mb-1 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" /> Top recommendation
                </div>
                <p className="font-serif text-xl text-foreground leading-tight">
                  {briefing.suggested_action.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-2xl">
                  {briefing.suggested_action.reasoning}
                </p>
              </div>
              <button
                onClick={() => onNewChat(briefing.suggested_action.prompt)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Run now
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}

          {/* Workflows + Signal sources */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <WorkflowIcon className="h-4 w-4 text-muted-foreground" />
                    <h2 className="font-serif text-xl text-foreground">Active workflows</h2>
                  </div>
                  <p className="text-[12px] mt-0.5 text-muted-foreground">
                    Pipelines running in the background.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate("workflow")}
                  className="text-[11px] flex items-center gap-1 px-2 py-1 rounded-md hover:bg-accent transition-colors text-muted-foreground"
                >
                  <Plus className="h-3 w-3" /> New workflow
                </button>
              </div>
              {workflows.length === 0 ? (
                <button
                  onClick={() => onNavigate("workflow")}
                  className="w-full p-8 rounded-lg border border-dashed border-border hover:bg-accent/30 transition-colors text-center"
                >
                  <WorkflowIcon className="h-7 w-7 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">
                    No workflows yet. Build your first pipeline.
                  </p>
                </button>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {workflows.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => onNavigate("workflow")}
                      className="p-4 rounded-lg border border-border bg-background hover:bg-accent/40 transition-colors text-left"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <StatusDot tone={w.is_deployed ? "primary" : "muted"} />
                          <span className="text-[13px] font-medium text-foreground truncate">{w.name}</span>
                        </div>
                        <span className="p-1 rounded text-muted-foreground">
                          {w.is_deployed ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <div className="font-mono text-[9px] uppercase tracking-wider mb-0.5 text-muted-foreground">Status</div>
                          <div className={`font-mono text-[12px] ${w.is_deployed ? "text-primary" : "text-muted-foreground"}`}>
                            {w.is_deployed ? "live" : "draft"}
                          </div>
                        </div>
                        <div>
                          <div className="font-mono text-[9px] uppercase tracking-wider mb-0.5 text-muted-foreground">Updated</div>
                          <div className="font-mono text-[12px] text-foreground">
                            {new Date(w.updated_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </div>
                        </div>
                        <div>
                          <div className="font-mono text-[9px] uppercase tracking-wider mb-0.5 text-muted-foreground">Open</div>
                          <div className="font-mono text-[12px] text-foreground">→</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Signal sources */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Gauge className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-serif text-xl text-foreground">Signal sources</h2>
              </div>
              <div className="space-y-3">
                {sources.map((s, i) => {
                  const tone =
                    i === 0 ? "bg-primary" :
                    i === 1 ? "bg-foreground" :
                    i === 2 ? "bg-success" :
                    i === 3 ? "bg-muted-foreground" :
                    "bg-foreground/60";
                  return (
                    <div key={s.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${tone}`} />
                          <span className="text-[12px] text-foreground">{s.name}</span>
                        </div>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {s.count} · {s.pct}%
                        </span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden bg-border">
                        <div className={`h-full rounded-full ${tone} opacity-70`} style={{ width: `${Math.max(s.pct, 2)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => onNavigate("integrations")}
                className="w-full mt-4 text-[12px] font-medium py-2 rounded-md border border-border hover:bg-accent transition-colors text-foreground inline-flex items-center justify-center gap-1.5"
              >
                <Plus className="h-3 w-3" /> Connect source
              </button>
            </div>
          </div>

          {/* Quick pulse footer (kept from prior nav for fast jumps) */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { label: "Leads", value: workspace?.totalLeads ?? 0, icon: Users, view: "workspace" as ViewMode },
              { label: "Chats", value: workspace?.totalConversations ?? 0, icon: MessageSquare, view: "chat" as ViewMode },
              { label: "Workflows", value: workspace?.totalWorkflows ?? 0, icon: GitBranch, view: "workflow" as ViewMode },
              { label: "Emails", value: workspace?.emailsSent ?? 0, icon: Mail, view: "workspace" as ViewMode },
              { label: "Team", value: workspace?.teamMembers ?? 0, icon: Users, view: "team" as ViewMode },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.label}
                  onClick={() => onNavigate(m.view)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors text-left group"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-foreground leading-none">{m.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-mono uppercase tracking-wider">{m.label}</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>

          {/* Empty state when no briefing & not loading */}
          {!briefing && !loading && (
            <div className="mt-8 border border-dashed border-border rounded-xl p-10 text-center">
              <Brain className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-foreground font-medium mb-1">No briefing yet</p>
              <p className="text-xs text-muted-foreground mb-4">
                Generate your AI-powered daily briefing to surface priorities.
              </p>
              <button
                onClick={generateBriefing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Sparkles className="h-4 w-4" /> Generate briefing
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
