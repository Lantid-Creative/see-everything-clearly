import { Link, Navigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, Loader2, BadgeCheck, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Seo } from "@/components/site/Seo";
import { AUDITS, TIERS, formatNaira, VAT_RATE, AuditServiceDef } from "@/config/audits";

const CATEGORIES: { key: NonNullable<AuditServiceDef["category"]>; label: string; blurb: string }[] = [
  { key: "core",       label: "Cybersecurity & payments",   blurb: "Adversarial testing and payment-card assurance." },
  { key: "financial",  label: "Financial services & regulators", blurb: "For banks, OFIs, fintechs, and SWIFT-connected institutions." },
  { key: "governance", label: "Governance, risk & privacy", blurb: "ISO management systems, privacy laws, and public-sector clearance." },
  { key: "technical",  label: "Technical & cyber deep-dives",  blurb: "Cloud, code, adversary simulation, and Web3." },
  { key: "specialty",  label: "Emerging & specialty",        blurb: "AI governance, vendor risk, mobile, and incident response." },
];

export default function AuditHub() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }
  if (!user) return <Navigate to="/login?next=/audits" replace />;

  const base = TIERS.standard.baseKobo;
  const vat = Math.round(base * VAT_RATE);
  const total = base + vat;

  return (
    <>
      <Seo
        title="Choose an audit · Lantid"
        description="Every audit Lantid runs — VAPT, PCI DSS, CBN RCSF, SWIFT CSP, SOC 2, ISO 27001, NDPR, GDPR, HIPAA and more."
        path="/audits"
      />

      <section className="border-b border-border bg-gradient-brand-soft/40">
        <div className="max-w-6xl mx-auto px-6 py-14 lg:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-5">
            <ShieldCheck className="h-3.5 w-3.5" /> Welcome back{user.email ? `, ${user.email.split("@")[0]}` : ""}
          </div>
          <h1 className="text-3xl lg:text-5xl font-serif tracking-tight text-foreground max-w-3xl">
            Which audit are we running for you today?
          </h1>
          <p className="mt-5 text-base lg:text-lg text-muted-foreground max-w-3xl">
            {AUDITS.length}+ services delivered by senior assessors, priced from <strong>{formatNaira(base)}</strong> (+7.5% VAT ≈ {formatNaira(vat)}, total <strong>{formatNaira(total)}</strong>). Pick a service — we'll walk you through scoping, secure payment, and start straight after.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs">
            <Link to="/verify-report" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 hover:border-primary/60 transition">
              <Search className="h-3.5 w-3.5" /> Verify a report
            </Link>
          </div>
        </div>
      </section>

      {CATEGORIES.map((cat) => {
        const items = AUDITS.filter((a) => a.category === cat.key);
        if (items.length === 0) return null;
        return (
          <section key={cat.key} className="max-w-6xl mx-auto px-6 py-10 lg:py-14">
            <div className="mb-6">
              <h2 className="text-2xl lg:text-3xl font-serif tracking-tight text-foreground">{cat.label}</h2>
              <p className="text-sm text-muted-foreground mt-1">{cat.blurb}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((a) => (
                <Link
                  key={a.slug}
                  to={a.route}
                  className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/60 hover:shadow-brand transition-all flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <a.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase text-right leading-tight">
                      {a.standard}
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-serif text-foreground">{a.name}</h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed flex-1">{a.short}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">From</div>
                      <div className="text-sm font-semibold text-foreground">{formatNaira(base)} <span className="text-[10px] font-normal text-muted-foreground">+ VAT</span></div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                      Start <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <BadgeCheck className="h-5 w-5 text-primary shrink-0" />
            <span>Track engagements at your dashboards: <Link to="/vapt/dashboard" className="text-primary hover:underline">VAPT</Link>{" · "}<Link to="/admin/audits" className="text-primary hover:underline">Audits (admin)</Link>.</span>
          </div>
          <Link to="/verify-report" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <Search className="h-4 w-4" /> Verify a Lantid audit report
          </Link>
        </div>
      </section>
    </>
  );
}
