import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { detectCurrentPhase } from "@/hooks/useProductPhase";
import type { WorkspaceContext } from "@/lib/streamChat";

export function useWorkspaceContext(): WorkspaceContext | null {
  const { user } = useAuth();
  const profile = useUserProfile();
  const [context, setContext] = useState<WorkspaceContext | null>(null);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const [leadsRes, convsRes, workflowsRes, emailsRes, teamRes, integrationsRes, productDetailsRes, topLeadsRes] = await Promise.all([
        supabase.from("leads").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("conversations").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("workflows").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("email_drafts").select("*", { count: "exact", head: true }).eq("user_id", user!.id).eq("sent", true),
        supabase.from("team_members").select("*", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("user_integrations").select("provider").eq("user_id", user!.id).eq("is_connected", true),
        // Fetch product details from Command Center (most recent product)
        supabase.from("product_details").select("vision, key_objectives, target_audience, success_metrics, context_notes, product_id").eq("user_id", user!.id).order("updated_at", { ascending: false }).limit(1),
        // Fetch top leads for context
        supabase.from("leads").select("name, company, title").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5),
      ]);

      const stats = {
        totalLeads: leadsRes.count || 0,
        totalConversations: convsRes.count || 0,
        totalWorkflows: workflowsRes.count || 0,
        emailsSent: emailsRes.count || 0,
        teamMembers: teamRes.count || 0,
      };

      const currentPhase = detectCurrentPhase({ ...stats, profile });

      // Get product name if we have product details
      let productDetails = null;
      const pd = productDetailsRes.data?.[0];
      if (pd) {
        let productName: string | undefined;
        if (pd.product_id) {
          const { data: prod } = await supabase.from("products").select("name").eq("id", pd.product_id).single();
          productName = prod?.name || undefined;
        }
        productDetails = {
          name: productName,
          vision: pd.vision,
          key_objectives: pd.key_objectives,
          target_audience: pd.target_audience,
          success_metrics: pd.success_metrics,
          context_notes: pd.context_notes,
        };
      }

      setContext({
        ...stats,
        userRole: profile?.role,
        company: profile?.company,
        productGoals: profile?.productGoals,
        connectedIntegrations: (integrationsRes.data || []).map((r: any) => r.provider),
        currentPhase,
        productDetails,
        topLeads: (topLeadsRes.data || []).map((l: any) => ({ name: l.name, company: l.company, title: l.title })),
      });
    }

    load();
  }, [user, profile]);

  return context;
}
