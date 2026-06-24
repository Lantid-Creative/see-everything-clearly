
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.has_team_role(uuid, uuid, team_role) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.is_team_member(uuid, uuid) FROM authenticated;
