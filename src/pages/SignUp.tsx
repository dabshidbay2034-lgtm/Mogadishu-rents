import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, Home, Building2, Hotel, ShieldCheck, CheckCircle2, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { UserRole } from "@/lib/types";

const roles: { value: UserRole; label: string; icon: React.ElementType; desc: string; guide: string[] }[] = [
  {
    value: "user", label: "Renter", icon: User,
    desc: "Looking for a place to rent",
    guide: [
      "Browse hundreds of verified properties",
      "Save your favorites and compare",
      "Contact owners directly",
      "You can upgrade to Owner anytime in Settings",
    ],
  },
  {
    value: "owner", label: "Property Owner", icon: Home,
    desc: "Renting out your own house/apartment",
    guide: [
      "List your property in under 2 minutes",
      "Upload photos and set your price",
      "Manage listings from your Dashboard",
      "Reach thousands of potential renters",
    ],
  },
  {
    value: "hotel_manager", label: "Hotel Manager", icon: Hotel,
    desc: "Managing hotel listings",
    guide: [
      "List hotel rooms with nightly rates",
      "Manage availability from your Dashboard",
      "Reach travelers searching Mogadishu",
      "Upload multiple room photos",
    ],
  },
  {
    value: "agent", label: "Real Estate Agent", icon: ShieldCheck,
    desc: "Verified agent (auto-verified)",
    guide: [
      "Get a verified badge on your profile",
      "List properties on behalf of clients",
      "Account is automatically verified",
      "Start listing properties right away",
    ],
  },
];

const SignUp = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"role" | "details">("role");
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [phone2, setPhone2] = useState("");
  const [phone3, setPhone3] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          role: selectedRole,
        },
      },
    });
    if (error) {
      toast.error(error.message);
      setGoogleLoading(false);
    }
  };

  const currentRole = roles.find((r) => r.value === selectedRole)!;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error("Primary contact number is required");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: selectedRole,
          phone: phone.trim(),
          phone2: phone2.trim() || null,
          phone3: phone3.trim() || null,
        },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      if (selectedRole === "agent") {
        toast.success("Account created! You're automatically verified as an agent.");
      } else {
        toast.success("Account created! Check your email to verify.");
      }
      navigate("/signin");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4">
        <button
          onClick={() => (step === "details" ? setStep("role") : navigate("/"))}
          className="flex items-center gap-2 text-muted-foreground text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-10">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
              <span className="text-accent-foreground font-heading font-bold text-lg">MR</span>
            </div>
             <h1 className="text-2xl font-heading font-bold text-foreground mb-1">
               {step === "role" ? "How will you use Mogadishu Rents?" : "Create Account"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {step === "role" ? "Choose your role — you can change it later" : `Signing up as ${currentRole.label}`}
            </p>
          </div>

          {step === "role" ? (
            <div className="space-y-3">
              {roles.map((role) => (
                <button
                  key={role.value}
                  onClick={() => {
                    setSelectedRole(role.value);
                    setStep("details");
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    selectedRole === role.value
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-accent/30"
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <role.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-foreground text-sm">{role.label}</p>
                    <p className="text-muted-foreground text-xs">{role.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Role guide */}
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 space-y-2">
                <p className="text-xs font-semibold text-accent uppercase tracking-wider">
                  What you'll get as {currentRole.label}
                </p>
                <ul className="space-y-1.5">
                  {currentRole.guide.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">
                    Primary Contact Number <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+252 61 xxx xxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone2" className="text-xs font-medium text-muted-foreground">
                    Second Contact Number <span className="text-muted-foreground/60">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone2"
                      type="tel"
                      placeholder="+252 61 xxx xxxx"
                      value={phone2}
                      onChange={(e) => setPhone2(e.target.value)}
                      className="pl-10 h-12 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone3" className="text-xs font-medium text-muted-foreground">
                    Third Contact Number <span className="text-muted-foreground/60">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone3"
                      type="tel"
                      placeholder="+252 61 xxx xxxx"
                      value={phone3}
                      onChange={(e) => setPhone3(e.target.value)}
                      className="pl-10 h-12 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 rounded-xl"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>

              {/* Google Sign Up - shown after role selection */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full h-12 rounded-xl gap-3"
                onClick={handleGoogleSignUp}
                disabled={googleLoading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {googleLoading ? "Signing up..." : "Continue with Google"}
              </Button>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/signin" className="text-accent font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
