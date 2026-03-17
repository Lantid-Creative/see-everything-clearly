import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Sparkles, ArrowRight, Loader2, LayoutGrid, Presentation, GitBranch, Table, Paperclip, FileText, BarChart3, Zap, Search, MessageSquare, Users, Target, Download, BookOpen } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { streamChat } from "@/lib/streamChat";
import { generateTitle } from "@/lib/streamChat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage, Conversation } from "@/hooks/useConversations";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/useFileUpload";
import { FilePreviewBar, MessageAttachments } from "@/components/FilePreview";
import type { ViewMode } from "@/pages/Index";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";
import { NotificationBell } from "@/components/NotificationBell";
import { exportChatAsMarkdown } from "@/lib/exportUtils";

interface ChatViewProps {
  onOpenWorkspace: (type?: ViewMode) => void;
  conversation: Conversation;
  onAddMessage: (msg: ChatMessage) => void;
  onUpdateLastAssistant: (content: string, isStreaming: boolean) => void;
  onSetAction: (messageId: string, action: string) => void;
  onUpdateTitle?: (title: string) => void;
  pendingTemplateId?: string | null;
  onTemplateSent?: () => void;
  currentPhase?: string | null;
  pendingPrompt?: string | null;
  onPromptConsumed?: () => void;
}

// Templates for quick-start conversations
type TemplateCategory = "discovery" | "specs" | "strategy" | "growth" | "ops";

interface ConversationTemplate {
  icon: typeof FileText;
  label: string;
  category: TemplateCategory;
  prompt: string;
}

const CATEGORY_META: Record<TemplateCategory, { label: string; icon: typeof FileText }> = {
  discovery: { label: "Discovery", icon: Search },
  specs: { label: "Specs & PRDs", icon: FileText },
  strategy: { label: "Strategy", icon: BarChart3 },
  growth: { label: "Growth", icon: Target },
  ops: { label: "Team & Ops", icon: Users },
};

