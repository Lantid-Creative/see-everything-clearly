
-- Lock down SECURITY DEFINER functions: revoke EXECUTE from public/anon/authenticated.
-- Trigger functions never need direct EXECUTE. RLS helper functions and verify_audit_report
-- are re-granted narrowly where needed.

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_workflow_deployed() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_team_activity() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_team_role(uuid, uuid, public.team_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_team_member(uuid, uuid) FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.verify_audit_report(text) FROM PUBLIC, anon, authenticated;
-- verify-report edge function uses the service role, so no public grant is needed.
