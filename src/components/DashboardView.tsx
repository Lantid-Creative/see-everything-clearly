import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useNerveCenter } from "@/hooks/useNerveCenter";
import { useAutonomousAgent } from "@/hooks/useAutonomousAgent";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { motion } from "framer-motion";
import {
  Users,
  Workflow,
  MessageSquare,
  Mail,
  ArrowRight,
  Sparkles,
  Clock,
  Zap,
  AlertTriangle,
  Info,
  RefreshCw,
  Loader2,
  ChevronRight,
  Brain,
  Activity,
  Target,
  Bot,
  Check,
  X,
  Play,
  FileText,
  UserCheck,
  GitBranch,
  Bell,
  Search,
} from "lucide-react";
import type { ViewMode } from "@/pages/Index";

interface DashboardStats {
  totalLeads: number;
  emailsSent: number;
  workflows: number;
  conversations: number;
}

interface RecentItem {
  id: string;
  type: "conversation" | "lead" | "workflow";
  title: string;
  subtitle: string;
  time: string;
  icon: typeof MessageSquare;
}

interface DashboardViewProps {
  onNavigate: (view: ViewMode) => void;
  onNewChat: (prompt?: string) => void;
  activeProductId?: string | null;
  onSetPhase?: (phase: any) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const URGENCY_ICON = { critical: AlertTriangle, high: Zap, medium: Info };
const URGENCY_COLOR = {
  critical: "border-destructive/40 bg-destructive/5",
  high: "border-amber-500/40 bg-amber-500/5",
  medium: "border-blue-500/30 bg-blue-500/5",
};
const URGENCY_BADGE = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-amber-500 text-white",
  medium: "bg-blue-500 text-white",
};

const ACTION_ICON: Record<string, typeof Mail> = {
  draft_email: Mail,
  update_lead_status: UserCheck,
  chain_workflow: GitBranch,
  research: Search,
  notify: Bell,
};

const ACTION_COLOR: Record<string, string> = {
  draft_email: "text-orange-500 bg-orange-500/10",
  update_lead_status: "text-emerald-500 bg-emerald-500/10",
  chain_workflow: "text-blue-500 bg-blue-500/10",
  research: "text-purple-500 bg-purple-500/10",
  notify: "text-amber-500 bg-amber-500/10",
};

