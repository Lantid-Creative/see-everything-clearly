import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Code2,
  Smartphone,
  Brain,
  Shield,
  Database,
  Cloud,
  Sparkles,
  CheckCircle2,
  Star,
  Activity,
  Zap,
  Layers,
  Users,
  TrendingUp,
} from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";

const partners = [
  "Microsoft",
  "Adobe",
  "AWS",
  "Azure",
  "Google Cloud",
  "Oracle",
  "Salesforce",
  "Stripe",
  "Docker",
  "HubSpot",
];

const services = [
  {
    icon: Code2,
    title: "Software Development",
    desc: "Custom enterprise platforms architected for performance, security, and scale.",
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    desc: "Native iOS, Android, and cross-platform apps with pixel-perfect experiences.",
  },
  {
    icon: Brain,
    title: "AI & Machine Learning",
    desc: "Production-grade AI agents, LLM systems, and data pipelines that drive ROI.",
  },
  {
    icon: Shield,
    title: "Cybersecurity",
    desc: "Threat modeling, penetration testing, and zero-trust architecture audits.",
  },
  {
    icon: Database,
    title: "Blockchain Solutions",
    desc: "Smart contracts, custodial wallets, and tokenization frameworks done right.",
  },
  {
    icon: Cloud,
    title: "Cloud & DevOps",
    desc: "Multi-cloud infra, CI/CD pipelines, and observability for global teams.",
  },
];

const stats = [
  { value: "12+", label: "Years of expertise" },
  { value: "350+", label: "Enterprise clients" },
  { value: "98%", label: "Client retention" },
  { value: "40+", label: "Global markets" },
];

const process = [
  { step: "01", title: "Discover", desc: "Stakeholder workshops, technical audits, and KPI alignment." },
  { step: "02", title: "Design", desc: "Architecture, UX flows, and rigorous prototyping with your team." },
  { step: "03", title: "Build", desc: "Agile delivery with weekly demos and production-ready quality gates." },
  { step: "04", title: "Scale", desc: "Observability, SRE coverage, and continuous optimization." },
];

const testimonials = [
  {
    quote:
      "Lantid rebuilt our trading platform end-to-end. Latency dropped by 60% and our enterprise NPS hit an all-time high.",
    author: "Sarah Al-Mansouri",
    role: "CTO, Mena Capital",
  },
  {
    quote:
      "They felt like an extension of our team from week one. The AI workflows they shipped saved us 400 hours a month.",
    author: "James Whitaker",
    role: "VP Engineering, Logix Group",
  },
  {
    quote:
      "Best technical partner we've worked with. Zero compromise on security and a relentless focus on outcomes.",
    author: "Priya Raman",
    role: "Head of Product, Helix Health",
  },
];

