import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck, CheckCircle2, Loader2, ArrowRight, Lock, FileText, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Seo } from "@/components/site/Seo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const TIERS: Record<string, { kobo: number; label: string; price: string; turnaround: string; blurb: string; items: string[]; highlighted?: boolean }> = {
  standard: {
    kobo: 10000000,
    label: "Standard — ₦100,000",
    price: "₦100,000",
    turnaround: "3 business days",
    blurb: "Gap assessment + SAQ facilitation for smaller merchants and service providers.",
    items: [
      "Scoping & CDE mapping",
      "PCI DSS v4.0.1 gap assessment",
      "SAQ guidance & evidence checklist",
      "Turnaround: 3 business days",
    ],
  },
  priority: {
    kobo: 50000000,
    label: "Priority — ₦500,000",
    price: "₦500,000",
    turnaround: "24 hours",
    blurb: "Expedited assessment with remediation roadmap for time-boxed compliance windows.",
    items: [
      "Everything in Standard",
      "Segmentation & control review",
      "Written remediation roadmap",
      "Turnaround: 24 hours",
    ],
    highlighted: true,
  },
  expedited: {
    kobo: 150000000,
    label: "Expedited — ₦1,500,000",
    price: "₦1,500,000",
    turnaround: "6 hours",
    blurb: "Full audit with QSA-led review, on-call support, and RoC-ready evidence pack.",
    items: [
      "Everything in Priority",
      "QSA-led control walkthrough",
      "Evidence pack for RoC readiness",
      "Expedited turnaround: 6 hours",
    ],
  },
};

const SAQ_TYPES = [
  "Not sure — please advise",
  "SAQ A (e-commerce, fully outsourced)",
  "SAQ A-EP (e-commerce, partial outsourcing)",
  "SAQ B / B-IP (imprint / IP-connected terminals)",
  "SAQ C / C-VT (payment app / virtual terminal)",
  "SAQ D (Merchant)",
  "SAQ D (Service Provider)",
  "Full Report on Compliance (RoC)",
];

const MERCHANT_LEVELS = [
  "Not sure",
  "Level 1 (>6M transactions/yr)",
  "Level 2 (1M–6M/yr)",
  "Level 3 (20k–1M e-commerce/yr)",
  "Level 4 (<20k e-commerce or <1M total/yr)",
  "Service Provider",
];

