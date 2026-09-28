import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import PublicLayout from "@/components/PublicLayout"
import api from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ArrowRight,
  Leaf,
  ShoppingCart,
  MapPin,
  Search,
  Package,
  ArrowUpRight
} from "lucide-react"
import CustomerProducts from "./customer/CustomerProducts"
import CustomerMarkets from "./customer/CustomerMarkets"

export default function LandingPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [dbCategories, setDbCategories] = useState([])

  useEffect(() => {
    api.get('/categories')
      .then(({ data }) => setDbCategories(data.data || []))
      .catch(() => {})
  }, [])

  const handleCategoryClick = (catName) => {
    const found = dbCategories.find(c => c.name.toLowerCase() === catName.toLowerCase())
    if (found) {
      navigate(`/categories/${found.id}`)
    } else {
      navigate(`/categories/${encodeURIComponent(catName.toLowerCase().replace(/\s+/g, '-'))}`)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleTagClick = (tag) => {
    navigate(`/products?search=${encodeURIComponent(tag)}`)
  }

  const stats = [
    { value: "4+", label: "HAPPY COMMUNITIES" },
    { value: "4", label: "FARMERS MARKETS" },
    { value: "13+", label: "PRODUCERS & FARMERS" },
    { value: "100%", label: "FRESH HARVEST CUT" },
  ]

  const categories = [
    { name: "Vegetables", count: "5 Products Listed", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80" },
    { name: "Fresh Fruits", count: "3 Products Listed", image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80" },
    { name: "Dairy & Eggs", count: "2 Products Listed", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80" },
    { name: "Fresh Herbs", count: "3 Products Listed", image: "https://images.unsplash.com/photo-1515586000433-45406d8e6662?auto=format&fit=crop&w=600&q=80" },
    { name: "Grains & Bakery", count: "1 Product Listed", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80" },
    { name: "Honey & Preserves", count: "1 Product Listed", image: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=600&q=80" },
  ]

  return (
    <PublicLayout>
      <section className="relative min-h-[580px] flex items-center justify-center overflow-hidden px-4 text-center">
        <img
          src="/banner.jpg"
          alt="Fresh produce hero banner"
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.4] dark:brightness-[0.3]"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1600&q=80"
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-black/60" />

        <div className="relative z-10 max-w-4xl mx-auto py-16 text-white animate-fade-in space-y-6">
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur text-emerald-300 border border-white/25 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide">
              <Leaf className="size-3.5 text-emerald-400" />
              eGreen Basket • Fresh Farmers Market Direct
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
            Fresh Finds. Local Farmers.
            <br />
            <span className="text-emerald-400">Better Living.</span>
          </h1>

          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed font-normal drop-shadow">
            Discover local farmers markets, reserve fresh weekly harvests for pickup, and support your local farm community.
          </p>

          <div className="max-w-2xl mx-auto pt-2 space-y-3">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 bg-white/10 backdrop-blur p-2 rounded-2xl border border-white/30 shadow-2xl">
              <div className="relative flex-1">
                <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by product, farmer, or market name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white text-foreground pl-10 h-11 text-xs rounded-xl border-0 focus-visible:ring-emerald-500"
                />
              </div>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-11 px-8 rounded-xl shadow-md shrink-0">
                Search
              </Button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-white/80">
              <span className="text-[11px] font-semibold text-white/70">Popular:</span>
              <button onClick={() => handleTagClick("Vegetable")} className="bg-white/15 hover:bg-white/25 text-white px-3 py-1 rounded-full text-[11px] font-medium border border-white/20 transition-colors">
                Vegetable Markets
              </button>
              <button onClick={() => handleTagClick("Tomato")} className="bg-white/15 hover:bg-white/25 text-white px-3 py-1 rounded-full text-[11px] font-medium border border-white/20 transition-colors">
                Fresh Tomatoes
              </button>
              <button onClick={() => handleTagClick("Bakery")} className="bg-white/15 hover:bg-white/25 text-white px-3 py-1 rounded-full text-[11px] font-medium border border-white/20 transition-colors">
                Local Bakeries
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 -mt-10 relative z-20">
        <div className="bg-card border rounded-2xl p-6 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center backdrop-blur-md">
          {stats.map((s, idx) => (
            <div key={idx} className="space-y-1 border-r last:border-r-0 border-border/60 pr-2">
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">{s.value}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">WHY CHOOSE US</span>
          <h2 className="text-3xl font-extrabold text-foreground">Everything fresh, right around you.</h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Direct buying from small-scale growers keeps local produce affordable, fresh, and sustainable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card border rounded-2xl p-6 space-y-4 hover:border-emerald-500 hover:shadow-lg transition-all group">
            <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <MapPin className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Find Nearby Markets</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Explore weekend market stalls near you, operating hours, and turn-by-turn map directions.
            </p>
            <Link to="/markets" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
              Explore markets <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="bg-card border rounded-2xl p-6 space-y-4 hover:border-emerald-500 hover:shadow-lg transition-all group">
            <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShoppingCart className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Choose Fresh Produce</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Select from leafy greens, heirloom tomatoes, raw honey, organic dairy, and artisanal baked goods.
            </p>
            <Link to="/products" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
              Browse produce <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="bg-card border rounded-2xl p-6 space-y-4 hover:border-emerald-500 hover:shadow-lg transition-all group">
            <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Package className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Reserve for Pickup</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Reserve your items without upfront payment. Pick up directly at the market stall on harvest day.
            </p>
            <Link to="/products" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
              No-hassle ordering <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/30 border-y">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-foreground">Explore Fresh Categories</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              All items harvested fresh and sorted by category for quick browsing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer shadow-md border hover:shadow-xl transition-all"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-[0.65]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 flex flex-col justify-end text-white">
                  <h3 className="text-lg font-extrabold tracking-tight">{cat.name}</h3>
                  <p className="text-xs text-white/80 mt-0.5">{cat.count}</p>
                  <div className="absolute top-4 right-4 size-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="size-4 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block">WEEKLY HARVEST</span>
            <h2 className="text-3xl font-extrabold text-foreground">Featured Produce This Week</h2>
          </div>
          <Link to="/products" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            View All Products <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <CustomerProducts embedded={true} />
      </section>

      <section className="py-20 px-4 max-w-6xl mx-auto bg-muted/20 border-y space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block">LOCAL LOCATIONS</span>
          <h2 className="text-3xl font-extrabold text-foreground">Regional Farmers Markets</h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Pick up your produce at these verified market locations. Reserve in advance and collect from your favorite farmers.
          </p>
        </div>

        <CustomerMarkets embedded={true} />
      </section>

      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-700 rounded-3xl p-10 md:p-14 text-center text-white shadow-2xl space-y-6">
          <span className="inline-block px-3.5 py-1 bg-white/15 border border-white/20 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-200">
            FARMER REGISTRATION OPEN
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Are you a local farmer or artisanal producer?
          </h2>
          <p className="text-sm sm:text-base text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            Join MarketLink to list your weekly harvest, receive pre-orders before market day, and connect directly with local community buyers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/register?role=farmer">
              <Button size="lg" className="bg-white hover:bg-slate-100 text-emerald-900 font-bold px-8 shadow-lg rounded-xl text-xs">
                Register as Farmer
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="border-white/40 text-white bg-white/10 hover:bg-white/20 backdrop-blur font-bold px-8 rounded-xl text-xs">
                Learn How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
