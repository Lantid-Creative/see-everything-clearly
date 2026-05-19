import { Link } from "react-router-dom";
import {
  Target,
  Eye,
  Award,
  Globe2,
  Users,
  ArrowRight,
  Lightbulb,
  Handshake,
  Layers,
  Sprout,
  Sparkles,
  Briefcase,
  TrendingUp,
  Map,
  Search,
  Factory,
  BarChart3,
  Palette,
  Cpu,
  Building2,
  HeartPulse,
  GraduationCap,
  ShieldCheck,
  Mail,
  MapPin,
} from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Seo } from "@/components/site/Seo";


const services = [
  {
    Icon: Briefcase,
    title: "Management Consulting",
    desc: "Organizational restructuring, change management, process optimization, leadership development, performance improvement, and risk mitigation.",
  },
  {
    Icon: TrendingUp,
    title: "Business Consulting",
    desc: "Growth strategy, market entry, financial advisory, operations management, corporate governance, M&A support, and feasibility studies.",
  },
  {
    Icon: Map,
    title: "Strategic Planning",
    desc: "Long-term plan development, competitive positioning, scenario planning, resource allocation, and implementation roadmaps.",
  },
  {
    Icon: Search,
    title: "Policy Research",
    desc: "Policy analysis, stakeholder engagement, comparative studies, legislative review, and evidence-based public policy support.",
  },
  {
    Icon: Factory,
    title: "Industrial Policy Development",
    desc: "Sector mapping, value chain strategies, investment frameworks, manufacturing competitiveness, and local content policies.",
  },
  {
    Icon: BarChart3,
    title: "Monitoring & Evaluation",
    desc: "Results-based frameworks, impact evaluation, theory of change, performance measurement, and donor compliance systems.",
  },
  {
    Icon: Palette,
    title: "Branding & Brand Development",
    desc: "Brand strategy, visual identity, corporate communications, digital presence, brand guidelines, and rebranding initiatives.",
  },
  {
    Icon: Cpu,
    title: "IT & Technology Solutions",
    desc: "Custom software, mobile apps, web platforms, cloud migration, cybersecurity, system integration, and IT project management.",
  },
];

const approach = [
  { Icon: Search, title: "Evidence-Based Solutions", desc: "Recommendations grounded in rigorous research, data analysis, and global best practices." },
  { Icon: Handshake, title: "Collaborative Partnership", desc: "We work as strategic partners — embedded in your culture, challenges, and aspirations." },
  { Icon: Layers, title: "Integrated Methodology", desc: "A multidisciplinary team blending consulting expertise with creative capability." },
  { Icon: Sprout, title: "Sustainable Impact", desc: "We build long-term capacity and systems that deliver value beyond project completion." },
  { Icon: Lightbulb, title: "Innovation-Driven", desc: "Cutting-edge methodologies, digital tools, and creative approaches to complex challenges." },
  { Icon: ShieldCheck, title: "Quality Assurance", desc: "Rigorous quality control and adherence to international professional standards." },
];

const sectors = [
  { Icon: Building2, title: "Government Agencies", desc: "Federal, state, and local institutions." },
  { Icon: Globe2, title: "Development Organizations", desc: "INGOs, multilaterals, and development agencies." },
  { Icon: Briefcase, title: "Private Sector", desc: "Corporations seeking strategy and brand growth." },
  { Icon: Users, title: "Non-Profit Organizations", desc: "Civil society organizations and foundations." },
  { Icon: GraduationCap, title: "Academic & Research", desc: "Universities and research institutions." },
  { Icon: HeartPulse, title: "Healthcare", desc: "Public and private healthcare providers." },
];

const milestones = [
  { year: "2023", text: "Lantid Creative Limited founded by Damilola Yinusa in Abuja, Nigeria (RC 7215558)." },
  { year: "2024", text: "UK entity Lantid Creative UK Ltd incorporated (Co. No. 15609717) — extending delivery into Europe." },
  { year: "2025", text: "Expanded partner network across government, development, and private sector clients." },
  { year: "2026", text: "Operating a portfolio of businesses and strategic partnerships across consulting, branding, and technology." },
];

