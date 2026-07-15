import { useEffect, useState, useCallback, Fragment } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck } from "lucide-react";

type AuditRow = {
  id: string;
  audit_type: "aml_cft" | "iso_27001" | "ndpr";
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
const AUDIT_LABEL: Record<string,string> = { aml_cft: "AML / CFT", iso_27001: "ISO 27001", ndpr: "NDPR / NDPA" };

const statusTone: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  paid: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  in_progress: "bg-primary/15 text-primary",
  under_review: "bg-primary/15 text-primary",
  completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-destructive/15 text-destructive",
};

const fmt = (kobo: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);

export default function AdminAudits() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

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

  if (loading || isAdmin === null) return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login?next=/admin/audits" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const filtered = filter === "all" ? rows : rows.filter((r) => r.audit_type === filter);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif flex items-center gap-2"><ShieldCheck className="h-7 w-7 text-primary" /> Audit submissions</h1>
          <p className="text-muted-foreground text-sm mt-1">AML/CFT, ISO 27001, and NDPR/NDPA engagements. VAPT and PCI DSS have their own dashboards.</p>
        </div>
        <select value={filter} onChange={(e)=>setFilter(e.target.value)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm">
          <option value="all">All audit types</option>
          <option value="aml_cft">AML / CFT</option>
          <option value="iso_27001">ISO 27001</option>
          <option value="ndpr">NDPR / NDPA</option>
        </select>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left p-3">Reference</th>
              <th className="text-left p-3">Audit</th>
              <th className="text-left p-3">Company</th>
              <th className="text-left p-3">Contact</th>
              <th className="text-left p-3">Tier</th>
              <th className="text-right p-3">Total</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">No submissions{filter !== "all" ? " for this audit type" : ""} yet.</td></tr>
            )}
            {filtered.map((r) => (
              <Fragment key={r.id}>
                <tr className="border-t border-border hover:bg-muted/30 cursor-pointer" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                  <td className="p-3 font-mono text-xs">{r.reference}</td>
                  <td className="p-3">{AUDIT_LABEL[r.audit_type]}</td>
                  <td className="p-3 font-medium">{r.company_name}</td>
                  <td className="p-3"><div>{r.contact_name}</div><div className="text-xs text-muted-foreground">{r.contact_email}</div></td>
                  <td className="p-3 capitalize">{r.tier}</td>
                  <td className="p-3 text-right font-mono">{fmt(r.total_kobo)}</td>
                  <td className="p-3">
                    <select
                      value={r.status}
                      onChange={(e) => { e.stopPropagation(); updateStatus(r.id, e.target.value); }}
                      onClick={(e) => e.stopPropagation()}
                      disabled={busy === r.id}
                      className={`rounded-lg px-2 py-1 text-xs font-medium border border-border ${statusTone[r.status] || ""}`}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
                    </select>
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">{new Date(r.created_at).toLocaleString()}</td>
                </tr>
                {expanded === r.id && (
                  <tr className="border-t border-border bg-muted/20">
                    <td colSpan={8} className="p-5">
                      <div className="grid md:grid-cols-3 gap-4 text-xs">
                        <div><div className="uppercase tracking-wider text-muted-foreground mb-1">Verification code</div><div className="font-mono">{r.verification_code}</div></div>
                        <div><div className="uppercase tracking-wider text-muted-foreground mb-1">Base / VAT / Total</div><div>{fmt(r.amount_kobo)} + {fmt(r.vat_kobo)} = <strong>{fmt(r.total_kobo)}</strong></div></div>
                        <div><div className="uppercase tracking-wider text-muted-foreground mb-1">Paid at</div><div>{r.paid_at ? new Date(r.paid_at).toLocaleString() : "—"}</div></div>
                      </div>
                      <div className="mt-4">
                        <div className="uppercase tracking-wider text-muted-foreground text-xs mb-2">Intake responses</div>
                        <div className="grid md:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                          {r.intake && Object.entries(r.intake).map(([k,v]) => (
                            <div key={k} className="flex gap-2">
                              <span className="text-muted-foreground shrink-0">{k}:</span>
                              <span className="font-medium">{String(v) || "—"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
