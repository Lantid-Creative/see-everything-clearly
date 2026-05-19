import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, Twitter, Github, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/Logo";

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
    <footer className="bg-sidebar text-sidebar-foreground border-t border-sidebar-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <Logo size="md" variant="light" />
            <p className="text-sm leading-relaxed max-w-sm">
              Lantid builds scalable, secure, high-performance digital solutions for
              enterprises — from software and AI to cybersecurity and blockchain.
            </p>
            <div className="space-y-2 text-sm">
              <a
                href="tel:+97144397212"
                className="flex items-center gap-2 hover:text-sidebar-primary transition-colors"
              >
                <Phone className="h-4 w-4 text-primary" /> +971 4 439 7212
              </a>
              <a
                href="mailto:hello@lantid.com"
                className="flex items-center gap-2 hover:text-sidebar-primary transition-colors"
              >
                <Mail className="h-4 w-4 text-primary" /> hello@lantid.com
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span>Dubai, United Arab Emirates</span>
              </div>
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-sidebar-primary font-semibold text-sm uppercase tracking-wider mb-4">
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

        <div className="mt-14 pt-8 border-t border-sidebar-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-sidebar-muted">
            © {new Date().getFullYear()} Lantid. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {[
              { Icon: Linkedin, href: "#" },
              { Icon: Twitter, href: "#" },
              { Icon: Github, href: "#" },
            ].map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                className="h-9 w-9 rounded-full border border-sidebar-border flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all"
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
