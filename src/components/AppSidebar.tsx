import { useState, useEffect } from "react";
import {
  Zap,
  MessageSquare,
  Settings,
  Search,
  Plus,
  LogOut,
  Sun,
  Moon,
  Loader2,
  Package,
  ChevronDown,
  Check,
  Wrench,
  LayoutGrid,
  Presentation,
  Table,
  GitBranch,
  Users,
  Trash2,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import type { ViewMode } from "@/pages/Index";
import type { Conversation } from "@/hooks/useConversations";
import type { Product } from "@/hooks/useProducts";

const TOOL_ITEMS: { label: string; view: ViewMode; icon: typeof LayoutGrid }[] = [
  { label: "Workspace", view: "workspace", icon: LayoutGrid },
  { label: "Slides", view: "slides", icon: Presentation },
  { label: "Spreadsheet", view: "spreadsheet", icon: Table },
  { label: "Workflows", view: "workflow", icon: GitBranch },
  { label: "Team", view: "team", icon: Users },
];

interface AppSidebarProps {
  onSwitchView: (view: ViewMode) => void;
  currentView: ViewMode;
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  searchFocusTrigger?: number;
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
  const { results: searchResults, isSearching } = useGlobalSearch(searchQuery);
  const [productOpen, setProductOpen] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [toolsOpen, setToolsOpen] = useState(false);

  useEffect(() => {
    if (searchFocusTrigger && searchFocusTrigger > 0) {
      setIsSearchFocused(true);
    }
  }, [searchFocusTrigger]);

  const hasQuery = searchQuery.trim().length > 0;

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

  const isToolView = TOOL_ITEMS.some(t => t.view === currentView);

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
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold px-2 py-1">Products</p>
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => { onSelectProduct?.(product.id); setProductOpen(false); }}
                  className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-accent transition-colors"
                >
                  <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate flex-1 text-left">{product.name}</span>
                  {product.id === activeProduct?.id && <Check className="h-3 w-3 text-primary shrink-0" />}
                </button>
              ))}
              <div className="border-t border-border mt-1 pt-1">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const name = newProductName.trim();
                    if (name) { onCreateProduct?.(name); setNewProductName(""); setProductOpen(false); }
                  }}
                  className="flex items-center gap-1 px-1"
                >
                  <input type="text" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} placeholder="New product..." className="flex-1 rounded px-2 py-1 text-xs bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
                  <button type="submit" className="h-6 w-6 rounded flex items-center justify-center text-primary hover:bg-accent transition-colors"><Plus className="h-3.5 w-3.5" /></button>
                </form>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Search */}
        {!collapsed && (
          <div className="mt-2 flex items-center gap-2">
            {isSearchFocused || hasQuery ? (
              <input
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => { setTimeout(() => { if (!searchQuery) setIsSearchFocused(false); }, 200); }}
                autoFocus placeholder="Search everything..." className="flex-1 rounded-md bg-sidebar-accent px-2.5 py-1.5 text-xs text-sidebar-primary placeholder:text-sidebar-muted focus:outline-none focus:ring-1 focus:ring-sidebar-ring"
              />
            ) : (
              <button onClick={() => setIsSearchFocused(true)} className="flex-1 flex items-center gap-2 rounded-md bg-sidebar-accent px-2.5 py-1.5 text-xs text-sidebar-muted hover:text-sidebar-primary transition-colors">
                <Search className="h-3.5 w-3.5" /><span>Search...</span>
              </button>
            )}
            <button onClick={onNewConversation} className="h-7 w-7 rounded-md bg-sidebar-accent flex items-center justify-center text-sidebar-foreground hover:text-sidebar-primary transition-colors" title="New conversation">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-1.5">
        {/* Search Results */}
        {!collapsed && hasQuery && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
              {isSearching && <Loader2 className="h-3 w-3 animate-spin" />}
              Results
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {searchResults.length === 0 && !isSearching ? (
                <p className="text-[11px] text-sidebar-muted px-3 py-2">No results</p>
              ) : (
                <SidebarMenu>
                  {searchResults.slice(0, 8).map((result) => (
                    <SidebarMenuItem key={result.id}>
                      <SidebarMenuButton onClick={() => handleSearchResultClick(result)} className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent text-xs">
                        <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{result.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Main Nav — 3 items */}
        {!hasQuery && (
          <>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {/* Mission Control */}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => onSwitchView("dashboard")}
                      isActive={currentView === "dashboard"}
                      className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary"
                    >
                      <Zap className="h-4 w-4" />
                      {!collapsed && <span>Mission Control</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* AI Chat */}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => onSwitchView("chat")}
                      isActive={currentView === "chat"}
                      className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {!collapsed && <span>AI Chat</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Tools — Collapsible */}
                  <Collapsible open={toolsOpen || isToolView} onOpenChange={setToolsOpen}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          isActive={isToolView}
                          className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary"
                        >
                          <Wrench className="h-4 w-4" />
                          {!collapsed && (
                            <>
                              <span className="flex-1 text-left">Tools</span>
                              <ChevronDown className={`h-3 w-3 text-sidebar-muted transition-transform ${toolsOpen || isToolView ? "rotate-180" : ""}`} />
                            </>
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                    </SidebarMenuItem>
                    <CollapsibleContent>
                      <SidebarMenu className="pl-4">
                        {TOOL_ITEMS.map((tool) => (
                          <SidebarMenuItem key={tool.view}>
                            <SidebarMenuButton
                              onClick={() => onSwitchView(tool.view)}
                              isActive={currentView === tool.view}
                              className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary text-xs"
                            >
                              <tool.icon className="h-3.5 w-3.5" />
                              {!collapsed && <span>{tool.label}</span>}
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Recent Conversations */}
            {!collapsed && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-wider font-semibold">Recent</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {conversations.slice(0, 5).map((conv) => (
                      <SidebarMenuItem key={conv.id}>
                        <SidebarMenuButton
                          onClick={() => onSelectConversation(conv.id)}
                          isActive={conv.id === activeConversationId}
                          className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary text-xs group/conv"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span className="truncate flex-1">{conv.title}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteConversation(conv.id); }}
                            className="opacity-0 group-hover/conv:opacity-100 h-4 w-4 rounded hover:bg-sidebar-accent flex items-center justify-center shrink-0 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
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
            <SidebarMenuButton onClick={toggleTheme} className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {!collapsed && <span>{theme === "dark" ? "Light" : "Dark"}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onSwitchView("settings")}
              isActive={currentView === "settings" || currentView === "integrations"}
              className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary"
            >
              <Settings className="h-4 w-4" />
              {!collapsed && <span>Settings</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent">
              <LogOut className="h-4 w-4" />
              {!collapsed && <span className="text-xs truncate">{user?.email || "Sign out"}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
