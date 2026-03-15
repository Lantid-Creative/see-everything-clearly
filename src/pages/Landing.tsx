import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  MessageSquare,
  Users,
  BarChart3,
  FileText,
  Workflow,
  Zap,
  Target,
  Layers,
  Search,
  BrainCircuit,
  Upload,
  Sparkles,
  CheckCircle2,
  GitBranch,
  Bot,
  ChevronRight,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const TABS = [
  {
    id: "discover",
    label: "Discovery",
    icon: Search,
    title: "Ask what to build next",
    description: "Upload customer interviews, NPS data, and support tickets. Lantid synthesizes everything and surfaces the opportunities worth pursuing.",
    mockup: {
      userMessage: "Based on our last 50 customer interviews, what's the #1 feature we should build?",
      aiResponse: `**Top Priority: Collaborative Workspaces**\n\n📊 Mentioned by **34 of 50** customers (68%)\n\n**Key Signals:**\n• "I need to share findings with my team" — 23 mentions\n• "We waste time re-doing the same research" — 18 mentions\n• "No single source of truth for product decisions" — 15 mentions\n\n**Impact Score: 9.2/10**\nHigh user demand + low implementation complexity + strong retention signal`,
    },
  },
  {
    id: "define",
    label: "PRD Generation",
    icon: FileText,
    title: "From insight to spec in seconds",
    description: "Lantid drafts product requirements, user stories, acceptance criteria, and UI proposals — structured for your coding agent to execute.",
    mockup: {
      userMessage: "Generate a PRD for the collaborative workspaces feature",
      aiResponse: `**PRD: Collaborative Workspaces** v0.1\n\n**Problem Statement**\nTeams lack a shared context for product decisions, leading to duplicated research and misaligned priorities.\n\n**User Stories**\n✅ As a PM, I can invite team members to a shared workspace\n✅ As a team lead, I can see all research and decisions in one feed\n✅ As a designer, I can access customer quotes relevant to my work\n\n**Data Model Changes**\n\`workspaces\`, \`workspace_members\`, \`shared_artifacts\`\n\n**Dev Tasks (5)** → Ready for Cursor / Claude Code`,
    },
  },
  {
    id: "workflows",
    label: "Workflows",
    icon: Workflow,
    title: "Automate the discovery loop",
    description: "Build multi-step workflows that connect research to action — from feedback triggers to stakeholder outreach to development handoff.",
    mockup: {
      userMessage: "Create a workflow: when NPS drops below 7, analyze feedback and alert the team",
      aiResponse: `**Workflow Created: NPS Alert Pipeline** ⚡\n\n**Trigger:** NPS score < 7 detected\n↓\n**Step 1:** Aggregate recent detractor feedback\n↓\n**Step 2:** AI analysis — extract themes & root causes\n↓\n**Step 3:** Generate summary with recommended actions\n↓\n**Step 4:** Post to #product-alerts + assign to PM on-call\n\n✅ Workflow deployed. Monitoring active.`,
    },
  },
  {
    id: "collaborate",
    label: "Team",
    icon: Users,
    title: "Align your team around what matters",
    description: "Role-based workspaces with real-time chat, activity feeds, and shared context. Everyone stays aligned on what's being built and why.",
    mockup: {
      userMessage: "Show me what the team worked on this week",
      aiResponse: `**Team Activity — This Week**\n\n👤 **Sarah** (PM)\n• Completed discovery for checkout redesign\n• Generated PRD — awaiting review\n\n👤 **Marcus** (Eng Lead)\n• Reviewed 3 PRDs, approved 2\n• Deployed NPS alert workflow\n\n👤 **Priya** (Research)\n• Uploaded 12 customer interviews\n• Tagged 47 insights across 3 themes\n\n📈 **Team Score:** 94% alignment on Q2 priorities`,
    },
  },
];

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Natural Language Discovery",
    desc: "Ask questions about your customers, market, and product — get answers backed by real data.",
  },
  {
    icon: Target,
    title: "Opportunity Scoring",
    desc: "AI ranks features by impact, effort, and strategic fit. No more gut-feeling prioritization.",
  },
  {
    icon: FileText,
    title: "Auto-Generated Specs",
    desc: "PRDs, user stories, and acceptance criteria — structured for AI coding agents.",
  },
  {
    icon: Workflow,
    title: "Workflow Automation",
    desc: "Connect discovery to execution with multi-step automated pipelines.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    desc: "Real-time chat, activity feeds, and shared context across your product team.",
  },
  {
    icon: Bot,
    title: "Agent-Ready Output",
    desc: "Specs designed for Cursor, Claude Code, and other AI coding tools to execute directly.",
  },
];

