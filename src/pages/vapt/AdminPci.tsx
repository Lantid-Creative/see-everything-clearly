import { useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck } from "lucide-react";

type PciReq = {
  id: string;
  public_id: string;
  user_id: string | null;
  company: string;
  contact_person: string;
  email: string;
  website: string | null;
  saq_type: string | null;
  merchant_level: string | null;
  annual_transactions: string | null;
  environment: string | null;
  current_status: string | null;
  timeline: string | null;
  notes: string | null;
  tier: string;
  amount_kobo: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
};

const STATUSES = [
  "new",
  "pending_payment",
  "paid",
  "scoping",
  "in_progress",
  "delivered",
  "closed",
  "cancelled",
] as const;

const statusTone: Record<string, string> = {
  new: "bg-muted text-foreground",
  pending_payment: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  paid: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  scoping: "bg-primary/15 text-primary",
  in_progress: "bg-primary/15 text-primary",
  delivered: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  closed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/15 text-destructive",
};

export default function AdminPci() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<PciReq[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    })();
  }, [user]);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("pci_dss_requests" as never)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Load failed", description: error.message, variant: "destructive" });
      return;
    }
    setRows((data as unknown as PciReq[]) || []);
  }, [toast]);

  useEffect(() => { if (isAdmin) refresh(); }, [isAdmin, refresh]);

  if (loading || isAdmin === null) return <Loader />;
  if (!user) return <Navigate to="/login?next=/admin/pci-dss" replace />;
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-serif">Admin access required</h1>
        <p className="text-muted-foreground mt-2">Sign in with an admin account to view PCI DSS submissions.</p>
      </div>
    );
  }

  const setStatus = async (id: string, status: string) => {
    setBusy(id);
    const { error } = await supabase
      .from("pci_dss_requests" as never)
      .update({ status } as never)
      .eq("id", id);
    setBusy(null);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else refresh();
  };

  const totalCollected = rows
    .filter((r) => ["paid", "scoping", "in_progress", "delivered", "closed"].includes(r.status))
    .reduce((s, r) => s + (r.amount_kobo || 0), 0) / 100;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-primary font-semibold">Admin</div>
          <h1 className="text-3xl font-serif tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" /> PCI DSS submissions
          </h1>
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{rows.length}</span> submissions •{" "}
          <span className="font-semibold text-foreground">₦{totalCollected.toLocaleString()}</span> collected
        </div>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          No PCI DSS submissions yet.
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">Reference</th>
                  <th className="text-left font-semibold px-4 py-3">Company</th>
                  <th className="text-left font-semibold px-4 py-3">Contact</th>
                  <th className="text-left font-semibold px-4 py-3">Tier</th>
                  <th className="text-right font-semibold px-4 py-3">Amount</th>
                  <th className="text-left font-semibold px-4 py-3">Status</th>
                  <th className="text-left font-semibold px-4 py-3">Submitted</th>
                  <th className="text-left font-semibold px-4 py-3">Updated</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <>
                    <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs">{r.public_id}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">{r.company}</td>
                      <td className="px-4 py-3">
                        <div>{r.contact_person}</div>
                        <a href={`mailto:${r.email}`} className="text-xs text-muted-foreground hover:text-primary">{r.email}</a>
                      </td>
                      <td className="px-4 py-3 uppercase text-xs tracking-wider">{r.tier}</td>
                      <td className="px-4 py-3 text-right font-mono">₦{(r.amount_kobo / 100).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <select
                          value={r.status}
                          disabled={busy === r.id}
                          onChange={(e) => setStatus(r.id, e.target.value)}
                          className={`rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wider border-0 focus:outline-none focus:ring-2 focus:ring-primary/30 ${statusTone[r.status] || "bg-muted"}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s.replace("_", " ")}</option>
                          ))}
                          {!STATUSES.includes(r.status as typeof STATUSES[number]) && (
                            <option value={r.status}>{r.status}</option>
                          )}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(r.updated_at).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          {expanded === r.id ? "Hide" : "Details"}
                        </button>
                      </td>
                    </tr>
                    {expanded === r.id && (
                      <tr className="border-t border-border bg-muted/20">
                        <td colSpan={9} className="px-4 py-4">
                          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                            <Detail label="Website" value={r.website} />
                            <Detail label="Assessment type (SAQ)" value={r.saq_type} />
                            <Detail label="Merchant level" value={r.merchant_level} />
                            <Detail label="Annual transactions" value={r.annual_transactions} />
                            <Detail label="Target timeline" value={r.timeline} />
                            <Detail label="Environment" value={r.environment} block />
                            <Detail label="Current status" value={r.current_status} block />
                            <Detail label="Notes" value={r.notes} block />
                          </dl>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, block }: { label: string; value: string | null | undefined; block?: boolean }) {
  return (
    <div className={block ? "sm:col-span-2" : ""}>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</dt>
      <dd className="mt-0.5 text-foreground/90 whitespace-pre-wrap">{value || <span className="text-muted-foreground italic">—</span>}</dd>
    </div>
  );
}

function Loader() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
