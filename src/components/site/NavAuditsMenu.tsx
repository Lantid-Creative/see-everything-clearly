import { Link } from "react-router-dom";
import { ChevronDown, ShieldCheck, ArrowRight } from "lucide-react";
import { AUDITS, AuditServiceDef } from "@/config/audits";

const GROUPS: { key: NonNullable<AuditServiceDef["category"]>; label: string }[] = [
  { key: "core", label: "Cybersecurity & payments" },
  { key: "financial", label: "Financial services & regulators" },
  { key: "governance", label: "Governance, risk & privacy" },
  { key: "technical", label: "Technical & cyber deep-dives" },
  { key: "specialty", label: "Emerging & specialty" },
];

/**
 * Desktop-only mega-dropdown for the Audits navbar entry.
 * Uses group-hover + focus-within so it works on keyboard and mouse
 * without pulling extra state.
 */
export function NavAuditsMenu() {
  return (
    <div className="relative group">
      <Link
        to="/audits"
        className="inline-flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
      >
        Audits
        <ChevronDown className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition" />
      </Link>

      <div
        className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 focus-within:visible focus-within:opacity-100 focus-within:translate-y-0 transition-all duration-150 absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50"
      >
        <div className="w-[720px] max-w-[92vw] rounded-2xl border border-border bg-background shadow-brand p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Audits & Assurance</div>
                <div className="text-[11px] text-muted-foreground">21 services · from ₦250k + 7.5% VAT</div>
              </div>
            </div>
            <Link to="/audits" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:gap-1.5 transition-all">
              Browse all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {GROUPS.map((g) => {
              const items = AUDITS.filter((a) => a.category === g.key);
              if (!items.length) return null;
              return (
                <div key={g.key}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    {g.label}
                  </div>
                  <ul className="space-y-0.5">
                    {items.map((a) => (
                      <li key={a.slug}>
                        <Link
                          to={a.route}
                          className="group/item flex items-start gap-2.5 rounded-md px-2 py-1.5 text-xs text-foreground/80 hover:bg-primary/5 hover:text-foreground transition"
                        >
                          <a.icon className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                          <span className="leading-tight">
                            <span className="font-medium">{a.name}</span>
                            <span className="block text-[10px] text-muted-foreground mt-0.5">{a.standard}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-2 text-[11px]">
            <Link to="/audits/my" className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 hover:border-primary/60 hover:text-primary transition">
              My submissions
            </Link>
            <Link to="/verify-report" className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 hover:border-primary/60 hover:text-primary transition">
              Verify a report
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Mobile accordion version — used inside the hamburger sheet. */
export function NavAuditsMobile({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <details className="group rounded-md">
      <summary className="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-foreground/80 hover:bg-muted cursor-pointer list-none">
        <span>Audits</span>
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-1 mb-2 pl-3 border-l border-border ml-3 space-y-3">
        <Link
          to="/audits"
          onClick={onNavigate}
          className="block px-2 py-1.5 rounded-md text-xs font-semibold text-primary hover:bg-primary/5"
        >
          Browse all audits →
        </Link>
        {GROUPS.map((g) => {
          const items = AUDITS.filter((a) => a.category === g.key);
          if (!items.length) return null;
          return (
            <div key={g.key}>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1">{g.label}</div>
              <ul>
                {items.map((a) => (
                  <li key={a.slug}>
                    <Link
                      to={a.route}
                      onClick={onNavigate}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-foreground/80 hover:bg-muted"
                    >
                      <a.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                      {a.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </details>
  );
}
