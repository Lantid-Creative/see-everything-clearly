import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Integration {
  id: string;
  provider: string;
  displayName: string;
  isConnected: boolean;
  apiKey: string | null;
  config: Record<string, any>;
}

export function useIntegrations() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data } = await supabase
        .from("user_integrations")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: true });

      setIntegrations((data || []).map(dbToIntegration));
      setLoaded(true);
    }
    load();
  }, [user]);

  const connectIntegration = useCallback(async (provider: string, displayName: string, apiKey: string, config?: Record<string, any>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("user_integrations")
      .upsert({
        user_id: user.id,
        provider,
        display_name: displayName,
        is_connected: true,
        api_key: apiKey,
        config: config || {},
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,provider" })
      .select()
      .single();

    if (data) {
      setIntegrations((prev) => {
        const existing = prev.findIndex((i) => i.provider === provider);
        const updated = dbToIntegration(data);
        if (existing >= 0) {
          const copy = [...prev];
          copy[existing] = updated;
          return copy;
        }
        return [...prev, updated];
      });
    }
    return { error };
  }, [user]);

  const disconnectIntegration = useCallback(async (provider: string) => {
    if (!user) return;
    await supabase
      .from("user_integrations")
      .update({ is_connected: false, api_key: null, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("provider", provider);

    setIntegrations((prev) =>
      prev.map((i) => i.provider === provider ? { ...i, isConnected: false, apiKey: null } : i)
    );
  }, [user]);

  const getConnectedProviders = useCallback(() => {
    return integrations.filter((i) => i.isConnected).map((i) => i.provider);
  }, [integrations]);

  return { integrations, loaded, connectIntegration, disconnectIntegration, getConnectedProviders };
}

function dbToIntegration(row: any): Integration {
  return {
    id: row.id,
    provider: row.provider,
    displayName: row.display_name,
    isConnected: row.is_connected,
    apiKey: row.api_key,
    config: row.config || {},
  };
}
