
-- 1. Reports table: replace permissive SELECT with owner + admin scoped reads.
DROP POLICY IF EXISTS "public read reports for verification" ON public.reports;

CREATE POLICY "owner reads own reports"
ON public.reports
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.vapt_requests vr
    WHERE vr.id = reports.request_id
      AND vr.user_id = auth.uid()
  )
);

CREATE POLICY "admin reads all reports"
ON public.reports
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. Attachments bucket: remove anon SELECT (bucket switched to private separately).
DROP POLICY IF EXISTS "Public can read attachments" ON storage.objects;

-- 3. Clear cached Harrenapay report so it regenerates using the private-bucket asset fetch.
UPDATE public.reports
SET storage_path = NULL
WHERE verification_code = 'LNTD-VAPT-HRN-2026-8F4K91';

-- 4. Lock down SECURITY DEFINER functions.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_workflow_deployed() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.notify_team_activity() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.has_team_role(uuid, uuid, team_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_team_role(uuid, uuid, team_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_team_member(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_team_member(uuid, uuid) TO authenticated, service_role;
