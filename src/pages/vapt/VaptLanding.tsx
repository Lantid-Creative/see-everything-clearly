import { Link } from "react-router-dom";
import { Shield, CheckCircle2, FileText, QrCode, Lock, ArrowRight } from "lucide-react";

const TIERS = [
  {
    key: "basic",
    name: "Basic",
    price: "₦150,000",
    blurb: "Single web app, surface scan + OWASP Top 10 coverage.",
    items: ["Up to 1 target domain", "Automated + light manual testing", "PDF report + verification code", "Turnaround: 5 business days"],
  },
  {
    key: "standard",
    name: "Standard",
    price: "₦400,000",
    blurb: "Web app + APIs with authenticated testing and business-logic review.",
    items: ["Web app + REST/GraphQL APIs", "Authenticated + unauthenticated testing", "OWASP WSTG + PTES methodology", "PDF report, verification code, re-test", "Turnaround: 24 hours"],
    highlighted: true,
  },
  {
    key: "advanced",
    name: "Advanced",
    price: "₦1,000,000",
    blurb: "Full-stack assessment incl. infrastructure, business logic, and chained attack paths.",
    items: ["Web + API + infra surface", "Manual exploitation & chained attacks", "Executive + technical reports", "Re-test + remediation walkthrough", "Expedited turnaround: 6 hours"],
  },
];

export default function VaptLanding() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-brand-soft opacity-60 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6">
            <Shield className="h-3.5 w-3.5" /> Lantid VAPT
          </div>
          <h1 className="text-4xl lg:text-6xl font-serif tracking-tight text-foreground max-w-3xl">
            Verifiable Vulnerability Assessments & Penetration Testing
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
            Order a professional VAPT engagement, pay securely, and receive a signed PDF report — every report carries a unique verification code and QR so third parties can confirm authenticity on lantid.com.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/vapt/request" className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold hover:shadow-brand transition-all">
              Request an assessment <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/verify-report" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-accent transition-all">
              <QrCode className="h-4 w-4" /> Verify a report
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
        {[
          { icon: FileText, title: "Structured PDF reports", body: "Executive summary, findings, CVSS-style severity, remediation guidance — all generated automatically after sign-off." },
          { icon: QrCode, title: "Unique verification code", body: "Every report ships with a LNTD-VAPT-XXXXXX code and QR pointing to lantid.com/verify-report — instant authenticity check." },
          { icon: Lock, title: "Tamper-evident", body: "SHA-256 hash stored at issuance. Revoked or altered reports fail verification automatically." },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-2xl border border-border bg-card p-6">
            <Icon className="h-6 w-6 text-primary mb-3" />
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
          </div>
        ))}
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-serif tracking-tight text-foreground text-center">Choose an assessment tier</h2>
        <p className="text-center text-muted-foreground mt-2">Pay securely via Paystack. NGN pricing — invoicing available on request.</p>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {TIERS.map((t) => (
            <div key={t.key} className={`rounded-2xl border p-6 bg-card flex flex-col ${t.highlighted ? "border-primary shadow-brand" : "border-border"}`}>
              {t.highlighted && <div className="text-[10px] font-semibold tracking-wider text-primary uppercase mb-2">Most popular</div>}
              <h3 className="text-xl font-semibold text-foreground">{t.name}</h3>
              <div className="mt-2 text-3xl font-serif text-foreground">{t.price}</div>
              <p className="mt-3 text-sm text-muted-foreground">{t.blurb}</p>
              <ul className="mt-4 space-y-2 text-sm text-foreground/80 flex-1">
                {t.items.map((i) => (
                  <li key={i} className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />{i}</li>
                ))}
              </ul>
              <Link to={`/vapt/request?tier=${t.key}`} className={`mt-6 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${t.highlighted ? "bg-primary text-primary-foreground hover:shadow-brand" : "border border-border hover:bg-accent text-foreground"}`}>
                Request {t.name}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
