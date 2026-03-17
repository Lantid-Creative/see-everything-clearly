import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useChecklistProgress } from "@/hooks/useChecklistProgress";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Workflow,
  MessageSquare,
  Mail,
  ArrowRight,
  Sparkles,
  Clock,
  Compass,
  ClipboardList,
  ListOrdered,
  Hammer,
  Rocket,
  Activity,
  Check,
  Circle,
  ChevronRight,
  BookOpen,
  Lightbulb,
} from "lucide-react";
import type { ViewMode } from "@/pages/Index";
import {
  useProductPhase,
  PHASE_GUIDES,
  type ProductPhase,
  type PhaseInfo,
  type ChecklistItem,
} from "@/hooks/useProductPhase";

interface DashboardStats {
  totalLeads: number;
  emailsSent: number;
  workflows: number;
  conversations: number;
  teamMembers: number;
}

interface RecentItem {
  id: string;
  type: "conversation" | "lead" | "workflow" | "email";
  title: string;
  subtitle: string;
  time: string;
  icon: typeof MessageSquare;
}

interface DashboardViewProps {
  onNavigate: (view: ViewMode) => void;
  onNewChat: (prompt?: string) => void;
  activeProductId?: string | null;
  onSetPhase?: (phase: ProductPhase | null) => void;
}

const PHASE_ICONS: Record<ProductPhase, typeof Compass> = {
  discover: Compass,
  define: ClipboardList,
  prioritize: ListOrdered,
  build: Hammer,
  launch: Rocket,
  measure: Activity,
};