export default function Company() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Lantid Creative",
    url: "https://lantid.com/company",
    mainEntity: {
      "@type": "Organization",
      name: "Lantid Creative Limited",
      foundingDate: "2023",
      founder: { "@type": "Person", "name": "Damilola Yinusa" },
    },
  };

  return (
    <>
      <Seo
        title="About Lantid Creative — Founded 2023 by Damilola Yinusa | Abuja & UK"
        description="Lantid Creative Limited was founded in 2023 by Damilola Yinusa. Registered in Nigeria (RC 7215558) and the UK (Co. No. 15609717), we operate a portfolio of businesses and partnerships across strategy, research, branding and technology."
        path="/company"
        jsonLd={jsonLd}
      />

      {/* HERO */}
      <section className="bg-sidebar text-sidebar-primary py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[140px]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sidebar-accent border border-sidebar-border text-xs font-medium mb-6">
            Founded 2023 · Abuja & Doncaster
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05]">
            Strategic thinking meets{" "}
            <span className="italic bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              creative innovation
            </span>
            .
          </h1>
          <p className="mt-6 text-base sm:text-lg text-sidebar-primary/70 max-w-2xl mx-auto leading-relaxed">
            Lantid Creative Limited is a premier consulting firm delivering comprehensive solutions
            that drive organizational excellence and sustainable development outcomes — for government,
            development, and enterprise clients.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs">
            <span className="px-3 py-1.5 rounded-full bg-sidebar-accent border border-sidebar-border">
              Nigeria Reg. No. 7215558
            </span>
            <span className="px-3 py-1.5 rounded-full bg-sidebar-accent border border-sidebar-border">
              UK Reg. No. 15609717
            </span>
          </div>
        </div>
      </section>

      {/* ABOUT / FOUNDER */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12">
          <div>
            <SectionHeading
              align="left"
              eyebrow="About us"
              title={<>A multidisciplinary partner for transformative outcomes</>}
            />
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Lantid Creative Limited bridges strategic thinking with creative innovation. Our
              multidisciplinary approach combines deep analytical capability with creative brand
              development to help organizations achieve their strategic objectives while building
              lasting impact.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Founded on the principles of <span className="text-foreground font-medium">excellence, integrity, and innovation</span>,
              we serve as a trusted partner to government agencies, development organizations, NGOs,
              and private sector clients seeking transformative solutions and strategic guidance.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> Founder
            </div>
            <h3 className="mt-5 font-serif text-3xl text-foreground">Damilola Yinusa</h3>
            <p className="mt-2 text-sm text-muted-foreground">Founder & Principal, Lantid Creative Limited</p>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Lantid was founded in 2023 by Damilola Yinusa with a clear conviction: that
              organizations across Africa and beyond deserve strategy, research, and creative
              execution at the standard of the world's best firms. Since then, Lantid has grown
              into a portfolio of businesses — built, operated, and partnered — across consulting,
              branding, and technology.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl border border-border p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Founded</div>
                <div className="mt-1 font-serif text-2xl text-foreground">2023</div>
              </div>
              <div className="rounded-xl border border-border p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Entities</div>
                <div className="mt-1 font-serif text-2xl text-foreground">NG · UK</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8">
          <div className="rounded-3xl border border-border bg-card p-10">
            <Target className="h-8 w-8 text-primary" />
            <h2 className="mt-5 font-serif text-3xl text-foreground">Mission</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              To deliver integrated consulting, research, and creative solutions that drive
              organizational excellence and sustainable development outcomes for our clients —
              measured in real-world impact, not deliverables alone.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-10">
            <Eye className="h-8 w-8 text-primary" />
            <h2 className="mt-5 font-serif text-3xl text-foreground">Vision</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              A continent where every institution — public, private, and civic — has access to
              strategic clarity and a compelling brand presence that supports long-term success.
            </p>
          </div>
        </div>
      </section>

      {/* CORE SERVICES */}
      <section className="py-24 bg-card/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our core services"
            title={<>Eight integrated practices, one trusted partner</>}
            description="From management consulting to industrial policy and technology, our practices work together to deliver holistic solutions."
          />
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s) => (
              <div key={s.title} className="rounded-2xl border border-border bg-background p-7 hover:border-primary/40 transition-colors">
                <s.Icon className="h-7 w-7 text-primary" />
                <h3 className="mt-5 font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APPROACH */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our approach"
            title={<>How we work with you</>}
          />
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approach.map((a) => (
              <div key={a.title} className="rounded-2xl border border-border bg-card p-7">
                <a.Icon className="h-7 w-7 text-primary" />
                <h3 className="mt-5 font-semibold text-foreground">{a.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTORS */}
      <section className="py-24 bg-card/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Client sectors"
            title={<>Trusted across public, private, and civic sectors</>}
          />
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectors.map((s) => (
              <div key={s.title} className="rounded-2xl border border-border bg-background p-7">
                <s.Icon className="h-7 w-7 text-primary" />
                <h3 className="mt-5 font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MILESTONES */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Milestones" title={<>Built and partnered, since 2023</>} />
          <div className="mt-14 space-y-6">
            {milestones.map((m, i) => (
              <div key={m.year} className="flex gap-6">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-serif font-semibold shrink-0">
                    {m.year.slice(2)}
                  </div>
                  {i !== milestones.length - 1 && (
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 w-px h-full bg-border" />
                  )}
                </div>
                <div className="pb-8">
                  <div className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {m.year}
                  </div>
                  <p className="mt-2 text-foreground leading-relaxed">{m.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFFICES */}
      <section className="py-20 bg-card/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Our offices" title={<>Operating across Nigeria and the United Kingdom</>} />
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-border bg-background p-8">
              <MapPin className="h-7 w-7 text-primary" />
              <h3 className="mt-4 font-serif text-2xl text-foreground">Lantid Creative LTD</h3>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">Nigeria HQ · RC 7215558</p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                No 14 Greenline, Festrut Estate, Katampe Main, Abuja, Nigeria.
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-background p-8">
              <MapPin className="h-7 w-7 text-primary" />
              <h3 className="mt-4 font-serif text-2xl text-foreground">Lantid Creative UK LTD</h3>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">United Kingdom · Co. No. 15609717</p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                39 Davy Road, New Rossington, Doncaster, England, DN11 0LQ.
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
            <a href="mailto:hi@lantid.com" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-primary/50 transition-colors">
              <Mail className="h-4 w-4 text-primary" /> hi@lantid.com
            </a>
            <a href="https://www.lantid.com" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-primary/50 transition-colors">
              <Globe2 className="h-4 w-4 text-primary" /> www.lantid.com
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-sidebar text-sidebar-primary text-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Award className="h-10 w-10 text-primary mx-auto" />
          <h2 className="mt-6 font-serif text-4xl sm:text-5xl tracking-tight">
            Transforming organizations through strategic excellence and creative innovation.
          </h2>
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
