import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import { AOSInit } from "@/components/AOS";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Store,
  Tag,
  LogOut,
  Menu,
  X,
  Star,
  UserCircle,
  BarChart2,
  Heart,
  Leaf,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const navItems = {
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Farmers", href: "/admin/farmers", icon: Leaf },
    { label: "Markets", href: "/admin/markets", icon: Store },
    { label: "Categories", href: "/admin/categories", icon: Tag },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Reviews", href: "/admin/reviews", icon: Star },
    { label: "Reports", href: "/admin/reports", icon: BarChart2 },
  ],
  farmer: [
    { label: "Dashboard", href: "/farmer/dashboard", icon: LayoutDashboard },
    { label: "Profile", href: "/farmer/profile", icon: UserCircle },
    { label: "Products", href: "/farmer/products", icon: Package },
    { label: "Orders", href: "/farmer/orders", icon: ShoppingCart },
    { label: "Reviews", href: "/farmer/reviews", icon: Star },
  ],
  customer: [
    { label: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
    { label: "Products", href: "/customer/products", icon: Package },
    { label: "Farmers", href: "/customer/farmers", icon: Leaf },
    { label: "Markets", href: "/customer/markets", icon: Store },
    { label: "My Orders", href: "/customer/orders", icon: ShoppingCart },
    { label: "Favorites", href: "/customer/favorites", icon: Heart },
  ],
};

function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initial = user?.name?.charAt(0).toUpperCase() || "?";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-accent/60 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <div className="size-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-sm shrink-0">
          {initial}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-sm font-semibold text-foreground leading-tight max-w-[140px] truncate">
            {user?.name}
          </span>
          <span className="text-xs text-muted-foreground capitalize leading-tight">
            {user?.role}
          </span>
        </div>
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 rounded-xl border bg-popover shadow-lg py-1 z-50">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
            <span className="mt-1 inline-block text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize font-medium">
              {user?.role}
            </span>
          </div>

          {user?.role === "farmer" && (
            <Link
              to="/farmer/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent transition-colors"
            >
              <UserCircle className="size-4" />
              My Profile
            </Link>
          )}

          <div className="border-t mt-1 pt-1">
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 bg-red-500/10 transition-colors rounded-b-xl cursor-pointer"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = navItems[user?.role] || [];

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully");
    navigate("/login");
  };

  const isActive = (href) => location.pathname === href;

  return (
    <div className="min-h-screen bg-background flex w-full max-w-full overflow-x-hidden">
      <AOSInit />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r flex flex-col transform transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="h-16 flex items-center justify-center px-5 border-b shrink-0">
          <Link to="/">
            <div className="flex justify-center">
               <div> 
                  <img src="/logo-main.png" alt="MarketLink Logo" className="h-8" />
                </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {items.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0 max-w-full overflow-x-hidden">
        <header className="h-16 border-b bg-card/50 backdrop-blur flex items-center gap-4 px-6 sticky top-0 z-30 w-full max-w-full">
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>

          <div className="flex-1" />

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {theme === "dark" ? (
              <Sun className="size-5" />
            ) : (
              <Moon className="size-5" />
            )}
          </button>

          <ProfileDropdown user={user} onLogout={handleLogout} />
        </header>

        <main key={location.pathname} className="flex-1 p-6 animate-fade-in min-w-0 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
