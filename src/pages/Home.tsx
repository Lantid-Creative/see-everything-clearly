import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  TrendingUp,
  Map,
  Search,
  Factory,
  BarChart3,
  Palette,
  Cpu,
  Sparkles,
  CheckCircle2,
  Star,
  Activity,
  Zap,
  Layers,
  Users,
  ShieldCheck,
  Globe2,
  Building2,
  HeartPulse,
  Lightbulb,
  Award,
  Quote,
} from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Seo } from "@/components/site/Seo";

const partners = [
  "Federal Ministries",
  "State Governments",
  "UNDP",
  "USAID",
  "World Bank",
  "GIZ",
  "DFID/FCDO",
  "African Development Bank",
  "Private Enterprises",
  "Foundations",
];

const services = [
  {
    icon: Briefcase,
    title: "Management Consulting",
    desc: "Organizational restructuring, change management, leadership development and performance improvement that move institutions from intent to execution.",
  },
  {
    icon: TrendingUp,
    title: "Business Consulting",
    desc: "Growth strategy, market entry, financial advisory, governance and feasibility studies — engineered for revenue, resilience and exit-readiness.",
  },
  {
    icon: Map,
    title: "Strategic Planning",
    desc: "Long-range plans, competitive positioning, scenario modelling and implementation roadmaps your leadership team can actually deliver against.",
  },
  {
    icon: Search,
    title: "Policy Research",
    desc: "Evidence-based policy analysis, stakeholder engagement, legislative review and comparative studies that shape better public outcomes.",
  },
  {
    icon: Factory,
    title: "Industrial Policy Development",
    desc: "Sector mapping, value chains, investment promotion, local content and manufacturing competitiveness frameworks that unlock growth.",
  },
  {
    icon: BarChart3,
    title: "Monitoring & Evaluation",
    desc: "Results-based M&E frameworks, theory of change, impact evaluation and donor-compliant reporting that prove — and improve — outcomes.",
  },
  {
    icon: Palette,
    title: "Branding & Brand Development",
    desc: "Brand strategy, visual identity, corporate communications and digital presence for institutions that need to be seen, trusted and remembered.",
  },
  {
    icon: Cpu,
    title: "IT & Technology Solutions",
    desc: "Custom software, mobile, web, cloud, cybersecurity and systems integration to digitise operations and accelerate transformation.",
  },
];

const stats = [
  { value: "2023", label: "Year founded" },
  { value: "2", label: "Countries (NG · UK)" },
  { value: "8", label: "Integrated practices" },
  { value: "100%", label: "Senior-led delivery" },
];

const process = [
  { step: "01", title: "Discover", desc: "Stakeholder workshops, diagnostics and KPI alignment to anchor every engagement in measurable outcomes." },
  { step: "02", title: "Design", desc: "Strategy, frameworks, creative direction and technical architecture — co-created with your team, not handed down." },
  { step: "03", title: "Deliver", desc: "Agile execution with weekly check-ins, transparent reporting and production-grade quality at every milestone." },
  { step: "04", title: "Sustain", desc: "Capacity building, knowledge transfer and continuous improvement so impact outlasts the engagement." },
];

const testimonials = [
  {
    quote:
      "Lantid helped us re-architect our institutional strategy and brought a level of analytical rigor we rarely see from local firms. They delivered on time, on brief, and on budget.",
    author: "Programme Director",
    role: "Federal Ministry · Abuja",
  },
  {
    quote:
      "From policy analysis to stakeholder engagement and the final brand rollout, Lantid was the only partner we needed. The work has already shaped two national programmes.",
    author: "Country Lead",
    role: "International Development Organization",
  },
  {
    quote:
      "Their M&E framework gave our board the clarity we'd been missing for years. Funding conversations are now grounded in evidence, not anecdote.",
    author: "Executive Director",
    role: "Pan-African Foundation",
  },
];

const homeJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Lantid Creative Limited",
    url: "https://lantid.com",
    description:
      "Premier consulting firm delivering management consulting, strategy, policy research, M&E, branding and technology solutions.",
    areaServed: ["Nigeria", "United Kingdom", "Africa", "Europe"],
    founder: { "@type": "Person", "name": "Damilola Yinusa" },
    foundingDate: "2023",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What does Lantid Creative do?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Lantid Creative is a multidisciplinary consulting firm offering management & business consulting, strategic planning, policy research, industrial policy, monitoring & evaluation, branding and technology solutions to government, development and enterprise clients.",
        },
      },
      {
        "@type": "Question",
        name: "Where is Lantid based?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Lantid Creative Limited is registered in Nigeria (RC 7215558) with headquarters in Abuja, and operates a UK entity, Lantid Creative UK Ltd (Co. No. 15609717), in Doncaster, England.",
        },
      },
      {
        "@type": "Question",
        name: "Who founded Lantid?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Lantid was founded in 2023 by Damilola Yinusa and now operates a portfolio of businesses and partnerships across consulting, branding and technology.",
        },
      },
    ],
  },
];

