import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { useNerveCenter, type PriorityAction } from "@/hooks/useNerveCenter";
import { useNerveCenterAlerts } from "@/hooks/useNerveCenterAlerts";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";
import { useUserProfile } from "@/hooks/useUserProfile";
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
  ChevronRight,
  Target,
  Upload,
  Download,
  Radio,
  Gauge,
  Filter,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import type { ViewMode } from "@/pages/Index";

interface NerveCenterViewProps {
  onNavigate: (view: ViewMode) => void;
  onNewChat: (prompt?: string) => void;
}

const URGENCY_STYLES = {
  critical: {
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    badge: "bg-destructive text-destructive-foreground",
    icon: AlertTriangle,
  },
  high: {
    bg: "bg-primary/10",
    border: "border-primary/30",
    badge: "bg-primary text-primary-foreground",
    icon: Zap,
  },
  medium: {
    bg: "bg-muted",
    border: "border-border",
    badge: "bg-foreground text-background",
    icon: Info,
  },
};

const sparkData = [
  { d: "M", v: 12 }, { d: "T", v: 18 }, { d: "W", v: 15 }, { d: "T", v: 23 },
  { d: "F", v: 31 }, { d: "S", v: 27 }, { d: "S", v: 34 },
];

function StatusDot({ tone = "primary" }: { tone?: "primary" | "success" | "muted" }) {
  const color =
    tone === "success" ? "bg-success" : tone === "muted" ? "bg-muted-foreground" : "bg-primary";
  return (
    <span className="relative inline-flex">
      <span className={`absolute inset-0 rounded-full ${color} opacity-40 animate-ping`} />
      <span className={`relative w-1.5 h-1.5 rounded-full ${color}`} />
    </span>
  );
}

