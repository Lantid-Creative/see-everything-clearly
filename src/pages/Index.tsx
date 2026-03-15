import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatView } from "@/components/ChatView";
import { WorkspaceView } from "@/components/WorkspaceView";
import { SlideEditorView } from "@/components/workspace/SlideEditorView";
import { WorkflowBuilderView } from "@/components/workspace/WorkflowBuilderView";
import { SpreadsheetView } from "@/components/workspace/SpreadsheetView";
import { TeamPanel } from "@/components/team/TeamPanel";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useConversations } from "@/hooks/useConversations";

export type ViewMode = "chat" | "workspace" | "slides" | "workflow" | "spreadsheet" | "team";

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
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
    loaded,
  } = useConversations();

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Loading conversations...</div>
      </div>
    );
  }

  const renderView = () => {
    switch (viewMode) {
      case "workspace":
        return <WorkspaceView onBack={() => setViewMode("chat")} />;
      case "slides":
        return <SlideEditorView onBack={() => setViewMode("chat")} />;
      case "workflow":
        return <WorkflowBuilderView onBack={() => setViewMode("chat")} />;
      case "spreadsheet":
        return <SpreadsheetView onBack={() => setViewMode("chat")} />;
      case "team":
        return <TeamPanel onBack={() => setViewMode("chat")} />;
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
          />
        );
    }
  };

  return (
    <SidebarProvider>
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
          onNewConversation={() => {
            createConversation();
            setViewMode("chat");
          }}
          onDeleteConversation={deleteConversation}
        />
        <main className="flex-1 flex flex-col min-w-0">
          {renderView()}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
