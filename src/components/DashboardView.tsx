import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
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
  FileText,
  BarChart3,
  Zap,
  Search,
  Presentation,
  LayoutGrid,
  Clock,
  Compass,
  ClipboardList,
  ListOrdered,
  Hammer,
  Rocket,
  Activity,
  ChevronRight,
  Target,
} from "lucide-react";
import type { ViewMode } from "@/pages/Index";
import { useProductPhase, type ProductPhase, type PhaseInfo } from "@/hooks/useProductPhase";

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
  onNewChat: () => void;
}

const PHASE_ICONS: Record<ProductPhase, typeof Compass> = {
  discover: Compass,
  define: ClipboardList,
  prioritize: ListOrdered,
  build: Hammer,
  launch: Rocket,
  measure: Activity,
};

const PHASE_COLORS: Record<ProductPhase, { bg: string; text: string; ring: string }> = {
  discover: { bg: "bg-blue-500/10", text: "text-blue-600", ring: "ring-blue-500/30" },
  define: { bg: "bg-violet-500/10", text: "text-violet-600", ring: "ring-violet-500/30" },
  prioritize: { bg: "bg-amber-500/10", text: "text-amber-600", ring: "ring-amber-500/30" },
  build: { bg: "bg-emerald-500/10", text: "text-emerald-600", ring: "ring-emerald-500/30" },
  launch: { bg: "bg-orange-500/10", text: "text-orange-600", ring: "ring-orange-500/30" },
  measure: { bg: "bg-rose-500/10", text: "text-rose-600", ring: "ring-rose-500/30" },
};

const PHASE_ACTIONS: Record<ProductPhase, { label: string; icon: typeof MessageSquare; view: ViewMode }[]> = {
  discover: [
    { label: "Run user interviews", icon: MessageSquare, view: "chat" },
    { label: "Build user personas", icon: Users, view: "chat" },
    { label: "Explore leads & contacts", icon: LayoutGrid, view: "workspace" },
  ],
  define: [
    { label: "Write a PRD", icon: FileText, view: "chat" },
    { label: "Generate user stories", icon: Zap, view: "chat" },
    { label: "Create a spec deck", icon: Presentation, view: "slides" },
  ],
  prioritize: [
    { label: "RICE score features", icon: BarChart3, view: "chat" },
    { label: "Build roadmap spreadsheet", icon: BarChart3, view: "spreadsheet" },
    { label: "Competitive analysis", icon: Search, view: "chat" },
  ],
  build: [
    { label: "Create automation workflow", icon: Zap, view: "workflow" },
    { label: "Set up integrations", icon: Zap, view: "integrations" },
    { label: "Configure team access", icon: Users, view: "team" },
  ],
  launch: [
    { label: "Draft GTM plan", icon: Target, view: "chat" },
    { label: "Send outreach emails", icon: Mail, view: "workspace" },
    { label: "Build launch deck", icon: Presentation, view: "slides" },
  ],
  measure: [
    { label: "Define success metrics", icon: Target, view: "chat" },
    { label: "Plan A/B tests", icon: BarChart3, view: "chat" },
    { label: "Run sprint retro", icon: Users, view: "chat" },
  ],
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

export function DashboardView({ onNavigate, onNewChat }: DashboardViewProps) {
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
      setRecentItems(items.slice(0, 6));
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
          {/* Greeting */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="text-2xl font-serif tracking-tight text-foreground">
              {greeting()}{profile?.displayName ? `, ${profile.displayName}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {currentPhase
                ? `You're in the ${currentPhase.label} phase — ${currentPhase.description.toLowerCase()}.`
                : "Here's what's happening with your product work."}
            </p>
          </motion.div>

          {/* Phase Progress Bar */}
          {phases.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex items-center gap-1"
            >
              {phases.map((phase, idx) => {
                const Icon = PHASE_ICONS[phase.id];
                const colors = PHASE_COLORS[phase.id];
                return (
                  <div key={phase.id} className="flex items-center flex-1 min-w-0">
                    <button
                      onClick={() => {
                        const actions = PHASE_ACTIONS[phase.id];
                        if (actions.length > 0) {
                          if (actions[0].view === "chat") onNewChat();
                          else onNavigate(actions[0].view);
                        }
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap ${
                        phase.isActive
                          ? `${colors.bg} ${colors.text} ring-1 ${colors.ring}`
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                      }`}
                    >
                      <Icon className="h-3 w-3 shrink-0" />
                      <span className="hidden sm:inline">{phase.label}</span>
                    </button>
                    {idx < phases.length - 1 && (
                      <div className={`h-px flex-1 mx-1 ${
                        phase.progress >= 80 ? "bg-primary/40" : "bg-border"
                      }`} />
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* Current Phase Actions */}
          {currentPhase && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {currentPhase.label} Phase — Next Steps
                </h2>
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PHASE_ACTIONS[currentPhase.id as ProductPhase].map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (action.view === "chat") onNewChat();
                      else onNavigate(action.view);
                    }}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-accent transition-all text-left group"
                  >
                    <div className={`h-9 w-9 rounded-lg ${PHASE_COLORS[currentPhase.id as ProductPhase].bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                      <action.icon className={`h-4 w-4 ${PHASE_COLORS[currentPhase.id as ProductPhase].text}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{action.label}</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

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
                      onClick={onNewChat}
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
