import { Check, X } from "lucide-react";

export type EngagementStage = "requested" | "scoping" | "testing" | "draft" | "issued" | "revoked";

const STAGES: { key: EngagementStage; label: string }[] = [
  { key: "requested", label: "Requested" },
  { key: "scoping", label: "Scoping" },
  { key: "testing", label: "Testing" },
  { key: "draft", label: "Draft" },
  { key: "issued", label: "Issued" },
];

interface Props {
  stage: EngagementStage;
  size?: "sm" | "md";
}

export function StatusTimeline({ stage, size = "md" }: Props) {
  const revoked = stage === "revoked";
  const currentIdx = revoked ? STAGES.length - 1 : STAGES.findIndex((s) => s.key === stage);
  const dot = size === "sm" ? "h-5 w-5" : "h-7 w-7";
  const line = size === "sm" ? "h-0.5" : "h-1";
  const text = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <div className="w-full">
      <ol className="flex items-center w-full">
        {STAGES.map((s, i) => {
          const done = i < currentIdx || (!revoked && i <= currentIdx);
          const active = !revoked && i === currentIdx;
          const isLast = i === STAGES.length - 1;
          return (
            <li key={s.key} className={`flex items-center ${isLast ? "" : "flex-1"} min-w-0`}>
              <div className="flex flex-col items-center min-w-0">
                <div
                  className={`${dot} rounded-full flex items-center justify-center border-2 transition-colors ${
                    revoked
                      ? "border-destructive/40 bg-destructive/10 text-destructive"
                      : done
                      ? "border-primary bg-primary text-primary-foreground"
                      : active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {revoked && i === STAGES.length - 1 ? (
                    <X className="h-3 w-3" />
                  ) : done && !active ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <span className="text-[10px] font-semibold">{i + 1}</span>
                  )}
                </div>
                <span className={`${text} mt-1.5 uppercase tracking-wider ${active ? "text-primary font-semibold" : "text-muted-foreground"} truncate max-w-[70px]`}>
                  {s.label}
                </span>
              </div>
              {!isLast && (
                <div className={`${line} flex-1 mx-1 ${revoked ? "bg-destructive/30" : done ? "bg-primary" : "bg-border"} mb-5`} />
              )}
            </li>
          );
        })}
      </ol>
      {revoked && (
        <div className="mt-2 text-xs text-destructive font-medium">This engagement has been revoked.</div>
      )}
    </div>
  );
}
