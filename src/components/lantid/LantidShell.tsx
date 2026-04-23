import React, { useState, useEffect, useMemo, type ReactNode } from "react";
import {
  Home, Compass, Target, Map, Workflow as WorkflowIcon, FileText, Presentation,
  Table2, Users, Settings, Search, Bell, ChevronDown,
  Sparkles, Radio, TrendingUp, TrendingDown,
  Plus, Filter, Play, Pause,
  Upload, MessageSquare, Inbox, Hash, Star, Activity,
  Download, Flame, Gauge, Zap, ArrowRight, Edit3, Target as TargetIcon,
  MoreHorizontal, GitBranch, Mail, Loader2,
} from "lucide-react";
import { AreaChart, Area, RadialBarChart, RadialBar, ResponsiveContainer, XAxis } from "recharts";
import type { ViewMode } from "@/pages/Index";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";
import { useProductPhase, type ProductPhase } from "@/hooks/useProductPhase";
import { useProducts, type Product } from "@/hooks/useProducts";
import { useNotifications } from "@/hooks/useNotifications";
import { useNerveCenter, type Briefing, type PriorityAction } from "@/hooks/useNerveCenter";
import { useTeam } from "@/hooks/useTeam";
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
    .lantid-shell input::placeholder, .lantid-shell textarea::placeholder { color: #6B6B74; }
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

function StatusDot({ color }: { color: string }) {
  return (
    <span className="relative inline-flex">
      <span className="absolute inset-0 rounded-full pulse-dot" style={{ background: color, opacity: 0.4 }} />
      <span className="relative w-1.5 h-1.5 rounded-full" style={{ background: color }} />
    </span>
  );
}

// ============ SIDEBAR ============
function Sidebar({
  view, setView, products, activeProduct, onSelectProduct, onCreateProduct,
  userName, userRole,
}: {
  view: NavKey;
  setView: (v: NavKey) => void;
  products: Product[];
  activeProduct: Product | null;
  onSelectProduct: (id: string) => void;
  onCreateProduct: (name: string) => Promise<void> | void;
  userName: string;
  userRole: string;
}) {
  const productList = products ?? [];
  const productName = activeProduct?.name || "Workspace";
  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-[248px] border-r flex flex-col z-20"
      style={{ borderColor: C.border, background: C.bgElev }}
    >
      <div className="px-5 pt-5 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md flex items-center justify-center relative" style={{ background: C.signal }}>
            <div className="absolute inset-0 rounded-md pulse-dot" style={{ background: C.signal, opacity: 0.3 }} />
            <span className="font-display text-black text-lg leading-none relative">L</span>
          </div>
          <div>
            <div className="font-semibold text-[15px] tracking-tight" style={{ color: C.text }}>Lantid</div>
            <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: C.textMute }}>Pro</div>
          </div>
        </div>
      </div>

      <div className="px-3 mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="w-full flex items-center justify-between px-3 py-2 rounded-md border hover-lift"
              style={{ borderColor: C.border, background: C.surface }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: "#1F2A14", color: C.signal }}>
                  <span className="font-mono text-[10px] font-semibold">{productName.slice(0, 2).toUpperCase()}</span>
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
            align="start" sideOffset={6}
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
                  <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: "#1F2A14", color: C.signal }}>
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
                  if (name && name.trim()) await onCreateProduct(name.trim());
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

      <nav className="flex-1 px-3 overflow-y-auto">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] px-2 mb-2" style={{ color: C.textMute }}>Workspace</div>
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
                  {active && <div className="absolute left-0 w-[2px] h-4 rounded-r" style={{ background: C.signal }} />}
                  <Icon size={15} strokeWidth={active ? 2 : 1.6} />
                  <span className="text-[13px] font-medium">{item.label}</span>
                </div>
                {item.shortcut && (
                  <span className="font-mono text-[10px] opacity-0 group-hover:opacity-100 transition" style={{ color: C.textMute }}>
                    {item.shortcut}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="font-mono text-[10px] uppercase tracking-[0.14em] px-2 mt-6 mb-2" style={{ color: C.textMute }}>Data</div>
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
      </nav>

      <div className="p-3 border-t" style={{ borderColor: C.border }}>
        <button
          onClick={() => setView("settings")}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md hover-lift"
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center font-display text-sm"
            style={{ background: "linear-gradient(135deg, #D1FF3F, #8FB52E)", color: "#0A0A0B" }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[13px] font-medium truncate" style={{ color: C.text }}>{userName}</div>
            <div className="font-mono text-[10px] truncate" style={{ color: C.textMute }}>{userRole}</div>
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
  currentPhase: ProductPhase;
  setCurrentPhase: (p: ProductPhase) => void;
  onSearch: () => void;
  onNewSignal: () => void;
}) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  return (
    <div className="sticky top-0 z-10 border-b backdrop-blur-xl" style={{ borderColor: C.border, background: "rgba(10,10,11,0.85)" }}>
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

        <div className="flex items-center gap-1 px-3 py-1.5 rounded-md border" style={{ borderColor: C.border, background: C.surface }}>
          <span className="font-mono text-[10px] uppercase tracking-widest mr-2" style={{ color: C.textMute }}>Phase</span>
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
                {i < PHASES.length - 1 && <div className="w-2 h-[1px]" style={{ background: C.border }} />}
              </React.Fragment>
            );
          })}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <button
              className="relative w-8 h-8 flex items-center justify-center rounded-md border hover-lift"
              style={{ borderColor: C.border }}
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
            >
              <Bell size={14} style={{ color: C.textDim }} />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center font-mono text-[9px] font-semibold"
                  style={{ background: C.signal, color: "#0A0A0B" }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </div>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={6} className="w-[340px] p-0 border" style={{ background: C.bgElev, borderColor: C.border }}>
            <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: C.border }}>
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: C.textMute }}>
                Notifications {unreadCount > 0 && `· ${unreadCount} new`}
              </span>
              {unreadCount > 0 && (
                <button onClick={() => markAllAsRead()} className="text-[10px] font-medium" style={{ color: C.signal }}>
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-[360px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-[12px]" style={{ color: C.textMute }}>
                  No notifications yet
                </div>
              ) : (
                notifications.slice(0, 12).map(n => (
                  <button
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className="w-full flex flex-col gap-0.5 px-3 py-2.5 text-left border-b hover-lift"
                    style={{ borderColor: C.border, background: n.read ? "transparent" : "rgba(209,255,63,0.04)" }}
                  >
                    <div className="text-[12px] font-medium" style={{ color: C.text }}>{n.title}</div>
                    {n.message && <div className="text-[11px]" style={{ color: C.textDim }}>{n.message}</div>}
                    <div className="font-mono text-[10px] mt-0.5" style={{ color: C.textMute }}>
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
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

// ============ HOME ============
const sparkData = [
  { d: "M", v: 12 }, { d: "T", v: 18 }, { d: "W", v: 15 }, { d: "T", v: 23 },
  { d: "F", v: 31 }, { d: "S", v: 27 }, { d: "S", v: 34 },
];

interface LiveWorkflow { id: string; name: string; is_deployed: boolean | null; updated_at: string }

function HomeView({
  userName, totals, briefing, briefingLoading, onRefreshBriefing,
  onNavigate, onAction, workflows,
}: {
  userName: string;
  totals: { leads: number; conversations: number; workflows: number; emails: number };
  briefing: Briefing | null;
  briefingLoading: boolean;
  onRefreshBriefing: () => void;
  onNavigate: (k: NavKey) => void;
  onAction: (a: PriorityAction) => void;
  workflows: LiveWorkflow[];
}) {
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const synth = briefing
    ? [
        ...briefing.anomalies.slice(0, 2).map(a => ({
          t: "now", title: a.signal, body: a.recommendation,
          type: a.severity === "warning" ? "pattern" : "metric",
        })),
        ...briefing.wins.slice(0, 2).map(w => ({
          t: "today", title: "Win", body: w, type: "interview",
        })),
      ]
    : [];

  const opportunities = briefing?.priority_actions ?? [];

  return (
    <div className="p-8 max-w-[1480px]">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div className="min-w-0">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] mb-2" style={{ color: C.textMute }}>
            <span className="inline-flex items-center gap-1.5">
              <StatusDot color={C.signal} />
              Signal detection · live
            </span>
          </div>
          <h1 className="font-display text-5xl leading-[1.05]">
            {greeting}, {userName}.{" "}
            {briefing ? (
              <em className="italic" style={{ color: C.signal }}>
                {opportunities.length} {opportunities.length === 1 ? "opportunity" : "opportunities"} worth your attention.
              </em>
            ) : (
              <em className="italic" style={{ color: C.signal }}>Your workspace is awake.</em>
            )}
          </h1>
          <p className="mt-3 text-[14px] max-w-xl" style={{ color: C.textDim }}>
            {briefing?.summary ?? "Generate a briefing to surface anomalies, wins, and what to do next."}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRefreshBriefing}
            disabled={briefingLoading}
            className="flex items-center gap-2 px-3 h-9 rounded-md border text-[12px] font-medium hover-lift disabled:opacity-60"
            style={{ borderColor: C.border }}
          >
            {briefingLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            {briefing ? "Refresh briefing" : "Generate briefing"}
          </button>
          <button onClick={() => onNavigate("data")} className="flex items-center gap-2 px-3 h-9 rounded-md border text-[12px] font-medium hover-lift" style={{ borderColor: C.border }}>
            <Upload size={13} /> Add data
          </button>
        </div>
      </div>

      {/* Hero metrics — live totals */}
      <div className="grid grid-cols-4 gap-px rounded-xl overflow-hidden border mb-8"
        style={{ borderColor: C.border, background: C.border }}>
        {[
          { label: "Conversations", value: totals.conversations, delta: "live", trend: "up", spark: true, note: "AI sessions" },
          { label: "Leads", value: totals.leads, delta: "live", trend: "up", note: "in workspace" },
          { label: "Workflows", value: totals.workflows, delta: "live", trend: "flat", note: "automations" },
          { label: "Emails sent", value: totals.emails, delta: "live", trend: "up", note: "outreach" },
        ].map((m, i) => (
          <button
            key={i}
            onClick={() => onNavigate(["discover", "data", "workflows", "data"][i] as NavKey)}
            className="p-5 relative overflow-hidden text-left hover-lift"
            style={{ background: C.bgElev }}
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] mb-3" style={{ color: C.textMute }}>{m.label}</div>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="font-display text-4xl leading-none">{m.value}</span>
              <span className="flex items-center gap-1 text-[11px] font-mono"
                style={{ color: m.trend === "up" ? C.mint : C.textDim }}>
                {m.trend === "up" && <TrendingUp size={11} />}
                {m.delta}
              </span>
            </div>
            <div className="text-[11px]" style={{ color: C.textMute }}>{m.note}</div>
            {m.spark && (
              <div className="absolute bottom-0 right-0 w-32 h-16 opacity-60 pointer-events-none">
                <ResponsiveContainer>
                  <AreaChart data={sparkData}>
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
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-xl border overflow-hidden" style={{ borderColor: C.border, background: C.bgElev }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl">Priority opportunities</h2>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: C.surfaceHi, color: C.textMute }}>AI</span>
              </div>
              <p className="text-[12px] mt-0.5" style={{ color: C.textMute }}>What to do next, ranked by urgency.</p>
            </div>
            <button onClick={() => onNavigate("roadmap")} className="text-[11px] font-medium flex items-center gap-1 px-2 py-1.5 rounded-md hover-lift" style={{ color: C.textDim }}>
              View roadmap <ArrowRight size={11} />
            </button>
          </div>
          <div className="divide-y" style={{ borderColor: C.border }}>
            {opportunities.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <div className="text-[13px] mb-1" style={{ color: C.text }}>No opportunities surfaced yet.</div>
                <div className="text-[12px]" style={{ color: C.textMute }}>Generate a briefing to see prioritized actions.</div>
              </div>
            ) : opportunities.map((o, i) => (
              <button
                key={i}
                onClick={() => onAction(o)}
                className="w-full grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-white/[0.015] transition text-left"
              >
                <div className="col-span-1 font-mono text-[11px]" style={{ color: C.textMute }}>{String(i + 1).padStart(2, "0")}</div>
                <div className="col-span-7">
                  <div className="text-[13px] font-medium" style={{ color: C.text }}>{o.title}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: C.textDim }}>{o.description}</div>
                </div>
                <div className="col-span-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{
                      background: o.urgency === "critical" ? "#2A1418" : o.urgency === "high" ? "#2A2416" : C.surface,
                      color: o.urgency === "critical" ? C.coral : o.urgency === "high" ? C.amber : C.textDim,
                    }}>
                    {o.urgency}
                  </span>
                </div>
                <div className="col-span-2 text-right text-[11px] flex items-center justify-end gap-1" style={{ color: C.signal }}>
                  Open <ArrowRight size={11} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ borderColor: C.border, background: C.bgElev }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-2">
              <Radio size={14} style={{ color: C.signal }} />
              <h2 className="font-display text-xl">Synthesis feed</h2>
            </div>
            <p className="text-[12px] mt-0.5" style={{ color: C.textMute }}>Patterns from your workspace.</p>
          </div>
          <div className="divide-y" style={{ borderColor: C.border }}>
            {synth.length === 0 ? (
              <div className="px-5 py-10 text-center text-[12px]" style={{ color: C.textMute }}>
                No signals yet. Generate a briefing.
              </div>
            ) : synth.map((s, i) => (
              <div key={i} className="px-5 py-3.5 hover:bg-white/[0.015]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{
                      background: s.type === "pattern" ? "#1F2A14" : s.type === "metric" ? "#2A1F14" : "#14242A",
                      color: s.type === "pattern" ? C.signal : s.type === "metric" ? C.amber : C.sky,
                    }}>
                    {s.type}
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: C.textMute }}>{s.t}</span>
                </div>
                <div className="text-[13px] font-medium mb-0.5" style={{ color: C.text }}>{s.title}</div>
                <div className="text-[12px] leading-relaxed" style={{ color: C.textDim }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="col-span-2 rounded-xl border p-5" style={{ borderColor: C.border, background: C.bgElev }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <WorkflowIcon size={14} style={{ color: C.textDim }} />
                <h2 className="font-display text-xl">Active workflows</h2>
              </div>
              <p className="text-[12px] mt-0.5" style={{ color: C.textMute }}>Pipelines you've configured.</p>
            </div>
            <button onClick={() => onNavigate("workflows")} className="text-[11px] flex items-center gap-1 px-2 py-1 rounded-md hover-lift" style={{ color: C.textDim }}>
              <Plus size={11} /> New workflow
            </button>
          </div>
          {workflows.length === 0 ? (
            <div className="px-2 py-10 text-center text-[12px]" style={{ color: C.textMute }}>
              No workflows yet.{" "}
              <button onClick={() => onNavigate("workflows")} className="underline" style={{ color: C.signal }}>Create one</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {workflows.slice(0, 4).map(w => (
                <button key={w.id} onClick={() => onNavigate("workflows")} className="p-4 rounded-lg border hover-lift text-left" style={{ borderColor: C.border, background: C.surface }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <StatusDot color={w.is_deployed ? C.signal : C.amber} />
                      <span className="text-[13px] font-medium truncate" style={{ color: C.text }}>{w.name}</span>
                    </div>
                    {w.is_deployed
                      ? <Pause size={11} style={{ color: C.textMute }} />
                      : <Play size={11} style={{ color: C.textMute }} />}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-wider mb-0.5" style={{ color: C.textMute }}>Status</div>
                      <div className="font-mono text-[12px]" style={{ color: w.is_deployed ? C.signal : C.amber }}>{w.is_deployed ? "deployed" : "draft"}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-wider mb-0.5" style={{ color: C.textMute }}>Updated</div>
                      <div className="font-mono text-[12px]">{formatDistanceToNow(new Date(w.updated_at), { addSuffix: false })}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border p-5" style={{ borderColor: C.border, background: C.bgElev }}>
          <div className="flex items-center gap-2 mb-4">
            <Gauge size={14} style={{ color: C.textDim }} />
            <h2 className="font-display text-xl">Workspace pulse</h2>
          </div>
          <div className="space-y-3">
            {[
              { name: "Conversations", count: totals.conversations, c: C.signal, icon: MessageSquare, view: "discover" as NavKey },
              { name: "Leads", count: totals.leads, c: C.amber, icon: Users, view: "data" as NavKey },
              { name: "Workflows", count: totals.workflows, c: C.sky, icon: GitBranch, view: "workflows" as NavKey },
              { name: "Emails sent", count: totals.emails, c: C.mint, icon: Mail, view: "data" as NavKey },
            ].map((s, i) => {
              const total = totals.conversations + totals.leads + totals.workflows + totals.emails || 1;
              const pct = Math.round((s.count / total) * 100);
              return (
                <button key={i} onClick={() => onNavigate(s.view)} className="w-full text-left">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.c }} />
                      <span className="text-[12px]">{s.name}</span>
                    </div>
                    <span className="font-mono text-[11px]" style={{ color: C.textDim }}>{s.count} · {pct}%</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: C.border }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.max(2, pct)}%`, background: s.c, opacity: 0.7 }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ DISCOVERY ============
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
  const [leads, setLeads] = useState<Array<{ id: string; name: string; company: string; created_at: string }>>([]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("leads")
        .select("id, name, company, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (!cancelled) setLeads(data ?? []);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const inbox = useMemo(() => {
    const items: { kind: "lead" | "thread"; id: string; title: string; subtitle: string; date: Date }[] = [];
    leads.forEach(l => items.push({ kind: "lead", id: l.id, title: l.name || "Lead", subtitle: l.company || "", date: new Date(l.created_at) }));
    conversations.forEach(c => items.push({
      kind: "thread", id: c.id, title: c.title || "Untitled",
      subtitle: `${c.messages.length} messages`, date: c.createdAt,
    }));
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [leads, conversations]);

  return (
    <div className="h-[calc(100vh-56px)] flex">
      <div className="w-80 border-r flex flex-col" style={{ borderColor: C.border, background: C.bgElev }}>
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: C.textMute }}>
              Signal inbox
            </div>
            <div className="font-display text-xl mt-0.5">Recent signals</div>
          </div>
          <button
            onClick={onNewChat}
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: C.signal, color: "#0A0A0B" }}
            title="New signal"
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {inbox.length === 0 ? (
            <div className="px-3 py-10 text-center text-[12px]" style={{ color: C.textMute }}>
              No signals yet. Start a chat or import leads.
            </div>
          ) : inbox.map(item => {
            const active = item.kind === "thread" && item.id === activeConversationId;
            const Icon = item.kind === "thread" ? MessageSquare : Inbox;
            return (
              <button
                key={`${item.kind}-${item.id}`}
                onClick={() => item.kind === "thread" ? onSelectConversation(item.id) : undefined}
                className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-md text-left hover-lift"
                style={{ background: active ? C.surface : "transparent" }}
              >
                <Icon size={14} className="mt-0.5 shrink-0" style={{ color: active ? C.signal : C.textMute }} />
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-medium truncate" style={{ color: C.text }}>{item.title}</div>
                  <div className="text-[11px] truncate" style={{ color: C.textDim }}>{item.subtitle}</div>
                  <div className="font-mono text-[10px] mt-0.5" style={{ color: C.textMute }}>
                    {formatDistanceToNow(item.date, { addSuffix: true })}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex-1 min-w-0 flex flex-col" style={{ background: C.bg }}>
        {chatNode}
      </div>
    </div>
  );
}

// ============ ROADMAP ============
function RoadmapView({
  briefing, onAction, onRefresh, briefingLoading,
}: {
  briefing: Briefing | null;
  onAction: (a: PriorityAction) => void;
  onRefresh: () => void;
  briefingLoading: boolean;
}) {
  const opps = briefing?.priority_actions ?? [];
  const buckets = {
    now: opps.filter(o => o.urgency === "critical"),
    next: opps.filter(o => o.urgency === "high"),
    later: opps.filter(o => o.urgency === "medium"),
  };
  return (
    <div className="p-8 max-w-[1480px]">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] mb-2" style={{ color: C.textMute }}>
            Now · Next · Later
          </div>
          <h1 className="font-display text-5xl leading-[1.05]">Roadmap.</h1>
          <p className="mt-3 text-[14px] max-w-xl" style={{ color: C.textDim }}>
            AI-prioritized actions from your latest briefing.
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={briefingLoading}
          className="flex items-center gap-2 px-3 h-9 rounded-md border text-[12px] font-medium hover-lift disabled:opacity-60"
          style={{ borderColor: C.border }}
        >
          {briefingLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
          Re-prioritize
        </button>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {([
          { key: "now",   label: "Now",   color: C.coral, items: buckets.now },
          { key: "next",  label: "Next",  color: C.amber, items: buckets.next },
          { key: "later", label: "Later", color: C.sky,   items: buckets.later },
        ] as const).map(col => (
          <div key={col.key} className="rounded-xl border" style={{ borderColor: C.border, background: C.bgElev }}>
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: col.color }} />
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: C.textMute }}>
                  {col.label}
                </span>
              </div>
              <span className="font-mono text-[10px]" style={{ color: C.textMute }}>{col.items.length}</span>
            </div>
            <div className="p-3 space-y-2 min-h-[200px]">
              {col.items.length === 0 ? (
                <div className="px-2 py-8 text-center text-[11px]" style={{ color: C.textMute }}>Nothing here yet.</div>
              ) : col.items.map((o, i) => (
                <button
                  key={i}
                  onClick={() => onAction(o)}
                  className="w-full p-3 rounded-lg border hover-lift text-left"
                  style={{ borderColor: C.border, background: C.surface }}
                >
                  <div className="text-[13px] font-medium mb-1" style={{ color: C.text }}>{o.title}</div>
                  <div className="text-[11px] line-clamp-2" style={{ color: C.textDim }}>{o.description}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ EMBED FRAME ============
function EmbedFrame({ title, eyebrow, children }: { title: string; eyebrow?: string; children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-56px)]">
      <div className="px-8 pt-7 pb-2">
        {eyebrow && (
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] mb-2" style={{ color: C.textMute }}>
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-4xl leading-[1.05]" style={{ color: C.text }}>{title}</h1>
      </div>
      <div className="bg-background text-foreground min-h-[calc(100vh-56px-90px)]">
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
  conversations: { id: string; title: string; createdAt: Date; messages: { role: string }[] }[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const map: Record<string, NavKey> = {
        "1": "home", "2": "discover", "3": "command", "4": "roadmap",
        "5": "workflows", "6": "specs", "7": "slides",
      };
      const target = map[e.key];
      if (target) { e.preventDefault(); setView(target); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const userName = profile?.displayName || "there";
  const userRole = profile?.role || (profile?.company ? `Founder · ${profile.company}` : "Product");
  const totals = {
    leads: ws?.totalLeads ?? 0,
    conversations: ws?.totalConversations ?? 0,
    workflows: ws?.totalWorkflows ?? 0,
    emails: ws?.emailsSent ?? 0,
  };

  const effectivePhase = props.currentPhase ?? phaseData?.currentPhase ?? "discover";

  const handleAction = (a: PriorityAction) => {
    const map: Record<string, NavKey> = {
      chat: "discover",
      workspace: "data",
      workflow: "workflows",
      spreadsheet: "data",
      slides: "slides",
      "command-center": "command",
    };
    const target = map[a.action_type];
    if (a.action_type === "chat") {
      props.onNewChat();
      setView("discover");
    } else if (target) {
      setView(target);
    }
  };

  const renderBody = () => {
    switch (view) {
      case "home":
        return (
          <HomeView
            userName={userName.split(/\s+/)[0]}
            totals={totals}
            briefing={briefing}
            briefingLoading={briefingLoading}
            onRefreshBriefing={generateBriefing}
            onNavigate={setView}
            onAction={handleAction}
            workflows={liveWorkflows}
          />
        );
      case "command":
        return <EmbedFrame title="Command Center." eyebrow="Single source of truth">{props.renderCommandCenter()}</EmbedFrame>;
      case "discover":
        return (
          <DiscoveryView
            conversations={props.conversations}
            activeConversationId={props.activeConversationId}
            onSelectConversation={props.onSelectConversation}
            onNewChat={props.onNewChat}
            chatNode={props.renderChat()}
          />
        );
      case "roadmap":
        return <RoadmapView briefing={briefing} onAction={handleAction} onRefresh={generateBriefing} briefingLoading={briefingLoading} />;
      case "workflows":
        return <EmbedFrame title="Workflows." eyebrow="Pipelines that run on their own">{props.renderWorkflow()}</EmbedFrame>;
      case "slides":
        return <EmbedFrame title="Slides." eyebrow="Strategy decks · launch presentations">{props.renderSlides()}</EmbedFrame>;
      case "data":
        return <EmbedFrame title="Spreadsheet." eyebrow="Leads · outreach · research">{props.renderSpreadsheet()}</EmbedFrame>;
      case "team":
        return <EmbedFrame title="Team." eyebrow="Members · activity">{props.renderTeam()}</EmbedFrame>;
      case "settings":
        return <EmbedFrame title="Settings." eyebrow="Profile · workspace · integrations">{props.renderSettings()}</EmbedFrame>;
      case "specs":
        return (
          <div className="p-8 max-w-3xl">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] mb-2" style={{ color: C.textMute }}>Coming soon</div>
            <h1 className="font-display text-5xl leading-[1.05] mb-3" style={{ color: C.text }}>Specs.</h1>
            <p className="text-[14px] max-w-xl mb-6" style={{ color: C.textDim }}>
              Generate PRDs and specs in your{" "}
              <button onClick={() => { props.onNewChat(); setView("discover"); }} className="underline" style={{ color: C.signal }}>Discovery chat</button>{" "}
              — they will appear here once persisted.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="lantid-shell min-h-screen grid-bg w-full" style={{ background: C.bg, color: C.text }}>
      <FontStyles />
      <Sidebar
        view={view}
        setView={setView}
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
