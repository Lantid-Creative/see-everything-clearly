import { useState, useRef } from "react";
import { ArrowLeft, Send, Loader2, Sparkles, Users, Mail, User, Search as SearchIcon } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { EmailComposer } from "@/components/workspace/EmailComposer";
import { ProfileViewer } from "@/components/workspace/ProfileViewer";
import { ResearchPanel } from "@/components/workspace/ResearchPanel";
import { OutreachList } from "@/components/workspace/OutreachList";
import { useToast } from "@/hooks/use-toast";
import { streamChat } from "@/lib/streamChat";
import { useOutreachLeads } from "@/hooks/useWorkspaceData";
import { useIsMobile } from "@/hooks/use-mobile";

export interface Lead {
  id: string;
  name: string;
  company: string;
  title: string;
  email: string;
  avatar: string;
  linkedin?: string;
  about?: string;
  experience?: { role: string; company: string; period: string }[];
  recentActivity?: string[];
  companyOverview?: string;
  personalInterests?: string[];
  sent?: boolean;
}

interface WorkspaceViewProps {
  onBack: () => void;
}

type MobileTab = "leads" | "email" | "profile" | "research";

const mobileTabs: { id: MobileTab; label: string; icon: typeof Users }[] = [
  { id: "leads", label: "Leads", icon: Users },
  { id: "email", label: "Email", icon: Mail },
  { id: "profile", label: "Profile", icon: User },
  { id: "research", label: "Research", icon: SearchIcon },
];

export function WorkspaceView({ onBack }: WorkspaceViewProps) {
  const { leads, markSent, loaded } = useOutreachLeads();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isTemplateMode, setIsTemplateMode] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [workspaceChatMessages, setWorkspaceChatMessages] = useState<
    { role: "user" | "assistant"; content: string; action?: string }[]
  >([]);
  const [mobileTab, setMobileTab] = useState<MobileTab>("email");
  const { toast } = useToast();
  const abortRef = useRef<AbortController | null>(null);
  const isMobile = useIsMobile();

  const selectedLead = leads.find((l) => l.id === selectedLeadId) || leads[0];
  const sentCount = leads.filter((l) => l.sent).length;

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleSendEmail = (subject: string, body: string) => {
    if (!selectedLead) return;
    markSent(selectedLead.id);
    toast({
      title: "Email sent!",
      description: `Email to ${selectedLead.name} at ${selectedLead.email} has been queued.`,
    });

    const nextUnsent = leads.find((l) => !l.sent && l.id !== selectedLead.id);
    if (nextUnsent) {
      setTimeout(() => setSelectedLeadId(nextUnsent.id), 500);
    }
  };

  const handleWorkspaceChat = async () => {
    if (!chatInput.trim() || isLoadingChat) return;
    const userMsg = { role: "user" as const, content: chatInput };
    setWorkspaceChatMessages((prev) => [...prev, userMsg]);
    const currentInput = chatInput;
    setChatInput("");
    setIsLoadingChat(true);

    setWorkspaceChatMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    let fullContent = "";
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamChat({
        messages: [
          { role: "system", content: `You are Lantid, helping with sales outreach. The user is viewing ${selectedLead?.name}, ${selectedLead?.title} at ${selectedLead?.company}. Be concise.` },
          ...workspaceChatMessages.filter(m => m.content).map(m => ({ role: m.role, content: m.content })),
          { role: "user", content: currentInput },
        ],
        onDelta: (chunk) => {
          fullContent += chunk;
          setWorkspaceChatMessages((prev) => {
            const msgs = [...prev];
            msgs[msgs.length - 1] = { role: "assistant", content: fullContent };
            return msgs;
          });
        },
        onDone: () => {},
        signal: controller.signal,
      });
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setWorkspaceChatMessages((prev) => {
        const msgs = [...prev];
        msgs[msgs.length - 1] = { role: "assistant", content: "Sorry, I encountered an error." };
        return msgs;
      });
    } finally {
      setIsLoadingChat(false);
      abortRef.current = null;
    }
  };

  const renderMobilePanel = () => {
    if (!selectedLead) return null;
    switch (mobileTab) {
      case "leads":
        return (
          <OutreachList
            leads={leads}
            selectedLead={selectedLead}
            onSelectLead={(l) => {
              setSelectedLeadId(l.id);
              setMobileTab("email");
            }}
          />
        );
      case "email":
        return <EmailComposer lead={selectedLead} onSend={handleSendEmail} isTemplateMode={isTemplateMode} onTemplateCreated={() => setIsTemplateMode(true)} />;
      case "profile":
        return <ProfileViewer lead={selectedLead} />;
      case "research":
        return <ResearchPanel lead={selectedLead} chatMessages={workspaceChatMessages} />;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="h-12 flex items-center px-4 border-b shrink-0 justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <button onClick={onBack} className="h-7 w-7 rounded-md hover:bg-secondary flex items-center justify-center transition-colors">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <h1 className="text-sm font-semibold text-foreground">Sales Outreach</h1>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {sentCount}/{leads.length} sent
          </span>
          {isTemplateMode && !isMobile && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              Template Active
            </span>
          )}
        </div>
      </header>

      {/* Mobile tab bar */}
      {isMobile && (
        <div className="flex border-b shrink-0">
          {mobileTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMobileTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                mobileTab === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 flex min-h-0">
        {isMobile ? (
          <div className="flex-1 flex flex-col min-h-0">
            {renderMobilePanel()}
          </div>
        ) : (
          selectedLead && (
            <>
              <OutreachList leads={leads} selectedLead={selectedLead} onSelectLead={(l) => setSelectedLeadId(l.id)} />
              <EmailComposer lead={selectedLead} onSend={handleSendEmail} isTemplateMode={isTemplateMode} onTemplateCreated={() => setIsTemplateMode(true)} />
              <ProfileViewer lead={selectedLead} />
              <ResearchPanel lead={selectedLead} chatMessages={workspaceChatMessages} />
            </>
          )
        )}
      </div>

      <div className="border-t px-4 py-2.5 shrink-0 bg-card">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleWorkspaceChat()}
            placeholder="Ask Carson about this lead..."
            disabled={isLoadingChat}
            className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
          />
          <button
            onClick={handleWorkspaceChat}
            disabled={!chatInput.trim() || isLoadingChat}
            className="h-7 w-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            {isLoadingChat ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
