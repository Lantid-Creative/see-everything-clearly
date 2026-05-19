interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark";
}

const sizeMap = {
  sm: { box: 26, text: "text-base" },
  md: { box: 30, text: "text-lg" },
  lg: { box: 38, text: "text-2xl" },
  xl: { box: 52, text: "text-3xl" },
} as const;

export function Logo({ className = "", iconOnly = false, size = "md", variant = "dark" }: LogoProps) {
  const { box, text } = sizeMap[size];
  const wordmarkColor = variant === "light" ? "text-white" : "text-foreground";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        style={{ width: box, height: box }}
        className="rounded-md flex items-center justify-center font-bold text-white"
      >
        <div
          style={{ width: box, height: box, background: "hsl(13 95% 60%)" }}
          className="rounded-md flex items-center justify-center"
        >
          <span style={{ fontSize: box * 0.55 }} className="font-bold leading-none">L</span>
        </div>
      </div>
      {!iconOnly && (
        <span className={`font-bold tracking-tight ${text} ${wordmarkColor}`}>
          Lantid
        </span>
      )}
    </div>
  );
}
