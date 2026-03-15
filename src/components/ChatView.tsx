import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles, ArrowRight, Loader2, LayoutGrid, Presentation, GitBranch, Table } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { streamChat } from "@/lib/streamChat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage, Conversation } from "@/hooks/useConversations";
import { useToast } from "@/hooks/use-toast";
import type { ViewMode } from "@/pages/Index";

interface ChatViewProps {
  onOpenWorkspace: (type?: ViewMode) => void;
  conversation: Conversation;
  onAddMessage: (msg: ChatMessage) => void;
  onUpdateLastAssistant: (content: string, isStreaming: boolean) => void;
  onSetAction: (messageId: string, action: string) => void;
}

export function ChatView({
  onOpenWorkspace,
  conversation,
  onAddMessage,
  onUpdateLastAssistant,
  onSetAction,
}: ChatViewProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, scrollToBottom]);

  const detectWorkspaceType = (content: string): { action: string; type: ViewMode } | null => {
    const lower = content.toLowerCase();
    // Check outreach/workspace first (most common)
    if (
      lower.includes("outreach") ||
      lower.includes("email template") ||
      lower.includes("set up your") ||
      lower.includes("ready for you") ||
      (lower.includes("workspace") && (lower.includes("email") || lower.includes("outreach") || lower.includes("lead")))
    ) {
      return { action: "open_workspace", type: "workspace" };
    }
    if (lower.includes("slide") || lower.includes("presentation") || lower.includes("deck")) {
      return { action: "open_slides", type: "slides" };
    }
    if (lower.includes("workflow") || lower.includes("automat") || lower.includes("deploy")) {
      return { action: "open_workflow", type: "workflow" };
    }
    if (lower.includes("spreadsheet") || lower.includes("table")) {
      if (lower.includes("found") || lower.includes("research") || lower.includes("pulling") || lower.includes("lead")) {
        return { action: "open_spreadsheet", type: "spreadsheet" };
      }
    }
    if (lower.includes("workspace") || lower.includes("email")) {
      return { action: "open_workspace", type: "workspace" };
    }
    return null;
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };
    onAddMessage(userMsg);
    setInput("");
    setIsLoading(true);

    const assistantId = `assistant-${Date.now()}`;
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      isStreaming: true,
    };
    onAddMessage(assistantMsg);

    let fullContent = "";
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const apiMessages = [...conversation.messages, userMsg]
        .filter((m) => !m.isStreaming)
        .map((m) => ({ role: m.role, content: m.content }));

      await streamChat({
        messages: apiMessages,
        onDelta: (chunk) => {
          fullContent += chunk;
          onUpdateLastAssistant(fullContent, true);
        },
        onDone: () => {
          onUpdateLastAssistant(fullContent, false);

          // Detect workspace type from response
          const ws = detectWorkspaceType(fullContent);
          if (ws) {
            setTimeout(() => {
              onSetAction(assistantId, ws.action);
            }, 300);
          }

          // Detect research action
          const lower = fullContent.toLowerCase();
          if (
            lower.includes("research") &&
            (lower.includes("found") || lower.includes("complete") || lower.includes("identified"))
          ) {
            setTimeout(() => {
              onSetAction(assistantId, "Used spreadsheet research");
            }, 200);
          }
        },
        signal: controller.signal,
      });
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error("Chat error:", err);
      onUpdateLastAssistant(
        fullContent || "Sorry, I encountered an error. Please try again.",
        false
      );
      toast({
        title: "Error",
        description: err.message || "Failed to get response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const actionConfig: Record<string, { label: string; icon: any; type: ViewMode }> = {
    open_workspace: { label: "Open outreach workspace", icon: LayoutGrid, type: "workspace" },
    open_slides: { label: "Open slide editor", icon: Presentation, type: "slides" },
    open_workflow: { label: "Open workflow builder", icon: GitBranch, type: "workflow" },
    open_spreadsheet: { label: "Open spreadsheet", icon: Table, type: "spreadsheet" },
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="h-12 flex items-center px-4 border-b shrink-0">
        <SidebarTrigger className="mr-3" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
            {conversation.title}
          </span>
          <span className="text-muted-foreground text-xs">·</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            <span>Carson AI</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {conversation.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-chat-bubble-user text-chat-bubble-user-foreground"
                    : "bg-chat-bubble-ai text-chat-bubble-ai-foreground"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content || " "}
                    </ReactMarkdown>
                    {msg.isStreaming && (
                      <span className="inline-block w-1.5 h-4 bg-foreground/60 animate-pulse ml-0.5 align-middle" />
                    )}
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
                {msg.action === "Used spreadsheet research" && (
                  <div className="mt-2 text-xs opacity-70 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>Used spreadsheet research</span>
                  </div>
                )}
                {msg.action && actionConfig[msg.action] && (
                  <button
                    onClick={() => onOpenWorkspace(actionConfig[msg.action!].type)}
                    className="mt-3 flex items-center gap-2 text-xs font-medium bg-foreground/10 hover:bg-foreground/15 rounded-lg px-3 py-2 transition-colors"
                  >
                    {(() => {
                      const Icon = actionConfig[msg.action!].icon;
                      return <Icon className="h-3.5 w-3.5" />;
                    })()}
                    <span>{actionConfig[msg.action!].label}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
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
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Reply..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
