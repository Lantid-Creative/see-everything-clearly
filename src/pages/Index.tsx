import { useState, useCallback } from "react";
import { IntegrationsView } from "@/components/IntegrationsView";
import { WelcomeModal } from "@/components/WelcomeModal";
import { ChatView } from "@/components/ChatView";
import { WorkspaceView } from "@/components/WorkspaceView";
import { SlideEditorView } from "@/components/workspace/SlideEditorView";
import { SettingsView } from "@/components/SettingsView";
import { WorkflowBuilderView } from "@/components/workspace/WorkflowBuilderView";
import { SpreadsheetView } from "@/components/workspace/SpreadsheetView";
import { TeamPanel } from "@/components/team/TeamPanel";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useConversations } from "@/hooks/useConversations";
import { GettingStartedTour } from "@/components/GettingStartedTour";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { CommandCenterView } from "@/components/CommandCenterView";
import { GTMGeneratorView } from "@/components/GTMGeneratorView";
import { CommandPalette } from "@/components/CommandPalette";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useProductPhase, PHASE_GUIDES, type ProductPhase } from "@/hooks/useProductPhase";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";
import { useProducts } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { LantidShell } from "@/components/lantid/LantidShell";

export type ViewMode =
  | "dashboard" | "chat" | "workspace" | "slides" | "workflow"
  | "spreadsheet" | "team" | "settings" | "integrations"
  | "command-center" | "nerve-center" | "gtm";

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const {
    conversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    addMessage,
    updateLastAssistantMessage,
    setMessageAction,
    deleteConversation,
    updateConversationTitle,
    loaded,
  } = useConversations();

  const workspaceContext = useWorkspaceContext();
  const profile = useUserProfile();
  const {
    activeProduct,
    activeProductId,
    setPhaseOverride,
  } = useProducts();

  const phaseData = useProductPhase(
    workspaceContext && profile
      ? {
          totalLeads: workspaceContext.totalLeads,
          totalConversations: workspaceContext.totalConversations,
          totalWorkflows: workspaceContext.totalWorkflows,
          emailsSent: workspaceContext.emailsSent,
          teamMembers: workspaceContext.teamMembers,
          profile,
        }
      : null,
  );

  const effectivePhase = (activeProduct?.current_phase as ProductPhase | undefined) || phaseData?.currentPhase || null;

  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [pendingSlideContent, setPendingSlideContent] = useState<string | null>(null);

  const { toast } = useToast();

  const handleNewChat = useCallback((prompt?: string) => {
    createConversation();
    if (prompt) setPendingPrompt(prompt);
    setViewMode("chat");
  }, [createConversation]);

  const handlePhaseSwitch = useCallback((phase: ProductPhase | null) => {
    setPhaseOverride(phase);
    const guide = phase ? PHASE_GUIDES[phase as keyof typeof PHASE_GUIDES] : null;
    if (guide) {
      toast({
        title: `${guide.emoji} Switched to ${guide.label}`,
        description: guide.tagline,
      });
      createConversation();
    } else {
      toast({
        title: "🔄 Phase auto-detect enabled",
        description: "Phase will be determined by your activity",
      });
    }
  }, [setPhaseOverride, createConversation, toast]);

  const handleToggleSearch = useCallback(() => {
    setCommandOpen((prev) => !prev);
  }, []);

  useKeyboardShortcuts({
    onNavigate: setViewMode,
    onNewChat: handleNewChat,
    onToggleSearch: handleToggleSearch,
  });

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0B", color: "#A8A8B0" }}>
        <div className="text-sm">Loading workspace…</div>
      </div>
    );
  }

  // Standalone full-screen routes (escape the shell)
  if (viewMode === "workspace") {
    return (
      <SidebarProvider>
        <WorkspaceView onBack={() => setViewMode("dashboard")} />
      </SidebarProvider>
    );
  }
  if (viewMode === "integrations") {
    return (
      <SidebarProvider>
        <IntegrationsView onBack={() => setViewMode("dashboard")} />
      </SidebarProvider>
    );
  }
  if (viewMode === "gtm") {
    return (
      <SidebarProvider>
        <GTMGeneratorView onNavigate={setViewMode} />
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <></>
      </SidebarProvider>
  ) && (
    <SidebarProvider><div style={{display:"contents"}}></div></SidebarProvider>
  ) as never;
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} onNavigate={setViewMode} onNewChat={handleNewChat} />
      <WelcomeModal />
      <GettingStartedTour onNavigate={setViewMode} />
      <OnboardingChecklist />
      <LantidShell
        initialView="home"
        productName={activeProduct?.name || "Workspace"}
        currentPhase={effectivePhase}
        onSetPhase={handlePhaseSwitch}
        onNavigateExternal={setViewMode}
        onNewChat={handleNewChat}
        onOpenSearch={handleToggleSearch}
        renderChat={() => (
          <ChatView
            onOpenWorkspace={(type) => {
              if (type === "slides") {
                const lastAssistant = [...activeConversation.messages].reverse().find(m => m.role === "assistant");
                if (lastAssistant?.content) setPendingSlideContent(lastAssistant.content);
              }
              setViewMode(type || "workspace");
            }}
            conversation={activeConversation}
            onAddMessage={(msg) => addMessage(activeConversationId, msg)}
            onUpdateLastAssistant={(content, isStreaming) =>
              updateLastAssistantMessage(activeConversationId, content, isStreaming)
            }
            onSetAction={(messageId, action) =>
              setMessageAction(activeConversationId, messageId, action)
            }
            onUpdateTitle={(title) => updateConversationTitle(activeConversationId, title)}
            pendingTemplateId={pendingTemplateId}
            onTemplateSent={() => setPendingTemplateId(null)}
            currentPhase={effectivePhase}
            pendingPrompt={pendingPrompt}
            onPromptConsumed={() => setPendingPrompt(null)}
          />
        )}
        renderWorkflow={() => <WorkflowBuilderView onBack={() => setViewMode("dashboard")} />}
        renderSlides={() => (
          <SlideEditorView
            onBack={() => setViewMode("dashboard")}
            initialContent={pendingSlideContent}
            onContentConsumed={() => setPendingSlideContent(null)}
          />
        )}
        renderSpreadsheet={() => <SpreadsheetView onBack={() => setViewMode("dashboard")} />}
        renderTeam={() => <TeamPanel onBack={() => setViewMode("dashboard")} />}
        renderSettings={() => <SettingsView onBack={() => setViewMode("dashboard")} />}
        renderCommandCenter={() => (
          <CommandCenterView
            activeProductId={activeProductId}
            activeProductName={activeProduct?.name}
            currentPhase={effectivePhase}
            onNavigate={setViewMode}
          />
        )}
      />
    </>
  );
};

export default Index;
