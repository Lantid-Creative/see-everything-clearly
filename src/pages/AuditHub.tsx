import { Link, Navigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, Loader2, BadgeCheck, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Seo } from "@/components/site/Seo";
import { AUDITS, TIERS, formatNaira, VAT_RATE } from "@/config/audits";

export default function AuditHub() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login?next=/audits" replace />;

  const base = TIERS.standard.baseKobo;
  const vat = Math.round(base * VAT_RATE);
  const total = base + vat;

  return (
    <>
      <Seo
        title="Choose an audit · Lantid"
        description="Select the audit you need — VAPT, PCI DSS, AML/CFT, ISO 27001, or NDPR/NDPA — and start your engagement in minutes."
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
          <p className="mt-5 text-base lg:text-lg text-muted-foreground max-w-2xl">
            Every audit is delivered by our senior assessors, priced from <strong>{formatNaira(base)}</strong> (+7.5% VAT ≈ {formatNaira(vat)}, total <strong>{formatNaira(total)}</strong>). Pick a service — we'll walk you through scoping, secure payment, and start straight after.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-2 gap-5">
          {AUDITS.map((a) => (
            <Link
              key={a.slug}
              to={a.route}
              className="group rounded-2xl border border-border bg-card p-6 lg:p-7 hover:border-primary/60 hover:shadow-brand transition-all flex flex-col"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <a.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase text-right">
                  {a.standard}
                </div>
              </div>
              <h3 className="mt-5 text-xl font-serif text-foreground">{a.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">{a.short}</p>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">From</div>
                  <div className="text-lg font-semibold text-foreground">{formatNaira(base)} <span className="text-xs font-normal text-muted-foreground">+ 7.5% VAT</span></div>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                  Start {a.name.split(" ")[0]} <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}

          {/* Verify a report */}
          <Link
            to="/verify-report"
            className="group rounded-2xl border-2 border-dashed border-border bg-background p-6 lg:p-7 hover:border-primary/60 transition-all flex flex-col"
          >
            <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-5 text-xl font-serif text-foreground">Verify a Lantid audit report</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
              Have a report reference or verification code? Confirm its authenticity, audit type, and status here.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
              Verify a report <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6 flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <BadgeCheck className="h-5 w-5 text-primary shrink-0" />
            <span>Track existing engagements in your dashboards: <Link to="/vapt/dashboard" className="text-primary hover:underline">VAPT</Link>{" · "}<Link to="/admin/audits" className="text-primary hover:underline">Audits</Link> (admin only).</span>
          </div>
        </div>
      </section>
    </>
  );
}
