import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Seo } from "@/components/site/Seo";
import { Loader2, ShieldCheck, ArrowRight, FileText, Search as SearchIcon, Filter, RefreshCw } from "lucide-react";
import { StatusTimeline, type EngagementStage } from "@/components/audits/StatusTimeline";

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

const TYPE_LABEL: Record<EngagementType, string> = {
  vapt: "VAPT",
  pci_dss: "PCI DSS",
  audit: "Audit",
};
const TYPE_TONE: Record<EngagementType, string> = {
  vapt: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  pci_dss: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  audit: "bg-primary/15 text-primary",
};

const fmt = (kobo: number, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format((kobo || 0) / 100);

export default function MyAudits() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | EngagementType>("all");
  const [stageFilter, setStageFilter] = useState<"all" | EngagementStage>("all");

  const load = async () => {
    if (!user) return;
    setRefreshing(true);
    const { data, error } = await supabase
      .from("engagements_v" as never)
      .select("id,type,public_id,user_id,company_name,subject,raw_status,status_stage,amount_kobo,currency,created_at,updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setRefreshing(false);
    if (error) {
      toast({ title: "Could not load engagements", description: error.message, variant: "destructive" });
      return;
    }
    setRows((data || []) as unknown as Row[]);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

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

  if (loading) return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login?next=/audits/my" replace />;

  const stages: (EngagementStage | "all")[] = ["all","requested","scoping","testing","draft","issued","revoked"];
  const types: ("all" | EngagementType)[] = ["all","vapt","pci_dss","audit"];

  return (
    <>
      <Seo title="My reports · Lantid" description="Unified view of your Lantid engagements — VAPT, PCI DSS, and compliance audits, with live status and downloads." path="/audits/my" />
      <section className="border-b border-border bg-gradient-brand-soft/40">
        <div className="max-w-6xl mx-auto px-6 py-10 lg:py-14">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-4">
                <ShieldCheck className="h-3.5 w-3.5" /> Your engagements
              </div>
              <h1 className="text-3xl lg:text-4xl font-serif text-foreground">My reports</h1>
              <p className="text-muted-foreground mt-2 text-sm max-w-xl">Every VAPT, PCI DSS assessment and compliance audit you've requested — with lifecycle status, documents, and messages in one place.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={load} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold hover:border-primary/60 transition disabled:opacity-50">
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
              </button>
              <Link to="/audits" className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold hover:shadow-brand transition">
                Start new engagement <ArrowRight className="h-3.5 w-3.5" />
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
              placeholder="Search by reference, company or scope…"
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

        {rows.length === 0 && !refreshing ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-serif text-2xl text-foreground">No engagements yet</h2>
            <p className="text-sm text-muted-foreground mt-2">Request an assessment or audit to get started. Everything lands here.</p>
            <Link to="/audits" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:shadow-brand transition">
              Browse services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground text-sm">No engagements match your filters.</div>
            )}
            {filtered.map((r) => (
              <Link
                key={`${r.type}-${r.id}`}
                to={`/audits/my/${r.type}/${r.id}`}
                className="block rounded-2xl border border-border bg-card p-5 hover:border-primary/60 hover:shadow-brand transition"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${TYPE_TONE[r.type]}`}>
                        {TYPE_LABEL[r.type]}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">{r.public_id}</span>
                    </div>
                    <div className="mt-1.5 font-semibold text-foreground truncate">{r.company_name || "—"}</div>
                    <div className="text-xs text-muted-foreground truncate mt-0.5">{r.subject || "—"}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-mono">{fmt(r.amount_kobo, r.currency)}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{new Date(r.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="mt-5">
                  <StatusTimeline stage={r.status_stage} size="sm" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
