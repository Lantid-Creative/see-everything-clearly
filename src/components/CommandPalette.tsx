import { useEffect, useState, useCallback } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  MessageSquare,
  Briefcase,
  Presentation,
  Table2,
  GitBranch,
  Users,
  Rocket,
  Activity,
  Settings,
  Plug,
  Plus,
  Search,
  Zap,
  Target,
  Mail,
  FileText,
} from "lucide-react";
import type { ViewMode } from "@/pages/Index";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (view: ViewMode) => void;
  onNewChat: (prompt?: string) => void;
}

const NAV_ITEMS: { label: string; view: ViewMode; icon: React.ElementType; keywords: string }[] = [
  { label: "Mission Control", view: "dashboard", icon: LayoutDashboard, keywords: "home dashboard overview" },
  { label: "AI Chat", view: "chat", icon: MessageSquare, keywords: "conversation assistant ask" },
  { label: "GTM Generator", view: "gtm", icon: Rocket, keywords: "go to market launch generate" },
  { label: "Nerve Center", view: "nerve-center", icon: Activity, keywords: "alerts signals monitor" },
  { label: "Workspace", view: "workspace", icon: Briefcase, keywords: "leads outreach email research" },
  { label: "Slides", view: "slides", icon: Presentation, keywords: "deck pitch presentation" },
  { label: "Spreadsheet", view: "spreadsheet", icon: Table2, keywords: "data table csv" },
  { label: "Workflows", view: "workflow", icon: GitBranch, keywords: "automation pipeline" },
  { label: "Team", view: "team", icon: Users, keywords: "members collaborate" },
  { label: "Settings", view: "settings", icon: Settings, keywords: "profile preferences account" },
  { label: "Integrations", view: "integrations", icon: Plug, keywords: "connect api tools" },
];

const QUICK_ACTIONS: { label: string; description: string; icon: React.ElementType; action: string }[] = [
  { label: "New Chat", description: "Start a fresh AI conversation", icon: Plus, action: "new-chat" },
  { label: "Generate GTM Plan", description: "Launch the end-to-end GTM generator", icon: Rocket, action: "gtm" },
  { label: "Draft a PRD", description: "AI-powered product requirements doc", icon: FileText, action: "prd" },
  { label: "Find Leads", description: "Discover and research target prospects", icon: Target, action: "leads" },
  { label: "Compose Email", description: "Draft personalized outreach", icon: Mail, action: "email" },
  { label: "Build Workflow", description: "Create an automation pipeline", icon: Zap, action: "workflow" },
  { label: "Create Pitch Deck", description: "Generate presentation slides", icon: Presentation, action: "slides" },
];

export function CommandPalette({ open, onOpenChange, onNavigate, onNewChat }: CommandPaletteProps) {
  const runAction = useCallback(
    (action: string) => {
      onOpenChange(false);
      switch (action) {
        case "new-chat":
          onNewChat();
          break;
        case "gtm":
          onNavigate("gtm");
          break;
        case "prd":
          onNewChat("Draft a comprehensive PRD for my product");
          break;
        case "leads":
          onNavigate("workspace");
          break;
        case "email":
          onNavigate("workspace");
          break;
        case "workflow":
          onNavigate("workflow");
          break;
        case "slides":
          onNavigate("slides");
          break;
      }
    },
    [onNavigate, onNewChat, onOpenChange]
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          {QUICK_ACTIONS.map((item) => (
            <CommandItem
              key={item.action}
              onSelect={() => runAction(item.action)}
              className="flex items-center gap-3"
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span>{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.description}</span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigate">
          {NAV_ITEMS.map((item) => (
            <CommandItem
              key={item.view}
              keywords={[item.keywords]}
              onSelect={() => {
                onOpenChange(false);
                onNavigate(item.view);
              }}
              className="flex items-center gap-3"
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
