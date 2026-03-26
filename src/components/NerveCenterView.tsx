import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { useNerveCenter, type PriorityAction, type Anomaly } from "@/hooks/useNerveCenter";
import { useNerveCenterAlerts, type NerveAlert } from "@/hooks/useNerveCenterAlerts";
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
  Bell,
  X,
  CheckCircle2,
  Shield,
  ChevronRight,
  Target,
} from "lucide-react";
import type { ViewMode } from "@/pages/Index";

interface NerveCenterViewProps {
  onNavigate: (view: ViewMode) => void;
  onNewChat: (prompt?: string) => void;
}

const URGENCY_STYLES = {
  critical: {
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    text: "text-destructive",
    badge: "bg-destructive text-destructive-foreground",
    icon: AlertTriangle,
  },
  high: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-500 text-white",
    icon: Zap,
  },
  medium: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-500 text-white",
    icon: Info,
  },
};

function HealthRing({ score }: { score: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 70 ? "hsl(var(--success))" : score >= 40 ? "hsl(24, 95%, 53%)" : "hsl(var(--destructive))";

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
        <motion.circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-xl font-bold text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">Health</span>
      </div>
    </div>
  );
}

function PulseMetric({
  label,
  value,
  icon: Icon,
  color,
  onClick,
}: {
  label: string;
  value: number;
  icon: typeof Activity;
  color: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all text-left group"
    >
      <div className={`h-9 w-9 rounded-lg ${color} flex items-center justify-center shrink-0`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-foreground leading-none">{value}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 ml-auto transition-opacity" />
    </button>
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

  return (
    <div className="flex flex-col h-screen">
      <header className="h-12 flex items-center justify-between px-4 border-b shrink-0">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="shrink-0" />
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Nerve Center</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={generateBriefing}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-accent hover:bg-accent/80 text-foreground disabled:opacity-40"
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
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
          {/* Greeting + Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between gap-6"
          >
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-serif tracking-tight text-foreground">
                {greeting()}
                {profile?.displayName ? `, ${profile.displayName}` : ""}
              </h1>
              {briefing ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-2xl"
                >
                  {briefing.summary}
                </motion.p>
              ) : loading ? (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Analyzing your workspace...</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">
                  Your AI-powered daily briefing will appear here.
                </p>
              )}
              {briefing && (
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Last updated {new Date(briefing.generated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
            {briefing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <HealthRing score={briefing.health_score} />
              </motion.div>
            )}
          </motion.div>

          {/* Pulse Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <PulseMetric label="Leads" value={workspace?.totalLeads ?? 0} icon={Users} color="bg-blue-500" onClick={() => onNavigate("workspace")} />
              <PulseMetric label="Conversations" value={workspace?.totalConversations ?? 0} icon={MessageSquare} color="bg-primary" onClick={() => onNavigate("chat")} />
              <PulseMetric label="Workflows" value={workspace?.totalWorkflows ?? 0} icon={GitBranch} color="bg-emerald-500" onClick={() => onNavigate("workflow")} />
              <PulseMetric label="Emails Sent" value={workspace?.emailsSent ?? 0} icon={Mail} color="bg-amber-500" onClick={() => onNavigate("workspace")} />
              <PulseMetric label="Team" value={workspace?.teamMembers ?? 0} icon={Users} color="bg-violet-500" onClick={() => onNavigate("team")} />
            </div>
          </motion.div>

          {/* Live Alerts */}
          <AnimatePresence>
            {alerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.08 }}
                className="border border-border rounded-2xl bg-card overflow-hidden"
              >
                <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold text-foreground">Live Alerts</h2>
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
                    const severityConfig = {
                      critical: { bg: "bg-destructive/10", border: "border-destructive/30", icon: AlertTriangle, iconColor: "text-destructive" },
                      warning: { bg: "bg-amber-500/10", border: "border-amber-500/30", icon: AlertTriangle, iconColor: "text-amber-500" },
                      info: { bg: "bg-blue-500/10", border: "border-blue-500/30", icon: Info, iconColor: "text-blue-500" },
                      success: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: CheckCircle2, iconColor: "text-emerald-500" },
                    };
                    const cfg = severityConfig[alert.severity];
                    const AlertIcon = cfg.icon;
                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        className={`flex items-start gap-3 p-3 rounded-xl ${cfg.bg} border ${cfg.border} group`}
                      >
                        <AlertIcon className={`h-4 w-4 ${cfg.iconColor} shrink-0 mt-0.5`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground">{alert.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{alert.message}</p>
                          <p className="text-[9px] text-muted-foreground/60 mt-1">
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

          {/* Priority Actions + Suggested Action */}
          <AnimatePresence>
            {briefing && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-4"
              >
                {/* Priority Actions */}
                <div className="lg:col-span-2 border border-border rounded-2xl bg-card overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold text-foreground">Needs Your Attention</h2>
                  </div>
                  <div className="p-3 space-y-2">
                    {briefing.priority_actions.length === 0 ? (
                      <div className="p-6 text-center">
                        <Shield className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">All clear! No urgent items.</p>
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
                            className={`w-full flex items-start gap-3 p-3.5 rounded-xl border ${styles.border} ${styles.bg} hover:brightness-95 dark:hover:brightness-110 transition-all text-left group`}
                          >
                            <div className={`h-7 w-7 rounded-lg ${styles.badge} flex items-center justify-center shrink-0 mt-0.5`}>
                              <UrgencyIcon className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground">{action.title}</p>
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

                {/* Suggested Next Action */}
                <div className="border border-primary/30 rounded-2xl bg-gradient-to-br from-primary/5 via-card to-primary/5 overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-primary/20 flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold text-foreground">Top Recommendation</h2>
                  </div>
                  <div className="p-5 flex flex-col h-[calc(100%-52px)]">
                    <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                      {briefing.suggested_action.reasoning}
                    </p>
                    <button
                      onClick={() => onNewChat(briefing.suggested_action.prompt)}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Sparkles className="h-4 w-4" />
                      {briefing.suggested_action.label}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Anomalies + Wins */}
          <AnimatePresence>
            {briefing && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
              >
                {/* Anomalies */}
                <div className="border border-border rounded-2xl bg-card overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
                    <Activity className="h-4 w-4 text-amber-500" />
                    <h2 className="text-sm font-semibold text-foreground">Signals & Anomalies</h2>
                  </div>
                  <div className="p-4 space-y-2">
                    {briefing.anomalies.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No anomalies detected ✓</p>
                    ) : (
                      briefing.anomalies.map((anomaly, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.25 + i * 0.05 }}
                          className={`flex items-start gap-3 p-3 rounded-xl ${
                            anomaly.severity === "warning"
                              ? "bg-amber-500/5 border border-amber-500/20"
                              : "bg-muted/50 border border-border"
                          }`}
                        >
                          {anomaly.severity === "warning" ? (
                            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          ) : (
                            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground">{anomaly.signal}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{anomaly.recommendation}</p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                {/* Wins */}
                <div className="border border-border rounded-2xl bg-card overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-emerald-500" />
                    <h2 className="text-sm font-semibold text-foreground">Momentum & Wins</h2>
                  </div>
                  <div className="p-4 space-y-2">
                    {briefing.wins.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">Start building to earn your first win!</p>
                    ) : (
                      briefing.wins.map((win, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + i * 0.05 }}
                          className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20"
                        >
                          <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-foreground leading-relaxed">{win}</p>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
