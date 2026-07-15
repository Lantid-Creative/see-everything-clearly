import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Seo } from "@/components/site/Seo";
import {
  Loader2, ArrowLeft, Send, Paperclip, Download, FileText, MessageSquare,
  FileSignature, History, Upload, ShieldCheck, CheckCircle2, RotateCcw,
} from "lucide-react";
import { StatusTimeline, type EngagementStage } from "@/components/audits/StatusTimeline";

type EngagementType = "vapt" | "pci_dss" | "audit";
type DocKind = "engagement_letter" | "scope_confirmation" | "report" | "retest" | "invoice" | "other";

type Engagement = {
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
};

type Message = {
  id: string;
  sender_id: string;
  body: string;
  attachment_path: string | null;
  is_admin: boolean;
  created_at: string;
};

type Doc = {
  id: string;
  kind: DocKind;
  version: number;
  storage_path: string;
  issued_at: string;
  notes: string | null;
  superseded: boolean;
};

const TYPE_LABEL: Record<EngagementType, string> = { vapt: "VAPT", pci_dss: "PCI DSS", audit: "Audit" };
const DOC_LABEL: Record<DocKind, string> = {
  engagement_letter: "Engagement letter",
  scope_confirmation: "Scope confirmation",
  report: "Report",
  retest: "Retest / Delta",
  invoice: "Invoice",
  other: "Document",
};
const VERSIONABLE_KINDS: DocKind[] = ["report", "retest"];

