import { useEffect, useMemo, useState, Fragment } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Seo } from "@/components/site/Seo";
import { Loader2, ShieldCheck, Download, ArrowRight, FileText, Search as SearchIcon, Filter, RefreshCw } from "lucide-react";
import { AUDITS, AUDIT_LABEL_BY_DBTYPE, auditBySlug } from "@/config/audits";

type Row = {
  id: string;
  audit_type: string;
  tier: string;
  amount_kobo: number;
  vat_kobo: number;
  total_kobo: number;
  status: string;
  reference: string;
  verification_code: string | null;
  company_name: string;
  contact_email: string;
  intake: Record<string, unknown> | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_TONE: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  paid: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  in_progress: "bg-primary/15 text-primary",
  under_review: "bg-primary/15 text-primary",
  completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-destructive/15 text-destructive",
};

const fmt = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);

export default function MyAudits() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const load = async () => {
    if (!user) return;
    setRefreshing(true);
    const { data, error } = await supabase
      .from("audit_requests" as never)
      .select("id,audit_type,tier,amount_kobo,vat_kobo,total_kobo,status,reference,verification_code,company_name,contact_email,intake,paid_at,created_at,updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setRefreshing(false);
    if (error) {
      toast({ title: "Could not load submissions", description: error.message, variant: "destructive" });
      return;
    }
    setRows((data || []) as unknown as Row[]);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      const name = AUDIT_LABEL_BY_DBTYPE[r.audit_type] || r.audit_type;
      return (
        r.reference.toLowerCase().includes(q) ||
        r.company_name?.toLowerCase().includes(q) ||
        name.toLowerCase().includes(q)
      );
    });
  }, [rows, query, statusFilter]);

  const downloadFile = async (path: string, filename: string) => {
    const { data, error } = await supabase.storage.from("attachments").createSignedUrl(path, 300);
    if (error || !data?.signedUrl) {
      toast({ title: "Cannot open file", description: error?.message || "Try again", variant: "destructive" });
      return;
    }
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = filename;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login?next=/audits/my" replace />;

  const statuses = ["all","pending","paid","in_progress","under_review","completed","cancelled"];

  return (
    <>
      <Seo title="My audit submissions · Lantid" description="Track your Lantid audit engagements, uploaded documents, payment status and verification codes." path="/audits/my" />
      <section className="border-b border-border bg-gradient-brand-soft/40">
        <div className="max-w-6xl mx-auto px-6 py-10 lg:py-14">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
                <ShieldCheck className="h-3.5 w-3.5" /> Your engagements
              </div>
              <h1 className="text-3xl lg:text-4xl font-serif text-foreground">My audit submissions</h1>
              <p className="text-muted-foreground mt-2 text-sm max-w-xl">Track status, re-download uploaded documents, and grab your verification code once an audit is complete.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={load} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold hover:border-primary/60 transition disabled:opacity-50">
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
              </button>
              <Link to="/audits" className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold hover:shadow-brand transition">
                Start another audit <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="rounded-2xl border border-border bg-card p-4 flex flex-wrap gap-3 items-center mb-6">
          <div className="flex-1 min-w-[240px] relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by reference, company or audit type…"
              className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm">
              {statuses.map((s) => <option key={s} value={s}>{s === "all" ? "All statuses" : s.replace(/_/g, " ")}</option>)}
            </select>
          </div>
        </div>

        {rows.length === 0 && !refreshing ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-serif text-2xl text-foreground">Nothing submitted yet</h2>
            <p className="text-sm text-muted-foreground mt-2">Pick an audit to begin. Your drafts are saved automatically so you can return any time.</p>
            <Link to="/audits" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:shadow-brand transition">
              Browse audits <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left p-3">Reference</th>
                  <th className="text-left p-3">Audit</th>
                  <th className="text-left p-3">Company</th>
                  <th className="text-left p-3">Tier</th>
                  <th className="text-right p-3">Total</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Submitted</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="p-8 text-center text-muted-foreground text-sm">No submissions match your filters.</td></tr>
                )}
                {filtered.map((r) => {
                  const audit = AUDITS.find((a) => a.dbType === r.audit_type);
                  const intake = (r.intake || {}) as Record<string, unknown>;
                  const fileFields = Object.keys(intake).filter((k) => k.startsWith("__file_") && intake[k]);
                  return (
                    <Fragment key={r.id}>
                      <tr className="border-t border-border hover:bg-muted/30 cursor-pointer" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                        <td className="p-3 font-mono text-xs">{r.reference}</td>
                        <td className="p-3">{AUDIT_LABEL_BY_DBTYPE[r.audit_type] || r.audit_type}</td>
                        <td className="p-3 font-medium">{r.company_name}</td>
                        <td className="p-3 capitalize text-xs">{r.tier}</td>
                        <td className="p-3 text-right font-mono">{fmt(r.total_kobo)}</td>
                        <td className="p-3">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_TONE[r.status] || "bg-muted text-muted-foreground"}`}>
                            {r.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                        <td className="p-3 text-right">
                          {audit && !audit.external && (
                            <Link to={audit.route} onClick={(e) => e.stopPropagation()} className="text-primary text-xs hover:underline">Continue →</Link>
                          )}
                        </td>
                      </tr>
                      {expanded === r.id && (
                        <tr className="border-t border-border bg-muted/20">
                          <td colSpan={8} className="p-5">
                            <div className="grid md:grid-cols-3 gap-4 text-xs mb-4">
                              <div><div className="uppercase tracking-wider text-muted-foreground mb-1">Verification code</div><div className="font-mono">{r.verification_code || "—"}</div></div>
                              <div><div className="uppercase tracking-wider text-muted-foreground mb-1">Base / VAT / Total</div><div>{fmt(r.amount_kobo)} + {fmt(r.vat_kobo)} = <strong>{fmt(r.total_kobo)}</strong></div></div>
                              <div><div className="uppercase tracking-wider text-muted-foreground mb-1">Paid at</div><div>{r.paid_at ? new Date(r.paid_at).toLocaleString() : "—"}</div></div>
                            </div>
                            {fileFields.length > 0 && (
                              <div className="mb-4">
                                <div className="uppercase tracking-wider text-muted-foreground text-xs mb-2">Uploaded documents</div>
                                <div className="grid sm:grid-cols-2 gap-2">
                                  {fileFields.map((k) => {
                                    let items: { name: string; path: string }[] = [];
                                    try { items = JSON.parse(intake[k] as string); } catch { /* noop */ }
                                    return items.map((it, i) => (
                                      <button
                                        key={`${k}-${i}`}
                                        onClick={() => downloadFile(it.path, it.name)}
                                        className="text-left flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs hover:border-primary/60 hover:bg-primary/5 transition"
                                      >
                                        <span className="truncate flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-primary shrink-0" /> {it.name}</span>
                                        <Download className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                      </button>
                                    ));
                                  })}
                                </div>
                              </div>
                            )}
                            <div>
                              <div className="uppercase tracking-wider text-muted-foreground text-xs mb-2">Intake responses</div>
                              <div className="grid md:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                                {Object.entries(intake)
                                  .filter(([k]) => !k.startsWith("__file_"))
                                  .map(([k, v]) => (
                                    <div key={k} className="flex gap-2">
                                      <span className="text-muted-foreground shrink-0">{k}:</span>
                                      <span className="font-medium break-words">{String(v) || "—"}</span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
