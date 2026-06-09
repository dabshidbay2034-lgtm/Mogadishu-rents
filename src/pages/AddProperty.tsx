import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PhotoUploader from "@/components/PhotoUploader";
import {
  ArrowLeft, ArrowRight, Home, Building2, Hotel, Briefcase,
  Bed, Sofa, CookingPot, Bath, Cctv, Car, Layers, Waves,
  MapPin, DollarSign, FileText, Image as ImageIcon, Check, AlertCircle, Armchair,
} from "lucide-react";
import { MOGADISHU_DISTRICTS } from "@/lib/districts";
import { motion, AnimatePresence } from "framer-motion";

type PropertyType = "villa" | "apartment" | "hotel" | "commercial";

const steps = ["Type", "Details", "Amenities", "Photos", "Review"];

const AddProperty = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/signin"); return; }

      const { data: role, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      // Check if user has permission to add properties
      if (error || !role || !["owner", "agent", "hotel_manager"].includes(role.role)) {
        navigate("/dashboard");
        return;
      }
      setCheckingAccess(false);
    };
    checkAccess();
  }, [navigate]);
  const [photos, setPhotos] = useState<File[]>([]);

  // Form state
  const [form, setForm] = useState({
    type: "" as PropertyType | "",
    title: "",
    description: "",
    location: "",
    price: "",
    deposit: "",
    bedrooms: "1",
    living_rooms: "1",
    kitchens: "1",
    toilets: "1",
    has_cctv: false,
    has_parking: false,
    floor_number: "1",
    has_balcony: false,
    is_furnished: false,
    has_elevator: false,
  });

  const updateForm = (key: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canNext = () => {
    switch (step) {
      case 0: return !!form.type;
      case 1: {
        const price = Number(form.price);
        return form.title.trim() && form.location.trim() && price > 0;
      }
      case 2: return true;
      case 3: return true;
      default: return true;
    }
  };

  const getPriceError = () => {
    if (!form.price) return "Price is required to list your property";
    if (Number(form.price) <= 0) return "Price must be greater than zero";
    return "";
  };

  const handleSubmit = async () => {
    if (photos.length < 2) {
      toast.error("Please upload at least 2 photos for your listing");
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in first");
        navigate("/signin");
        return;
      }

      const isHotel = form.type === "hotel";

      const { data: property, error } = await supabase
        .from("properties")
        .insert({
          owner_id: user.id,
          title: form.title.trim(),
          description: form.description.trim() || null,
          type: form.type as PropertyType,
          price: Number(form.price),
          deposit: Number(form.deposit) || 0,
          location: form.location.trim(),
          is_daily_rate: isHotel,
          bedrooms: Number(form.bedrooms) || null,
            living_rooms: form.type === "villa" ? Number(form.living_rooms) || null : null,
            kitchens: (form.type === "villa" || form.type === "apartment") ? Number(form.kitchens) || null : null,
          toilets: Number(form.toilets) || null,
          has_cctv: form.has_cctv,
          has_parking: form.has_parking,
          floor_number: form.type === "apartment" ? Number(form.floor_number) || null : null,
          has_balcony: form.type === "apartment" ? form.has_balcony : false,
          is_furnished: form.is_furnished,
        })
        .select("id")
        .single();

      if (error) throw error;

      // Upload photos
      if (photos.length > 0 && property) {
        const uploadPromises = photos.map(async (file, index) => {
          const ext = file.name.split(".").pop();
          const path = `${user.id}/${property.id}/${index}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("property-images")
            .upload(path, file, { upsert: true });

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from("property-images")
            .getPublicUrl(path);

          return supabase.from("property_images").insert({
            property_id: property.id,
            image_url: urlData.publicUrl,
            sort_order: index,
          });
        });

        await Promise.all(uploadPromises);
      }

      toast.success("Property listed successfully!");
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
      navigate("/properties");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create listing";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <div className="container max-w-lg py-6">
        {/* Back + title */}
        <button onClick={() => (step > 0 ? setStep(step - 1) : navigate(-1))} className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> {step > 0 ? "Back" : "Cancel"}
        </button>

        <h1 className="text-xl font-heading font-bold text-foreground mb-1">List Your Property</h1>
        <p className="text-muted-foreground text-sm mb-6">Step {step + 1} of {steps.length}: {steps[step]}</p>

        {/* Progress bar */}
        <div className="flex gap-1.5 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-accent" : "bg-border"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 0: Property Type */}
            {step === 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground mb-4">What type of property are you listing?</p>
                {([
                  { value: "villa", label: "House", icon: Home, desc: "Full home with rooms & amenities — monthly rent" },
                  { value: "apartment", label: "Apartment", icon: Building2, desc: "Apartment unit with floor & balcony — monthly rent" },
                  { value: "hotel", label: "Hotel", icon: Hotel, desc: "Hotel room or suite — daily rate" },
                  { value: "commercial", label: "Commercial", icon: Briefcase, desc: "Office, shop or business space — monthly rent" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateForm("type", opt.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      form.type === opt.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <opt.icon className="w-5 h-5 text-foreground" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-foreground text-sm">{opt.label}</p>
                      <p className="text-muted-foreground text-xs">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 1: Basic Details */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Property Title</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="e.g. Modern 3-Bedroom House" value={form.title} onChange={(e) => updateForm("title", e.target.value)} className="pl-10 h-12 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Description</Label>
                  <Textarea 
                    placeholder="Describe your property..." 
                    value={form.description} 
                    onChange={(e) => {
                      const value = e.target.value;
                      // Check for phone number patterns (7+ consecutive digits)
                      if (/\d{7,}/.test(value)) {
                        toast.error("Phone numbers are not allowed in property descriptions. Please use our messaging system for contact.");
                        return;
                      }
                      updateForm("description", value);
                    }} 
                    className="rounded-xl min-h-[100px]" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">District</Label>
                  <Select value={form.location} onValueChange={(v) => updateForm("location", v)}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <SelectValue placeholder="Select district" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {MOGADISHU_DISTRICTS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Price ({form.type === "hotel" ? "per night" : "per month"}) *
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        type="number" 
                        min="1" 
                        placeholder="0" 
                        value={form.price} 
                        onChange={(e) => updateForm("price", e.target.value)} 
                        className={`pl-10 h-12 rounded-xl ${getPriceError() ? "border-destructive" : ""}`}
                      />
                    </div>
                    {getPriceError() && (
                      <div className="flex items-center gap-1.5 text-destructive text-xs">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{getPriceError()}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Deposit</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="number" min="0" placeholder="0" value={form.deposit} onChange={(e) => updateForm("deposit", e.target.value)} className="pl-10 h-12 rounded-xl" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Amenities */}
            {step === 2 && (
              <div className="space-y-5">
                <p className="text-sm font-medium text-foreground">Room details & amenities</p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> Bedrooms</Label>
                    <Select value={form.bedrooms} onValueChange={(v) => updateForm("bedrooms", v)}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>{[1,2,3,4,5,6,7,8].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> Toilets/Bathrooms</Label>
                    <Select value={form.toilets} onValueChange={(v) => updateForm("toilets", v)}>
                      <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>{[1,2,3,4,5].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                {form.type === "villa" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1"><Sofa className="w-3.5 h-3.5" /> Living Rooms</Label>
                      <Select value={form.living_rooms} onValueChange={(v) => updateForm("living_rooms", v)}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>{[1,2,3].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1"><CookingPot className="w-3.5 h-3.5" /> Kitchens</Label>
                      <Select value={form.kitchens} onValueChange={(v) => updateForm("kitchens", v)}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>{[0,1,2,3].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {form.type === "apartment" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1"><CookingPot className="w-3.5 h-3.5" /> Kitchens</Label>
                      <Select value={form.kitchens} onValueChange={(v) => updateForm("kitchens", v)}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>{[0,1,2,3].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1"><Layers className="w-3.5 h-3.5" /> Floor Number</Label>
                      <Input type="number" min="0" max="100" value={form.floor_number} onChange={(e) => updateForm("floor_number", e.target.value)} className="h-11 rounded-xl" />
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Features</p>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <Label className="flex items-center gap-2 text-sm text-foreground"><Cctv className="w-4 h-4 text-muted-foreground" /> CCTV Camera</Label>
                    <Switch checked={form.has_cctv} onCheckedChange={(v) => updateForm("has_cctv", v)} />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <Label className="flex items-center gap-2 text-sm text-foreground"><Car className="w-4 h-4 text-muted-foreground" /> Parking Available</Label>
                    <Switch checked={form.has_parking} onCheckedChange={(v) => updateForm("has_parking", v)} />
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <Label className="flex items-center gap-2 text-sm text-foreground"><Armchair className="w-4 h-4 text-muted-foreground" /> Furnished</Label>
                    <Switch checked={form.is_furnished} onCheckedChange={(v) => updateForm("is_furnished", v)} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Photos */}
            {step === 3 && (
              <PhotoUploader photos={photos} setPhotos={setPhotos} maxPhotos={35} />
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Type</span>
                    <span className="text-sm font-semibold text-foreground capitalize">{form.type}</span>
                  </div>
                  <h3 className="font-heading font-bold text-foreground">{form.title}</h3>
                  <p className="text-muted-foreground text-sm flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {form.location}</p>
                  <div className="flex gap-4 pt-2 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="font-heading font-bold text-foreground">${form.price}<span className="text-xs text-muted-foreground">/{form.type === "hotel" ? "night" : "mo"}</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Deposit</p>
                      <p className="font-heading font-bold text-foreground">${form.deposit || "0"}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" />{form.bedrooms} bed</span>
                    <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{form.toilets} bath</span>
                    {form.has_cctv && <span className="flex items-center gap-1"><Cctv className="w-3.5 h-3.5" />CCTV</span>}
                    {form.has_parking && <span className="flex items-center gap-1"><Car className="w-3.5 h-3.5" />Parking</span>}
                    {form.has_balcony && <span className="flex items-center gap-1"><Waves className="w-3.5 h-3.5" />Balcony</span>}
                    {form.has_elevator && <span className="flex items-center gap-1"><span role="img" aria-label="Elevator">🛗</span>Elevator</span>}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> {photos.length} photo{photos.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button variant="hero" size="lg" className="flex-1" onClick={() => setStep(step + 1)} disabled={!canNext()}>
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="hero" size="lg" className="flex-1" onClick={handleSubmit} disabled={loading}>
              {loading ? "Publishing..." : <><Check className="w-4 h-4" /> Publish Listing</>}
            </Button>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AddProperty;