const PHASE_COLORS: Record<ProductPhase, { bg: string; text: string; ring: string; bar: string }> = {
  discover: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", ring: "ring-blue-500/30", bar: "bg-blue-500" },
  define: { bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", ring: "ring-violet-500/30", bar: "bg-violet-500" },
  prioritize: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-500/30", bar: "bg-amber-500" },
  build: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500/30", bar: "bg-emerald-500" },
  launch: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", ring: "ring-orange-500/30", bar: "bg-orange-500" },
  measure: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", ring: "ring-rose-500/30", bar: "bg-rose-500" },
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

export function DashboardView({ onNavigate, onNewChat, activeProductId, onSetPhase }: DashboardViewProps) {
  const { user } = useAuth();
  const profile = useUserProfile();
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    emailsSent: 0,
    workflows: 0,
    conversations: 0,
    teamMembers: 0,
  });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const phaseData = useProductPhase(
    profile
      ? {
          totalLeads: stats.totalLeads,
          totalConversations: stats.conversations,
          totalWorkflows: stats.workflows,
          emailsSent: stats.emailsSent,
          teamMembers: stats.teamMembers,
          profile,
        }
      : null
  );

  useEffect(() => {
    if (!user) return;

    async function loadDashboard() {
      const [leadsRes, emailsRes, workflowsRes, convsRes, teamRes, recentConvs, recentLeads] =
        await Promise.all([
          supabase.from("leads").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
          supabase.from("email_drafts").select("*", { count: "exact", head: true }).eq("user_id", user!.id).eq("sent", true),
          supabase.from("workflows").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
          supabase.from("conversations").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
          supabase.from("team_members").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
          supabase.from("conversations").select("id, title, updated_at").eq("user_id", user!.id).order("updated_at", { ascending: false }).limit(5),
          supabase.from("leads").select("id, name, company, updated_at").eq("user_id", user!.id).order("updated_at", { ascending: false }).limit(3),
        ]);

      setStats({
        totalLeads: leadsRes.count || 0,
        emailsSent: emailsRes.count || 0,
        workflows: workflowsRes.count || 0,
        conversations: convsRes.count || 0,
        teamMembers: teamRes.count || 0,
      });

      const items: RecentItem[] = [];
      (recentConvs.data || []).forEach((c: any) => {
        items.push({ id: c.id, type: "conversation", title: c.title || "Untitled", subtitle: "Chat conversation", time: c.updated_at, icon: MessageSquare });
      });
      (recentLeads.data || []).forEach((l: any) => {
        items.push({ id: l.id, type: "lead", title: l.name, subtitle: l.company, time: l.updated_at, icon: Users });
      });
      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setRecentItems(items.slice(0, 5));
      setLoading(false);
    }

    loadDashboard();
  }, [user]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const currentPhase = phaseData?.currentPhaseInfo;
  const phases = phaseData?.phases || [];
  const phaseInput = phaseData?.input;

  // Persistent checklist progress
  const { isCompleted, toggleItem } = useChecklistProgress(activeProductId ?? null);

  // Get the full guide for the current phase
  const currentGuide = currentPhase ? PHASE_GUIDES[currentPhase.id as ProductPhase] : null;
  const rawChecklist = currentPhase && phaseInput ? currentGuide?.checklist(phaseInput) || [] : [];
  // Override isComplete with persistent DB state
  const checklist = rawChecklist.map((item) => ({
    ...item,
    isComplete: item.isComplete || isCompleted(item.id),
  }));
  const completedCount = checklist.filter((c) => c.isComplete).length;
  const progressPct = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;
  const colors = currentPhase ? PHASE_COLORS[currentPhase.id as ProductPhase] : null;

  const handleChecklistAction = (item: ChecklistItem) => {
    if (item.action.type === "chat") {
      onNewChat(item.action.prompt);
    } else {
      onNavigate(item.action.target as ViewMode);
    }
  };

  const handleTemplateClick = (prompt: string) => {
    onNewChat(prompt);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="h-12 flex items-center justify-between px-4 border-b shrink-0">
        <div className="flex items-center">
          <SidebarTrigger className="mr-3" />
          <span className="text-sm font-medium text-foreground">Home</span>
        </div>
        <NotificationBell />
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
          {/* Greeting + Phase Context */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="text-2xl font-serif tracking-tight text-foreground">
              {greeting()}{profile?.displayName ? `, ${profile.displayName}` : ""}
            </h1>
            {currentGuide && (
              <p className="text-sm text-muted-foreground mt-1">
                {currentGuide.emoji} <span className="font-medium">{currentGuide.tagline}</span> — {currentGuide.description}
              </p>
            )}
          </motion.div>

          {/* Phase Timeline */}
          {phases.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="flex items-center gap-1"
            >
              {phases.map((phase, idx) => {
                const Icon = PHASE_ICONS[phase.id];
                const pColors = PHASE_COLORS[phase.id];
                const isCurrent = phase.isActive;
                const currentIdx = phases.findIndex((p) => p.isActive);
                const isPast = idx < currentIdx;
                return (
                  <div key={phase.id} className="flex items-center flex-1 min-w-0">
                    <button
                      onClick={() => onSetPhase?.(isCurrent ? null : phase.id)}
                      title={isCurrent ? "Reset to auto-detect" : `Switch to ${phase.label}`}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap cursor-pointer hover:ring-1 hover:ring-primary/40 ${
                        isCurrent
                          ? `${pColors.bg} ${pColors.text} ring-1 ${pColors.ring}`
                          : isPast
                          ? "text-muted-foreground/70 line-through hover:text-muted-foreground"
                          : "text-muted-foreground/50 hover:text-muted-foreground"
                      }`}
                    >
                      {isPast ? (
                        <Check className="h-3 w-3 shrink-0" />
                      ) : (
                        <Icon className="h-3 w-3 shrink-0" />
                      )}
                      <span className="hidden sm:inline">{phase.label}</span>
                    </button>
                    {idx < phases.length - 1 && (
                      <div className={`h-px flex-1 mx-1 ${isPast ? "bg-primary/40" : "bg-border"}`} />
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* Main Guided Flow Card */}
          {currentGuide && colors && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="border border-border rounded-2xl bg-card overflow-hidden"
            >
              {/* Phase header */}
              <div className={`px-6 py-4 ${colors.bg} border-b border-border`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl ${colors.bg} ring-1 ${colors.ring} flex items-center justify-center`}>
                      {(() => { const Icon = PHASE_ICONS[currentPhase!.id as ProductPhase]; return <Icon className={`h-5 w-5 ${colors.text}`} />; })()}
                    </div>
                    <div>
                      <h2 className={`text-sm font-semibold ${colors.text}`}>
                        {currentGuide.label} Phase
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        🎯 {currentGuide.goal}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${colors.text}`}>{progressPct}%</p>
                    <p className="text-[10px] text-muted-foreground">{completedCount}/{checklist.length} complete</p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-background/50 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${colors.bar}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Checklist */}
              <div className="p-4 space-y-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                  Guided Steps
                </p>
                {checklist.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
                      item.isComplete
                        ? "opacity-60 hover:opacity-80"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleItem(item.id);
                      }}
                      className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        item.isComplete
                          ? `${colors.bar} border-transparent`
                          : `border-muted-foreground/30 hover:border-primary`
                      }`}
                    >
                      {item.isComplete && <Check className="h-3 w-3 text-white" />}
                    </button>
                    <button
                      onClick={() => handleChecklistAction(item)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <p className={`text-sm font-medium ${item.isComplete ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {item.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
                    </button>
                    {!item.isComplete && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              {/* Transition hint */}
              {currentGuide.nextPhase && progressPct >= 80 && (
                <div className="px-6 py-3 bg-accent/30 border-t border-border flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-xs text-muted-foreground">{currentGuide.transitionHint}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Templates for this phase */}
          {currentGuide && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {currentGuide.label} Templates
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentGuide.templates.map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTemplateClick(template.prompt)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-accent transition-all text-left group"
                  >
                    <div className={`h-8 w-8 rounded-lg ${colors!.bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                      <Sparkles className={`h-3.5 w-3.5 ${colors!.text}`} />
                    </div>
                    <span className="text-sm font-medium text-foreground flex-1">{template.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Bottom row: Stats + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="lg:col-span-2 space-y-3"
            >
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Overview
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Conversations", value: stats.conversations, icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10", onClick: () => onNavigate("chat") },
                  { label: "Leads", value: stats.totalLeads, icon: Users, color: "text-primary", bg: "bg-primary/10", onClick: () => onNavigate("workspace") },
                  { label: "Workflows", value: stats.workflows, icon: Workflow, color: "text-emerald-500", bg: "bg-emerald-500/10", onClick: () => onNavigate("workflow") },
                  { label: "Emails Sent", value: stats.emailsSent, icon: Mail, color: "text-orange-500", bg: "bg-orange-500/10", onClick: () => onNavigate("workspace") },
                ].map((stat) => (
                  <button
                    key={stat.label}
                    onClick={stat.onClick}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all text-left"
                  >
                    <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground leading-none">
                        {loading ? "–" : stat.value}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="lg:col-span-3 space-y-3"
            >
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Recent Activity
              </h2>
              <div className="border border-border rounded-xl bg-card divide-y divide-border overflow-hidden">
                {loading ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
                ) : recentItems.length === 0 ? (
                  <div className="p-8 text-center">
                    <Sparkles className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No activity yet. Start with discovery!</p>
                    <button
                      onClick={() => onNewChat()}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Start a conversation
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  recentItems.map((item) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => {
                        if (item.type === "conversation") onNavigate("chat");
                        else if (item.type === "lead") onNavigate("workspace");
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
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                        <Clock className="h-3 w-3" />
                        {timeAgo(item.time)}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
