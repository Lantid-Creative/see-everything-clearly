-- Report versioning: mark superseded document versions
ALTER TABLE public.engagement_documents
  ADD COLUMN IF NOT EXISTS superseded BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS engagement_documents_current_idx
  ON public.engagement_documents (engagement_type, engagement_id, kind, superseded);