import { useEffect, useState } from "react";
import { Navigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function PaymentCallback() {
  const { user, loading } = useAuth();
  const [params] = useSearchParams();
  const [state, setState] = useState<"verifying" | "paid" | "failed">("verifying");
  const reference = params.get("reference") || params.get("trxref");

  useEffect(() => {
    (async () => {
      if (!reference) { setState("failed"); return; }
      const { data, error } = await supabase.functions.invoke("paystack-verify", { body: { reference } });
      if (error || data?.status !== "paid") setState("failed"); else setState("paid");
    })();
  }, [reference]);

  if (loading) return <div className="min-h-[40vh] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-xl mx-auto px-6 py-16 text-center">
      {state === "verifying" && <><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /><p className="mt-4 text-muted-foreground">Verifying your payment…</p></>}
      {state === "paid" && <>
        <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto" />
        <h1 className="mt-4 text-2xl font-serif">Payment confirmed</h1>
        <p className="text-muted-foreground mt-2">Your audit engagement will begin shortly. You'll receive the signed report by email.</p>
        <Link to="/audits" className="inline-flex mt-6 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold">Back to audits</Link>
      </>}
      {state === "failed" && <>
        <XCircle className="h-12 w-12 text-destructive mx-auto" />
        <h1 className="mt-4 text-2xl font-serif">Payment not confirmed</h1>
        <p className="text-muted-foreground mt-2">We couldn't verify the transaction. If you were charged, contact support and we'll resolve it.</p>
        <Link to="/vapt/dashboard" className="inline-flex mt-6 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold">Back to dashboard</Link>
      </>}
    </div>
  );
}
