import { useState } from "react";
import { Send, Sparkles, ArrowRight } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  action?: string;
}

const initialMessages: ChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hi! I'm Carson, your adaptive assistant. I can help you with sales outreach, research, email campaigns, and more. What would you like to work on today?",
  },
  {
    id: "2",
    role: "user",
    content: "I need to find startup founders who'd be a natural fit for ClosedAI. Can you help me research some leads?",
  },
  {
    id: "3",
    role: "assistant",
    content: "Great idea — I'll find startup founders who'd be a natural fit for ClosedAI. Running parallel research now across early-stage companies doing knowledge-heavy work — pulling name, title, email, and LinkedIn data for each.",
    action: "Used spreadsheet research",
  },
  {
    id: "4",
    role: "assistant",
    content: "Research complete. Found 15 founders across 7 companies with verified emails and LinkedIn profiles.",
    action: "open_workspace",
  },
];

interface ChatViewProps {
  onOpenWorkspace: () => void;
}

export function ChatView({ onOpenWorkspace }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I'll get started on that right away. Let me set up a workspace for you.",
          action: "open_workspace",
        },
      ]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="h-12 flex items-center px-4 border-b shrink-0">
        <SidebarTrigger className="mr-3" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Untitled</span>
          <span className="text-muted-foreground text-xs">·</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            <span>Claude</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-chat-bubble-user text-chat-bubble-user-foreground"
                    : "bg-chat-bubble-ai text-chat-bubble-ai-foreground"
                }`}
              >
                <p>{msg.content}</p>
                {msg.action === "Used spreadsheet research" && (
                  <div className="mt-2 text-xs opacity-70 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>Used spreadsheet research</span>
                  </div>
                )}
                {msg.action === "open_workspace" && (
                  <button
                    onClick={onOpenWorkspace}
                    className="mt-3 flex items-center gap-2 text-xs font-medium bg-foreground/10 hover:bg-foreground/15 rounded-lg px-3 py-2 transition-colors"
                  >
                    <span>Open workspace</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t px-4 py-3 shrink-0">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 bg-secondary rounded-xl px-4 py-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Reply..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
