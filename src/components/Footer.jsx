import { Link } from "react-router-dom"
import { useTheme } from "@/context/ThemeContext"

export default function Footer() {
  const { theme } = useTheme()

  return (
    <footer className="border-t bg-card mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <Link to="/">
              {theme === "dark" ? (
                <img src="/logo-white.png" alt="MarketLink Logo" className="h-10 w-auto object-contain" />
              ) : (
                <img src="/logo.png" alt="MarketLink Logo" className="h-10 w-auto object-contain" />
              )}
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Empowering local agricultural ecosystems by connecting regional farmers with local consumers for seamless pre-order pickup.
            </p>
            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium">
              <span className="size-2 rounded-full bg-green-500 animate-pulse" />
              All Systems Operational
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">
                  Home Page
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-foreground transition-colors">
                  Features Overview
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-foreground transition-colors">
                  How It Works & About
                </Link>
              </li>
              <li>
                <Link to="/customer/products" className="hover:text-foreground transition-colors">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link to="/customer/farmers" className="hover:text-foreground transition-colors">
                  Find Local Farmers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Portals</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link to="/login" className="hover:text-foreground transition-colors">
                  Customer Login
                </Link>
              </li>
              <li>
                <Link to="/register?role=farmer" className="hover:text-foreground transition-colors">
                  Farmer Registration
                </Link>
              </li>
              <li>
                <Link to="/farmer/dashboard" className="hover:text-foreground transition-colors">
                  Farmer Portal
                </Link>
              </li>
              <li>
                <Link to="/admin/dashboard" className="hover:text-foreground transition-colors">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Legal & Contact</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Support Center
                </a>
              </li>
              <li>
                <a href="mailto:support@marketlink.local" className="hover:text-foreground transition-colors">
                  support@marketlink.local
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} MarketLink Inc. All rights reserved.</p>
          <p className="text-center sm:text-right">Connecting fresh local produce to your community.</p>
        </div>
      </div>
    </footer>
  )
}
