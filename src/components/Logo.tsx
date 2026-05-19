interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark";
}

const sizeMap = {
  sm: { h: 32, text: "text-base" },
  md: { h: 40, text: "text-lg" },
  lg: { h: 56, text: "text-2xl" },
  xl: { h: 80, text: "text-3xl" },
} as const;

export function Logo({ className = "", iconOnly = false, size = "md", variant = "light" }: LogoProps) {
  const { h, text } = sizeMap[size];
  const wordmarkColor = variant === "dark" ? "text-foreground" : "text-white";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={h} height={h} viewBox="0 0 48 48" fill="none" className="shrink-0">
        <defs>
          <linearGradient id="lantid-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="hsl(145 75% 40%)" />
            <stop offset="55%" stopColor="hsl(120 80% 50%)" />
            <stop offset="100%" stopColor="hsl(80 85% 55%)" />
          </linearGradient>
        </defs>
        <path
          d="M24 4 L42 14 V34 L24 44 L6 34 V14 Z"
          fill="url(#lantid-grad)"
          opacity="0.18"
        />
        <path
          d="M24 4 L42 14 V34 L24 44 L6 34 V14 Z"
          stroke="url(#lantid-grad)"
          strokeWidth="2"
          fill="none"
        />
        <path d="M16 16 L16 32 L32 32" stroke="url(#lantid-grad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="32" cy="16" r="3" fill="url(#lantid-grad)" />
      </svg>
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold tracking-tight ${text} ${wordmarkColor}`}>
            LANTID
          </span>
          <span className="text-[9px] tracking-[0.25em] text-muted-foreground mt-0.5">
            GLOBAL
          </span>
        </div>
      )}
    </div>
  );
}
