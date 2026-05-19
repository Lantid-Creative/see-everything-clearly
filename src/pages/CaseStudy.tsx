import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Clock, Shield, Zap } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";

const cases = [
  {
    industry: "Fintech",
    title: "Rebuilt a regional trading platform handling $4B+ daily volume",
    client: "Mena Capital",
    metric: { value: "60%", label: "lower latency" },
    desc: "Migrated a 12-year-old monolith to an event-driven Rust + Kotlin architecture with sub-millisecond order routing.",
    stack: ["Rust", "Kotlin", "Kafka", "Postgres", "K8s"],
    color: "from-emerald-500/20 to-emerald-500/0",
  },
  {
    industry: "Healthcare",
    title: "Telehealth platform for 1.2M patients across 6 countries",
    client: "Helix Health",
    metric: { value: "4 months", label: "to go-live" },
    desc: "End-to-end HIPAA-compliant platform: scheduling, video, e-prescriptions, and insurance integration.",
    stack: ["React Native", "Node.js", "WebRTC", "AWS"],
    color: "from-rose-500/20 to-rose-500/0",
  },
  {
    industry: "Logistics",
    title: "AI route optimization saving 2.3M km annually",
    client: "Logix Group",
    metric: { value: "$14M", label: "annual savings" },
    desc: "Custom multi-vehicle routing engine combined with predictive ETAs and fleet telematics dashboard.",
    stack: ["Python", "Go", "OR-Tools", "ClickHouse"],
    color: "from-blue-500/20 to-blue-500/0",
  },
  {
    industry: "Retail",
    title: "Headless commerce platform with AI personalization",
    client: "Lumi Retail Group",
    metric: { value: "32%", label: "conversion lift" },
    desc: "Replaced legacy storefront with composable commerce, real-time inventory, and ML recommendations.",
    stack: ["Next.js", "Shopify", "Algolia", "Vercel"],
    color: "from-amber-500/20 to-amber-500/0",
  },
];

const highlights = [
  { Icon: TrendingUp, value: "$300M+", label: "Client revenue impacted" },
  { Icon: Clock, value: "100+", label: "Production launches" },
  { Icon: Shield, value: "0", label: "Major security incidents" },
  { Icon: Zap, value: "98%", label: "On-time delivery rate" },
];

export default function CaseStudy() {
  return (
    <>
      <section className="bg-sidebar text-sidebar-primary py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[140px]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sidebar-accent border border-sidebar-border text-xs font-medium mb-6">
            Case Studies
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05]">
            Work that moves the{" "}
            <span className="italic bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              business needle
            </span>
          </h1>
        </div>
      </section>

      <section className="py-12 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {highlights.map((h) => (
            <div key={h.label} className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <h.Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-serif text-2xl text-foreground">{h.value}</div>
                <div className="text-xs text-muted-foreground">{h.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {cases.map((c, i) => (
            <article
              key={i}
              className="group relative rounded-3xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
              <div className="relative p-8 lg:p-12 grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {c.industry} · {c.client}
                  </div>
                  <h2 className="mt-3 font-serif text-2xl sm:text-3xl text-foreground tracking-tight leading-tight">
                    {c.title}
                  </h2>
                  <p className="mt-4 text-muted-foreground leading-relaxed max-w-2xl">{c.desc}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {c.stack.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1 rounded-full bg-background border border-border text-xs font-medium text-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col justify-center items-start lg:items-end lg:text-right">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Outcome
                  </div>
                  <div className="mt-2 font-serif text-5xl sm:text-6xl bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                    {c.metric.value}
                  </div>
                  <div className="mt-1 text-sm text-foreground">{c.metric.label}</div>
                  <Link
                    to="/contact"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
                  >
                    Discuss similar work <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="py-20 bg-sidebar text-sidebar-primary text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title={
              <span className="text-sidebar-primary">
                Your project,{" "}
                <span className="italic text-primary">our next case study</span>
              </span>
            }
          />
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3.5 text-sm font-semibold hover:shadow-2xl hover:shadow-primary/30 transition-all hover:gap-3 group"
          >
            Start a conversation
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </>
  );
}
