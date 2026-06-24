
-- =====================
-- ROLES
-- =====================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =====================
-- ORGANIZATIONS
-- =====================
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  website_url text,
  contact_person text NOT NULL,
  email text NOT NULL,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org owners read own" ON public.organizations FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "org owners insert own" ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "org owners update own" ON public.organizations FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete orgs" ON public.organizations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- VAPT REQUESTS
-- =====================
CREATE TYPE public.assessment_type AS ENUM ('basic', 'standard', 'advanced');
CREATE TYPE public.request_status AS ENUM ('pending_payment', 'paid', 'processing', 'completed', 'cancelled');

CREATE TABLE public.vapt_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id text NOT NULL UNIQUE DEFAULT ('LNTD-REQ-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  target text NOT NULL,
  scope text NOT NULL,
  assessment_type public.assessment_type NOT NULL DEFAULT 'standard',
  notes text,
  status public.request_status NOT NULL DEFAULT 'pending_payment',
  amount_kobo bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'NGN',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vapt_requests TO authenticated;
GRANT ALL ON public.vapt_requests TO service_role;
ALTER TABLE public.vapt_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user read own requests" ON public.vapt_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user insert own requests" ON public.vapt_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "user update own requests" ON public.vapt_requests FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete requests" ON public.vapt_requests FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- PAYMENTS
-- =====================
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.vapt_requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'paystack',
  provider_reference text UNIQUE,
  amount_kobo bigint NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  status public.payment_status NOT NULL DEFAULT 'pending',
  raw_response jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user read own payments" ON public.payments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "user insert own payments" ON public.payments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "admin update payments" ON public.payments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- REPORTS
-- =====================
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES public.vapt_requests(id) ON DELETE SET NULL,
  verification_code text NOT NULL UNIQUE,
  company_name text NOT NULL,
  target text NOT NULL,
  scope_summary text NOT NULL,
  assessment_type public.assessment_type NOT NULL DEFAULT 'standard',
  status text NOT NULL DEFAULT 'issued', -- issued | revoked
  overall_result text NOT NULL DEFAULT 'passed', -- passed | findings
  storage_path text, -- private path in `reports` bucket
  sha256_hash text NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  revoked_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reports TO anon;          -- public verify page reads (RLS limits which rows; UI selects only safe cols)
GRANT SELECT, INSERT, UPDATE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Anyone can SELECT a report row (needed for public verify). Sensitive cols (storage_path, sha256_hash) should not be exposed by clients.
CREATE POLICY "public read reports for verification" ON public.reports FOR SELECT TO anon, authenticated
  USING (true);
CREATE POLICY "admin write reports" ON public.reports FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin update reports" ON public.reports FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- VERIFICATION ATTEMPTS (rate-limit visibility / audit)
-- =====================
CREATE TABLE public.verification_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_code text NOT NULL,
  ip text,
  user_agent text,
  result text NOT NULL,  -- valid | invalid | revoked | rate_limited
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.verification_attempts TO service_role;
GRANT SELECT ON public.verification_attempts TO authenticated;
ALTER TABLE public.verification_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read verification attempts" ON public.verification_attempts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX verification_attempts_code_time_idx ON public.verification_attempts (verification_code, created_at DESC);
CREATE INDEX verification_attempts_ip_time_idx ON public.verification_attempts (ip, created_at DESC);

-- =====================
-- AUDIT LOGS
-- =====================
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read audit" ON public.audit_logs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- updated_at trigger
-- =====================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_orgs_updated BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_req_updated  BEFORE UPDATE ON public.vapt_requests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_pay_updated  BEFORE UPDATE ON public.payments      FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_rep_updated  BEFORE UPDATE ON public.reports       FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =====================
-- PRE-SEED Harrenapay clean report
-- =====================
-- SHA-256 of the canonical JSON below (computed in app); placeholder hash will be overwritten by admin when PDF uploaded.
INSERT INTO public.reports (
  verification_code, company_name, target, scope_summary, assessment_type,
  status, overall_result, sha256_hash, issued_at
) VALUES (
  'LNTD-VAPT-HRN-2026-8F4K91',
  'Harrena Africa Synergy LTD',
  'harrenapay.com',
  'External Web Application Security Assessment — Web App, Auth, API, TLS, Headers, Input Validation, Session Mgmt, Config, Infra, Business Logic',
  'advanced',
  'issued',
  'passed',
  'pending-hash-on-pdf-upload',
  '2026-06-24 00:00:00+00'
);
