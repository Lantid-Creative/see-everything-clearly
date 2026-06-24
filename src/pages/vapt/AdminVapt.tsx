import { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, FileText, Ban, Download, Sparkles } from "lucide-react";

type Req = { id: string; public_id: string; user_id: string; target: string; scope: string; assessment_type: "basic"|"standard"|"advanced"; status: string; amount_kobo: number; created_at: string; organization_id: string };
type Org = { id: string; company_name: string; email: string };
type Report = { id: string; request_id: string | null; verification_code: string; company_name: string; target: string; storage_path: string | null; status: string; overall_result: string; issued_at: string };

export default function AdminVapt() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [requests, setRequests] = useState<Req[]>([]);
  const [orgs, setOrgs] = useState<Map<string, Org>>(new Map());
  const [reports, setReports] = useState<Report[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    (async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      setIsAdmin(!!data);
    })();
  }, [user]);

  const refresh = useCallback(async () => {
    const [{ data: r }, { data: o }, { data: rep }] = await Promise.all([
      supabase.from("vapt_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("organizations").select("id,company_name,email"),
      supabase.from("reports").select("id,request_id,verification_code,company_name,target,storage_path,status,overall_result,issued_at").order("issued_at", { ascending: false }),
    ]);
    setRequests((r as Req[]) || []);
    setOrgs(new Map(((o as Org[]) || []).map((x) => [x.id, x])));
    setReports((rep as Report[]) || []);
  }, []);
  useEffect(() => { if (isAdmin) refresh(); }, [isAdmin, refresh]);

  if (loading || isAdmin === null) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <ClaimAdmin onClaimed={() => setIsAdmin(true)} />;

  const reportByRequest = new Map(reports.filter((r) => r.request_id).map((r) => [r.request_id!, r]));
  const orphanReports = reports.filter((r) => !r.request_id);

  const setStatus = async (id: string, status: Req["status"]) => {
    setBusy(id);
    const { error } = await supabase.from("vapt_requests").update({ status } as never).eq("id", id);
    setBusy(null);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else refresh();
  };

  const generate = async (req: Req, overall: "passed" | "findings" = "passed") => {
    setBusy(req.id);
    const org = orgs.get(req.organization_id);
    const { data, error } = await supabase.functions.invoke("generate-report", {
      body: {
        request_id: req.id,
        company_name: org?.company_name || "Client",
        target: req.target,
        scope_summary: req.scope,
        assessment_type: req.assessment_type,
        overall_result: overall,
      },
    });
    setBusy(null);
    if (error || data?.error) toast({ title: "Generation failed", description: error?.message || data?.error, variant: "destructive" });
    else { toast({ title: "Report generated", description: data?.report?.verification_code }); refresh(); }
  };

  const generateOrphan = async (rep: Report) => {
    setBusy(rep.id);
    const { data, error } = await supabase.functions.invoke("generate-report", {
      body: {
        report_id: rep.id,
        company_name: rep.company_name,
        target: rep.target,
        scope_summary: "External Web Application Security Assessment — Web App, Auth, API, TLS, Headers, Input Validation, Session Mgmt, Config, Infra, Business Logic",
        assessment_type: "advanced",
        overall_result: rep.overall_result === "passed" ? "passed" : "findings",
        verification_code: rep.verification_code,
        issued_at: rep.issued_at,
      },
    });
    setBusy(null);
    if (error || data?.error) toast({ title: "Failed", description: error?.message || data?.error, variant: "destructive" });
    else { toast({ title: "PDF generated" }); refresh(); }
  };

  const revoke = async (rep: Report) => {
    if (!confirm("Revoke this report? Verification will start returning 'revoked'.")) return;
    setBusy(rep.id);
    const { error } = await supabase.from("reports").update({ status: "revoked", revoked_at: new Date().toISOString() } as never).eq("id", rep.id);
    setBusy(null);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else refresh();
  };

  const download = async (id: string) => {
    const { data, error } = await supabase.functions.invoke("report-download", { body: { report_id: id } });
    if (error || !data?.url) toast({ title: "Failed", description: error?.message || data?.error, variant: "destructive" });
    else window.open(data.url, "_blank");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-primary font-semibold">Admin</div>
          <h1 className="text-3xl font-serif tracking-tight">VAPT operations</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{requests.length}</span> requests •{" "}
          <span className="font-semibold text-foreground">{reports.length}</span> reports •{" "}
          <span className="font-semibold text-foreground">₦{requests.filter(r=>r.status!=='pending_payment'&&r.status!=='cancelled').reduce((s,r)=>s+r.amount_kobo,0)/100}</span> collected
        </div>
      </header>

      {/* Pre-seeded / orphan reports (e.g. Harrenapay) */}
      {orphanReports.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Standalone reports</h2>
          <div className="space-y-2">
            {orphanReports.map((rep) => (
              <div key={rep.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="font-semibold text-foreground">{rep.company_name} <span className="text-xs font-normal text-muted-foreground">— {rep.target}</span></div>
                  <div className="text-xs font-mono text-muted-foreground mt-0.5">{rep.verification_code} • {rep.status}{rep.storage_path ? " • PDF ready" : " • PDF not generated"}</div>
                </div>
                <div className="flex gap-2">
                  {!rep.storage_path && <button disabled={busy===rep.id} onClick={()=>generateOrphan(rep)} className="rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm font-semibold disabled:opacity-50">Generate PDF</button>}
                  {rep.storage_path && <button onClick={()=>download(rep.id)} className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-accent inline-flex items-center gap-1.5"><Download className="h-4 w-4" /> PDF</button>}
                  {rep.status !== "revoked" && <button onClick={()=>revoke(rep)} className="rounded-lg border border-destructive/40 text-destructive px-3 py-2 text-sm font-medium hover:bg-destructive/10 inline-flex items-center gap-1.5"><Ban className="h-4 w-4" /> Revoke</button>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-3">All requests</h2>
        {requests.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">No requests yet.</div>
        ) : (
          <div className="space-y-2">
            {requests.map((req) => {
              const org = orgs.get(req.organization_id);
              const rep = reportByRequest.get(req.id);
              return (
                <div key={req.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">{req.public_id}</span> •
                        <span className="uppercase tracking-wider">{req.assessment_type}</span> •
                        <span className="uppercase tracking-wider font-semibold">{req.status.replace("_"," ")}</span>
                      </div>
                      <div className="mt-1 font-semibold text-foreground truncate">{org?.company_name || "—"} — {req.target}</div>
                      <div className="text-xs text-muted-foreground">{org?.email} • ₦{(req.amount_kobo/100).toLocaleString()} • {new Date(req.created_at).toLocaleString()}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {req.status === "paid" && <button disabled={busy===req.id} onClick={()=>setStatus(req.id,"processing")} className="rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-accent">Start engagement</button>}
                      {req.status === "processing" && !rep && <>
                        <button disabled={busy===req.id} onClick={()=>generate(req, "passed")} className="rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold disabled:opacity-50 inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Generate PASSED</button>
                        <button disabled={busy===req.id} onClick={()=>generate(req, "findings")} className="rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-accent inline-flex items-center gap-1.5"><FileText className="h-4 w-4" /> Generate w/ findings</button>
                      </>}
                      {rep?.storage_path && <button onClick={()=>download(rep.id)} className="rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-accent inline-flex items-center gap-1.5"><Download className="h-4 w-4" /> PDF</button>}
                      {rep && rep.status !== "revoked" && <button onClick={()=>revoke(rep)} className="rounded-lg border border-destructive/40 text-destructive px-3 py-2 text-xs font-medium hover:bg-destructive/10 inline-flex items-center gap-1.5"><Ban className="h-4 w-4" /> Revoke</button>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function ClaimAdmin({ onClaimed }: { onClaimed: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const claim = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("claim-admin");
    setLoading(false);
    if (error || data?.error) toast({ title: "Cannot grant admin", description: error?.message || data?.error, variant: "destructive" });
    else { toast({ title: "You are now admin" }); onClaimed(); }
  };
  return (
    <div className="max-w-md mx-auto px-6 py-20 text-center">
      <h1 className="text-2xl font-serif">Admin access required</h1>
      <p className="text-muted-foreground mt-2">If no admin has been set up yet, you can claim the role now (first user only).</p>
      <button onClick={claim} disabled={loading} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold disabled:opacity-50">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Claim admin role"}
      </button>
    </div>
  );
}
function Loader() { return <div className="min-h-[40vh] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>; }
