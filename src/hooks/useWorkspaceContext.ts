import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import type { WorkspaceContext } from "@/lib/streamChat";

export function useWorkspaceContext(): WorkspaceContext | null {
  const { user } = useAuth();
  const profile = useUserProfile();
  const [context, setContext] = useState<WorkspaceContext | null>(null);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const [leadsRes, convsRes, workflowsRes, emailsRes, teamRes, integrationsRes] = await Promise.all([
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("conversations").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("workflows").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("email_drafts").select("*", { count: "exact", head: true }).eq("user_id", user!.id).eq("sent", true),
        supabase.from("team_members").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("user_integrations").select("provider").eq("user_id", user!.id).eq("is_connected", true),
      ]);

      setContext({
        totalLeads: leadsRes.count || 0,
        totalConversations: convsRes.count || 0,
        totalWorkflows: workflowsRes.count || 0,
        emailsSent: emailsRes.count || 0,
        teamMembers: teamRes.count || 0,
        userRole: profile?.role,
        company: profile?.company,
        productGoals: profile?.productGoals,
        connectedIntegrations: (integrationsRes.data || []).map((r: any) => r.provider),
      });
    }

    load();
  }, [user, profile]);

  return context;
}
