import { useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";
import type { Lead } from "@/components/WorkspaceView";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ResearchPanelProps {
  lead: Lead;
  chatMessages?: { role: "user" | "assistant"; content: string; action?: string }[];
}

export function ResearchPanel({ lead, chatMessages = [] }: ResearchPanelProps) {
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
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
            <Sparkles className="h-6 w-6 text-muted-foreground/40 mb-3" />
            <p className="text-xs text-muted-foreground">
              Ask Lantid about this lead using the input below to start researching.
            </p>
          </div>
        ) : (
          chatMessages.map((msg, i) => (
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
          ))
        )}
      </div>
    </div>
  );
}
