import logoDark from "@/assets/lantid-logo.png";
import logoLight from "@/assets/lantid-logo-white.png";
import iconOnlySrc from "@/assets/lantid-icon.png";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark";
}

const sizeMap = {
  sm: 22,
  md: 28,
  lg: 36,
  xl: 48,
} as const;

export function Logo({ className = "", iconOnly = false, size = "md", variant = "dark" }: LogoProps) {
  const h = sizeMap[size];
  const src = iconOnly ? iconOnlySrc : variant === "light" ? logoLight : logoDark;

  return (
    <img
      src={src}
      alt="Lantid"
      style={{ height: h, width: "auto" }}
      className={className}
    />
  );
}
