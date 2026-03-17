import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { ProductPhase } from "@/hooks/useProductPhase";

export interface Product {
  id: string;
  name: string;
  current_phase: ProductPhase | null;
  created_at: string;
  updated_at: string;
}

export function useProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: true });

      if (data && data.length > 0) {
        setProducts(data as Product[]);
        setActiveProductId((prev) => prev ?? data[0].id);
      } else {
        // Auto-create a default product
        const { data: created } = await supabase
          .from("products")
          .insert({ user_id: user!.id, name: "My Product" })
          .select()
          .single();
        if (created) {
          setProducts([created as Product]);
          setActiveProductId(created.id);
        }
      }
      setLoaded(true);
    }

    load();
  }, [user]);

  const activeProduct = products.find((p) => p.id === activeProductId) ?? null;

  const createProduct = useCallback(
    async (name: string) => {
      if (!user) return;
      const { data } = await supabase
        .from("products")
        .insert({ user_id: user.id, name })
        .select()
        .single();
      if (data) {
        const product = data as Product;
        setProducts((prev) => [...prev, product]);
        setActiveProductId(product.id);
      }
    },
    [user]
  );

  const renameProduct = useCallback(
    async (id: string, name: string) => {
      await supabase.from("products").update({ name, updated_at: new Date().toISOString() }).eq("id", id);
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
    },
    []
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      await supabase.from("products").delete().eq("id", id);
      setProducts((prev) => {
        const remaining = prev.filter((p) => p.id !== id);
        if (activeProductId === id && remaining.length > 0) {
          setActiveProductId(remaining[0].id);
        }
        return remaining;
      });
    },
    [activeProductId]
  );

  const setPhaseOverride = useCallback(
    async (phase: ProductPhase | null) => {
      if (!activeProductId) return;
      await supabase
        .from("products")
        .update({ current_phase: phase, updated_at: new Date().toISOString() })
        .eq("id", activeProductId);
      setProducts((prev) =>
        prev.map((p) => (p.id === activeProductId ? { ...p, current_phase: phase } : p))
      );
    },
    [activeProductId]
  );

  return {
    products,
    activeProduct,
    activeProductId,
    setActiveProductId,
    createProduct,
    renameProduct,
    deleteProduct,
    setPhaseOverride,
    loaded,
  };
}
