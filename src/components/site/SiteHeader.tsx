import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, Phone, ArrowRight } from "lucide-react";
import { Logo } from "@/components/Logo";

const nav = [
  { to: "/services", label: "Services" },
  { to: "/industries", label: "Industries" },
  { to: "/company", label: "Company" },
  { to: "/case-study", label: "Case Study" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      {/* Top utility bar */}
      <div className="hidden md:flex w-full justify-end items-center gap-2 px-6 py-2 text-xs bg-gradient-to-r from-primary/90 via-primary to-primary/80 text-primary-foreground">
        <Phone className="h-3 w-3" />
        <span className="opacity-90">Call Us</span>
        <a href="tel:+97144397212" className="font-medium hover:underline">
          🇦🇪 +971 4 439 7212
        </a>
      </div>

      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? "bg-background/85 backdrop-blur-md border-b border-border shadow-sm"
            : "bg-background/60 backdrop-blur"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="sm" />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-foreground/70 hover:text-foreground hover:bg-accent"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/contact"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:bg-foreground/90 transition-all hover:gap-3 group"
            >
              Contact Us
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              className="lg:hidden p-2 rounded-lg hover:bg-accent"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t border-border bg-background">
            <div className="px-4 py-3 space-y-1">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    `block px-3 py-2.5 rounded-lg text-sm font-medium ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:bg-accent"
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
              <Link
                to="/contact"
                className="block px-3 py-2.5 rounded-lg text-sm font-medium bg-foreground text-background text-center"
              >
                Contact Us
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
