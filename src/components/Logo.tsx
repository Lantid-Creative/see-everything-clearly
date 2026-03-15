import { useTheme } from "@/hooks/useTheme";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
  /** Force a specific variant regardless of theme */
  variant?: "light" | "dark";
}

const sizeMap = {
  sm: "h-6",
  md: "h-8",
  lg: "h-10",
};

export function Logo({ className = "", iconOnly = false, size = "md", variant }: LogoProps) {
  const { theme } = useTheme();
  const resolvedVariant = variant ?? (theme === "dark" ? "light" : "dark");
  const src = resolvedVariant === "light" ? logoLight : logoDark;

  return (
    <img
      src={src}
      alt="Lantid"
      className={`${sizeMap[size]} w-auto object-contain ${className}`}
    />
  );
}
