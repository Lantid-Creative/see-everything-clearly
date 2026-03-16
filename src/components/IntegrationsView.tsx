import { useState } from "react";
import { ArrowLeft, Check, X, Loader2, ExternalLink, Key, Unplug, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIntegrations } from "@/hooks/useIntegrations";
import { useToast } from "@/hooks/use-toast";

interface IntegrationsViewProps {
  onBack: () => void;
}

interface ProviderDef {
  id: string;
  name: string;
  description: string;
  category: "communication" | "productivity" | "crm" | "ai" | "automation" | "storage";
  icon: string;
  color: string;
  authType: "api_key" | "webhook" | "oauth_placeholder";
  keyLabel?: string;
  keyPlaceholder?: string;
  docsUrl?: string;
}

const PROVIDERS: ProviderDef[] = [
  {
    id: "slack",
    name: "Slack",
    description: "Send messages, notifications, and updates to Slack channels.",
    category: "communication",
    icon: "💬",
    color: "bg-[#4A154B]",
    authType: "webhook",
    keyLabel: "Webhook URL",
    keyPlaceholder: "https://hooks.slack.com/services/...",
    docsUrl: "https://api.slack.com/messaging/webhooks",
  },
  {
    id: "google_mail",
    name: "Gmail",
    description: "Send and manage emails through your Google Mail account.",
    category: "communication",
    icon: "📧",
    color: "bg-[#EA4335]",
    authType: "api_key",
    keyLabel: "Gmail App Password",
    keyPlaceholder: "Enter your app password",
    docsUrl: "https://support.google.com/accounts/answer/185833",
  },
  {
    id: "google_calendar",
    name: "Google Calendar",
    description: "Create events, check availability, and manage your calendar.",
    category: "productivity",
    icon: "📅",
    color: "bg-[#4285F4]",
    authType: "api_key",
    keyLabel: "API Key",
    keyPlaceholder: "Enter your Google Calendar API key",
    docsUrl: "https://developers.google.com/calendar/api/quickstart/js",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Read and write to Notion pages, databases, and wikis.",
    category: "productivity",
    icon: "📝",
    color: "bg-[#000000]",
    authType: "api_key",
    keyLabel: "Integration Token",
    keyPlaceholder: "secret_...",
    docsUrl: "https://developers.notion.com/docs/create-a-notion-integration",
  },
  {
    id: "linear",
    name: "Linear",
    description: "Create issues, track projects, and manage sprints.",
    category: "productivity",
    icon: "📐",
    color: "bg-[#5E6AD2]",
    authType: "api_key",
    keyLabel: "API Key",
    keyPlaceholder: "lin_api_...",
    docsUrl: "https://linear.app/settings/api",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Manage contacts, deals, and CRM pipelines.",
    category: "crm",
    icon: "🔶",
    color: "bg-[#FF7A59]",
    authType: "api_key",
    keyLabel: "Private App Token",
    keyPlaceholder: "pat-...",
    docsUrl: "https://developers.hubspot.com/docs/api/private-apps",
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Trigger Zapier automations and connect 5000+ apps.",
    category: "automation",
    icon: "⚡",
    color: "bg-[#FF4A00]",
    authType: "webhook",
    keyLabel: "Webhook URL",
    keyPlaceholder: "https://hooks.zapier.com/hooks/catch/...",
    docsUrl: "https://zapier.com/help/create/code-webhooks/trigger-zaps-from-webhooks",
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "Use GPT models for advanced AI tasks and custom prompts.",
    category: "ai",
    icon: "🤖",
    color: "bg-[#10A37F]",
    authType: "api_key",
    keyLabel: "API Key",
    keyPlaceholder: "sk-...",
    docsUrl: "https://platform.openai.com/api-keys",
  },
  {
    id: "google_drive",
    name: "Google Drive",
    description: "Access, upload, and manage files in Google Drive.",
    category: "storage",
    icon: "📁",
    color: "bg-[#0F9D58]",
    authType: "api_key",
    keyLabel: "API Key",
    keyPlaceholder: "Enter your Google Drive API key",
    docsUrl: "https://developers.google.com/drive/api/quickstart/js",
  },
  {
    id: "telegram",
    name: "Telegram",
    description: "Send messages and notifications via Telegram bots.",
    category: "communication",
    icon: "✈️",
    color: "bg-[#0088CC]",
    authType: "api_key",
    keyLabel: "Bot Token",
    keyPlaceholder: "123456:ABC-DEF1234...",
    docsUrl: "https://core.telegram.org/bots/tutorial",
  },
  {
    id: "airtable",
    name: "Airtable",
    description: "Read and write to Airtable bases and tables.",
    category: "productivity",
    icon: "📊",
    color: "bg-[#18BFFF]",
    authType: "api_key",
    keyLabel: "Personal Access Token",
    keyPlaceholder: "pat...",
    docsUrl: "https://airtable.com/developers/web/guides/personal-access-tokens",
  },
  {
    id: "twilio",
    name: "Twilio",
    description: "Send SMS, make calls, and manage communications.",
    category: "communication",
    icon: "📱",
    color: "bg-[#F22F46]",
    authType: "api_key",
    keyLabel: "Auth Token",
    keyPlaceholder: "Enter your Twilio auth token",
    docsUrl: "https://www.twilio.com/docs/iam/api-keys",
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  communication: "Communication",
  productivity: "Productivity",
  crm: "CRM & Sales",
  ai: "AI & ML",
  automation: "Automation",
  storage: "Storage",
};

export function IntegrationsView({ onBack }: IntegrationsViewProps) {
  const { integrations, loaded, connectIntegration, disconnectIntegration } = useIntegrations();
  const { toast } = useToast();
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const getStatus = (providerId: string) => {
    return integrations.find((i) => i.provider === providerId);
  };

  const handleConnect = async (provider: ProviderDef) => {
    if (!apiKeyInput.trim()) {
      toast({ title: `${provider.keyLabel} is required`, variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = (await connectIntegration(provider.id, provider.name, apiKeyInput.trim())) || {};
    setSaving(false);
    if (error) {
      toast({ title: "Failed to connect", description: String(error), variant: "destructive" });
    } else {
      toast({ title: `${provider.name} connected`, description: "The AI can now use this integration." });
      setConnectingProvider(null);
      setApiKeyInput("");
    }
  };

  const handleDisconnect = async (provider: ProviderDef) => {
    await disconnectIntegration(provider.id);
    toast({ title: `${provider.name} disconnected` });
  };

  const filteredProviders = PROVIDERS.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", ...Array.from(new Set(PROVIDERS.map((p) => p.category)))];

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const connectedCount = integrations.filter((i) => i.isConnected).length;

  return (
    <div className="flex flex-col h-screen">
      <header className="h-12 flex items-center px-4 border-b shrink-0 justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <button onClick={onBack} className="h-7 w-7 rounded-md hover:bg-secondary flex items-center justify-center transition-colors">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <h1 className="text-sm font-semibold text-foreground">Integrations</h1>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {connectedCount} connected
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Hero */}
        <div className="px-6 py-6 border-b bg-muted/30">
          <h2 className="text-lg font-semibold text-foreground">Connect your tools</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Connect your favorite services so the AI can use them in chats, workflows, and outreach.
          </p>

          {/* Search + Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-[320px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search integrations..."
                className="w-full h-8 pl-8 pr-3 text-xs bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                    filterCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat === "all" ? "All" : CATEGORY_LABELS[cat] || cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProviders.map((provider) => {
            const status = getStatus(provider.id);
            const isConnected = status?.isConnected || false;
            const isExpanded = connectingProvider === provider.id;

            return (
              <div
                key={provider.id}
                className={`border rounded-xl p-4 transition-all ${
                  isConnected
                    ? "border-primary/30 bg-primary/5"
                    : "border-border hover:border-primary/20 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg ${provider.color} flex items-center justify-center text-lg`}>
                      {provider.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{provider.name}</h3>
                        {isConnected && (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                            <Check className="h-2.5 w-2.5" /> Connected
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                        {provider.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expanded connect form */}
                {isExpanded && !isConnected && (
                  <div className="mt-4 space-y-3 pt-3 border-t">
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        {provider.keyLabel}
                      </label>
                      <input
                        type="password"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder={provider.keyPlaceholder}
                        className="w-full mt-1 h-8 px-3 text-xs bg-background border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    {provider.docsUrl && (
                      <a
                        href={provider.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                      >
                        How to get your {provider.keyLabel?.toLowerCase()} <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleConnect(provider)}
                        disabled={saving}
                        className="flex-1 h-8 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Key className="h-3 w-3" />}
                        Connect
                      </button>
                      <button
                        onClick={() => { setConnectingProvider(null); setApiKeyInput(""); }}
                        className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground border rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                {!isExpanded && (
                  <div className="mt-3 flex gap-2">
                    {isConnected ? (
                      <button
                        onClick={() => handleDisconnect(provider)}
                        className="flex items-center gap-1.5 h-7 px-3 text-xs text-destructive hover:bg-destructive/10 border border-destructive/30 rounded-lg transition-colors"
                      >
                        <Unplug className="h-3 w-3" />
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => { setConnectingProvider(provider.id); setApiKeyInput(""); }}
                        className="flex items-center gap-1.5 h-7 px-3 text-xs text-primary hover:bg-primary/10 border border-primary/30 rounded-lg transition-colors"
                      >
                        <Key className="h-3 w-3" />
                        Connect
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filteredProviders.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
              No integrations match your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
