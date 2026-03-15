import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface UserProfile {
  displayName: string | null;
  role: string | null;
  company: string | null;
  productGoals: string | null;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, role, company, product_goals")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile({
            displayName: data.display_name,
            role: data.role,
            company: data.company,
            productGoals: data.product_goals,
          });
        }
      });
  }, [user]);

  return profile;
}
