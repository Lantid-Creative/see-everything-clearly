import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  layout: "title" | "content" | "two-column" | "image";
  brandColor: string;
  clientLogo?: string;
  comments?: { text: string; resolved: boolean }[];
}

interface SlideDeck {
  id: string;
  name: string;
  slides: Slide[];
  updated_at: string;
}

const AUTOSAVE_DELAY = 1500; // ms

export function useSlideDecks() {
  const { user } = useAuth();
  const [decks, setDecks] = useState<SlideDeck[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load all decks on mount
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("slide_decks")
        .select("id, name, slides, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (data) {
        setDecks(data.map((d: any) => ({ ...d, slides: d.slides as Slide[] })));
        if (data.length > 0 && !activeDeckId) {
          setActiveDeckId(data[0].id);
        }
      }
      setLoading(false);
    })();
  }, [user]);

  const activeDeck = decks.find((d) => d.id === activeDeckId) || null;

  const saveSlides = useCallback(
    async (deckId: string, slides: Slide[], name?: string) => {
      if (!user) return;
      setSaving(true);
      const update: any = { slides, updated_at: new Date().toISOString() };
      if (name) update.name = name;
      await supabase.from("slide_decks").update(update).eq("id", deckId).eq("user_id", user.id);
      setDecks((prev) =>
        prev.map((d) => (d.id === deckId ? { ...d, slides, updated_at: update.updated_at, ...(name ? { name } : {}) } : d))
      );
      setSaving(false);
    },
    [user]
  );

  const debouncedSave = useCallback(
    (deckId: string, slides: Slide[], name?: string) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => saveSlides(deckId, slides, name), AUTOSAVE_DELAY);
    },
    [saveSlides]
  );

  const createDeck = useCallback(
    async (slides: Slide[], name = "Untitled Deck"): Promise<string | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("slide_decks")
        .insert({ user_id: user.id, name, slides: slides as any })
        .select("id, name, slides, updated_at")
        .single();
      if (error || !data) return null;
      const newDeck: SlideDeck = { ...data, slides: data.slides as Slide[] };
      setDecks((prev) => [newDeck, ...prev]);
      setActiveDeckId(newDeck.id);
      return newDeck.id;
    },
    [user]
  );

  const deleteDeck = useCallback(
    async (deckId: string) => {
      if (!user) return;
      await supabase.from("slide_decks").delete().eq("id", deckId).eq("user_id", user.id);
      setDecks((prev) => prev.filter((d) => d.id !== deckId));
      if (activeDeckId === deckId) {
        setActiveDeckId(decks.find((d) => d.id !== deckId)?.id || null);
      }
    },
    [user, activeDeckId, decks]
  );

  return {
    decks,
    activeDeck,
    activeDeckId,
    setActiveDeckId,
    loading,
    saving,
    createDeck,
    deleteDeck,
    saveSlides,
    debouncedSave,
  };
}
