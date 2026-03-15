import { Send, Mail } from "lucide-react";
import type { Lead } from "@/components/WorkspaceView";

interface EmailComposerProps {
  lead: Lead;
}

export function EmailComposer({ lead }: EmailComposerProps) {
  return (
    <div className="flex-1 border-r flex flex-col min-w-[240px]">
      <div className="px-4 py-2.5 border-b">
        <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Compose Email</h2>
      </div>
      <div className="flex-1 p-4 flex flex-col gap-3">
        <div>
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">To:</label>
          <p className="text-xs text-foreground mt-0.5">{lead.email}</p>
        </div>
        <div>
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Subject:</label>
          <input
            type="text"
            placeholder="Subject..."
            className="w-full text-xs text-foreground mt-0.5 bg-transparent border-b border-border pb-1 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Write your email...</label>
          <textarea
            placeholder={`Hi ${lead.name.split(" ")[0]},\n\nI came across ${lead.company} and was really impressed by...`}
            className="w-full h-full text-xs text-foreground mt-1 bg-transparent resize-none focus:outline-none leading-relaxed"
          />
        </div>
      </div>
      <div className="px-4 py-3 border-t">
        <button className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-2 text-xs font-medium hover:bg-primary/90 transition-colors">
          <Send className="h-3.5 w-3.5" />
          <span>Send Email</span>
          <Mail className="h-3.5 w-3.5 ml-1 opacity-60" />
        </button>
      </div>
    </div>
  );
}
