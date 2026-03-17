CREATE TABLE public.product_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  vision text DEFAULT '',
  target_audience text DEFAULT '',
  success_metrics text DEFAULT '',
  key_objectives text DEFAULT '',
  context_notes text DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id)
);

ALTER TABLE public.product_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own product details"
  ON public.product_details FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);