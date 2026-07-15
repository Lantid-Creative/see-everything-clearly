CREATE TABLE public.pci_dss_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  saq_type TEXT,
  merchant_level TEXT,
  annual_transactions TEXT,
  environment TEXT,
  current_status TEXT,
  timeline TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.pci_dss_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.pci_dss_requests TO authenticated;
GRANT ALL ON public.pci_dss_requests TO service_role;

ALTER TABLE public.pci_dss_requests ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous website visitors) can submit an intake request.
CREATE POLICY "Anyone can submit a PCI DSS request"
  ON public.pci_dss_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read/manage submissions.
CREATE POLICY "Admins can view PCI DSS requests"
  ON public.pci_dss_requests
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update PCI DSS requests"
  ON public.pci_dss_requests
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete PCI DSS requests"
  ON public.pci_dss_requests
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER pci_dss_requests_touch
  BEFORE UPDATE ON public.pci_dss_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
