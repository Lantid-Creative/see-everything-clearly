import { useMemo } from "react";
import type { UserProfile } from "@/hooks/useUserProfile";

export type ProductPhase = "discover" | "define" | "prioritize" | "build" | "launch" | "measure";

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  isComplete: boolean;
  action: { type: "navigate" | "chat"; target: string; prompt?: string };
}

export interface PhaseGuide {
  id: ProductPhase;
  label: string;
  tagline: string;
  description: string;
  color: string; // tailwind token
  emoji: string;
  goal: string;
  checklist: ChecklistItem[];
  templates: { label: string; prompt: string }[];
  tools: string[]; // view names to highlight
  nextPhase: ProductPhase | null;
  transitionHint: string;
}

export interface PhaseInfo {
  id: ProductPhase;
  label: string;
  description: string;
  progress: number;
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

// ─── Phase Guides ────────────────────────────────────────────────────────────

export const PHASE_GUIDES: Record<ProductPhase, Omit<PhaseGuide, "checklist"> & { checklist: (input: PhaseInput) => ChecklistItem[] }> = {
  discover: {
    id: "discover",
    label: "Discover",
    tagline: "Empathize & explore",
    description: "Understand the problem space before jumping to solutions. Talk to users, research the market, and identify unmet needs.",
    color: "blue",
    emoji: "🔍",
    goal: "Validate that a real problem exists worth solving",
    templates: [
      { label: "User Interview Script", prompt: "Help me create a user interview script for my product. I want to understand [problem area]. My target users are [describe users]. Generate a structured interview guide with open-ended questions, probing follow-ups, and a warm-up section." },
      { label: "User Persona", prompt: "Help me build a detailed user persona. I'll describe my target user and you create a structured persona with demographics, goals, frustrations, behaviors, and a day-in-the-life scenario." },
      { label: "Problem Statement", prompt: "Help me write a clear problem statement using the format: [User] needs a way to [need] because [insight]. I want to validate this problem before building anything." },
      { label: "Competitive Landscape", prompt: "Help me map out the competitive landscape for my product space. I'll describe what I'm building and you'll help identify direct competitors, indirect alternatives, and market gaps." },
    ],
    tools: ["chat", "workspace"],
    nextPhase: "define",
    transitionHint: "Once you've validated the problem with 3-5 user conversations, move to Define to write specs.",
    checklist: (input) => [
      {
        id: "disc-1",
        label: "Describe the problem you're solving",
        description: "Start a conversation with the AI to articulate the problem space",
        isComplete: input.totalConversations >= 1,
        action: { type: "chat", target: "chat", prompt: "I'm exploring a new product idea. Help me articulate the problem I'm trying to solve. Here's what I'm thinking..." },
      },
      {
        id: "disc-2",
        label: "Create a user persona",
        description: "Define who you're building for with a structured persona",
        isComplete: input.totalConversations >= 2,
        action: { type: "chat", target: "chat", prompt: "Help me build a detailed user persona for my target audience. I want to understand their goals, frustrations, and daily workflows." },
      },
      {
        id: "disc-3",
        label: "Run a user interview",
        description: "Use the AI to practice or structure your interview questions",
        isComplete: input.totalConversations >= 3,
        action: { type: "chat", target: "chat", prompt: "Help me create a user interview script. I want to validate my assumptions about [problem]. Generate open-ended questions with follow-up probes." },
      },
      {
        id: "disc-4",
        label: "Add research leads",
        description: "Import contacts or prospects you want to interview",
        isComplete: input.totalLeads >= 1,
        action: { type: "navigate", target: "workspace" },
      },
      {
        id: "disc-5",
        label: "Synthesize findings",
        description: "Summarize themes from your research into actionable insights",
        isComplete: input.totalConversations >= 5,
        action: { type: "chat", target: "chat", prompt: "Help me synthesize my user research findings. I've talked to several users and here are the key themes I'm seeing..." },
      },
    ],
  },

  define: {
    id: "define",
    label: "Define",
    tagline: "Articulate & specify",
    description: "Transform research insights into concrete product specs. Write PRDs, user stories, and acceptance criteria.",
    color: "violet",
    emoji: "📋",
    goal: "Produce a clear PRD or spec document ready for prioritization",
    templates: [
      { label: "Product Requirements Doc", prompt: "Help me write a PRD for a new feature. Include: Problem statement, Goals & success metrics, User stories, Scope (in/out), Technical considerations, and Launch plan. The feature is about..." },
      { label: "User Stories", prompt: "Generate user stories for my feature using the format: As a [user type], I want [goal], so that [benefit]. Include acceptance criteria for each story. The feature is..." },
      { label: "Technical Spec", prompt: "Help me write a technical specification for engineering handoff. Include: Architecture overview, API endpoints, Data models, Edge cases, and Dependencies. The feature is..." },
      { label: "Success Metrics", prompt: "Help me define success metrics for my feature. I need primary KPIs, secondary metrics, and guardrail metrics. The feature is about..." },
    ],
    tools: ["chat", "slides", "spreadsheet"],
    nextPhase: "prioritize",
    transitionHint: "Once you have a PRD and user stories, move to Prioritize to rank your backlog.",
    checklist: (input) => [
      {
        id: "def-1",
        label: "Write a problem statement",
        description: "Crystallize your research into a clear problem definition",
        isComplete: input.totalConversations >= 4,
        action: { type: "chat", target: "chat", prompt: "Based on my discovery research, help me write a concise problem statement. The key insight is..." },
      },
      {
        id: "def-2",
        label: "Draft a PRD",
        description: "Create a structured product requirements document",
        isComplete: input.totalConversations >= 6,
        action: { type: "chat", target: "chat", prompt: "Help me write a PRD. Include problem statement, goals, user stories, scope, and success metrics. My feature is about..." },
      },
      {
        id: "def-3",
        label: "Generate user stories",
        description: "Break features into user-facing stories with acceptance criteria",
        isComplete: input.totalConversations >= 7,
        action: { type: "chat", target: "chat", prompt: "Generate detailed user stories with acceptance criteria for my feature. As a [user], I want [goal], so that [benefit]." },
      },
      {
        id: "def-4",
        label: "Create a spec deck",
        description: "Build a presentation to share with stakeholders",
        isComplete: false, // Would need slides tracking
        action: { type: "navigate", target: "slides" },
      },
      {
        id: "def-5",
        label: "Define success metrics",
        description: "Set measurable goals for your feature",
        isComplete: input.totalConversations >= 8,
        action: { type: "chat", target: "chat", prompt: "Help me define success metrics for my feature. I need primary KPIs, secondary metrics, and guardrail metrics." },
      },
    ],
  },

  prioritize: {
    id: "prioritize",
    label: "Prioritize",
    tagline: "Score & sequence",
    description: "Evaluate features objectively and build a roadmap. Use frameworks like RICE to make data-driven prioritization decisions.",
    color: "amber",
    emoji: "⚖️",
    goal: "A scored backlog and a Now/Next/Later roadmap",
    templates: [
      { label: "RICE Scoring", prompt: "Help me apply RICE scoring (Reach, Impact, Confidence, Effort) to prioritize my feature backlog. Here are the features I'm considering..." },
      { label: "Now/Next/Later Roadmap", prompt: "Help me organize my features into a Now/Next/Later roadmap. Consider dependencies, team capacity, and strategic alignment. My features are..." },
      { label: "Trade-off Analysis", prompt: "Help me evaluate the trade-offs between these competing features. I need to choose what to build first. The options are..." },
      { label: "Competitive Gap Analysis", prompt: "Analyze competitive gaps for my product. Help me identify features where we can differentiate. Our competitors are..." },
    ],
    tools: ["chat", "spreadsheet", "slides"],
    nextPhase: "build",
    transitionHint: "Once your roadmap is set and the team is aligned, move to Build.",
    checklist: (input) => [
      {
        id: "pri-1",
        label: "Score your feature backlog",
        description: "Apply RICE or ICE scoring to rank features objectively",
        isComplete: input.totalConversations >= 8,
        action: { type: "chat", target: "chat", prompt: "Help me RICE score my feature backlog. I'll list my features and you help me evaluate Reach, Impact, Confidence, and Effort for each." },
      },
      {
        id: "pri-2",
        label: "Build a roadmap spreadsheet",
        description: "Organize priorities into a structured roadmap view",
        isComplete: false,
        action: { type: "navigate", target: "spreadsheet" },
      },
      {
        id: "pri-3",
        label: "Run competitive analysis",
        description: "Identify gaps and opportunities vs. competitors",
        isComplete: input.totalConversations >= 9,
        action: { type: "chat", target: "chat", prompt: "Help me run a competitive analysis. I want to identify feature gaps and differentiation opportunities for my product." },
      },
      {
        id: "pri-4",
        label: "Create stakeholder alignment deck",
        description: "Build a presentation to get buy-in on priorities",
        isComplete: false,
        action: { type: "navigate", target: "slides" },
      },
    ],
  },

  build: {
    id: "build",
    label: "Build",
    tagline: "Execute & automate",
    description: "Turn your plans into reality. Set up workflows, automate processes, and coordinate with your team.",
    color: "emerald",
    emoji: "🔨",
    goal: "Working automations and a team ready to execute",
    templates: [
      { label: "Sprint Planning", prompt: "Help me plan a sprint. I need to break down my top priority into tasks, estimate effort, and assign ownership. The feature is..." },
      { label: "Automation Workflow", prompt: "Help me design an automation workflow. I want to automate [process]. Describe the trigger, steps, and expected output." },
      { label: "QA Checklist", prompt: "Generate a QA checklist for my feature. Include functional tests, edge cases, accessibility checks, and performance criteria. The feature is..." },
      { label: "Technical Handoff", prompt: "Create a technical handoff document for engineering. Include architecture decisions, API contracts, data models, and acceptance criteria." },
    ],
    tools: ["workflow", "chat", "spreadsheet"],
    nextPhase: "launch",
    transitionHint: "Once your workflows are running and the team is executing, prepare for Launch.",
    checklist: (input) => [
      {
        id: "build-1",
        label: "Create your first workflow",
        description: "Build an automation to streamline a repetitive process",
        isComplete: input.totalWorkflows >= 1,
        action: { type: "navigate", target: "workflow" },
      },
      {
        id: "build-2",
        label: "Set up integrations",
        description: "Connect external tools to power your workflows",
        isComplete: false,
        action: { type: "navigate", target: "integrations" },
      },
      {
        id: "build-3",
        label: "Invite team members",
        description: "Collaborate with your team on building",
        isComplete: input.teamMembers >= 1,
        action: { type: "navigate", target: "team" },
      },
      {
        id: "build-4",
        label: "Plan your sprint",
        description: "Break down the top priority into executable tasks",
        isComplete: input.totalConversations >= 10,
        action: { type: "chat", target: "chat", prompt: "Help me plan a sprint. I need to break down my top feature into tasks with effort estimates." },
      },
    ],
  },

  launch: {
    id: "launch",
    label: "Launch",
    tagline: "Ship & announce",
    description: "Get your product in front of users. Draft go-to-market plans, send outreach, and align stakeholders.",
    color: "orange",
    emoji: "🚀",
    goal: "Product shipped with GTM plan executed",
    templates: [
      { label: "GTM Plan", prompt: "Help me create a go-to-market plan. Include target audience, positioning, channels, messaging, and timeline. My product is..." },
      { label: "Launch Email", prompt: "Draft a launch announcement email for my product. It should be compelling, concise, and include a clear CTA. The product is..." },
      { label: "Stakeholder Update", prompt: "Write a stakeholder update on our product launch. Include what we shipped, initial metrics, and next steps." },
      { label: "Launch Checklist", prompt: "Generate a comprehensive launch checklist covering: marketing, engineering, support, legal, and analytics setup." },
    ],
    tools: ["workspace", "chat", "slides"],
    nextPhase: "measure",
    transitionHint: "Once you've launched, move to Measure to track results and iterate.",
    checklist: (input) => [
      {
        id: "launch-1",
        label: "Draft your GTM plan",
        description: "Create a go-to-market strategy with channels and messaging",
        isComplete: input.totalConversations >= 10,
        action: { type: "chat", target: "chat", prompt: "Help me create a go-to-market plan for my product launch. Include positioning, target channels, and timeline." },
      },
      {
        id: "launch-2",
        label: "Build a launch deck",
        description: "Create a presentation for your launch announcement",
        isComplete: false,
        action: { type: "navigate", target: "slides" },
      },
      {
        id: "launch-3",
        label: "Send outreach emails",
        description: "Reach out to leads, users, and stakeholders",
        isComplete: input.emailsSent >= 1,
        action: { type: "navigate", target: "workspace" },
      },
      {
        id: "launch-4",
        label: "Import launch contacts",
        description: "Add people who should know about your launch",
        isComplete: input.totalLeads >= 5,
        action: { type: "navigate", target: "workspace" },
      },
    ],
  },

  measure: {
    id: "measure",
    label: "Measure",
    tagline: "Learn & iterate",
    description: "Track what matters, learn from data, and decide what to do next. Close the loop on your product cycle.",
    color: "rose",
    emoji: "📊",
    goal: "Data-driven insights that feed back into the next Discovery cycle",
    templates: [
      { label: "KPI Dashboard Plan", prompt: "Help me design a KPI dashboard for my product. I need to track primary metrics, secondary metrics, and health indicators. My product does..." },
      { label: "A/B Test Plan", prompt: "Help me plan an A/B test. I want to test [hypothesis]. Define the variants, sample size, success metric, and duration." },
      { label: "Sprint Retrospective", prompt: "Facilitate a sprint retrospective. Help me structure what went well, what didn't, and action items for improvement." },
      { label: "User Feedback Analysis", prompt: "Help me analyze user feedback from our launch. I'll share the feedback and you categorize it into themes, severity, and recommended actions." },
    ],
    tools: ["chat", "spreadsheet", "workflow"],
    nextPhase: null,
    transitionHint: "Ready to start a new cycle? Go back to Discover with your learnings.",
    checklist: (input) => [
      {
        id: "meas-1",
        label: "Define success metrics",
        description: "Set the KPIs that matter for your launch",
        isComplete: input.totalConversations >= 12,
        action: { type: "chat", target: "chat", prompt: "Help me define success metrics for my launched product. I need primary KPIs, leading indicators, and guardrail metrics." },
      },
      {
        id: "meas-2",
        label: "Plan an experiment",
        description: "Design an A/B test or experiment to optimize",
        isComplete: input.totalConversations >= 13,
        action: { type: "chat", target: "chat", prompt: "Help me plan an A/B test. I want to test a hypothesis about my product. Help me structure the experiment." },
      },
      {
        id: "meas-3",
        label: "Set up a feedback pipeline",
        description: "Create a workflow to automatically process user feedback",
        isComplete: input.totalWorkflows >= 2,
        action: { type: "navigate", target: "workflow" },
      },
      {
        id: "meas-4",
        label: "Run a retrospective",
        description: "Reflect on what worked and what to improve",
        isComplete: input.totalConversations >= 14,
        action: { type: "chat", target: "chat", prompt: "Help me run a sprint retrospective. I want to reflect on what went well, what didn't, and create action items." },
      },
    ],
  },
};

// ─── Phase detection & progress ──────────────────────────────────────────────

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