const conversationTemplates: ConversationTemplate[] = [
  // Discovery
  {
    icon: Search,
    label: "User Interview Guide",
    category: "discovery",
    prompt: `Help me create a user interview guide. I need:\n\n1. **Screening criteria** — who should I talk to?\n2. **Opening questions** — build rapport\n3. **Core discovery questions** — understand problems\n4. **Solution validation** — test assumptions\n5. **Wrap-up** — next steps and referrals\n\nWhat product or feature area are we researching?`,
  },
  {
    icon: Users,
    label: "User Persona Builder",
    category: "discovery",
    prompt: `Help me build a user persona. Walk me through defining:\n\n- **Demographics & role**\n- **Goals & motivations**\n- **Pain points & frustrations**\n- **Current tools & workarounds**\n- **Decision-making factors**\n\nWhat product or user segment should we focus on?`,
  },
  {
    icon: MessageSquare,
    label: "Feedback Synthesis",
    category: "discovery",
    prompt: `Help me synthesize user feedback. I'll share raw feedback (NPS comments, support tickets, interview notes) and I need you to:\n\n1. **Categorize** into themes\n2. **Quantify** frequency of each theme\n3. **Identify** top pain points vs feature requests\n4. **Recommend** action items\n\nPaste your feedback below.`,
  },
  // Specs & PRDs
  {
    icon: FileText,
    label: "PRD Template",
    category: "specs",
    prompt: `Help me write a PRD using this structure:\n\n**Problem Statement**: [What problem are we solving?]\n**Target User**: [Who is this for?]\n**Success Metrics**: [How do we measure success?]\n**User Stories**: [Key user stories]\n**Scope**: [What's in/out of scope?]\n**Technical Considerations**: [Any constraints?]\n\nLet's start — ask me about the feature I'm building.`,
  },
  {
    icon: FileText,
    label: "Feature Brief",
    category: "specs",
    prompt: `Help me write a concise feature brief (1-pager) covering:\n\n- **What** we're building\n- **Why** it matters (business + user value)\n- **How** it works (key flows)\n- **Success criteria** (metrics + acceptance criteria)\n- **Dependencies & risks**\n\nWhat feature are we speccing?`,
  },
  {
    icon: Zap,
    label: "User Stories & Tasks",
    category: "specs",
    prompt: `Help me break down a feature into user stories and engineering tasks.\n\nFor each story, generate:\n- User story in "As a [user], I want [goal], so that [benefit]" format\n- Acceptance criteria\n- Estimated complexity (S/M/L)\n- Sub-tasks for engineering\n\nWhat feature should we break down?`,
  },
  // Strategy
  {
    icon: Search,
    label: "Competitive Analysis",
    category: "strategy",
    prompt: `Help me do a competitive analysis. I'll tell you my product and competitors, and I want you to create:\n\n1. **Feature comparison table**\n2. **Pricing comparison**\n3. **Target audience differences**\n4. **Strengths & weaknesses** of each\n5. **Differentiation opportunities**\n\nWhat product are we analyzing?`,
  },
  {
    icon: BarChart3,
    label: "RICE Prioritization",
    category: "strategy",
    prompt: `Help me prioritize my backlog using the RICE framework. For each feature, we'll score:\n\n- **Reach**: How many users will this impact per quarter?\n- **Impact**: How much will it move the needle? (3=massive, 2=high, 1=medium, 0.5=low, 0.25=minimal)\n- **Confidence**: How sure are we? (100%, 80%, 50%)\n- **Effort**: How many person-months?\n\nList your features and I'll help you score them.`,
  },
  {
    icon: BarChart3,
    label: "Roadmap Planning",
    category: "strategy",
    prompt: `Help me build a product roadmap. I need to organize features into:\n\n- **Now** (this sprint/month)\n- **Next** (next quarter)\n- **Later** (future consideration)\n\nFor each item, let's define:\n- Priority rationale\n- Dependencies\n- Expected impact\n\nWhat's your current product area and goals?`,
  },
  // Growth
  {
    icon: Target,
    label: "Go-to-Market Plan",
    category: "growth",
    prompt: `Help me create a go-to-market plan for a new feature or product launch:\n\n1. **Target audience** & positioning\n2. **Messaging** — value prop, tagline, key messages\n3. **Launch channels** — where to announce\n4. **Success metrics** — what to track\n5. **Timeline** — pre-launch, launch day, post-launch\n\nWhat are we launching?`,
  },
  {
    icon: Target,
    label: "A/B Test Plan",
    category: "growth",
    prompt: `Help me design an A/B test:\n\n- **Hypothesis**: What do we believe and why?\n- **Variants**: Control vs treatment\n- **Primary metric**: What are we measuring?\n- **Sample size**: How many users do we need?\n- **Duration**: How long should it run?\n- **Decision criteria**: What constitutes a win?\n\nWhat are we testing?`,
  },
  // Ops
  {
    icon: Users,
    label: "Sprint Retrospective",
    category: "ops",
    prompt: `Run a sprint retrospective for me. Guide me through:\n\n1. **What went well** — celebrate wins\n2. **What didn't go well** — identify blockers\n3. **What to improve** — actionable changes\n4. **Action items** — assign owners and deadlines\n\nWhat sprint or time period are we reflecting on?`,
  },
  {
    icon: Users,
    label: "Stakeholder Update",
    category: "ops",
    prompt: `Help me draft a stakeholder update email covering:\n\n- **Summary** — TL;DR of progress\n- **Key milestones** hit this period\n- **Metrics & KPIs** — how we're tracking\n- **Blockers & risks** — what needs attention\n- **Next steps** — what's coming\n\nWhat project or product should we update on?`,
  },
];

