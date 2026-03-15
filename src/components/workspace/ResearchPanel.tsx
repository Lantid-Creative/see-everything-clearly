import { useState, useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";
import type { Lead } from "@/components/WorkspaceView";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ResearchPanelProps {
  lead: Lead;
  chatMessages?: { role: "user" | "assistant"; content: string; action?: string }[];
}

const baseMessages = [
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

export function ResearchPanel({ lead, chatMessages = [] }: ResearchPanelProps) {
  const allMessages = [...baseMessages, ...chatMessages];
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [chatMessages.length]);

  return (
    <div className="w-full md:w-[300px] shrink-0 flex flex-col bg-card">
      <div className="px-4 py-2.5 border-b flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Deep Research</h2>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {allMessages.map((msg, i) => (
          <div
            key={i}
            className={`${msg.role === "user" ? "ml-6" : ""} animate-in fade-in slide-in-from-bottom-1 duration-200`}
            style={{ animationDelay: `${Math.min(i, 4) * 50}ms` }}
          >
            <div
              className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-xs max-w-none [&>p]:my-0.5">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content || " "}
                  </ReactMarkdown>
                  {!msg.content && (
                    <span className="inline-block w-1 h-3 bg-foreground/40 animate-pulse" />
                  )}
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
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
      <div className="px-4 py-2 border-t text-[10px] text-muted-foreground">
        Setting up reminder for quarterly...
      </div>
    </div>
  );
}
