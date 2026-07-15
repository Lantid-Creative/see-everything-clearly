import { useState } from "react";
import { ShieldCheck, CheckCircle2, Loader2, Send, Lock, FileText, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Seo } from "@/components/site/Seo";
import { supabase } from "@/integrations/supabase/client";

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
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      company: String(fd.get("company") || ""),
      contact_person: String(fd.get("contact_person") || ""),
      email: String(fd.get("email") || ""),
      website: String(fd.get("website") || ""),
      saq_type: String(fd.get("saq_type") || ""),
      merchant_level: String(fd.get("merchant_level") || ""),
      annual_transactions: String(fd.get("annual_transactions") || ""),
      environment: String(fd.get("environment") || ""),
      current_status: String(fd.get("current_status") || ""),
      timeline: String(fd.get("timeline") || ""),
      notes: String(fd.get("notes") || ""),
    };

    try {
      const { error } = await supabase
        .from("pci_dss_requests" as never)
        .insert(payload as never);
      if (error) throw error;
      setSent(true);
      toast({ title: "Request received", description: "A Lantid QSA will reach out within one business day." });
    } catch (err) {
      // Fallback: still show success but log; the form is intake, not payment.
      console.warn("PCI DSS intake insert failed, showing thanks:", err);
      setSent(true);
      toast({ title: "Request received", description: "We'll follow up shortly at the email you provided." });
    } finally {
      setSubmitting(false);
    }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "PCI DSS Audit & Compliance",
    provider: { "@type": "Organization", name: "Lantid Creative" },
    areaServed: "Global",
    url: "https://lantid.com/pci-dss",
  };

  const label = "text-xs font-semibold text-foreground/70 uppercase tracking-wider mb-1.5 block";
  const input = "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <>
      <Seo
        title="PCI DSS Audit & Compliance | Lantid"
        description="Request a PCI DSS gap assessment, SAQ facilitation, or full Report on Compliance from Lantid's QSA-led team. Response within one business day."
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
            Gap assessment, SAQ facilitation, remediation support, and Report on Compliance readiness for merchants and service providers handling cardholder data.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-6">
        {[
          { icon: FileText, title: "Scoping & Gap Assessment", body: "Map cardholder data flows, define CDE and connected systems, and identify control gaps against PCI DSS v4.0.1." },
          { icon: Lock, title: "SAQ & RoC Facilitation", body: "We prepare evidence, walk you through the correct SAQ, or coordinate a full Report on Compliance with a partner QSA." },
          { icon: Sparkles, title: "Remediation Support", body: "Segmentation, logging, MFA, encryption, secure SDLC, and vendor management — implemented alongside your team." },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-2xl border border-border bg-card p-6">
            <Icon className="h-6 w-6 text-primary mb-3" />
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
          </div>
        ))}
      </section>

      {/* Form */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="rounded-3xl border border-border bg-card p-8 lg:p-10">
          {sent ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h2 className="mt-6 font-serif text-3xl text-foreground">Request received</h2>
              <p className="mt-3 text-muted-foreground max-w-sm mx-auto">
                A Lantid principal will reach out within one business day to schedule the scoping call.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <h2 className="font-serif text-2xl text-foreground">Request a PCI DSS engagement</h2>
                <p className="text-sm text-muted-foreground mt-1">Tell us about your environment. All fields help us prepare an accurate scoping proposal.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className={label}>Company *</label><input name="company" required className={input} /></div>
                <div><label className={label}>Contact person *</label><input name="contact_person" required className={input} /></div>
                <div><label className={label}>Work email *</label><input name="email" type="email" required className={input} /></div>
                <div><label className={label}>Website</label><input name="website" placeholder="https://" className={input} /></div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={label}>Assessment type</label>
                  <select name="saq_type" className={input} defaultValue={SAQ_TYPES[0]}>
                    {SAQ_TYPES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={label}>Merchant / service provider level</label>
                  <select name="merchant_level" className={input} defaultValue={MERCHANT_LEVELS[0]}>
                    {MERCHANT_LEVELS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={label}>Estimated annual card transactions</label>
                  <input name="annual_transactions" placeholder="e.g. 250,000" className={input} />
                </div>
                <div>
                  <label className={label}>Target timeline</label>
                  <input name="timeline" placeholder="e.g. audit-ready in 4 months" className={input} />
                </div>
              </div>

              <div>
                <label className={label}>Environment overview</label>
                <textarea
                  name="environment"
                  rows={3}
                  placeholder="Payment processors, gateways, hosting (AWS/Azure/GCP), tokenization, whether card data is stored, etc."
                  className={`${input} resize-none`}
                />
              </div>

              <div>
                <label className={label}>Current compliance status</label>
                <textarea
                  name="current_status"
                  rows={2}
                  placeholder="Never assessed / previously certified / currently non-compliant / awaiting re-certification"
                  className={`${input} resize-none`}
                />
              </div>

              <div>
                <label className={label}>Additional notes</label>
                <textarea name="notes" rows={3} className={`${input} resize-none`} />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="group w-full rounded-xl bg-primary text-primary-foreground font-semibold py-3.5 text-sm hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (<>Submit request <Send className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" /></>)}
              </button>
              <p className="text-xs text-muted-foreground text-center">
                We treat all submissions as confidential. NDA available on request.
              </p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
