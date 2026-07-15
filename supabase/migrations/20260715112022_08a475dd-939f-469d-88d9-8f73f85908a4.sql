
-- 1. Add report_type column
ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS report_type text NOT NULL DEFAULT 'vapt'
  CHECK (report_type IN ('vapt','pci_dss'));

-- 2. Seed Clea PCI DSS report
INSERT INTO public.reports (
  verification_code, company_name, target, scope_summary, assessment_type,
  report_type, status, overall_result, sha256_hash, issued_at
) VALUES (
  'LNTD-PCI-CLE-2026-7K3M42',
  'Clea Technology Limited',
  'tryclea.com',
  'PCI DSS v4.0 Compliance Assessment — Cardholder Data Environment scoping, Build & Maintain Secure Networks, Protect Cardholder Data, Vulnerability Management, Access Control, Network Monitoring, Information Security Policy',
  'advanced',
  'pci_dss',
  'issued',
  'passed',
  'pending-hash-on-pdf-upload',
  '2026-07-15 00:00:00+00'
)
ON CONFLICT (verification_code) DO NOTHING;
