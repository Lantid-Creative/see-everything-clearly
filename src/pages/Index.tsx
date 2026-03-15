import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatView } from "@/components/ChatView";
import { WorkspaceView } from "@/components/WorkspaceView";
import { SidebarProvider } from "@/components/ui/sidebar";

export type ViewMode = "chat" | "workspace";

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("chat");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar onSwitchView={setViewMode} currentView={viewMode} />
        <main className="flex-1 flex flex-col min-w-0">
          {viewMode === "chat" ? (
            <ChatView onOpenWorkspace={() => setViewMode("workspace")} />
          ) : (
            <WorkspaceView onBack={() => setViewMode("chat")} />
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
