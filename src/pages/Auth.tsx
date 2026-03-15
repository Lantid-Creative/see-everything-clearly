import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, ArrowRight, Mail, Lock, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sidebar-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = isSignUp
      ? await signUp(email, password, displayName || email.split("@")[0])
      : await signIn(email, password);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (isSignUp) {
      toast({ title: "Account created!", description: "You're now signed in." });
    }
    setSubmitting(false);
  };

  const features = [
    "AI-powered PRD generation",
    "User feedback synthesis",
    "RICE-scored roadmap prioritization",
    "Automated product workflows",
  ];

  return (
    <div className="min-h-screen flex bg-sidebar-background">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-primary/[0.07] rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-orange-400/[0.05] rounded-full blur-[100px]" />
        </div>

        {/* Logo */}
        <Link to="/landing" className="relative flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-bold text-lg">L</span>
          </div>
          <span className="font-semibold text-xl text-sidebar-primary">Lantid</span>
        </Link>

        {/* Hero copy */}
        <div className="relative max-w-md">
          <h2 className="text-3xl xl:text-4xl font-serif tracking-tight leading-[1.2] text-sidebar-primary mb-6">
            Your AI copilot for{" "}
            <span className="italic bg-gradient-to-r from-primary to-orange-300 bg-clip-text text-transparent">
              product management
            </span>
          </h2>
          <p className="text-sidebar-foreground text-sm leading-relaxed mb-8">
            From raw feedback to shipping specs — Lantid synthesizes, prioritizes, and generates everything your product team needs.
          </p>
          <div className="space-y-3">
            {features.map((feat, i) => (
              <motion.div
                key={feat}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <div className="h-5 w-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <Sparkles className="h-2.5 w-2.5 text-primary" />
                </div>
                <span className="text-sm text-sidebar-accent-foreground">{feat}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative">
          <blockquote className="border-l-2 border-primary/30 pl-4">
            <p className="text-sm text-sidebar-foreground italic leading-relaxed">
              "Lantid turned 3 weeks of research into an actionable PRD in 10 minutes."
            </p>
            <footer className="mt-2 text-xs text-sidebar-foreground/60">
              — Product Lead, Series B SaaS
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--sidebar-foreground)) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm relative"
        >
          {/* Mobile logo */}
          <Link to="/landing" className="flex lg:hidden items-center justify-center gap-2 mb-10">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-primary-foreground font-bold text-lg">L</span>
            </div>
            <span className="font-semibold text-xl text-sidebar-primary">Lantid</span>
          </Link>

          {/* Toggle pills */}
          <div className="flex items-center bg-sidebar-accent rounded-xl p-1 mb-8">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all duration-200 ${
                !isSignUp
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-sidebar-foreground hover:text-sidebar-primary"
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-all duration-200 ${
                isSignUp
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-sidebar-foreground hover:text-sidebar-primary"
              }`}
            >
              Sign up
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isSignUp ? "signup" : "signin"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-2xl font-serif tracking-tight text-sidebar-primary mb-1">
                {isSignUp ? "Create your account" : "Welcome back"}
              </h1>
              <p className="text-sm text-sidebar-foreground mb-8">
                {isSignUp
                  ? "Start building smarter products with AI"
                  : "Pick up where you left off"}
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <AnimatePresence>
                  {isSignUp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="text-xs font-medium text-sidebar-accent-foreground mb-1.5 block uppercase tracking-wider">
                        Display name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sidebar-foreground" />
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your name"
                          className="w-full rounded-xl border border-sidebar-border bg-sidebar-accent/50 pl-10 pr-3 py-2.5 text-sm text-sidebar-primary placeholder:text-sidebar-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="text-xs font-medium text-sidebar-accent-foreground mb-1.5 block uppercase tracking-wider">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sidebar-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="w-full rounded-xl border border-sidebar-border bg-sidebar-accent/50 pl-10 pr-3 py-2.5 text-sm text-sidebar-primary placeholder:text-sidebar-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-sidebar-accent-foreground mb-1.5 block uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sidebar-foreground" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full rounded-xl border border-sidebar-border bg-sidebar-accent/50 pl-10 pr-3 py-2.5 text-sm text-sidebar-primary placeholder:text-sidebar-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-gradient-to-r from-primary to-orange-400 text-primary-foreground font-medium py-3 text-sm hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 group"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {isSignUp ? "Get started" : "Sign in"}
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {!isSignUp && (
                <p className="mt-4 text-center text-xs text-sidebar-foreground/50">
                  Forgot your password?{" "}
                  <button className="text-primary hover:text-primary/80 transition-colors">
                    Reset it
                  </button>
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          <p className="mt-8 text-center text-[11px] text-sidebar-foreground/30">
            By continuing, you agree to Lantid's Terms & Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
