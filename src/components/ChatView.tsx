import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles, ArrowRight, Loader2, LayoutGrid, Presentation, GitBranch, Table, Paperclip, FileText, BarChart3, Zap, Search, MessageSquare, Users, Target } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { streamChat } from "@/lib/streamChat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage, Conversation } from "@/hooks/useConversations";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import { FilePreviewBar, MessageAttachments } from "@/components/FilePreview";
import type { ViewMode } from "@/pages/Index";
import { useUserProfile } from "@/hooks/useUserProfile";
import { NotificationBell } from "@/components/NotificationBell";

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
  const { uploading, pendingFiles, uploadFiles, removePending, clearPending, openFilePicker, inputRef } = useFileUpload();
  const profile = useUserProfile();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, scrollToBottom]);

  const detectWorkspaceType = (content: string): { action: string; type: ViewMode } | null => {
    const lower = content.toLowerCase();
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
    if ((!text && pendingFiles.length === 0) || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text || (pendingFiles.length > 0 ? `[Attached ${pendingFiles.length} file(s)]` : ""),
      attachments: pendingFiles.length > 0 ? [...pendingFiles] : undefined,
    };
    onAddMessage(userMsg);
    setInput("");
    clearPending();
    setIsLoading(true);

    const assistantId = crypto.randomUUID();
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

          const ws = detectWorkspaceType(fullContent);
          if (ws) {
            setTimeout(() => {
              onSetAction(assistantId, ws.action);
            }, 300);
          }

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = "";
    }
  };

  const actionConfig: Record<string, { label: string; icon: any; type: ViewMode }> = {
    open_workspace: { label: "Open outreach workspace", icon: LayoutGrid, type: "workspace" },
    open_slides: { label: "Open slide editor", icon: Presentation, type: "slides" },
    open_workflow: { label: "Open workflow builder", icon: GitBranch, type: "workflow" },
    open_spreadsheet: { label: "Open spreadsheet", icon: Table, type: "spreadsheet" },
  };

  const getStarterSuggestions = () => {
    const allSuggestions = [
      { icon: Search, label: "Validate a product idea", prompt: "I have a product idea and I want to validate it. Can you help me structure a discovery process — who to talk to, what to ask, and how to evaluate if it's worth building?", goals: ["Discover what to build next"] },
      { icon: FileText, label: "Write a PRD", prompt: "Help me write a PRD for a new feature. I'll describe the problem and you help me structure it with goals, user stories, success metrics, and scope.", goals: ["Generate PRDs & specs"] },
      { icon: BarChart3, label: "Prioritize my backlog", prompt: "I have a list of features to prioritize. Can you help me apply RICE scoring and figure out what to build first?", goals: ["Prioritize my roadmap"] },
      { icon: Zap, label: "Create a workflow", prompt: "Help me create an automated workflow for my product process — like turning NPS responses into categorized insights.", goals: ["Automate product workflows"] },
      { icon: MessageSquare, label: "Draft outreach emails", prompt: "Help me draft customer discovery outreach emails to schedule interviews with potential users.", goals: ["Discover what to build next"] },
      { icon: Presentation, label: "Build a strategy deck", prompt: "Help me create a product strategy presentation covering vision, market opportunity, competitive landscape, and roadmap.", goals: ["Prioritize my roadmap"] },
      { icon: Users, label: "Align my team", prompt: "Help me prepare a product decision brief to align my team on what we should build next and why.", goals: ["Align my team on decisions"] },
      { icon: Target, label: "Define success metrics", prompt: "Help me define the right success metrics and KPIs for my product. I want to track whether what we're building is actually working.", goals: [] },
    ];

    if (!profile?.productGoals) return allSuggestions.slice(0, 6);

    const userGoals = profile.productGoals.split(", ").map((g) => g.trim().toLowerCase());

    // Score suggestions by goal match
    const scored = allSuggestions.map((s) => {
      const matchScore = s.goals.filter((g) =>
        userGoals.some((ug) => ug.includes(g.toLowerCase()) || g.toLowerCase().includes(ug))
      ).length;
      return { ...s, matchScore };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    return scored.slice(0, 6);
  };

  const starterSuggestions = getStarterSuggestions();

  const isNewConversation = conversation.messages.length <= 1 || 
    (conversation.messages.length === 1 && conversation.messages[0].id === "welcome");

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => {
      const fakeEvent = { key: "Enter", shiftKey: false } as React.KeyboardEvent;
      // Trigger send directly
      const text = prompt.trim();
      if (!text || isLoading) return;
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
      };
      onAddMessage(userMsg);
      setInput("");
      setIsLoading(true);

      const asstId = crypto.randomUUID();
      const asstMsg: ChatMessage = { id: asstId, role: "assistant", content: "", isStreaming: true };
      onAddMessage(asstMsg);

      let fullContent = "";
      const controller = new AbortController();
      abortRef.current = controller;

      const apiMessages = [...conversation.messages, userMsg]
        .filter((m) => !m.isStreaming)
        .map((m) => ({ role: m.role, content: m.content }));

      streamChat({
        messages: apiMessages,
        onDelta: (chunk) => {
          fullContent += chunk;
          onUpdateLastAssistant(fullContent, true);
        },
        onDone: () => {
          onUpdateLastAssistant(fullContent, false);
          const ws = detectWorkspaceType(fullContent);
          if (ws) {
            setTimeout(() => onSetAction(asstId, ws.action), 300);
          }
          setIsLoading(false);
          abortRef.current = null;
        },
        signal: controller.signal,
      }).catch((err) => {
        if (err.name === "AbortError") return;
        console.error("Chat error:", err);
        onUpdateLastAssistant(
          fullContent || "Sorry, I encountered an error. Please try again.",
          false
        );
        toast({ title: "Error", description: err.message || "Failed to get response", variant: "destructive" });
        setIsLoading(false);
        abortRef.current = null;
      });
    }, 0);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="h-12 flex items-center justify-between px-4 border-b shrink-0">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="mr-1" />
          <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
            {conversation.title}
          </span>
          <span className="text-muted-foreground text-xs">·</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            <span>Lantid AI</span>
          </div>
        </div>
        <NotificationBell />
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
                {msg.attachments && <MessageAttachments attachments={msg.attachments} />}
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

          {/* Starter Suggestions */}
          {isNewConversation && !isLoading && (
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-300">
              <div className="grid grid-cols-2 gap-2 mt-4">
                {starterSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion.prompt)}
                    className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-card hover:bg-accent/50 hover:border-accent transition-all duration-200 text-left group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <suggestion.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors leading-tight pt-1">
                      {suggestion.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* File preview bar */}
      {pendingFiles.length > 0 && (
        <FilePreviewBar files={pendingFiles} onRemove={removePending} />
      )}

      {/* Input */}
      <div className="border-t px-4 py-3 shrink-0">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 bg-secondary rounded-xl px-4 py-2">
            <input
              ref={inputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
            />
            <button
              onClick={openFilePicker}
              disabled={uploading || isLoading}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors disabled:opacity-40 shrink-0"
              title="Attach file"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
            </button>
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
              disabled={(!input.trim() && pendingFiles.length === 0) || isLoading}
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
