import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";
import { toast } from "sonner";

export interface Competitor {
  name: string;
  positioning: string;
  strength: string;
  weakness: string;
  threat_level: "high" | "medium" | "low";
}

export interface MarketTrend {
  name: string;
  description: string;
  impact: "opportunity" | "threat";
  urgency: "act_now" | "watch" | "monitor";
}

export interface StrategicInsight {
  title: string;
  description: string;
  action: string;
}

export interface MarketIntel {
  market_summary: string;
  competitors: Competitor[];
  trends: MarketTrend[];
  strategic_insights: StrategicInsight[];
  generated_at: string;
}

const CACHE_KEY = "lantid_market_intel";
const CACHE_TTL = 8 * 60 * 60 * 1000; // 8 hours

function getCached(userId: string): MarketIntel | null {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}_${userId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MarketIntel;
    if (Date.now() - new Date(parsed.generated_at).getTime() > CACHE_TTL) return null;
    return parsed;
  } catch {
    return null;
  }
}

function setCache(userId: string, intel: MarketIntel) {
  try {
    localStorage.setItem(`${CACHE_KEY}_${userId}`, JSON.stringify(intel));
  } catch { /* ignore */ }
}

export function useMarketIntel() {
  const { user } = useAuth();
  const workspace = useWorkspaceContext();
  const [intel, setIntel] = useState<MarketIntel | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const cached = getCached(user.id);
    if (cached) setIntel(cached);
  }, [user]);

  const generateIntel = useCallback(async () => {
    if (!user || !workspace) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("market-intel", {
        body: {
          productContext: {
            productName: workspace.productDetails?.name || workspace.company || "My Product",
            company: workspace.company,
            vision: workspace.productDetails?.vision,
            targetAudience: workspace.productDetails?.target_audience,
            keyObjectives: workspace.productDetails?.key_objectives,
            successMetrics: workspace.productDetails?.success_metrics,
            productGoals: workspace.productGoals,
            currentPhase: workspace.currentPhase,
            totalLeads: workspace.totalLeads,
          },
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const result: MarketIntel = {
        ...data.intel,
        generated_at: new Date().toISOString(),
      };
      setIntel(result);
      setCache(user.id, result);
    } catch (e: any) {
      console.error("Market intel generation failed:", e);
      toast.error(e.message || "Failed to generate market intelligence");
    } finally {
      setLoading(false);
    }
  }, [user, workspace]);

  return { intel, loading, generateIntel };
}
