import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, FileText, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Req = {
  id: string; public_id: string; target: string; scope: string;
  assessment_type: string; status: string; amount_kobo: number; currency: string;
  created_at: string;
};
type Report = { id: string; verification_code: string; storage_path: string | null; request_id: string | null; issued_at: string; overall_result: string };

export default function VaptDashboard() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<Req[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: r }, { data: rep }] = await Promise.all([
        supabase.from("vapt_requests").select("id,public_id,target,scope,assessment_type,status,amount_kobo,currency,created_at").order("created_at", { ascending: false }),
        supabase.from("reports").select("id,verification_code,storage_path,request_id,issued_at,overall_result"),
      ]);
      setRequests((r as Req[]) || []);
      setReports((rep as Report[]) || []);
      setLoadingData(false);
    })();
  }, [user]);

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;

  const reportByRequest = new Map(reports.filter((r) => r.request_id).map((r) => [r.request_id!, r]));

  const download = async (reportId: string) => {
    const { data, error } = await supabase.functions.invoke("report-download", { body: { report_id: reportId } });
    if (error || !data?.url) { toast({ title: "Download failed", description: error?.message || data?.error, variant: "destructive" }); return; }
    window.open(data.url, "_blank");
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif tracking-tight">My VAPT requests</h1>
          <p className="text-muted-foreground mt-1">Track engagement status and download signed reports.</p>
        </div>
        <Link to="/vapt/request" className="inline-flex items-center rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:shadow-brand transition-all">New request</Link>
      </div>

      {loadingData ? <Loader /> : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No requests yet.</p>
          <Link to="/vapt/request" className="inline-flex mt-4 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold">Request your first assessment</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => {
            const rep = reportByRequest.get(r.id);
            return (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-5 flex items-center justify-between flex-wrap gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">{r.public_id}</span>
                    <span>•</span>
                    <span className="uppercase tracking-wider">{r.assessment_type}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="mt-1 text-base font-semibold text-foreground truncate">{r.target}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">₦{(r.amount_kobo/100).toLocaleString()} • {new Date(r.created_at).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  {rep?.storage_path && (
                    <button onClick={() => download(rep.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-accent">
                      <Download className="h-4 w-4" /> Report
                    </button>
                  )}
                  {rep && (
                    <Link to={`/verify-report/${rep.verification_code}`} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-accent">
                      <ShieldCheck className="h-4 w-4" /> Verify
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending_payment: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    paid: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    processing: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    completed: "bg-green-500/10 text-green-700 dark:text-green-400",
    cancelled: "bg-muted text-muted-foreground",
  };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${map[status] || "bg-muted"}`}>{status.replace("_"," ")}</span>;
}
function Loader() { return <div className="min-h-[20vh] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>; }
