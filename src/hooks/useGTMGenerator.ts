import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GTMPlan {
  prd: {
    title: string;
    overview: string;
    problem_statement: string;
    target_users: string;
    features: { name: string; description: string }[];
    user_stories: string[];
    success_metrics: string[];
    timeline: string;
  };
  leads: { name: string; title: string; company: string; email: string; personalization_note: string }[];
  emails: { lead_name: string; subject: string; body: string }[];
  slides: { title: string; bullets: string[] }[];
  workflow: { name: string; nodes: { id: string; type: string; label: string; description: string }[] };
}

export interface GTMResult {
  plan: GTMPlan;
  results: {
    leadsCreated: number;
    emailsCreated: number;
    workflowCreated: boolean;
  };
}

export function useGTMGenerator() {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GTMResult | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string) => {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setResult(null);
    setActiveSection(null);

    try {
      const { data, error } = await supabase.functions.invoke("gtm-generator", {
        body: { prompt },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data as GTMResult);
      setActiveSection("prd");
      toast.success("GTM plan generated!", {
        description: `${data.results.leadsCreated} leads, ${data.results.emailsCreated} emails, workflow ready`,
      });
      return data as GTMResult;
    } catch (e: any) {
      console.error("GTM generation failed:", e);
      toast.error(e.message || "GTM generation failed");
      return null;
    } finally {
      setGenerating(false);
    }
  }, [generating]);

  const reset = useCallback(() => {
    setResult(null);
    setActiveSection(null);
  }, []);

  return { generating, result, activeSection, setActiveSection, generate, reset };
}
