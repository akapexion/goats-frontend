import { useEffect, useState, useRef } from "react"
import PageContainer from "@/components/PageContainer"
import api from "@/lib/axios"
import toast from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Store, MapPin, Clock, Search, Filter, Users, Navigation } from "lucide-react"
import { useNavigate } from "react-router-dom"
import MarketsDiscoveryMap from "@/components/MarketsDiscoveryMap"

export default function CustomerMarkets({ embedded = false }) {
  const navigate = useNavigate()
  const mapSectionRef = useRef(null)
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedMarketId, setSelectedMarketId] = useState(null)

  const load = () => {
    setLoading(true)
    const params = {}
    if (search) params.search = search
    if (selectedCity) params.city = selectedCity
    api
      .get("/markets", { params })
      .then(({ data }) => setMarkets(data.data?.data || data.data || []))
      .catch(() => toast.error("Failed to load markets"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [search, selectedCity])

  const cities = ["Karachi", "Lahore", "Islamabad", "Faisalabad", "Peshawar", "Quetta"]

  const filteredMarkets = markets.filter((m) => {
    if (!selectedCity) return true
    return (
      m.city?.toLowerCase().includes(selectedCity.toLowerCase()) ||
      m.address?.toLowerCase().includes(selectedCity.toLowerCase())
    )
  })

  return (
    <PageContainer embedded={embedded}>
      <div className="space-y-8">
        {!embedded && (
          <div
            className="relative rounded-2xl p-8 text-center text-white shadow-lg overflow-hidden"
            style={{
              backgroundImage: 'url("/banner.jpg")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/80"></div>
            <div className="relative z-10 space-y-4">
              <span className="inline-block px-3 py-1 bg-white/15 border border-white/20 text-white rounded-full text-[11px] font-bold tracking-wider uppercase">
                REGIONAL LOCATIONS
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                Explore Local Farmers Markets
              </h1>
              <p className="text-sm md:text-base text-emerald-100 max-w-2xl mx-auto leading-relaxed">
                Discover verified weekend agro markets near you, find
                participating farmers, and plan your fresh pickup trip.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  load()
                }}
                className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-2 pt-2"
              >
                <div className="relative flex-1">
                  <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search by market name or area..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-white text-foreground pl-9 text-xs rounded-xl h-10 border-0 shadow-sm"
                  />
                </div>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-white text-black text-xs rounded-xl h-10 px-3 font-semibold border-0 shadow-sm focus:outline-none"
                >
                  <option value="">All Cities</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <Button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs h-10 px-6 rounded-xl shadow-md gap-1"
                >
                  <Filter className="size-3.5" />
                  Filter
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Interactive OpenStreetMap Discovery */}
        <div ref={mapSectionRef} className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <MapPin className="size-5 text-emerald-600" />
                Interactive OpenStreetMap Discovery
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click any marker to view market address, operating days, and meet participating farmers.
              </p>
            </div>
            <Badge
              variant="secondary"
              className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-full px-3 py-1"
            >
              {filteredMarkets.length} Markets Located
            </Badge>
          </div>

          <MarketsDiscoveryMap
            markets={filteredMarkets}
            selectedMarketId={selectedMarketId}
            onMarketSelect={(m) => setSelectedMarketId(m.id)}
          />
        </div>

        {/* All Registered Markets Grid */}
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-xl font-extrabold text-foreground">
              All Registered Markets
            </h2>
            <span className="text-xs font-semibold text-muted-foreground">
              Showing {filteredMarkets.length} locations
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-56 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredMarkets.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border text-muted-foreground">
              <Store className="size-12 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">
                No markets registered matching your search filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMarkets.map((m) => {
                const farmersCount = m.farmers_count ?? (m.farmers?.length || 1)
                const isSelected = selectedMarketId === m.id
                return (
                  <Card
                    key={m.id}
                    className={`bg-card border rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden ${
                      isSelected ? "ring-2 ring-emerald-500 border-emerald-500" : ""
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 text-[10px] font-bold gap-1 px-2.5 py-0.5 rounded-full"
                        >
                          <MapPin className="size-3 text-emerald-600" />{" "}
                          {m.city || "Karachi"}
                        </Badge>
                        <Badge className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-full">
                          Open Season
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-bold text-foreground">
                        {m.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {m.address || "Central Community Ground, City Area"}
                      </p>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-0">
                      <div className="bg-muted/40 rounded-xl p-3 space-y-1 text-xs">
                        <div className="flex items-center gap-2 text-foreground font-semibold">
                          <Clock className="size-3.5 text-emerald-600" />
                          <span>
                            Operating Days:{" "}
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">
                              {m.open_days || "Saturday, Sunday"}
                            </span>
                          </span>
                        </div>
                        <div className="text-muted-foreground text-[11px] pl-5">
                          Hours:{" "}
                          {m.open_time && m.close_time
                            ? `${m.open_time} - ${m.close_time}`
                            : "08:00 AM - 02:00 PM"}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          onClick={() => navigate(`/farmers?market_id=${m.id}`)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl gap-1.5 shadow-sm"
                        >
                          <Users className="size-3.5" /> View Farmers ({farmersCount})
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-9 rounded-xl shrink-0 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950"
                          title="Focus marker on interactive map"
                          onClick={() => {
                            setSelectedMarketId(m.id)
                            mapSectionRef.current?.scrollIntoView({ behavior: "smooth" })
                          }}
                        >
                          <Navigation className="size-4 text-emerald-600" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
