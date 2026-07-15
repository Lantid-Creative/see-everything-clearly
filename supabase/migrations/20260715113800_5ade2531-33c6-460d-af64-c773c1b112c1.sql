
-- agent_actions
DROP POLICY IF EXISTS "Users can update own agent actions" ON public.agent_actions;
CREATE POLICY "Users can update own agent actions" ON public.agent_actions
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- conversations
DROP POLICY IF EXISTS "Users can update own conversations" ON public.conversations;
CREATE POLICY "Users can update own conversations" ON public.conversations
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- messages
DROP POLICY IF EXISTS "Users can update messages in own conversations" ON public.messages;
CREATE POLICY "Users can update messages in own conversations" ON public.messages
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND c.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = messages.conversation_id AND c.user_id = auth.uid())
);

-- notifications
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- organizations: prevent owner reassignment; admins can still update but not change owner
DROP POLICY IF EXISTS "org owners update own" ON public.organizations;
CREATE POLICY "org owners update own" ON public.organizations
FOR UPDATE USING (
  (owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)
) WITH CHECK (
  owner_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role)
);

-- profiles: prevent self role escalation via trigger + WITH CHECK
CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
      RAISE EXCEPTION 'Not authorized to change role';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.prevent_profile_role_change() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS prevent_profile_role_change_trg ON public.profiles;
CREATE TRIGGER prevent_profile_role_change_trg
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_role_change();

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- reports storage bucket policies (owner-scoped, first-folder = user id)
DROP POLICY IF EXISTS "Users read own reports" ON storage.objects;
CREATE POLICY "Users read own reports" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users upload own reports" ON storage.objects;
CREATE POLICY "Users upload own reports" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users update own reports" ON storage.objects;
CREATE POLICY "Users update own reports" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users delete own reports" ON storage.objects;
CREATE POLICY "Users delete own reports" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);
