import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

export const useFavorites = () => {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id;

  const { data: favoriteIds = [] } = useQuery({
    queryKey: ["favorites", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("property_id")
        .eq("user_id", userId!);
      if (error) throw error;
      return data.map((f: { property_id: string }) => f.property_id);
    },
    enabled: !!userId,
  });

  const toggleFavorite = useMutation({
    mutationFn: async (propertyId: string) => {
      if (!userId) throw new Error("Not authenticated");
      const isFav = favoriteIds.includes(propertyId);
      if (isFav) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("property_id", propertyId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: userId, property_id: propertyId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", userId] });
    },
  });

  return {
    favoriteIds,
    isFavorite: (id: string) => favoriteIds.includes(id),
    toggleFavorite: toggleFavorite.mutate,
    isAuthenticated: !!userId,
  };
};
