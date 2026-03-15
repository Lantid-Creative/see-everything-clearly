import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  MessageSquare,
  Users,
  GitBranch,
  BarChart3,
  FileText,
  Workflow,
  Zap,
  Target,
  Layers,
  Search,
  Mail,
  BrainCircuit,
  ChevronRight,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const FEATURES = [
  {
    icon: MessageSquare,
    title: "AI Product Discovery",
    desc: "Upload customer interviews, support tickets, and usage data. Ask Carson what to build next — and get answers grounded in real evidence.",
  },
  {
    icon: Target,
    title: "Opportunity Scoring",
    desc: "Carson synthesizes feedback signals, maps pain points to themes, and ranks opportunities by impact — so you always build what matters most.",
  },
  {
    icon: FileText,
    title: "Auto-Generated PRDs",
    desc: "From insight to spec in seconds. Carson drafts product requirements, user stories, and acceptance criteria — ready for your coding agent.",
  },
  {
    icon: Workflow,
    title: "Workflow Automation",
    desc: "Build and deploy multi-step workflows that connect discovery to execution — from research triggers to email outreach to task breakdown.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    desc: "Role-based workspaces with real-time team chat, activity feeds, and shared context. Everyone stays aligned on what's being built and why.",
  },
  {
    icon: Mail,
    title: "Stakeholder Outreach",
    desc: "Manage leads, draft personalized outreach, and track engagement — all powered by AI that understands your product context.",
  },
];

const WORKFLOW_STEPS = [
  {
    num: "01",
    title: "Ingest Signals",
    desc: "Upload customer interviews, NPS surveys, support tickets, analytics data, and competitive research. Carson ingests it all.",
    icon: Search,
  },
  {
    num: "02",
    title: "Synthesize & Prioritize",
    desc: 'Ask "What should we build next?" Carson surfaces themes, scores opportunities, and explains the reasoning with evidence.',
    icon: BrainCircuit,
  },
  {
    num: "03",
    title: "Define & Spec",
    desc: "Get feature specs, UI proposals, data model changes, and development tasks — structured for your coding agent to execute.",
    icon: Layers,
  },
  {
    num: "04",
    title: "Ship & Measure",
    desc: "Deploy workflows that connect insight to action. Track outcomes and feed learnings back into the discovery loop.",
    icon: Zap,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ─── NAV ─── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">C</span>
            </div>
            <span className="font-semibold text-foreground">Carson</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#why" className="hover:text-foreground transition-colors">Why Carson</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/auth"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Sign in
            </Link>
            <Link
              to="/auth"
              className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-6">
        {/* Gradient orb */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1.5 mb-6">
                <Zap className="h-3 w-3" />
                The AI product management platform
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl md:text-7xl font-serif tracking-tight leading-[1.1] text-foreground"
            >
              Stop guessing
              <br />
              <span className="italic text-primary">what to build.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-6 md:mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              AI tools help you write code. Carson helps you figure out{" "}
              <span className="text-foreground font-medium">what code to write</span>.
              Upload customer signals, discover what matters, and ship specs
              your coding agent can execute — all in one system.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <Link
                to="/auth"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium text-sm px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                Start Building What Matters
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground px-6 py-3 rounded-xl border border-border hover:border-foreground/20 transition-colors"
              >
                See How It Works
              </a>
            </motion.div>
          </motion.div>

          {/* Social proof placeholder */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-16 md:mt-24"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-6">
              Built for teams who build products
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-muted-foreground/40">
              {["Product Managers", "Founders", "Engineering Leads", "Growth Teams", "Design Teams"].map(
                (label) => (
                  <span key={label} className="text-sm font-medium">{label}</span>
                )
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── PROBLEM / INSIGHT ─── */}
      <section id="why" className="py-20 md:py-32 px-6 bg-card/50">
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
              <h2 className="mt-4 text-3xl md:text-4xl font-serif tracking-tight text-foreground leading-[1.15]">
                Coding agents don't know{" "}
                <span className="italic text-primary">what</span> to build.
              </h2>
            </motion.div>

            <motion.div variants={fadeUp} custom={1} className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Cursor and Claude Code are incredible at implementation. But they start from a blank prompt —
                they don't know your users, your market, or your feedback.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The hardest part of product development isn't writing code.
                It's <span className="text-foreground font-medium">deciding what to build</span>,
                understanding <span className="text-foreground font-medium">why it matters</span>,
                and defining <span className="text-foreground font-medium">how it should work</span>.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Carson is the missing layer: the AI system that turns raw customer signal into
                actionable product specs — so your coding agent builds the right thing, every time.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-20 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <span className="text-xs font-medium text-primary uppercase tracking-widest">Capabilities</span>
            <h2 className="mt-4 text-3xl md:text-4xl font-serif tracking-tight text-foreground">
              From signal to shipped feature.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Everything you need to run the full product discovery loop — powered by AI,
              designed for humans.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i}
                className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-20 md:py-32 px-6 bg-card/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <span className="text-xs font-medium text-primary uppercase tracking-widest">The Framework</span>
            <h2 className="mt-4 text-3xl md:text-4xl font-serif tracking-tight text-foreground">
              What to build. How to build it. Ship it.
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="space-y-6"
          >
            {WORKFLOW_STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                custom={i}
                className="flex gap-6 items-start group"
              >
                <div className="shrink-0 flex flex-col items-center">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-colors duration-300">
                    <step.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div className="w-px h-6 bg-border mt-2" />
                  )}
                </div>
                <div className="pt-1">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-xs font-mono text-primary/60">{step.num}</span>
                    <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── POSITIONING BANNER ─── */}
      <section className="py-20 md:py-32 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          custom={0}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/15 rounded-3xl p-10 md:p-16">
            <p className="text-xs font-medium text-primary uppercase tracking-widest mb-4">
              Cursor for Product Management
            </p>
            <h2 className="text-3xl md:text-5xl font-serif tracking-tight text-foreground leading-[1.1]">
              As agents take the first pass at implementation,{" "}
              <span className="italic text-primary">how you define what to build</span>{" "}
              becomes everything.
            </h2>
            <p className="mt-6 text-muted-foreground max-w-xl mx-auto leading-relaxed">
              PRDs, Jira tickets, and Figma mocks were designed to communicate intent to human engineers.
              Carson reimagines this for the age of AI — creating specs that machines can execute and humans can trust.
            </p>
            <div className="mt-8">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium text-sm px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                Get Early Access
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">C</span>
            </div>
            <span className="text-sm font-medium text-foreground">Carson</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Carson AI. The product discovery platform.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
