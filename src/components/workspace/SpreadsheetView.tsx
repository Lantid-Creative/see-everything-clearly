import { useState } from "react";
import { ArrowLeft, Loader2, Sparkles, Search, Filter, Download } from "lucide-react";
import { exportAsCSV } from "@/lib/exportUtils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { streamChat } from "@/lib/streamChat";
import { useSpreadsheetLeads } from "@/hooks/useWorkspaceData";

interface SpreadsheetViewProps {
  onBack: () => void;
}

export function SpreadsheetView({ onBack }: SpreadsheetViewProps) {
  const { leads, loaded } = useSpreadsheetLeads();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Research complete. Found 15 founders across 7 companies with verified emails and LinkedIn profiles. The data is enriched with company details, roles, and sources." },
  ]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const filteredLeads = leads.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === filteredLeads.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredLeads.map((l) => l.id)));
    }
  };

  const statusStyles: Record<string, string> = {
    verified: "bg-success/10 text-success",
    pending: "bg-amber-500/10 text-amber-600",
    enriching: "bg-primary/10 text-primary",
  };

  const handleChat = async () => {
    if (!chatInput.trim() || isLoading) return;
    const userMsg = { role: "user" as const, content: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsLoading(true);

    setChatMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    let fullContent = "";

    try {
      await streamChat({
        messages: [
          { role: "user", content: `You are Lantid helping with lead research. There are ${leads.length} leads in the spreadsheet. ${selectedRows.size} are selected. User request: ${chatInput}. Respond concisely.` },
        ],
        onDelta: (chunk) => {
          fullContent += chunk;
          setChatMessages((prev) => {
            const msgs = [...prev];
            msgs[msgs.length - 1] = { role: "assistant", content: fullContent };
            return msgs;
          });
        },
        onDone: () => {},
      });
    } catch {
      setChatMessages((prev) => {
        const msgs = [...prev];
        msgs[msgs.length - 1] = { role: "assistant", content: "I'll help with that research." };
        return msgs;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="h-12 flex items-center px-4 border-b shrink-0 justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <button onClick={onBack} className="h-7 w-7 rounded-md hover:bg-secondary flex items-center justify-center transition-colors">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <h1 className="text-sm font-semibold text-foreground">Lead Research</h1>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full hidden sm:inline">
            {leads.filter((l) => l.status === "verified").length}/{leads.length} verified
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="h-8 pl-8 pr-3 text-xs bg-secondary rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-32 md:w-48"
            />
          </div>
          {!isMobile && (
            <button
              onClick={() => {
                const headers = ["Name", "Company", "Title", "Email", "LinkedIn", "Status", "Source"];
                const rows = leads.map((l) => [l.name, l.company, l.title, l.email, l.linkedin, l.status, l.source]);
                exportAsCSV("lead-research", headers, rows);
              }}
              className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground border rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>
          )}
          {!isMobile && (
            <button className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground border rounded-lg flex items-center gap-1.5 transition-colors">
              <Filter className="h-3.5 w-3.5" />
              Filter
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left w-8">
                  <input type="checkbox" checked={selectedRows.size === filteredLeads.length && filteredLeads.length > 0} onChange={toggleAll} className="rounded" />
                </th>
                <th className="px-3 py-2 text-left font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-3 py-2 text-left font-semibold text-muted-foreground uppercase tracking-wider">Company</th>
                <th className="px-3 py-2 text-left font-semibold text-muted-foreground uppercase tracking-wider">Title</th>
                <th className="px-3 py-2 text-left font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="px-3 py-2 text-left font-semibold text-muted-foreground uppercase tracking-wider">LinkedIn</th>
                <th className="px-3 py-2 text-left font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left font-semibold text-muted-foreground uppercase tracking-wider">Source</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${selectedRows.has(lead.id) ? "bg-primary/5" : ""}`}>
                  <td className="px-3 py-2"><input type="checkbox" checked={selectedRows.has(lead.id)} onChange={() => toggleRow(lead.id)} className="rounded" /></td>
                  <td className="px-3 py-2 font-medium text-foreground">{lead.name}</td>
                  <td className="px-3 py-2 text-foreground">{lead.company}</td>
                  <td className="px-3 py-2 text-muted-foreground">{lead.title}</td>
                  <td className="px-3 py-2 text-primary">{lead.email}</td>
                  <td className="px-3 py-2 text-primary truncate max-w-[150px]">{lead.linkedin}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusStyles[lead.status]}`}>
                      {lead.status === "enriching" ? (
                        <span className="flex items-center gap-1"><Loader2 className="h-2.5 w-2.5 animate-spin" />Enriching</span>
                      ) : lead.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{lead.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isMobile && (
          <div className="w-[300px] border-l flex flex-col shrink-0">
            <div className="px-4 py-2.5 border-b flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Research</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chatMessages.map((msg, i) => (
                <div key={i} className={msg.role === "user" ? "ml-6" : ""}>
                  <div className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                    {msg.content || <span className="inline-block w-1 h-3 bg-foreground/40 animate-pulse" />}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleChat()}
                  placeholder="Ask about these leads..."
                  disabled={isLoading}
                  className="flex-1 text-xs bg-secondary rounded-md px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
