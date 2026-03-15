import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatView } from "@/components/ChatView";
import { WorkspaceView } from "@/components/WorkspaceView";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useConversations } from "@/hooks/useConversations";

export type ViewMode = "chat" | "workspace";

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
  } = useConversations();

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
        />
        <main className="flex-1 flex flex-col min-w-0">
          {viewMode === "chat" ? (
            <ChatView
              onOpenWorkspace={() => setViewMode("workspace")}
              conversation={activeConversation}
              onAddMessage={(msg) => addMessage(activeConversationId, msg)}
              onUpdateLastAssistant={(content, isStreaming) =>
                updateLastAssistantMessage(activeConversationId, content, isStreaming)
              }
              onSetAction={(messageId, action) =>
                setMessageAction(activeConversationId, messageId, action)
              }
            />
          ) : (
            <WorkspaceView onBack={() => setViewMode("chat")} />
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
