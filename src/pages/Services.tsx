import { Link } from "react-router-dom";
import {
  Briefcase, TrendingUp, Map, Search, Factory, BarChart3, Palette, Cpu, ShieldCheck,
  ArrowRight, CheckCircle2, Sparkles,
} from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { motion } from "framer-motion";
import { Seo } from "@/components/site/Seo";

const groups = [
  {
    id: "management",
    icon: Briefcase,
    title: "Management Consulting",
    desc: "Lantid's management consulting practice helps leaders translate vision into operating reality. We work shoulder-to-shoulder with executives, permanent secretaries and country directors to redesign organizations, sharpen decision-making and build the muscle to execute. Our approach blends classic consulting frameworks with embedded coaching — so the capability we install outlasts our engagement.",
    bullets: [
      "Organizational design & restructuring",
      "Change management & transformation",
      "Process optimization & workflow analysis",
      "Leadership development & capacity building",
      "Performance improvement strategies",
      "Risk assessment & mitigation planning",
    ],
    outcomes: [
      "Clearer accountability and faster decisions",
      "Higher staff engagement and retention",
      "Measurable productivity and cost improvements",
    ],
  },
  {
    id: "business",
    icon: TrendingUp,
    title: "Business Consulting",
    desc: "We help ambitious businesses grow profitably, enter new markets and prepare for institutional capital. From early-stage feasibility studies to mature-stage M&A support, our business consulting team brings the financial rigor, governance discipline and operating know-how that turns plans into compounding enterprise value.",
    bullets: [
      "Business development & growth strategy",
      "Market entry & expansion planning",
      "Financial analysis & investment advisory",
      "Operations management & efficiency",
      "Corporate governance & compliance",
      "Mergers, acquisitions & exit support",
      "Feasibility studies & business cases",
    ],
    outcomes: [
      "Investor-ready strategy and financials",
      "Stronger margins and cleaner operations",
      "De-risked expansion into new markets",
    ],
  },
  {
    id: "strategy",
    icon: Map,
    title: "Strategic Planning",
    desc: "A strategy is only as good as its ability to be executed. We design long-range strategic plans rooted in evidence, sharpened by scenarios and translated into roadmaps, KPIs and review rituals your team will actually live by. From five-year national plans to corporate three-year horizons, we engineer strategy that survives contact with reality.",
    bullets: [
      "Long-term strategic plan development",
      "Market analysis & competitive positioning",
      "Scenario planning & risk analysis",
      "Resource allocation & optimization",
      "Implementation roadmaps & milestones",
      "Strategic review & adaptation frameworks",
    ],
    outcomes: [
      "A clear, prioritized strategic narrative",
      "Aligned leadership and resourced execution",
      "Quarterly cadence that drives accountability",
    ],
  },
  {
    id: "research",
    icon: Search,
    title: "Policy Research",
    desc: "Better policy starts with better evidence. Our policy research practice combines quantitative analysis, qualitative fieldwork and comparative international study to produce work that withstands scrutiny — and changes minds. We support ministries, parliaments, regulators and development partners with rigorous, decision-ready research.",
    bullets: [
      "Policy analysis & impact assessment",
      "Stakeholder consultation & engagement",
      "Comparative international policy studies",
      "Legislative review & recommendations",
      "Public policy development support",
      "Research methodology design",
    ],
    outcomes: [
      "Evidence base trusted by policymakers",
      "Stakeholder buy-in across the system",
      "Policies that survive political transitions",
    ],
  },
  {
    id: "industrial",
    icon: Factory,
    title: "Industrial Policy Development",
    desc: "Industrial growth doesn't happen by accident. Lantid helps governments and economic development bodies design industrial policies that unlock manufacturing competitiveness, value-chain depth and export capacity. We map sectors, model interventions and design the incentive architectures that move capital into productive use.",
    bullets: [
      "Industrial sector analysis & mapping",
      "Value chain development strategies",
      "Investment promotion & incentive design",
      "Technology transfer & innovation policy",
      "Manufacturing competitiveness assessments",
      "Industrial cluster development",
      "Export promotion strategies",
      "Local content development policies",
    ],
    outcomes: [
      "Coherent sectoral growth strategies",
      "Higher-quality private investment",
      "Measurable progress on jobs and exports",
    ],
  },
  {
    id: "me",
    icon: BarChart3,
    title: "Monitoring & Evaluation",
    desc: "Donor funds and public budgets demand more than activity reports — they demand evidence of impact. Our M&E practice designs results-based frameworks, theories of change and learning systems that turn programmes into engines of continuous improvement. We're trusted by foundations, multilaterals and government agencies to evaluate what works and explain why.",
    bullets: [
      "Results-based monitoring frameworks",
      "Impact evaluation & assessment",
      "Theory of change development",
      "Data collection & analysis systems",
      "Performance measurement & reporting",
      "Donor compliance & adaptive management",
      "Learning & knowledge-sharing systems",
    ],
    outcomes: [
      "Defensible impact evidence for funders",
      "Real-time programme course-correction",
      "Cleaner audits and faster disbursements",
    ],
  },
  {
    id: "branding",
    icon: Palette,
    title: "Branding & Brand Development",
    desc: "Institutions earn trust through consistency. Lantid's brand practice crafts identities, narratives and digital ecosystems that signal credibility and stand the test of time — for ministries, programmes, foundations and private companies. We don't do logos in isolation; we build the brand systems that make every touchpoint pull in the same direction.",
    bullets: [
      "Brand strategy & positioning",
      "Visual identity design & systems",
      "Corporate communications & messaging",
      "Digital brand presence & management",
      "Brand guidelines & implementation",
      "Rebranding & brand refresh initiatives",
    ],
    outcomes: [
      "A brand that's instantly recognisable",
      "Consistent communications across teams",
      "Higher engagement and stakeholder trust",
    ],
  },
  {
    id: "tech",
    icon: Cpu,
    title: "IT & Technology Solutions",
    desc: "Modern institutions are software-defined. Lantid delivers custom software, mobile apps, cloud infrastructure, cybersecurity and systems integration that digitise the back office and the citizen-facing experience alike. Built to international engineering standards, secured by default, and designed to be handed over with documentation your team can own.",
    bullets: [
      "Custom software & mobile applications",
      "Database design & management systems",
      "Web development & e-commerce platforms",
      "IT infrastructure setup & optimization",
      "Cloud computing & migration services",
      "Cybersecurity solutions & assessment",
      "System integration & automation",
      "IT project management & support",
    ],
    outcomes: [
      "Digitised processes that scale",
      "Secure-by-design platforms",
      "Tech assets you fully own and operate",
    ],
  },
];

