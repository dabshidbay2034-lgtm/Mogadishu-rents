import { useState, useEffect } from "react";
import InstallPWAButton from "@/components/InstallPWAButton";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, LogIn, Plus, LayoutDashboard, Settings, LogOut, Heart, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<{ full_name: string; avatar_url: string | null } | null>(null);

  useEffect(() => {
    const checkPhoneRequired = async (userId: string) => {
      const { data } = await supabase.from("profiles").select("phone").eq("user_id", userId).maybeSingle();
      if (!data?.phone && !["/complete-profile", "/signin", "/signup", "/forgot-password", "/reset-password"].includes(window.location.pathname)) {
        navigate("/complete-profile");
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) checkPhoneRequired(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      if (session?.user?.id && _e === "SIGNED_IN") {
        checkPhoneRequired(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!session?.user?.id) { setProfile(null); return; }
    supabase.from("profiles").select("full_name, avatar_url").eq("user_id", session.user.id).single()
      .then(({ data }) => { if (data) setProfile(data); });
  }, [session?.user?.id]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const initials = profile?.full_name
    ?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  const isLoggedIn = !!session;

  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border/70">
      <div className="container flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center shrink-0">
          <img
            src="/logo-icon.svg"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/icon-192.png"; }}
            alt="Mogadishu Rents"
            className="h-10 md:h-12 w-auto"
          />
        </Link>

        {/* Desktop nav — pill-style links on a soft rounded rail, Airbnb-like */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full border border-border/70 bg-card/60">
          <Link to="/" className="px-4 py-2 text-sm font-semibold text-foreground rounded-full hover:bg-muted transition-colors">Home</Link>
          <Link to="/properties" className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">Explore</Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors outline-none">
              Categories <ChevronDown className="w-3.5 h-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44 rounded-2xl">
              <DropdownMenuItem asChild>
                <Link to="/properties?type=villa" className="w-full rounded-lg">🏠 Houses</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/properties?type=apartment" className="w-full rounded-lg">🏢 Apartments</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/properties?type=hotel" className="w-full rounded-lg">🏨 Hotels</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/properties?type=commercial" className="w-full rounded-lg">💼 Commercial</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/about" className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">About</Link>
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <InstallPWAButton />
          {isLoggedIn ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full font-semibold hover:bg-muted"
                onClick={() => navigate("/add-property")}
              >
                <Plus className="w-4 h-4" /> List your property
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border border-border bg-card pl-3 pr-1 py-1 shadow-card hover:shadow-elevated transition-shadow">
                    <Menu className="w-4 h-4 text-foreground" />
                    <Avatar className="w-7 h-7">
                      {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt={profile.full_name} /> : null}
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">{initials}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-2xl">
                  <div className="px-3 py-2.5">
                    <p className="text-sm font-semibold text-foreground truncate">{profile?.full_name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")} className="rounded-lg">
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/saved")} className="rounded-lg">
                    <Heart className="w-4 h-4 mr-2" /> Saved
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="rounded-lg">
                    <Settings className="w-4 h-4 mr-2" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive rounded-lg">
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="rounded-full font-semibold" onClick={() => navigate("/signin")}>
                <LogIn className="w-4 h-4" /> Sign In
              </Button>
              <Button size="sm" className="rounded-full font-semibold px-5 shadow-card" onClick={() => navigate("/signup")}>Get Started</Button>
            </>
          )}
        </div>

        {/* Mobile menu toggle — Airbnb-style avatar+hamburger pill */}
        <button
          className="lg:hidden flex items-center gap-2 rounded-full border border-border bg-card pl-3 pr-1 py-1 shadow-card"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-4 h-4 text-foreground" /> : <Menu className="w-4 h-4 text-foreground" />}
          <Avatar className="w-7 h-7">
            {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt={profile.full_name} /> : null}
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-t border-border/70 bg-background overflow-hidden"
          >
            <div className="container py-4 flex flex-col gap-1">
              <Link to="/" className="py-2.5 px-3 rounded-xl text-sm font-semibold hover:bg-muted transition-colors" onClick={() => setIsOpen(false)}>Home</Link>
              <Link to="/about" className="py-2.5 px-3 rounded-xl text-sm font-semibold hover:bg-muted transition-colors" onClick={() => setIsOpen(false)}>About</Link>
              <Link to="/properties" className="py-2.5 px-3 rounded-xl text-sm font-semibold hover:bg-muted transition-colors" onClick={() => setIsOpen(false)}>All Properties</Link>

              {/* Property Categories */}
              <div className="py-2 px-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Categories</div>
                <div className="flex flex-wrap gap-2">
                  <Link to="/properties?type=villa" className="px-3 py-1.5 rounded-full text-sm font-medium border border-border hover:border-primary hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>🏠 Houses</Link>
                  <Link to="/properties?type=apartment" className="px-3 py-1.5 rounded-full text-sm font-medium border border-border hover:border-primary hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>🏢 Apartments</Link>
                  <Link to="/properties?type=hotel" className="px-3 py-1.5 rounded-full text-sm font-medium border border-border hover:border-primary hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>🏨 Hotels</Link>
                  <Link to="/properties?type=commercial" className="px-3 py-1.5 rounded-full text-sm font-medium border border-border hover:border-primary hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>💼 Commercial</Link>
                </div>
              </div>
              <div className="px-3"><InstallPWAButton /></div>

              <div className="mt-2 pt-3 border-t border-border/70 px-3">
                {isLoggedIn ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 py-1">
                      <Avatar className="w-10 h-10">
                        {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt={profile.full_name} /> : null}
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{profile?.full_name || "User"}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{session.user.email}</p>
                      </div>
                    </div>
                    <Button size="sm" className="rounded-full font-semibold w-full shadow-card" onClick={() => { navigate("/add-property"); setIsOpen(false); }}>
                      <Plus className="w-4 h-4" /> List your property
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="rounded-full" onClick={() => { navigate("/dashboard"); setIsOpen(false); }}>
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-full" onClick={() => { navigate("/profile"); setIsOpen(false); }}>
                        <Settings className="w-4 h-4" /> Settings
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive justify-start rounded-full" onClick={() => { handleSignOut(); setIsOpen(false); }}>
                      <LogOut className="w-4 h-4" /> Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="flex-1 rounded-full font-semibold" onClick={() => { navigate("/signin"); setIsOpen(false); }}>
                      <LogIn className="w-4 h-4" /> Sign In
                    </Button>
                    <Button size="sm" className="flex-1 rounded-full font-semibold shadow-card" onClick={() => { navigate("/signup"); setIsOpen(false); }}>
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
