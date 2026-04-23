import LantidShell from "@/components/lantid/LantidShell";

export type ViewMode =
  | "dashboard" | "chat" | "workspace" | "slides" | "workflow"
  | "spreadsheet" | "team" | "settings" | "integrations"
  | "command-center" | "nerve-center" | "gtm";

const Index = () => <LantidShell />;

export default Index;
