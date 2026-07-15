-- =========================================================
-- Phase 1: unified audit platform data model
-- =========================================================

-- 1) Enums --------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.engagement_stage AS ENUM
    ('requested','scoping','testing','draft','issued','revoked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.finding_severity AS ENUM
    ('critical','high','medium','low','info');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.finding_status AS ENUM
    ('open','remediated','risk_accepted','wont_fix');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.doc_kind AS ENUM
    ('engagement_letter','scope_confirmation','report','retest','invoice','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.version_kind AS ENUM
    ('initial','retest','delta','revision');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.engagement_type AS ENUM
    ('vapt','pci_dss','audit');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Add status_stage to existing request tables -----------
ALTER TABLE public.vapt_requests
  ADD COLUMN IF NOT EXISTS status_stage public.engagement_stage NOT NULL DEFAULT 'requested';
ALTER TABLE public.pci_dss_requests
  ADD COLUMN IF NOT EXISTS status_stage public.engagement_stage NOT NULL DEFAULT 'requested';
ALTER TABLE public.audit_requests
  ADD COLUMN IF NOT EXISTS status_stage public.engagement_stage NOT NULL DEFAULT 'requested';

-- 3) Unified engagements view ------------------------------
CREATE OR REPLACE VIEW public.engagements_v
WITH (security_invoker = on) AS
SELECT
  v.id,
  'vapt'::public.engagement_type              AS type,
  v.public_id,
  v.user_id,
  COALESCE(o.company_name, v.target)          AS company_name,
  v.target                                    AS subject,
  v.status::text                              AS raw_status,
  v.status_stage,
  v.amount_kobo,
  v.currency,
  v.created_at,
  v.updated_at
FROM public.vapt_requests v
LEFT JOIN public.organizations o ON o.id = v.organization_id
UNION ALL
SELECT
  p.id,
  'pci_dss'::public.engagement_type,
  p.public_id,
  p.user_id,
  p.company                                   AS company_name,
  COALESCE(p.website, p.saq_type, p.company)  AS subject,
  p.status                                    AS raw_status,
  p.status_stage,
  p.amount_kobo,
  p.currency,
  p.created_at,
  p.updated_at
FROM public.pci_dss_requests p
UNION ALL
SELECT
  a.id,
  'audit'::public.engagement_type,
  a.reference                                 AS public_id,
  a.user_id,
  a.company_name,
  a.audit_type::text                          AS subject,
  a.status                                    AS raw_status,
  a.status_stage,
  a.total_kobo                                AS amount_kobo,
  a.currency,
  a.created_at,
  a.updated_at
FROM public.audit_requests a;

GRANT SELECT ON public.engagements_v TO authenticated;
GRANT SELECT ON public.engagements_v TO service_role;

-- 4) engagement_messages ------------------------------------
CREATE TABLE IF NOT EXISTS public.engagement_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL,
  engagement_type public.engagement_type NOT NULL,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  attachment_path TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS engagement_messages_engagement_idx
  ON public.engagement_messages (engagement_type, engagement_id, created_at DESC);

GRANT SELECT, INSERT ON public.engagement_messages TO authenticated;
GRANT ALL ON public.engagement_messages TO service_role;
ALTER TABLE public.engagement_messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.can_access_engagement(
  _user_id uuid, _type public.engagement_type, _engagement_id uuid
) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    public.has_role(_user_id, 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.engagements_v
      WHERE type = _type AND id = _engagement_id AND user_id = _user_id
    )
$$;

CREATE POLICY "read own or admin msgs" ON public.engagement_messages
  FOR SELECT TO authenticated
  USING (public.can_access_engagement(auth.uid(), engagement_type, engagement_id));

CREATE POLICY "insert own msgs" ON public.engagement_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND public.can_access_engagement(auth.uid(), engagement_type, engagement_id)
    AND (is_admin = false OR public.has_role(auth.uid(), 'admin'::app_role))
  );

-- 5) engagement_documents -----------------------------------
CREATE TABLE IF NOT EXISTS public.engagement_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL,
  engagement_type public.engagement_type NOT NULL,
  kind public.doc_kind NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  storage_path TEXT NOT NULL,
  sha256_hash TEXT,
  issued_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS engagement_documents_engagement_idx
  ON public.engagement_documents (engagement_type, engagement_id, kind, version DESC);

