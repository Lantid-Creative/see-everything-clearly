import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, ArrowRight, Briefcase, Building2, Target, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ROLE_OPTIONS = [
  "Product Manager",
  "Founder / CEO",
  "Product Designer",
  "Engineering Lead",
  "Growth / Marketing",
  "Other",
];

const GOAL_OPTIONS = [
  "Discover what to build next",
  "Generate PRDs & specs",
  "Prioritize my roadmap",
  "Automate product workflows",
  "Align my team on decisions",
];

export function WelcomeModal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Check if onboarding is complete
    const checkOnboarding = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarding_complete, display_name")
        .eq("id", user.id)
        .single();

      if (data && !data.onboarding_complete) {
        setDisplayName(data.display_name || user.user_metadata?.display_name || "");
        setShow(true);
      }
    };
    checkOnboarding();
  }, [user]);

  const handleComplete = async () => {
    if (!user) return;
    setSubmitting(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName || undefined,
        role: role || undefined,
        company: company || undefined,
        product_goals: goals.join(", ") || undefined,
        onboarding_complete: true,
      } as any)
      .eq("id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setSubmitting(false);
    setShow(false);
  };

  const handleSkip = async () => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ onboarding_complete: true } as any)
      .eq("id", user.id);
    setShow(false);
  };

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  if (!show) return null;

  const steps = [
    // Step 0: Welcome + name
    <div key="name" className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-4">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-2xl font-serif tracking-tight text-foreground">
          Welcome to Lantid
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Let's personalize your experience in 30 seconds
        </p>
      </div>
      <div>
        <label className="text-xs font-medium text-foreground/70 mb-1.5 block uppercase tracking-wider">
          What should we call you?
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            autoFocus
            className="w-full rounded-xl border border-input bg-card pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
          />
        </div>
      </div>
    </div>,

    // Step 1: Role + Company
    <div key="role" className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-serif tracking-tight text-foreground">
          What's your role?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          This helps us tailor AI output to your context
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ROLE_OPTIONS.map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all border ${
              role === r
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-border bg-card text-foreground/70 hover:border-foreground/20"
            }`}
          >
            <Briefcase className="h-3.5 w-3.5 shrink-0" />
            {r}
          </button>
        ))}
      </div>
      <div>
        <label className="text-xs font-medium text-foreground/70 mb-1.5 block uppercase tracking-wider">
          Company
        </label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Corp"
            className="w-full rounded-xl border border-input bg-card pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
          />
        </div>
      </div>
    </div>,

    // Step 2: Product goals
    <div key="goals" className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-serif tracking-tight text-foreground">
          What do you want to achieve?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select all that apply — we'll customize your workspace
        </p>
      </div>
      <div className="space-y-2">
        {GOAL_OPTIONS.map((goal) => (
          <button
            key={goal}
            onClick={() => toggleGoal(goal)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all border text-left ${
              goals.includes(goal)
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-border bg-card text-foreground/70 hover:border-foreground/20"
            }`}
          >
            <Target className="h-4 w-4 shrink-0" />
            {goal}
          </button>
        ))}
      </div>
    </div>,
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-8"
        >
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-8">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-6 bg-primary" : i < step ? "w-3 bg-primary/40" : "w-3 bg-border"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {steps[step]}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handleSkip}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now
            </button>
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
              >
                Next
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Let's go
                    <Sparkles className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