const faqs = [
  {
    q: "What size of organization do you typically work with?",
    a: "We serve federal and state government agencies, multilateral and bilateral development organizations, large foundations, and mid-to-large private enterprises — typically those with the budget and ambition to commission strategic, multi-disciplinary work.",
  },
  {
    q: "Do you only operate in Nigeria?",
    a: "No. Lantid Creative Limited is headquartered in Abuja, Nigeria (RC 7215558) and operates through Lantid Creative UK Ltd (Co. No. 15609717) in Doncaster, England. We deliver engagements across Africa, the UK and Europe.",
  },
  {
    q: "Can you bundle multiple services in one engagement?",
    a: "Yes — that's our advantage. Many of our engagements combine strategy, research, brand and technology under a single integrated team, which reduces handover risk and delivers a more coherent outcome than stitching together multiple vendors.",
  },
  {
    q: "How quickly can you start?",
    a: "Discovery conversations usually happen within one business day of contact. Depending on the scope, kickoff typically follows within two to four weeks of a signed engagement.",
  },
];

export default function Services() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <Seo
        title="Services — Strategy, Research, Branding & Technology | Lantid Creative"
        description="Explore Lantid Creative's eight integrated consulting practices: management consulting, business consulting, strategic planning, policy research, industrial policy, M&E, branding and technology solutions."
        path="/services"
        jsonLd={jsonLd}
      />

      <section className="bg-background text-foreground border-y border-border py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[140px]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted border border-border text-xs font-medium mb-6">
            <Sparkles className="h-3 w-3 text-primary" /> Services
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05]">
            Everything you need to{" "}
            <span className="italic bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              strategize, build and scale
            </span>
          </h1>
          <p className="mt-8 text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Eight integrated practices, one delivery standard. Engage a single capability or commission
            a multidisciplinary team — every Lantid engagement is led by experienced practitioners and
            grounded in evidence, not opinion.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-xs">
            {groups.map((g) => (
              <a
                key={g.id}
                href={`#${g.id}`}
                className="px-3 py-1.5 rounded-full bg-muted border border-border hover:border-primary/40 transition-colors text-foreground"
              >
                {g.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          {groups.map((g, i) => (
            <motion.div
              key={g.id}
              id={g.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={`grid lg:grid-cols-2 gap-10 items-start ${
                i % 2 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="rounded-3xl border border-border bg-card p-10 lg:p-14 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                <div className="relative">
                  <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mb-6">
                    <g.icon className="h-6 w-6" />
                  </div>
                  <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                    0{i + 1} / Practice
                  </div>
                  <div className="font-serif text-3xl text-foreground">{g.title}</div>
                  <div className="mt-8 pt-8 border-t border-border">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                      Typical outcomes
                    </div>
                    <ul className="space-y-2.5">
                      {g.outcomes.map((o) => (
                        <li key={o} className="flex items-start gap-2 text-sm text-foreground">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-foreground leading-tight">
                  {g.title}
                </h2>
                <p className="mt-5 text-muted-foreground leading-relaxed">{g.desc}</p>
                <div className="mt-8">
                  <div className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-3">
                    What we deliver
                  </div>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {g.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /> {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  to="/contact"
                  className="mt-10 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:bg-primary/90 transition-all hover:gap-3 group"
                >
                  Discuss your {g.title.toLowerCase()} need
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQs for SEO */}
      <section className="py-24 bg-card/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Common questions"
            title={<>Answers before you ask</>}
            description="A few of the questions we hear most often from prospective clients. Don't see yours? Reach out — we respond within one business day."
          />
          <div className="mt-12 space-y-4">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-border bg-background p-6 open:border-primary/30 transition-colors"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                  <span className="font-semibold text-foreground">{f.q}</span>
                  <span className="h-7 w-7 rounded-full border border-border flex items-center justify-center text-primary group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background text-foreground border-y border-border text-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-4xl sm:text-5xl tracking-tight">
            Ready to scope your engagement?
          </h2>
          <p className="mt-6 text-muted-foreground">
            Tell us what you're working on and we'll come back within one business day with a clear
            scope, timeline and indicative investment.
          </p>
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
