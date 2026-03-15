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
  Trash2,
  Sun,
  Moon,
  Mail,
  Users,
  GitBranch,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useGlobalSearch, type SearchResult } from "@/hooks/useGlobalSearch";
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

// Team members are now loaded dynamically from the database

const iconForConversation = (title: string) => {
  if (title.toLowerCase().includes("present")) return Presentation;
  if (title.toLowerCase().includes("compet")) return FileText;
  return MessageSquare;
};

const iconForResultType: Record<SearchResult["type"], typeof MessageSquare> = {
  conversation: MessageSquare,
  lead: Users,
  email: Mail,
  workflow: GitBranch,
};

const labelForResultType: Record<SearchResult["type"], string> = {
  conversation: "Conversations",
  lead: "Leads",
  email: "Email Drafts",
  workflow: "Workflows",
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
  const { theme, toggleTheme } = useTheme();
  const collapsed = state === "collapsed";
  const [activeItem, setActiveItem] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { results: searchResults, isSearching: isGlobalSearching } = useGlobalSearch(searchQuery);

  const hasQuery = searchQuery.trim().length > 0;

  // Group search results by type
  const groupedResults = searchResults.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.type] = acc[r.type] || []).push(r);
    return acc;
  }, {});

  const handleSearchResultClick = (result: SearchResult) => {
    switch (result.type) {
      case "conversation":
        onSelectConversation(result.id);
        break;
      case "lead":
        onSwitchView("workspace");
        break;
      case "email":
        onSwitchView("workspace");
        break;
      case "workflow":
        onSwitchView("workflow");
        break;
    }
    setSearchQuery("");
    setIsSearchFocused(false);
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
        </div>
        {!collapsed && (
          <div className="mt-3 flex items-center gap-2">
            {isSearchFocused || hasQuery ? (
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => {
                  // Delay to allow click on results
                  setTimeout(() => {
                    if (!searchQuery) setIsSearchFocused(false);
                  }, 200);
                }}
                autoFocus
                placeholder="Search everything..."
                className="flex-1 rounded-md bg-sidebar-accent px-2.5 py-1.5 text-xs text-sidebar-primary placeholder:text-sidebar-muted focus:outline-none focus:ring-1 focus:ring-sidebar-ring"
              />
            ) : (
              <button
                onClick={() => setIsSearchFocused(true)}
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
        {/* Global Search Results */}
        {!collapsed && hasQuery && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
              {isGlobalSearching && <Loader2 className="h-3 w-3 animate-spin" />}
              Search Results
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {searchResults.length === 0 && !isGlobalSearching ? (
                <p className="text-[11px] text-sidebar-muted px-3 py-2">No results found</p>
              ) : (
                Object.entries(groupedResults).map(([type, items]) => {
                  const Icon = iconForResultType[type as SearchResult["type"]];
                  const label = labelForResultType[type as SearchResult["type"]];
                  return (
                    <div key={type} className="mb-2">
                      <p className="text-[9px] text-sidebar-muted uppercase tracking-wider font-semibold px-3 py-1">
                        {label}
                      </p>
                      <SidebarMenu>
                        {items.map((result) => (
                          <SidebarMenuItem key={result.id}>
                            <SidebarMenuButton
                              onClick={() => handleSearchResultClick(result)}
                              className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent text-xs"
                            >
                              <Icon className="h-3.5 w-3.5 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <span className="truncate block">{result.title}</span>
                                <span className="text-[10px] text-sidebar-muted truncate block">{result.subtitle}</span>
                              </div>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </div>
                  );
                })
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Main Navigation — hide when searching */}
        {!hasQuery && (
          <>
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
                            className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary text-xs group/conv"
                          >
                            <Icon className="h-3.5 w-3.5" />
                            <span className="truncate flex-1">{conv.title}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteConversation(conv.id);
                              }}
                              className="opacity-0 group-hover/conv:opacity-100 h-4 w-4 rounded hover:bg-sidebar-accent flex items-center justify-center shrink-0 transition-opacity"
                              title="Delete conversation"
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </button>
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
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => onSwitchView("team" as any)}
                        className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent text-xs"
                      >
                        <Users className="h-4 w-4" />
                        <span>Manage Team</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </>
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
            <SidebarMenuButton
              onClick={toggleTheme}
              className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
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
