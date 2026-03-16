import { useState, useEffect } from "react";
import {
  Home,
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
  LayoutGrid,
  Table,
  BarChart3,
  Compass,
  ClipboardList,
  ListOrdered,
  Rocket,
  Activity,
  Hammer,
  ChevronRight,
} from "lucide-react";
import { Logo } from "@/components/Logo";
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

import type { ViewMode } from "@/pages/Index";
import type { Conversation } from "@/hooks/useConversations";
import type { ProductPhase } from "@/hooks/useProductPhase";

const PHASE_NAV: { id: ProductPhase; label: string; icon: typeof Compass; views: { label: string; view: ViewMode; icon: typeof MessageSquare }[] }[] = [
  {
    id: "discover",
    label: "Discover",
    icon: Compass,
    views: [
      { label: "AI Chat", view: "chat", icon: MessageSquare },
      { label: "Workspace", view: "workspace", icon: LayoutGrid },
    ],
  },
  {
    id: "define",
    label: "Define",
    icon: ClipboardList,
    views: [
      { label: "AI Chat", view: "chat", icon: MessageSquare },
      { label: "Slides", view: "slides", icon: Presentation },
    ],
  },
  {
    id: "prioritize",
    label: "Prioritize",
    icon: ListOrdered,
    views: [
      { label: "Spreadsheet", view: "spreadsheet", icon: Table },
      { label: "AI Chat", view: "chat", icon: MessageSquare },
    ],
  },
  {
    id: "build",
    label: "Build",
    icon: Hammer,
    views: [
      { label: "Workflows", view: "workflow", icon: GitBranch },
      { label: "Integrations", view: "integrations", icon: Puzzle },
    ],
  },
  {
    id: "launch",
    label: "Launch",
    icon: Rocket,
    views: [
      { label: "Workspace", view: "workspace", icon: LayoutGrid },
      { label: "Slides", view: "slides", icon: Presentation },
    ],
  },
  {
    id: "measure",
    label: "Measure",
    icon: Activity,
    views: [
      { label: "AI Chat", view: "chat", icon: MessageSquare },
      { label: "Spreadsheet", view: "spreadsheet", icon: Table },
    ],
  },
];

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
  onSelectTemplate?: (templateId: string) => void;
  searchFocusTrigger?: number;
  currentPhase?: ProductPhase | null;
}

export function AppSidebar({
  onSwitchView,
  currentView,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onSelectTemplate,
  searchFocusTrigger,
  currentPhase,
}: AppSidebarProps) {
  const { state } = useSidebar();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const collapsed = state === "collapsed";
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [expandedPhase, setExpandedPhase] = useState<ProductPhase | null>(currentPhase || null);
  const { results: searchResults, isSearching: isGlobalSearching } = useGlobalSearch(searchQuery);

  useEffect(() => {
    if (currentPhase && !expandedPhase) setExpandedPhase(currentPhase);
  }, [currentPhase]);

  useEffect(() => {
    if (searchFocusTrigger && searchFocusTrigger > 0) {
      setIsSearchFocused(true);
    }
  }, [searchFocusTrigger]);

  const hasQuery = searchQuery.trim().length > 0;

  const groupedResults = searchResults.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.type] = acc[r.type] || []).push(r);
    return acc;
  }, {});

  const handleSearchResultClick = (result: SearchResult) => {
    switch (result.type) {
      case "conversation": onSelectConversation(result.id); break;
      case "lead": onSwitchView("workspace"); break;
      case "email": onSwitchView("workspace"); break;
      case "workflow": onSwitchView("workflow"); break;
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
            {/* Home */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => onSwitchView("dashboard")}
                      isActive={currentView === "dashboard"}
                      className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary"
                    >
                      <Home className="h-4 w-4" />
                      {!collapsed && <span>Home</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Product Lifecycle Phases */}
            {!collapsed && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-wider font-semibold">
                  Product Lifecycle
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {PHASE_NAV.map((phase) => {
                      const isExpanded = expandedPhase === phase.id;
                      const isCurrent = currentPhase === phase.id;
                      return (
                        <div key={phase.id}>
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                              className={`text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent text-xs ${
                                isCurrent ? "text-primary font-semibold" : ""
                              }`}
                            >
                              <phase.icon className={`h-3.5 w-3.5 ${isCurrent ? "text-primary" : ""}`} />
                              <span className="flex-1">{phase.label}</span>
                              {isCurrent && (
                                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                              )}
                              <ChevronRight className={`h-3 w-3 text-sidebar-muted transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          {isExpanded && (
                            <div className="ml-4 border-l border-sidebar-accent pl-2 space-y-0.5 py-0.5">
                              {phase.views.map((view) => (
                                <SidebarMenuItem key={`${phase.id}-${view.view}`}>
                                  <SidebarMenuButton
                                    onClick={() => onSwitchView(view.view)}
                                    isActive={currentView === view.view}
                                    className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary text-[11px] h-7"
                                  >
                                    <view.icon className="h-3 w-3" />
                                    <span>{view.label}</span>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

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
                        onClick={() => onSwitchView("team")}
                        isActive={currentView === "team"}
                        className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary text-xs"
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
            <SidebarMenuButton
              onClick={() => onSwitchView("integrations")}
              isActive={currentView === "integrations"}
              className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary"
            >
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
            <SidebarMenuButton
              onClick={() => onSwitchView("settings")}
              isActive={currentView === "settings"}
              className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary"
            >
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
