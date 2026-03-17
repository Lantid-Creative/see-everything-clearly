import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useChecklistProgress } from "@/hooks/useChecklistProgress";
import { PHASE_GUIDES, type ProductPhase } from "@/hooks/useProductPhase";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Crosshair,
  Target,
  Users,
  TrendingUp,
  StickyNote,
  Download,
  Save,
  Loader2,
  CheckCircle2,
  MessageSquare,
  GitBranch,
  Mail,
  FileText,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { exportAsCSV } from "@/lib/exportUtils";
import type { ViewMode } from "@/pages/Index";

interface ProductDetails {
  id?: string;
  product_id: string;
  user_id: string;
  vision: string;
  target_audience: string;
  success_metrics: string;
  key_objectives: string;
  context_notes: string;
}

interface CommandCenterViewProps {
  activeProductId: string | null;
  activeProductName?: string;
  currentPhase?: ProductPhase | null;
  onNavigate?: (view: ViewMode) => void;
}

export function CommandCenterView({
  activeProductId,
  activeProductName,
  currentPhase,
  onNavigate,
}: CommandCenterViewProps) {
  const { user } = useAuth();
  const workspace = useWorkspaceContext();
  const profile = useUserProfile();
  const { isCompleted } = useChecklistProgress(activeProductId);

  const [details, setDetails] = useState<ProductDetails | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const guide = currentPhase ? PHASE_GUIDES[currentPhase] : null;

  // Build checklist from guide function
  const phaseInput = {
    totalLeads: workspace?.totalLeads ?? 0,
    totalConversations: workspace?.totalConversations ?? 0,
    totalWorkflows: workspace?.totalWorkflows ?? 0,
    emailsSent: workspace?.emailsSent ?? 0,
    teamMembers: workspace?.teamMembers ?? 0,
    profile: profile ?? null,
  };
  const checklist = guide ? guide.checklist(phaseInput) : [];
  const completedCount = checklist.filter((item) => isCompleted(item.id)).length;

  // Load product details
  useEffect(() => {
    if (!user || !activeProductId) return;
    (async () => {
      const { data } = await supabase
        .from("product_details")
        .select("*")
        .eq("product_id", activeProductId)
        .maybeSingle();

      if (data) {
        setDetails(data as unknown as ProductDetails);
      } else {
        setDetails({
          product_id: activeProductId,
          user_id: user.id,
          vision: "",
          target_audience: "",
          success_metrics: "",
          key_objectives: "",
          context_notes: "",
        });
      }
      setLoaded(true);
      setDirty(false);
    })();
  }, [user, activeProductId]);

  const updateField = useCallback(
    (field: keyof ProductDetails, value: string) => {
      setDetails((prev) => (prev ? { ...prev, [field]: value } : prev));
      setDirty(true);
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!details || !user || !activeProductId) return;
    setSaving(true);
    try {
      const payload = {
        product_id: activeProductId,
        user_id: user.id,
        vision: details.vision,
        target_audience: details.target_audience,
        success_metrics: details.success_metrics,
        key_objectives: details.key_objectives,
        context_notes: details.context_notes,
        updated_at: new Date().toISOString(),
      };

      if (details.id) {
        await supabase.from("product_details").update(payload).eq("id", details.id);
      } else {
        const { data } = await supabase
          .from("product_details")
          .insert(payload)
          .select()
          .single();
        if (data) setDetails(data as unknown as ProductDetails);
      }
      setDirty(false);
      toast.success("Command Center saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }, [details, user, activeProductId]);

  const handleExportReport = useCallback(() => {
    if (!details) return;

    const headers = ["Field", "Value"];
    const rows = [
      ["Product", activeProductName || "—"],
      ["Current Phase", guide?.label || "Auto-detect"],
      ["Vision", details.vision || "—"],
      ["Target Audience", details.target_audience || "—"],
      ["Key Objectives", details.key_objectives || "—"],
      ["Success Metrics", details.success_metrics || "—"],
      ["Context Notes", details.context_notes || "—"],
      ["Total Leads", String(workspace?.totalLeads ?? 0)],
      ["Total Conversations", String(workspace?.totalConversations ?? 0)],
      ["Total Workflows", String(workspace?.totalWorkflows ?? 0)],
      ["Emails Sent", String(workspace?.emailsSent ?? 0)],
      ["Team Members", String(workspace?.teamMembers ?? 0)],
      ["Checklist Completed", `${completedCount} / ${checklist.length}`],
      ["Report Date", new Date().toLocaleDateString()],
    ];

    exportAsCSV(`${activeProductName || "product"}-report`, headers, rows);
    toast.success("Report downloaded");
  }, [details, workspace, activeProductName, guide, completedCount, checklist.length]);

  const stats = [
    { label: "Leads", value: workspace?.totalLeads ?? 0, icon: Users, color: "text-blue-500" },
    { label: "Conversations", value: workspace?.totalConversations ?? 0, icon: MessageSquare, color: "text-primary" },
    { label: "Workflows", value: workspace?.totalWorkflows ?? 0, icon: GitBranch, color: "text-emerald-500" },
    { label: "Emails Sent", value: workspace?.emailsSent ?? 0, icon: Mail, color: "text-amber-500" },
    { label: "Team Members", value: workspace?.teamMembers ?? 0, icon: Users, color: "text-violet-500" },
    { label: "Checklist Done", value: completedCount, icon: CheckCircle2, color: "text-green-500" },
  ];

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="h-12 flex items-center justify-between px-4 border-b shrink-0">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="mr-1" />
          <Crosshair className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Command Center</span>
          {activeProductName && (
            <span className="text-xs text-muted-foreground ml-1">— {activeProductName}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 bg-primary text-primary-foreground hover:bg-primary/90 disabled:hover:bg-primary"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
          </button>
          <NotificationBell />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          {guide && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
              <span className="text-lg">{guide.emoji}</span>
              <span className="text-sm font-medium text-foreground">{guide.label} Phase</span>
              <span className="text-xs text-muted-foreground">— {guide.tagline}</span>
            </motion.div>
          )}

          {/* Vision & Goals */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="border border-border rounded-2xl bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Vision & Goals</h2>
            </div>
            <div className="p-6 space-y-4">
              <FieldBlock label="Product Vision" placeholder="What problem does this product solve?" value={details?.vision || ""} onChange={(v) => updateField("vision", v)} />
              <FieldBlock label="Target Audience" placeholder="Who are the primary users?" value={details?.target_audience || ""} onChange={(v) => updateField("target_audience", v)} />
              <FieldBlock label="Key Objectives" placeholder="Top 3-5 objectives for this product cycle." value={details?.key_objectives || ""} onChange={(v) => updateField("key_objectives", v)} />
              <FieldBlock label="Success Metrics" placeholder="KPIs, targets, milestones." value={details?.success_metrics || ""} onChange={(v) => updateField("success_metrics", v)} />
            </div>
          </motion.section>

          {/* Progress & Stats */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="border border-border rounded-2xl bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Progress & Stats</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                    <stat.icon className={`h-5 w-5 ${stat.color} shrink-0`} />
                    <div>
                      <p className="text-lg font-bold text-foreground leading-none">{stat.value}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
              {guide && (
                <div className="mt-5 pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">Phase checklist progress</span>
                    <span className="text-xs text-muted-foreground">{completedCount} / {checklist.length} items</span>
                  </div>
                  <Progress value={checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0} className="h-2" />
                </div>
              )}
            </div>
          </motion.section>

          {/* Context Notes */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="border border-border rounded-2xl bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Context Notes</h2>
              <span className="text-[10px] text-muted-foreground ml-1">— Competitive insights, positioning, pitch angles</span>
            </div>
            <div className="p-6">
              <Textarea
                value={details?.context_notes || ""}
                onChange={(e) => updateField("context_notes", e.target.value)}
                placeholder="Add free-form notes — competitive analysis, pitch angles, user interview takeaways. This context feeds into AI conversations."
                className="min-h-[160px] text-sm resize-y bg-background border-border"
              />
            </div>
          </motion.section>

          {/* Export & Reports */}
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="border border-border rounded-2xl bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Export & Reports</h2>
            </div>
            <div className="p-6">
              <p className="text-xs text-muted-foreground mb-4">Download a snapshot of your product context, progress stats, and checklist status as a CSV report.</p>
              <button onClick={handleExportReport} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                <Download className="h-4 w-4" />
                Download Project Report
              </button>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

function FieldBlock({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="min-h-[80px] text-sm resize-y bg-background border-border" />
    </div>
  );
}
