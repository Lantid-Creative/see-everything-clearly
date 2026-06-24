ALTER TABLE public.reports ALTER COLUMN sha256_hash DROP NOT NULL;
UPDATE public.reports SET storage_path = NULL, sha256_hash = NULL WHERE verification_code = 'LNTD-VAPT-HRN-2026-8F4K91';