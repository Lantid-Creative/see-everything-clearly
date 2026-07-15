import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Seo } from "@/components/site/Seo";
import { Loader2, ArrowLeft, Send, Paperclip, Download, FileText, MessageSquare, FileSignature } from "lucide-react";
import { StatusTimeline, type EngagementStage } from "@/components/audits/StatusTimeline";

type EngagementType = "vapt" | "pci_dss" | "audit";

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
  kind: string;
  version: number;
  storage_path: string;
  issued_at: string;
  notes: string | null;
};

const TYPE_LABEL: Record<EngagementType, string> = { vapt: "VAPT", pci_dss: "PCI DSS", audit: "Audit" };
const DOC_LABEL: Record<string, string> = {
  engagement_letter: "Engagement letter",
  scope_confirmation: "Scope confirmation",
  report: "Report",
  retest: "Retest report",
  invoice: "Invoice",
  other: "Document",
};

export default function EngagementDetail() {
  const { type, id } = useParams<{ type: EngagementType; id: string }>();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [tab, setTab] = useState<"thread" | "documents">("thread");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [loadingData, setLoadingData] = useState(true);

  const validType = type === "vapt" || type === "pci_dss" || type === "audit";

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
        .select("id,kind,version,storage_path,issued_at,notes")
        .eq("engagement_type", type).eq("engagement_id", id)
        .order("issued_at", { ascending: false }),
    ]);
    setLoadingData(false);
    if (eng.error) toast({ title: "Could not load engagement", description: eng.error.message, variant: "destructive" });
    setEngagement((eng.data as unknown as Engagement) || null);
    setMessages((msgs.data as unknown as Message[]) || []);
    setDocs((ds.data as unknown as Doc[]) || []);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user, id, type]);

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
        is_admin: false,
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
    const { data, error } = await supabase.storage.from("attachments").createSignedUrl(path, 300);
    if (error || !data?.signedUrl) {
      // Fallback: try reports bucket
      const rep = await supabase.storage.from("reports").createSignedUrl(path, 300);
      if (rep.error || !rep.data?.signedUrl) {
        toast({ title: "Cannot open file", description: error?.message || rep.error?.message, variant: "destructive" });
        return;
      }
      openBlob(rep.data.signedUrl, filename);
      return;
    }
    openBlob(data.signedUrl, filename);
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
          <Link to="/audits/my" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-4">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to my reports
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-primary font-semibold">{TYPE_LABEL[engagement.type]}</div>
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
        <div className="flex border-b border-border mb-6">
          <button onClick={() => setTab("thread")} className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition ${tab === "thread" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <MessageSquare className="h-4 w-4 inline mr-1.5" /> Thread ({messages.length})
          </button>
          <button onClick={() => setTab("documents")} className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition ${tab === "documents" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <FileSignature className="h-4 w-4 inline mr-1.5" /> Documents ({docs.length})
          </button>
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
                placeholder="Reply to the Lantid team…"
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
          <div className="space-y-3">
            {docs.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8">
                No documents yet. Engagement letters, scope confirmations, and your final report will appear here as the Lantid team issues them.
              </div>
            )}
            {docs.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-5 w-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{DOC_LABEL[d.kind] || d.kind} <span className="text-xs text-muted-foreground">v{d.version}</span></div>
                    <div className="text-xs text-muted-foreground">Issued {new Date(d.issued_at).toLocaleDateString()}{d.notes ? ` · ${d.notes}` : ""}</div>
                  </div>
                </div>
                <button onClick={() => download(d.storage_path, `${d.kind}-${engagement.public_id}-v${d.version}.pdf`)} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:border-primary/60 transition">
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
