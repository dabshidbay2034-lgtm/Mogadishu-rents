import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { MOGADISHU_DISTRICTS } from "@/lib/districts";
import { Skeleton } from "@/components/ui/skeleton";

const DistrictSection = () => {
  const navigate = useNavigate();

  const { data: districtImages, isLoading } = useQuery({
    queryKey: ["district-sample-images"],
    queryFn: async () => {
      // Get one property image per district
      const { data, error } = await supabase
        .from("properties")
        .select("location, property_images(image_url, sort_order)")
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const imageMap: Record<string, string> = {};
      for (const p of data || []) {
        const district = p.location;
        if (!imageMap[district] && p.property_images?.length > 0) {
          const sorted = [...p.property_images].sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order);
          imageMap[district] = sorted[0].image_url;
        }
      }
      return imageMap;
    },
  });

  return (
    <section className="py-12 md:py-20">
      <div className="container">
        <div className="mb-8 md:mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">Neighborhoods</span>
          <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground tracking-tight">
            Browse by district
          </h2>
          <p className="text-muted-foreground text-sm md:text-base mt-1.5">
            Find rentals in your preferred Mogadishu neighborhood
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-2xl" />
              ))
            : MOGADISHU_DISTRICTS.map((district, i) => {
                const image = districtImages?.[district];
                return (
                  <motion.div
                    key={district}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(i * 0.03, 0.4) }}
                    onClick={() => navigate(`/properties?district=${encodeURIComponent(district)}`)}
                    className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-square shadow-card hover:shadow-elevated transition-shadow duration-300"
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={district}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/15 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="flex items-center gap-1 mb-0.5">
                        <MapPin className="w-3 h-3 text-primary-foreground/70" />
                      </div>
                      <h3 className="text-sm md:text-base font-heading font-bold text-primary-foreground leading-tight">
                        {district}
                      </h3>
                    </div>
                  </motion.div>
                );
              })}
        </div>
      </div>
    </section>
  );
};

export default DistrictSection;
