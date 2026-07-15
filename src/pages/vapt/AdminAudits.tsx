import { useEffect, useState, useCallback, Fragment, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, CheckCircle2, Download, FileText, Loader2, PlayCircle, Search, ShieldCheck } from "lucide-react";
import { AUDITS, AUDIT_LABEL_BY_DBTYPE, IntakeField, auditBySlug } from "@/config/audits";

type AuditRow = {
  id: string;
  audit_type: string;
  tier: string;
  amount_kobo: number;
  vat_kobo: number;
  total_kobo: number;
  currency: string;
  status: string;
  reference: string;
  verification_code: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  intake: Record<string, unknown> | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

const STATUSES = ["pending","paid","in_progress","under_review","completed","cancelled"] as const;
const FILTER_OPTIONS = AUDITS.filter((a) => !a.external).map((a) => ({ value: a.dbType, label: a.name }));

const statusTone: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  paid: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  in_progress: "bg-primary/15 text-primary",
  under_review: "bg-primary/15 text-primary",
  completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-destructive/15 text-destructive",
};

const fmt = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);

type Completeness = {
  totalRequired: number;
  presentRequired: number;
  missingRequired: IntakeField[];
  totalDocs: number;
  presentDocs: number;
  missingDocs: IntakeField[];
};

function computeCompleteness(row: AuditRow): Completeness | null {
  const audit = AUDITS.find((a) => a.dbType === row.audit_type);
  if (!audit || !audit.sections) return null;
  const intake = (row.intake || {}) as Record<string, unknown>;

  const requiredFields: IntakeField[] = [];
  const docFields: IntakeField[] = [];
  audit.sections.forEach((s) => {
    s.fields.forEach((f) => {
      if (f.required) requiredFields.push(f);
      if (f.type === "file") docFields.push(f);
    });
  });

  const isPresent = (f: IntakeField) => {
    if (f.type === "file") {
      const raw = intake[`__file_${f.name}`];
      if (!raw || typeof raw !== "string") return false;
      try { return (JSON.parse(raw) as unknown[]).length > 0; } catch { return false; }
    }
    const v = intake[f.name];
    return typeof v === "string" ? v.trim().length > 0 : v != null;
  };

  const missingRequired = requiredFields.filter((f) => !isPresent(f));
  const missingDocs = docFields.filter((f) => !isPresent(f));
  return {
    totalRequired: requiredFields.length,
    presentRequired: requiredFields.length - missingRequired.length,
    missingRequired,
    totalDocs: docFields.length,
    presentDocs: docFields.length - missingDocs.length,
    missingDocs,
  };
}

