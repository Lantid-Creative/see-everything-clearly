import {
  Home,
  Inbox,
  Workflow,
  Settings,
  Puzzle,
  Search,
  Plus,
  MessageSquare,
  Presentation,
  FileText,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ViewMode } from "@/pages/Index";
import type { Conversation } from "@/hooks/useConversations";

const mainNav = [
  { title: "Home", icon: Home, id: "home" },
  { title: "Inbox", icon: Inbox, id: "inbox", badge: 15 },
  { title: "Workflows", icon: Workflow, id: "workflows" },
];

const teamMembers = [
  { name: "Zinny Weli", initials: "ZW", color: "bg-blue-500" },
  { name: "Sid", initials: "S", color: "bg-emerald-500", tag: "(you)" },
  { name: "Alex", initials: "A", color: "bg-violet-500" },
  { name: "Ketan", initials: "K", color: "bg-amber-500" },
  { name: "Milan", initials: "M", color: "bg-rose-500" },
];

const iconForConversation = (title: string) => {
  if (title.toLowerCase().includes("present")) return Presentation;
  if (title.toLowerCase().includes("compet")) return FileText;
  return MessageSquare;
};

interface AppSidebarProps {
  onSwitchView: (view: ViewMode) => void;
  currentView: ViewMode;
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

export function AppSidebar({
  onSwitchView,
  currentView,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}: AppSidebarProps) {
  const { state } = useSidebar();
  const { user, signOut } = useAuth();
  const collapsed = state === "collapsed";
  const [activeItem, setActiveItem] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-sm">C</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-sidebar-primary text-sm">Carson</span>
          )}
        </div>
        {!collapsed && (
          <div className="mt-3 flex items-center gap-2">
            {isSearching ? (
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => { if (!searchQuery) setIsSearching(false); }}
                autoFocus
                placeholder="Search conversations..."
                className="flex-1 rounded-md bg-sidebar-accent px-2.5 py-1.5 text-xs text-sidebar-primary placeholder:text-sidebar-muted focus:outline-none focus:ring-1 focus:ring-sidebar-ring"
              />
            ) : (
              <button
                onClick={() => setIsSearching(true)}
                className="flex-1 flex items-center gap-2 rounded-md bg-sidebar-accent px-2.5 py-1.5 text-xs text-sidebar-muted hover:text-sidebar-primary transition-colors"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Search...</span>
              </button>
            )}
            <button
              onClick={onNewConversation}
              className="h-7 w-7 rounded-md bg-sidebar-accent flex items-center justify-center text-sidebar-foreground hover:text-sidebar-primary transition-colors"
              title="New conversation"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-1.5">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => {
                      setActiveItem(item.id);
                      onSwitchView("chat");
                    }}
                    isActive={activeItem === item.id}
                    className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary"
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span>{item.title}</span>}
                    {!collapsed && item.badge && (
                      <span className="ml-auto text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 leading-none font-medium">
                        {item.badge}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Recent Conversations */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-wider font-semibold">
              Recent
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredConversations.slice(0, 5).map((conv) => {
                  const Icon = iconForConversation(conv.title);
                  return (
                    <SidebarMenuItem key={conv.id}>
                      <SidebarMenuButton
                        onClick={() => onSelectConversation(conv.id)}
                        isActive={conv.id === activeConversationId}
                        className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary text-xs"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="truncate">{conv.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Team */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-wider font-semibold">
              Team
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {teamMembers.map((member) => (
                  <SidebarMenuItem key={member.name}>
                    <SidebarMenuButton className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent text-xs">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className={`${member.color} text-[9px] font-medium text-primary-foreground`}>
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">
                        {member.name}
                        {member.tag && (
                          <span className="text-sidebar-muted ml-1">{member.tag}</span>
                        )}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="px-1.5 pb-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent">
              <Puzzle className="h-4 w-4" />
              {!collapsed && <span>Integrations</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent">
              <Settings className="h-4 w-4" />
              {!collapsed && <span>Settings</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={signOut}
              className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent"
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && (
                <span className="text-xs truncate">
                  {user?.email || "Sign out"}
                </span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
