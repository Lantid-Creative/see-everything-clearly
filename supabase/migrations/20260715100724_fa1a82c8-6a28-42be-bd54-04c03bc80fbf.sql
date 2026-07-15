
-- Audit type enum
DO $$ BEGIN
  CREATE TYPE public.audit_type AS ENUM ('aml_cft', 'iso_27001', 'ndpr');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE public.audit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  audit_type public.audit_type NOT NULL,
  tier text NOT NULL CHECK (tier IN ('standard','priority','expedited')),
  amount_kobo bigint NOT NULL,
  vat_kobo bigint NOT NULL,
  total_kobo bigint NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','in_progress','under_review','completed','cancelled')),
  reference text NOT NULL UNIQUE,
  verification_code text NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)),
  paystack_reference text,
  paid_at timestamptz,
  company_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  intake jsonb NOT NULL DEFAULT '{}'::jsonb,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.audit_requests TO authenticated;
GRANT ALL ON public.audit_requests TO service_role;

ALTER TABLE public.audit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own audit requests"
  ON public.audit_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Users create own audit requests"
  ON public.audit_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own pending audit requests"
  ON public.audit_requests FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins update audit requests"
  ON public.audit_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER audit_requests_touch
  BEFORE UPDATE ON public.audit_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX audit_requests_user_idx ON public.audit_requests(user_id);
CREATE INDEX audit_requests_status_idx ON public.audit_requests(status);

-- Public verification lookup (safe subset)
CREATE OR REPLACE FUNCTION public.verify_audit_report(_code text)
RETURNS TABLE(audit_type text, company_name text, status text, completed_at timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT audit_type::text, company_name, status, updated_at
  FROM public.audit_requests
  WHERE verification_code = upper(_code) AND status IN ('completed','under_review')
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.verify_audit_report(text) TO anon, authenticated;