GRANT SELECT ON public.engagement_documents TO authenticated;
GRANT ALL ON public.engagement_documents TO service_role;
ALTER TABLE public.engagement_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read own or admin docs" ON public.engagement_documents
  FOR SELECT TO authenticated
  USING (public.can_access_engagement(auth.uid(), engagement_type, engagement_id));

CREATE POLICY "admin manage docs" ON public.engagement_documents
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 6) report_findings ----------------------------------------
CREATE TABLE IF NOT EXISTS public.report_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  severity public.finding_severity NOT NULL DEFAULT 'medium',
  cvss_score NUMERIC(3,1),
  cvss_vector TEXT,
  remediation TEXT,
  status public.finding_status NOT NULL DEFAULT 'open',
  retest_evidence_path TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS report_findings_report_idx
  ON public.report_findings (report_id, sort_order);

GRANT SELECT ON public.report_findings TO authenticated;
GRANT ALL ON public.report_findings TO service_role;
ALTER TABLE public.report_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client read own findings" ON public.report_findings
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.reports r
      LEFT JOIN public.vapt_requests v ON v.id = r.request_id
      WHERE r.id = report_findings.report_id
        AND (v.user_id = auth.uid())
    )
  );

CREATE POLICY "admin manage findings" ON public.report_findings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_report_findings_updated
  BEFORE UPDATE ON public.report_findings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 7) report_versions ----------------------------------------
CREATE TABLE IF NOT EXISTS public.report_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  version_no INTEGER NOT NULL,
  kind public.version_kind NOT NULL DEFAULT 'initial',
  storage_path TEXT NOT NULL,
  sha256_hash TEXT,
  notes TEXT,
  superseded BOOLEAN NOT NULL DEFAULT false,
  issued_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (report_id, version_no)
);
CREATE INDEX IF NOT EXISTS report_versions_report_idx
  ON public.report_versions (report_id, version_no DESC);

GRANT SELECT ON public.report_versions TO authenticated;
GRANT ALL ON public.report_versions TO service_role;
ALTER TABLE public.report_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client read own versions" ON public.report_versions
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.reports r
      LEFT JOIN public.vapt_requests v ON v.id = r.request_id
      WHERE r.id = report_versions.report_id
        AND (v.user_id = auth.uid())
    )
  );

CREATE POLICY "admin manage versions" ON public.report_versions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 8) admin_action_log ---------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_action_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_action_log_entity_idx
  ON public.admin_action_log (entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS admin_action_log_actor_idx
  ON public.admin_action_log (actor_id, created_at DESC);

GRANT SELECT ON public.admin_action_log TO authenticated;
GRANT ALL ON public.admin_action_log TO service_role;
ALTER TABLE public.admin_action_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin read action log" ON public.admin_action_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 9) invoices -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  engagement_id UUID,
  engagement_type public.engagement_type,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  number TEXT NOT NULL UNIQUE,
  amount_kobo BIGINT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  vat_kobo BIGINT NOT NULL DEFAULT 0,
  total_kobo BIGINT NOT NULL,
  pdf_path TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS invoices_user_idx ON public.invoices (user_id, issued_at DESC);

GRANT SELECT ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user read own invoice" ON public.invoices
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admin manage invoices" ON public.invoices
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 10) renewal_reminders -------------------------------------
CREATE TABLE IF NOT EXISTS public.renewal_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL,
  engagement_type public.engagement_type NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  due_at TIMESTAMPTZ NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('30d','60d','90d')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (engagement_type, engagement_id, kind)
);
CREATE INDEX IF NOT EXISTS renewal_reminders_due_idx
  ON public.renewal_reminders (due_at) WHERE sent_at IS NULL;

GRANT SELECT ON public.renewal_reminders TO authenticated;
GRANT ALL ON public.renewal_reminders TO service_role;
ALTER TABLE public.renewal_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin read reminders" ON public.renewal_reminders
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 11) download_counters -------------------------------------
CREATE TABLE IF NOT EXISTS public.download_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_code TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip TEXT,
  count INTEGER NOT NULL DEFAULT 1,
  first_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS download_counters_code_idx
  ON public.download_counters (verification_code, last_at DESC);
CREATE INDEX IF NOT EXISTS download_counters_user_idx
  ON public.download_counters (user_id, last_at DESC);

GRANT ALL ON public.download_counters TO service_role;
ALTER TABLE public.download_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin read counters" ON public.download_counters
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 12) verification_attempts index for per-code rate limit --
CREATE INDEX IF NOT EXISTS verification_attempts_code_time_idx
  ON public.verification_attempts (verification_code, created_at DESC);
