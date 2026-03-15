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
  Users,
} from "lucide-react";
import { useState } from "react";
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

const mainNav = [
  { title: "Home", icon: Home, id: "home" },
  { title: "Inbox", icon: Inbox, id: "inbox", badge: 15 },
  { title: "Workflows", icon: Workflow, id: "workflows" },
];

const recentItems = [
  { title: "Untitled", icon: MessageSquare },
  { title: "Assisting with present...", icon: Presentation },
  { title: "Conducting competiti...", icon: FileText },
];

const teamMembers = [
  { name: "Zinny Weli", initials: "ZW", color: "bg-blue-500" },
  { name: "Sid", initials: "S", color: "bg-emerald-500", tag: "(you)" },
  { name: "Alex", initials: "A", color: "bg-violet-500" },
  { name: "Ketan", initials: "K", color: "bg-amber-500" },
  { name: "Milan", initials: "M", color: "bg-rose-500" },
];

interface AppSidebarProps {
  onSwitchView: (view: ViewMode) => void;
  currentView: ViewMode;
}

export function AppSidebar({ onSwitchView, currentView }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [activeItem, setActiveItem] = useState("home");

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
            <div className="flex-1 flex items-center gap-2 rounded-md bg-sidebar-accent px-2.5 py-1.5 text-xs text-sidebar-muted">
              <Search className="h-3.5 w-3.5" />
              <span>Search...</span>
            </div>
            <button className="h-7 w-7 rounded-md bg-sidebar-accent flex items-center justify-center text-sidebar-foreground hover:text-sidebar-primary transition-colors">
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

        {/* Recent */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-muted text-[10px] uppercase tracking-wider font-semibold">
              Recent
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {recentItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => onSwitchView("workspace")}
                      className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent text-xs"
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      <span className="truncate">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
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
            <SidebarMenuButton className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-emerald-600 flex items-center justify-center">
                  <span className="text-[9px] font-medium text-primary-foreground">AI</span>
                </div>
                {!collapsed && <span className="text-xs">Closed AI</span>}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
