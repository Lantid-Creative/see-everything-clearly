import type { Lead } from "@/components/WorkspaceView";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface OutreachListProps {
  leads: Lead[];
  selectedLead: Lead;
  onSelectLead: (lead: Lead) => void;
}

const avatarColors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-orange-500",
];

export function OutreachList({ leads, selectedLead, onSelectLead }: OutreachListProps) {
  return (
    <div className="w-[200px] border-r shrink-0 flex flex-col">
      <div className="px-3 py-2.5 border-b">
        <h2 className="text-xs font-semibold text-foreground">Outreach</h2>
        <p className="text-[10px] text-muted-foreground mt-0.5">0/7</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {leads.map((lead, i) => (
          <button
            key={lead.id}
            onClick={() => onSelectLead(lead)}
            className={`w-full px-3 py-2 flex items-center gap-2.5 text-left transition-colors hover:bg-secondary ${
              selectedLead.id === lead.id ? "bg-secondary" : ""
            }`}
          >
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className={`${avatarColors[i % avatarColors.length]} text-[9px] font-medium text-primary-foreground`}>
                {lead.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{lead.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{lead.company}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