export default function EngagementDetail() {
  const { type, id } = useParams<{ type: EngagementType; id: string }>();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [tab, setTab] = useState<"thread" | "documents" | "admin">("thread");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Admin version issuance state
  const [issueKind, setIssueKind] = useState<DocKind>("report");
  const [issueNotes, setIssueNotes] = useState("");
  const [issueFile, setIssueFile] = useState<File | null>(null);
  const issueFileRef = useRef<HTMLInputElement>(null);
  const [issuing, setIssuing] = useState(false);
  const [bumpStage, setBumpStage] = useState(true);

  const validType = type === "vapt" || type === "pci_dss" || type === "audit";

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
    if (!user || !id || !validType) return;
    setLoadingData(true);
    const [eng, msgs, ds] = await Promise.all([
      supabase.from("engagements_v" as never)
        .select("id,type,public_id,user_id,company_name,subject,raw_status,status_stage,amount_kobo,currency,created_at")
        .eq("type", type).eq("id", id).maybeSingle(),
      supabase.from("engagement_messages" as never)
        .select("id,sender_id,body,attachment_path,is_admin,created_at")
        .eq("engagement_type", type).eq("engagement_id", id)
        .order("created_at", { ascending: true }),
      supabase.from("engagement_documents" as never)
        .select("id,kind,version,storage_path,issued_at,notes,superseded")
        .eq("engagement_type", type).eq("engagement_id", id)
        .order("kind", { ascending: true })
        .order("version", { ascending: false }),
    ]);
    setLoadingData(false);
    if (eng.error) toast({ title: "Could not load engagement", description: eng.error.message, variant: "destructive" });
    setEngagement((eng.data as unknown as Engagement) || null);
    setMessages((msgs.data as unknown as Message[]) || []);
    setDocs((ds.data as unknown as Doc[]) || []);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user, id, type]);

  // Group docs by kind, preserving version-desc order
  const grouped = useMemo(() => {
    const g = new Map<DocKind, Doc[]>();
    for (const d of docs) {
      const arr = g.get(d.kind) || [];
      arr.push(d);
      g.set(d.kind, arr);
    }
    return g;
  }, [docs]);

  const send = async () => {
    if (!user || !id || !validType || (!body.trim() && !attachment)) return;
    setSending(true);
    try {
      let attachment_path: string | null = null;
      if (attachment) {
        const path = `engagement/${type}/${id}/${Date.now()}-${attachment.name}`;
        const up = await supabase.storage.from("attachments").upload(path, attachment);
        if (up.error) throw up.error;
        attachment_path = path;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("engagement_messages").insert({
        engagement_id: id,
        engagement_type: type,
        sender_id: user.id,
        body: body.trim() || (attachment ? `Sent file: ${attachment.name}` : ""),
        attachment_path,
        is_admin: isAdmin,
      });
      if (error) throw error;
      setBody(""); setAttachment(null);
      if (fileRef.current) fileRef.current.value = "";
      await load();
    } catch (e) {
      toast({ title: "Could not send", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const download = async (path: string, filename?: string) => {
    const buckets: ("reports" | "attachments")[] = ["reports", "attachments"];
    for (const b of buckets) {
      const { data, error } = await supabase.storage.from(b).createSignedUrl(path, 300);
      if (!error && data?.signedUrl) {
        return openBlob(data.signedUrl, filename);
      }
    }
    toast({ title: "Cannot open file", description: "Signed URL unavailable.", variant: "destructive" });
  };

  const openBlob = async (url: string, filename?: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const obj = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = obj;
      a.download = filename || url.split("/").pop() || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(obj), 1000);
    } catch (e) {
      toast({ title: "Download failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  const sha256Hex = async (file: File) => {
    const buf = await file.arrayBuffer();
    const hash = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const issueVersion = async () => {
    if (!user || !id || !validType || !engagement || !issueFile) return;
    setIssuing(true);
    try {
      // Next version number for this kind
      const existing = grouped.get(issueKind) || [];
      const nextVersion = existing.reduce((m, d) => Math.max(m, d.version), 0) + 1;
      const safeName = issueFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storage_path = `engagement/${type}/${id}/${issueKind}-v${nextVersion}-${safeName}`;

      const up = await supabase.storage.from("reports").upload(storage_path, issueFile, { upsert: false });
      if (up.error) throw up.error;

      const hash = await sha256Hex(issueFile).catch(() => null);

      // Mark previous versions superseded (only for versionable kinds)
      if (VERSIONABLE_KINDS.includes(issueKind) && existing.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from("engagement_documents")
          .update({ superseded: true })
          .eq("engagement_type", type)
          .eq("engagement_id", id)
          .eq("kind", issueKind)
          .eq("superseded", false);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: insErr } = await (supabase as any).from("engagement_documents").insert({
        engagement_id: id,
        engagement_type: type,
        kind: issueKind,
        version: nextVersion,
        storage_path,
        sha256_hash: hash,
        notes: issueNotes.trim() || null,
        issued_by: user.id,
        superseded: false,
      });
      if (insErr) throw insErr;

      // Advance stage to "issued" if requested and not already
      if (bumpStage && engagement.status_stage !== "issued" && engagement.status_stage !== "revoked") {
        const tables: Record<EngagementType, string> = {
          vapt: "vapt_requests",
          pci_dss: "pci_dss_requests",
          audit: "audit_requests",
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from(tables[type]).update({ status_stage: "issued" }).eq("id", id);
      }

      // Audit log
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("admin_action_log").insert({
        actor_id: user.id,
        action: issueKind === "retest" ? "issue_retest" : "issue_version",
        entity_type: type,
        entity_id: id,
        reason: issueNotes.trim() || null,
        metadata: { kind: issueKind, version: nextVersion, sha256: hash },
      });

      // Notify client
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("notifications").insert({
        user_id: engagement.user_id,
        type: "engagement",
        title: `${DOC_LABEL[issueKind]} v${nextVersion} issued`,
        message: `${engagement.public_id}: ${issueNotes.trim() || "A new version is available on your engagement page."}`,
        entity_type: type,
        entity_id: id,
      });

      // Post to engagement thread
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("engagement_messages").insert({
        engagement_id: id,
        engagement_type: type,
        sender_id: user.id,
        body: `Issued ${DOC_LABEL[issueKind]} v${nextVersion}${issueNotes.trim() ? ` — ${issueNotes.trim()}` : ""}.`,
        is_admin: true,
      });

      toast({ title: `${DOC_LABEL[issueKind]} v${nextVersion} issued`, description: "Client has been notified." });
      setIssueFile(null); setIssueNotes("");
      if (issueFileRef.current) issueFileRef.current.value = "";
      await load();
      setTab("documents");
    } catch (e) {
      toast({ title: "Issue failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setIssuing(false);
    }
  };

  const restore = async (doc: Doc) => {
    if (!confirm(`Restore ${DOC_LABEL[doc.kind]} v${doc.version} as the current version? Other versions of this kind will be marked superseded.`)) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("engagement_documents")
        .update({ superseded: true })
        .eq("engagement_type", type)
        .eq("engagement_id", id)
        .eq("kind", doc.kind);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("engagement_documents")
        .update({ superseded: false })
        .eq("id", doc.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("admin_action_log").insert({
        actor_id: user!.id,
        action: "restore_version",
        entity_type: type,
        entity_id: id!,
        metadata: { kind: doc.kind, version: doc.version },
      });
      toast({ title: "Version restored" });
      await load();
    } catch (e) {
      toast({ title: "Could not restore", description: (e as Error).message, variant: "destructive" });
    }
  };

  if (loading || loadingData) return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to={`/login?next=/audits/my/${type}/${id}`} replace />;
  if (!validType) return <Navigate to="/audits/my" replace />;
  if (!engagement) return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-center">
      <h1 className="text-2xl font-serif">Engagement not found</h1>
      <p className="text-muted-foreground mt-2">It may have been removed or you don't have access.</p>
      <Link to="/audits/my" className="mt-6 inline-flex items-center gap-2 text-primary hover:underline"><ArrowLeft className="h-4 w-4" /> Back to my reports</Link>
    </div>
  );

  return (
    <>
      <Seo title={`${engagement.public_id} · Lantid`} description="Engagement thread, documents and status." path={`/audits/my/${type}/${id}`} />
      <section className="border-b border-border bg-gradient-brand-soft/40">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link to={isAdmin ? "/admin/queue" : "/audits/my"} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to {isAdmin ? "queue" : "my reports"}
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-primary font-semibold flex items-center gap-2">
                {TYPE_LABEL[engagement.type]}
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold">
                    <ShieldCheck className="h-3 w-3" /> Admin view
                  </span>
                )}
              </div>
              <h1 className="text-2xl lg:text-3xl font-serif text-foreground mt-1 truncate">{engagement.company_name}</h1>
              <div className="text-xs text-muted-foreground mt-1 font-mono">{engagement.public_id}</div>
              <div className="text-sm text-muted-foreground mt-1">{engagement.subject}</div>
            </div>
          </div>
          <div className="mt-6 rounded-xl border border-border bg-card p-4">
            <StatusTimeline stage={engagement.status_stage} />
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex border-b border-border mb-6 overflow-x-auto">
          <button onClick={() => setTab("thread")} className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition whitespace-nowrap ${tab === "thread" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <MessageSquare className="h-4 w-4 inline mr-1.5" /> Thread ({messages.length})
          </button>
          <button onClick={() => setTab("documents")} className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition whitespace-nowrap ${tab === "documents" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <FileSignature className="h-4 w-4 inline mr-1.5" /> Documents ({docs.length})
          </button>
          {isAdmin && (
            <button onClick={() => setTab("admin")} className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition whitespace-nowrap ${tab === "admin" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <ShieldCheck className="h-4 w-4 inline mr-1.5" /> Issue version
            </button>
          )}
        </div>

        {tab === "thread" && (
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8">No messages yet. Send the first one below — the Lantid team will reply here.</div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.is_admin ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.is_admin ? "bg-card border border-border" : "bg-primary text-primary-foreground"}`}>
                  <div className={`text-[10px] uppercase tracking-wider mb-1 ${m.is_admin ? "text-muted-foreground" : "text-primary-foreground/70"}`}>
                    {m.is_admin ? "Lantid" : "You"} · {new Date(m.created_at).toLocaleString()}
                  </div>
                  {m.body && <div className="text-sm whitespace-pre-wrap">{m.body}</div>}
                  {m.attachment_path && (
                    <button onClick={() => download(m.attachment_path!)} className={`mt-2 inline-flex items-center gap-1.5 text-xs underline ${m.is_admin ? "text-primary" : "text-primary-foreground"}`}>
                      <Paperclip className="h-3 w-3" /> Attachment
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-border bg-card p-4 mt-6">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={isAdmin ? "Reply to the client…" : "Reply to the Lantid team…"}
                rows={3}
                className="w-full rounded-xl border border-input bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                <label className="inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  <input ref={fileRef} type="file" className="hidden" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />
                  <Paperclip className="h-3.5 w-3.5" />
                  {attachment ? attachment.name : "Attach a file"}
                </label>
                <button onClick={send} disabled={sending || (!body.trim() && !attachment)} className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:shadow-brand transition disabled:opacity-50">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "documents" && (
          <div className="space-y-6">
            {docs.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8">
                No documents yet. Engagement letters, scope confirmations, and your final report will appear here as the Lantid team issues them.
              </div>
            )}

            {Array.from(grouped.entries()).map(([kind, list]) => (
              <div key={kind} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-4 py-3 bg-muted/30 border-b border-border">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {VERSIONABLE_KINDS.includes(kind) ? <History className="h-4 w-4 text-primary" /> : <FileText className="h-4 w-4 text-primary" />}
                    {DOC_LABEL[kind]}
                  </div>
                  <span className="text-xs text-muted-foreground">{list.length} version{list.length === 1 ? "" : "s"}</span>
                </div>
                <ol className="divide-y divide-border">
                  {list.map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-3 p-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-sm font-semibold">v{d.version}</div>
                          {!d.superseded ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                              <CheckCircle2 className="h-3 w-3" /> Current
                            </span>
                          ) : (
                            <span className="rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                              Superseded
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Issued {new Date(d.issued_at).toLocaleString()}
                        </div>
                        {d.notes && (
                          <div className="text-xs text-foreground/80 mt-1 whitespace-pre-wrap">
                            <span className="uppercase tracking-wider text-[10px] text-muted-foreground mr-1">Change notes:</span>
                            {d.notes}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {isAdmin && d.superseded && VERSIONABLE_KINDS.includes(d.kind) && (
                          <button onClick={() => restore(d)} title="Restore this as current" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:border-primary/60 transition">
                            <RotateCcw className="h-3.5 w-3.5" /> Restore
                          </button>
                        )}
                        <button onClick={() => download(d.storage_path, `${d.kind}-${engagement.public_id}-v${d.version}.pdf`)} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:border-primary/60 transition">
                          <Download className="h-3.5 w-3.5" /> Download
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}

        {tab === "admin" && isAdmin && (
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div>
              <h2 className="text-lg font-serif">Issue a new version</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a new report or retest/delta. Previous versions of the same kind are automatically marked <span className="font-semibold">superseded</span> and remain visible to the client as history. The client is notified.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Kind</div>
                <select
                  value={issueKind}
                  onChange={(e) => setIssueKind(e.target.value as DocKind)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="report">Report (main)</option>
                  <option value="retest">Retest / Delta</option>
                  <option value="engagement_letter">Engagement letter</option>
                  <option value="scope_confirmation">Scope confirmation</option>
                  <option value="invoice">Invoice</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="block">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">File (PDF)</div>
                <input
                  ref={issueFileRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setIssueFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:px-3 file:py-1.5 file:text-xs file:font-semibold"
                />
              </label>
            </div>

            <label className="block">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Change notes {VERSIONABLE_KINDS.includes(issueKind) ? "(delta — what changed)" : "(optional)"}
              </div>
              <textarea
                value={issueNotes}
                onChange={(e) => setIssueNotes(e.target.value)}
                rows={3}
                placeholder={issueKind === "retest"
                  ? "e.g. Retest of 4 High findings after client remediation. 3 closed, 1 remains open."
                  : "Summary of what changed in this version — findings retested, sections revised, appendices added…"}
                className="w-full rounded-xl border border-input bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </label>

            <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={bumpStage} onChange={(e) => setBumpStage(e.target.checked)} />
              Advance engagement status to <span className="font-semibold">issued</span>
            </label>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground">
                Next version:{" "}
                <span className="font-mono text-foreground">
                  v{((grouped.get(issueKind) || []).reduce((m, d) => Math.max(m, d.version), 0)) + 1}
                </span>
              </div>
              <button
                onClick={issueVersion}
                disabled={issuing || !issueFile}
                className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:shadow-brand transition disabled:opacity-50"
              >
                {issuing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Issue version
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
