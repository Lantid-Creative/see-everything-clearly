import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight } from "lucide-react";

const VAT_RATE = 0.075;
const fmt = (kobo: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);
const withVat = (base: number) => base + Math.round(base * VAT_RATE);

const TIER_AMOUNTS: Record<string, { kobo: number; label: string }> = {
  basic: { kobo: 25000000, label: "Standard — ₦250,000 (3 days)" },
  standard: { kobo: 50000000, label: "Priority — ₦500,000 (24h)" },
  advanced: { kobo: 150000000, label: "Expedited — ₦1,500,000 (6h)" },
};

export default function VaptRequest() {
  const { user, loading } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const initialTier = (params.get("tier") || "standard") as keyof typeof TIER_AMOUNTS;

  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [target, setTarget] = useState("");
  const [scope, setScope] = useState("Web App, Auth, API, TLS, Headers, Input Validation, Session Mgmt, Config, Infra, Business Logic");
  const [tier, setTier] = useState<keyof typeof TIER_AMOUNTS>(initialTier);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (user?.email) setEmail(user.email); }, [user]);

  if (loading) return <Loader />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent("/vapt/request?tier=" + tier)}`} replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data: org, error: orgErr } = await supabase.from("organizations").insert({
        owner_id: user.id, company_name: companyName, website_url: website, contact_person: contactPerson,
        email, phone,
      } as never).select().single();
      if (orgErr) throw orgErr;
      const orgRow = org as { id: string };

      const { data: reqRow, error: reqErr } = await supabase.from("vapt_requests").insert({
        user_id: user.id, organization_id: orgRow.id, target, scope,
        assessment_type: tier, notes, amount_kobo: withVat(TIER_AMOUNTS[tier].kobo), currency: "NGN",
      } as never).select().single();
      if (reqErr) throw reqErr;
      const reqRowTyped = reqRow as { id: string };

      // Initialize Paystack
      const callback = `${window.location.origin}/vapt/payment-callback`;
      const { data: init, error: initErr } = await supabase.functions.invoke("paystack-init", {
        body: { request_id: reqRowTyped.id, callback_url: callback },
      });
      if (initErr || !init?.authorization_url) {
        toast({ title: "Payment init failed", description: initErr?.message || init?.error || "Try again", variant: "destructive" });
        navigate(`/vapt/dashboard`);
        return;
      }
      window.location.href = init.authorization_url;
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
      setSubmitting(false);
    }
  };

  const labelCls = "text-xs font-medium text-foreground/70 mb-1.5 block uppercase tracking-wider";
  const inputCls = "w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all";

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-serif tracking-tight text-foreground">Request a VAPT assessment</h1>
      <p className="text-muted-foreground mt-2">Tell us about the target. After payment, our team begins the engagement.</p>

      <form onSubmit={submit} className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Company name" required><input className={inputCls} value={companyName} onChange={(e)=>setCompanyName(e.target.value)} required /></Field>
        <Field label="Website URL"><input className={inputCls} value={website} onChange={(e)=>setWebsite(e.target.value)} placeholder="https://" /></Field>
        <Field label="Contact person" required><input className={inputCls} value={contactPerson} onChange={(e)=>setContactPerson(e.target.value)} required /></Field>
        <Field label="Email" required><input type="email" className={inputCls} value={email} onChange={(e)=>setEmail(e.target.value)} required /></Field>
        
        <Field label="Assessment tier" required>
          <select className={inputCls} value={tier} onChange={(e)=>setTier(e.target.value as keyof typeof TIER_AMOUNTS)}>
            {Object.entries(TIER_AMOUNTS).map(([k,v])=>(<option key={k} value={k}>{v.label}</option>))}
          </select>
        </Field>
        <div className="md:col-span-2"><Field label="Target domain or IP" required><input className={inputCls} value={target} onChange={(e)=>setTarget(e.target.value)} placeholder="example.com" required /></Field></div>
        <div className="md:col-span-2"><Field label="Scope of testing" required><textarea className={`${inputCls} min-h-[80px]`} value={scope} onChange={(e)=>setScope(e.target.value)} required /></Field></div>
        <div className="md:col-span-2"><Field label="Notes (optional)"><textarea className={`${inputCls} min-h-[80px]`} value={notes} onChange={(e)=>setNotes(e.target.value)} /></Field></div>

        <div className="md:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Order summary</div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{TIER_AMOUNTS[tier].label}</span><span className="font-medium">{fmt(TIER_AMOUNTS[tier].kobo)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">VAT (7.5%)</span><span className="font-medium">{fmt(Math.round(TIER_AMOUNTS[tier].kobo * VAT_RATE))}</span></div>
            <div className="flex justify-between border-t border-border pt-2 mt-2 text-base"><span className="font-semibold">Total due</span><span className="font-serif text-xl">{fmt(withVat(TIER_AMOUNTS[tier].kobo))}</span></div>
          </div>
          <button type="submit" disabled={submitting} className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold hover:shadow-brand transition-all disabled:opacity-50">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Pay {fmt(withVat(TIER_AMOUNTS[tier].kobo))} & start audit <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-foreground/70 mb-1.5 block uppercase tracking-wider">{label}{required && <span className="text-primary"> *</span>}</span>
      {children}
    </label>
  );
}
function Loader() { return <div className="min-h-[40vh] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>; }