export default function AdminAudits() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [completenessFilter, setCompletenessFilter] = useState<"all" | "complete" | "incomplete">("all");

  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("audit_requests" as never)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setRows((data || []) as unknown as AuditRow[]);
  }, [toast]);

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);

  const updateStatus = async (id: string, status: string) => {
    setBusy(id);
    const { error } = await supabase.from("audit_requests" as never).update({ status } as never).eq("id", id);
    setBusy(null);
    if (error) { toast({ title: "Update failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Status updated" });
    load();
  };

  const openFile = async (path: string, filename: string) => {
    const { data, error } = await supabase.storage.from("attachments").createSignedUrl(path, 300);
    if (error || !data?.signedUrl) {
      toast({ title: "Cannot open file", description: error?.message || "Ensure admin storage policy is applied.", variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== "all" && r.audit_type !== filter) return false;
      if (q && !(
        r.reference.toLowerCase().includes(q) ||
        r.company_name?.toLowerCase().includes(q) ||
        r.contact_email?.toLowerCase().includes(q) ||
        (AUDIT_LABEL_BY_DBTYPE[r.audit_type] || "").toLowerCase().includes(q)
      )) return false;
      if (completenessFilter !== "all") {
        const c = computeCompleteness(r);
        if (!c) return completenessFilter === "complete";
        const complete = c.missingRequired.length === 0;
        if (completenessFilter === "complete" && !complete) return false;
        if (completenessFilter === "incomplete" && complete) return false;
      }
      return true;
    });
  }, [rows, filter, search, completenessFilter]);

  if (loading || isAdmin === null) return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login?next=/admin/audits" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-serif flex items-center gap-2"><ShieldCheck className="h-7 w-7 text-primary" /> Audit intake review</h1>
          <p className="text-muted-foreground text-sm mt-1">Review submissions, verify upload completeness, and mark engagements ready for processing. VAPT and PCI DSS have their own dashboards.</p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="rounded-2xl border border-border bg-card p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference, company, contact, audit type…"
            className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm min-w-[200px]">
          <option value="all">All audit types ({rows.length})</option>
          {FILTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={completenessFilter} onChange={(e) => setCompletenessFilter(e.target.value as "all" | "complete" | "incomplete")} className="rounded-xl border border-input bg-background px-3 py-2 text-sm">
          <option value="all">All completeness</option>
          <option value="complete">Complete only</option>
          <option value="incomplete">Missing required</option>
        </select>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left p-3">Reference</th>
              <th className="text-left p-3">Audit</th>
              <th className="text-left p-3">Company</th>
              <th className="text-left p-3">Completeness</th>
              <th className="text-left p-3">Tier</th>
              <th className="text-right p-3">Total</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No submissions match your filters.</td></tr>
            )}
            {filtered.map((r) => {
              const c = computeCompleteness(r);
              const complete = c ? c.missingRequired.length === 0 : true;
              return (
                <Fragment key={r.id}>
                  <tr className="border-t border-border hover:bg-muted/30 cursor-pointer" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                    <td className="p-3 font-mono text-xs">{r.reference}</td>
                    <td className="p-3">{AUDIT_LABEL_BY_DBTYPE[r.audit_type] || r.audit_type}</td>
                    <td className="p-3">
                      <div className="font-medium">{r.company_name}</div>
                      <div className="text-xs text-muted-foreground">{r.contact_name} · {r.contact_email}</div>
                    </td>
                    <td className="p-3">
                      {c ? (
                        <div className="text-xs">
                          <div className={`inline-flex items-center gap-1 font-semibold ${complete ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                            {complete ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                            {c.presentRequired}/{c.totalRequired} required
                          </div>
                          <div className="text-muted-foreground mt-0.5">{c.presentDocs}/{c.totalDocs} docs uploaded</div>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="p-3 capitalize text-xs">{r.tier}</td>
                    <td className="p-3 text-right font-mono">{fmt(r.total_kobo)}</td>
                    <td className="p-3">
                      <select
                        value={r.status}
                        onChange={(e) => { e.stopPropagation(); updateStatus(r.id, e.target.value); }}
                        onClick={(e) => e.stopPropagation()}
                        disabled={busy === r.id}
                        className={`rounded-lg px-2 py-1 text-xs font-medium border border-border ${statusTone[r.status] || ""}`}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                      </select>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">{new Date(r.created_at).toLocaleString()}</td>
                  </tr>
                  {expanded === r.id && (
                    <tr className="border-t border-border bg-muted/20">
                      <td colSpan={8} className="p-5">
                        <div className="grid md:grid-cols-3 gap-4 text-xs mb-5">
                          <div><div className="uppercase tracking-wider text-muted-foreground mb-1">Verification code</div><div className="font-mono">{r.verification_code}</div></div>
                          <div><div className="uppercase tracking-wider text-muted-foreground mb-1">Base / VAT / Total</div><div>{fmt(r.amount_kobo)} + {fmt(r.vat_kobo)} = <strong>{fmt(r.total_kobo)}</strong></div></div>
                          <div><div className="uppercase tracking-wider text-muted-foreground mb-1">Paid at</div><div>{r.paid_at ? new Date(r.paid_at).toLocaleString() : "—"}</div></div>
                        </div>

                        {c && (c.missingRequired.length > 0 || c.missingDocs.length > 0) && (
                          <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
                              <AlertTriangle className="h-3.5 w-3.5" /> Missing items
                            </div>
                            {c.missingRequired.length > 0 && (
                              <div className="text-xs">
                                <div className="font-semibold text-foreground mb-1">Required fields ({c.missingRequired.length}):</div>
                                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                                  {c.missingRequired.map((f) => <li key={f.name}>{f.label}</li>)}
                                </ul>
                              </div>
                            )}
                            {c.missingDocs.length > 0 && (
                              <div className="text-xs mt-3">
                                <div className="font-semibold text-foreground mb-1">Missing documents ({c.missingDocs.length}):</div>
                                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                                  {c.missingDocs.map((f) => <li key={f.name}>{f.label}{f.required ? " (required)" : ""}</li>)}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 mb-5">
                          <button
                            onClick={() => updateStatus(r.id, "in_progress")}
                            disabled={busy === r.id || r.status === "in_progress"}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold hover:shadow-brand transition disabled:opacity-50"
                          >
                            <PlayCircle className="h-3.5 w-3.5" /> Mark ready for processing
                          </button>
                          <button
                            onClick={() => updateStatus(r.id, "under_review")}
                            disabled={busy === r.id || r.status === "under_review"}
                            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold hover:border-primary/60 transition disabled:opacity-50"
                          >
                            Under review
                          </button>
                          <button
                            onClick={() => updateStatus(r.id, "completed")}
                            disabled={busy === r.id || r.status === "completed"}
                            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-500/5 px-4 py-2 text-xs font-semibold hover:bg-emerald-500/10 transition disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                          </button>
                        </div>

                        {/* Documents */}
                        {r.intake && Object.keys(r.intake).some((k) => k.startsWith("__file_")) && (
                          <div className="mb-5">
                            <div className="uppercase tracking-wider text-muted-foreground text-xs mb-2">Uploaded documents</div>
                            <div className="grid sm:grid-cols-2 gap-2">
                              {Object.entries(r.intake)
                                .filter(([k, v]) => k.startsWith("__file_") && v)
                                .map(([k, v]) => {
                                  let items: { name: string; path: string }[] = [];
                                  try { items = JSON.parse(v as string); } catch { /* noop */ }
                                  const fieldName = k.replace(/^__file_/, "");
                                  const audit = auditBySlug(AUDITS.find((a) => a.dbType === r.audit_type)?.slug || "");
                                  const label = audit?.sections?.flatMap((s) => s.fields).find((f) => f.name === fieldName)?.label || fieldName;
                                  return items.map((it, i) => (
                                    <button
                                      key={`${k}-${i}`}
                                      onClick={() => openFile(it.path, it.name)}
                                      className="text-left rounded-lg border border-border bg-background px-3 py-2 hover:border-primary/60 hover:bg-primary/5 transition"
                                    >
                                      <div className="flex items-center gap-2 text-xs font-medium truncate">
                                        <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                                        <span className="truncate">{it.name}</span>
                                        <Download className="h-3 w-3 text-muted-foreground ml-auto shrink-0" />
                                      </div>
                                      <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{label}</div>
                                    </button>
                                  ));
                                })}
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="uppercase tracking-wider text-muted-foreground text-xs mb-2">Intake responses</div>
                          <div className="grid md:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                            {r.intake && Object.entries(r.intake)
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
    </div>
  );
}
