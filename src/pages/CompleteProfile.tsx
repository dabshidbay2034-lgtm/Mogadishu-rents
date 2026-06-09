import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone } from "lucide-react";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/signin");
        return;
      }
      setUserId(session.user.id);
      // If user already has a phone, skip this page
      supabase
        .from("profiles")
        .select("phone")
        .eq("user_id", session.user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.phone) {
            navigate("/");
          }
        });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    if (!userId) return;
    setSaving(true);

    // Update phone
    const { error } = await supabase
      .from("profiles")
      .update({ phone: phone.trim() })
      .eq("user_id", userId);

    // Apply pending role from signup if exists
    const pendingRole = localStorage.getItem("pending_signup_role");
    if (pendingRole && ["owner", "agent", "hotel_manager", "user"].includes(pendingRole)) {
      await supabase
        .from("user_roles")
        .update({
          role: pendingRole as "user" | "owner" | "hotel_manager" | "agent",
          is_verified: true,
        })
        .eq("user_id", userId);
      localStorage.removeItem("pending_signup_role");
    }

    setSaving(false);
    if (error) {
      toast.error("Failed to save phone number");
    } else {
      toast.success("Profile completed!");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Phone className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground mb-1">
            Complete Your Profile
          </h1>
          <p className="text-muted-foreground text-sm">
            Please add your phone number to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">
              Phone Number *
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+252 XX XXX XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 h-12 rounded-xl"
                required
              />
            </div>
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={saving}>
            {saving ? "Saving..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
