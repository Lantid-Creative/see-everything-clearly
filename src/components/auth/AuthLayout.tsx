import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";

const features = [
  "AI-powered PRD generation",
  "User feedback synthesis",
  "RICE-scored roadmap prioritization",
  "Automated product workflows",
];

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col justify-between p-12 overflow-hidden bg-sidebar text-sidebar-foreground">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary/[0.07] rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/[0.04] rounded-full blur-[100px]" />
        </div>

        {/* Logo */}
        <Link to="/" className="relative flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-bold text-lg">L</span>
          </div>
          <span className="font-semibold text-xl text-sidebar-primary">Lantid</span>
        </Link>

        {/* Hero copy */}
        <div className="relative max-w-md">
          <h2 className="text-3xl xl:text-4xl font-serif tracking-tight leading-[1.2] text-sidebar-primary mb-6">
            Your AI copilot for{" "}
            <span className="italic bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              product management
            </span>
          </h2>
          <p className="text-sidebar-foreground text-sm leading-relaxed mb-8">
            From raw feedback to shipping specs — Lantid synthesizes, prioritizes, and generates everything your product team needs.
          </p>
          <div className="space-y-3">
            {features.map((feat, i) => (
              <motion.div
                key={feat}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <div className="h-5 w-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <Sparkles className="h-2.5 w-2.5 text-primary" />
                </div>
                <span className="text-sm text-sidebar-accent-foreground">{feat}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <blockquote className="relative border-l-2 border-primary/30 pl-4">
          <p className="text-sm text-sidebar-foreground italic leading-relaxed">
            "Lantid turned 3 weeks of research into an actionable PRD in 10 minutes."
          </p>
          <footer className="mt-2 text-xs text-sidebar-foreground/60">
            — Product Lead, Series B SaaS
          </footer>
        </blockquote>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* Theme toggle */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground)) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm relative"
        >
          {/* Mobile logo */}
          <Link to="/" className="flex lg:hidden items-center justify-center gap-2 mb-10">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-bold text-lg">L</span>
            </div>
            <span className="font-semibold text-xl text-foreground">Lantid</span>
          </Link>

          {children}

          <p className="mt-8 text-center text-[11px] text-muted-foreground/50">
            By continuing, you agree to Lantid's Terms & Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  );
}
