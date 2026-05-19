import { Link } from "react-router-dom";
import { Target, Eye, Heart, Award, Globe2, Users, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";

const values = [
  { Icon: Target, title: "Outcome-obsessed", desc: "Every sprint ties back to a business KPI. No vanity velocity." },
  { Icon: Heart, title: "Craft over speed", desc: "Quality compounds. We refuse to ship code we wouldn't operate." },
  { Icon: Globe2, title: "Globally distributed", desc: "Pods in Dubai, London, Lagos, and Singapore — follow-the-sun delivery." },
  { Icon: Users, title: "Senior-only pods", desc: "Median 10+ years experience. No body-shop economics." },
];

const milestones = [
  { year: "2013", text: "Founded in Dubai with a single client and a single principle: ship what you'd be proud to operate." },
  { year: "2016", text: "Crossed 50 enterprise clients across MENA. Opened London delivery hub." },
  { year: "2019", text: "Launched dedicated AI/ML practice. First production LLM deployments." },
  { year: "2022", text: "ISO 27001 certified. SOC 2 Type II in process. Crossed 200 client mark." },
  { year: "2026", text: "350+ clients, 4 global hubs, and a portfolio of award-winning platforms." },
];

export default function Company() {
  return (
    <>
      <section className="bg-sidebar text-sidebar-primary py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[140px]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sidebar-accent border border-sidebar-border text-xs font-medium mb-6">
            Our Story
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05]">
            We build the systems that{" "}
            <span className="italic bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              run quietly
            </span>{" "}
            in the background of modern enterprises.
          </h1>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12">
          <div className="rounded-3xl border border-border bg-card p-10">
            <Target className="h-8 w-8 text-primary" />
            <h2 className="mt-5 font-serif text-3xl text-foreground">Mission</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              To engineer the digital backbone of the next generation of enterprises — secure,
              scalable, and unapologetically well-crafted. We measure success in production
              uptime, not pitch decks.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-10">
            <Eye className="h-8 w-8 text-primary" />
            <h2 className="mt-5 font-serif text-3xl text-foreground">Vision</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              A world where every enterprise has access to engineering of the same calibre as the
              best technology companies on earth — regardless of geography or vertical.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-card/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What we believe"
            title={<>Four values, no compromises</>}
          />
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-border bg-background p-7">
                <v.Icon className="h-7 w-7 text-primary" />
                <h3 className="mt-5 font-semibold text-foreground">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Milestones" title={<>A decade in the trenches</>} />
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

      <section className="py-20 bg-sidebar text-sidebar-primary text-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Award className="h-10 w-10 text-primary mx-auto" />
          <h2 className="mt-6 font-serif text-4xl sm:text-5xl tracking-tight">
            Come build with us.
          </h2>
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3.5 text-sm font-semibold hover:shadow-2xl hover:shadow-primary/30 transition-all hover:gap-3 group"
          >
            Get in touch
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </>
  );
}
