import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sun, Moon } from "lucide-react"

export default function Navbar() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          {theme === "dark" ? (
            <img src="/logo-white.png" alt="MarketLink Logo" className="h-10 w-auto object-contain" />
          ) : (
            <img src="/logo.png" alt="MarketLink Logo" className="h-10 w-auto object-contain" />
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            to="/"
            className={`transition-colors ${
              isActive("/")
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Home
          </Link>
          <Link
            to="/features"
            className={`transition-colors ${
              isActive("/features")
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Features
          </Link>
          <Link
            to="/about"
            className={`transition-colors ${
              isActive("/about")
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            About & How It Works
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>
          {user ? (
            <Link to={`/${user.role}/dashboard`}>
              <Button>
                Go to Dashboard <ArrowRight className="size-4 ml-1" />
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
