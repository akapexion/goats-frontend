import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sun, Moon, Heart, ShoppingBag } from "lucide-react"

export default function Navbar() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          {theme === "dark" ? (
            <img src="/logo-white.png" alt="MarketLink Logo" className="h-9 w-auto object-contain" />
          ) : (
            <img src="/logo.png" alt="MarketLink Logo" className="h-9 w-auto object-contain" />
          )}
        </Link>

        {/* Center Pill Nav Bar matching references */}
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
          {/* Wishlist Icon */}
          <Link
            to={user ? "/customer/dashboard" : "/login"}
            className="relative p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Wishlist"
          >
            <Heart className="size-5" />
            <span className="absolute -top-1 -right-1 size-4 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center">
              0
            </span>
          </Link>

          {/* Cart Icon */}
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
            <Link to={`/${user.role}/dashboard`}>
              <Button size="sm" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Dashboard <ArrowRight className="size-4 ml-1" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button size="sm" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm px-5">
                  Login
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
