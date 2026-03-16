import { useMemo } from "react";
import type { UserProfile } from "@/hooks/useUserProfile";

export type ProductPhase = "discover" | "define" | "prioritize" | "build" | "launch" | "measure";

export interface PhaseInfo {
  id: ProductPhase;
  label: string;
  description: string;
  progress: number; // 0-100
  isActive: boolean;
  suggestedActions: string[];
}

interface PhaseInput {
  totalLeads: number;
  totalConversations: number;
  totalWorkflows: number;
  emailsSent: number;
  teamMembers: number;
  profile: UserProfile | null;
}

const PHASE_DEFINITIONS: Record<ProductPhase, { label: string; description: string }> = {
  discover: { label: "Discover", description: "Identify problems worth solving" },
  define: { label: "Define", description: "Write specs, PRDs & user stories" },
  prioritize: { label: "Prioritize", description: "Score and sequence your roadmap" },
  build: { label: "Build", description: "Create workflows & automate processes" },
  launch: { label: "Launch", description: "Outreach, GTM & stakeholder alignment" },
  measure: { label: "Measure", description: "Track metrics & iterate" },
};

export function detectCurrentPhase(input: PhaseInput): ProductPhase {
  const { totalLeads, totalConversations, totalWorkflows, emailsSent, profile } = input;
  const goals = profile?.productGoals?.toLowerCase() || "";

  // If they've sent emails and have workflows, they're in launch/measure
  if (emailsSent > 3 && totalWorkflows > 0) return "measure";
  if (emailsSent > 0 || totalLeads > 5) return "launch";
  if (totalWorkflows > 0) return "build";

  // Check goals for hints
  if (goals.includes("prioritize") || goals.includes("roadmap")) return "prioritize";
  if (goals.includes("prd") || goals.includes("spec")) return "define";

  // Based on conversation count
  if (totalConversations > 5) return "define";
  if (totalConversations > 2) return "discover";

  return "discover";
}

export function getPhaseProgress(phase: ProductPhase, input: PhaseInput): number {
  switch (phase) {
    case "discover":
      return Math.min(100, (input.totalConversations / 5) * 100);
    case "define":
      return Math.min(100, (input.totalConversations / 10) * 50 + (input.totalLeads > 0 ? 50 : 0));
    case "prioritize":
      return Math.min(100, (input.totalConversations / 8) * 60 + (input.totalWorkflows > 0 ? 40 : 0));
    case "build":
      return Math.min(100, (input.totalWorkflows / 3) * 100);
    case "launch":
      return Math.min(100, (input.emailsSent / 5) * 50 + (input.totalLeads / 10) * 50);
    case "measure":
      return Math.min(100, (input.emailsSent / 10) * 40 + (input.totalWorkflows / 3) * 30 + (input.teamMembers / 3) * 30);
    default:
      return 0;
  }
}

export function getPhaseSuggestions(phase: ProductPhase, input: PhaseInput): string[] {
  switch (phase) {
    case "discover":
      return [
        input.totalConversations === 0 ? "Start by describing the problem you're solving" : "Run a user interview to validate assumptions",
        "Build a user persona for your target audience",
        "Synthesize existing feedback into themes",
      ];
    case "define":
      return [
        "Write a PRD for your top feature",
        "Break the feature into user stories",
        "Define acceptance criteria for engineering",
      ];
    case "prioritize":
      return [
        "Apply RICE scoring to your feature backlog",
        "Create a roadmap with Now/Next/Later",
        "Run a competitive analysis to find gaps",
      ];
    case "build":
      return [
        input.totalWorkflows === 0 ? "Create your first automation workflow" : "Add more steps to your workflow",
        "Set up a feedback-to-insight pipeline",
        "Connect integrations to power automations",
      ];
    case "launch":
      return [
        "Draft a go-to-market plan",
        input.emailsSent === 0 ? "Send your first outreach email" : "Follow up on pending outreach",
        "Create a stakeholder update deck",
      ];
    case "measure":
      return [
        "Define success metrics for your launch",
        "Plan an A/B test for a key feature",
        "Run a sprint retrospective",
      ];
  }
}

export function useProductPhase(input: PhaseInput | null) {
  return useMemo(() => {
    if (!input) return null;

    const currentPhase = detectCurrentPhase(input);
    const phases: ProductPhase[] = ["discover", "define", "prioritize", "build", "launch", "measure"];

    const phaseInfos: PhaseInfo[] = phases.map((id) => ({
      id,
      label: PHASE_DEFINITIONS[id].label,
      description: PHASE_DEFINITIONS[id].description,
      progress: Math.round(getPhaseProgress(id, input)),
      isActive: id === currentPhase,
      suggestedActions: getPhaseSuggestions(id, input),
    }));

    return {
      currentPhase,
      currentPhaseInfo: phaseInfos.find((p) => p.id === currentPhase)!,
      phases: phaseInfos,
    };
  }, [input]);
}
