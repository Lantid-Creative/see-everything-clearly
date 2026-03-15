import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { Send, Mail, Check, Loader2, ArrowRight, Paperclip, X, FileIcon } from "lucide-react";
import type { Lead } from "@/components/WorkspaceView";
import { useFileUpload, formatFileSize, isImageFile, type FileAttachment } from "@/hooks/useFileUpload";

interface EmailComposerProps {
  lead: Lead;
  onSend: (subject: string, body: string) => void;
  isTemplateMode: boolean;
  onTemplateCreated: () => void;
}

const TEMPLATE_MARKERS = [
  { key: "{{company}}", label: "Company" },
  { key: "{{first_name}}", label: "First Name" },
  { key: "{{hook}}", label: "Personal Hook" },
  { key: "{{value_prop}}", label: "Value Proposition" },
];

export function EmailComposer({ lead, onSend, isTemplateMode, onTemplateCreated }: EmailComposerProps) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeField, setActiveField] = useState(-1);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const { uploading, pendingFiles, uploadFiles, removePending, clearPending, openFilePicker, inputRef } = useFileUpload();

  useEffect(() => {
    if (!lead.sent) {
      if (isTemplateMode) {
        setSubject(`Quick intro — {{company}} x ClosedAI`);
        setBody(`Hi {{first_name}},\n\nI came across {{company}} and was really impressed by what you're building. {{hook}}\n\n{{value_prop}}\n\nWould you be open to a quick 15-minute chat this week?\n\nBest,\nSid`);
      } else {
        setSubject(`Quick intro — ${lead.company} x ClosedAI`);
        setBody(`Hi ${lead.name.split(" ")[0]},\n\nI came across ${lead.company} and was really impressed by what you're building. I think there could be a great synergy between ${lead.company} and ClosedAI.\n\nWould you be open to a quick 15-minute chat this week?\n\nBest,\nSid`);
      }
    }
    setActiveField(-1);
    clearPending();
  }, [lead, isTemplateMode]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Tab" && isTemplateMode && !lead.sent) {
      e.preventDefault();
      const textarea = bodyRef.current;
      if (!textarea) return;

      const markers = TEMPLATE_MARKERS.map((m) => m.key);
      const positions: { marker: string; start: number; inSubject: boolean }[] = [];

      markers.forEach((marker) => {
        let idx = subject.indexOf(marker);
        while (idx !== -1) {
          positions.push({ marker, start: idx, inSubject: true });
          idx = subject.indexOf(marker, idx + 1);
        }
        idx = body.indexOf(marker);
        while (idx !== -1) {
          positions.push({ marker, start: idx, inSubject: false });
          idx = body.indexOf(marker, idx + 1);
        }
      });

      if (positions.length === 0) return;

      const nextIdx = (activeField + 1) % positions.length;
      setActiveField(nextIdx);
      const pos = positions[nextIdx];

      if (!pos.inSubject) {
        textarea.focus();
        textarea.setSelectionRange(pos.start, pos.start + pos.marker.length);
      }
    }
  };

  const handleSend = async () => {
    if (lead.sent) return;
    setIsSending(true);
    await new Promise((r) => setTimeout(r, 600));
    onSend(subject, body);
    clearPending();
    setIsSending(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = "";
    }
  };

  return (
    <div className="flex-1 md:border-r flex flex-col md:min-w-[240px] min-w-0" onKeyDown={handleKeyDown}>
      <div className="px-4 py-2.5 border-b flex items-center justify-between">
        <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Compose Email</h2>
        {isTemplateMode && (
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium hidden sm:inline">
            Template Mode · Tab to navigate
          </span>
        )}
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
        <div className="flex-1 relative">
          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Message:</label>
          <textarea
            ref={bodyRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={lead.sent}
            className="w-full h-full text-xs text-foreground mt-1 bg-transparent resize-none focus:outline-none leading-relaxed disabled:opacity-50"
          />
        </div>

        {/* Attachments */}
        {pendingFiles.length > 0 && (
          <div>
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Attachments ({pendingFiles.length})
            </label>
            <div className="mt-1.5 space-y-1">
              {pendingFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-2.5 py-1.5 text-xs group">
                  {isImageFile(file.type) ? (
                    <img src={file.url} alt={file.name} className="h-6 w-6 rounded object-cover shrink-0" />
                  ) : (
                    <FileIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  )}
                  <span className="truncate flex-1 text-foreground">{file.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{formatFileSize(file.size)}</span>
                  <button
                    onClick={() => removePending(i)}
                    className="h-4 w-4 rounded-full hover:bg-destructive/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <X className="h-2.5 w-2.5 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="px-4 py-3 border-t space-y-2">
        {/* Attach button */}
        {!lead.sent && (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
            />
            <button
              onClick={openFilePicker}
              disabled={uploading}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Paperclip className="h-3.5 w-3.5" />
              )}
              <span>Attach file</span>
            </button>
          </div>
        )}

        {!isTemplateMode && !lead.sent && (
          <button
            onClick={onTemplateCreated}
            className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg py-1.5 transition-colors"
          >
            <span>Turn into template</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
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
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Send Email</span>
                {pendingFiles.length > 0 && (
                  <span className="text-[10px] opacity-70">({pendingFiles.length} files)</span>
                )}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