export function ChatView({
  onOpenWorkspace,
  conversation,
  onAddMessage,
  onUpdateLastAssistant,
  onSetAction,
  onUpdateTitle,
  pendingTemplateId,
  onTemplateSent,
  currentPhase,
  pendingPrompt,
  onPromptConsumed,
}: ChatViewProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory | "all">("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { toast } = useToast();
  const { uploading, pendingFiles, uploadFiles, removePending, clearPending, openFilePicker, inputRef } = useFileUpload();
  const profile = useUserProfile();
  const workspaceContext = useWorkspaceContext();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, scrollToBottom]);

  // Populate input when template selected from sidebar
  const templateMapRef = useRef<Record<string, string>>({});
  useEffect(() => {
    const map: Record<string, string> = {};
    conversationTemplates.forEach((t, i) => {
      const ids = ["prd", "competitive", "interview", "rice"];
      if (ids[i]) map[ids[i]] = t.prompt;
    });
    templateMapRef.current = map;
  }, []);

  useEffect(() => {
    if (pendingTemplateId && templateMapRef.current[pendingTemplateId]) {
      setInput(templateMapRef.current[pendingTemplateId]);
      onTemplateSent?.();
    }
  }, [pendingTemplateId, conversation.id]);

  // Handle prompt from guided flow
  useEffect(() => {
    if (pendingPrompt) {
      const hasUserMessages = conversation.messages.some((m) => m.role === "user");
      if (!hasUserMessages) {
        setInput(pendingPrompt);
        onPromptConsumed?.();
      }
    }
  }, [pendingPrompt, conversation.id]);

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

  const sendMessage = async (text: string, attachments?: any[]) => {
    if ((!text && (!attachments || attachments.length === 0)) || isLoading) return;

    const isFirstUserMessage = conversation.messages.filter((m) => m.role === "user").length === 0;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text || (attachments && attachments.length > 0 ? `[Attached ${attachments.length} file(s)]` : ""),
      attachments: attachments && attachments.length > 0 ? [...attachments] : undefined,
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

    // Generate AI title for first user message
    if (isFirstUserMessage && text && onUpdateTitle) {
      generateTitle(text).then((title) => {
        onUpdateTitle(title);
      });
    }

    try {
      const apiMessages = [...conversation.messages, userMsg]
        .filter((m) => !m.isStreaming)
        .map((m) => ({ role: m.role, content: m.content }));

      await streamChat({
        messages: apiMessages,
        context: workspaceContext || undefined,
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

  const handleSend = async () => {
    const text = input.trim();
    await sendMessage(text, pendingFiles.length > 0 ? [...pendingFiles] : undefined);
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
    setShowTemplates(false);
    sendMessage(prompt);
  };

  const handleExport = () => {
    exportChatAsMarkdown(conversation.title, conversation.messages);
    toast({ title: "Exported", description: "Chat exported as Markdown" });
  };

  const hasMessages = conversation.messages.filter((m) => m.role === "user").length > 0;

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
        <div className="flex items-center gap-1">
          {hasMessages && (
            <button
              onClick={handleExport}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Export chat as Markdown"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
          <NotificationBell />
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
                  <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&>table]:my-2 [&>table]:text-xs [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_td]:border [&_th]:border-border [&_td]:border-border [&_th]:bg-muted/50">
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

          {/* Starter Suggestions & Templates */}
          {isNewConversation && !isLoading && (
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-300">
              {/* Tab toggle */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => setShowTemplates(false)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${!showTemplates ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Quick Start
                </button>
                <button
                  onClick={() => { setShowTemplates(true); setTemplateCategory("all"); }}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${showTemplates ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <BookOpen className="h-3 w-3" />
                  Templates
                </button>
              </div>

              {/* Category pills for templates */}
              {showTemplates && (
                <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                  <button
                    onClick={() => setTemplateCategory("all")}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                      templateCategory === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All
                  </button>
                  {(Object.entries(CATEGORY_META) as [TemplateCategory, { label: string; icon: typeof FileText }][]).map(([key, meta]) => (
                    <button
                      key={key}
                      onClick={() => setTemplateCategory(key)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors flex items-center gap-1 ${
                        templateCategory === key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <meta.icon className="h-2.5 w-2.5" />
                      {meta.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {(showTemplates
                  ? conversationTemplates.filter((t) => templateCategory === "all" || t.category === templateCategory)
                  : starterSuggestions
                ).map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(item.prompt)}
                    className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-card hover:bg-accent/50 hover:border-accent transition-all duration-200 text-left group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors leading-tight">
                        {item.label}
                      </span>
                      {"category" in item && (
                        <span className="block text-[10px] text-muted-foreground mt-0.5">
                          {CATEGORY_META[(item as ConversationTemplate).category]?.label}
                        </span>
                      )}
                    </div>
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
          {/* Keyboard shortcut hint */}
          <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
            <kbd className="px-1 py-0.5 rounded bg-muted text-[9px] font-mono">⌘K</kbd> Search · <kbd className="px-1 py-0.5 rounded bg-muted text-[9px] font-mono">⌘N</kbd> New chat · <kbd className="px-1 py-0.5 rounded bg-muted text-[9px] font-mono">⌘1-7</kbd> Navigate
          </p>
        </div>
      </div>
    </div>
  );
}
