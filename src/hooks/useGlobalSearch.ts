import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface SearchResult {
  id: string;
  type: "conversation" | "lead" | "email" | "workflow";
  title: string;
  subtitle: string;
}

export function useGlobalSearch(query: string) {
  const { user } = useAuth();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim().toLowerCase();
    if (!trimmed || !user) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      const pattern = `%${trimmed}%`;

      const [convRes, leadRes, emailRes, wfRes] = await Promise.all([
        supabase
          .from("conversations")
          .select("id, title")
          .eq("user_id", user.id)
          .ilike("title", pattern)
          .limit(5),
        supabase
          .from("leads")
          .select("id, name, company, title")
          .eq("user_id", user.id)
          .or(`name.ilike.${pattern},company.ilike.${pattern}`)
          .limit(5),
        supabase
          .from("email_drafts")
          .select("id, subject, body")
          .eq("user_id", user.id)
          .ilike("subject", pattern)
          .limit(5),
        supabase
          .from("workflows")
          .select("id, name")
          .eq("user_id", user.id)
          .ilike("name", pattern)
          .limit(5),
      ]);

      const all: SearchResult[] = [];

      (convRes.data || []).forEach((c) =>
        all.push({ id: c.id, type: "conversation", title: c.title, subtitle: "Conversation" })
      );
      (leadRes.data || []).forEach((l) =>
        all.push({ id: l.id, type: "lead", title: l.name, subtitle: `${l.title} at ${l.company}` })
      );
      (emailRes.data || []).forEach((e) =>
        all.push({ id: e.id, type: "email", title: e.subject || "Untitled Draft", subtitle: "Email Draft" })
      );
      (wfRes.data || []).forEach((w) =>
        all.push({ id: w.id, type: "workflow", title: w.name, subtitle: "Workflow" })
      );

      setResults(all);
      setIsSearching(false);
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, user]);

  return { results, isSearching };
}
