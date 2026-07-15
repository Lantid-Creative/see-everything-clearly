import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Seo } from "@/components/site/Seo";
import { Loader2, ShieldCheck, RefreshCw, Search as SearchIcon, Filter, Ban } from "lucide-react";
import type { EngagementStage } from "@/components/audits/StatusTimeline";

type EngagementType = "vapt" | "pci_dss" | "audit";

type Row = {
  id: string;
  type: EngagementType;
  public_id: string;
  user_id: string;
  company_name: string | null;
  subject: string | null;
  raw_status: string;
  status_stage: EngagementStage;
  amount_kobo: number;
  currency: string;
  created_at: string;
  updated_at: string;
};

const TYPE_LABEL: Record<EngagementType, string> = { vapt: "VAPT", pci_dss: "PCI DSS", audit: "Audit" };
const TYPE_TONE: Record<EngagementType, string> = {
  vapt: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  pci_dss: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  audit: "bg-primary/15 text-primary",
};
const STAGE_TONE: Record<EngagementStage, string> = {
  requested: "bg-muted text-muted-foreground",
  scoping: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  testing: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  draft: "bg-primary/15 text-primary",
  issued: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  revoked: "bg-destructive/15 text-destructive",
};

const fmt = (kobo: number, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format((kobo || 0) / 100);

export default function AdminQueue() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | EngagementType>("all");
  const [stageFilter, setStageFilter] = useState<"all" | EngagementStage>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    })();
  }, [user]);

  const load = async () => {
    if (!user) return;
    setRefreshing(true);
    const { data, error } = await supabase
      .from("engagements_v" as never)
      .select("id,type,public_id,user_id,company_name,subject,raw_status,status_stage,amount_kobo,currency,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(500);
    setRefreshing(false);
    if (error) {
      toast({ title: "Could not load queue", description: error.message, variant: "destructive" });
      return;
    }
    setRows((data || []) as unknown as Row[]);
  };

  useEffect(() => { if (isAdmin) load(); /* eslint-disable-next-line */ }, [isAdmin]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (stageFilter !== "all" && r.status_stage !== stageFilter) return false;
      if (!q) return true;
      return (
        r.public_id.toLowerCase().includes(q) ||
        (r.company_name || "").toLowerCase().includes(q) ||
        (r.subject || "").toLowerCase().includes(q)
      );
    });
  }, [rows, query, typeFilter, stageFilter]);

  const toggle = (key: string) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key); else next.add(key);
    setSelected(next);
  };

  const bulkRevoke = async () => {
    if (selected.size === 0) return;
    const reason = prompt(`Revoke ${selected.size} engagement(s). Reason (shown to client):`);
    if (!reason || !reason.trim()) return;
    setRevoking(true);
    try {
      // Group by type
      const byType: Record<EngagementType, string[]> = { vapt: [], pci_dss: [], audit: [] };
      for (const k of selected) {
        const [type, id] = k.split(":") as [EngagementType, string];
        byType[type].push(id);
      }
      const tables: Record<EngagementType, string> = { vapt: "vapt_requests", pci_dss: "pci_dss_requests", audit: "audit_requests" };
      for (const t of Object.keys(byType) as EngagementType[]) {
        if (byType[t].length === 0) continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from(tables[t]).update({ status_stage: "revoked" }).in("id", byType[t]);
        if (error) throw error;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("admin_action_log").insert(
          byType[t].map((id) => ({
            actor_id: user!.id,
            action: "revoke",
            entity_type: t,
            entity_id: id,
            reason,
          }))
        );
      }
      // Notify clients
      const affected = rows.filter((r) => selected.has(`${r.type}:${r.id}`));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("notifications").insert(
        affected.map((r) => ({
          user_id: r.user_id,
          type: "engagement",
          title: `Engagement revoked: ${r.public_id}`,
          message: reason,
          entity_type: r.type,
          entity_id: r.id,
        }))
      );
      toast({ title: "Revoked", description: `${selected.size} engagement(s) revoked.` });
      setSelected(new Set());
      await load();
    } catch (e) {
      toast({ title: "Revoke failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setRevoking(false);
    }
  };

  if (loading || isAdmin === null) return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login?next=/admin/queue" replace />;
  if (!isAdmin) return <Navigate to="/audits/my" replace />;

  const stages: (EngagementStage | "all")[] = ["all","requested","scoping","testing","draft","issued","revoked"];
  const types: ("all" | EngagementType)[] = ["all","vapt","pci_dss","audit"];

  return (
    <>
      <Seo title="Admin queue · Lantid" description="Unified queue of every VAPT, PCI DSS and audit engagement." path="/admin/queue" />
      <section className="border-b border-border bg-gradient-brand-soft/40">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-3">
                <ShieldCheck className="h-3.5 w-3.5" /> Admin
              </div>
              <h1 className="text-2xl lg:text-3xl font-serif text-foreground">Engagement queue</h1>
              <p className="text-muted-foreground mt-1 text-sm">Every VAPT, PCI DSS and audit engagement across the platform.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={load} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold hover:border-primary/60 transition disabled:opacity-50">
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
              </button>
              {selected.size > 0 && (
                <button onClick={bulkRevoke} disabled={revoking} className="inline-flex items-center gap-2 rounded-xl bg-destructive text-destructive-foreground px-3 py-2 text-xs font-semibold hover:opacity-90 transition disabled:opacity-50">
                  {revoking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />} Bulk revoke ({selected.size})
                </button>
              )}
              <Link to="/admin/vapt" className="rounded-xl border border-border bg-card px-3 py-2 text-xs">VAPT admin</Link>
              <Link to="/admin/pci-dss" className="rounded-xl border border-border bg-card px-3 py-2 text-xs">PCI admin</Link>
              <Link to="/admin/audits" className="rounded-xl border border-border bg-card px-3 py-2 text-xs">Audit admin</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-6">
        <div className="rounded-2xl border border-border bg-card p-4 flex flex-wrap gap-3 items-center mb-4">
          <div className="flex-1 min-w-[240px] relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reference, company or subject…"
              className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as never)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm">
              {types.map((t) => <option key={t} value={t}>{t === "all" ? "All types" : TYPE_LABEL[t]}</option>)}
            </select>
            <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value as never)} className="rounded-xl border border-input bg-background px-3 py-2 text-sm">
              {stages.map((s) => <option key={s} value={s}>{s === "all" ? "All stages" : s}</option>)}
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-3 w-8"></th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Reference</th>
                <th className="text-left p-3">Company</th>
                <th className="text-left p-3">Subject</th>
                <th className="text-right p-3">Amount</th>
                <th className="text-left p-3">Stage</th>
                <th className="text-left p-3">Raw status</th>
                <th className="text-left p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="p-8 text-center text-muted-foreground text-sm">No engagements match your filters.</td></tr>
              )}
              {filtered.map((r) => {
                const key = `${r.type}:${r.id}`;
                return (
                  <tr key={key} className="border-t border-border hover:bg-muted/30">
                    <td className="p-3">
                      <input type="checkbox" checked={selected.has(key)} onChange={() => toggle(key)} />
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${TYPE_TONE[r.type]}`}>
                        {TYPE_LABEL[r.type]}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs">
                      <Link to={`/audits/my/${r.type}/${r.id}`} className="text-primary hover:underline">{r.public_id}</Link>
                    </td>
                    <td className="p-3 font-medium truncate max-w-[220px]">{r.company_name || "—"}</td>
                    <td className="p-3 text-xs truncate max-w-[240px]">{r.subject || "—"}</td>
                    <td className="p-3 text-right font-mono text-xs">{fmt(r.amount_kobo, r.currency)}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STAGE_TONE[r.status_stage]}`}>
                        {r.status_stage}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{r.raw_status}</td>
                    <td className="p-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
