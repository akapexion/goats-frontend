import { useEffect, useState } from "react"
import PageContainer from "@/components/PageContainer"
import api from "@/lib/axios"
import toast from "react-hot-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Store, CheckCircle, ShoppingBag, Package } from "lucide-react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { getProductImageUrl, getCategoryFallback } from "@/lib/imageUtils"

export default function CustomerFarmers({ embedded = false }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [farmers, setFarmers] = useState([])
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMarket, setSelectedMarket] = useState(searchParams.get("market_id") || "")

  const load = (params = {}) => {
    setLoading(true)
    api
      .get("/farmers", { params })
      .then(({ data }) => setFarmers(data.data?.data || data.data || []))
      .catch(() => toast.error("Failed to load farmers"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const marketId = searchParams.get("market_id") || ""
    setSelectedMarket(marketId)
    load(marketId ? { market_id: marketId } : {})
    api
      .get("/markets")
      .then(({ data }) => setMarkets(data.data?.data || data.data || []))
      .catch(() => {})
  }, [])

  const handleMarketChange = (id) => {
    setSelectedMarket(id)
    load({ market_id: id || undefined })
  }

  return (
    <PageContainer embedded={embedded}>
      <div className="space-y-8">
        {!embedded && (
          <div
            className="relative rounded-2xl p-8 text-center text-white shadow-lg"
            style={{
              backgroundImage: 'url("/banner.jpg")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/80"></div>
            <div className="relative z-10 space-y-4">
              <span className="inline-block px-3 py-1 bg-white/15 border border-white/20 text-white rounded-full text-[11px] font-bold tracking-wider uppercase">
                CERTIFIED GROWERS & ARTISANS
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                Local Market Farmers
              </h1>
              <p className="text-sm md:text-base text-emerald-100 max-w-2xl mx-auto leading-relaxed">
                Connect with trusted local producers, inspect stall schedules,
                and reserve directly from their weekly stock.
              </p>
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/30 rounded-lg px-4 py-2 text-xs font-semibold">
                  <span>Filter by Market:</span>
                  <select
                    value={selectedMarket}
                    onChange={(e) => handleMarketChange(e.target.value)}
                    className="bg-white text-black border rounded px-3 py-1 font-medium focus:outline-none"
                  >
                    <option value="">All Verified Markets</option>
                    {markets.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4">
          <div>
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
              PRODUCERS DIRECTORY
            </span>
            <h2 className="text-xl font-extrabold text-foreground">
              All Verified Farmers
            </h2>
          </div>
          <Badge
            variant="secondary"
            className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-3 py-1 text-xs font-bold rounded-full"
          >
            {farmers.length} Farmers Registered
          </Badge>
        </div>

        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : farmers.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border text-muted-foreground">
            <Store className="size-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">
              No farmers registered in this market criteria yet.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {farmers.map((f) => {
              const harvestProducts = f.products || []
              return (
                <div
                  key={f.id}
                  className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-6"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xl border border-emerald-200 dark:border-emerald-800 shrink-0">
                        <Store className="size-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3
                            className="text-xl font-bold text-foreground hover:text-emerald-600 transition-colors cursor-pointer"
                            onClick={() => navigate(`/farmers/${f.id}`)}
                          >
                            {f.stall_name}
                          </h3>
                          <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 text-[10px] font-bold gap-1">
                            <CheckCircle className="size-3 text-emerald-600" />{" "}
                            Verified Producer
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                          Contact Person:{" "}
                          <span className="text-foreground font-semibold">
                            {f.user?.name || "Farm Owner"}
                          </span>{" "}
                          • Phone:{" "}
                          <span className="text-foreground font-semibold">
                            {f.user?.phone || "0300 0000000"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <Link to={`/farmers/${f.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-semibold gap-1.5 rounded-lg"
                      >
                        <MapPin className="size-3.5 text-emerald-600" /> Stall
                        Location
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-y py-4 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                        MARKET BASE
                      </span>
                      <p className="font-bold text-foreground text-sm">
                        {f.market?.name || "Local Farmers Market"}
                      </p>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        {f.address || f.market?.address || "Stall Location, Community Market"}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                        OPERATING DAYS & PICKUP
                      </span>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {f.operating_days || "Saturday, Sunday"}
                      </p>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        {f.pickup_start_time && f.pickup_end_time
                          ? `${f.pickup_start_time} - ${f.pickup_end_time}`
                          : "08:00 AM - 02:00 PM"}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                        PRE-ORDER CUTOFF
                      </span>
                      <p className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                        {f.cutoff_hours
                          ? `${f.cutoff_hours} hours before pickup`
                          : "12 hours before pickup"}
                      </p>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        Orders lock for harvest preparation
                      </p>
                    </div>
                  </div>

                  {f.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      "{f.description}"
                    </p>
                  )}

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <ShoppingBag className="size-4 text-emerald-600" />
                      <span>
                        Available Harvest Stock ({harvestProducts.length} Items)
                      </span>
                    </div>

                    {harvestProducts.length === 0 ? (
                      <div className="p-4 bg-muted/40 rounded-xl text-center text-xs text-muted-foreground">
                        No active harvest products listed right now. Check back
                        soon for weekly stock updates.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {harvestProducts.map((p) => (
                          <div
                            key={p.id}
                            className="bg-card border rounded-xl overflow-hidden flex flex-col justify-between hover:border-emerald-500 transition-colors shadow-xs"
                          >
                            <div className="relative h-28 bg-accent/40 overflow-hidden">
                              <img
                                src={getProductImageUrl(p.image_path) || getCategoryFallback(p.category?.name)}
                                alt={p.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = getCategoryFallback(p.category?.name)
                                }}
                              />
                            </div>
                            <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                              <div>
                                <h4 className="text-xs font-bold text-foreground line-clamp-1">
                                  {p.name}
                                </h4>
                                <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                                  Rs. {Number(p.price).toFixed(2)}{" "}
                                  <span className="text-[10px] font-normal text-muted-foreground">
                                    / {p.unit || "unit"}
                                  </span>
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  Stock: {p.stock_quantity} {p.unit || "units"}
                                </p>
                              </div>
                              <Link to={`/products`}>
                                <Button
                                  size="sm"
                                  className="w-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white h-7 rounded-lg"
                                >
                                  Pre-Order
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
