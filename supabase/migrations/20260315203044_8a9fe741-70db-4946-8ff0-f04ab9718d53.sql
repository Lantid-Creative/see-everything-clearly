
-- Team role enum
CREATE TYPE public.team_role AS ENUM ('owner', 'admin', 'member', 'viewer');

-- Teams table
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'My Team',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Team members
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role team_role NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Team messages (chat)
CREATE TABLE public.team_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;

-- Activity feed
CREATE TABLE public.team_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  entity_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.team_activity ENABLE ROW LEVEL SECURITY;

-- Enable realtime for team messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_activity;

-- Security definer function to check team membership
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id uuid, _team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = _user_id AND team_id = _team_id
  )
$$;

-- Security definer function to check team role
CREATE OR REPLACE FUNCTION public.has_team_role(_user_id uuid, _team_id uuid, _role team_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = _user_id AND team_id = _team_id AND role = _role
  )
$$;

-- Teams RLS: members can view their teams
CREATE POLICY "Members can view team" ON public.teams
  FOR SELECT USING (public.is_team_member(auth.uid(), id));

CREATE POLICY "Authenticated users can create teams" ON public.teams
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins and owners can update team" ON public.teams
  FOR UPDATE USING (
    public.has_team_role(auth.uid(), id, 'owner') OR public.has_team_role(auth.uid(), id, 'admin')
  );

CREATE POLICY "Owner can delete team" ON public.teams
  FOR DELETE USING (public.has_team_role(auth.uid(), id, 'owner'));

-- Team members RLS
CREATE POLICY "Members can view team members" ON public.team_members
  FOR SELECT USING (public.is_team_member(auth.uid(), team_id));

CREATE POLICY "Admins can manage team members" ON public.team_members
  FOR INSERT WITH CHECK (
    public.has_team_role(auth.uid(), team_id, 'owner') OR public.has_team_role(auth.uid(), team_id, 'admin')
  );

CREATE POLICY "Admins can update team members" ON public.team_members
  FOR UPDATE USING (
    public.has_team_role(auth.uid(), team_id, 'owner') OR public.has_team_role(auth.uid(), team_id, 'admin')
  );

CREATE POLICY "Admins can remove team members" ON public.team_members
  FOR DELETE USING (
    public.has_team_role(auth.uid(), team_id, 'owner') OR public.has_team_role(auth.uid(), team_id, 'admin')
    OR auth.uid() = user_id
  );

-- Team messages RLS
CREATE POLICY "Members can view team messages" ON public.team_messages
  FOR SELECT USING (public.is_team_member(auth.uid(), team_id));

CREATE POLICY "Members can send team messages" ON public.team_messages
  FOR INSERT WITH CHECK (
    public.is_team_member(auth.uid(), team_id) AND auth.uid() = user_id
  );

-- Team activity RLS
CREATE POLICY "Members can view team activity" ON public.team_activity
  FOR SELECT USING (public.is_team_member(auth.uid(), team_id));

CREATE POLICY "Members can log team activity" ON public.team_activity
  FOR INSERT WITH CHECK (
    public.is_team_member(auth.uid(), team_id) AND auth.uid() = user_id
  );