function HealthRing({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const strokeColor =
    score >= 70 ? "hsl(var(--success))" : score >= 40 ? "hsl(var(--primary))" : "hsl(var(--destructive))";

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="5" />
        <motion.circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-foreground leading-none">{score}</span>
        <span className="text-[8px] text-muted-foreground font-mono uppercase tracking-widest mt-0.5">Health</span>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  delta,
  trend,
  note,
  showSpark,
}: {
  label: string;
  value: string | number;
  delta?: string;
  trend?: "up" | "down" | "flat";
  note?: string;
  showSpark?: boolean;
}) {
  const trendColor =
    trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground";
  return (
    <div className="p-5 relative overflow-hidden bg-card">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] mb-3 text-muted-foreground">
        {label}
      </div>
      <div className="flex items-baseline gap-3 mb-1">
        <span className="font-serif text-4xl leading-none text-foreground">{value}</span>
        {delta && (
          <span className={`flex items-center gap-1 text-[11px] font-mono ${trendColor}`}>
            {trend === "up" && <TrendingUp className="h-3 w-3" />}
            {trend === "down" && <TrendingDown className="h-3 w-3" />}
            {delta}
          </span>
        )}
      </div>
      {note && <div className="text-[11px] text-muted-foreground">{note}</div>}
      {showSpark && (
        <div className="absolute bottom-0 right-0 w-32 h-14 opacity-70 pointer-events-none">
          <ResponsiveContainer>
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={1.5} fill="url(#sparkGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export function NerveCenterView({ onNavigate, onNewChat }: NerveCenterViewProps) {
  const { briefing, loading, generateBriefing } = useNerveCenter();
  const { alerts, dismissAlert, dismissAll } = useNerveCenterAlerts();
  const workspace = useWorkspaceContext();
  const profile = useUserProfile();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleAction = (action: PriorityAction) => {
    if (action.action_type === "chat" && action.action_prompt) {
      onNewChat(action.action_prompt);
    } else {
      onNavigate(action.action_type as ViewMode);
    }
  };

  const totalSignals =
    (workspace?.totalLeads ?? 0) +
    (workspace?.totalConversations ?? 0) +
    (workspace?.totalWorkflows ?? 0);
  const priorityCount = briefing?.priority_actions.length ?? 0;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="h-12 flex items-center justify-between px-4 border-b border-border shrink-0 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="shrink-0" />
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Mission Control</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={generateBriefing}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-border hover:bg-accent text-foreground disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Refresh
          </button>
          <NotificationBell />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1480px] mx-auto px-6 lg:px-8 py-8 space-y-6">
          {/* Greeting / hero */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end justify-between gap-6 flex-wrap"
          >
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] mb-3 text-muted-foreground inline-flex items-center gap-2">
                <StatusDot />
                Signal detection · live
              </div>
              <h1 className="font-serif text-4xl md:text-5xl leading-[1.05] text-foreground">
                {greeting()}
                {profile?.displayName ? `, ${profile.displayName.split(" ")[0]}` : ""}.{" "}
                {briefing && priorityCount > 0 ? (
                  <em className="italic text-primary">
                    {priorityCount} {priorityCount === 1 ? "signal" : "signals"} worth your attention.
                  </em>
                ) : (
                  <em className="italic text-muted-foreground">Your workspace is calm.</em>
                )}
              </h1>
              {briefing ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-3 text-sm md:text-[14px] max-w-2xl text-muted-foreground leading-relaxed"
                >
                  {briefing.summary}
                </motion.p>
              ) : loading ? (
                <div className="flex items-center gap-2 mt-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Synthesizing your workspace...</span>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Your AI-powered daily briefing will appear here.
                </p>
              )}
              {briefing && (
                <p className="text-[10px] text-muted-foreground/70 mt-2 font-mono">
                  Last updated {new Date(briefing.generated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button className="hidden md:flex items-center gap-2 px-3 h-9 rounded-md border border-border text-[12px] font-medium hover:bg-accent transition-colors">
                <Upload className="h-3.5 w-3.5" /> Upload
              </button>
              <button className="hidden md:flex items-center gap-2 px-3 h-9 rounded-md border border-border text-[12px] font-medium hover:bg-accent transition-colors">
                <Download className="h-3.5 w-3.5" /> Export
              </button>
              {briefing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <HealthRing score={briefing.health_score} />
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Hero metrics strip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-xl overflow-hidden border border-border bg-border"
          >
            <MetricCard
              label="Signals detected"
              value={totalSignals}
              delta={`+${workspace?.totalLeads ?? 0} this week`}
              trend="up"
              note="across all sources"
              showSpark
            />
            <MetricCard
              label="Priority actions"
              value={priorityCount}
              delta={priorityCount > 0 ? "needs attention" : "all clear"}
              trend={priorityCount > 0 ? "up" : "flat"}
              note={`${briefing?.anomalies.length ?? 0} anomalies`}
            />
            <MetricCard
              label="Conversations"
              value={workspace?.totalConversations ?? 0}
              delta="active"
              trend="flat"
              note={`${workspace?.totalWorkflows ?? 0} workflows`}
            />
            <MetricCard
              label="Health score"
              value={briefing?.health_score ?? "—"}
              delta={briefing ? (briefing.health_score >= 70 ? "healthy" : "watch") : ""}
              trend={briefing && briefing.health_score >= 70 ? "up" : "down"}
              note={`${workspace?.emailsSent ?? 0} emails sent`}
            />
          </motion.div>

          {/* Quick pulse buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="grid grid-cols-2 sm:grid-cols-5 gap-2"
          >
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
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all text-left group"
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
          </motion.div>

          {/* Live alerts */}
          <AnimatePresence>
            {alerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="border border-border rounded-xl bg-card overflow-hidden"
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
                <div className="p-3 space-y-1.5 max-h-64 overflow-y-auto">
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

          {/* Priority actions + Top recommendation */}
          <AnimatePresence>
            {briefing && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-4"
              >
                {/* Priority actions */}
                <div className="lg:col-span-2 border border-border rounded-xl bg-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif text-xl text-foreground">Top priorities, ranked.</h2>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          AUTO
                        </span>
                      </div>
                      <p className="text-[12px] mt-0.5 text-muted-foreground">
                        What needs your attention next, scored on urgency and impact.
                      </p>
                    </div>
                    <button className="p-1.5 rounded-md border border-border hover:bg-accent transition-colors">
                      <Filter className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="p-3 space-y-2">
                    {briefing.priority_actions.length === 0 ? (
                      <div className="p-8 text-center">
                        <Shield className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">All clear. No urgent items.</p>
                      </div>
                    ) : (
                      briefing.priority_actions.map((action, i) => {
                        const styles = URGENCY_STYLES[action.urgency];
                        const UrgencyIcon = styles.icon;
                        return (
                          <motion.button
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 + i * 0.05 }}
                            onClick={() => handleAction(action)}
                            className={`w-full flex items-start gap-3 p-3.5 rounded-lg border ${styles.border} ${styles.bg} hover:brightness-95 dark:hover:brightness-110 transition-all text-left group`}
                          >
                            <div className={`h-7 w-7 rounded-md ${styles.badge} flex items-center justify-center shrink-0 mt-0.5`}>
                              <UrgencyIcon className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                                  {action.urgency}
                                </span>
                                <span className="font-mono text-[9px] text-muted-foreground">
                                  · {action.action_type}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-foreground mt-0.5">{action.title}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                                {action.description}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
                          </motion.button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Top recommendation */}
                <div className="border border-primary/30 rounded-xl bg-gradient-to-br from-primary/5 via-card to-primary/5 overflow-hidden">
                  <div className="px-5 py-4 border-b border-primary/20 flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold text-foreground">Top recommendation</h2>
                  </div>
                  <div className="p-5 flex flex-col h-[calc(100%-57px)]">
                    <div className="font-mono text-[10px] uppercase tracking-widest mb-2 text-primary inline-flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3" /> Suggested
                    </div>
                    <p className="font-serif text-xl text-foreground mb-2 leading-tight">
                      {briefing.suggested_action.label}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                      {briefing.suggested_action.reasoning}
                    </p>
                    <button
                      onClick={() => onNewChat(briefing.suggested_action.prompt)}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Sparkles className="h-4 w-4" />
                      Run now
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Synthesis feed + Sources */}
          <AnimatePresence>
            {briefing && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-4"
              >
                {/* Synthesis feed (anomalies + wins combined) */}
                <div className="lg:col-span-2 border border-border rounded-xl bg-card overflow-hidden">
                  <div className="px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4 text-primary" />
                      <h2 className="font-serif text-xl text-foreground">Synthesis feed</h2>
                    </div>
                    <p className="text-[12px] mt-0.5 text-muted-foreground">
                      Real-time patterns from your workspace.
                    </p>
                  </div>
                  <div className="divide-y divide-border">
                    {briefing.anomalies.length === 0 && briefing.wins.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-8">
                        No new patterns detected yet.
                      </p>
                    )}
                    {briefing.anomalies.map((anomaly, i) => (
                      <motion.div
                        key={`a-${i}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 + i * 0.05 }}
                        className="px-5 py-3.5 hover:bg-accent/30 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              anomaly.severity === "warning"
                                ? "bg-primary/15 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {anomaly.severity === "warning" ? "anomaly" : "signal"}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground">now</span>
                        </div>
                        <div className="text-[13px] font-medium text-foreground mb-0.5">{anomaly.signal}</div>
                        <div className="text-[12px] leading-relaxed text-muted-foreground">{anomaly.recommendation}</div>
                      </motion.div>
                    ))}
                    {briefing.wins.map((win, i) => (
                      <motion.div
                        key={`w-${i}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className="px-5 py-3.5 hover:bg-accent/30 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-success/15 text-success">
                            win
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground">recent</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Trophy className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                          <div className="text-[13px] text-foreground leading-relaxed">{win}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Signal sources distribution */}
                <div className="border border-border rounded-xl bg-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    <h2 className="font-serif text-xl text-foreground">Signal sources</h2>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: "Leads", count: workspace?.totalLeads ?? 0, tone: "primary" },
                      { name: "Conversations", count: workspace?.totalConversations ?? 0, tone: "foreground" },
                      { name: "Workflows", count: workspace?.totalWorkflows ?? 0, tone: "success" },
                      { name: "Emails", count: workspace?.emailsSent ?? 0, tone: "muted" },
                      { name: "Team", count: workspace?.teamMembers ?? 0, tone: "foreground" },
                    ].map((s) => {
                      const total =
                        (workspace?.totalLeads ?? 0) +
                        (workspace?.totalConversations ?? 0) +
                        (workspace?.totalWorkflows ?? 0) +
                        (workspace?.emailsSent ?? 0) +
                        (workspace?.teamMembers ?? 0) || 1;
                      const pct = Math.round((s.count / total) * 100);
                      const dotClass =
                        s.tone === "primary"
                          ? "bg-primary"
                          : s.tone === "success"
                          ? "bg-success"
                          : s.tone === "muted"
                          ? "bg-muted-foreground"
                          : "bg-foreground";
                      return (
                        <div key={s.name}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                              <span className="text-[12px] text-foreground">{s.name}</span>
                            </div>
                            <span className="font-mono text-[11px] text-muted-foreground">
                              {s.count} · {pct}%
                            </span>
                          </div>
                          <div className="h-1 rounded-full overflow-hidden bg-border">
                            <div
                              className={`h-full rounded-full ${dotClass} opacity-70`}
                              style={{ width: `${Math.max(pct, 2)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => onNavigate("workspace")}
                    className="w-full mt-4 text-[12px] font-medium py-2 rounded-md border border-border hover:bg-accent transition-colors text-foreground"
                  >
                    Open workspace
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!briefing && !loading && (
            <div className="border border-dashed border-border rounded-xl p-12 text-center">
              <Brain className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-foreground font-medium mb-1">No briefing yet</p>
              <p className="text-xs text-muted-foreground mb-4">
                Generate your first AI-powered daily briefing.
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
