import { useState, useCallback } from "react";
import { IntegrationsView } from "@/components/IntegrationsView";
import { WelcomeModal } from "@/components/WelcomeModal";
import { AppSidebar } from "@/components/AppSidebar";
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
import { DashboardView } from "@/components/DashboardView";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export type ViewMode = "dashboard" | "chat" | "workspace" | "slides" | "workflow" | "spreadsheet" | "team" | "settings" | "integrations";

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [searchFocusTrigger, setSearchFocusTrigger] = useState(0);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
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

  const handleNewChat = useCallback(() => {
    createConversation();
    setViewMode("chat");
  }, [createConversation]);

  const handleSelectTemplate = useCallback((templateId: string) => {
    setPendingTemplateId(templateId);
    setViewMode("chat");
  }, []);

  const handleToggleSearch = useCallback(() => {
    setSearchFocusTrigger((prev) => prev + 1);
  }, []);

  useKeyboardShortcuts({
    onNavigate: setViewMode,
    onNewChat: handleNewChat,
    onToggleSearch: handleToggleSearch,
  });

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Loading conversations...</div>
      </div>
    );
  }

  const renderView = () => {
    switch (viewMode) {
      case "dashboard":
        return (
          <DashboardView
            onNavigate={setViewMode}
            onNewChat={handleNewChat}
          />
        );
      case "workspace":
        return <WorkspaceView onBack={() => setViewMode("dashboard")} />;
      case "slides":
        return <SlideEditorView onBack={() => setViewMode("dashboard")} />;
      case "workflow":
        return <WorkflowBuilderView onBack={() => setViewMode("dashboard")} />;
      case "spreadsheet":
        return <SpreadsheetView onBack={() => setViewMode("dashboard")} />;
      case "team":
        return <TeamPanel onBack={() => setViewMode("dashboard")} />;
      case "settings":
        return <SettingsView onBack={() => setViewMode("dashboard")} />;
      case "integrations":
        return <IntegrationsView onBack={() => setViewMode("dashboard")} />;
      default:
        return (
          <ChatView
            onOpenWorkspace={(type) => setViewMode(type || "workspace")}
            conversation={activeConversation}
            onAddMessage={(msg) => addMessage(activeConversationId, msg)}
            onUpdateLastAssistant={(content, isStreaming) =>
              updateLastAssistantMessage(activeConversationId, content, isStreaming)
            }
            onSetAction={(messageId, action) =>
              setMessageAction(activeConversationId, messageId, action)
            }
            onUpdateTitle={(title) =>
              updateConversationTitle(activeConversationId, title)
            }
            pendingTemplateId={pendingTemplateId}
            onTemplateSent={() => setPendingTemplateId(null)}
          />
        );
    }
  };

  return (
    <SidebarProvider>
      <WelcomeModal />
      <GettingStartedTour onNavigate={setViewMode} />
      <OnboardingChecklist />
      <div className="min-h-screen flex w-full">
        <AppSidebar
          onSwitchView={setViewMode}
          currentView={viewMode}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={(id) => {
            setActiveConversationId(id);
            setViewMode("chat");
          }}
          onNewConversation={handleNewChat}
          onDeleteConversation={deleteConversation}
          onSelectTemplate={handleSelectTemplate}
          searchFocusTrigger={searchFocusTrigger}
        />
        <main className="flex-1 flex flex-col min-w-0">
          {renderView()}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
