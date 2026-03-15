import { useState, useEffect } from "react";
import { Send, Mail, Check } from "lucide-react";
import type { Lead } from "@/components/WorkspaceView";

interface EmailComposerProps {
  lead: Lead;
  onSend: (subject: string, body: string) => void;
}

export function EmailComposer({ lead, onSend }: EmailComposerProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Reset when lead changes
  useEffect(() => {
    if (!lead.sent) {
      setSubject(`Quick intro — ${lead.company} x ClosedAI`);
      setBody(`Hi ${lead.name.split(" ")[0]},\n\nI came across ${lead.company} and was really impressed by what you're building. I think there could be a great synergy between ${lead.company} and ClosedAI.\n\nWould you be open to a quick 15-minute chat this week?\n\nBest,\nSid`);
    }
  }, [lead]);

  const handleSend = async () => {
    if (lead.sent) return;
    setIsSending(true);
    await new Promise((r) => setTimeout(r, 600));
    onSend(subject, body);
    setIsSending(false);
  };

  return (
    <div className="flex-1 border-r flex flex-col min-w-[240px]">
      <div className="px-4 py-2.5 border-b">
        <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Compose Email</h2>
      </div>
      <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
        <div>
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">To:</label>
          <p className="text-xs text-foreground mt-0.5">{lead.email}</p>
        </div>
        <div>
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Subject:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject..."
            disabled={lead.sent}
            className="w-full text-xs text-foreground mt-0.5 bg-transparent border-b border-border pb-1 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Message:</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={lead.sent}
            className="w-full h-full text-xs text-foreground mt-1 bg-transparent resize-none focus:outline-none leading-relaxed disabled:opacity-50"
          />
        </div>
      </div>
      <div className="px-4 py-3 border-t">
        {lead.sent ? (
          <div className="w-full flex items-center justify-center gap-2 bg-success/10 text-success rounded-lg py-2 text-xs font-medium">
            <Check className="h-3.5 w-3.5" />
            <span>Email Sent</span>
          </div>
        ) : (
          <button
            onClick={handleSend}
            disabled={isSending || !subject.trim() || !body.trim()}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-2 text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSending ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Send Email</span>
                <Mail className="h-3.5 w-3.5 ml-1 opacity-60" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
