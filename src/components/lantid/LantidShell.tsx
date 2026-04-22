import React, { useEffect, useState, type ReactNode } from "react";
import {
  Home, Compass, Target, Map, Workflow as WorkflowIcon, FileText, Presentation,
  Table2, Users, Settings, Search, Bell, ChevronDown,
  Sparkles, Radio, TrendingUp, TrendingDown,
  Plus, Filter, Play, Pause,
  Upload, MessageSquare, Inbox, Hash, Star, Activity,
  Download, Flame, Gauge, Zap, ArrowRight, Dot, Edit3, Target as TargetIcon,
  MoreHorizontal,
} from "lucide-react";
import {
  AreaChart, Area, RadialBarChart, RadialBar, ResponsiveContainer, XAxis,
} from "recharts";
import type { ViewMode } from "@/pages/Index";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";
import { useProductPhase, type ProductPhase } from "@/hooks/useProductPhase";
import { useProducts, type Product } from "@/hooks/useProducts";
import { useNotifications } from "@/hooks/useNotifications";
import { useNerveCenter, type Briefing, type PriorityAction } from "@/hooks/useNerveCenter";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";

// ============ DESIGN TOKENS ============
const C = {
  bg: "#0A0A0B",
  bgElev: "#0E0E10",
  surface: "#141416",
  surfaceHi: "#18181C",
  border: "#1F1F23",
  borderHi: "#2A2A30",
  text: "#F5F5F5",
  textDim: "#A8A8B0",
  textMute: "#6B6B74",
  signal: "#D1FF3F",
  signalDim: "#8FB52E",
  amber: "#FFB340",
  coral: "#FF6B6B",
  mint: "#7BE084",
  sky: "#74C7FF",
};