const STEPS = [
  { num: "01", title: "Ingest", desc: "Upload interviews, surveys, tickets, and analytics.", icon: Upload, color: "from-blue-500 to-cyan-500" },
  { num: "02", title: "Synthesize", desc: "AI surfaces themes, scores opportunities, explains why.", icon: BrainCircuit, color: "from-violet-500 to-purple-500" },
  { num: "03", title: "Define", desc: "Get specs, UI proposals, data models, and dev tasks.", icon: Layers, color: "from-primary to-orange-400" },
  { num: "04", title: "Ship", desc: "Hand off to your coding agent. Measure. Repeat.", icon: Zap, color: "from-emerald-500 to-green-500" },
];

export default function Landing() {
  const [activeTab, setActiveTab] = useState("discover");
  const activeTabData = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* ─── NAV ─── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-white text-lg">Lantid</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#why" className="hover:text-white transition-colors">Why Lantid</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className="text-sm text-white/60 hover:text-white transition-colors hidden sm:block"
            >
              Login
            </Link>
            <Link
              to="/auth"
              className="text-sm font-medium bg-white text-[#0a0a0f] px-4 py-2 rounded-lg hover:bg-white/90 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-8 md:pt-44 md:pb-16 px-6">
        {/* Background gradient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[400px] h-[400px] bg-primary/15 rounded-full blur-[150px]" />
          <div className="absolute top-40 right-1/4 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-3.5 py-1.5 mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                Cursor for Product Management
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-6xl md:text-7xl font-serif tracking-tight leading-[1.08]"
            >
              Figure out{" "}
              <span className="italic bg-gradient-to-r from-primary to-orange-300 bg-clip-text text-transparent">
                what to build
              </span>
              <br />
              not just how to build it.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-6 md:mt-8 text-base md:text-lg text-white/50 max-w-2xl mx-auto leading-relaxed"
            >
              AI tools write code. Lantid tells them{" "}
              <span className="text-white font-medium">what code to write</span>.
              Upload customer signals, discover opportunities, and generate specs
              your coding agent can ship.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <Link
                to="/auth"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[#0a0a0f] font-medium text-sm px-6 py-3 rounded-xl hover:bg-white/90 transition-colors"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm text-white/60 hover:text-white px-6 py-3 rounded-xl border border-white/10 hover:border-white/25 transition-colors"
              >
                See how it works
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── INTERACTIVE PRODUCT MOCKUP ─── */}
      <section className="px-4 md:px-6 pb-20 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-5xl mx-auto"
        >
          {/* Tab bar */}
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-t-2xl p-1.5 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mockup content */}
          <div className="bg-white/[0.03] border border-white/[0.08] border-t-0 rounded-b-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-2 min-h-[400px]"
              >
                {/* Left: Chat */}
                <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-white/[0.06]">
                  <div className="space-y-4">
                    {/* User message */}
                    <div className="flex gap-3">
                      <div className="shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-[10px] font-bold">
                        Y
                      </div>
                      <div className="bg-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-white/80 leading-relaxed max-w-sm">
                        {activeTabData.mockup.userMessage}
                      </div>
                    </div>

                    {/* AI response */}
                    <div className="flex gap-3">
                      <div className="shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
                        <Sparkles className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-white/70 leading-relaxed max-w-md">
                        <pre className="whitespace-pre-wrap font-sans text-[13px]">
                          {activeTabData.mockup.aiResponse}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Description */}
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 text-xs font-medium text-primary mb-4">
                    <activeTabData.icon className="h-4 w-4" />
                    {activeTabData.label}
                  </div>
                  <h3 className="text-xl md:text-2xl font-serif text-white mb-3">
                    {activeTabData.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {activeTabData.description}
                  </p>
                  <Link
                    to="/auth"
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Try it now <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* ─── PROBLEM STATEMENT ─── */}
      <section id="why" className="py-20 md:py-32 px-6 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-12 md:gap-20 items-center"
          >
            <motion.div variants={fadeUp} custom={0}>
              <span className="text-xs font-medium text-primary uppercase tracking-widest">The Problem</span>
              <h2 className="mt-4 text-3xl md:text-4xl font-serif tracking-tight leading-[1.15]">
                Coding agents don't know{" "}
                <span className="italic bg-gradient-to-r from-primary to-orange-300 bg-clip-text text-transparent">
                  what
                </span>{" "}
                to build.
              </h2>
            </motion.div>

            <motion.div variants={fadeUp} custom={1} className="space-y-4">
              <p className="text-white/50 leading-relaxed">
                Cursor and Claude Code are incredible at implementation. But they start from a blank prompt —
                they don't know your users, your market, or your feedback.
              </p>
              <p className="text-white/50 leading-relaxed">
                The hardest part of product development isn't writing code.
                It's <span className="text-white font-medium">deciding what to build</span>,
                understanding <span className="text-white font-medium">why it matters</span>,
                and defining <span className="text-white font-medium">how it should work</span>.
              </p>
              <p className="text-white/50 leading-relaxed">
                Lantid is the missing layer — the AI that turns raw customer signal into
                actionable specs your coding agent can execute.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-20 md:py-32 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <span className="text-xs font-medium text-primary uppercase tracking-widest">The Framework</span>
            <h2 className="mt-4 text-3xl md:text-4xl font-serif tracking-tight">
              From customer signal to shipped feature.
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                custom={i}
                className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-300"
              >
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 opacity-80 group-hover:opacity-100 transition-opacity`}>
                  <step.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">{step.num}</span>
                <h3 className="text-base font-semibold text-white mt-1 mb-2">{step.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-2 w-4 text-white/15">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section id="features" className="py-20 md:py-32 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <span className="text-xs font-medium text-primary uppercase tracking-widest">Capabilities</span>
            <h2 className="mt-4 text-3xl md:text-4xl font-serif tracking-tight">
              Everything you need to decide{" "}
              <span className="italic text-primary">what to build</span>.
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i}
                className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-primary/20 hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="py-20 md:py-32 px-6 border-t border-white/[0.06]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          custom={0}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="relative rounded-3xl overflow-hidden p-10 md:p-16">
            {/* Gradient bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-violet-500/10 pointer-events-none" />
            <div className="absolute inset-0 border border-primary/15 rounded-3xl pointer-events-none" />

            <div className="relative">
              <p className="text-xs font-medium text-primary uppercase tracking-widest mb-4">
                The product discovery platform
              </p>
              <h2 className="text-2xl md:text-4xl font-serif tracking-tight leading-[1.15]">
                As AI agents write the code,{" "}
                <span className="italic bg-gradient-to-r from-primary to-orange-300 bg-clip-text text-transparent">
                  what you tell them to build
                </span>{" "}
                becomes everything.
              </h2>
              <p className="mt-6 text-white/50 max-w-lg mx-auto leading-relaxed text-sm md:text-base">
                PRDs and Jira tickets were designed for human engineers. Lantid creates specs
                that AI agents can execute and humans can trust.
              </p>
              <div className="mt-8">
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 bg-white text-[#0a0a0f] font-medium text-sm px-6 py-3 rounded-xl hover:bg-white/90 transition-colors"
                >
                  Start building what matters
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
              <span className="text-white font-bold text-xs">L</span>
            </div>
            <span className="text-sm font-medium text-white">Lantid</span>
          </div>
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Lantid AI. The product discovery platform.
          </p>
          <div className="flex gap-6 text-xs text-white/30">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
