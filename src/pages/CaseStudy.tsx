import { Link } from "react-router-dom";
import { ArrowRight, TrendingUp, Clock, Shield, Zap, Quote } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Seo } from "@/components/site/Seo";

const cases = [
  {
    industry: "Government · Industrial Policy",
    title: "Designing a national value-chain strategy for a federal economic agency",
    client: "Federal Economic Development Agency",
    metric: { value: "5-year", label: "national strategy adopted" },
    challenge:
      "A federal agency needed a defensible, evidence-based industrial strategy spanning eight priority sectors — with stakeholder buy-in across ministries, the private sector and development partners.",
    solution:
      "Lantid led a six-month engagement combining sector mapping, value-chain analysis, comparative international benchmarking, stakeholder consultations across three regions, and policy drafting. We delivered a board-ready strategy, an implementation roadmap, and an M&E framework.",
    impact: [
      "Strategy formally adopted at executive level",
      "Implementation roadmap with quarterly milestones",
      "Investment promotion framework live within 90 days",
    ],
    stack: ["Sector mapping", "Stakeholder engagement", "Policy drafting", "M&E design"],
    color: "from-emerald-500/20 to-emerald-500/0",
  },
  {
    industry: "Development · M&E",
    title: "Building a results-based M&E framework for a multi-country health programme",
    client: "International Development Organization",
    metric: { value: "6 countries", label: "harmonized reporting" },
    challenge:
      "A multi-country health programme was generating activity reports without a coherent picture of impact, putting future funding rounds at risk.",
    solution:
      "We designed a unified theory of change, results framework and data collection system across all six countries. Lantid also trained in-country teams on the framework and delivered a quarterly reporting dashboard.",
    impact: [
      "Donor-ready impact reporting across countries",
      "30% faster quarterly reporting cycle",
      "Renewal funding secured for the next phase",
    ],
    stack: ["Theory of change", "Results framework", "Data systems", "Capacity building"],
    color: "from-blue-500/20 to-blue-500/0",
  },
  {
    industry: "Private Sector · Branding & Strategy",
    title: "Rebranding and repositioning a regional financial services group",
    client: "West-African Financial Services Group",
    metric: { value: "Top 3", label: "brand recall in market" },
    challenge:
      "A multi-subsidiary financial services group had grown through acquisition but presented fragmented brands, conflicting positioning and inconsistent customer experience.",
    solution:
      "Lantid led a brand and strategy engagement: stakeholder research, brand architecture, new visual identity system, messaging framework, digital rollout and internal change communications across all subsidiaries.",
    impact: [
      "Single coherent brand across all entities",
      "Measurable lift in customer recall and trust",
      "Internal alignment ahead of expansion round",
    ],
    stack: ["Brand strategy", "Identity system", "Comms architecture", "Change management"],
    color: "from-amber-500/20 to-amber-500/0",
  },
  {
    industry: "Government · Technology",
    title: "Digitising a citizen-facing licensing platform for a state government",
    client: "State Government Agency",
    metric: { value: "70%", label: "reduction in processing time" },
    challenge:
      "A state agency was processing thousands of citizen licences manually, creating delays, revenue leakage and citizen frustration.",
    solution:
      "Lantid designed and built a secure end-to-end licensing platform with online application, payment integration, document upload, automated workflow routing and a public dashboard — handed over with full documentation and team training.",
    impact: [
      "70% faster average processing time",
      "Significant uplift in transparent revenue capture",
      "Citizen satisfaction scores up across the board",
    ],
    stack: ["Web platform", "Payments", "Workflow automation", "Capacity transfer"],
    color: "from-purple-500/20 to-purple-500/0",
  },
];

const highlights = [
  { Icon: TrendingUp, value: "8", label: "Integrated practices" },
  { Icon: Clock, value: "1 business day", label: "Response SLA" },
  { Icon: Shield, value: "NG · UK", label: "Dual-entity delivery" },
  { Icon: Zap, value: "100%", label: "Senior-led teams" },
];

export default function CaseStudy() {
  const jsonLd = cases.map((c) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.title,
    about: c.industry,
    author: { "@type": "Organization", name: "Lantid Creative Limited" },
  }));

  return (
    <>
      <Seo
        title="Case Studies — Strategy, Research, Brand & Tech Outcomes | Lantid Creative"
        description="Real Lantid Creative engagements across government, development and private sector — from national industrial strategies to multi-country M&E frameworks, rebrands and citizen-facing digital platforms."
        path="/case-study"
        jsonLd={jsonLd}
      />

      <section className="bg-background text-foreground border-y border-border py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[140px]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted border border-border text-xs font-medium mb-6">
            Case studies
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05]">
            Work that moves the{" "}
            <span className="italic bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              institutional needle
            </span>
          </h1>
          <p className="mt-8 text-base sm:text-lg text-sidebar-foreground max-w-3xl mx-auto leading-relaxed">
            A selection of engagements drawn from government, development and private sector
            partners. Each one combines several Lantid practices into a coherent outcome — not a
            stack of deliverables.
          </p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {cases.map((c, i) => (
            <article
              key={i}
              className="group relative rounded-3xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
              <div className="relative p-8 lg:p-12 grid lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                  <div className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {c.industry} · {c.client}
                  </div>
                  <h2 className="mt-3 font-serif text-2xl sm:text-3xl text-foreground tracking-tight leading-tight">
                    {c.title}
                  </h2>

                  <div className="mt-6 space-y-5">
                    <div>
                      <div className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-1">
                        Challenge
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{c.challenge}</p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-1">
                        Lantid's approach
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{c.solution}</p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-2">
                        Impact
                      </div>
                      <ul className="space-y-1.5">
                        {c.impact.map((p) => (
                          <li key={p} className="flex items-start gap-2 text-sm text-foreground">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

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

                <div className="flex flex-col justify-center items-start lg:items-end lg:text-right border-t lg:border-t-0 lg:border-l border-border pt-8 lg:pt-0 lg:pl-10">
                  <Quote className="h-6 w-6 text-primary/50" />
                  <div className="mt-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Headline outcome
                  </div>
                  <div className="mt-2 font-serif text-4xl sm:text-5xl bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
                    {c.metric.value}
                  </div>
                  <div className="mt-1 text-sm text-foreground">{c.metric.label}</div>
                  <Link
                    to="/contact"
                    className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
                  >
                    Discuss a similar engagement <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="py-20 bg-background text-foreground border-y border-border text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title={
              <span className="text-foreground">
                Your mandate,{" "}
                <span className="italic text-primary">our next case study</span>
              </span>
            }
            description="If you have a strategy, research, brand or technology challenge worth doing properly, let's scope it together."
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