  if (emailsSent > 3 && totalWorkflows > 0) return "measure";
  if (emailsSent > 0 || totalLeads > 5) return "launch";
  if (totalWorkflows > 0) return "build";
  if (goals.includes("prioritize") || goals.includes("roadmap")) return "prioritize";
  if (goals.includes("prd") || goals.includes("spec")) return "define";
  if (totalConversations > 5) return "define";
  if (totalConversations > 2) return "discover";
  return "discover";
}

export function getPhaseProgress(phase: ProductPhase, input: PhaseInput): number {
  const guide = PHASE_GUIDES[phase];
  const checklist = guide.checklist(input);
  const done = checklist.filter((c) => c.isComplete).length;
  return Math.round((done / checklist.length) * 100);
}

export function getPhaseChecklist(phase: ProductPhase, input: PhaseInput): ChecklistItem[] {
  return PHASE_GUIDES[phase].checklist(input);
}

export function getPhaseSuggestions(phase: ProductPhase, input: PhaseInput): string[] {
  const checklist = PHASE_GUIDES[phase].checklist(input);
  return checklist.filter((c) => !c.isComplete).slice(0, 3).map((c) => c.label);
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
      progress: getPhaseProgress(id, input),
      isActive: id === currentPhase,
      suggestedActions: getPhaseSuggestions(id, input),
    }));

    return {
      currentPhase,
      currentPhaseInfo: phaseInfos.find((p) => p.id === currentPhase)!,
      phases: phaseInfos,
      input,
    };
  }, [input]);
}
