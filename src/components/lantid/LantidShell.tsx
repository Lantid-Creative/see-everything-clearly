import React, { useState, useEffect, useRef } from "react";
import {
  Home, Compass, Target, Map, Workflow, FileText, Presentation,
  Table2, Users, Settings, Search, Bell, ChevronRight, ChevronDown,
  Sparkles, Radio, Zap, TrendingUp, TrendingDown, ArrowUpRight,
  Plus, Filter, MoreHorizontal, Play, Pause, CheckCircle2, Circle,
  AlertCircle, Upload, MessageSquare, Command, Inbox, Clock,
  Activity, BarChart3, Download, Send, Paperclip, Mic, Hash,
  Layers, Flame, Gauge, Cpu, Database, Globe, Star, GitBranch,
  ArrowRight, Dot, Eye, Edit3, Share2, Archive
} from "lucide-react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, RadialBarChart,
  RadialBar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie
} from "recharts";

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
  signal: "#D1FF3F",     // electric lime, "surfaced signal"
  signalDim: "#8FB52E",
  amber: "#FFB340",
  coral: "#FF6B6B",
  mint: "#7BE084",
  sky: "#74C7FF",
};

// ============ FONT INJECTION ============
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Host+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
    .font-display { font-family: 'Instrument Serif', serif; letter-spacing: -0.01em; }
    .font-body { font-family: 'Host Grotesk', -apple-system, sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; font-feature-settings: 'ss01','cv01'; }
    .grid-bg {
      background-image:
        linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
      background-size: 44px 44px;
    }
    .scan-line::after {
      content: ''; position: absolute; inset: 0; pointer-events: none;
      background: linear-gradient(180deg, transparent 0%, rgba(209,255,63,0.03) 50%, transparent 100%);
      animation: scan 8s linear infinite;
    }
    @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
    @keyframes pulse-ring {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.08); }
    }
    .pulse-dot { animation: pulse-ring 2s ease-in-out infinite; }
    .hover-lift { transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease; }
    .hover-lift:hover { border-color: #2A2A30; background: #18181C; }
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: #0A0A0B; }
    ::-webkit-scrollbar-thumb { background: #1F1F23; border-radius: 10px; border: 2px solid #0A0A0B; }
    ::-webkit-scrollbar-thumb:hover { background: #2A2A30; }
    input::placeholder, textarea::placeholder { color: #6B6B74; }
  `}</style>
);

// ============ NAV ============
const NAV = [
  { key: "home",     label: "Home",           icon: Home,         shortcut: "⌘1" },
  { key: "discover", label: "Discovery",      icon: Compass,      shortcut: "⌘2" },
  { key: "command",  label: "Command Center", icon: Target,       shortcut: "⌘3" },
  { key: "roadmap",  label: "Roadmap",        icon: Map,          shortcut: "⌘4" },
  { key: "workflows",label: "Workflows",      icon: Workflow,     shortcut: "⌘5" },
  { key: "specs",    label: "Specs",          icon: FileText,     shortcut: "⌘6" },
  { key: "slides",   label: "Slides",         icon: Presentation, shortcut: "⌘7" },
  { key: "data",     label: "Spreadsheet",    icon: Table2 },
  { key: "team",     label: "Team",           icon: Users },
];

const PHASES = [
  { key: "discover", label: "Discover", num: "01" },
  { key: "define",   label: "Define",   num: "02" },
  { key: "design",   label: "Design",   num: "03" },
  { key: "build",    label: "Build",    num: "04" },
  { key: "launch",   label: "Launch",   num: "05" },
  { key: "measure",  label: "Measure",  num: "06" },
];

// ============ SIDEBAR ============
function Sidebar({ view, setView }) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[248px] border-r flex flex-col z-20"
      style={{ borderColor: C.border, background: C.bgElev }}>
      {/* Logo */}
      <div className="px-5 pt-5 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md flex items-center justify-center relative"
            style={{ background: C.signal }}>
            <div className="absolute inset-0 rounded-md pulse-dot" style={{ background: C.signal, opacity: 0.3 }} />
            <span className="font-display text-black text-lg leading-none relative">L</span>
          </div>
          <div>
            <div className="font-body font-semibold text-[15px] tracking-tight">Lantid</div>
            <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: C.textMute }}>
              Pro · v2.4
            </div>
          </div>
        </div>
      </div>

      {/* Workspace switcher */}
      <div className="px-3 mb-4">
        <button className="w-full flex items-center justify-between px-3 py-2 rounded-md border hover-lift"
          style={{ borderColor: C.border, background: C.surface }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-5 h-5 rounded flex items-center justify-center shrink-0"
              style={{ background: "#1F2A14", color: C.signal }}>
              <span className="font-mono text-[10px] font-semibold">NO</span>
            </div>
            <div className="min-w-0 text-left">
              <div className="text-xs font-medium truncate">NaijaOriginal</div>
              <div className="font-mono text-[9px] truncate" style={{ color: C.textMute }}>
                Pro · 3 members
              </div>
            </div>
          </div>
          <ChevronDown size={13} style={{ color: C.textMute }} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] px-2 mb-2"
          style={{ color: C.textMute }}>Workspace</div>
        <div className="space-y-0.5">
          {NAV.slice(0, 7).map(item => {
            const Icon = item.icon;
            const active = view === item.key;
            return (
              <button key={item.key} onClick={() => setView(item.key)}
                className="w-full group flex items-center justify-between px-2.5 py-[7px] rounded-md transition-all"
                style={{
                  background: active ? C.surface : "transparent",
                  color: active ? C.text : C.textDim,
                }}>
                <div className="flex items-center gap-2.5">
                  {active && <div className="absolute left-0 w-[2px] h-4 rounded-r" style={{ background: C.signal }} />}
                  <Icon size={15} strokeWidth={active ? 2 : 1.6} />
                  <span className="text-[13px] font-medium">{item.label}</span>
                </div>
                <span className="font-mono text-[10px] opacity-0 group-hover:opacity-100 transition"
                  style={{ color: C.textMute }}>{item.shortcut}</span>
              </button>
            );
          })}
        </div>

        <div className="font-mono text-[10px] uppercase tracking-[0.14em] px-2 mt-6 mb-2"
          style={{ color: C.textMute }}>Data</div>
        <div className="space-y-0.5">
          {NAV.slice(7).map(item => {
            const Icon = item.icon;
            const active = view === item.key;
            return (
              <button key={item.key} onClick={() => setView(item.key)}
                className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-md"
                style={{
                  background: active ? C.surface : "transparent",
                  color: active ? C.text : C.textDim,
                }}>
                <Icon size={15} strokeWidth={active ? 2 : 1.6} />
                <span className="text-[13px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Token meter */}
        <div className="mt-6 mx-1 p-3 rounded-lg border"
          style={{ borderColor: C.border, background: C.surface }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: C.textMute }}>
              Tokens
            </span>
            <span className="font-mono text-[10px]" style={{ color: C.signal }}>PRO</span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="font-mono text-lg font-semibold">17,842</span>
            <span className="font-mono text-[10px]" style={{ color: C.textMute }}>/ 25,000</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden mb-2.5" style={{ background: C.border }}>
            <div className="h-full" style={{ width: "71%", background: C.signal }} />
          </div>
          <button className="w-full text-[11px] py-1.5 rounded-md font-medium transition"
            style={{ background: C.surfaceHi, color: C.textDim }}>
            Buy tokens
          </button>
        </div>
      </nav>

      {/* User */}
      <div className="p-3 border-t" style={{ borderColor: C.border }}>
        <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md hover-lift">
          <div className="w-7 h-7 rounded-full flex items-center justify-center font-display text-sm"
            style={{ background: "linear-gradient(135deg, #D1FF3F, #8FB52E)", color: "#0A0A0B" }}>
            D
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[13px] font-medium truncate">Damilola Y.</div>
            <div className="font-mono text-[10px] truncate" style={{ color: C.textMute }}>
              Founder · Lantid
            </div>
          </div>
          <Settings size={13} style={{ color: C.textMute }} />
        </button>
      </div>
    </aside>
  );
}

// ============ TOPBAR ============
function Topbar({ currentPhase, setCurrentPhase }) {
  return (
    <div className="sticky top-0 z-10 border-b backdrop-blur-xl"
      style={{ borderColor: C.border, background: "rgba(10,10,11,0.85)" }}>
      <div className="h-14 px-6 flex items-center gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border"
            style={{ borderColor: C.border, background: C.surface }}>
            <Search size={13} style={{ color: C.textMute }} />
            <input placeholder="Search signals, specs, features, people"
              className="flex-1 bg-transparent text-[13px] outline-none" />
            <div className="flex items-center gap-1 font-mono text-[10px]" style={{ color: C.textMute }}>
              <kbd className="px-1.5 py-[1px] rounded border" style={{ borderColor: C.border }}>⌘</kbd>
              <kbd className="px-1.5 py-[1px] rounded border" style={{ borderColor: C.border }}>K</kbd>
            </div>
          </div>
        </div>

        {/* Phase pipeline */}
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-md border"
          style={{ borderColor: C.border, background: C.surface }}>
          <span className="font-mono text-[10px] uppercase tracking-widest mr-2"
            style={{ color: C.textMute }}>Phase</span>
          {PHASES.map((p, i) => {
            const active = p.key === currentPhase;
            const done = PHASES.findIndex(x => x.key === currentPhase) > i;
            return (
              <React.Fragment key={p.key}>
                <button onClick={() => setCurrentPhase(p.key)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded transition group"
                  style={{
                    background: active ? "#1F2A14" : "transparent",
                    color: active ? C.signal : done ? C.textDim : C.textMute,
                  }}>
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

        <button className="relative w-8 h-8 flex items-center justify-center rounded-md border hover-lift"
          style={{ borderColor: C.border }}>
          <Bell size={14} style={{ color: C.textDim }} />
          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: C.signal }} />
        </button>

        <button className="flex items-center gap-2 px-3 h-8 rounded-md font-medium text-[12px] transition"
          style={{ background: C.signal, color: "#0A0A0B" }}>
          <Plus size={13} strokeWidth={2.5} />
          New signal
        </button>
      </div>
    </div>
  );
}

// ============ HOME / OVERVIEW ============
const signalSparkData = [
  { d: "M", v: 12 }, { d: "T", v: 18 }, { d: "W", v: 15 }, { d: "T", v: 23 },
  { d: "F", v: 31 }, { d: "S", v: 27 }, { d: "S", v: 34 }
];

const topOpportunities = [
  { id: "OPP-014", title: "Collaborative workspaces for research", reach: 8400, impact: 3, confidence: 85, effort: 5, rice: 428, trend: "up", sources: 34, cat: "Collab" },
  { id: "OPP-012", title: "Faster spec approval cycles", reach: 6200, impact: 3, confidence: 78, effort: 3, rice: 483, trend: "up", sources: 28, cat: "Workflow" },
  { id: "OPP-009", title: "Better Jira two-way sync", reach: 5100, impact: 2, confidence: 72, effort: 4, rice: 183, trend: "flat", sources: 22, cat: "Integrate" },
  { id: "OPP-008", title: "Mobile editing for specs", reach: 4300, impact: 2, confidence: 65, effort: 6, rice: 93, trend: "up", sources: 19, cat: "Mobile" },
  { id: "OPP-007", title: "Simplify permissions model", reach: 3800, impact: 3, confidence: 88, effort: 2, rice: 501, trend: "up", sources: 15, cat: "Platform" },
];

const synthesisFeed = [
  { t: "2m ago", title: "New pattern detected in support tickets", body: "14 users flagged confusion in the permissions dialog. Mapped to OPP-007.", type: "pattern" },
  { t: "18m ago", title: "NPS shifted from 41 to 47", body: "Driven by enterprise cohort, tied to workflow release W-12.", type: "metric" },
  { t: "1h ago", title: "Interview synthesized: Tala (VP Product, Kinta)", body: "Pain: re-running the same customer research across teams. High intent signal.", type: "interview" },
  { t: "3h ago", title: "Roadmap auto-updated", body: "OPP-012 promoted above OPP-009 based on new RICE inputs.", type: "system" },
];

const workflows = [
  { name: "NPS drop alert", status: "running", runs: 428, success: 99.2, next: "in 14m" },
  { name: "Interview to opportunity", status: "running", runs: 118, success: 97.4, next: "on upload" },
  { name: "Weekly synthesis digest", status: "paused", runs: 12, success: 100, next: "Mon 9:00" },
  { name: "Churn risk scanner", status: "running", runs: 61, success: 94.1, next: "in 2h" },
];

function StatusDot({ color }) {
  return (
    <span className="relative inline-flex">
      <span className="absolute inset-0 rounded-full pulse-dot" style={{ background: color, opacity: 0.4 }} />
      <span className="relative w-1.5 h-1.5 rounded-full" style={{ background: color }} />
    </span>
  );
}

function HomeView({ currentPhase }) {
  return (
    <div className="p-8 max-w-[1480px]">
      {/* Greeting */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] mb-2" style={{ color: C.textMute }}>
            <span className="inline-flex items-center gap-1.5">
              <StatusDot color={C.signal} />
              Signal detection · live
            </span>
          </div>
          <h1 className="font-display text-5xl leading-[1.05]">
            Good morning, Damilola. <em className="italic" style={{ color: C.signal }}>Four new signals</em> worth your attention.
          </h1>
          <p className="mt-3 text-[14px] max-w-xl" style={{ color: C.textDim }}>
            Lantid synthesized 118 new sources overnight across interviews, support, NPS, and Slack. Here is what surfaced.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 h-9 rounded-md border text-[12px] font-medium hover-lift"
            style={{ borderColor: C.border }}>
            <Upload size={13} /> Upload sources
          </button>
          <button className="flex items-center gap-2 px-3 h-9 rounded-md border text-[12px] font-medium hover-lift"
            style={{ borderColor: C.border }}>
            <Download size={13} /> Export report
          </button>
        </div>
      </div>

      {/* Hero metrics strip */}
      <div className="grid grid-cols-4 gap-px rounded-xl overflow-hidden border mb-8"
        style={{ borderColor: C.border, background: C.border }}>
        {[
          { label: "Signals detected", value: "342", delta: "+28 this week", trend: "up", spark: true,
            note: "across 118 sources" },
          { label: "Opportunities surfaced", value: "47", delta: "+6 this week", trend: "up",
            note: "12 high priority" },
          { label: "Specs generated", value: "23", delta: "3 agent-ready", trend: "flat",
            note: "avg 4.2m per spec" },
          { label: "Token efficiency", value: "0.42", delta: "-0.08 vs last wk", trend: "down", good: true,
            note: "tokens per signal" },
        ].map((m, i) => (
          <div key={i} className="p-5 relative overflow-hidden" style={{ background: C.bgElev }}>
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] mb-3" style={{ color: C.textMute }}>
              {m.label}
            </div>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="font-display text-4xl leading-none">{m.value}</span>
              <span className="flex items-center gap-1 text-[11px] font-mono"
                style={{ color: m.trend === "up" ? C.mint : m.trend === "down" && m.good ? C.mint : m.trend === "down" ? C.coral : C.textDim }}>
                {m.trend === "up" && <TrendingUp size={11} />}
                {m.trend === "down" && <TrendingDown size={11} />}
                {m.delta}
              </span>
            </div>
            <div className="text-[11px]" style={{ color: C.textMute }}>{m.note}</div>
            {m.spark && (
              <div className="absolute bottom-0 right-0 w-32 h-16 opacity-60">
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
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Opportunities */}
        <div className="col-span-2 rounded-xl border overflow-hidden"
          style={{ borderColor: C.border, background: C.bgElev }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl">Top opportunities, ranked.</h2>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                  style={{ background: C.surfaceHi, color: C.textMute }}>RICE v3</span>
              </div>
              <p className="text-[12px] mt-0.5" style={{ color: C.textMute }}>
                What to build next, scored on reach, impact, confidence, and effort.
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-md hover-lift border" style={{ borderColor: C.border }}>
                <Filter size={12} style={{ color: C.textDim }} />
              </button>
              <button className="text-[11px] font-medium flex items-center gap-1 px-2 py-1.5 rounded-md hover-lift"
                style={{ color: C.textDim }}>
                View roadmap <ArrowRight size={11} />
              </button>
            </div>
          </div>

          <div className="divide-y" style={{ borderColor: C.border }}>
            <div className="grid grid-cols-12 gap-3 px-5 py-2.5 font-mono text-[10px] uppercase tracking-wider"
              style={{ color: C.textMute, borderColor: C.border }}>
              <div className="col-span-1">ID</div>
              <div className="col-span-5">Opportunity</div>
              <div className="col-span-1 text-right">Reach</div>
              <div className="col-span-1 text-right">Impact</div>
              <div className="col-span-1 text-right">Conf.</div>
              <div className="col-span-1 text-right">Effort</div>
              <div className="col-span-2 text-right">RICE score</div>
            </div>
            {topOpportunities.map((o, i) => (
              <div key={o.id} className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-white/[0.015] transition"
                style={{ borderColor: C.border }}>
                <div className="col-span-1 font-mono text-[11px]" style={{ color: C.textMute }}>{o.id}</div>
                <div className="col-span-5">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium">{o.title}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: C.surface, color: C.textDim }}>{o.cat}</span>
                    <span className="font-mono text-[10px]" style={{ color: C.textMute }}>
                      {o.sources} sources
                    </span>
                  </div>
                </div>
                <div className="col-span-1 text-right font-mono text-[12px]">{o.reach.toLocaleString()}</div>
                <div className="col-span-1 text-right font-mono text-[12px]">{o.impact}x</div>
                <div className="col-span-1 text-right font-mono text-[12px]">{o.confidence}%</div>
                <div className="col-span-1 text-right font-mono text-[12px]">{o.effort}</div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: C.border }}>
                    <div className="h-full" style={{
                      width: `${Math.min(100, o.rice / 5)}%`,
                      background: o.rice > 400 ? C.signal : o.rice > 200 ? C.amber : C.textMute
                    }} />
                  </div>
                  <span className="font-mono text-[13px] font-semibold w-10 text-right"
                    style={{ color: o.rice > 400 ? C.signal : C.text }}>{o.rice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Synthesis feed */}
        <div className="rounded-xl border overflow-hidden"
          style={{ borderColor: C.border, background: C.bgElev }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-2">
              <Radio size={14} style={{ color: C.signal }} />
              <h2 className="font-display text-xl">Synthesis feed</h2>
            </div>
            <p className="text-[12px] mt-0.5" style={{ color: C.textMute }}>
              Real-time patterns from your sources.
            </p>
          </div>
          <div className="divide-y" style={{ borderColor: C.border }}>
            {synthesisFeed.map((s, i) => (
              <div key={i} className="px-5 py-3.5 hover:bg-white/[0.015] cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{
                      background: s.type === "pattern" ? "#1F2A14" :
                                  s.type === "metric" ? "#2A1F14" :
                                  s.type === "interview" ? "#14242A" : C.surface,
                      color: s.type === "pattern" ? C.signal :
                             s.type === "metric" ? C.amber :
                             s.type === "interview" ? C.sky : C.textDim
                    }}>
                    {s.type}
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: C.textMute }}>{s.t}</span>
                </div>
                <div className="text-[13px] font-medium mb-0.5">{s.title}</div>
                <div className="text-[12px] leading-relaxed" style={{ color: C.textDim }}>{s.body}</div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t" style={{ borderColor: C.border }}>
            <button className="w-full text-[12px] font-medium py-1.5 rounded-md hover-lift"
              style={{ color: C.textDim }}>
              View all activity
            </button>
          </div>
        </div>
      </div>

      {/* Workflows + Phase + Sources */}
      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="col-span-2 rounded-xl border p-5"
          style={{ borderColor: C.border, background: C.bgElev }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Workflow size={14} style={{ color: C.textDim }} />
                <h2 className="font-display text-xl">Active workflows</h2>
              </div>
              <p className="text-[12px] mt-0.5" style={{ color: C.textMute }}>
                Pipelines running in the background.
              </p>
            </div>
            <button className="text-[11px] flex items-center gap-1 px-2 py-1 rounded-md hover-lift"
              style={{ color: C.textDim }}>
              <Plus size={11} /> New workflow
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {workflows.map((w, i) => (
              <div key={i} className="p-4 rounded-lg border hover-lift"
                style={{ borderColor: C.border, background: C.surface }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <StatusDot color={w.status === "running" ? C.signal : C.amber} />
                    <span className="text-[13px] font-medium">{w.name}</span>
                  </div>
                  <button className="p-1 rounded hover-lift">
                    {w.status === "running"
                      ? <Pause size={11} style={{ color: C.textMute }} />
                      : <Play size={11} style={{ color: C.textMute }} />}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-wider mb-0.5" style={{ color: C.textMute }}>Runs</div>
                    <div className="font-mono text-[13px]">{w.runs}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-wider mb-0.5" style={{ color: C.textMute }}>Success</div>
                    <div className="font-mono text-[13px]" style={{ color: C.signal }}>{w.success}%</div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-wider mb-0.5" style={{ color: C.textMute }}>Next</div>
                    <div className="font-mono text-[13px]">{w.next}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border p-5"
          style={{ borderColor: C.border, background: C.bgElev }}>
          <div className="flex items-center gap-2 mb-4">
            <Gauge size={14} style={{ color: C.textDim }} />
            <h2 className="font-display text-xl">Signal sources</h2>
          </div>
          <div className="space-y-3">
            {[
              { name: "Customer interviews", count: 42, pct: 35, c: C.signal },
              { name: "Support tickets", count: 318, pct: 28, c: C.amber },
              { name: "NPS survey", count: 847, pct: 18, c: C.sky },
              { name: "Slack communities", count: 126, pct: 12, c: C.mint },
              { name: "App store reviews", count: 84, pct: 7, c: C.coral },
            ].map((s, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.c }} />
                    <span className="text-[12px]">{s.name}</span>
                  </div>
                  <span className="font-mono text-[11px]" style={{ color: C.textDim }}>
                    {s.count} · {s.pct}%
                  </span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: C.border }}>
                  <div className="h-full rounded-full" style={{ width: `${s.pct * 2.5}%`, background: s.c, opacity: 0.7 }} />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-[12px] font-medium py-2 rounded-md border hover-lift"
            style={{ borderColor: C.border, color: C.textDim }}>
            <Plus size={11} className="inline mr-1" /> Connect source
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ DISCOVERY ============
function DiscoveryView() {
  const [messages, setMessages] = useState([
    { role: "user", text: "Based on our last 50 customer interviews, what should we build next?" },
    { role: "ai",
      title: "Top priority: Collaborative workspaces",
      body: "Mentioned by 34 of 50 customers (68%). Strong retention signal in enterprise cohort.",
      signals: [
        { q: "I need to share findings with my team", n: 23 },
        { q: "We waste time re-doing the same research", n: 18 },
        { q: "No single source of truth for product decisions", n: 15 },
      ],
      score: 9.2,
    },
  ]);
  const [input, setInput] = useState("");

  return (
    <div className="h-[calc(100vh-56px)] flex">
      {/* Left: Sources */}
      <div className="w-72 border-r p-5 overflow-y-auto" style={{ borderColor: C.border, background: C.bgElev }}>
        <div className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: C.textMute }}>
          Context · 118 sources
        </div>
        <div className="space-y-2 mb-5">
          {[
            { icon: MessageSquare, name: "Interviews", count: 42, on: true },
            { icon: Inbox, name: "Support tickets", count: 318, on: true },
            { icon: Activity, name: "NPS survey", count: 847, on: true },
            { icon: Hash, name: "Slack #feedback", count: 126, on: true },
            { icon: Star, name: "App store reviews", count: 84, on: false },
            { icon: FileText, name: "Product analytics", count: 12, on: false },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border hover-lift cursor-pointer"
                style={{ borderColor: C.border, background: s.on ? C.surface : "transparent" }}>
                <div className="flex items-center gap-2.5">
                  <Icon size={13} style={{ color: s.on ? C.signal : C.textMute }} />
                  <div>
                    <div className="text-[12px] font-medium">{s.name}</div>
                    <div className="font-mono text-[10px]" style={{ color: C.textMute }}>{s.count} items</div>
                  </div>
                </div>
                <div className="w-7 h-4 rounded-full relative transition"
                  style={{ background: s.on ? C.signal : C.border }}>
                  <div className="absolute top-0.5 w-3 h-3 rounded-full bg-black transition"
                    style={{ left: s.on ? "13px" : "3px" }} />
                </div>
              </div>
            );
          })}
        </div>
        <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border text-[12px] font-medium hover-lift"
          style={{ borderColor: C.border }}>
          <Upload size={13} /> Upload new source
        </button>

        <div className="font-mono text-[10px] uppercase tracking-widest mt-6 mb-3" style={{ color: C.textMute }}>
          Recent threads
        </div>
        <div className="space-y-1">
          {["What features drive NPS?", "Churn patterns in Q1", "Enterprise vs self-serve gaps", "Pricing friction signals"].map((t, i) => (
            <button key={i} className="w-full text-left p-2 rounded-md text-[12px] hover-lift"
              style={{ color: C.textDim }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Center: Chat */}
      <div className="flex-1 flex flex-col">
        <div className="px-8 py-4 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: C.signal }}>
                <Sparkles size={11} color="#0A0A0B" />
              </div>
              <h1 className="font-display text-2xl">Discovery chat</h1>
            </div>
            <p className="text-[12px] mt-0.5" style={{ color: C.textMute }}>
              Phase-aware AI grounded in your product context.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-md border hover-lift" style={{ borderColor: C.border }}>
              <Share2 size={13} style={{ color: C.textDim }} />
            </button>
            <button className="p-2 rounded-md border hover-lift" style={{ borderColor: C.border }}>
              <Download size={13} style={{ color: C.textDim }} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {messages.map((m, i) => (
            m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-xl p-4 rounded-2xl rounded-tr-sm"
                  style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                  <p className="text-[14px]">{m.text}</p>
                </div>
              </div>
            ) : (
              <div key={i} className="flex gap-3">
                <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 relative"
                  style={{ background: C.signal }}>
                  <Sparkles size={13} color="#0A0A0B" />
                </div>
                <div className="flex-1 max-w-2xl">
                  <div className="p-5 rounded-2xl rounded-tl-sm border relative overflow-hidden"
                    style={{ borderColor: C.border, background: C.bgElev }}>
                    <div className="absolute top-0 left-0 right-0 h-[2px]"
                      style={{ background: `linear-gradient(90deg, ${C.signal}, transparent)` }} />
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded"
                        style={{ background: "#1F2A14", color: C.signal }}>Synthesis</span>
                      <span className="font-mono text-[10px]" style={{ color: C.textMute }}>
                        50 interviews · 1.4s
                      </span>
                    </div>
                    <h3 className="font-display text-2xl mb-2">{m.title}</h3>
                    <p className="text-[13px] mb-4" style={{ color: C.textDim }}>{m.body}</p>

                    <div className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: C.textMute }}>
                      Key signals
                    </div>
                    <div className="space-y-2 mb-4">
                      {m.signals.map((s, j) => (
                        <div key={j} className="flex items-center gap-3 p-2.5 rounded-md"
                          style={{ background: C.surface }}>
                          <div className="font-mono text-[11px] w-8 text-center py-1 rounded"
                            style={{ background: C.surfaceHi, color: C.signal }}>
                            {s.n}×
                          </div>
                          <p className="italic text-[13px] font-display" style={{ color: C.textDim }}>
                            "{s.q}"
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border"
                      style={{ borderColor: C.border, background: C.surface }}>
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: C.textMute }}>
                          Impact score
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-display text-3xl" style={{ color: C.signal }}>{m.score}</span>
                          <span className="font-mono text-[11px]" style={{ color: C.textMute }}>/ 10</span>
                        </div>
                      </div>
                      <button className="flex items-center gap-1.5 px-3 py-2 rounded-md text-[12px] font-medium"
                        style={{ background: C.signal, color: "#0A0A0B" }}>
                        Generate PRD <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t" style={{ borderColor: C.border }}>
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl border p-3" style={{ borderColor: C.border, background: C.surface }}>
              <textarea value={input} onChange={e => setInput(e.target.value)}
                placeholder="Ask about your users, features, or market. Or try: 'What do enterprise users complain about most?'"
                className="w-full bg-transparent outline-none text-[14px] resize-none"
                rows={2} />
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded hover-lift" style={{ color: C.textMute }}>
                    <Paperclip size={13} />
                  </button>
                  <button className="p-1.5 rounded hover-lift" style={{ color: C.textMute }}>
                    <Mic size={13} />
                  </button>
                  <div className="w-[1px] h-4 mx-1" style={{ background: C.border }} />
                  <button className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] hover-lift"
                    style={{ color: C.textDim }}>
                    <Layers size={11} /> Context: all sources
                  </button>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium"
                  style={{ background: C.signal, color: "#0A0A0B" }}>
                  Send <Send size={12} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mt-2 font-mono text-[10px]" style={{ color: C.textMute }}>
              <kbd className="px-1.5 py-0.5 rounded border" style={{ borderColor: C.border }}>⌘N</kbd>
              new chat
              <span>·</span>
              <kbd className="px-1.5 py-0.5 rounded border" style={{ borderColor: C.border }}>↵</kbd>
              send
              <span>·</span>
              costs ~240 tokens
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ COMMAND CENTER ============
function CommandView() {
  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] mb-2" style={{ color: C.textMute }}>
          The single source of truth
        </div>
        <h1 className="font-display text-5xl leading-[1.05] mb-3">Command Center.</h1>
        <p className="text-[14px] max-w-xl" style={{ color: C.textDim }}>
          Living brief for this product. Every AI conversation, spec, and decision is grounded here.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-5">
          {/* Vision */}
          <section className="rounded-xl border p-6" style={{ borderColor: C.border, background: C.bgElev }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame size={14} style={{ color: C.signal }} />
                <h3 className="font-mono text-[11px] uppercase tracking-widest">Vision</h3>
              </div>
              <button className="p-1 rounded hover-lift"><Edit3 size={12} style={{ color: C.textMute }} /></button>
            </div>
            <p className="font-display text-2xl italic leading-relaxed" style={{ color: C.text }}>
              Be the missing layer between customer signal and shipped software. <span style={{ color: C.signal }}>
              Every coding agent on earth should start its day with a Lantid spec.</span>
            </p>
          </section>

          {/* North Star */}
          <section className="rounded-xl border p-6" style={{ borderColor: C.border, background: C.bgElev }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target size={14} style={{ color: C.signal }} />
                <h3 className="font-mono text-[11px] uppercase tracking-widest">North star metric</h3>
              </div>
              <button className="p-1 rounded hover-lift"><Edit3 size={12} style={{ color: C.textMute }} /></button>
            </div>
            <div className="flex items-end justify-between mb-4">
              <div>
                <div className="text-[12px] mb-1" style={{ color: C.textDim }}>Agent-ready specs shipped per week</div>
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-5xl">8.4</span>
                  <span className="font-mono text-[12px]" style={{ color: C.mint }}>+34% WoW</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10px] uppercase tracking-widest" style={{ color: C.textMute }}>Q2 target</div>
                <div className="font-mono text-lg">12.0</div>
              </div>
            </div>
            <div className="h-32 -mx-2">
              <ResponsiveContainer>
                <AreaChart data={[
                  { w: "W1", v: 2.1 }, { w: "W2", v: 3.4 }, { w: "W3", v: 3.8 },
                  { w: "W4", v: 5.2 }, { w: "W5", v: 6.1 }, { w: "W6", v: 6.8 },
                  { w: "W7", v: 7.5 }, { w: "W8", v: 8.4 }
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

          {/* Goals */}
          <section className="rounded-xl border p-6" style={{ borderColor: C.border, background: C.bgElev }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap size={14} style={{ color: C.signal }} />
                <h3 className="font-mono text-[11px] uppercase tracking-widest">Q2 goals</h3>
              </div>
              <button className="p-1 rounded hover-lift"><Plus size={12} style={{ color: C.textMute }} /></button>
            </div>
            <div className="space-y-3">
              {[
                { text: "Ship collaborative workspaces for research teams", prog: 64 },
                { text: "Reduce spec generation time from 8m to under 3m", prog: 82 },
                { text: "Launch public API for agent integrations", prog: 28 },
                { text: "Add deep integrations with Jira and Linear", prog: 45 },
              ].map((g, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg"
                  style={{ background: C.surface }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center relative">
                    <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                      <circle cx="16" cy="16" r="13" fill="none" stroke={C.border} strokeWidth="3" />
                      <circle cx="16" cy="16" r="13" fill="none" stroke={C.signal} strokeWidth="3"
                        strokeDasharray={`${(g.prog / 100) * 81.68} 81.68`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute font-mono text-[9px]">{g.prog}</span>
                  </div>
                  <p className="flex-1 text-[13px]">{g.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right */}
        <div className="space-y-5">
          <section className="rounded-xl border p-5" style={{ borderColor: C.border, background: C.bgElev }}>
            <h3 className="font-mono text-[11px] uppercase tracking-widest mb-3" style={{ color: C.textMute }}>
              Product health
            </h3>
            <div className="relative h-36 flex items-center justify-center">
              <ResponsiveContainer>
                <RadialBarChart innerRadius="60%" outerRadius="100%" data={[{ v: 86, fill: C.signal }]} startAngle={90} endAngle={-270}>
                  <RadialBar background={{ fill: C.border }} dataKey="v" cornerRadius={20} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <div className="font-display text-3xl">86</div>
                <div className="font-mono text-[9px] uppercase tracking-widest" style={{ color: C.textMute }}>score</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t" style={{ borderColor: C.border }}>
              <div>
                <div className="font-mono text-[9px] uppercase" style={{ color: C.textMute }}>NPS</div>
                <div className="font-mono text-sm">47</div>
              </div>
              <div>
                <div className="font-mono text-[9px] uppercase" style={{ color: C.textMute }}>Retention</div>
                <div className="font-mono text-sm">94%</div>
              </div>
              <div>
                <div className="font-mono text-[9px] uppercase" style={{ color: C.textMute }}>WAU</div>
                <div className="font-mono text-sm">2,104</div>
              </div>
              <div>
                <div className="font-mono text-[9px] uppercase" style={{ color: C.textMute }}>Churn</div>
                <div className="font-mono text-sm">2.1%</div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border p-5" style={{ borderColor: C.border, background: C.bgElev }}>
            <h3 className="font-mono text-[11px] uppercase tracking-widest mb-3" style={{ color: C.textMute }}>
              Product notes
            </h3>
            <div className="space-y-3 text-[12px] leading-relaxed" style={{ color: C.textDim }}>
              <div className="flex gap-2">
                <Dot size={16} style={{ color: C.signal }} className="shrink-0 -mt-0.5" />
                <p>ICP is PM at a 20-200 person software company already using Cursor or Claude Code.</p>
              </div>
              <div className="flex gap-2">
                <Dot size={16} style={{ color: C.signal }} className="shrink-0 -mt-0.5" />
                <p>Primary wedge: specs that agents can execute without human rewrites.</p>
              </div>
              <div className="flex gap-2">
                <Dot size={16} style={{ color: C.signal }} className="shrink-0 -mt-0.5" />
                <p>Competitors (Productboard, Aha) own the legacy PM stack; we own the AI-native one.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// ============ ROADMAP ============
function RoadmapView() {
  const cols = [
    { key: "now", label: "Now", sub: "Shipping Q2", color: C.signal, items: [
      { id: "OPP-007", title: "Simplify permissions model", rice: 501, eff: 2, owner: "DY" },
      { id: "OPP-012", title: "Faster spec approval cycles", rice: 483, eff: 3, owner: "AK" },
    ]},
    { key: "next", label: "Next", sub: "Planned Q3", color: C.amber, items: [
      { id: "OPP-014", title: "Collaborative workspaces", rice: 428, eff: 5, owner: "DY" },
      { id: "OPP-021", title: "Realtime cursors in specs", rice: 312, eff: 4, owner: "MT" },
      { id: "OPP-019", title: "Public agent API v1", rice: 287, eff: 8, owner: "AK" },
    ]},
    { key: "later", label: "Later", sub: "Under review", color: C.sky, items: [
      { id: "OPP-009", title: "Jira two-way sync", rice: 183, eff: 4, owner: "MT" },
      { id: "OPP-008", title: "Mobile editing support", rice: 93, eff: 6, owner: "—" },
      { id: "OPP-025", title: "Voice-first discovery", rice: 74, eff: 9, owner: "—" },
    ]},
    { key: "explore", label: "Explore", sub: "Needs research", color: C.textDim, items: [
      { id: "OPP-030", title: "On-prem enterprise deployment", rice: null, eff: "?", owner: "—" },
      { id: "OPP-031", title: "Agent marketplace", rice: null, eff: "?", owner: "—" },
    ]},
  ];

  return (
    <div className="p-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] mb-2" style={{ color: C.textMute }}>
            <span className="inline-flex items-center gap-1.5">
              <Map size={11} /> 47 opportunities · 9 committed
            </span>
          </div>
          <h1 className="font-display text-5xl leading-[1.05]">Roadmap.</h1>
          <p className="mt-3 text-[14px] max-w-xl" style={{ color: C.textDim }}>
            RICE-scored. Auto-prioritized. Agent-addressable.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-md border" style={{ borderColor: C.border }}>
            <button className="px-2.5 py-1 text-[11px] rounded"
              style={{ background: C.surface, color: C.text }}>Board</button>
            <button className="px-2.5 py-1 text-[11px] rounded" style={{ color: C.textDim }}>List</button>
            <button className="px-2.5 py-1 text-[11px] rounded" style={{ color: C.textDim }}>Timeline</button>
          </div>
          <button className="flex items-center gap-1.5 px-3 h-8 rounded-md text-[12px] font-medium"
            style={{ background: C.signal, color: "#0A0A0B" }}>
            <Plus size={12} /> Add opportunity
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {cols.map(col => (
          <div key={col.key} className="rounded-xl border" style={{ borderColor: C.border, background: C.bgElev }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: col.color }} />
                  <h3 className="font-display text-xl">{col.label}</h3>
                  <span className="font-mono text-[10px]" style={{ color: C.textMute }}>{col.items.length}</span>
                </div>
                <div className="font-mono text-[10px] uppercase tracking-widest mt-0.5" style={{ color: C.textMute }}>
                  {col.sub}
                </div>
              </div>
              <button className="p-1 rounded hover-lift"><Plus size={12} style={{ color: C.textMute }} /></button>
            </div>
            <div className="p-3 space-y-2 min-h-[400px]">
              {col.items.map(item => (
                <div key={item.id} className="p-3 rounded-lg border hover-lift cursor-grab"
                  style={{ borderColor: C.border, background: C.surface }}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-mono text-[10px]" style={{ color: C.textMute }}>{item.id}</span>
                    {item.rice && (
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[10px]" style={{ color: C.textMute }}>RICE</span>
                        <span className="font-mono text-[11px] font-semibold"
                          style={{ color: item.rice > 400 ? C.signal : item.rice > 200 ? C.amber : C.textDim }}>
                          {item.rice}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-[13px] font-medium mb-3 leading-snug">{item.title}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                        style={{ background: C.bgElev, color: C.textDim }}>
                        E: {item.eff}
                      </span>
                    </div>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center font-mono text-[9px]"
                      style={{ background: C.bgElev, color: C.textDim }}>
                      {item.owner}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ WORKFLOWS ============
function WorkflowsView() {
  const pipelines = [
    {
      name: "Customer interview to opportunity",
      desc: "Audio upload → transcript → entity extraction → signal matching → opportunity draft",
      steps: ["Upload", "Transcribe", "Extract", "Match", "Draft"],
      runs: 118, success: 97.4, active: true, tokens: 4200,
    },
    {
      name: "NPS drop alert",
      desc: "When NPS drops more than 5 points WoW, auto-run root-cause synthesis and notify the team on Slack.",
      steps: ["Monitor", "Detect", "Synthesize", "Notify"],
      runs: 428, success: 99.2, active: true, tokens: 890,
    },
    {
      name: "Weekly synthesis digest",
      desc: "Every Monday, compile all signals from the week into an executive brief. Export as PDF.",
      steps: ["Aggregate", "Cluster", "Rank", "Compose", "Export"],
      runs: 12, success: 100, active: false, tokens: 6800,
    },
    {
      name: "Churn risk scanner",
      desc: "Scan support tickets hourly for churn-indicating language and escalate high-risk accounts.",
      steps: ["Scan", "Score", "Classify", "Alert"],
      runs: 61, success: 94.1, active: true, tokens: 1240,
    },
  ];

  return (
    <div className="p-8 max-w-[1480px]">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] mb-2" style={{ color: C.textMute }}>
            <StatusDot color={C.signal} /> <span className="ml-2">3 running · 1 paused · 619 total runs</span>
          </div>
          <h1 className="font-display text-5xl leading-[1.05]">Workflows.</h1>
          <p className="mt-3 text-[14px] max-w-xl" style={{ color: C.textDim }}>
            Multi-step AI pipelines that run on their own. Chain models, data sources, and actions.
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 h-9 rounded-md text-[12px] font-medium"
          style={{ background: C.signal, color: "#0A0A0B" }}>
          <Plus size={13} /> New workflow
        </button>
      </div>

      <div className="space-y-3">
        {pipelines.map((p, i) => (
          <div key={i} className="rounded-xl border p-5 hover-lift"
            style={{ borderColor: C.border, background: C.bgElev }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <StatusDot color={p.active ? C.signal : C.amber} />
                  <h3 className="font-display text-2xl">{p.name}</h3>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded uppercase tracking-widest"
                    style={{ background: p.active ? "#1F2A14" : "#2A2416", color: p.active ? C.signal : C.amber }}>
                    {p.active ? "running" : "paused"}
                  </span>
                </div>
                <p className="text-[13px]" style={{ color: C.textDim }}>{p.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-md border hover-lift" style={{ borderColor: C.border }}>
                  {p.active ? <Pause size={13} style={{ color: C.textDim }} /> : <Play size={13} style={{ color: C.textDim }} />}
                </button>
                <button className="p-2 rounded-md border hover-lift" style={{ borderColor: C.border }}>
                  <Edit3 size={13} style={{ color: C.textDim }} />
                </button>
                <button className="p-2 rounded-md border hover-lift" style={{ borderColor: C.border }}>
                  <MoreHorizontal size={13} style={{ color: C.textDim }} />
                </button>
              </div>
            </div>

            {/* Pipeline viz */}
            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg"
              style={{ background: C.surface }}>
              {p.steps.map((s, j) => (
                <React.Fragment key={j}>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md"
                    style={{
                      background: C.bgElev,
                      border: `1px solid ${C.border}`,
                      color: p.active ? C.text : C.textDim
                    }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.active ? C.signal : C.textMute }} />
                    <span className="font-mono text-[11px]">{s}</span>
                  </div>
                  {j < p.steps.length - 1 && <ArrowRight size={12} style={{ color: C.textMute }} />}
                </React.Fragment>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 pt-3 border-t" style={{ borderColor: C.border }}>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: C.textMute }}>Runs</div>
                <div className="font-mono text-lg">{p.runs}</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: C.textMute }}>Success rate</div>
                <div className="font-mono text-lg" style={{ color: p.success > 95 ? C.signal : C.amber }}>{p.success}%</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: C.textMute }}>Tokens / run</div>
                <div className="font-mono text-lg">{p.tokens.toLocaleString()}</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: C.textMute }}>Last 7 days</div>
                <div className="h-8">
                  <ResponsiveContainer>
                    <BarChart data={Array.from({length: 7}).map((_, k) => ({ v: 20 + Math.random() * 80 }))}>
                      <Bar dataKey="v" fill={C.signal} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ SPECS ============
function SpecsView() {
  const specs = [
    { id: "SPEC-042", title: "Permissions model v2", status: "agent-ready", phase: "Build", tokens: 2840, updated: "12m ago", opp: "OPP-007", agents: ["Cursor", "Claude Code"] },
    { id: "SPEC-041", title: "Faster spec approval flow", status: "in-review", phase: "Define", tokens: 1920, updated: "1h ago", opp: "OPP-012", agents: [] },
    { id: "SPEC-040", title: "Collaborative workspace shell", status: "draft", phase: "Define", tokens: 3400, updated: "3h ago", opp: "OPP-014", agents: [] },
    { id: "SPEC-039", title: "NPS drop workflow template", status: "shipped", phase: "Measure", tokens: 1240, updated: "Yesterday", opp: "OPP-005", agents: ["Cursor"] },
    { id: "SPEC-038", title: "Slide export to PDF", status: "shipped", phase: "Measure", tokens: 890, updated: "2d ago", opp: "OPP-003", agents: ["Cursor", "Claude Code", "v0"] },
  ];

  const colorOf = s => s === "agent-ready" ? C.signal : s === "shipped" ? C.mint : s === "in-review" ? C.amber : C.textDim;

  return (
    <div className="p-8 max-w-[1480px]">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] mb-2" style={{ color: C.textMute }}>
            PRDs · user stories · acceptance criteria
          </div>
          <h1 className="font-display text-5xl leading-[1.05]">
            Specs <em style={{ color: C.signal }}>agents</em> can ship.
          </h1>
          <p className="mt-3 text-[14px] max-w-xl" style={{ color: C.textDim }}>
            Every spec is structured for Cursor, Claude Code, and v0 to execute directly. No translation layer.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 h-9 rounded-md border text-[12px] font-medium hover-lift"
            style={{ borderColor: C.border }}>
            <Filter size={13} /> Filter
          </button>
          <button className="flex items-center gap-1.5 px-3 h-9 rounded-md text-[12px] font-medium"
            style={{ background: C.signal, color: "#0A0A0B" }}>
            <Sparkles size={13} /> Generate spec
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-px rounded-xl border mb-6 overflow-hidden"
        style={{ borderColor: C.border, background: C.border }}>
        {[
          { label: "Total specs", v: "47" },
          { label: "Agent-ready", v: "14", c: C.signal },
          { label: "Shipped this month", v: "9", c: C.mint },
          { label: "Avg generation time", v: "4.2m" },
        ].map((s, i) => (
          <div key={i} className="p-4" style={{ background: C.bgElev }}>
            <div className="font-mono text-[10px] uppercase tracking-widest mb-2" style={{ color: C.textMute }}>{s.label}</div>
            <div className="font-display text-3xl" style={{ color: s.c || C.text }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: C.border, background: C.bgElev }}>
        <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b font-mono text-[10px] uppercase tracking-wider"
          style={{ color: C.textMute, borderColor: C.border }}>
          <div className="col-span-1">ID</div>
          <div className="col-span-4">Title</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Phase</div>
          <div className="col-span-1">Source</div>
          <div className="col-span-2">Agents</div>
          <div className="col-span-1 text-right">Updated</div>
        </div>
        {specs.map((s, i) => (
          <div key={s.id} className="grid grid-cols-12 gap-3 px-5 py-4 items-center border-b hover:bg-white/[0.015] cursor-pointer"
            style={{ borderColor: C.border }}>
            <div className="col-span-1 font-mono text-[11px]" style={{ color: C.textMute }}>{s.id}</div>
            <div className="col-span-4">
              <div className="text-[13px] font-medium">{s.title}</div>
              <div className="font-mono text-[10px] mt-0.5" style={{ color: C.textMute }}>
                {s.tokens.toLocaleString()} tokens
              </div>
            </div>
            <div className="col-span-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded"
                style={{
                  background: s.status === "agent-ready" ? "#1F2A14" :
                              s.status === "shipped" ? "#14241A" :
                              s.status === "in-review" ? "#2A2416" : C.surface,
                  color: colorOf(s.status)
                }}>
                <div className="w-1 h-1 rounded-full" style={{ background: colorOf(s.status) }} />
                {s.status}
              </span>
            </div>
            <div className="col-span-1 text-[12px]" style={{ color: C.textDim }}>{s.phase}</div>
            <div className="col-span-1 font-mono text-[11px]" style={{ color: C.textDim }}>{s.opp}</div>
            <div className="col-span-2 flex items-center gap-1">
              {s.agents.length === 0 ? (
                <span className="font-mono text-[10px]" style={{ color: C.textMute }}>—</span>
              ) : s.agents.map((a, j) => (
                <span key={j} className="font-mono text-[9px] px-1.5 py-0.5 rounded border"
                  style={{ borderColor: C.border, background: C.surface, color: C.textDim }}>
                  {a}
                </span>
              ))}
            </div>
            <div className="col-span-1 text-right font-mono text-[11px]" style={{ color: C.textMute }}>{s.updated}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ SLIDES ============
function SlidesView() {
  const decks = [
    { title: "Series A narrative", slides: 18, edited: "12m ago", gradient: "from-[#D1FF3F] to-[#8FB52E]" },
    { title: "Q2 strategy review", slides: 24, edited: "Yesterday", gradient: "from-[#FFB340] to-[#FF6B6B]" },
    { title: "Collaborative workspaces launch", slides: 12, edited: "2d ago", gradient: "from-[#74C7FF] to-[#7BE084]" },
    { title: "Agent integration partners", slides: 9, edited: "1w ago", gradient: "from-[#FF6B6B] to-[#D1FF3F]" },
  ];
  return (
    <div className="p-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] mb-2" style={{ color: C.textMute }}>
            Strategy decks · launch presentations
          </div>
          <h1 className="font-display text-5xl leading-[1.05]">Slides.</h1>
          <p className="mt-3 text-[14px] max-w-xl" style={{ color: C.textDim }}>
            AI-assisted content, inline editing, one-click export.
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 h-9 rounded-md text-[12px] font-medium"
          style={{ background: C.signal, color: "#0A0A0B" }}>
          <Plus size={13} /> New deck
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {decks.map((d, i) => (
          <div key={i} className="rounded-xl border overflow-hidden hover-lift cursor-pointer"
            style={{ borderColor: C.border, background: C.bgElev }}>
            <div className={`aspect-[4/3] bg-gradient-to-br ${d.gradient} relative flex items-end p-4`}>
              <div className="absolute inset-0 grid-bg opacity-20" />
              <div className="relative font-display text-2xl text-black/80 italic">{d.title}</div>
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-medium truncate">{d.title}</span>
                <MoreHorizontal size={12} style={{ color: C.textMute }} />
              </div>
              <div className="flex items-center justify-between font-mono text-[10px]" style={{ color: C.textMute }}>
                <span>{d.slides} slides</span>
                <span>{d.edited}</span>
              </div>
            </div>
          </div>
        ))}
        <button className="rounded-xl border border-dashed aspect-auto flex flex-col items-center justify-center py-10 hover-lift"
          style={{ borderColor: C.border, color: C.textDim }}>
          <Plus size={20} className="mb-2" />
          <span className="text-[12px] font-medium">Generate from brief</span>
        </button>
      </div>
    </div>
  );
}

// ============ SPREADSHEET ============
function DataView() {
  const leads = [
    { co: "Kinta AI",         contact: "Tala Meyers",    role: "VP Product",   size: "80",   arr: "$140k", stage: "trial",   score: 92 },
    { co: "Corvus Labs",      contact: "Imani Okafor",   role: "CEO",          size: "22",   arr: "$48k",  stage: "demo",    score: 88 },
    { co: "Relay Systems",    contact: "Jonas Wilhelm",  role: "Head of Eng",  size: "140",  arr: "$220k", stage: "contract",score: 96 },
    { co: "Northwind",        contact: "Priya Shankar",  role: "Director PM",  size: "340",  arr: "$480k", stage: "intro",   score: 74 },
    { co: "Steppe Digital",   contact: "Arman Nurbek",   role: "CPO",          size: "55",   arr: "$92k",  stage: "trial",   score: 81 },
    { co: "Obsidian Health",  contact: "Mei Takahashi",  role: "VP Platform",  size: "210",  arr: "$310k", stage: "demo",    score: 85 },
  ];
  return (
    <div className="p-8 max-w-[1480px]">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] mb-2" style={{ color: C.textMute }}>
            <Table2 size={11} className="inline mr-1.5" /> 247 rows · 12 columns · filtered
          </div>
          <h1 className="font-display text-5xl leading-[1.05]">Spreadsheet.</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 h-9 rounded-md border text-[12px] font-medium hover-lift"
            style={{ borderColor: C.border }}>
            <Filter size={13} /> Filter
          </button>
          <button className="flex items-center gap-2 px-3 h-9 rounded-md border text-[12px] font-medium hover-lift"
            style={{ borderColor: C.border }}>
            <Download size={13} /> Export CSV
          </button>
          <button className="flex items-center gap-1.5 px-3 h-9 rounded-md text-[12px] font-medium"
            style={{ background: C.signal, color: "#0A0A0B" }}>
            <Plus size={13} /> Add row
          </button>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: C.border, background: C.bgElev }}>
        <div className="grid gap-0 text-[12px]" style={{ gridTemplateColumns: "40px 1.3fr 1.1fr 1fr 0.7fr 0.8fr 0.9fr 0.8fr 40px" }}>
          {["", "Company", "Contact", "Role", "Size", "ARR", "Stage", "Score", ""].map((h, i) => (
            <div key={i} className="px-3 py-2.5 border-b font-mono text-[10px] uppercase tracking-wider"
              style={{ color: C.textMute, borderColor: C.border, background: C.surface }}>
              {h}
            </div>
          ))}
          {leads.map((l, i) => (
            <React.Fragment key={i}>
              <div className="px-3 py-3 border-b font-mono text-[10px]" style={{ color: C.textMute, borderColor: C.border }}>
                {String(i + 1).padStart(3, "0")}
              </div>
              <div className="px-3 py-3 border-b font-medium" style={{ borderColor: C.border }}>{l.co}</div>
              <div className="px-3 py-3 border-b" style={{ borderColor: C.border, color: C.textDim }}>{l.contact}</div>
              <div className="px-3 py-3 border-b" style={{ borderColor: C.border, color: C.textDim }}>{l.role}</div>
              <div className="px-3 py-3 border-b font-mono" style={{ borderColor: C.border }}>{l.size}</div>
              <div className="px-3 py-3 border-b font-mono" style={{ borderColor: C.border }}>{l.arr}</div>
              <div className="px-3 py-3 border-b" style={{ borderColor: C.border }}>
                <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded"
                  style={{
                    background: l.stage === "contract" ? "#1F2A14" : l.stage === "trial" ? "#2A2416" : C.surface,
                    color: l.stage === "contract" ? C.signal : l.stage === "trial" ? C.amber : C.textDim
                  }}>
                  {l.stage}
                </span>
              </div>
              <div className="px-3 py-3 border-b flex items-center gap-2" style={{ borderColor: C.border }}>
                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: C.border }}>
                  <div className="h-full" style={{ width: `${l.score}%`, background: l.score > 90 ? C.signal : l.score > 80 ? C.amber : C.textDim }} />
                </div>
                <span className="font-mono text-[11px] w-6 text-right" style={{ color: l.score > 90 ? C.signal : C.text }}>{l.score}</span>
              </div>
              <div className="px-3 py-3 border-b flex items-center justify-center" style={{ borderColor: C.border }}>
                <button><MoreHorizontal size={12} style={{ color: C.textMute }} /></button>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ TEAM ============
function TeamView() {
  const members = [
    { name: "Damilola Yinusa",  role: "Founder / CEO",     init: "DY", status: "online",  last: "now",      actions: 284 },
    { name: "Amara Kofi",        role: "Head of Product",    init: "AK", status: "online",  last: "now",      actions: 142 },
    { name: "Marcus Tembo",      role: "Senior Designer",    init: "MT", status: "away",    last: "12m ago",  actions: 98 },
    { name: "Sara Lindqvist",    role: "Research Lead",      init: "SL", status: "offline", last: "2h ago",   actions: 67 },
    { name: "Haruki Nakamura",   role: "Growth",             init: "HN", status: "online",  last: "now",      actions: 51 },
  ];
  const activity = [
    { who: "Amara", what: "generated spec", item: "SPEC-042 Permissions model v2", time: "12m ago" },
    { who: "Marcus", what: "commented on", item: "OPP-014 Collaborative workspaces", time: "28m ago" },
    { who: "Damilola", what: "shipped", item: "SPEC-039 NPS drop workflow", time: "1h ago" },
    { who: "Sara", what: "uploaded", item: "8 new customer interviews", time: "3h ago" },
    { who: "Haruki", what: "updated", item: "Q2 goals in Command Center", time: "Yesterday" },
  ];
  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] mb-2" style={{ color: C.textMute }}>
          5 members · 3 online · Pro plan
        </div>
        <h1 className="font-display text-5xl leading-[1.05]">Team.</h1>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-xl border overflow-hidden" style={{ borderColor: C.border, background: C.bgElev }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
            <h2 className="font-display text-xl">Members</h2>
            <button className="flex items-center gap-1.5 px-2.5 h-7 rounded-md text-[11px] font-medium"
              style={{ background: C.signal, color: "#0A0A0B" }}>
              <Plus size={11} /> Invite
            </button>
          </div>
          <div className="divide-y" style={{ borderColor: C.border }}>
            {members.map((m, i) => (
              <div key={i} className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.015]">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-display text-[15px]"
                    style={{
                      background: ["#D1FF3F", "#74C7FF", "#FFB340", "#FF6B6B", "#7BE084"][i % 5],
                      color: "#0A0A0B"
                    }}>
                    {m.init}
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                    style={{
                      borderColor: C.bgElev,
                      background: m.status === "online" ? C.signal : m.status === "away" ? C.amber : C.textMute
                    }} />
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-medium">{m.name}</div>
                  <div className="font-mono text-[10px]" style={{ color: C.textMute }}>{m.role}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[11px]">{m.actions} actions</div>
                  <div className="font-mono text-[10px]" style={{ color: C.textMute }}>{m.last}</div>
                </div>
                <button><MoreHorizontal size={14} style={{ color: C.textMute }} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ borderColor: C.border, background: C.bgElev }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-2">
              <Activity size={14} style={{ color: C.signal }} />
              <h2 className="font-display text-xl">Activity</h2>
            </div>
          </div>
          <div className="divide-y" style={{ borderColor: C.border }}>
            {activity.map((a, i) => (
              <div key={i} className="px-5 py-3.5">
                <div className="text-[12px] leading-relaxed">
                  <span className="font-semibold">{a.who}</span>
                  <span style={{ color: C.textDim }}> {a.what} </span>
                  <span style={{ color: C.signal }}>{a.item}</span>
                </div>
                <div className="font-mono text-[10px] mt-1" style={{ color: C.textMute }}>{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ ROOT ============
export default function LantidDashboard() {
  const [view, setView] = useState("home");
  const [currentPhase, setCurrentPhase] = useState("discover");

  // Keyboard nav
  useEffect(() => {
    const handler = (e) => {
      if (e.metaKey || e.ctrlKey) {
        const map = { "1": "home", "2": "discover", "3": "command", "4": "roadmap", "5": "workflows", "6": "specs", "7": "slides" };
        if (map[e.key]) { e.preventDefault(); setView(map[e.key]); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen font-body grid-bg" style={{ background: C.bg, color: C.text }}>
      <FontStyles />
      <Sidebar view={view} setView={setView} />
      <div className="ml-[248px]">
        <Topbar currentPhase={currentPhase} setCurrentPhase={setCurrentPhase} />
        <main>
          {view === "home"      && <HomeView currentPhase={currentPhase} />}
          {view === "discover"  && <DiscoveryView />}
          {view === "command"   && <CommandView />}
          {view === "roadmap"   && <RoadmapView />}
          {view === "workflows" && <WorkflowsView />}
          {view === "specs"     && <SpecsView />}
          {view === "slides"    && <SlidesView />}
          {view === "data"      && <DataView />}
          {view === "team"      && <TeamView />}
        </main>
      </div>
    </div>
  );
}
