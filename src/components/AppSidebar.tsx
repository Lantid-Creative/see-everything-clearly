import { useState, useEffect } from "react";
import {
  Home,
  Settings,
  Puzzle,
  Search,
  Plus,
  MessageSquare,
  Presentation,
  LogOut,
  Trash2,
  Sun,
  Moon,
  Users,
  GitBranch,
  Loader2,
  LayoutGrid,
  Table,
  Compass,
  ClipboardList,
  ListOrdered,
  Rocket,
  Activity,
  Hammer,
  ChevronDown,
  Check,
  Package,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import type { ViewMode } from "@/pages/Index";
import type { Conversation } from "@/hooks/useConversations";
import type { ProductPhase } from "@/hooks/useProductPhase";
import { PHASE_GUIDES } from "@/hooks/useProductPhase";
import type { Product } from "@/hooks/useProducts";

const PHASES: { id: ProductPhase; label: string; icon: typeof Compass }[] = [
  { id: "discover", label: "Discover", icon: Compass },
  { id: "define", label: "Define", icon: ClipboardList },
  { id: "prioritize", label: "Prioritize", icon: ListOrdered },
  { id: "build", label: "Build", icon: Hammer },
  { id: "launch", label: "Launch", icon: Rocket },
  { id: "measure", label: "Measure", icon: Activity },
];

const TOOLS: { label: string; view: ViewMode; icon: typeof MessageSquare }[] = [
  { label: "AI Chat", view: "chat", icon: MessageSquare },
  { label: "Workspace", view: "workspace", icon: LayoutGrid },
  { label: "Slides", view: "slides", icon: Presentation },
  { label: "Spreadsheet", view: "spreadsheet", icon: Table },
  { label: "Workflows", view: "workflow", icon: GitBranch },
];

const iconForConversation = (title: string) => {
  if (title.toLowerCase().includes("present")) return Presentation;
  return MessageSquare;
};

const iconForResultType: Record<SearchResult["type"], typeof MessageSquare> = {
  conversation: MessageSquare,
  lead: Users,
  email: LayoutGrid,
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
  onSetPhase?: (phase: ProductPhase | null) => void;
  products?: Product[];
  activeProduct?: Product | null;
  onSelectProduct?: (id: string) => void;
  onCreateProduct?: (name: string) => void;
}

export function AppSidebar({
  onSwitchView,
  currentView,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  searchFocusTrigger,
  currentPhase,
  onSetPhase,
  products = [],
  activeProduct,
  onSelectProduct,
  onCreateProduct,
}: AppSidebarProps) {
  const { state } = useSidebar();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const collapsed = state === "collapsed";
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { results: searchResults, isSearching: isGlobalSearching } = useGlobalSearch(searchQuery);
  const [phaseOpen, setPhaseOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [newProductName, setNewProductName] = useState("");

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

  const currentPhaseIndex = PHASES.findIndex((p) => p.id === currentPhase);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
        </div>

        {/* Product Switcher */}
        {!collapsed && products.length > 0 && (
          <Popover open={productOpen} onOpenChange={setProductOpen}>
            <PopoverTrigger asChild>
              <button className="mt-2 w-full flex items-center gap-2 rounded-md bg-sidebar-accent px-2.5 py-1.5 text-xs font-medium text-sidebar-foreground hover:text-sidebar-primary transition-colors">
                <Package className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate flex-1 text-left">{activeProduct?.name || "Select Product"}</span>
                <ChevronDown className="h-3 w-3 shrink-0 text-sidebar-muted" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 p-1.5" sideOffset={4}>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold px-2 py-1">
                Products
              </p>
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    onSelectProduct?.(product.id);
                    setProductOpen(false);
                  }}
                  className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent transition-colors"
                >
                  <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate flex-1 text-left">{product.name}</span>
                  {product.id === activeProduct?.id && (
                    <Check className="h-3 w-3 text-primary shrink-0" />
                  )}
                </button>
              ))}
              <div className="border-t border-border mt-1 pt-1">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const name = newProductName.trim();
                    if (name) {
                      onCreateProduct?.(name);
                      setNewProductName("");
                      setProductOpen(false);
                    }
                  }}
                  className="flex items-center gap-1 px-1"
                >
                  <input
                    type="text"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="New product..."
                    className="flex-1 rounded px-2 py-1 text-xs bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <button
                    type="submit"
                    className="h-6 w-6 rounded flex items-center justify-center text-primary hover:bg-accent transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {!collapsed && (
          <div className="mt-2 flex items-center gap-2">
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

        {/* Main Navigation */}
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

            {/* Phase Indicator — clickable */}
            {!collapsed && currentPhase && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-wider font-semibold">
                  Product Phase
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-2 py-1.5">
                    {/* Progress bar */}
                    <div className="flex items-center gap-1 mb-2">
                      {PHASES.map((phase, i) => {
                        const isActive = phase.id === currentPhase;
                        const isComplete = i < currentPhaseIndex;
                        return (
                          <div
                            key={phase.id}
                            className={`flex-1 h-1 rounded-full transition-colors ${
                              isActive
                                ? "bg-primary"
                                : isComplete
                                ? "bg-primary/40"
                                : "bg-sidebar-accent"
                            }`}
                            title={phase.label}
                          />
                        );
                      })}
                    </div>

                    {/* Clickable phase selector */}
                    <Popover open={phaseOpen} onOpenChange={setPhaseOpen}>
                      <PopoverTrigger asChild>
                        <button className="w-full flex items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-sidebar-accent transition-colors group">
                          {(() => {
                            const phase = PHASES.find((p) => p.id === currentPhase);
                            if (!phase) return null;
                            const PhaseIcon = phase.icon;
                            return (
                              <>
                                <PhaseIcon className="h-3.5 w-3.5 text-primary" />
                                <span className="text-xs font-medium text-sidebar-foreground flex-1 text-left">
                                  {phase.label}
                                </span>
                                <ChevronDown className="h-3 w-3 text-sidebar-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                              </>
                            );
                          })()}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-48 p-1.5" sideOffset={4}>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold px-2 py-1">
                          Set Phase
                        </p>
                        {PHASES.map((phase) => {
                          const PhaseIcon = phase.icon;
                          return (
                            <button
                              key={phase.id}
                              onClick={() => {
                                onSetPhase?.(phase.id);
                                setPhaseOpen(false);
                              }}
                              className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent transition-colors"
                            >
                              <PhaseIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              <span className="flex-1 text-left">{phase.label}</span>
                              {phase.id === currentPhase && (
                                <Check className="h-3 w-3 text-primary shrink-0" />
                              )}
                            </button>
                          );
                        })}
                        <div className="border-t border-border mt-1 pt-1">
                          <button
                            onClick={() => {
                              onSetPhase?.(null);
                              setPhaseOpen(false);
                            }}
                            className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] text-muted-foreground hover:bg-accent transition-colors"
                          >
                            Auto-detect phase
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* Tools */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-wider font-semibold">
                {collapsed ? "" : "Tools"}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {TOOLS.map((tool) => (
                    <SidebarMenuItem key={tool.view}>
                      <SidebarMenuButton
                        onClick={() => onSwitchView(tool.view)}
                        isActive={currentView === tool.view}
                        className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary text-xs"
                      >
                        <tool.icon className="h-4 w-4" />
                        {!collapsed && <span>{tool.label}</span>}
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
