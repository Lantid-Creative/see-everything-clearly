import { Link } from "react-router-dom";
import {
  Building2, Globe2, Briefcase, Users, GraduationCap, HeartPulse, Banknote, Factory,
  ArrowRight, CheckCircle2, Sparkles,
} from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Seo } from "@/components/site/Seo";

const items = [
  {
    id: "government",
    Icon: Building2,
    title: "Government & Public Sector",
    short: "Federal, state and local institutions",
    long: "We partner with ministries, departments, agencies and sub-national governments to design strategies, draft policy, modernise operations and build the digital infrastructure of accountable government.",
    services: ["Strategic planning", "Policy research", "Industrial policy", "M&E", "Technology solutions"],
    color: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    id: "development",
    Icon: Globe2,
    title: "Development Organizations",
    short: "Multilaterals, bilaterals, INGOs",
    long: "From programme design to impact evaluation, Lantid supports development partners delivering ambitious mandates across health, education, livelihoods, gender, climate and governance.",
    services: ["M&E frameworks", "Impact evaluation", "Theory of change", "Stakeholder engagement", "Capacity building"],
    color: "from-blue-500/20 to-blue-500/5",
  },
  {
    id: "private",
    Icon: Briefcase,
    title: "Private Sector Enterprises",
    short: "Corporates & high-growth companies",
    long: "We help ambitious businesses chart growth strategies, enter new markets, raise capital, sharpen their brand and digitise their operations — at the standard expected by international investors.",
    services: ["Business consulting", "M&A support", "Brand development", "Digital transformation", "Feasibility studies"],
    color: "from-amber-500/20 to-amber-500/5",
  },
  {
    id: "nonprofit",
    Icon: Users,
    title: "Non-Profit Organizations",
    short: "Civil society & foundations",
    long: "Strategy, governance, brand and technology support for foundations and civil society organizations that want to amplify impact and steward funder capital responsibly.",
    services: ["Strategic planning", "Brand & comms", "Governance", "Programme M&E", "Digital tools"],
    color: "from-purple-500/20 to-purple-500/5",
  },
  {
    id: "academia",
    Icon: GraduationCap,
    title: "Academic & Research Institutions",
    short: "Universities, think tanks, research bodies",
    long: "We collaborate with academic and research institutions on policy research, institutional strategy, digital infrastructure and brand positioning to extend their influence and reach.",
    services: ["Research design", "Policy analysis", "Strategy", "Brand identity", "Knowledge platforms"],
    color: "from-indigo-500/20 to-indigo-500/5",
  },
  {
    id: "healthcare",
    Icon: HeartPulse,
    title: "Healthcare",
    short: "Public & private healthcare providers",
    long: "From hospital management consulting to digital health platforms and public health programme evaluation, we bring strategic and technical capability to one of the most consequential sectors of our time.",
    services: ["Operational strategy", "Health programme M&E", "Digital health platforms", "Brand & comms"],
    color: "from-rose-500/20 to-rose-500/5",
  },
  {
    id: "financial",
    Icon: Banknote,
    title: "Financial Services",
    short: "Banks, fintech, insurance",
    long: "Strategic positioning, growth advisory, brand and technology support for financial institutions navigating regulation, digital disruption and ambitious growth agendas.",
    services: ["Growth strategy", "Digital platforms", "Brand systems", "Compliance frameworks"],
    color: "from-cyan-500/20 to-cyan-500/5",
  },
  {
    id: "manufacturing",
    Icon: Factory,
    title: "Manufacturing & Industry",
    short: "Producers, exporters, industrial clusters",
    long: "We help manufacturers and industrial actors improve competitiveness, navigate local content policy, modernise operations and build the technology backbones of Industry 4.0.",
    services: ["Operations consulting", "Local content strategy", "Industrial policy", "Tech modernisation"],
    color: "from-orange-500/20 to-orange-500/5",
  },
];

export default function Industries() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.title,
      description: it.long,
    })),
  };

  return (
    <>
      <Seo
        title="Industries We Serve — Government, Development, Enterprise | Lantid Creative"
        description="Lantid Creative serves government agencies, development organizations, private enterprises, non-profits, academia, healthcare, financial services and manufacturing — across Africa, the UK and Europe."
        path="/industries"
        jsonLd={jsonLd}
      />

      <section className="bg-background text-foreground border-y border-border py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[140px]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted border border-border text-xs font-medium mb-6">
            <Sparkles className="h-3 w-3 text-primary" /> Industries
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05]">
            Deep expertise across{" "}
            <span className="italic bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              the sectors that shape economies
            </span>
          </h1>
          <p className="mt-8 text-base sm:text-lg text-sidebar-foreground max-w-3xl mx-auto leading-relaxed">
            From federal ministries to multilateral programmes, from healthcare systems to high-growth
            private companies — Lantid Creative brings strategy, research, brand and technology to the
            institutions that move countries forward.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((it) => (
            <article
              key={it.id}
              id={it.id}
              className="group relative rounded-3xl border border-border bg-card p-8 overflow-hidden hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${it.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative">
                <div className="flex items-start gap-5">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                    <it.Icon className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl text-foreground leading-tight">{it.title}</h2>
                    <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      {it.short}
                    </p>
                  </div>
                </div>
                <p className="mt-6 text-muted-foreground leading-relaxed">{it.long}</p>
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-3">
                    Services we deliver here
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {it.services.map((s) => (
                      <li key={s} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  to="/contact"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
                >
                  Discuss work in this sector <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="py-20 bg-card/40 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading
            title={<>Don't see your sector?</>}
            description="Lantid has supported clients in commodities, infrastructure, agriculture, creative industries, energy and the diaspora economy. If your mandate requires strategic clarity and disciplined execution, we'd like to hear from you."
          />
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3.5 text-sm font-semibold hover:bg-primary/90 transition-all hover:gap-3 group"
          >
            Tell us about your sector
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </>
  );
}
