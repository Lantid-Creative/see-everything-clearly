import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Search,
  MessageSquare,
  Mail,
  Workflow,
  Users,
  Presentation,
  Settings,
  Sparkles,
  Send,
  Plus,
  BarChart3,
  FileText,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

/* ─── Scene definitions ─── */
type Scene = {
  id: string;
  label: string;
  sidebarActive: string;
  duration: number;
};

const SCENES: Scene[] = [
  { id: "chat", label: "PRD Generation", sidebarActive: "home", duration: 6000 },
  { id: "research", label: "Feedback Synthesis", sidebarActive: "leads", duration: 5000 },
  { id: "email", label: "Roadmap Prioritization", sidebarActive: "email", duration: 5000 },
  { id: "workflow", label: "Automation Workflows", sidebarActive: "workflows", duration: 5000 },
  { id: "team", label: "Team Alignment", sidebarActive: "team", duration: 5000 },
];

const SIDEBAR_ITEMS = [
  { id: "home", icon: Home, label: "Home" },
  { id: "leads", icon: Search, label: "Insights" },
  { id: "email", icon: BarChart3, label: "Roadmap" },
  { id: "workflows", icon: Workflow, label: "Workflows" },
  { id: "slides", icon: Presentation, label: "Specs" },
  { id: "team", icon: Users, label: "Team" },
];

/* ─── Typing effect hook ─── */
function useTypingText(text: string, isActive: boolean, speed = 25) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    if (!isActive) {
      setDisplayed("");
      indexRef.current = 0;
      return;
    }
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, isActive, speed]);

  return displayed;
}

