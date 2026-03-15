import { Sparkles, MessageSquare } from "lucide-react";
import type { Lead } from "@/components/WorkspaceView";

interface ResearchPanelProps {
  lead: Lead;
}

const researchMessages = [
  {
    role: "assistant" as const,
    content: "Great idea — I'll find startup founders who'd be a natural fit for ClosedAI. Running parallel research now across early-stage companies doing knowledge-heavy work — pulling name, title, email, and LinkedIn data for each.",
    action: "Used spreadsheet research",
  },
  {
    role: "assistant" as const,
    content: "Research complete. Found 15 founders across 7 companies with verified emails and LinkedIn profiles.",
  },
  {
    role: "user" as const,
    content: "can you help me outreach them?",
  },
  {
    role: "assistant" as const,
    content: "Picked the best contact from each company (7 founders total). Setting up your outreach dashboard now with their LinkedIn profile and deep research side by side so you can personalize each email.",
    action: "Used agent dynamic ui",
  },
];

export function ResearchPanel({ lead }: ResearchPanelProps) {
  return (
    <div className="w-[300px] shrink-0 flex flex-col bg-card">
      <div className="px-4 py-2.5 border-b">
        <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Deep Research</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {researchMessages.map((msg, i) => (
          <div
            key={i}
            className={`${
              msg.role === "user" ? "ml-6" : ""
            }`}
          >
            <div
              className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              }`}
            >
              <p>{msg.content}</p>
              {msg.action && (
                <div className="mt-1.5 flex items-center gap-1 text-[10px] opacity-60">
                  <Sparkles className="h-2.5 w-2.5" />
                  <span>{msg.action}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Status */}
      <div className="px-4 py-2 border-t text-[10px] text-muted-foreground">
        Setting up reminder for quarterly...
      </div>
    </div>
  );
}
