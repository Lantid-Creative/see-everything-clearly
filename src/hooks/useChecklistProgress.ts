import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useChecklistProgress(productId: string | null) {
  const { user } = useAuth();
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const { data } = await supabase
        .from("checklist_progress")
        .select("item_id")
        .eq("user_id", user!.id)
        .eq("product_id", productId ?? "00000000-0000-0000-0000-000000000000");

      setCompletedItems(new Set((data || []).map((r: any) => r.item_id)));
      setLoading(false);
    }

    load();
  }, [user, productId]);

  const toggleItem = useCallback(
    async (itemId: string) => {
      if (!user) return;
      const pid = productId ?? "00000000-0000-0000-0000-000000000000";

      if (completedItems.has(itemId)) {
        // Remove
        setCompletedItems((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
        await supabase
          .from("checklist_progress")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", pid)
          .eq("item_id", itemId);
      } else {
        // Add
        setCompletedItems((prev) => new Set(prev).add(itemId));
        await supabase.from("checklist_progress").upsert({
          user_id: user.id,
          product_id: pid,
          item_id: itemId,
        });
      }
    },
    [user, productId, completedItems]
  );

  const isCompleted = useCallback(
    (itemId: string) => completedItems.has(itemId),
    [completedItems]
  );

  return { isCompleted, toggleItem, loading };
}
