import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PropertyCard from "@/components/PropertyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Heart, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useFavorites } from "@/hooks/use-favorites";
import type { Property } from "@/lib/types";
import type { Session } from "@supabase/supabase-js";

const Saved = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const { favoriteIds, isFavorite, toggleFavorite, isAuthenticated } = useFavorites();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/signin");
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) navigate("/signin");
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const { data: dbProperties, isLoading } = useQuery({
    queryKey: ["saved-properties", favoriteIds],
    queryFn: async () => {
      if (favoriteIds.length === 0) return [];
      const { data, error } = await supabase
        .from("properties")
        .select("*, property_images(image_url, sort_order)")
        .in("id", favoriteIds);
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id && favoriteIds.length > 0,
  });

  const properties: Property[] = (dbProperties || []).map((p: {
    id: string;
    title: string;
    description: string | null;
    type: string;
    price: number;
    deposit: number;
    location: string;
    property_images: { sort_order: number; image_url: string }[] | null;
    owner_id: string;
    created_at: string;
    is_available: boolean;
    is_daily_rate: boolean;
    bedrooms: number | null;
    living_rooms: number | null;
    kitchens: number | null;
    toilets: number | null;
    has_cctv: boolean | null;
    has_parking: boolean | null;
    floor_number: number | null;
    has_balcony: boolean | null;
    is_furnished: boolean | null;
  }) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    type: p.type,
    price: p.price,
    deposit: p.deposit,
    location: p.location,
    images: (p.property_images || [])
      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
      .map((img: { image_url: string }) => img.image_url),
    owner_id: p.owner_id,
    created_at: p.created_at,
    is_available: p.is_available,
    is_daily_rate: p.is_daily_rate,
    bedrooms: p.bedrooms,
    living_rooms: p.living_rooms,
    kitchens: p.kitchens,
    toilets: p.toilets,
    has_cctv: p.has_cctv,
    has_parking: p.has_parking,
    floor_number: p.floor_number,
    has_balcony: p.has_balcony,
    is_furnished: p.is_furnished,
  }));

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      <main className="container max-w-4xl py-6">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Saved Properties</h1>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-border">
                <Skeleton className="aspect-[16/10] w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 text-destructive/40" />
            </div>
            <h2 className="text-xl font-heading font-semibold text-foreground mb-2">No saved properties yet</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              Tap the heart icon on any property to save it here for quick access later.
            </p>
            <Button onClick={() => navigate("/properties")}>
              <Search className="w-4 h-4 mr-2" /> Browse Properties
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {properties.map((property, i) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <PropertyCard
                  property={property}
                  isFavorite={isFavorite(property.id)}
                  onToggleFavorite={toggleFavorite}
                  isAuthenticated={isAuthenticated}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Saved;
