import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldCheck, ShieldX, Search, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";

type VerifyResult =
  | { valid: true; verification_code: string; company_name: string; target: string; scope_summary: string; assessment_type: string; overall_result: string; issued_at: string; issuer: string }
  | { valid: false; reason: string; company_name?: string; issued_at?: string; revoked_at?: string };

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
      // Use anchor click (with download attr) rather than window.open — popup blockers
      // strip user-activation after the awaited fetch and silently block window.open.
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

  return (
    <div className="min-h-[80vh] bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-8">
          <Logo size="lg" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Report verification</span>
        </div>

        <h1 className="text-3xl font-serif tracking-tight">Verify a Lantid VAPT report</h1>
        <p className="text-muted-foreground mt-2">Enter the verification code printed on the report (format: <span className="font-mono">LNTD-VAPT-XXXXXX</span>).</p>

        <form onSubmit={onSubmit} className="mt-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={code} onChange={(e)=>setCode(e.target.value)} placeholder="LNTD-VAPT-2026-XXXXXX" className="w-full rounded-xl border border-input bg-card pl-10 pr-3 py-3 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-ring/50" />
          </div>
          <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold hover:shadow-brand transition-all">Verify</button>
        </form>

        <div className="mt-8">
          {loading && <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Looking up…</div>}

          {result?.valid && (
            <div className="rounded-2xl border border-green-500/30 bg-green-500/5 p-6">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold"><ShieldCheck className="h-5 w-5" /> Valid report</div>
              <div className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <Row k="Verification code" v={result.verification_code} mono />
                <Row k="Issued by" v={result.issuer} />
                <Row k="Company" v={result.company_name} />
                <Row k="Target" v={result.target} />
                <Row k="Assessment" v={result.assessment_type} cap />
                <Row k="Issued on" v={new Date(result.issued_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
                <Row k="Result" v={result.overall_result === "passed" ? "All checks passed" : "Findings reported"} />
                <Row k="Scope" v={result.scope_summary} full />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => downloadReport(result.verification_code)}
                  disabled={downloading}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold hover:shadow-brand transition-all disabled:opacity-60"
                >
                  {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {downloading ? "Preparing PDF…" : "Download full report (PDF)"}
                </button>
                <span className="text-xs text-muted-foreground self-center">Signed link, expires in 5 minutes.</span>
              </div>
            </div>
          )}

          {result && result.valid === false && (() => {
            const r = result;
            return (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
                <div className="flex items-center gap-2 text-destructive font-semibold"><ShieldX className="h-5 w-5" /> {r.reason === "revoked" ? "Report revoked" : r.reason === "rate_limited" ? "Too many attempts" : "Not a valid report"}</div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {r.reason === "revoked" && `This report was revoked on ${r.revoked_at ? new Date(r.revoked_at).toLocaleDateString() : "an unknown date"}. It is no longer valid.`}
                  {r.reason === "rate_limited" && "Please wait a minute before trying again."}
                  {r.reason === "not_found" && "No report exists with that verification code. Please double-check the code on the document."}
                  {r.reason === "invalid_code" && "That code format isn't valid."}
                </p>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, mono, cap, full }: { k: string; v: string; mono?: boolean; cap?: boolean; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
      <div className={`text-sm text-foreground ${mono ? "font-mono" : ""} ${cap ? "capitalize" : ""}`}>{v}</div>
    </div>
  );
}