export function DashboardView({ onNavigate, onNewChat }: DashboardViewProps) {
  const { user } = useAuth();
  const profile = useUserProfile();
  const workspaceContext = useWorkspaceContext();
  const { briefing, loading: isGenerating, generateBriefing } = useNerveCenter();
  const {
    actions: agentActions,
    running: agentRunning,
    enabled: agentEnabled,
    toggleEnabled: toggleAgent,
    runAgent,
    dismissAction,
  } = useAutonomousAgent();

  const [stats, setStats] = useState<DashboardStats>({ totalLeads: 0, emailsSent: 0, workflows: 0, conversations: 0 });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [leadsRes, emailsRes, workflowsRes, convsRes, recentConvs, recentLeads] = await Promise.all([
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("email_drafts").select("*", { count: "exact", head: true }).eq("user_id", user!.id).eq("sent", true),
        supabase.from("workflows").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("conversations").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("conversations").select("id, title, updated_at").eq("user_id", user!.id).order("updated_at", { ascending: false }).limit(5),
        supabase.from("leads").select("id, name, company, updated_at").eq("user_id", user!.id).order("updated_at", { ascending: false }).limit(3),
      ]);
      setStats({
        totalLeads: leadsRes.count || 0,
        emailsSent: emailsRes.count || 0,
        workflows: workflowsRes.count || 0,
        conversations: convsRes.count || 0,
      });
      const items: RecentItem[] = [];
      (recentConvs.data || []).forEach((c: any) => items.push({ id: c.id, type: "conversation", title: c.title || "Untitled", subtitle: "Chat", time: c.updated_at, icon: MessageSquare }));
      (recentLeads.data || []).forEach((l: any) => items.push({ id: l.id, type: "lead", title: l.name, subtitle: l.company, time: l.updated_at, icon: Users }));
      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setRecentItems(items.slice(0, 6));
      setLoading(false);
    }
    load();
  }, [user]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const actions = briefing?.priority_actions || [];
  const anomalies = briefing?.anomalies || [];

  const handleActionClick = (action: any) => {
    if (action.action === "chat") onNewChat(action.chatPrompt);
    else if (action.action === "navigate") onNavigate(action.target as ViewMode);
  };

  const activeAgentActions = agentActions.filter(a => a.status !== "dismissed");
  const pendingReview = activeAgentActions.filter(a => a.status === "pending_review");
  const completedActions = activeAgentActions.filter(a => a.status === "completed");

  const METRICS = [
    { label: "Conversations", value: stats.conversations, icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10", onClick: () => onNavigate("chat") },
    { label: "Leads", value: stats.totalLeads, icon: Users, color: "text-primary", bg: "bg-primary/10", onClick: () => onNavigate("workspace") },
    { label: "Workflows", value: stats.workflows, icon: Workflow, color: "text-emerald-500", bg: "bg-emerald-500/10", onClick: () => onNavigate("workflow") },
    { label: "Emails Sent", value: stats.emailsSent, icon: Mail, color: "text-orange-500", bg: "bg-orange-500/10", onClick: () => onNavigate("workspace") },
  ];

  return (
    <div className="flex flex-col h-screen">
      <header className="h-12 flex items-center justify-between px-4 border-b shrink-0">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="mr-1" />
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Mission Control</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Agent toggle */}
          <button
            onClick={() => toggleAgent(!agentEnabled)}
            className={`h-7 px-2.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              agentEnabled
                ? "text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
            title={agentEnabled ? "Agent is active" : "Agent is paused"}
          >
            <Bot className="h-3 w-3" />
            {agentEnabled ? "Agent On" : "Agent Off"}
          </button>
          <button
            onClick={() => runAgent()}
            disabled={agentRunning}
            className="h-7 px-2.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center gap-1.5 disabled:opacity-50"
            title="Run agent now"
          >
            {agentRunning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
            Run
          </button>
          <button
            onClick={() => generateBriefing()}
            disabled={isGenerating}
            className="h-7 px-2.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            Briefing
          </button>
          <NotificationBell />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

          {/* Greeting + AI Briefing */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="text-2xl font-serif tracking-tight text-foreground">
              {greeting()}{profile?.displayName ? `, ${profile.displayName}` : ""}
            </h1>
            {briefing ? (
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed max-w-2xl">
                <Brain className="h-3.5 w-3.5 inline-block mr-1 -mt-0.5 text-primary" />
                {briefing.summary}
              </p>
            ) : isGenerating ? (
              <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                Analyzing your workspace...
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1.5">
                Here's what needs your attention today.
              </p>
            )}
          </motion.div>

          {/* Live Metrics Strip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {METRICS.map((m) => (
              <button
                key={m.label}
                onClick={m.onClick}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all text-left group"
              >
                <div className={`h-9 w-9 rounded-lg ${m.bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground leading-none">{loading ? "–" : m.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{m.label}</p>
                </div>
              </button>
            ))}
          </motion.div>

          {/* Agent Activity — Pending Review */}
          {pendingReview.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.07 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <Bot className="h-3.5 w-3.5 text-primary" />
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Agent — Needs Your Review</h2>
                <span className="text-[10px] font-bold bg-primary text-primary-foreground rounded-full h-4 w-4 flex items-center justify-center">
                  {pendingReview.length}
                </span>
              </div>
              <div className="space-y-2">
                {pendingReview.map((action) => {
                  const Icon = ACTION_ICON[action.action_type] || Sparkles;
                  const colorClass = ACTION_COLOR[action.action_type] || "text-muted-foreground bg-muted";
                  return (
                    <div
                      key={action.id}
                      className="flex items-start gap-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5 group"
                    >
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{action.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                        {action.metadata?.email_subject && (
                          <p className="text-xs text-primary mt-1 flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Draft: "{action.metadata.email_subject}"
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            if (action.action_type === "draft_email") onNavigate("workspace");
                            dismissAction(action.id);
                          }}
                          className="h-7 px-2 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1"
                        >
                          <Check className="h-3 w-3" /> Review
                        </button>
                        <button
                          onClick={() => dismissAction(action.id)}
                          className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center justify-center"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Agent Running Indicator */}
          {agentRunning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card"
            >
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Agent is working...</p>
                <p className="text-xs text-muted-foreground">Analyzing leads, drafting emails, updating statuses</p>
              </div>
            </motion.div>
          )}

          {/* Priority Action Queue */}
          {actions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <Target className="h-3.5 w-3.5 text-primary" />
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority Actions</h2>
              </div>
              <div className="space-y-2">
                {actions.map((action: any, idx: number) => {
                  const urgency = action.urgency as keyof typeof URGENCY_ICON;
                  const Icon = URGENCY_ICON[urgency] || Info;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleActionClick(action)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left group hover:shadow-sm ${URGENCY_COLOR[urgency] || "border-border bg-card"}`}
                    >
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${URGENCY_BADGE[urgency] || "bg-muted text-muted-foreground"}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{action.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{action.reason}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Agent Completed Actions */}
          {completedActions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Agent Activity</h2>
              </div>
              <div className="border border-border rounded-xl bg-card divide-y divide-border overflow-hidden">
                {completedActions.slice(0, 5).map((action) => {
                  const Icon = ACTION_ICON[action.action_type] || Sparkles;
                  const colorClass = ACTION_COLOR[action.action_type] || "text-muted-foreground bg-muted";
                  return (
                    <div key={action.id} className="flex items-center gap-3 px-4 py-2.5 group">
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{action.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{action.description}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(action.created_at)}
                      </span>
                      <button
                        onClick={() => dismissAction(action.id)}
                        className="opacity-0 group-hover:opacity-100 h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Anomalies & Wins */}
          {anomalies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Signals</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {anomalies.map((a: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-card">
                    <Sparkles className={`h-4 w-4 mt-0.5 shrink-0 ${a.type === "win" ? "text-emerald-500" : a.type === "risk" ? "text-destructive" : "text-amber-500"}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{a.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty state */}
          {!briefing && !isGenerating && activeAgentActions.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="border border-dashed border-border rounded-2xl p-8 text-center"
            >
              <Brain className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">Your AI agent is ready</p>
              <p className="text-xs text-muted-foreground mt-1">Add leads, conversations, or workflows — the agent will proactively draft emails, update statuses, and surface insights.</p>
              <button
                onClick={() => onNewChat()}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Start a conversation
              </button>
            </motion.div>
          )}

          {/* Activity Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Activity</h2>
            </div>
            <div className="border border-border rounded-xl bg-card divide-y divide-border overflow-hidden">
              {loading ? (
                <div className="p-6 text-center text-sm text-muted-foreground">Loading...</div>
              ) : recentItems.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">No activity yet</p>
                  <button onClick={() => onNewChat()} className="mt-2 text-xs font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1">
                    Start a conversation <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                recentItems.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => {
                      if (item.type === "conversation") onNavigate("chat");
                      else onNavigate("workspace");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent/30 transition-colors text-left"
                  >
                    <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{item.subtitle}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeAgo(item.time)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
