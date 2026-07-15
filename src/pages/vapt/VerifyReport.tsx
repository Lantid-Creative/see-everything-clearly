import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldCheck, ShieldX, Search, Download, Building2, Calendar, FileCheck2, Target, ScrollText, BadgeCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";

type ReportType = "vapt" | "pci_dss" | "audit" | string;

type VerifyResult =
  | { valid: true; verification_code: string; company_name: string; target: string; scope_summary: string; assessment_type: string; report_type?: ReportType; overall_result: string; issued_at: string; issuer: string }
  | { valid: false; reason: string; company_name?: string; issued_at?: string; revoked_at?: string };

const REPORT_LABELS: Record<string, { label: string; short: string; blurb: string }> = {
  vapt: { label: "Penetration Test Report", short: "VAPT", blurb: "Vulnerability Assessment & Penetration Test" },
  pci_dss: { label: "PCI DSS Assessment Report", short: "PCI DSS", blurb: "Payment Card Industry Data Security Standard" },
  audit: { label: "Compliance Audit Report", short: "Audit", blurb: "Independent compliance audit" },
};

export default function VerifyReport() {
  const { code: codeParam } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState(codeParam || "");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  useEffect(() => { if (codeParam) verify(codeParam); /* eslint-disable-next-line */ }, [codeParam]);

  const verify = async (c: string) => {
    setLoading(true); setResult(null);
    const { data } = await supabase.functions.invoke("verify-report", { body: { code: c } });
    setResult(data as VerifyResult);
    setLoading(false);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c) return;
    navigate(`/verify-report/${c}`);
    verify(c);
  };

  const downloadReport = async (c: string) => {
    setDownloading(true);
    try {
      const { data, error } = await supabase.functions.invoke("public-report-download", { body: { code: c } });
      if (error || !data?.url) throw new Error(data?.error || error?.message || "Download failed");
      const a = document.createElement("a");
      a.href = data.url;
      a.rel = "noopener noreferrer";
      a.download = `Lantid-Report-${c}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      toast({ title: "Download failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  const reportMeta = result?.valid ? (REPORT_LABELS[result.report_type || "vapt"] ?? REPORT_LABELS.vapt) : null;

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-background via-background to-muted/30">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-10">
          <div className="flex items-center gap-3">
            <Logo size="lg" />
            <div className="hidden sm:block">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Report verification</div>
              <div className="text-xs text-muted-foreground/70">Independent authenticity check</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
            <BadgeCheck className="h-3.5 w-3.5 text-primary" /> Public verifier
          </div>
        </div>

        {/* Hero */}
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Verify a Lantid report
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif tracking-tight mt-3">Confirm the authenticity of a report</h1>
        <p className="text-muted-foreground mt-3 max-w-xl">
          Enter the verification code printed on any Lantid report — VAPT, PCI DSS, or compliance audit — to confirm it was issued by us and view its details.
        </p>

        {/* Search form */}
        <form onSubmit={onSubmit} className="mt-8 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="LNTD-VAPT-2026-XXXXXX"
              aria-label="Verification code"
              className="w-full rounded-xl border border-input bg-card pl-10 pr-3 py-3 text-sm font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:shadow-brand transition-all disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Verify
          </button>
        </form>
        <p className="mt-2 text-xs text-muted-foreground">
          Codes look like <span className="font-mono">LNTD-VAPT-…</span>, <span className="font-mono">LNTD-PCI-…</span>, or <span className="font-mono">LNTD-AUD-…</span>
        </p>

        {/* Results */}
        <div className="mt-10">
          {loading && (
            <div className="rounded-2xl border border-border/60 bg-card/60 p-6 flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Looking up the report…
            </div>
          )}

          {result?.valid && reportMeta && (
            <div className="rounded-2xl border border-green-500/30 bg-gradient-to-b from-green-500/5 to-transparent p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/15 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-green-700 dark:text-green-400 font-semibold">Authentic report</div>
                    <div className="text-xs text-muted-foreground">{reportMeta.blurb}</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-primary">
                  {reportMeta.short}
                </span>
              </div>

              <div className="mt-6 rounded-xl border border-border/60 bg-card/60 p-5">
                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
                  <Row icon={<ScrollText className="h-3.5 w-3.5" />} k="Verification code" v={result.verification_code} mono />
                  <Row icon={<BadgeCheck className="h-3.5 w-3.5" />} k="Issued by" v={result.issuer} />
                  <Row icon={<Building2 className="h-3.5 w-3.5" />} k="Company" v={result.company_name} />
                  <Row icon={<Target className="h-3.5 w-3.5" />} k="Target / Scope entity" v={result.target} />
                  <Row icon={<FileCheck2 className="h-3.5 w-3.5" />} k="Assessment" v={result.assessment_type} cap />
                  <Row icon={<Calendar className="h-3.5 w-3.5" />} k="Issued on" v={new Date(result.issued_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
                  <Row icon={<ShieldCheck className="h-3.5 w-3.5" />} k="Result" v={result.overall_result === "passed" ? "All checks passed" : "Findings reported"} full />
                  <Row icon={<ScrollText className="h-3.5 w-3.5" />} k="Scope" v={result.scope_summary} full />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => downloadReport(result.verification_code)}
                  disabled={downloading}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold hover:shadow-brand transition-all disabled:opacity-60"
                >
                  {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {downloading ? "Preparing PDF…" : "Download full report (PDF)"}
                </button>
                <span className="text-xs text-muted-foreground">Signed link, expires in 5 minutes.</span>
              </div>
            </div>
          )}

          {result && result.valid === false && (() => {
            const r = result;
            const title =
              r.reason === "revoked" ? "Report revoked" :
              r.reason === "rate_limited" ? "Too many attempts" :
              r.reason === "invalid_code" ? "Invalid code format" :
              "Not a valid report";
            return (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-destructive/15 flex items-center justify-center">
                    <ShieldX className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="text-destructive font-semibold">{title}</div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground max-w-xl">
                  {r.reason === "revoked" && `This report was revoked on ${r.revoked_at ? new Date(r.revoked_at).toLocaleDateString() : "an unknown date"}. It is no longer valid.`}
                  {r.reason === "rate_limited" && "Please wait a minute before trying again."}
                  {r.reason === "not_found" && "No report exists with that verification code. Double-check the code printed on the document — codes are case-insensitive but must match exactly."}
                  {r.reason === "invalid_code" && "That code format isn't valid. Codes start with LNTD- followed by a report type and identifier."}
                </p>
              </div>
            );
          })()}

          {!loading && !result && (
            <div className="grid sm:grid-cols-3 gap-3">
              {[
                { t: "VAPT", d: "Penetration tests" },
                { t: "PCI DSS", d: "Payment compliance" },
                { t: "Audit", d: "Independent audits" },
              ].map((x) => (
                <div key={x.t} className="rounded-xl border border-border/60 bg-card/40 p-4">
                  <div className="text-xs uppercase tracking-wider text-primary font-semibold">{x.t}</div>
                  <div className="text-sm text-muted-foreground mt-1">{x.d}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trust footer */}
        <div className="mt-14 border-t border-border/60 pt-6 text-xs text-muted-foreground flex flex-wrap gap-x-6 gap-y-2">
          <span>Every verification is logged and rate-limited to protect against abuse.</span>
          <span>Need help? <a className="underline hover:text-foreground" href="/contact">Contact Lantid</a></span>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, mono, cap, full, icon }: { k: string; v: string; mono?: boolean; cap?: boolean; full?: boolean; icon?: React.ReactNode }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {k}
      </div>
      <div className={`text-sm text-foreground mt-1 ${mono ? "font-mono" : ""} ${cap ? "capitalize" : ""}`}>{v}</div>
    </div>
  );
}
