
-- Extend pci_dss_requests for tiered paid engagements
ALTER TABLE public.pci_dss_requests
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS amount_kobo BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'NGN',
  ADD COLUMN IF NOT EXISTS public_id TEXT UNIQUE;

-- Backfill public_id for any pre-existing rows
UPDATE public.pci_dss_requests
SET public_id = 'PCI-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8))
WHERE public_id IS NULL;

ALTER TABLE public.pci_dss_requests
  ALTER COLUMN public_id SET DEFAULT 'PCI-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8)),
  ALTER COLUMN public_id SET NOT NULL;

-- Tighten RLS: submissions now require an authenticated user (payment flow needs it)
DROP POLICY IF EXISTS "Anyone can submit a PCI DSS request" ON public.pci_dss_requests;
DROP POLICY IF EXISTS "Admins can view PCI DSS requests" ON public.pci_dss_requests;
DROP POLICY IF EXISTS "Admins can update PCI DSS requests" ON public.pci_dss_requests;
DROP POLICY IF EXISTS "Admins can delete PCI DSS requests" ON public.pci_dss_requests;

CREATE POLICY "Users can submit their own PCI DSS requests"
  ON public.pci_dss_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own PCI DSS requests"
  ON public.pci_dss_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own PCI DSS requests"
  ON public.pci_dss_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete PCI DSS requests"
  ON public.pci_dss_requests
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Extend payments to also cover PCI DSS
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'vapt',
  ADD COLUMN IF NOT EXISTS pci_request_id UUID REFERENCES public.pci_dss_requests(id) ON DELETE SET NULL,
  ALTER COLUMN request_id DROP NOT NULL;
