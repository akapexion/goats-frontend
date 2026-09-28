import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sun, Moon, Heart, ShoppingBag, Package, LogOut } from "lucide-react"

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo-main.png" alt="MarketLink Logo" className="h-6" />
        </Link>

        <nav className="hidden md:flex items-center gap-1 bg-muted/60 dark:bg-muted/30 p-1.5 rounded-full border text-xs font-medium">
          {[
            { path: "/", label: "Home" },
            { path: "/markets", label: "Markets" },
            { path: "/products", label: "Products" },
            { path: "/farmers", label: "Farmers" },
            { path: "/about", label: "About" },
            { path: "/features", label: "Features" },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-1.5 rounded-full transition-all ${
                isActive(item.path)
                  ? "bg-background text-foreground font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to={user ? "/customer/favorites" : "/products"}
            className="relative p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Wishlist"
          >
            <Heart className="size-5" />
            <span className="absolute -top-1 -right-1 size-4 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center">
              0
            </span>
          </Link>

          <Link
            to="/products"
            className="relative p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Cart"
          >
            <ShoppingBag className="size-5" />
            <span className="absolute -top-1 -right-1 size-4 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center">
              0
            </span>
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>

          {user ? (
            user.role === 'customer' ? (
              <div className="flex items-center gap-2">
                <Link to="/customer/orders">
                  <Button size="sm" variant="outline" className="rounded-full font-semibold text-xs border-emerald-600/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950">
                    <Package className="size-3.5 mr-1" /> My Pre-Orders
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={logout}
                  className="rounded-full text-xs text-muted-foreground hover:text-foreground p-2"
                  title="Log out"
                >
                  <LogOut className="size-4" />
                </Button>
              </div>
            ) : (
              <Link to={`/${user.role}/dashboard`}>
                <Button size="sm" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  Dashboard <ArrowRight className="size-4 ml-1" />
                </Button>
              </Link>
            )
          ) : (
            <Link to="/login">
              <Button size="sm" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm px-5">
                Login / Sign Up
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
