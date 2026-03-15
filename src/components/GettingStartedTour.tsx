import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  MessageSquare,
  Workflow,
  Users,
  LayoutGrid,
  Presentation,
  ArrowRight,
  X,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import type { ViewMode } from "@/pages/Index";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: typeof MessageSquare;
  action?: ViewMode;
  position: "sidebar" | "main";
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "chat",
    title: "Chat with Lantid AI",
    description:
      "Ask questions about what to build, get PRDs written, or prioritize your backlog. Lantid is your PM co-pilot.",
    icon: MessageSquare,
    action: "chat",
    position: "main",
  },
  {
    id: "workspace",
    title: "Workspace Tools",
    description:
      "Access your outreach list, email composer, research panel, and profile viewer — all in one place.",
    icon: LayoutGrid,
    action: "workspace",
    position: "sidebar",
  },
  {
    id: "workflows",
    title: "Automate with Workflows",
    description:
      "Build automated pipelines — like turning NPS responses into categorized insights or auto-generating reports.",
    icon: Workflow,
    action: "workflow",
    position: "sidebar",
  },
  {
    id: "slides",
    title: "Strategy Decks",
    description:
      "Generate branded product strategy presentations with your data, ready for stakeholders.",
    icon: Presentation,
    action: "slides",
    position: "sidebar",
  },
  {
    id: "team",
    title: "Collaborate with your Team",
    description:
      "Invite teammates, chat in real-time, and track team activity — everyone aligned on what to build.",
    icon: Users,
    action: "team",
    position: "sidebar",
  },
];

interface GettingStartedTourProps {
  onNavigate: (view: ViewMode) => void;
}

export function GettingStartedTour({ onNavigate }: GettingStartedTourProps) {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const tourDone = localStorage.getItem(`lantid_tour_${user.id}`);
    if (!tourDone) {
      // Delay showing tour to let welcome modal finish first
      const timer = setTimeout(() => {
        checkIfShouldShow();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const checkIfShouldShow = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("onboarding_complete")
      .eq("id", user.id)
      .single();

    if (data?.onboarding_complete) {
      setShow(true);
    }
  };

  const dismissTour = () => {
    if (user) {
      localStorage.setItem(`lantid_tour_${user.id}`, "true");
    }
    setShow(false);
  };

  const handleStepAction = (step: TourStep) => {
    setCompletedSteps((prev) => new Set([...prev, step.id]));
    if (step.action) {
      onNavigate(step.action);
    }
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      dismissTour();
    }
  };

  const step = TOUR_STEPS[currentStep];

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-6 right-6 z-[90] w-[360px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Getting Started
            </span>
          </div>
          <button
            onClick={dismissTour}
            className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 px-5 pb-3">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i === currentStep
                  ? "bg-primary"
                  : i < currentStep || completedSteps.has(TOUR_STEPS[i].id)
                  ? "bg-primary/40"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="px-5 pb-5"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={dismissTour}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip tour
              </button>
              <button
                onClick={() => handleStepAction(step)}
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-medium px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors"
              >
                {currentStep === TOUR_STEPS.length - 1 ? (
                  <>
                    Done
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    Try it
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
