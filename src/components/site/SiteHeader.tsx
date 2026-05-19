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
      {/* Top utility bar — MMC green gradient */}
      <div className="hidden md:flex w-full justify-end items-center gap-4 px-6 py-2 text-xs brand-gradient text-white">
        <Phone className="h-3 w-3" />
        <span className="opacity-90">Call Us</span>
        <a href="tel:+2347074430088" className="font-semibold hover:underline">
          🇳🇬 +234 707 443 0088
        </a>
        <a href="tel:+2349037557699" className="font-semibold hover:underline">
          +234 903 755 7699
        </a>
      </div>

      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? "bg-background/85 backdrop-blur-xl border-b border-border"
            : "bg-background/40 backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo size="md" variant="light" />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    isActive
                      ? "text-white bg-white/10"
                      : "text-foreground/70 hover:text-white hover:bg-white/5"
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
              className="hidden sm:inline-flex items-center gap-2 rounded-full brand-gradient text-white px-6 py-2.5 text-sm font-semibold hover:brand-glow transition-all group"
            >
              <Phone className="h-4 w-4" />
              Contact Us
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5"
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
                        ? "bg-white/10 text-white"
                        : "text-foreground/70 hover:bg-white/5"
                    }`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
              <Link
                to="/contact"
                className="block px-3 py-2.5 rounded-full text-sm font-semibold brand-gradient text-white text-center"
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
