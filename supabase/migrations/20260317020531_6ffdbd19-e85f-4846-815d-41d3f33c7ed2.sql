
CREATE TABLE public.checklist_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  item_id text NOT NULL,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id, item_id)
);

ALTER TABLE public.checklist_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own checklist progress"
  ON public.checklist_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
