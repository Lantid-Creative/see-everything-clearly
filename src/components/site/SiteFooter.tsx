import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, Instagram, Youtube, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/Logo";

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
  </svg>
);

const cols = [
  {
    title: "Services",
    links: [
      { to: "/services#software", label: "Software Development" },
      { to: "/services#mobile", label: "Mobile Apps" },
      { to: "/services#ai", label: "AI & Machine Learning" },
      { to: "/services#cyber", label: "Cybersecurity" },
      { to: "/services#blockchain", label: "Blockchain" },
      { to: "/services#cloud", label: "Cloud & DevOps" },
    ],
  },
  {
    title: "Industries",
    links: [
      { to: "/industries#fintech", label: "Fintech" },
      { to: "/industries#healthcare", label: "Healthcare" },
      { to: "/industries#retail", label: "Retail & E-commerce" },
      { to: "/industries#logistics", label: "Logistics" },
      { to: "/industries#realestate", label: "Real Estate" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/company", label: "About Us" },
      { to: "/case-study", label: "Case Studies" },
      { to: "/contact", label: "Contact" },
      { to: "/login", label: "Sign In" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-background text-foreground border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <Logo size="md" variant="dark" />
            <p className="text-sm leading-relaxed max-w-sm">
              Lantid builds scalable, secure, high-performance digital solutions for
              enterprises — from software and AI to cybersecurity and blockchain.
            </p>
            <div className="space-y-2 text-sm">
              <a
                href="mailto:hi@lantid.com"
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                <Mail className="h-4 w-4 text-primary" /> hi@lantid.com
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span>
                  <strong className="text-foreground">Lantid Creative LTD</strong><br />
                  14 Greenline, Festrut Estate,<br />
                  Katampe main, Abuja, Nigeria
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span>
                  <strong className="text-foreground">Lantid Creative UK LTD</strong><br />
                  39 Davy Road, New Rossington,<br />
                  Doncaster, England, DN11 0LQ
                </span>
              </div>
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-foreground font-semibold text-sm uppercase tracking-wider mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm hover:text-primary transition-colors inline-flex items-center gap-1 group"
                    >
                      {l.label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Lantid. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {[
              { Icon: Linkedin, href: "https://www.linkedin.com/company/lantidcreative/", label: "LinkedIn" },
              { Icon: Instagram, href: "https://www.instagram.com/lantidcreative/", label: "Instagram" },
              { Icon: XIcon, href: "https://x.com/lantidcreative", label: "X" },
              { Icon: Youtube, href: "https://www.youtube.com/@lantidcreative", label: "YouTube" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="h-9 w-9 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