export default function Home() {
  return (
    <>
      <Seo
        title="Lantid Creative — Strategy, Research, Branding & Technology Consulting"
        description="Lantid Creative is a Nigeria & UK consulting firm bridging strategy, policy research, M&E, branding and technology — trusted by government, development and enterprise clients."
        path="/"
        jsonLd={homeJsonLd}
      />

      {/* ============ HERO ============ */}
      <section className="relative bg-background border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20 sm:pt-28 sm:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Founded 2023 · Abuja · Doncaster
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] text-foreground">
              Strategy, research, brand and technology — under one roof.
            </h1>

            <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Lantid Creative is a consulting firm helping governments, development organizations
              and ambitious enterprises move from strategy to execution.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Start a conversation
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Explore services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>


      {/* ============ PARTNERS / TRUST ============ */}
      <section className="border-y border-border bg-card/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-8">
            Trusted by government, development and enterprise clients
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {partners.map((p) => (
              <span
                key={p}
                className="text-sm sm:text-base font-semibold text-muted-foreground/70 hover:text-foreground transition-colors"
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
                Eight integrated practices that{" "}
                <span className="italic text-primary">work as one</span>
              </>
            }
            description="Most firms force you to stitch together a strategy house, a research outfit, a brand agency and a software shop. Lantid replaces all four — under one accountable team, with one delivery standard."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group relative rounded-2xl border border-border bg-card p-7 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary transition-colors">
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

      {/* ============ APPROACH ============ */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="How we work"
            title={
              <>
                A delivery process built for{" "}
                <span className="italic text-primary">certainty and impact</span>
              </>
            }
            description="Predictable timelines, transparent communication, and weekly progress reviews — so you always know where the work stands and what comes next."
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
                  A consulting partner that treats your mission like{" "}
                  <span className="italic text-primary">our own</span>
                </>
              }
              description="We work alongside ministers, country directors, founders and boards as embedded partners — not vendors. Every recommendation we make is one we'd be willing to implement ourselves."
            />
            <div className="mt-8 space-y-4">
              {[
                "Senior-led teams with proven public and private sector experience",
                "Evidence-based recommendations grounded in primary and secondary research",
                "Integrated delivery across strategy, research, brand and technology",
                "Rigorous quality assurance and international professional standards",
                "Knowledge transfer and capacity building built into every engagement",
                "Dual-entity delivery from Nigeria (RC 7215558) and the UK (Co. 15609717)",
              ].map((f) => (
                <div key={f} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground">{f}</span>
                </div>
              ))}
            </div>
            <Link
              to="/company"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
            >
              More about our story <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { Icon: Lightbulb, title: "Innovation-driven", desc: "Cutting-edge methods, digital tools, creative approaches" },
              { Icon: ShieldCheck, title: "Quality assured", desc: "Rigorous QA aligned to international standards" },
              { Icon: Layers, title: "Multidisciplinary", desc: "Strategy + research + brand + tech in one team" },
              { Icon: Users, title: "Embedded", desc: "Working alongside your teams, not over them" },
              { Icon: Globe2, title: "Local & global", desc: "Africa context, international best practice" },
              { Icon: Activity, title: "Outcome-led", desc: "Measured in impact, not deliverables alone" },
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

      {/* ============ SECTORS WE SERVE ============ */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Sectors we serve"
            title={<>From ministries to multinationals</>}
            description="We work across the institutions that shape economies and the enterprises that grow within them."
          />
          <div className="mt-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { Icon: Building2, label: "Government" },
              { Icon: Globe2, label: "Development" },
              { Icon: Briefcase, label: "Private Sector" },
              { Icon: Users, label: "Non-Profits" },
              { Icon: Award, label: "Academia" },
              { Icon: HeartPulse, label: "Healthcare" },
            ].map((s) => (
              <Link
                key={s.label}
                to="/industries"
                className="rounded-2xl border border-border bg-card p-5 text-center hover:border-primary/40 hover:-translate-y-0.5 transition-all"
              >
                <s.Icon className="h-6 w-6 text-primary mx-auto" />
                <div className="mt-3 text-sm font-semibold text-foreground">{s.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="py-24 sm:py-32 bg-card/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What clients say"
            title={
              <>
                The institutions that work with us, <span className="italic text-primary">come back</span>
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
                className="rounded-2xl border border-border bg-background p-7"
              >
                <Quote className="h-6 w-6 text-primary/60" />
                <div className="flex gap-1 my-4">
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
            Let's design the next chapter of your{" "}
            <span className="italic text-primary">institution</span>.
          </h2>
          <p className="mt-6 text-sidebar-foreground max-w-2xl mx-auto">
            Talk to a Lantid principal about your strategy, research, brand or technology
            challenge. We respond within one business day with a tailored scope and next steps.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3.5 text-sm font-semibold hover:shadow-2xl hover:shadow-primary/30 transition-all hover:gap-3"
            >
              Book a discovery call
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="tel:+2347074430088"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-sidebar-primary hover:bg-white/10 transition-all"
            >
              +234 707 443 0088
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