export default function PciDss() {
  const { user, loading } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const initialTier = (params.get("tier") && TIERS[params.get("tier") as string]) ? params.get("tier")! : "priority";
  const [tier, setTier] = useState<string>(initialTier);
  const [submitting, setSubmitting] = useState(false);

  const [company, setCompany] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [saqType, setSaqType] = useState(SAQ_TYPES[0]);
  const [merchantLevel, setMerchantLevel] = useState(MERCHANT_LEVELS[0]);
  const [annualTx, setAnnualTx] = useState("");
  const [environment, setEnvironment] = useState("");
  const [currentStatusText, setCurrentStatusText] = useState("");
  const [timeline, setTimeline] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => { if (user?.email && !email) setEmail(user.email); }, [user, email]);

  const label = "text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-1.5 block";
  const input = "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "PCI DSS Audit & Compliance",
    provider: { "@type": "Organization", name: "Lantid Creative" },
    areaServed: "Global",
    url: "https://lantid.com/pci-dss",
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(`/pci-dss?tier=${tier}`)}`);
      return;
    }
    setSubmitting(true);
    try {
      const { data: row, error } = await supabase
        .from("pci_dss_requests" as never)
        .insert({
          user_id: user.id,
          company,
          contact_person: contactPerson,
          email,
          website,
          saq_type: saqType,
          merchant_level: merchantLevel,
          annual_transactions: annualTx,
          environment,
          current_status: currentStatusText,
          timeline,
          notes,
          tier,
          amount_kobo: TIERS[tier].kobo,
          currency: "NGN",
          status: "pending_payment",
        } as never)
        .select()
        .single();
      if (error) throw error;
      const reqRow = row as { id: string };

      const callback = `${window.location.origin}/vapt/payment-callback`;
      const { data: init, error: initErr } = await supabase.functions.invoke("paystack-init-pci", {
        body: { request_id: reqRow.id, callback_url: callback },
      });
      if (initErr || !init?.authorization_url) {
        toast({ title: "Payment init failed", description: initErr?.message || init?.error || "Try again", variant: "destructive" });
        setSubmitting(false);
        return;
      }
      window.location.href = init.authorization_url;
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
      setSubmitting(false);
    }
  };

  const t = TIERS[tier];

  return (
    <>
      <Seo
        title="PCI DSS Audit & Compliance | Lantid"
        description="Request a PCI DSS gap assessment, SAQ facilitation, or full RoC-ready audit from Lantid's QSA-led team. Standard (3 days), Priority (24h), or Expedited (6h)."
        path="/pci-dss"
        jsonLd={jsonLd}
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-brand-soft opacity-60 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6">
            <ShieldCheck className="h-3.5 w-3.5" /> PCI DSS v4.0.1
          </div>
          <h1 className="text-4xl lg:text-5xl font-serif tracking-tight text-foreground max-w-3xl">
            PCI DSS Audit &amp; Compliance
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
            Gap assessment, SAQ facilitation, remediation support and RoC-ready evidence for merchants and service providers handling cardholder data. Fill the form, choose a tier, and pay securely.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-6">
        {[
          { icon: FileText, title: "Scoping & Gap Assessment", body: "Map cardholder data flows, define CDE and connected systems, and identify control gaps against PCI DSS v4.0.1." },
          { icon: Lock, title: "SAQ & RoC Facilitation", body: "Evidence prep, the correct SAQ, and coordination toward a full Report on Compliance where required." },
          { icon: Sparkles, title: "Remediation Support", body: "Segmentation, logging, MFA, encryption, secure SDLC, and vendor management — implemented alongside your team." },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-2xl border border-border bg-card p-6">
            <Icon className="h-6 w-6 text-primary mb-3" />
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
          </div>
        ))}
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 pb-4">
        <h2 className="text-3xl font-serif tracking-tight text-foreground text-center">Choose an audit tier</h2>
        <p className="text-center text-muted-foreground mt-2">Pay securely via Paystack. NGN pricing — invoicing available on request.</p>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {Object.entries(TIERS).map(([key, item]) => (
            <div
              key={key}
              className={`text-left rounded-2xl border p-6 bg-card flex flex-col transition-all ${
                tier === key ? "border-primary shadow-brand ring-2 ring-primary/30" : "border-border hover:border-primary/40"
              }`}
            >
              {item.highlighted && <div className="text-[10px] font-semibold tracking-wider text-primary uppercase mb-2">Most popular</div>}
              <h3 className="text-xl font-semibold text-foreground capitalize">{key}</h3>
              <div className="mt-2 text-3xl font-serif text-foreground">{item.price}</div>
              <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">Turnaround: {item.turnaround}</p>
              <p className="mt-3 text-sm text-muted-foreground">{item.blurb}</p>
              <ul className="mt-4 space-y-2 text-sm text-foreground/80 flex-1">
                {item.items.map((i) => (
                  <li key={i} className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />{i}</li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => {
                  setTier(key);
                  if (!user) {
                    navigate(`/login?next=${encodeURIComponent(`/pci-dss?tier=${key}`)}`);
                    return;
                  }
                  setTimeout(() => {
                    document.getElementById("pci-next-step")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 50);
                }}
                className={`mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  tier === key ? "bg-primary text-primary-foreground" : "border border-border text-foreground hover:bg-primary/5"
                }`}
              >
                {user ? (tier === key ? "Continue with this tier" : `Choose ${key}`) : "Sign in & continue"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section id="pci-next-step" className="max-w-4xl mx-auto px-6 py-14 scroll-mt-24">
        <div className="rounded-3xl border border-border bg-card p-8 lg:p-10">
          {!user ? (
            <div className="text-center py-8">
              <h2 className="font-serif text-2xl text-foreground">Sign in to request an audit</h2>
              <p className="mt-2 text-sm text-muted-foreground">You'll need an account so we can attach your engagement, payments, and report to a secure profile.</p>
              <Link
                to={`/login?next=${encodeURIComponent(`/pci-dss?tier=${tier}`)}`}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold hover:shadow-brand transition-all"
              >
                Sign in to continue <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <h2 className="font-serif text-2xl text-foreground">Tell us about your environment</h2>
                <p className="text-sm text-muted-foreground mt-1">These details let us prepare an accurate scope before the engagement begins.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className={label}>Company *</label><input value={company} onChange={(e)=>setCompany(e.target.value)} required className={input} /></div>
                <div><label className={label}>Contact person *</label><input value={contactPerson} onChange={(e)=>setContactPerson(e.target.value)} required className={input} /></div>
                <div><label className={label}>Work email *</label><input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className={input} /></div>
                <div><label className={label}>Website</label><input value={website} onChange={(e)=>setWebsite(e.target.value)} placeholder="https://" className={input} /></div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={label}>Assessment type</label>
                  <select value={saqType} onChange={(e)=>setSaqType(e.target.value)} className={input}>
                    {SAQ_TYPES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={label}>Merchant / service provider level</label>
                  <select value={merchantLevel} onChange={(e)=>setMerchantLevel(e.target.value)} className={input}>
                    {MERCHANT_LEVELS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={label}>Estimated annual card transactions</label>
                  <input value={annualTx} onChange={(e)=>setAnnualTx(e.target.value)} placeholder="e.g. 250,000" className={input} />
                </div>
                <div>
                  <label className={label}>Target timeline</label>
                  <input value={timeline} onChange={(e)=>setTimeline(e.target.value)} placeholder="e.g. audit-ready in 4 months" className={input} />
                </div>
              </div>

              <div>
                <label className={label}>Environment overview</label>
                <textarea value={environment} onChange={(e)=>setEnvironment(e.target.value)} rows={3} placeholder="Payment processors, gateways, hosting, tokenization, whether card data is stored, etc." className={`${input} resize-none`} />
              </div>

              <div>
                <label className={label}>Current compliance status</label>
                <textarea value={currentStatusText} onChange={(e)=>setCurrentStatusText(e.target.value)} rows={2} placeholder="Never assessed / previously certified / currently non-compliant / awaiting re-certification" className={`${input} resize-none`} />
              </div>

              <div>
                <label className={label}>Additional notes</label>
                <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} rows={3} className={`${input} resize-none`} />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Selected tier</div>
                  <div className="text-2xl font-serif capitalize">{tier} — {t.price}</div>
                  <div className="text-xs text-muted-foreground">Turnaround: {t.turnaround}</div>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold hover:shadow-brand transition-all disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (<>Continue to payment <ArrowRight className="h-4 w-4" /></>)}
                </button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                All submissions are treated confidentially. NDA available on request.
              </p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
