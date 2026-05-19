import { Link } from "react-router-dom";
import {
  Code2, Smartphone, Brain, Shield, Database, Cloud,
  Globe, Workflow, Bot, LineChart, Lock, Server, ArrowRight, CheckCircle2,
} from "lucide-react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { motion } from "framer-motion";

const groups = [
  {
    id: "software",
    icon: Code2,
    title: "Software Development",
    desc: "Custom enterprise platforms designed around your business model. Microservices, modular monoliths, or anything in between — built for the next ten years.",
    bullets: ["TypeScript & Go backends", "React, Next.js, Remix frontends", "Domain-driven design", "Hexagonal architecture"],
  },
  {
    id: "mobile",
    icon: Smartphone,
    title: "Mobile App Development",
    desc: "Native iOS and Android, plus cross-platform React Native and Flutter — shipped with App Store and Play Store launch support.",
    bullets: ["Swift / Kotlin native", "React Native & Flutter", "Offline-first sync", "CI/CD with Fastlane"],
  },
  {
    id: "ai",
    icon: Brain,
    title: "AI & Machine Learning",
    desc: "LLM-powered agents, RAG pipelines, fine-tuning, and classical ML models — productionised with evaluation and observability.",
    bullets: ["Multi-agent orchestration", "RAG & vector stores", "Model evaluation harnesses", "On-prem & API deployments"],
  },
  {
    id: "cyber",
    icon: Shield,
    title: "Cybersecurity",
    desc: "From threat modeling to red team engagements. We harden your stack against the threats that actually matter to your industry.",
    bullets: ["Penetration testing", "Zero-trust architecture", "SOC 2 / ISO 27001 prep", "Secure SDLC coaching"],
  },
  {
    id: "blockchain",
    icon: Database,
    title: "Blockchain Solutions",
    desc: "Smart contracts, custodial infrastructure, tokenization platforms, and integration with major chains and L2s.",
    bullets: ["Solidity & Move contracts", "Wallet infrastructure", "Token standards (ERC-20/721/1155)", "Audit-ready code"],
  },
  {
    id: "cloud",
    icon: Cloud,
    title: "Cloud & DevOps",
    desc: "Multi-cloud infrastructure, Kubernetes, Terraform, observability, and SRE — so your team ships without surprises.",
    bullets: ["AWS, Azure, GCP", "Kubernetes & Terraform", "Datadog, Grafana, OpenTelemetry", "24/7 on-call rotations"],
  },
];

const extras = [
  { Icon: Globe, title: "Web3 & Decentralized Apps" },
  { Icon: Workflow, title: "Process Automation" },
  { Icon: Bot, title: "Conversational AI" },
  { Icon: LineChart, title: "Data Engineering" },
  { Icon: Lock, title: "Identity & Access Mgmt" },
  { Icon: Server, title: "Legacy Modernisation" },
];

export default function Services() {
  return (
    <>
      <section className="bg-sidebar text-sidebar-primary py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[140px]" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sidebar-accent border border-sidebar-border text-xs font-medium mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Services
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05]">
            Everything you need to{" "}
            <span className="italic bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              build, secure, and scale
            </span>
          </h1>
          <p className="mt-8 text-base sm:text-lg text-sidebar-foreground max-w-2xl mx-auto leading-relaxed">
            Six core engineering practices, one delivery standard. Pick a single capability or
            assemble a full-stack pod — every engagement is led by principals who code.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {groups.map((g, i) => (
            <motion.div
              key={g.id}
              id={g.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={`grid lg:grid-cols-2 gap-10 items-center ${
                i % 2 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="rounded-3xl border border-border bg-card p-10 lg:p-14 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                <div className="relative">
                  <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mb-6">
                    <g.icon className="h-6 w-6" />
                  </div>
                  <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                    0{i + 1} / Practice
                  </div>
                  <div className="font-serif text-3xl text-foreground">{g.title}</div>
                </div>
              </div>
              <div>
                <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-foreground leading-tight">
                  {g.title}
                </h2>
                <p className="mt-5 text-muted-foreground leading-relaxed">{g.desc}</p>
                <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                  {g.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /> {b}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all"
                >
                  Discuss your project <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 bg-card/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Beyond the core"
            title={<>Other engagements we deliver</>}
          />
          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {extras.map((e) => (
              <div
                key={e.title}
                className="rounded-xl border border-border bg-background p-5 text-center hover:border-primary/40 hover:-translate-y-0.5 transition-all"
              >
                <e.Icon className="h-6 w-6 text-primary mx-auto" />
                <div className="mt-3 text-sm font-medium text-foreground">{e.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
