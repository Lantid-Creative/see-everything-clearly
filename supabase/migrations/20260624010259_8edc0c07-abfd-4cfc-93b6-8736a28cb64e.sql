
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_workflow_deployed() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_team_activity() FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_team_role(uuid, uuid, team_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_team_member(uuid, uuid) FROM anon;
