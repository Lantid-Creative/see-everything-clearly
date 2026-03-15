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
  TrendingUp,
  ArrowRight,
  Sparkles,
  FileText,
  BarChart3,
  Zap,
  Search,
  Presentation,
  LayoutGrid,
  Clock,
} from "lucide-react";
import type { ViewMode } from "@/pages/Index";

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

const quickActions = [
  {
    label: "Ask Lantid AI",
    description: "Get help with product decisions",
    icon: Sparkles,
    view: "chat" as ViewMode,
    color: "bg-primary/10 text-primary",
  },
  {
    label: "View Workspace",
    description: "Manage leads & outreach",
    icon: LayoutGrid,
    view: "workspace" as ViewMode,
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    label: "Build Workflow",
    description: "Automate PM processes",
    icon: Zap,
    view: "workflow" as ViewMode,
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    label: "Create Deck",
    description: "Strategy presentations",
    icon: Presentation,
    view: "slides" as ViewMode,
    color: "bg-blue-500/10 text-blue-600",
  },
];

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

  useEffect(() => {
    if (!user) return;

    async function loadDashboard() {
      const [leadsRes, emailsRes, workflowsRes, convsRes, teamRes, recentConvs, recentLeads] =
        await Promise.all([
          supabase
            .from("leads")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user!.id),
          supabase
            .from("email_drafts")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user!.id)
            .eq("sent", true),
          supabase
            .from("workflows")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user!.id),
          supabase
            .from("conversations")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user!.id),
          supabase
            .from("team_members")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user!.id),
          supabase
            .from("conversations")
            .select("id, title, updated_at")
            .eq("user_id", user!.id)
            .order("updated_at", { ascending: false })
            .limit(5),
          supabase
            .from("leads")
            .select("id, name, company, updated_at")
            .eq("user_id", user!.id)
            .order("updated_at", { ascending: false })
            .limit(3),
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
        items.push({
          id: c.id,
          type: "conversation",
          title: c.title || "Untitled",
          subtitle: "Chat conversation",
          time: c.updated_at,
          icon: MessageSquare,
        });
      });

      (recentLeads.data || []).forEach((l: any) => {
        items.push({
          id: l.id,
          type: "lead",
          title: l.name,
          subtitle: l.company,
          time: l.updated_at,
          icon: Users,
        });
      });

      items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setRecentItems(items.slice(0, 8));
      setLoading(false);
    }

    loadDashboard();
  }, [user]);

  const statCards = [
    {
      label: "Leads",
      value: stats.totalLeads,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
      onClick: () => onNavigate("workspace"),
    },
    {
      label: "Conversations",
      value: stats.conversations,
      icon: MessageSquare,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      onClick: () => onNavigate("chat"),
    },
    {
      label: "Workflows",
      value: stats.workflows,
      icon: Workflow,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      onClick: () => onNavigate("workflow"),
    },
    {
      label: "Emails Sent",
      value: stats.emailsSent,
      icon: Mail,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      onClick: () => onNavigate("workspace"),
    },
    {
      label: "Team Members",
      value: stats.teamMembers,
      icon: Users,
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      onClick: () => onNavigate("team"),
    },
  ];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="h-12 flex items-center px-4 border-b shrink-0">
        <SidebarTrigger className="mr-3" />
        <span className="text-sm font-medium text-foreground">Dashboard</span>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-2xl font-serif tracking-tight text-foreground">
              {greeting()}
              {profile?.displayName ? `, ${profile.displayName}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Here's what's happening with your product work.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
          >
            {statCards.map((stat) => (
              <button
                key={stat.label}
                onClick={stat.onClick}
                className="group flex flex-col items-start gap-2 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-accent transition-all text-left"
              >
                <div className={`h-8 w-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground leading-none">
                    {loading ? "–" : stat.value}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {stat.label}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="lg:col-span-1 space-y-3"
            >
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Quick Actions
              </h2>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => {
                      if (action.view === "chat") {
                        onNewChat();
                      } else {
                        onNavigate(action.view);
                      }
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-accent transition-all text-left group"
                  >
                    <div className={`h-9 w-9 rounded-lg ${action.color} flex items-center justify-center shrink-0`}>
                      <action.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {action.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="lg:col-span-2 space-y-3"
            >
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Recent Activity
              </h2>
              <div className="border border-border rounded-xl bg-card divide-y divide-border overflow-hidden">
                {loading ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    Loading activity...
                  </div>
                ) : recentItems.length === 0 ? (
                  <div className="p-8 text-center">
                    <Sparkles className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No activity yet. Start by asking Lantid a question!
                    </p>
                    <button
                      onClick={onNewChat}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Start a conversation
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  recentItems.map((item, idx) => (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => {
                        if (item.type === "conversation") onNavigate("chat");
                        else if (item.type === "lead") onNavigate("workspace");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/30 transition-colors text-left"
                    >
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {item.subtitle}
                        </p>
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

          {/* Recommended Next Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="space-y-3"
          >
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recommended Next Steps
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {getRecommendations(stats, profile?.productGoals).map((rec, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (rec.action === "chat") onNewChat();
                    else onNavigate(rec.action);
                  }}
                  className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-accent transition-all text-left group"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <rec.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {rec.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      {rec.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function getRecommendations(
  stats: DashboardStats,
  goals?: string | null
): { title: string; description: string; icon: typeof MessageSquare; action: ViewMode }[] {
  const recs: { title: string; description: string; icon: typeof MessageSquare; action: ViewMode; priority: number }[] = [];

  if (stats.conversations < 3) {
    recs.push({
      title: "Explore product ideas",
      description: "Ask Lantid to help validate a product idea or run a discovery process.",
      icon: Search,
      action: "chat",
      priority: 10,
    });
  }

  if (stats.workflows === 0) {
    recs.push({
      title: "Create your first workflow",
      description: "Automate repetitive PM tasks like turning feedback into insights.",
      icon: Zap,
      action: "workflow",
      priority: 9,
    });
  }

  if (stats.teamMembers === 0) {
    recs.push({
      title: "Invite your team",
      description: "Collaborate with teammates on product decisions and research.",
      icon: Users,
      action: "team",
      priority: 8,
    });
  }

  if (stats.emailsSent === 0 && stats.totalLeads > 0) {
    recs.push({
      title: "Send your first outreach",
      description: "Draft and send customer discovery emails from your workspace.",
      icon: Mail,
      action: "workspace",
      priority: 7,
    });
  }

  recs.push({
    title: "Write a PRD",
    description: "Generate a product requirements document for your next feature.",
    icon: FileText,
    action: "chat",
    priority: 5,
  });

  recs.push({
    title: "Prioritize your backlog",
    description: "Use RICE scoring to decide what to build next.",
    icon: BarChart3,
    action: "chat",
    priority: 4,
  });

  recs.push({
    title: "Build a strategy deck",
    description: "Create a presentation for stakeholder alignment.",
    icon: Presentation,
    action: "slides",
    priority: 3,
  });

  recs.sort((a, b) => b.priority - a.priority);
  return recs.slice(0, 3);
}
