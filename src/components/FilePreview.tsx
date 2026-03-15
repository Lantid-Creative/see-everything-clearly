import { X, FileIcon, ImageIcon } from "lucide-react";
import { type FileAttachment, formatFileSize, isImageFile } from "@/hooks/useFileUpload";

interface FilePreviewBarProps {
  files: FileAttachment[];
  onRemove: (index: number) => void;
}

export function FilePreviewBar({ files, onRemove }: FilePreviewBarProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap px-4 py-2 border-t bg-muted/30">
      {files.map((file, i) => (
        <div
          key={i}
          className="relative group flex items-center gap-2 bg-background border rounded-lg px-2.5 py-1.5 text-xs max-w-[200px]"
        >
          {isImageFile(file.type) ? (
            <img
              src={file.url}
              alt={file.name}
              className="h-8 w-8 rounded object-cover shrink-0"
            />
          ) : (
            <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <div className="min-w-0">
            <p className="truncate text-foreground font-medium">{file.name}</p>
            <p className="text-[10px] text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
          <button
            onClick={() => onRemove(i)}
            className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

interface MessageAttachmentsProps {
  attachments: FileAttachment[];
}

export function MessageAttachments({ attachments }: MessageAttachmentsProps) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mt-2 space-y-1.5">
      {attachments.map((file, i) =>
        isImageFile(file.type) ? (
          <a key={i} href={file.url} target="_blank" rel="noopener noreferrer">
            <img
              src={file.url}
              alt={file.name}
              className="max-w-[240px] max-h-[180px] rounded-lg border object-cover hover:opacity-90 transition-opacity"
            />
          </a>
        ) : (
          <a
            key={i}
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-foreground/5 hover:bg-foreground/10 rounded-lg px-3 py-2 text-xs transition-colors"
          >
            <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate font-medium">{file.name}</span>
            <span className="text-[10px] text-muted-foreground shrink-0">{formatFileSize(file.size)}</span>
          </a>
        )
      )}
    </div>
  );
}
