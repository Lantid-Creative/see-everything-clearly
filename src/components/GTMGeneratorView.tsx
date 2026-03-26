import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/NotificationBell";
import { useGTMGenerator } from "@/hooks/useGTMGenerator";
import {
  Rocket, Loader2, FileText, Users, Mail, Presentation, GitBranch,
  ArrowRight, Check, Sparkles, ChevronRight, ArrowLeft,
} from "lucide-react";
import type { ViewMode } from "@/pages/Index";

interface GTMGeneratorViewProps {
  onNavigate: (view: ViewMode) => void;
}

const SECTIONS = [
  { key: "prd", label: "PRD", icon: FileText, color: "text-blue-500 bg-blue-500/10" },
  { key: "leads", label: "Leads", icon: Users, color: "text-primary bg-primary/10" },
  { key: "emails", label: "Emails", icon: Mail, color: "text-orange-500 bg-orange-500/10" },
  { key: "slides", label: "Slides", icon: Presentation, color: "text-purple-500 bg-purple-500/10" },
  { key: "workflow", label: "Workflow", icon: GitBranch, color: "text-emerald-500 bg-emerald-500/10" },
];

export function GTMGeneratorView({ onNavigate }: GTMGeneratorViewProps) {
  const { generating, result, activeSection, setActiveSection, generate, reset } = useGTMGenerator();
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) generate(prompt);
  };

  const plan = result?.plan;

  return (
    <div className="flex flex-col h-screen">
      <header className="h-12 flex items-center justify-between px-4 border-b shrink-0">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="mr-1" />
          <Rocket className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">GTM Generator</span>
        </div>
        <NotificationBell />
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

          {/* Prompt Input */}
          {!result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="text-center space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Rocket className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-2xl font-serif tracking-tight text-foreground">
                  Launch your GTM in one prompt
                </h1>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                  Describe your product or feature. The AI will generate a PRD, identify leads, draft personalized emails, create a pitch deck, and wire up an automation workflow — all at once.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. An AI-powered meeting scheduler for enterprise sales teams that integrates with Salesforce and reduces no-shows by 40%..."
                    rows={4}
                    className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    disabled={generating}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!prompt.trim() || generating}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating your GTM plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate GTM Plan
                    </>
                  )}
                </button>
              </form>

              {/* Generation progress */}
              {generating && (
                <div className="space-y-3">
                  {SECTIONS.map((s, i) => (
                    <motion.div
                      key={s.key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.8 }}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
                    >
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${s.color}`}>
                        <s.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-foreground flex-1">{s.label}</span>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.8 + 0.5 }}
                      >
                        <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Results */}
          {plan && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Summary header */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-serif tracking-tight text-foreground">{plan.prd.title}</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    <Check className="h-3.5 w-3.5 inline-block mr-1 text-emerald-500" />
                    {result.results.leadsCreated} leads · {result.results.emailsCreated} emails · 1 workflow · {plan.slides.length} slides
                  </p>
                </div>
                <button
                  onClick={reset}
                  className="h-8 px-3 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-3 w-3" /> New Plan
                </button>
              </div>

              {/* Section tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {SECTIONS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setActiveSection(s.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                      activeSection === s.key
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <s.icon className="h-3.5 w-3.5" />
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Section content */}
              <AnimatePresence mode="wait">
                {activeSection === "prd" && (
                  <motion.div key="prd" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div className="border border-border rounded-xl bg-card p-5 space-y-4">
                      <div><h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overview</h3><p className="text-sm text-foreground mt-1">{plan.prd.overview}</p></div>
                      <div><h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Problem</h3><p className="text-sm text-foreground mt-1">{plan.prd.problem_statement}</p></div>
                      <div><h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Users</h3><p className="text-sm text-foreground mt-1">{plan.prd.target_users}</p></div>
                      <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Key Features</h3>
                        <div className="mt-2 space-y-2">
                          {plan.prd.features.map((f, i) => (
                            <div key={i} className="flex gap-2">
                              <span className="text-primary font-bold text-sm shrink-0">{i + 1}.</span>
                              <div><p className="text-sm font-medium text-foreground">{f.name}</p><p className="text-xs text-muted-foreground">{f.description}</p></div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">User Stories</h3>
                        <ul className="mt-2 space-y-1">
                          {plan.prd.user_stories.map((s, i) => <li key={i} className="text-sm text-foreground flex gap-2"><ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />{s}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Success Metrics</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {plan.prd.success_metrics.map((m, i) => <span key={i} className="px-2.5 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-600 font-medium">{m}</span>)}
                        </div>
                      </div>
                      <div><h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeline</h3><p className="text-sm text-foreground mt-1">{plan.prd.timeline}</p></div>
                    </div>
                  </motion.div>
                )}

                {activeSection === "leads" && (
                  <motion.div key="leads" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
                    {plan.leads.map((lead, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">{lead.name.charAt(0)}</div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{lead.name}</p>
                          <p className="text-xs text-muted-foreground">{lead.title} at {lead.company}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{lead.email}</p>
                          <p className="text-xs text-primary/80 mt-1 italic">{lead.personalization_note}</p>
                        </div>
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-1" />
                      </div>
                    ))}
                    <button onClick={() => onNavigate("workspace")} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                      View all in Workspace <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                )}

                {activeSection === "emails" && (
                  <motion.div key="emails" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                    {plan.emails.map((email, i) => (
                      <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">To: {email.lead_name}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 font-medium">Draft</span>
                        </div>
                        <p className="text-sm font-medium text-foreground">{email.subject}</p>
                        <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">{email.body}</p>
                      </div>
                    ))}
                    <button onClick={() => onNavigate("workspace")} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                      Edit in Workspace <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                )}

                {activeSection === "slides" && (
                  <motion.div key="slides" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                    {plan.slides.map((slide, i) => (
                      <div key={i} className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="h-6 w-6 rounded-md bg-purple-500/10 text-purple-500 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                          <p className="text-sm font-medium text-foreground">{slide.title}</p>
                        </div>
                        <ul className="space-y-1 ml-8">
                          {slide.bullets.map((b, j) => <li key={j} className="text-xs text-muted-foreground flex gap-1.5"><span className="text-primary">•</span>{b}</li>)}
                        </ul>
                      </div>
                    ))}
                    <button onClick={() => onNavigate("slides")} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                      Open Slide Editor <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                )}

                {activeSection === "workflow" && (
                  <motion.div key="workflow" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-sm font-medium text-foreground mb-3">{plan.workflow.name}</p>
                      <div className="space-y-0">
                        {plan.workflow.nodes.map((node, i) => (
                          <div key={node.id} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                              {i < plan.workflow.nodes.length - 1 && <div className="w-px h-6 bg-border" />}
                            </div>
                            <div className="pb-4">
                              <p className="text-sm font-medium text-foreground">{node.label}</p>
                              <p className="text-xs text-muted-foreground">{node.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => onNavigate("workflow")} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                      Open Workflow Builder <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
