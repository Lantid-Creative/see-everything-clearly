import { Link } from "react-router-dom";
import { Banknote, HeartPulse, ShoppingBag, Truck, Building2, GraduationCap, Plane, Factory, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";

const items = [
  { id: "fintech", Icon: Banknote, title: "Fintech", desc: "Core banking, payments orchestration, KYC/AML, and trading platforms.", color: "from-emerald-500/20 to-emerald-500/5" },
  { id: "healthcare", Icon: HeartPulse, title: "Healthcare", desc: "HIPAA-compliant EMRs, telehealth, and clinical decision support tools.", color: "from-rose-500/20 to-rose-500/5" },
  { id: "retail", Icon: ShoppingBag, title: "Retail & E-commerce", desc: "Headless commerce, omnichannel POS, and AI personalization engines.", color: "from-amber-500/20 to-amber-500/5" },
  { id: "logistics", Icon: Truck, title: "Logistics & Supply Chain", desc: "Route optimization, fleet telematics, and warehouse automation.", color: "from-blue-500/20 to-blue-500/5" },
  { id: "realestate", Icon: Building2, title: "Real Estate & PropTech", desc: "CRM, listing portals, virtual tours, and tenant experience apps.", color: "from-purple-500/20 to-purple-500/5" },
  { id: "education", Icon: GraduationCap, title: "EdTech", desc: "Learning platforms, AI tutors, and certification infrastructure.", color: "from-indigo-500/20 to-indigo-500/5" },
  { id: "travel", Icon: Plane, title: "Travel & Hospitality", desc: "Booking engines, loyalty programs, and concierge AI.", color: "from-cyan-500/20 to-cyan-500/5" },
  { id: "manufacturing", Icon: Factory, title: "Manufacturing", desc: "IIoT, predictive maintenance, and digital twin platforms.", color: "from-orange-500/20 to-orange-500/5" },
];

export default function Industries() {
  return (
    <>
      <section className="bg-sidebar text-sidebar-primary py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[140px]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sidebar-accent border border-sidebar-border text-xs font-medium mb-6">
            Industries
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05]">
            Deep expertise across{" "}
            <span className="italic bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              regulated industries
            </span>
          </h1>
          <p className="mt-8 text-base sm:text-lg text-sidebar-foreground max-w-2xl mx-auto leading-relaxed">
            We've shipped production systems in the world's most demanding sectors — from
            high-frequency trading floors to hospital ICUs.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((it) => (
            <Link
              key={it.id}
              id={it.id}
              to="/contact"
              className="group relative rounded-2xl border border-border bg-card p-7 overflow-hidden hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${it.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative">
                <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <it.Icon className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">{it.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
                <div className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-all">
                  Explore solutions <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-20 bg-card/40 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading
            title={<>Don't see your industry?</>}
            description="We've built bespoke platforms for sectors as niche as commodities arbitrage and as broad as public services. If it requires engineering excellence, we're interested."
          />
          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground text-background px-7 py-3.5 text-sm font-semibold hover:bg-foreground/90 transition-all hover:gap-3 group"
          >
            Tell us about it
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </>
  );
}