export default function Home() {
  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-background text-foreground">
        <div className="absolute inset-0 pointer-events-none hero-radial" />
        <div className="absolute inset-0 pointer-events-none grid-bg opacity-60" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-foreground/80 mb-8 backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary" />
              Trusted by 350+ enterprises worldwide
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05] text-foreground">
              Enterprise Digital{" "}
              <span className="italic brand-gradient-text">Solutions</span>{" "}
              That Drive Growth
            </h1>

            <p className="mt-8 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              We build scalable, secure, high-performance digital solutions for enterprises.
              From software and app development to AI, cybersecurity, and blockchain — we help
              businesses innovate and scale with confidence.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/contact"
                className="group inline-flex items-center gap-2 rounded-full bg-white text-background px-7 py-3.5 text-sm font-semibold hover:brand-glow transition-all hover:gap-3"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/case-study"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-7 py-3.5 text-sm font-semibold text-foreground hover:bg-white/10 transition-all"
              >
                View Case Studies
              </Link>
            </div>
          </motion.div>

          {/* Dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mt-20 mx-auto max-w-5xl"
          >
            <div className="absolute -inset-6 bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30 blur-3xl rounded-3xl" />
            <div className="relative rounded-2xl border border-sidebar-border bg-sidebar-accent/40 backdrop-blur p-2 shadow-2xl">
              <div className="rounded-xl bg-sidebar overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-sidebar-border">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                  <div className="ml-4 text-xs text-sidebar-muted">lantid.app/dashboard</div>
                </div>
                <div className="p-6 sm:p-8">
                  <div className="text-sm text-sidebar-foreground mb-1">
                    Welcome back, Michael 👋
                  </div>
                  <div className="text-xs text-sidebar-muted mb-6">
                    Here's an overview of your projects today.
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Overall Status", value: "Healthy", trend: "+9.97%", color: "text-green-400" },
                      { label: "Uptime", value: "99.95%", trend: "+0.12%", color: "text-primary" },
                      { label: "Active Builds", value: "25", trend: "+12%", color: "text-blue-400" },
                    ].map((c) => (
                      <div
                        key={c.label}
                        className="rounded-xl bg-sidebar-accent/50 border border-sidebar-border p-4"
                      >
                        <div className="text-[11px] text-sidebar-muted uppercase tracking-wider">
                          {c.label}
                        </div>
                        <div className="mt-2 text-2xl font-semibold text-sidebar-primary">
                          {c.value}
                        </div>
                        <div className={`mt-1 text-xs ${c.color}`}>{c.trend} vs last month</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ PARTNERS ============ */}
      <section className="border-y border-border bg-card/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-8">
            Our Technology Partners
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {partners.map((p) => (
              <span
                key={p}
                className="text-base sm:text-lg font-semibold text-muted-foreground/60 hover:text-foreground transition-colors"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What we do"
            title={
              <>
                Engineered for{" "}
                <span className="italic text-primary">enterprise outcomes</span>
              </>
            }
            description="Six core practices, one delivery standard. Every engagement ships with security, observability, and scale built-in."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group relative rounded-2xl border border-border bg-card p-7 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <s.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                <Link
                  to="/services"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-all"
                >
                  Learn more <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="py-20 bg-sidebar text-sidebar-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-serif text-4xl sm:text-5xl text-sidebar-primary">
                <span className="bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                  {s.value}
                </span>
              </div>
              <div className="mt-2 text-xs sm:text-sm text-sidebar-foreground uppercase tracking-wider">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ PROCESS ============ */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="How we work"
            title={
              <>
                A delivery process built for{" "}
                <span className="italic text-primary">certainty</span>
              </>
            }
            description="Predictable timelines, transparent communication, and demos every week."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((p, i) => (
              <motion.div
                key={p.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl border border-border bg-card p-7"
              >
                <div className="font-serif text-5xl text-primary/30 leading-none">{p.step}</div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WHY US ============ */}
      <section className="py-24 sm:py-32 bg-card/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Why Lantid"
              title={
                <>
                  An engineering partner that treats your roadmap like{" "}
                  <span className="italic text-primary">our own</span>
                </>
              }
              description="No offshore handoffs, no junior teams hidden behind senior pitches. You get principals end-to-end."
            />
            <div className="mt-8 space-y-4">
              {[
                "Senior-led pods with embedded designers",
                "ISO 27001 & SOC 2 aligned operations",
                "24/7 SRE coverage with 99.95% uptime SLA",
                "Transparent weekly demos and burndown",
                "IP & code ownership transferred to you",
              ].map((f) => (
                <div key={f} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { Icon: Activity, title: "Real-time", desc: "Production telemetry on every build" },
              { Icon: Zap, title: "10x faster", desc: "Time-to-market vs traditional shops" },
              { Icon: Layers, title: "Full-stack", desc: "From silicon to UX, one team" },
              { Icon: Users, title: "Embedded", desc: "Slack, Jira, standups — fully integrated" },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border border-border bg-background p-6 hover:border-primary/40 transition-colors"
              >
                <c.Icon className="h-6 w-6 text-primary" />
                <div className="mt-4 font-semibold text-foreground">{c.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Loved by leaders"
            title={
              <>
                The teams that ship with us, <span className="italic text-primary">stay with us</span>
              </>
            }
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.figure
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-7"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <blockquote className="text-foreground leading-relaxed">"{t.quote}"</blockquote>
                <figcaption className="mt-6 pt-6 border-t border-border">
                  <div className="font-semibold text-foreground">{t.author}</div>
                  <div className="text-sm text-muted-foreground">{t.role}</div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="py-24 sm:py-32 bg-sidebar text-sidebar-primary relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <TrendingUp className="h-10 w-10 text-primary mx-auto" />
          <h2 className="mt-6 font-serif text-4xl sm:text-5xl tracking-tight leading-tight">
            Let's build the platform your{" "}
            <span className="italic text-primary">next decade</span> runs on.
          </h2>
          <p className="mt-6 text-sidebar-foreground max-w-2xl mx-auto">
            Talk to a principal engineer about your roadmap. We'll respond within one business day
            with a scoped proposal.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3.5 text-sm font-semibold hover:shadow-2xl hover:shadow-primary/30 transition-all hover:gap-3"
            >
              Start a conversation
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="tel:+2347074430088"
              className="inline-flex items-center gap-2 rounded-full border border-sidebar-border px-7 py-3.5 text-sm font-semibold hover:bg-sidebar-accent transition-all"
            >
              +234 707 443 0088
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