const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Host+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
    .lantid-shell { font-family: 'Host Grotesk', -apple-system, sans-serif; }
    .lantid-shell .font-display { font-family: 'Instrument Serif', serif; letter-spacing: -0.01em; }
    .lantid-shell .font-mono { font-family: 'JetBrains Mono', monospace; font-feature-settings: 'ss01','cv01'; }
    .lantid-shell .grid-bg {
      background-image:
        linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
      background-size: 44px 44px;
    }
    @keyframes lantid-pulse-ring {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.08); }
    }
    .lantid-shell .pulse-dot { animation: lantid-pulse-ring 2s ease-in-out infinite; }
    .lantid-shell .hover-lift { transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease; }
    .lantid-shell .hover-lift:hover { border-color: #2A2A30; background: #18181C; }
  `}</style>
);

type NavKey =
  | "home" | "discover" | "command" | "roadmap" | "workflows"
  | "specs" | "slides" | "data" | "team" | "settings";

const NAV: { key: NavKey; label: string; icon: typeof Home; shortcut?: string }[] = [
  { key: "home",      label: "Home",           icon: Home,         shortcut: "⌘1" },
  { key: "discover",  label: "Discovery",      icon: Compass,      shortcut: "⌘2" },
  { key: "command",   label: "Command Center", icon: Target,       shortcut: "⌘3" },
  { key: "roadmap",   label: "Roadmap",        icon: Map,          shortcut: "⌘4" },
  { key: "workflows", label: "Workflows",      icon: WorkflowIcon, shortcut: "⌘5" },
  { key: "specs",     label: "Specs",          icon: FileText,     shortcut: "⌘6" },
  { key: "slides",    label: "Slides",         icon: Presentation, shortcut: "⌘7" },
  { key: "data",      label: "Spreadsheet",    icon: Table2 },
  { key: "team",      label: "Team",           icon: Users },
];

const PHASES: { key: ProductPhase; label: string; num: string }[] = [
  { key: "discover",   label: "Discover",   num: "01" },
  { key: "define",     label: "Define",     num: "02" },
  { key: "prioritize", label: "Prioritize", num: "03" },
  { key: "build",      label: "Build",      num: "04" },
  { key: "launch",     label: "Launch",     num: "05" },
  { key: "measure",    label: "Measure",    num: "06" },
];

// ============ SIDEBAR ============
function Sidebar({
  view, setView, products, activeProduct, onSelectProduct, onCreateProduct,
  userName, userRole,
}: {
  view: NavKey;
  setView: (v: NavKey) => void;
  products?: Product[];
  activeProduct?: Product | null;
  onSelectProduct: (id: string) => void;
  onCreateProduct: (name: string) => Promise<void> | void;
  userName?: string;
  userRole?: string;
}) {
  const productList = products ?? [];
  const productName = activeProduct?.name || "Workspace";
  const safeUserName = userName || "User";
  const safeUserRole = userRole || "Member";
  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-[248px] border-r flex flex-col z-20"
      style={{ borderColor: C.border, background: C.bgElev }}
    >
      {/* Logo */}
      <div className="px-5 pt-5 pb-6">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center relative"
            style={{ background: C.signal }}
          >
            <div className="absolute inset-0 rounded-md pulse-dot" style={{ background: C.signal, opacity: 0.3 }} />
            <span className="font-display text-black text-lg leading-none relative">L</span>
          </div>
          <div>
            <div className="font-semibold text-[15px] tracking-tight" style={{ color: C.text }}>Lantid</div>
            <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: C.textMute }}>
              Pro · v2.4
            </div>
          </div>
        </div>
      </div>

      {/* Workspace switcher */}
      <div className="px-3 mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="w-full flex items-center justify-between px-3 py-2 rounded-md border hover-lift"
              style={{ borderColor: C.border, background: C.surface }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                  style={{ background: "#1F2A14", color: C.signal }}
                >
                  <span className="font-mono text-[10px] font-semibold">
                    {productName.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 text-left">
                  <div className="text-xs font-medium truncate" style={{ color: C.text }}>{productName}</div>
                  <div className="font-mono text-[9px] truncate" style={{ color: C.textMute }}>
                    {productList.length} {productList.length === 1 ? "product" : "products"}
                  </div>
                </div>
              </div>
              <ChevronDown size={13} style={{ color: C.textMute }} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={6}
            className="w-[248px] p-1 border"
            style={{ background: C.bgElev, borderColor: C.border }}
          >
            <div className="font-mono text-[10px] uppercase tracking-widest px-2 py-1.5" style={{ color: C.textMute }}>
              Switch product
            </div>
            <div className="max-h-64 overflow-y-auto">
              {productList.map(p => (
                <button
                  key={p.id}
                  onClick={() => onSelectProduct(p.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover-lift text-left"
                  style={{ color: p.id === activeProduct?.id ? C.signal : C.text }}
                >
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                    style={{ background: "#1F2A14", color: C.signal }}
                  >
                    <span className="font-mono text-[9px] font-semibold">{p.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <span className="text-[12px] truncate">{p.name}</span>
                </button>
              ))}
            </div>
            <div className="border-t mt-1 pt-1" style={{ borderColor: C.border }}>
              <button
                onClick={async () => {
                  const name = window.prompt("New product name");
                  if (name?.trim()) await onCreateProduct(name.trim());
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover-lift text-[12px]"
                style={{ color: C.textDim }}
              >
                <Plus size={12} /> New product
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] px-2 mb-2" style={{ color: C.textMute }}>
          Workspace
        </div>
        <div className="space-y-0.5">
          {NAV.slice(0, 7).map(item => {
            const Icon = item.icon;
            const active = view === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className="w-full group flex items-center justify-between px-2.5 py-[7px] rounded-md transition-all relative"
                style={{ background: active ? C.surface : "transparent", color: active ? C.text : C.textDim }}
              >
                <div className="flex items-center gap-2.5">
                  {active && (
                    <div className="absolute left-0 w-[2px] h-4 rounded-r" style={{ background: C.signal }} />
                  )}
                  <Icon size={15} strokeWidth={active ? 2 : 1.6} />
                  <span className="text-[13px] font-medium">{item.label}</span>
                </div>
                {item.shortcut && (
                  <span
                    className="font-mono text-[10px] opacity-0 group-hover:opacity-100 transition"
                    style={{ color: C.textMute }}
                  >
                    {item.shortcut}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div
          className="font-mono text-[10px] uppercase tracking-[0.14em] px-2 mt-6 mb-2"
          style={{ color: C.textMute }}
        >
          Data
        </div>
        <div className="space-y-0.5">
          {NAV.slice(7).map(item => {
            const Icon = item.icon;
            const active = view === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-md"
                style={{ background: active ? C.surface : "transparent", color: active ? C.text : C.textDim }}
              >
                <Icon size={15} strokeWidth={active ? 2 : 1.6} />
                <span className="text-[13px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Token meter */}
        <div className="mt-6 mx-1 p-3 rounded-lg border" style={{ borderColor: C.border, background: C.surface }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: C.textMute }}>
              Tokens
            </span>
            <span className="font-mono text-[10px]" style={{ color: C.signal }}>PRO</span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="font-mono text-lg font-semibold" style={{ color: C.text }}>17,842</span>
            <span className="font-mono text-[10px]" style={{ color: C.textMute }}>/ 25,000</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden mb-2.5" style={{ background: C.border }}>
            <div className="h-full" style={{ width: "71%", background: C.signal }} />
          </div>
          <button
            className="w-full text-[11px] py-1.5 rounded-md font-medium transition"
            style={{ background: C.surfaceHi, color: C.textDim }}
          >
            Buy tokens
          </button>
        </div>
      </nav>

      {/* User */}
      <div className="p-3 border-t" style={{ borderColor: C.border }}>
        <button
          onClick={() => setView("settings")}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md hover-lift"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-display text-sm"
            style={{ background: "linear-gradient(135deg, #D1FF3F, #8FB52E)", color: "#0A0A0B" }}
          >
            {safeUserName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[13px] font-medium truncate" style={{ color: C.text }}>{safeUserName}</div>
            <div className="font-mono text-[10px] truncate" style={{ color: C.textMute }}>{safeUserRole}</div>
          </div>
          <Settings size={13} style={{ color: C.textMute }} />
        </button>
      </div>
    </aside>
  );
}

// ============ TOPBAR ============
function Topbar({
  currentPhase, setCurrentPhase, onSearch, onNewSignal,
}: {
  currentPhase: ProductPhase | null;
  setCurrentPhase: (p: ProductPhase) => void;
  onSearch: () => void;
  onNewSignal: () => void;
}) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  return (
    <div
      className="sticky top-0 z-10 border-b backdrop-blur-xl"
      style={{ borderColor: C.border, background: "rgba(10,10,11,0.85)" }}
    >
      <div className="h-14 px-6 flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <button
            onClick={onSearch}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md border text-left"
            style={{ borderColor: C.border, background: C.surface }}
          >
            <Search size={13} style={{ color: C.textMute }} />
            <span className="flex-1 text-[13px]" style={{ color: C.textMute }}>
              Search signals, specs, features, people
            </span>
            <div className="flex items-center gap-1 font-mono text-[10px]" style={{ color: C.textMute }}>
              <kbd className="px-1.5 py-[1px] rounded border" style={{ borderColor: C.border }}>⌘</kbd>
              <kbd className="px-1.5 py-[1px] rounded border" style={{ borderColor: C.border }}>K</kbd>
            </div>
          </button>
        </div>

        <div
          className="flex items-center gap-1 px-3 py-1.5 rounded-md border"
          style={{ borderColor: C.border, background: C.surface }}
        >
          <span
            className="font-mono text-[10px] uppercase tracking-widest mr-2"
            style={{ color: C.textMute }}
          >
            Phase
          </span>
          {PHASES.map((p, i) => {
            const active = p.key === currentPhase;
            const idx = PHASES.findIndex(x => x.key === currentPhase);
            const done = idx > i;
            return (
              <React.Fragment key={p.key}>
                <button
                  onClick={() => setCurrentPhase(p.key)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded transition"
                  style={{
                    background: active ? "#1F2A14" : "transparent",
                    color: active ? C.signal : done ? C.textDim : C.textMute,
                  }}
                >
                  <span className="font-mono text-[10px]">{p.num}</span>
                  <span className="text-[11px] font-medium">{p.label}</span>
                </button>
                {i < PHASES.length - 1 && (
                  <div className="w-2 h-[1px]" style={{ background: C.border }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="relative w-8 h-8 flex items-center justify-center rounded-md border hover-lift"
              style={{ borderColor: C.border }}
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
            >
              <Bell size={14} style={{ color: C.textDim }} />
              {unreadCount > 0 && (
                <div
                  className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center font-mono text-[9px] font-semibold"
                  style={{ background: C.signal, color: "#0A0A0B" }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </div>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={6}
            className="w-[340px] p-0 border"
            style={{ background: C.bgElev, borderColor: C.border }}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: C.border }}>
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: C.textMute }}>
                Notifications {unreadCount > 0 && `· ${unreadCount} new`}
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-[10px] font-medium"
                  style={{ color: C.signal }}
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-[360px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-[12px]" style={{ color: C.textMute }}>
                  Nothing new yet.
                </div>
              ) : (
                notifications.slice(0, 20).map(n => (
                  <button
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className="w-full text-left px-3 py-2.5 border-b hover:bg-white/[0.015]"
                    style={{ borderColor: C.border, opacity: n.read ? 0.6 : 1 }}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && (
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: C.signal }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-medium" style={{ color: C.text }}>{n.title}</div>
                        <div className="text-[11px] mt-0.5" style={{ color: C.textDim }}>{n.message}</div>
                        <div className="font-mono text-[10px] mt-1" style={{ color: C.textMute }}>
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        <button
          onClick={onNewSignal}
          className="flex items-center gap-2 px-3 h-8 rounded-md font-medium text-[12px] transition"
          style={{ background: C.signal, color: "#0A0A0B" }}
        >
          <Plus size={13} strokeWidth={2.5} />
          New signal
        </button>
      </div>
    </div>
  );
}

// ============ HELPERS ============
function StatusDot({ color }: { color: string }) {
  return (
    <span className="relative inline-flex">
      <span className="absolute inset-0 rounded-full pulse-dot" style={{ background: color, opacity: 0.4 }} />
      <span className="relative w-1.5 h-1.5 rounded-full" style={{ background: color }} />
    </span>
  );
}

const signalSparkData = [
  { d: "M", v: 12 }, { d: "T", v: 18 }, { d: "W", v: 15 }, { d: "T", v: 23 },
  { d: "F", v: 31 }, { d: "S", v: 27 }, { d: "S", v: 34 },
];

// ============ DISCOVERY VIEW ============
interface DiscoverySignal {
  id: string;
  kind: "lead" | "conversation";
  title: string;
  subtitle: string;
  meta: string;
  created_at: string;
}

function DiscoveryView({
  conversations, activeConversationId, onSelectConversation, onNewChat, chatNode,
}: {
  conversations: { id: string; title: string; createdAt: Date; messages: { role: string }[] }[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  chatNode: ReactNode;
}) {
  const { user } = useAuth();
  const [leads, setLeads] = useState<{ id: string; name: string; company: string; title: string; created_at: string }[]>([]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("leads")
        .select("id, name, company, title, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(15);
      if (!cancelled) setLeads(data ?? []);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const signals: DiscoverySignal[] = [
    ...leads.map((l) => ({
      id: `lead-${l.id}`,
      kind: "lead" as const,
      title: l.name || "Unnamed lead",
      subtitle: [l.title, l.company].filter(Boolean).join(" · ") || "—",
      meta: (() => { try { return formatDistanceToNow(new Date(l.created_at), { addSuffix: true }); } catch { return ""; } })(),
      created_at: l.created_at,
    })),
    ...conversations.slice(0, 10).map((c) => ({
      id: `conv-${c.id}`,
      kind: "conversation" as const,
      title: c.title || "Untitled discovery",
      subtitle: `${c.messages.length} messages`,
      meta: (() => { try { return formatDistanceToNow(c.createdAt, { addSuffix: true }); } catch { return ""; } })(),
      created_at: c.createdAt.toISOString(),
    })),
  ].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 25);

  return (
    <div className="grid grid-cols-12 gap-0 h-[calc(100vh-56px-49px)]">
      <aside className="col-span-12 md:col-span-4 lg:col-span-3 border-r overflow-y-auto" style={{ borderColor: C.border, background: C.bgElev }}>
        <div className="px-4 py-3 border-b sticky top-0 z-10" style={{ borderColor: C.border, background: C.bgElev }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Inbox size={14} style={{ color: C.signal }} />
              <h2 className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: C.text }}>Signal inbox</h2>
            </div>
            <button onClick={onNewChat} className="p-1 rounded hover-lift" title="New discovery chat">
              <Plus size={14} style={{ color: C.textDim }} />
            </button>
          </div>
          <div className="text-[11px]" style={{ color: C.textMute }}>
            {signals.length} signals · leads + conversations
          </div>
        </div>

        {signals.length === 0 && (
          <div className="p-6 text-center">
            <div className="text-[12px] mb-3" style={{ color: C.textDim }}>
              No signals yet. Start a discovery chat or add leads.
            </div>
            <button onClick={onNewChat}
              className="text-[12px] px-3 py-1.5 rounded-md border hover-lift inline-flex items-center gap-1.5"
              style={{ borderColor: C.border, color: C.text }}>
              <Sparkles size={11} /> Start discovery
            </button>
          </div>
        )}

        <div>
          {signals.map((s) => {
            const isActive = s.kind === "conversation" && s.id === `conv-${activeConversationId}`;
            return (
              <button
                key={s.id}
                onClick={() => {
                  if (s.kind === "conversation") onSelectConversation(s.id.replace("conv-", ""));
                }}
                className="w-full text-left px-4 py-3 border-b hover:bg-white/[0.02] transition"
                style={{ borderColor: C.border, background: isActive ? C.surface : "transparent" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{
                      background: s.kind === "lead" ? "#1F2A14" : "#14242A",
                      color: s.kind === "lead" ? C.signal : C.sky,
                    }}
                  >
                    {s.kind}
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: C.textMute }}>{s.meta}</span>
                </div>
                <div className="text-[13px] font-medium truncate" style={{ color: C.text }}>{s.title}</div>
                <div className="text-[11px] truncate mt-0.5" style={{ color: C.textDim }}>{s.subtitle}</div>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="col-span-12 md:col-span-8 lg:col-span-9 bg-background text-foreground overflow-hidden">
        {chatNode}
      </section>
    </div>
  );
}

// ============ HOME VIEW ============
interface LiveWorkflow { id: string; name: string; is_deployed: boolean; updated_at: string }

function HomeView({
  userName, totals, onNavigate, briefing, briefingLoading, onRefreshBriefing, workflows,
}: {
  userName: string;
  totals: { leads: number; conversations: number; workflows: number; emails: number };
  onNavigate: (v: NavKey) => void;
  briefing: Briefing | null;
  briefingLoading: boolean;
  onRefreshBriefing: () => void;
  workflows: LiveWorkflow[];
}) {
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  const totalSignals = totals.leads + totals.conversations + totals.emails;
  const priorityActions = briefing?.priority_actions ?? [];
  const opportunities = priorityActions.length || Math.max(1, Math.round(totals.leads * 0.3));
  const wins = briefing?.wins ?? [];
  const anomalies = briefing?.anomalies ?? [];

  const synthesisFeed = [
    ...anomalies.slice(0, 2).map((a) => ({
      t: "live", title: a.signal, body: a.recommendation,
      type: a.severity === "warning" ? ("metric" as const) : ("interview" as const),
    })),
    ...wins.slice(0, 2).map((w) => ({
      t: "today", title: w, body: "Recent progress detected in your workspace.",
      type: "pattern" as const,
    })),
    ...(briefing ? [] : [
      { t: "today", title: `${totals.leads} leads in workspace`, body: "Open Discovery to dig in.", type: "pattern" as const },
      { t: "today", title: `${totals.conversations} discovery conversations`, body: "Synthesized patterns ready to review.", type: "interview" as const },
    ]),
  ].slice(0, 5);

  const topOpportunities = priorityActions.length > 0
    ? priorityActions.slice(0, 5).map((p, i) => ({
        id: `OPP-${String(i + 1).padStart(3, "0")}`,
        title: p.title,
        description: p.description,
        urgency: p.urgency,
        action_type: p.action_type,
        rice: p.urgency === "critical" ? 480 : p.urgency === "high" ? 320 : 180,
        cat: p.action_type === "workflow" ? "Workflow" : p.action_type === "chat" ? "Insight" : "Growth",
      }))
    : [];

  const sources = [
    { name: "Leads", count: totals.leads, pct: Math.min(100, totals.leads * 2), c: C.signal },
    { name: "Conversations", count: totals.conversations, pct: Math.min(100, totals.conversations * 4), c: C.amber },
    { name: "Workflows", count: totals.workflows, pct: Math.min(100, totals.workflows * 10), c: C.sky },
    { name: "Emails sent", count: totals.emails, pct: Math.min(100, totals.emails * 3), c: C.mint },
  ];

  return (
    <div className="p-8 max-w-[1480px]">
      {/* Greeting */}
      <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <div
            className="font-mono text-[11px] uppercase tracking-[0.18em] mb-2"
            style={{ color: C.textMute }}
          >
            <span className="inline-flex items-center gap-1.5">
              <StatusDot color={C.signal} />
              Signal detection · live
            </span>
          </div>
          <h1 className="font-display text-5xl leading-[1.05]" style={{ color: C.text }}>
            {greeting}, {(userName || "there").split(" ")[0]}.{" "}
            <em className="italic" style={{ color: C.signal }}>
              {opportunities} new signals
            </em>{" "}
            worth your attention.
          </h1>
          <p className="mt-3 text-[14px] max-w-xl" style={{ color: C.textDim }}>
            Lantid synthesized {totalSignals} sources across leads, conversations, and outreach. Here is what surfaced.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-3 h-9 rounded-md border text-[12px] font-medium hover-lift"
            style={{ borderColor: C.border, color: C.text }}
          >
            <Upload size={13} /> Upload sources
          </button>
          <button
            className="flex items-center gap-2 px-3 h-9 rounded-md border text-[12px] font-medium hover-lift"
            style={{ borderColor: C.border, color: C.text }}
          >
            <Download size={13} /> Export report
          </button>
        </div>
      </div>

      {/* Hero metrics strip */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px rounded-xl overflow-hidden border mb-8"
        style={{ borderColor: C.border, background: C.border }}
      >
        {[
          { label: "Signals detected", value: String(totalSignals), delta: `+${totals.leads} new`, trend: "up", spark: true, note: `across ${totals.leads + totals.conversations} sources` },
          { label: "Opportunities surfaced", value: String(opportunities), delta: "+6 this week", trend: "up", note: `${Math.ceil(opportunities * 0.25)} high priority` },
          { label: "Workflows active", value: String(totals.workflows), delta: "running", trend: "flat", note: "agent-ready" },
          { label: "Outreach sent", value: String(totals.emails), delta: "this cycle", trend: "down", good: true, note: "tracked replies" },
        ].map((m, i) => (
          <div key={i} className="p-5 relative overflow-hidden" style={{ background: C.bgElev }}>
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] mb-3" style={{ color: C.textMute }}>
              {m.label}
            </div>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="font-display text-4xl leading-none" style={{ color: C.text }}>{m.value}</span>
              <span
                className="flex items-center gap-1 text-[11px] font-mono"
                style={{ color: m.trend === "up" ? C.mint : m.trend === "down" && m.good ? C.mint : m.trend === "down" ? C.coral : C.textDim }}
              >
                {m.trend === "up" && <TrendingUp size={11} />}
                {m.trend === "down" && <TrendingDown size={11} />}
                {m.delta}
              </span>
            </div>
            <div className="text-[11px]" style={{ color: C.textMute }}>{m.note}</div>
            {m.spark && (
              <div className="absolute bottom-0 right-0 w-32 h-16 opacity-60 pointer-events-none">
                <ResponsiveContainer>
                  <AreaChart data={signalSparkData}>
                    <defs>
                      <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.signal} stopOpacity={0.5} />
                        <stop offset="100%" stopColor={C.signal} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke={C.signal} strokeWidth={1.5} fill="url(#sg)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Two-col main */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Opportunities */}
        <div className="lg:col-span-2 rounded-xl border overflow-hidden" style={{ borderColor: C.border, background: C.bgElev }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl" style={{ color: C.text }}>Top opportunities, ranked.</h2>
                <span
                  className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                  style={{ background: C.surfaceHi, color: C.textMute }}
                >
                  RICE v3
                </span>
              </div>
              <p className="text-[12px] mt-0.5" style={{ color: C.textMute }}>
                What to build next, scored on reach, impact, confidence, and effort.
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-md hover-lift border" style={{ borderColor: C.border }}>
                <Filter size={12} style={{ color: C.textDim }} />
              </button>
              <button
                onClick={() => onNavigate("roadmap")}
                className="text-[11px] font-medium flex items-center gap-1 px-2 py-1.5 rounded-md hover-lift"
                style={{ color: C.textDim }}
              >
                View roadmap <ArrowRight size={11} />
              </button>
            </div>
          </div>

          <div>
            <div
              className="grid grid-cols-12 gap-3 px-5 py-2.5 font-mono text-[10px] uppercase tracking-wider border-b"
              style={{ color: C.textMute, borderColor: C.border }}
            >
              <div className="col-span-1">ID</div>
              <div className="col-span-7">Opportunity</div>
              <div className="col-span-2 text-right">Urgency</div>
              <div className="col-span-2 text-right">Score</div>
            </div>
            {topOpportunities.length === 0 && (
              <div className="px-5 py-10 text-center">
                <div className="text-[13px] mb-3" style={{ color: C.textDim }}>
                  {briefingLoading ? "Generating opportunities from your workspace…" : "No opportunities yet — add leads or start a discovery chat."}
                </div>
                {!briefingLoading && (
                  <button
                    onClick={onRefreshBriefing}
                    className="text-[12px] px-3 py-1.5 rounded-md border hover-lift inline-flex items-center gap-1.5"
                    style={{ borderColor: C.border, color: C.text }}
                  >
                    <Sparkles size={12} /> Generate briefing
                  </button>
                )}
              </div>
            )}
            {topOpportunities.map(o => {
              const urgencyColor = o.urgency === "critical" ? C.coral : o.urgency === "high" ? C.amber : C.sky;
              return (
                <div
                  key={o.id}
                  onClick={() => onNavigate(o.action_type === "workflow" ? "workflows" : o.action_type === "slides" ? "slides" : o.action_type === "spreadsheet" ? "data" : o.action_type === "command-center" ? "command" : "discover")}
                  className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center border-b hover:bg-white/[0.015] transition cursor-pointer"
                  style={{ borderColor: C.border }}
                >
                  <div className="col-span-1 font-mono text-[11px]" style={{ color: C.textMute }}>{o.id}</div>
                  <div className="col-span-7">
                    <div className="text-[13px] font-medium" style={{ color: C.text }}>{o.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                        style={{ background: C.surface, color: C.textDim }}
                      >
                        {o.cat}
                      </span>
                      <span className="text-[11px]" style={{ color: C.textMute }}>{o.description}</span>
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <span
                      className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{ background: C.surface, color: urgencyColor }}
                    >
                      {o.urgency}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: C.border }}>
                      <div
                        className="h-full"
                        style={{
                          width: `${Math.min(100, o.rice / 5)}%`,
                          background: o.rice > 400 ? C.signal : o.rice > 200 ? C.amber : C.textMute,
                        }}
                      />
                    </div>
                    <span
                      className="font-mono text-[13px] font-semibold w-10 text-right"
                      style={{ color: o.rice > 400 ? C.signal : C.text }}
                    >
                      {o.rice}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Synthesis feed */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: C.border, background: C.bgElev }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-2">
              <Radio size={14} style={{ color: C.signal }} />
              <h2 className="font-display text-xl" style={{ color: C.text }}>Synthesis feed</h2>
            </div>
            <p className="text-[12px] mt-0.5" style={{ color: C.textMute }}>
              Real-time patterns from your sources.
            </p>
          </div>
          <div>
            {synthesisFeed.map((s, i) => (
              <div key={i} className="px-5 py-3.5 border-b hover:bg-white/[0.015] cursor-pointer" style={{ borderColor: C.border }}>
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{
                      background:
                        s.type === "pattern" ? "#1F2A14" :
                        s.type === "metric" ? "#2A1F14" :
                        s.type === "interview" ? "#14242A" : C.surface,
                      color:
                        s.type === "pattern" ? C.signal :
                        s.type === "metric" ? C.amber :
                        s.type === "interview" ? C.sky : C.textDim,
                    }}
                  >
                    {s.type}
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: C.textMute }}>{s.t}</span>
                </div>
                <div className="text-[13px] font-medium mb-0.5" style={{ color: C.text }}>{s.title}</div>
                <div className="text-[12px] leading-relaxed" style={{ color: C.textDim }}>{s.body}</div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t" style={{ borderColor: C.border }}>
            <button
              onClick={() => onNavigate("discover")}
              className="w-full text-[12px] font-medium py-1.5 rounded-md hover-lift"
              style={{ color: C.textDim }}
            >
              View all activity
            </button>
          </div>
        </div>
      </div>

      {/* Workflows + Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 rounded-xl border p-5" style={{ borderColor: C.border, background: C.bgElev }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <WorkflowIcon size={14} style={{ color: C.textDim }} />
                <h2 className="font-display text-xl" style={{ color: C.text }}>Active workflows</h2>
              </div>
              <p className="text-[12px] mt-0.5" style={{ color: C.textMute }}>
                Pipelines running in the background.
              </p>
            </div>
            <button
              onClick={() => onNavigate("workflows")}
              className="text-[11px] flex items-center gap-1 px-2 py-1 rounded-md hover-lift"
              style={{ color: C.textDim }}
            >
              <Plus size={11} /> New workflow
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {workflows.length === 0 && (
              <div className="md:col-span-2 p-6 text-center rounded-lg border" style={{ borderColor: C.border, background: C.surface }}>
                <div className="text-[13px] mb-2" style={{ color: C.textDim }}>No workflows yet.</div>
                <button
                  onClick={() => onNavigate("workflows")}
                  className="text-[12px] px-3 py-1.5 rounded-md hover-lift inline-flex items-center gap-1.5"
                  style={{ color: C.signal }}
                >
                  <Plus size={11} /> Build your first workflow
                </button>
              </div>
            )}
            {workflows.slice(0, 4).map((w) => {
              const updated = (() => {
                try { return formatDistanceToNow(new Date(w.updated_at), { addSuffix: true }); }
                catch { return ""; }
              })();
              return (
                <div key={w.id} onClick={() => onNavigate("workflows")}
                  className="p-4 rounded-lg border hover-lift cursor-pointer" style={{ borderColor: C.border, background: C.surface }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <StatusDot color={w.is_deployed ? C.signal : C.amber} />
                      <span className="text-[13px] font-medium" style={{ color: C.text }}>{w.name}</span>
                    </div>
                    {w.is_deployed
                      ? <Play size={11} style={{ color: C.signal }} />
                      : <Pause size={11} style={{ color: C.textMute }} />}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-wider mb-0.5" style={{ color: C.textMute }}>Status</div>
                      <div className="font-mono text-[13px]" style={{ color: w.is_deployed ? C.signal : C.amber }}>
                        {w.is_deployed ? "Live" : "Draft"}
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-wider mb-0.5" style={{ color: C.textMute }}>Updated</div>
                      <div className="font-mono text-[12px]" style={{ color: C.text }}>{updated}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border p-5" style={{ borderColor: C.border, background: C.bgElev }}>
          <div className="flex items-center gap-2 mb-4">
            <Gauge size={14} style={{ color: C.textDim }} />
            <h2 className="font-display text-xl" style={{ color: C.text }}>Signal sources</h2>
          </div>
          <div className="space-y-3">
            {sources.map((s, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.c }} />
                    <span className="text-[12px]" style={{ color: C.text }}>{s.name}</span>
                  </div>
                  <span className="font-mono text-[10px]" style={{ color: C.textMute }}>
                    {s.count} · {s.pct}%
                  </span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: C.border }}>
                  <div className="h-full" style={{ width: `${s.pct * 2.5}%`, background: s.c }} />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => onNavigate("data")}
            className="w-full mt-4 text-[12px] font-medium py-2 rounded-md border hover-lift"
            style={{ borderColor: C.border, color: C.textDim }}
          >
            <Plus size={11} className="inline mr-1" /> Connect source
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ COMMAND VIEW (visual snapshot) ============
function CommandView({ onOpenFull }: { onOpenFull: () => void }) {
  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] mb-2" style={{ color: C.textMute }}>
          The single source of truth
        </div>
        <h1 className="font-display text-5xl leading-[1.05] mb-3" style={{ color: C.text }}>Command Center.</h1>
        <p className="text-[14px] max-w-xl" style={{ color: C.textDim }}>
          Living brief for this product. Every AI conversation, spec, and decision is grounded here.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <section className="rounded-xl border p-6" style={{ borderColor: C.border, background: C.bgElev }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame size={14} style={{ color: C.signal }} />
                <h3 className="font-mono text-[11px] uppercase tracking-widest" style={{ color: C.text }}>Vision</h3>
              </div>
              <button onClick={onOpenFull} className="p-1 rounded hover-lift"><Edit3 size={12} style={{ color: C.textMute }} /></button>
            </div>
            <p className="font-display text-2xl italic leading-relaxed" style={{ color: C.text }}>
              Be the missing layer between customer signal and shipped software.{" "}
              <span style={{ color: C.signal }}>
                Every coding agent on earth should start its day with a Lantid spec.
              </span>
            </p>
          </section>

          <section className="rounded-xl border p-6" style={{ borderColor: C.border, background: C.bgElev }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TargetIcon size={14} style={{ color: C.signal }} />
                <h3 className="font-mono text-[11px] uppercase tracking-widest" style={{ color: C.text }}>North star metric</h3>
              </div>
            </div>
            <div className="flex items-end justify-between mb-4">
              <div>
                <div className="text-[12px] mb-1" style={{ color: C.textDim }}>Agent-ready specs shipped per week</div>
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-5xl" style={{ color: C.text }}>8.4</span>
                  <span className="font-mono text-[12px]" style={{ color: C.mint }}>+34% WoW</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: C.textMute }}>Q2 target</div>
                <div className="font-mono text-lg" style={{ color: C.text }}>12.0</div>
              </div>
            </div>
            <div className="h-32 -mx-2">
              <ResponsiveContainer>
                <AreaChart data={[
                  { w: "W1", v: 2.1 }, { w: "W2", v: 3.4 }, { w: "W3", v: 3.8 },
                  { w: "W4", v: 5.2 }, { w: "W5", v: 6.1 }, { w: "W6", v: 6.8 },
                  { w: "W7", v: 7.5 }, { w: "W8", v: 8.4 },
                ]}>
                  <defs>
                    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.signal} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={C.signal} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="w" axisLine={false} tickLine={false} tick={{ fill: C.textMute, fontSize: 10, fontFamily: "JetBrains Mono" }} />
                  <Area type="monotone" dataKey="v" stroke={C.signal} strokeWidth={2} fill="url(#cg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-xl border p-6" style={{ borderColor: C.border, background: C.bgElev }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap size={14} style={{ color: C.signal }} />
                <h3 className="font-mono text-[11px] uppercase tracking-widest" style={{ color: C.text }}>Q2 goals</h3>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { text: "Ship collaborative workspaces for research teams", prog: 64 },
                { text: "Reduce spec generation time from 8m to under 3m", prog: 82 },
                { text: "Launch public API for agent integrations", prog: 28 },
                { text: "Add deep integrations with Jira and Linear", prog: 45 },
              ].map((g, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg" style={{ background: C.surface }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center relative">
                    <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                      <circle cx="16" cy="16" r="13" fill="none" stroke={C.border} strokeWidth="3" />
                      <circle cx="16" cy="16" r="13" fill="none" stroke={C.signal} strokeWidth="3"
                        strokeDasharray={`${(g.prog / 100) * 81.68} 81.68`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute font-mono text-[9px]" style={{ color: C.text }}>{g.prog}</span>
                  </div>
                  <p className="flex-1 text-[13px]" style={{ color: C.text }}>{g.text}</p>
                </div>
              ))}
            </div>
            <button
              onClick={onOpenFull}
              className="mt-4 w-full text-[12px] font-medium py-2 rounded-md border hover-lift"
              style={{ borderColor: C.border, color: C.textDim }}
            >
              Open full Command Center
            </button>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-xl border p-5" style={{ borderColor: C.border, background: C.bgElev }}>
            <h3 className="font-mono text-[11px] uppercase tracking-widest mb-3" style={{ color: C.textMute }}>Product health</h3>
            <div className="relative h-36 flex items-center justify-center">
              <ResponsiveContainer>
                <RadialBarChart innerRadius="60%" outerRadius="100%" data={[{ v: 86, fill: C.signal }]} startAngle={90} endAngle={-270}>
                  <RadialBar background={{ fill: C.border }} dataKey="v" cornerRadius={20} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <div className="font-display text-3xl" style={{ color: C.text }}>86</div>
                <div className="font-mono text-[9px] uppercase tracking-widest" style={{ color: C.textMute }}>score</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t" style={{ borderColor: C.border }}>
              {[
                { k: "NPS", v: "47" }, { k: "Retention", v: "94%" },
                { k: "WAU", v: "2,104" }, { k: "Churn", v: "2.1%" },
              ].map(s => (
                <div key={s.k}>
                  <div className="font-mono text-[9px] uppercase" style={{ color: C.textMute }}>{s.k}</div>
                  <div className="font-mono text-sm" style={{ color: C.text }}>{s.v}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border p-5" style={{ borderColor: C.border, background: C.bgElev }}>
            <h3 className="font-mono text-[11px] uppercase tracking-widest mb-3" style={{ color: C.textMute }}>Product notes</h3>
            <div className="space-y-3 text-[12px] leading-relaxed" style={{ color: C.textDim }}>
              {[
                "ICP is PM at a 20-200 person software company already using Cursor or Claude Code.",
                "Primary wedge: specs that agents can execute without human rewrites.",
                "Competitors own the legacy PM stack; we own the AI-native one.",
              ].map((t, i) => (
                <div key={i} className="flex gap-2">
                  <Dot size={16} style={{ color: C.signal }} className="shrink-0 -mt-0.5" />
                  <p>{t}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ============ EMPTY STATE WRAPPER (for routed-out views) ============
function EmbedFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="p-0">
      <div className="px-8 py-4 border-b" style={{ borderColor: C.border, background: C.bgElev }}>
        <div className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: C.textMute }}>{title}</div>
      </div>
      <div className="bg-background text-foreground min-h-[calc(100vh-56px-49px)]">
        {children}
      </div>
    </div>
  );
}

// ============ ROOT ============
export interface LantidShellProps {
  initialView?: NavKey;
  onNavigateExternal: (v: ViewMode) => void;
  onNewChat: () => void;
  onOpenSearch: () => void;
  productName: string;
  currentPhase: ProductPhase | null;
  onSetPhase: (p: ProductPhase | null) => void;
  // External-rendered views injected into the shell
  renderChat: () => ReactNode;
  renderWorkflow: () => ReactNode;
  renderSlides: () => ReactNode;
  renderSpreadsheet: () => ReactNode;
  renderTeam: () => ReactNode;
  renderSettings: () => ReactNode;
  renderCommandCenter: () => ReactNode;
}

export function LantidShell(props: LantidShellProps) {
  const profile = useUserProfile();
  const ws = useWorkspaceContext();
  const phaseData = useProductPhase(
    ws && profile
      ? {
          totalLeads: ws.totalLeads,
          totalConversations: ws.totalConversations,
          totalWorkflows: ws.totalWorkflows,
          emailsSent: ws.emailsSent,
          teamMembers: ws.teamMembers,
          profile,
        }
      : null,
  );

  const { products, activeProduct, setActiveProductId, createProduct } = useProducts();
  const { briefing, loading: briefingLoading, generateBriefing } = useNerveCenter();
  const { user } = useAuth();
  const [liveWorkflows, setLiveWorkflows] = useState<LiveWorkflow[]>([]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("workflows")
        .select("id, name, is_deployed, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(8);
      if (!cancelled) setLiveWorkflows((data ?? []) as LiveWorkflow[]);
    })();
    return () => { cancelled = true; };
  }, [user, ws?.totalWorkflows]);

  const [view, setView] = useState<NavKey>(props.initialView ?? "home");

  // Keyboard shortcuts ⌘1..⌘7
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const map: Record<string, NavKey> = {
        "1": "home", "2": "discover", "3": "command", "4": "roadmap",
        "5": "workflows", "6": "specs", "7": "slides",
      };
      const target = map[e.key];
      if (target) {
        e.preventDefault();
        setView(target);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const userName = profile?.displayName || "Founder";
  const userRole = profile?.role || "Product";
  const totals = {
    leads: ws?.totalLeads ?? 0,
    conversations: ws?.totalConversations ?? 0,
    workflows: ws?.totalWorkflows ?? 0,
    emails: ws?.emailsSent ?? 0,
  };

  const effectivePhase = props.currentPhase ?? phaseData?.currentPhase ?? "discover";

  // Map nav clicks: switch view; chat is created via the "New signal" button
  const handleNav = (k: NavKey) => {
    setView(k);
  };

  const renderBody = () => {
    switch (view) {
      case "home":
        return <HomeView userName={userName} totals={totals} onNavigate={setView} briefing={briefing} briefingLoading={briefingLoading} onRefreshBriefing={generateBriefing} workflows={liveWorkflows} />;
      case "command":
        return (
          <EmbedFrame title="Command Center">
            {props.renderCommandCenter()}
          </EmbedFrame>
        );
      case "discover":
        return (
          <EmbedFrame title="Discovery · AI chat">
            {props.renderChat()}
          </EmbedFrame>
        );
      case "workflows":
        return (
          <EmbedFrame title="Workflows">
            {props.renderWorkflow()}
          </EmbedFrame>
        );
      case "slides":
        return (
          <EmbedFrame title="Slides">
            {props.renderSlides()}
          </EmbedFrame>
        );
      case "data":
        return (
          <EmbedFrame title="Spreadsheet">
            {props.renderSpreadsheet()}
          </EmbedFrame>
        );
      case "team":
        return (
          <EmbedFrame title="Team">
            {props.renderTeam()}
          </EmbedFrame>
        );
      case "settings":
        return (
          <EmbedFrame title="Settings">
            {props.renderSettings()}
          </EmbedFrame>
        );
      case "roadmap":
      case "specs":
        return (
          <div className="p-8 max-w-3xl">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] mb-2" style={{ color: C.textMute }}>
              Coming soon
            </div>
            <h1 className="font-display text-5xl leading-[1.05] mb-3" style={{ color: C.text }}>
              {view === "roadmap" ? "Roadmap." : "Specs."}
            </h1>
            <p className="text-[14px] max-w-xl mb-6" style={{ color: C.textDim }}>
              This view is being wired to your live workspace data. In the meantime, jump into{" "}
              <button onClick={() => setView("home")} className="underline" style={{ color: C.signal }}>Home</button>{" "}
              or{" "}
              <button onClick={() => setView("discover")} className="underline" style={{ color: C.signal }}>Discovery</button>.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="lantid-shell min-h-screen grid-bg w-full"
      style={{ background: C.bg, color: C.text }}
    >
      <FontStyles />
      <Sidebar
        view={view}
        setView={handleNav}
        products={products}
        activeProduct={activeProduct}
        onSelectProduct={setActiveProductId}
        onCreateProduct={async (name) => { await createProduct(name); }}
        userName={userName}
        userRole={userRole}
      />
      <div className="ml-[248px]">
        <Topbar
          currentPhase={effectivePhase as ProductPhase}
          setCurrentPhase={(p) => props.onSetPhase(p)}
          onSearch={props.onOpenSearch}
          onNewSignal={() => { props.onNewChat(); setView("discover"); }}
        />
        <main>{renderBody()}</main>
      </div>
    </div>
  );
}

export default LantidShell;
