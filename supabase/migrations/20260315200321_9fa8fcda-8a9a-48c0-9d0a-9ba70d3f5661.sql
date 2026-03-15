
-- Leads table (covers both outreach and spreadsheet views)
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lead_type TEXT NOT NULL DEFAULT 'outreach', -- 'outreach' or 'spreadsheet'
  name TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  avatar TEXT DEFAULT '',
  linkedin TEXT DEFAULT '',
  about TEXT DEFAULT '',
  company_overview TEXT DEFAULT '',
  personal_interests JSONB DEFAULT '[]',
  experience JSONB DEFAULT '[]',
  recent_activity JSONB DEFAULT '[]',
  sent BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'verified',
  source TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own leads" ON public.leads
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Workflows table
CREATE TABLE public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Untitled Workflow',
  nodes JSONB NOT NULL DEFAULT '[]',
  is_deployed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own workflows" ON public.workflows
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Email drafts table
CREATE TABLE public.email_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  subject TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  is_template BOOLEAN DEFAULT false,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own email drafts" ON public.email_drafts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_leads_user_id ON public.leads(user_id);
CREATE INDEX idx_leads_type ON public.leads(lead_type);
CREATE INDEX idx_workflows_user_id ON public.workflows(user_id);
CREATE INDEX idx_email_drafts_user_id ON public.email_drafts(user_id);