/* ─── Scene: PRD Generation ─── */
function ChatScene({ active }: { active: boolean }) {
  const userMsg = useTypingText(
    "Generate a PRD for our new collaborative editing feature based on the last 50 user interviews",
    active,
    30
  );
  const [showAI, setShowAI] = useState(false);
  const aiMsg = useTypingText(
    "PRD: Collaborative Editing v1.0\n\n▎ Problem\nTeams lose context switching between docs, chat, and specs. 73% of interviewed users cited 'fragmented tools' as #1 pain.\n\n▎ User Stories\n✅ As a PM, I can co-edit specs in real-time\n✅ As a designer, I can leave inline feedback\n✅ As an engineer, I can link PRD sections to tickets\n\n▎ Success Metrics\n• 40% reduction in spec review cycles\n• NPS > 50 for editing experience",
    showAI,
    12
  );

  useEffect(() => {
    if (!active) { setShowAI(false); return; }
    const t = setTimeout(() => setShowAI(true), 2800);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
      <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-white/70">PRD Generator</span>
        <span className="ml-auto text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full">From interviews</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: active ? 1 : 0, y: active ? 0 : 10 }}
        className="flex gap-2 items-start"
      >
        <div className="shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-[9px] font-bold text-white">
          Y
        </div>
        <div className="bg-white/[0.06] rounded-xl rounded-tl-sm px-3 py-2 text-xs text-white/80 max-w-[280px] leading-relaxed">
          {userMsg}
          {userMsg.length < 80 && active && (
            <span className="inline-block w-0.5 h-3.5 bg-primary ml-0.5 animate-pulse" />
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showAI && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 items-start"
          >
            <div className="shrink-0 h-6 w-6 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl rounded-tl-sm px-3 py-2 text-xs text-white/70 max-w-[300px] leading-relaxed whitespace-pre-wrap">
              {aiMsg}
              {aiMsg.length < 350 && (
                <span className="inline-block w-0.5 h-3.5 bg-primary ml-0.5 animate-pulse" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-auto flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2">
        <Plus className="h-3.5 w-3.5 text-white/30" />
        <span className="text-xs text-white/20 flex-1">Ask about your product…</span>
        <Send className="h-3.5 w-3.5 text-white/20" />
      </div>
    </div>
  );
}

/* ─── Scene: Feedback Synthesis ─── */
function ResearchScene({ active }: { active: boolean }) {
  const themes = [
    { theme: "Real-time collaboration", mentions: 34, sentiment: "positive", trend: "+12", sources: "Interviews, NPS" },
    { theme: "Slow spec approval cycles", mentions: 28, sentiment: "negative", trend: "+8", sources: "Support, Interviews" },
    { theme: "Better Jira integration", mentions: 22, sentiment: "neutral", trend: "+5", sources: "Slack, Surveys" },
    { theme: "Mobile editing support", mentions: 19, sentiment: "positive", trend: "+3", sources: "NPS, App reviews" },
    { theme: "Confusing permissions model", mentions: 15, sentiment: "negative", trend: "+6", sources: "Support tickets" },
  ];

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-white/70">AI Feedback Synthesis</span>
        </div>
        <span className="text-[10px] text-white/30">118 sources analyzed</span>
      </div>

      <div className="space-y-1">
        {themes.map((t, i) => (
          <motion.div
            key={t.theme}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: active ? 1 : 0, x: active ? 0 : -10 }}
            transition={{ delay: i * 0.15, duration: 0.3 }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${i === 0 ? "bg-primary/10 border border-primary/20" : "hover:bg-white/[0.03]"}`}
          >
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white/80 truncate">{t.theme}</div>
              <div className="text-[10px] text-white/30 truncate">{t.sources}</div>
            </div>
            <div className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
              t.sentiment === "positive" ? "bg-emerald-500/15 text-emerald-400" :
              t.sentiment === "negative" ? "bg-red-500/15 text-red-400" :
              "bg-white/[0.06] text-white/40"
            }`}>
              {t.sentiment}
            </div>
            <div className="text-[10px] text-emerald-400/70 font-medium">{t.trend}</div>
            <div className="text-[10px] text-white/40 font-mono">{t.mentions}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Scene: Roadmap Prioritization ─── */
function EmailScene({ active }: { active: boolean }) {
  const features = [
    { name: "Real-time co-editing", impact: 9.2, effort: "M", rice: 94, quarter: "Q2", status: "approved" },
    { name: "Approval workflow revamp", impact: 8.5, effort: "L", rice: 87, quarter: "Q2", status: "approved" },
    { name: "Jira bi-directional sync", impact: 7.8, effort: "M", rice: 76, quarter: "Q3", status: "proposed" },
    { name: "Mobile spec viewer", impact: 7.1, effort: "S", rice: 72, quarter: "Q3", status: "proposed" },
    { name: "Role-based permissions v2", impact: 6.9, effort: "L", rice: 65, quarter: "Q4", status: "backlog" },
  ];

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-white/70">AI-Ranked Roadmap</span>
        </div>
        <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full">RICE scored</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 text-[9px] text-white/30 uppercase tracking-wider">
        <span className="flex-1">Feature</span>
        <span className="w-10 text-center">Impact</span>
        <span className="w-8 text-center">Effort</span>
        <span className="w-10 text-center">RICE</span>
        <span className="w-12 text-center">Status</span>
      </div>

      <div className="space-y-0.5">
        {features.map((f, i) => (
          <motion.div
            key={f.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: active ? 1 : 0, x: active ? 0 : -10 }}
            transition={{ delay: i * 0.15, duration: 0.3 }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${i < 2 ? "bg-primary/[0.06] border border-primary/10" : "hover:bg-white/[0.03]"}`}
          >
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white/80 truncate">{f.name}</div>
              <div className="text-[10px] text-white/30">{f.quarter}</div>
            </div>
            <div className="w-10 text-center text-[11px] text-white/60 font-medium">{f.impact}</div>
            <div className="w-8 text-center text-[10px] text-white/40 font-mono">{f.effort}</div>
            <div className="w-10 text-center text-[11px] text-primary font-bold">{f.rice}</div>
            <div className={`w-12 text-center text-[9px] px-1 py-0.5 rounded-full font-medium ${
              f.status === "approved" ? "bg-emerald-500/15 text-emerald-400" :
              f.status === "proposed" ? "bg-blue-500/15 text-blue-400" :
              "bg-white/[0.06] text-white/40"
            }`}>
              {f.status}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Scene: Automation Workflows ─── */
function WorkflowScene({ active }: { active: boolean }) {
  const nodes = [
    { label: "NPS Drop < 7 Detected", icon: BarChart3, color: "from-red-500/30 to-orange-500/30" },
    { label: "Pull Related Feedback", icon: Search, color: "from-blue-500/30 to-cyan-500/30" },
    { label: "AI Root Cause Analysis", icon: Sparkles, color: "from-primary/30 to-orange-400/30" },
    { label: "Draft Action Items", icon: FileText, color: "from-violet-500/30 to-purple-500/30" },
    { label: "Notify PM + Create Ticket", icon: Users, color: "from-emerald-500/30 to-green-500/30" },
  ];

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
        <span className="text-xs font-medium text-white/70">NPS → Insight Pipeline</span>
        <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
          <CheckCircle2 className="h-2.5 w-2.5" /> Active
        </span>
      </div>

      <div className="flex flex-col items-center gap-1">
        {nodes.map((node, i) => (
          <motion.div key={node.label} className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.8 }}
              transition={{ delay: i * 0.25, duration: 0.4 }}
              className={`flex items-center gap-2.5 bg-gradient-to-r ${node.color} border border-white/[0.08] rounded-xl px-4 py-2.5 w-full max-w-[240px]`}
            >
              <node.icon className="h-3.5 w-3.5 text-white/70 shrink-0" />
              <span className="text-xs text-white/80 font-medium">{node.label}</span>
            </motion.div>
            {i < nodes.length - 1 && (
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: active ? 1 : 0 }}
                transition={{ delay: i * 0.25 + 0.2, duration: 0.2 }}
                className="w-px h-4 bg-white/10 origin-top"
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Scene: Team Alignment ─── */
function TeamScene({ active }: { active: boolean }) {
  const messages = [
    { user: "Sarah (PM)", initials: "SC", msg: "PRD for collaborative editing is ready for review — AI drafted it from our last 12 interviews", time: "2m ago" },
    { user: "Marcus (Eng)", initials: "ML", msg: "Acceptance criteria are clear. I can start sprint planning from this.", time: "5m ago" },
    { user: "Priya (Design)", initials: "PK", msg: "Love the user stories. Uploading wireframes now.", time: "8m ago" },
    { user: "Lantid AI", initials: "L", msg: "Conflict detected: 'permissions v2' depends on 'co-editing' — suggest sequencing co-editing first in Q2.", time: "8m ago", isAI: true },
  ];

  return (
    <div className="flex-1 flex flex-col p-4 overflow-hidden">
      <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06] mb-3">
        <Users className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-white/70">Product Team</span>
        <span className="ml-auto text-[10px] text-white/30">4 online</span>
      </div>

      <div className="space-y-2.5 flex-1">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: active ? 1 : 0, y: active ? 0 : 8 }}
            transition={{ delay: i * 0.3, duration: 0.3 }}
            className="flex gap-2 items-start"
          >
            <div className={`shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${
              m.isAI ? "bg-gradient-to-br from-primary to-orange-400" : "bg-gradient-to-br from-violet-500/50 to-blue-500/50"
            }`}>
              {m.isAI ? <Sparkles className="h-3 w-3" /> : m.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className={`text-[11px] font-medium ${m.isAI ? "text-primary" : "text-white/70"}`}>{m.user}</span>
                <span className="text-[9px] text-white/20">{m.time}</span>
              </div>
              <div className="text-xs text-white/50 leading-relaxed">{m.msg}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2">
        <span className="text-xs text-white/20 flex-1">Discuss product decisions…</span>
        <Send className="h-3.5 w-3.5 text-white/20" />
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export function DashboardWalkthrough() {
  const [activeScene, setActiveScene] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-rotate scenes
  useEffect(() => {
    if (isHovering) return;
    timerRef.current = setTimeout(() => {
      setActiveScene((prev) => (prev + 1) % SCENES.length);
    }, SCENES[activeScene].duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeScene, isHovering]);

  const scene = SCENES[activeScene];

  const renderScene = () => {
    switch (scene.id) {
      case "chat": return <ChatScene active />;
      case "research": return <ResearchScene active />;
      case "email": return <EmailScene active />;
      case "workflow": return <WorkflowScene active />;
      case "team": return <TeamScene active />;
      default: return null;
    }
  };

  return (
    <section className="px-4 md:px-6 pb-20 md:pb-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-5xl mx-auto"
      >
        {/* Section heading */}
        <div className="text-center mb-10">
          <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">Live walkthrough</p>
          <h2 className="text-2xl md:text-4xl font-serif tracking-tight leading-[1.15]">
            See Lantid{" "}
            <span className="italic bg-gradient-to-r from-primary to-orange-300 bg-clip-text text-transparent">
              in action
            </span>
          </h2>
        </div>

        {/* Dashboard frame */}
        <div
          className="relative rounded-2xl border border-white/[0.08] bg-[#0c0c12] overflow-hidden shadow-2xl shadow-black/50"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-white/[0.04] border border-white/[0.06] rounded-md px-4 py-0.5 text-[10px] text-white/25">
                lantid.com/dashboard
              </div>
            </div>
          </div>

          <div className="flex min-h-[420px]">
            {/* Sidebar */}
            <div className="w-[52px] md:w-[180px] border-r border-white/[0.06] bg-white/[0.01] flex flex-col py-3 px-2 md:px-3 shrink-0">
              {/* Logo */}
              <div className="flex items-center gap-2 mb-4 px-1">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-[10px]">L</span>
                </div>
                <span className="hidden md:block text-xs font-semibold text-white/80">Lantid</span>
              </div>

              {/* Nav items */}
              <div className="space-y-0.5">
                {SIDEBAR_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      const idx = SCENES.findIndex(s => s.sidebarActive === item.id);
                      if (idx !== -1) setActiveScene(idx);
                    }}
                    className={`flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg text-xs transition-colors ${
                      scene.sidebarActive === item.id
                        ? "bg-primary/10 text-primary"
                        : "text-white/30 hover:text-white/50 hover:bg-white/[0.03]"
                    }`}
                  >
                    <item.icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden md:block">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Bottom */}
              <div className="mt-auto pt-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <Settings className="h-3.5 w-3.5 text-white/20" />
                  <span className="hidden md:block text-xs text-white/20">Settings</span>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={scene.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="flex-1 flex flex-col"
                >
                  {renderScene()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Scene indicator pills */}
          <div className="flex items-center justify-center gap-2 py-3 border-t border-white/[0.06] bg-white/[0.01]">
            {SCENES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveScene(i)}
                className={`relative h-1.5 rounded-full transition-all overflow-hidden ${
                  i === activeScene ? "w-10 bg-white/10" : "w-5 bg-white/[0.06] hover:bg-white/10"
                }`}
              >
                {i === activeScene && !isHovering && (
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-primary rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: SCENES[activeScene].duration / 1000, ease: "linear" }}
                    key={`progress-${activeScene}-${Date.now()}`}
                  />
                )}
                {i === activeScene && isHovering && (
                  <div className="absolute inset-0 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CTA below mockup */}
        <div className="text-center mt-8">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Try the full dashboard <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
