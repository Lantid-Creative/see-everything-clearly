import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  MessageSquare,
  Workflow,
  Users,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
} from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: typeof MessageSquare;
  checkFn: () => Promise<boolean>;
}

export function OnboardingChecklist() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState(false);

  const items: ChecklistItem[] = [
    {
      id: "first_chat",
      label: "Send your first message",
      description: "Ask Lantid to help with a product question",
      icon: MessageSquare,
      checkFn: async () => {
        if (!user) return false;
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("role", "user");
        return (count || 0) > 0;
      },
    },
    {
      id: "first_workflow",
      label: "Create a workflow",
      description: "Build an automated pipeline for your PM process",
      icon: Workflow,
      checkFn: async () => {
        if (!user) return false;
        const { count } = await supabase
          .from("workflows")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        return (count || 0) > 0;
      },
    },
    {
      id: "first_team",
      label: "Create or join a team",
      description: "Invite teammates to collaborate on products",
      icon: Users,
      checkFn: async () => {
        if (!user) return false;
        const { count } = await supabase
          .from("team_members")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        return (count || 0) > 0;
      },
    },
  ];

  const checkProgress = useCallback(async () => {
    if (!user) return;
    const results: Record<string, boolean> = {};
    for (const item of items) {
      results[item.id] = await item.checkFn();
    }
    setCompleted(results);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const dismissedKey = `lantid_checklist_dismissed_${user.id}`;
    if (localStorage.getItem(dismissedKey)) {
      setDismissed(true);
      return;
    }

    // Only show after tour is done
    const tourDone = localStorage.getItem(`lantid_tour_${user.id}`);
    if (tourDone) {
      setShow(true);
      checkProgress();
    } else {
      // Check periodically for tour completion
      const interval = setInterval(() => {
        if (localStorage.getItem(`lantid_tour_${user.id}`)) {
          setShow(true);
          checkProgress();
          clearInterval(interval);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [user, checkProgress]);

  // Re-check progress every 10 seconds
  useEffect(() => {
    if (!show) return;
    const interval = setInterval(checkProgress, 10000);
    return () => clearInterval(interval);
  }, [show, checkProgress]);

  const completedCount = Object.values(completed).filter(Boolean).length;
  const totalCount = items.length;
  const allDone = completedCount === totalCount;

  const handleDismiss = () => {
    if (user) {
      localStorage.setItem(`lantid_checklist_dismissed_${user.id}`, "true");
    }
    setShow(false);
  };

  if (!show || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-6 right-6 z-[80] w-[320px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              Your Progress
            </span>
            <span className="text-[10px] text-muted-foreground">
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {expanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronUp className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={handleDismiss}
              className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4 pb-2">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / totalCount) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Checklist items */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 pb-4 space-y-1.5"
            >
              {items.map((item) => {
                const done = completed[item.id];
                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                      done
                        ? "bg-primary/5 opacity-70"
                        : "bg-muted/50"
                    }`}
                  >
                    <div className="mt-0.5">
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-medium ${
                          done
                            ? "text-foreground/60 line-through"
                            : "text-foreground"
                        }`}
                      >
                        {item.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}

              {allDone && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center pt-2"
                >
                  <p className="text-xs font-medium text-primary">
                    🎉 All done! You're a Lantid pro.
                  </p>
                  <button
                    onClick={handleDismiss}
                    className="text-[10px] text-muted-foreground hover:text-foreground mt-1 transition-colors"
                  >
                    Dismiss
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
