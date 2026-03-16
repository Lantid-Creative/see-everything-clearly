import { useTheme } from "@/hooks/useTheme";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  /** Force a specific variant regardless of theme */
  variant?: "light" | "dark";
}

const sizeMap = {
  sm: "h-8",
  md: "h-12",
  lg: "h-16",
  xl: "h-24",
};

// The dark (black) logo image has a tighter crop than the light (white) one,
// so we scale it down to match the visual size of the light variant.
const scaleMap: Record<string, string> = {
  sm: "scale-[0.55]",
  md: "scale-[0.55]",
  lg: "scale-[0.55]",
  xl: "scale-[0.55]",
};

export function Logo({ className = "", iconOnly = false, size = "md", variant }: LogoProps) {
  const { theme } = useTheme();
  const resolvedVariant = variant ?? (theme === "dark" ? "light" : "dark");
  const src = resolvedVariant === "light" ? logoLight : logoDark;
  const needsScale = resolvedVariant === "dark" ? scaleMap[size] ?? "" : "";

  return (
    <img
      src={src}
      alt="Lantid"
      className={`${sizeMap[size]} w-auto object-contain ${needsScale} ${className}`}
    />
  );
}
