import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, Mail, Lock } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";

const Login = () => {
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-serif tracking-tight text-foreground mb-1">
        Welcome back
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Sign in to pick up where you left off
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs font-medium text-foreground/70 mb-1.5 block uppercase tracking-wider">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full rounded-xl border border-input bg-card pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring/50 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-foreground/70 mb-1.5 block uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full rounded-xl border border-input bg-card pl-10 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring/50 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-primary text-primary-foreground font-medium py-3 text-sm hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 group"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-medium hover:text-primary/80 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
