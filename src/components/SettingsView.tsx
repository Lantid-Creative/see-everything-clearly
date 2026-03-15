import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Briefcase,
  Building2,
  Target,
  ArrowLeft,
  Save,
  Loader2,
  Mail,
  LogOut,
  Camera,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

interface SettingsViewProps {
  onBack: () => void;
}

export function SettingsView({ onBack }: SettingsViewProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setDisplayName(data.display_name || "");
        setAvatarUrl(data.avatar_url || null);
        // Use type assertion for new columns not yet in generated types
        const profile = data as any;
        setRole(profile.role || "");
        setCompany(profile.company || "");
        const goalsStr = profile.product_goals || "";
        setGoals(goalsStr ? goalsStr.split(", ").filter(Boolean) : []);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName || undefined,
        role: role || undefined,
        company: company || undefined,
        product_goals: goals.join(", ") || undefined,
      } as any)
      .eq("id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Your profile has been updated." });
    }
    setSaving(false);
  };

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "?";

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-y-auto">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Settings</h1>
          <p className="text-xs text-muted-foreground">Manage your profile and preferences</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full p-6 md:p-10 space-y-10">
        {/* Profile Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <User className="h-3.5 w-3.5" />
            Profile
          </div>

          {/* Avatar + Name */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              <Avatar className="h-16 w-16 border-2 border-border">
                {avatarUrl && <AvatarImage src={avatarUrl} />}
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                <Camera className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-foreground/70 uppercase tracking-wider">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="text-xs font-medium text-foreground/70 mb-1.5 block uppercase tracking-wider">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full rounded-xl border border-input bg-muted pl-10 pr-3 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>
        </section>

        {/* Role & Company */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Briefcase className="h-3.5 w-3.5" />
            Role & Company
          </div>

          <div>
            <label className="text-xs font-medium text-foreground/70 mb-2 block uppercase tracking-wider">
              Your Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
        </section>

        {/* Product Goals */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <Target className="h-3.5 w-3.5" />
            Product Goals
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
        </section>

        {/* Save */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium text-sm px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
