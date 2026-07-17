import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Download, Loader2, ShieldCheck, Trash2, UploadCloud, X } from "lucide-react";
import { Seo } from "@/components/site/Seo";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AUDITS, TIERS, TierKey, VAT_RATE, auditBySlug, formatNaira } from "@/config/audits";
import { generateAuditChecklistPdf } from "@/lib/auditChecklistPdf";
import { clearDraft, draftIsMeaningful, loadDraft, saveDraft } from "@/lib/auditDraft";

const MAX_FILE_BYTES = 25 * 1024 * 1024;

type Uploaded = { name: string; path: string; size?: number };

function validateFile(file: File, accept?: string): string | null {
  if (file.size === 0) return `${file.name} is empty.`;
  if (file.size > MAX_FILE_BYTES) return `${file.name} exceeds 25 MB.`;
  if (accept) {
    const allowed = accept.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
    const mime = (file.type || "").toLowerCase();
    const ok = allowed.some((a) => a === ext || (a.includes("/") && mime === a));
    if (!ok) return `${file.name}: type not accepted (allowed: ${accept}).`;
  }
  return null;
}

export default function AuditService() {
  const { slug } = useParams();
  const audit = auditBySlug(slug || "");
  const { user, loading } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const initialTier = ((params.get("tier") as TierKey) && TIERS[params.get("tier") as TierKey]) ? (params.get("tier") as TierKey) : "priority";
  const [tier, setTier] = useState<TierKey>(initialTier);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<Record<string, { current: string; done: number; total: number }>>({});
  const [dragging, setDragging] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftBanner, setDraftBanner] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  // Load draft on mount
  useEffect(() => {
    if (!user || !audit || draftLoaded) return;
    const d = loadDraft(audit.slug, user.id);
    if (draftIsMeaningful(d) && d) {
      setTier((d.tier as TierKey) || initialTier);
      setForm(d.form || {});
      setCompanyName(d.companyName || "");
      setContactName(d.contactName || "");
      setContactEmail(d.contactEmail || user.email || "");
      setContactPhone(d.contactPhone || "");
      setDraftBanner(`Draft restored from ${new Date(d.savedAt).toLocaleString()}`);
    } else if (user.email) {
      setContactEmail(user.email);
    }
    setDraftLoaded(true);
  }, [user, audit, draftLoaded, initialTier]);

  // Autosave (debounced)
  const saveTimer = useRef<number | null>(null);
  useEffect(() => {
    if (!user || !audit || !draftLoaded) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      const draft = {
        tier, form, companyName, contactName, contactEmail, contactPhone,
        savedAt: Date.now(),
      };
      saveDraft(audit.slug, user.id, draft);
      setLastSavedAt(draft.savedAt);
    }, 700);
    return () => { if (saveTimer.current) window.clearTimeout(saveTimer.current); };
  }, [tier, form, companyName, contactName, contactEmail, contactPhone, user, audit, draftLoaded]);

  const pricing = useMemo(() => {
    const t = TIERS[tier];
    const vat = Math.round(t.baseKobo * VAT_RATE);
    return { base: t.baseKobo, vat, total: t.baseKobo + vat };
  }, [tier]);

  const handleFiles = useCallback(async (fieldName: string, files: FileList | File[] | null, accept?: string, multiple?: boolean) => {
    if (!files || !user || !audit) return;
    const list = Array.from(files);
    if (list.length === 0) return;

    const existing: Uploaded[] = form[`__file_${fieldName}`] ? JSON.parse(form[`__file_${fieldName}`]) : [];
    const toProcess = multiple ? list : list.slice(0, 1);

    // Pre-validate all first
    for (const f of toProcess) {
      const err = validateFile(f, accept);
      if (err) {
        toast({ title: "File rejected", description: err, variant: "destructive" });
        return;
      }
    }

    setUploading((s) => ({ ...s, [fieldName]: { current: toProcess[0].name, done: 0, total: toProcess.length } }));
    const uploaded: Uploaded[] = multiple ? [...existing] : [];
    try {
      for (let i = 0; i < toProcess.length; i++) {
        const file = toProcess[i];
        setUploading((s) => ({ ...s, [fieldName]: { current: file.name, done: i, total: toProcess.length } }));
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${user.id}/audit-intake/${audit.slug}/${fieldName}/${Date.now()}-${i}-${safe}`;
        const { error } = await supabase.storage
          .from("attachments")
          .upload(path, file, { upsert: false, contentType: file.type || undefined });
        if (error) {
          toast({ title: "Upload failed", description: `${file.name}: ${error.message}`, variant: "destructive" });
          continue;
        }
        uploaded.push({ name: file.name, path, size: file.size });
      }
      setForm((s) => ({ ...s, [`__file_${fieldName}`]: JSON.stringify(uploaded) }));
      if (uploaded.length > 0) {
        toast({ title: "Uploaded", description: `${uploaded.length - (multiple ? existing.length : 0)} file(s) attached.` });
      }
    } finally {
      setUploading((s) => { const n = { ...s }; delete n[fieldName]; return n; });
    }
  }, [audit, form, toast, user]);

  const removeFile = async (fieldName: string, index: number) => {
    const existing: Uploaded[] = form[`__file_${fieldName}`] ? JSON.parse(form[`__file_${fieldName}`]) : [];
    const target = existing[index];
    if (target) await supabase.storage.from("attachments").remove([target.path]);
    const next = existing.filter((_, i) => i !== index);
    setForm((s) => ({ ...s, [`__file_${fieldName}`]: next.length ? JSON.stringify(next) : "" }));
  };

  if (!audit || audit.external || !audit.sections) return <Navigate to="/audits" replace />;
  if (loading) return <div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const label = "text-xs font-semibold text-foreground/80 mb-1.5 block";
  const inputCls = "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition";
  const Req = () => <span className="text-destructive ml-0.5" aria-hidden="true">*</span>;

  // Completion metrics across all required fields (contact + section fields).
  const contactRequired = [companyName, contactName, contactEmail];
  const sectionRequiredFields = (audit.sections || []).flatMap((s) => s.fields.filter((f) => f.required));
  const sectionRequiredDone = sectionRequiredFields.filter((f) => {
    if (f.type === "file") {
      try { return (JSON.parse(form[`__file_${f.name}`] || "[]") as unknown[]).length > 0; } catch { return false; }
    }
    return !!(form[f.name] && form[f.name].trim());
  }).length;
  const totalRequired = contactRequired.length + sectionRequiredFields.length;
  const doneRequired = contactRequired.filter((v) => !!v.trim()).length + sectionRequiredDone;
  const progressPct = totalRequired === 0 ? 100 : Math.round((doneRequired / totalRequired) * 100);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(`${audit.route}?tier=${tier}`)}`);
      return;
    }
    if (Object.keys(uploading).length > 0) {
      toast({ title: "Uploads in progress", description: "Wait for uploads to finish before submitting.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const reference = `LNTD-${audit.slug.toUpperCase()}-${Date.now()}`;
      const { data: row, error } = await supabase
        .from("audit_requests" as never)
        .insert({
          user_id: user.id,
          audit_type: audit.dbType,
          tier,
          amount_kobo: pricing.base,
          vat_kobo: pricing.vat,
          total_kobo: pricing.total,
          currency: "NGN",
          status: "pending",
          reference,
          company_name: companyName,
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          intake: form,
        } as never)
        .select()
        .single();
      if (error) throw error;

      clearDraft(audit.slug, user.id);

      const callback = `${window.location.origin}/vapt/payment-callback`;
      const { data: init, error: initErr } = await supabase.functions.invoke("paystack-init-audit", {
        body: { audit_request_id: (row as { id: string }).id, callback_url: callback },
      });
      if (initErr || !init?.authorization_url) {
        toast({ title: "Payment init failed", description: initErr?.message || init?.error || "Try again", variant: "destructive" });
        setSubmitting(false);
        return;
      }
      window.location.href = init.authorization_url;
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
      setSubmitting(false);
    }
  };

  const discardDraft = () => {
    if (!user) return;
    clearDraft(audit.slug, user.id);
    setForm({});
    setCompanyName("");
    setContactName("");
    setContactPhone("");
    setTier(initialTier);
    setDraftBanner(null);
    toast({ title: "Draft cleared" });
  };

  return (
    <>
      <Seo
        title={`${audit.name} · Lantid`}
        description={audit.hero}
        path={audit.route}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: audit.name,
            serviceType: audit.standard,
            description: audit.hero,
            provider: {
              "@type": "Organization",
              name: "Lantid",
              url: "https://lantid.com",
              logo: "https://lantid.com/og-image.png",
            },
            areaServed: { "@type": "Country", name: "Nigeria" },
            offers: {
              "@type": "AggregateOffer",
              priceCurrency: "NGN",
              lowPrice: "250000",
              highPrice: "1500000",
              offerCount: 3,
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Lantid",
            url: "https://lantid.com",
            logo: "https://lantid.com/og-image.png",
            sameAs: ["https://lantid.com"],
          },
        ]}
      />

      {/* Hero */}
      <section className="relative border-b border-border">
        <div className="absolute inset-0 bg-gradient-brand-soft opacity-60 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 py-16 lg:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-5">
            <ShieldCheck className="h-3.5 w-3.5" /> {audit.standard}
          </div>
          <h1 className="text-4xl lg:text-5xl font-serif tracking-tight text-foreground max-w-3xl">{audit.name}</h1>
          <p className="mt-5 text-base lg:text-lg text-muted-foreground max-w-2xl">{audit.hero}</p>
          <ul className="mt-6 grid sm:grid-cols-2 gap-3 max-w-3xl">
            {audit.outcomes.map((o) => (
              <li key={o} className="flex items-start gap-2 text-sm text-foreground/80">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /> {o}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => generateAuditChecklistPdf(audit)}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold hover:border-primary/60 transition"
            >
              <Download className="h-3.5 w-3.5" /> Download intake checklist (PDF)
            </button>
            <Link to="/audits/my" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold hover:border-primary/60 transition">
              View my submissions <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <h2 className="text-3xl font-serif tracking-tight text-foreground text-center">Choose a tier</h2>
        <p className="text-center text-muted-foreground mt-2">All prices exclude 7.5% VAT. Same deliverables — different turnaround.</p>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {(Object.keys(TIERS) as TierKey[]).map((k) => {
            const t = TIERS[k];
            const isActive = tier === k;
            const totalWithVat = t.baseKobo + Math.round(t.baseKobo * VAT_RATE);
            return (
              <div key={k} className={`rounded-2xl border p-6 bg-card flex flex-col transition-all ${isActive ? "border-primary shadow-brand ring-2 ring-primary/30" : "border-border hover:border-primary/40"}`}>
                {t.highlighted && <div className="text-[10px] font-semibold tracking-wider text-primary uppercase mb-2">Most popular</div>}
                <h3 className="text-xl font-semibold text-foreground">{t.label}</h3>
                <div className="mt-2 text-3xl font-serif text-foreground">{t.priceLabel}</div>
                <div className="text-xs text-muted-foreground mt-1">+ 7.5% VAT · total {formatNaira(totalWithVat)}</div>
                <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">Turnaround: {t.turnaround}</p>
                <p className="mt-3 text-sm text-muted-foreground flex-1">{t.blurb}</p>
                <button
                  type="button"
                  onClick={() => {
                    setTier(k);
                    setTimeout(() => document.getElementById("audit-intake")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                  }}
                  className={`mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${isActive ? "bg-primary text-primary-foreground" : "border border-border text-foreground hover:bg-primary/5"}`}
                >
                  {isActive ? "Continue with this tier" : `Choose ${t.label}`} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Intake */}
      <section id="audit-intake" className="max-w-4xl mx-auto px-6 pb-20 scroll-mt-24">
        <div className="rounded-3xl border border-border bg-card p-8 lg:p-10">
          {!user ? (
            <div className="text-center py-8">
              <h2 className="font-serif text-2xl text-foreground">Sign in to begin your {audit.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">Your intake, payment, and report are attached to your Lantid account.</p>
              <Link to={`/login?next=${encodeURIComponent(`${audit.route}?tier=${tier}`)}`} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold hover:shadow-brand transition-all">
                Sign in to continue <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-8">
              {draftBanner && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 flex items-start justify-between gap-4">
                  <div className="text-xs text-foreground">
                    <div className="font-semibold text-primary">Draft restored</div>
                    <div className="text-muted-foreground mt-0.5">{draftBanner} — you can pick up where you left off.</div>
                  </div>
                  <button type="button" onClick={discardDraft} className="inline-flex items-center gap-1 text-xs font-semibold text-destructive hover:underline">
                    <Trash2 className="h-3 w-3" /> Discard
                  </button>
                </div>
              )}

              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="font-serif text-2xl text-foreground">Engagement intake</h2>
                  <p className="text-sm text-muted-foreground mt-1">The more accurate this is, the sharper your audit will be. All information is confidential; NDA on request.</p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {lastSavedAt ? `Autosaved · ${new Date(lastSavedAt).toLocaleTimeString()}` : "Autosaving as you type"}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Confidential · NDA available</div>
                </div>
              </div>

              {/* Completion meter */}
              <div className="rounded-xl border border-border bg-background/60 px-4 py-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground/80">Intake completion</span>
                  <span className="text-muted-foreground">{doneRequired} / {totalRequired} required · <span className="text-primary font-semibold">{progressPct}%</span></span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
                </div>
              </div>

              {/* Section 1 — Primary contact */}
              <section className="rounded-2xl border border-border bg-background/40 p-5 lg:p-6">
                <header className="flex items-start gap-3 mb-5 pb-4 border-b border-border">
                  <div className="h-7 w-7 shrink-0 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary">1</div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Primary contact</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Who we'll coordinate the engagement with day-to-day.</p>
                  </div>
                </header>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className={label}>Company name<Req /></label><input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputCls} /></div>
                  <div><label className={label}>Contact name<Req /></label><input required value={contactName} onChange={(e) => setContactName(e.target.value)} className={inputCls} /></div>
                  <div><label className={label}>Contact email<Req /></label><input required type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputCls} /></div>
                  <div><label className={label}>Contact phone</label><input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+234…" className={inputCls} /></div>
                </div>
              </section>

              {audit.sections!.map((section, idx) => (
                <section key={section.title} className="rounded-2xl border border-border bg-background/40 p-5 lg:p-6">
                  <header className="flex items-start gap-3 mb-5 pb-4 border-b border-border">
                    <div className="h-7 w-7 shrink-0 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-semibold text-primary">{idx + 2}</div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                      {section.description && <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>}
                    </div>
                  </header>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {section.fields.map((f) => {
                      const val = form[f.name] || "";
                      const onChange = (v: string) => setForm((s) => ({ ...s, [f.name]: v }));
                      const col = f.colSpan === 2 ? "sm:col-span-2" : "";
                      if (f.type === "textarea") {
                        return (
                          <div key={f.name} className={col}>
                            <label className={label}>{f.label}{f.required && <Req />}</label>
                            <textarea required={f.required} value={val} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={f.placeholder} className={`${inputCls} resize-y min-h-[92px]`} />
                            {f.helper && <p className="text-xs text-muted-foreground mt-1.5">{f.helper}</p>}
                          </div>
                        );
                      }
                      if (f.type === "select") {
                        return (
                          <div key={f.name} className={col}>
                            <label className={label}>{f.label}{f.required && <Req />}</label>
                            <select required={f.required} value={val} onChange={(e) => onChange(e.target.value)} className={inputCls}>
                              <option value="">Select…</option>
                              {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                            {f.helper && <p className="text-xs text-muted-foreground mt-1.5">{f.helper}</p>}
                          </div>
                        );
                      }
                      if (f.type === "file") {
                        const uploaded: Uploaded[] = form[`__file_${f.name}`] ? JSON.parse(form[`__file_${f.name}`]) : [];
                        const busy = uploading[f.name];
                        const isDragging = dragging === f.name;
                        const pct = busy ? Math.round(((busy.done) / Math.max(busy.total, 1)) * 100) : 0;
                        const hasFiles = uploaded.length > 0;
                        return (
                          <div key={f.name} className={col}>
                            <label className={label}>{f.label}{f.required && <Req />}{hasFiles && <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold text-primary"><CheckCircle2 className="h-3 w-3" /> {uploaded.length} attached</span>}</label>
                            <div
                              onDragOver={(e) => { e.preventDefault(); setDragging(f.name); }}
                              onDragLeave={() => setDragging((d) => (d === f.name ? null : d))}
                              onDrop={(e) => {
                                e.preventDefault();
                                setDragging(null);
                                handleFiles(f.name, e.dataTransfer.files, f.accept, f.multiple);
                              }}
                              className={`rounded-xl border-2 border-dashed px-4 py-5 transition-colors ${isDragging ? "border-primary bg-primary/10" : hasFiles ? "border-primary/40 bg-primary/[0.03]" : "border-input bg-background/50 hover:border-primary/40"}`}
                            >
                              <label className="cursor-pointer flex flex-col items-center justify-center text-center py-1">
                                <UploadCloud className="h-6 w-6 text-primary mb-2" />
                                <span className="text-xs font-semibold text-foreground">Drop files here or click to browse</span>
                                <span className="text-[10px] text-muted-foreground mt-1">{f.accept ? `Accepted: ${f.accept}` : "PDF, image, docx, xlsx"} · max 25 MB{f.multiple ? " · multiple allowed" : ""}</span>
                                <input
                                  type="file"
                                  accept={f.accept}
                                  multiple={f.multiple}
                                  required={f.required && uploaded.length === 0}
                                  onChange={(e) => handleFiles(f.name, e.target.files, f.accept, f.multiple)}
                                  className="sr-only"
                                />
                              </label>

                              {busy && (
                                <div className="mt-3 space-y-1.5">
                                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin text-primary" /> Uploading {busy.current}…</span>
                                    <span>{busy.done + 1} / {busy.total}</span>
                                  </div>
                                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full bg-primary transition-all" style={{ width: `${Math.max(pct, 8)}%` }} />
                                  </div>
                                </div>
                              )}

                              {uploaded.length > 0 && (
                                <ul className="mt-3 space-y-1">
                                  {uploaded.map((u, i) => (
                                    <li key={i} className="flex items-center justify-between gap-2 text-xs text-foreground/80 bg-background border border-border rounded-md px-2.5 py-1.5">
                                      <span className="truncate flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" /> <span className="truncate">{u.name}</span> {u.size ? <span className="text-[10px] text-muted-foreground shrink-0">({(u.size / 1024 / 1024).toFixed(2)} MB)</span> : null}</span>
                                      <button type="button" onClick={() => removeFile(f.name, i)} className="text-muted-foreground hover:text-destructive shrink-0" aria-label={`Remove ${u.name}`}>
                                        <X className="h-3.5 w-3.5" />
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            {f.helper && <p className="text-xs text-muted-foreground mt-1.5">{f.helper}</p>}
                          </div>
                        );
                      }
                      return (
                        <div key={f.name} className={col}>
                          <label className={label}>{f.label}{f.required && <Req />}</label>
                          <input required={f.required} type={f.type} value={val} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} className={inputCls} />
                          {f.helper && <p className="text-xs text-muted-foreground mt-1.5">{f.helper}</p>}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}

              {/* Order summary — sticky on desktop so pricing stays visible */}
              <div className="sticky bottom-4 z-10">
                <div className="rounded-2xl border border-primary/30 bg-card shadow-brand p-5 lg:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Order summary</div>
                    <div className="text-[10px] font-semibold text-primary uppercase tracking-wider">{TIERS[tier].turnaround}</div>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between gap-3"><span className="text-muted-foreground">{audit.name} — {TIERS[tier].label}</span><span className="font-medium text-foreground">{formatNaira(pricing.base)}</span></div>
                    <div className="flex justify-between gap-3"><span className="text-muted-foreground">VAT (7.5%)</span><span className="font-medium text-foreground">{formatNaira(pricing.vat)}</span></div>
                    <div className="flex justify-between gap-3 border-t border-border pt-2 mt-2 items-baseline"><span className="font-semibold text-foreground">Total due</span><span className="font-serif text-2xl text-foreground">{formatNaira(pricing.total)}</span></div>
                  </div>
                  {progressPct < 100 && (
                    <div className="mt-3 text-[11px] text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
                      {totalRequired - doneRequired} required {totalRequired - doneRequired === 1 ? "field is" : "fields are"} still missing — you can still submit and complete them from your dashboard, but we'll need them before starting.
                    </div>
                  )}
                  <button type="submit" disabled={submitting || Object.keys(uploading).length > 0} className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold hover:shadow-brand transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting to secure payment…</> : <>Pay {formatNaira(pricing.total)} & start audit <ArrowRight className="h-4 w-4" /></>}
                  </button>
                  <p className="text-[11px] text-muted-foreground text-center mt-3">Secured by Paystack · NGN · Invoice available on request · Data encrypted in transit &amp; at rest</p>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
