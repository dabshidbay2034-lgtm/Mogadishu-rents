import { Link, useLocation } from "react-router-dom";
import { Home, Search, Heart, User } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", path: "/", exact: true },
  { icon: Search, label: "Explore", path: "/properties", exact: false },
  { icon: Heart, label: "Saved", path: "/saved", exact: true },
  { icon: User, label: "Account", path: "/dashboard", exact: false },
];

const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ icon: Icon, label, path, exact }) => {
          const isActive = exact
            ? pathname === path
            : pathname === path || pathname.startsWith(path + "/");
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
