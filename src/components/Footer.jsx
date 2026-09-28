import { Link } from "react-router-dom"
import { useTheme } from "@/context/ThemeContext"
import { Facebook, Instagram, Twitter, Sparkles, Send } from "lucide-react"

export default function Footer() {
  const { theme } = useTheme()

  return (
    <footer className="bg-[#0B132B] text-slate-200 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Bio */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span className="size-3 rounded-full bg-emerald-500 inline-block" />
                  MarketLink
                </span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
                  eGreen Basket
                </span>
              </div>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Farm fresh, just a click away. Direct connection between local farmers and communities under the eGreen Basket initiative.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="size-8 rounded-full bg-slate-800/80 hover:bg-emerald-600 hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                <Facebook className="size-4" />
              </a>
              <a href="#" className="size-8 rounded-full bg-slate-800/80 hover:bg-emerald-600 hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                <Instagram className="size-4" />
              </a>
              <a href="#" className="size-8 rounded-full bg-slate-800/80 hover:bg-emerald-600 hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                <Twitter className="size-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4 tracking-wide">Navigation</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
              <li><Link to="/markets" className="hover:text-emerald-400 transition-colors">Farmers Markets</Link></li>
              <li><Link to="/products" className="hover:text-emerald-400 transition-colors">Fresh Produce</Link></li>
              <li><Link to="/farmers" className="hover:text-emerald-400 transition-colors">Registered Farmers</Link></li>
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About eGreen Basket</Link></li>
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* User Portals */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4 tracking-wide">User Portals</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Customer / Farmer Login</Link></li>
              <li><Link to="/register?role=farmer" className="hover:text-emerald-400 transition-colors">Register as Farmer</Link></li>
              <li><Link to="/register?role=customer" className="hover:text-emerald-400 transition-colors">Register as Customer</Link></li>
            </ul>
          </div>

          {/* Stay Connected */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4 tracking-wide">Stay Connected</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Get notified about upcoming weekend harvest schedules and seasonal produce deals.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors shrink-0 flex items-center gap-1"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom copyright & floating AI button bar */}
        <div className="border-t border-slate-800/80 pt-6 text-[11px] text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} MarketLink (eGreen Basket). All rights reserved.</p>
          <div className="flex items-center gap-6 text-slate-400 text-[11px]">
            <a href="#" className="hover:text-slate-200">SRS Architecture</a>
            <a href="#" className="hover:text-slate-200">Stall Pickup Policy</a>
            <div className="inline-flex items-center gap-1.5 bg-emerald-600 text-white font-semibold px-3 py-1.5 rounded-full shadow-lg cursor-pointer hover:bg-emerald-500 transition-colors">
              <Sparkles className="size-3.5" />
              Ask MarketLink AI
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
