import { useState } from "react";
import { ArrowLeft, Loader2, Sparkles, Search, Filter, Download, Plus, Trash2, Send, X, Edit3, Check } from "lucide-react";
import { exportAsCSV } from "@/lib/exportUtils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { streamChat } from "@/lib/streamChat";
import { useSpreadsheetLeads } from "@/hooks/useWorkspaceData";
import { useToast } from "@/hooks/use-toast";

interface SpreadsheetViewProps {
  onBack: () => void;
}

type FilterField = "status" | "source" | "all";

export function SpreadsheetView({ onBack }: SpreadsheetViewProps) {
  const { leads, setLeads, loaded } = useSpreadsheetLeads();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filterField, setFilterField] = useState<FilterField>("all");
  const [filterValue, setFilterValue] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editCellValue, setEditCellValue] = useState("");
  const [showAddRow, setShowAddRow] = useState(false);
  const [newRow, setNewRow] = useState({ name: "", company: "", title: "", email: "", linkedin: "", status: "pending" as const, source: "" });
  const { toast } = useToast();
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

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filterField === "all" || !filterValue) return true;
    if (filterField === "status") return l.status === filterValue;
    if (filterField === "source") return l.source.toLowerCase().includes(filterValue.toLowerCase());
    return true;
  });

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === filteredLeads.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(filteredLeads.map((l) => l.id)));
  };

  const deleteSelected = () => {
    if (selectedRows.size === 0) return;
    setLeads(leads.filter((l) => !selectedRows.has(l.id)));
    toast({ title: `Deleted ${selectedRows.size} leads` });
    setSelectedRows(new Set());
  };

  const startEditCell = (id: string, field: string, value: string) => {
    setEditingCell({ id, field });
    setEditCellValue(value);
  };

  const saveEditCell = () => {
    if (!editingCell) return;
    setLeads(leads.map((l) => {
      if (l.id !== editingCell.id) return l;
      return { ...l, [editingCell.field]: editCellValue };
    }));
    setEditingCell(null);
  };

  const addNewRow = () => {
    if (!newRow.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    const newLead = { ...newRow, id: Date.now().toString() } as any;
    setLeads([...leads, newLead]);
    setNewRow({ name: "", company: "", title: "", email: "", linkedin: "", status: "pending", source: "" });
    setShowAddRow(false);
    toast({ title: "Lead added" });
  };

  const statusStyles: Record<string, string> = {
    verified: "bg-success/10 text-success",
    pending: "bg-amber-500/10 text-amber-600",
    enriching: "bg-primary/10 text-primary",
  };

  const uniqueStatuses = [...new Set(leads.map((l) => l.status))];
  const uniqueSources = [...new Set(leads.map((l) => l.source))];

  const handleChat = async () => {
    if (!chatInput.trim() || isLoading) return;
    const userMsg = { role: "user" as const, content: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    const currentInput = chatInput;
    setChatInput("");
    setIsLoading(true);

    setChatMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    let fullContent = "";

    try {
      await streamChat({
        messages: [
          {
            role: "system",
            content: `You are Lantid helping with lead research. There are ${leads.length} leads. ${selectedRows.size} selected.
Data summary: ${leads.slice(0, 5).map(l => `${l.name} (${l.company}, ${l.status})`).join(", ")}${leads.length > 5 ? `... and ${leads.length - 5} more` : ""}
Be concise and actionable. If the user asks to analyze, provide insights about the data.`,
          },
          { role: "user", content: currentInput },
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

  const renderCell = (lead: any, field: string, value: string, className?: string) => {
    if (editingCell?.id === lead.id && editingCell?.field === field) {
      return (
        <input
          value={editCellValue}
          onChange={(e) => setEditCellValue(e.target.value)}
          onBlur={saveEditCell}
          onKeyDown={(e) => { if (e.key === "Enter") saveEditCell(); if (e.key === "Escape") setEditingCell(null); }}
          autoFocus
          className="w-full text-xs bg-transparent border-b border-primary focus:outline-none text-foreground"
        />
      );
    }
    return (
      <span
        onDoubleClick={() => startEditCell(lead.id, field, value)}
        className={`cursor-default ${className || ""}`}
        title="Double-click to edit"
      >
        {value}
      </span>
    );
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
          {selectedRows.size > 0 && (
            <button
              onClick={deleteSelected}
              className="h-8 px-3 text-xs text-destructive hover:bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete ({selectedRows.size})
            </button>
          )}
          <button
            onClick={() => setShowAddRow(!showAddRow)}
            className="h-8 px-3 text-xs text-primary hover:bg-primary/10 border border-primary/30 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
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
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`h-8 px-3 text-xs border rounded-lg flex items-center gap-1.5 transition-colors ${
                  filterValue ? "text-primary border-primary bg-primary/5" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                Filter
                {filterValue && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setFilterValue(""); setFilterField("all"); }}
                    className="ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </button>
              {showFilter && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-card border rounded-xl shadow-lg p-3 z-50 space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Filter by</p>
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-muted-foreground font-medium">Status</p>
                    <div className="flex flex-wrap gap-1">
                      {uniqueStatuses.map((s) => (
                        <button
                          key={s}
                          onClick={() => { setFilterField("status"); setFilterValue(s); setShowFilter(false); }}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                            filterField === "status" && filterValue === s ? "bg-primary text-primary-foreground" : statusStyles[s] || "bg-secondary text-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium mt-2">Source</p>
                    <div className="flex flex-wrap gap-1">
                      {uniqueSources.map((s) => (
                        <button
                          key={s}
                          onClick={() => { setFilterField("source"); setFilterValue(s); setShowFilter(false); }}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                            filterField === "source" && filterValue === s ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => { setFilterField("all"); setFilterValue(""); setShowFilter(false); }}
                    className="w-full text-[10px] text-muted-foreground hover:text-foreground py-1 transition-colors"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Add row form */}
      {showAddRow && (
        <div className="border-b px-4 py-2.5 bg-primary/5 flex items-center gap-2 flex-wrap">
          <input value={newRow.name} onChange={(e) => setNewRow({ ...newRow, name: e.target.value })} placeholder="Name *" className="h-7 px-2 text-xs bg-background border rounded w-28 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          <input value={newRow.company} onChange={(e) => setNewRow({ ...newRow, company: e.target.value })} placeholder="Company" className="h-7 px-2 text-xs bg-background border rounded w-28 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          <input value={newRow.title} onChange={(e) => setNewRow({ ...newRow, title: e.target.value })} placeholder="Title" className="h-7 px-2 text-xs bg-background border rounded w-28 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          <input value={newRow.email} onChange={(e) => setNewRow({ ...newRow, email: e.target.value })} placeholder="Email" className="h-7 px-2 text-xs bg-background border rounded w-36 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          <input value={newRow.source} onChange={(e) => setNewRow({ ...newRow, source: e.target.value })} placeholder="Source" className="h-7 px-2 text-xs bg-background border rounded w-24 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
          <button onClick={addNewRow} className="h-7 px-3 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-1">
            <Check className="h-3 w-3" /> Add
          </button>
          <button onClick={() => setShowAddRow(false)} className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
        </div>
      )}

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
                  <td className="px-3 py-2 font-medium">{renderCell(lead, "name", lead.name, "text-foreground")}</td>
                  <td className="px-3 py-2">{renderCell(lead, "company", lead.company, "text-foreground")}</td>
                  <td className="px-3 py-2">{renderCell(lead, "title", lead.title, "text-muted-foreground")}</td>
                  <td className="px-3 py-2">{renderCell(lead, "email", lead.email, "text-primary")}</td>
                  <td className="px-3 py-2 truncate max-w-[150px]">{renderCell(lead, "linkedin", lead.linkedin, "text-primary")}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusStyles[lead.status]}`}>
                      {lead.status === "enriching" ? (
                        <span className="flex items-center gap-1"><Loader2 className="h-2.5 w-2.5 animate-spin" />Enriching</span>
                      ) : lead.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">{renderCell(lead, "source", lead.source, "text-muted-foreground")}</td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                    {searchQuery || filterValue ? "No leads match your filters" : "No leads yet. Click 'Add' to create one."}
                  </td>
                </tr>
              )}
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
                <button
                  onClick={handleChat}
                  disabled={!chatInput.trim() || isLoading}
                  className="h-7 w-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40"
                >
                  {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
