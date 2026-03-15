
-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  entity_type text,
  entity_id uuid,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow insert from triggers (service role) and authenticated users for self
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger function: notify team members when team_activity is inserted
CREATE OR REPLACE FUNCTION public.notify_team_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_record RECORD;
  actor_name text;
BEGIN
  -- Get actor display name
  SELECT display_name INTO actor_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  actor_name := COALESCE(actor_name, 'A team member');

  -- Notify all team members except the actor
  FOR member_record IN
    SELECT user_id FROM public.team_members
    WHERE team_id = NEW.team_id AND user_id != NEW.user_id
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, entity_type, entity_id)
    VALUES (
      member_record.user_id,
      'team_activity',
      actor_name || ' ' || NEW.action,
      COALESCE(NEW.entity_name, NEW.entity_type),
      NEW.entity_type,
      NEW.entity_id
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_team_activity_notify
  AFTER INSERT ON public.team_activity
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_team_activity();

-- Trigger function: notify user when workflow is deployed
CREATE OR REPLACE FUNCTION public.notify_workflow_deployed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only fire when is_deployed changes to true
  IF NEW.is_deployed = true AND (OLD.is_deployed IS NULL OR OLD.is_deployed = false) THEN
    INSERT INTO public.notifications (user_id, type, title, message, entity_type, entity_id)
    VALUES (
      NEW.user_id,
      'workflow',
      'Workflow deployed',
      NEW.name || ' is now live',
      'workflow',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_workflow_deployed_notify
  AFTER UPDATE ON public.workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_workflow_deployed();
