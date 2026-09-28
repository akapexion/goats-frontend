import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import PageContainer from "@/components/PageContainer"
import LoginRequiredModal from "@/components/LoginRequiredModal"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/axios"
import toast from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Store, MapPin, Calendar, Clock, Navigation, Heart, Leaf, Package, ArrowLeft, Star } from "lucide-react"

export default function MarketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [market, setMarket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [favoriteId, setFavoriteId] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const loadMarket = () => {
    setLoading(true)
    api.get(`/markets/${id}`)
      .then(({ data }) => setMarket(data.data))
      .catch(() => toast.error("Failed to load market details"))
      .finally(() => setLoading(false))
  }

  const checkFavorite = () => {
    if (!user) return
    api.get("/customer/favorites/check", {
      params: { favoritable_type: "market", favoritable_id: id }
    }).then(({ data }) => {
      setIsSaved(data.is_favorited)
      setFavoriteId(data.favorite_id)
    }).catch(() => {})
  }

  useEffect(() => {
    loadMarket()
    checkFavorite()
  }, [id, user])

  const handleToggleSave = async () => {
    if (!user) {
      setShowLoginModal(true)
      return
    }

    try {
      if (isSaved && favoriteId) {
        await api.delete(`/customer/favorites/${favoriteId}`)
        toast.success("Market removed from saved locations")
        setIsSaved(false)
        setFavoriteId(null)
      } else {
        const { data } = await api.post("/customer/favorites", {
          favoritable_type: "market",
          favoritable_id: Number(id),
        })
        toast.success("Market saved to your account!")
        setIsSaved(true)
        setFavoriteId(data.data?.id || data.favorite_id)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save market")
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </PageContainer>
    )
  }

  if (!market) {
    return (
      <PageContainer>
        <div className="text-center py-16">
          <Store className="size-16 mx-auto mb-4 opacity-30 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Market Not Found</h2>
          <p className="text-muted-foreground mt-2">The market you are looking for does not exist or has been removed.</p>
          <Button onClick={() => navigate("/markets")} className="mt-4">
            <ArrowLeft className="size-4 mr-2" /> Back to Markets
          </Button>
        </div>
      </PageContainer>
    )
  }

  const lat = market.latitude || 37.7749
  const lon = market.longitude || -122.4194
  const bbox = `${lon - 0.015},${lat - 0.015},${lon + 0.015},${lat + 0.015}`
  const farmers = market.farmers || []

  return (
    <PageContainer>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4 mr-1.5" /> Back
          </Button>
          <Badge variant={market.is_active ? "default" : "secondary"}>
            {market.is_active ? "Active Market" : "Inactive"}
          </Badge>
        </div>

        {/* Market Overview Hero Card */}
        <Card className="backdrop-blur-md bg-card/90 border shadow-lg overflow-hidden">
          <CardHeader className="border-b bg-muted/20 pb-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Store className="size-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">{market.name}</CardTitle>
                    {market.city && <CardDescription className="text-sm font-medium">{market.city}</CardDescription>}
                  </div>
                </div>
                {market.address && (
                  <p className="flex items-start gap-2 text-sm text-muted-foreground pt-1">
                    <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                    {market.address}
                  </p>
                )}
                {market.open_days && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="size-4 text-amber-500 shrink-0" />
                    <span>Operating Days: <strong className="text-foreground">{market.open_days}</strong></span>
                    {market.open_time && (
                      <span className="flex items-center gap-1 ml-2">
                        <Clock className="size-3.5 text-blue-500" /> {market.open_time} – {market.close_time}
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                <Button
                  variant={isSaved ? "default" : "outline"}
                  onClick={handleToggleSave}
                  className="shadow-sm"
                >
                  <Heart className={`size-4 mr-2 ${isSaved ? "fill-white" : "text-rose-500"}`} />
                  {isSaved ? "Saved Location" : "Save Market Location"}
                </Button>
                <a
                  href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=;${lat}%2C${lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">
                    <Navigation className="size-4 mr-2 text-blue-500" /> Get Directions
                  </Button>
                </a>
              </div>
            </div>
          </CardHeader>

          {/* Map Preview */}
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <MapPin className="size-4 text-primary" /> Interactive Market Location & Directions
            </h3>
            <div className="relative rounded-xl overflow-hidden border h-64 bg-accent/40 shadow-inner">
              <iframe
                title={`Map for ${market.name}`}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`}
                className="w-full h-full filter saturate-[0.9]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Associated Farmers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Leaf className="size-5 text-emerald-600 dark:text-emerald-400" /> Nearby Associated Farmers ({farmers.length})
            </h2>
          </div>

          {farmers.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <p>No farmers currently assigned to this market.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {farmers.map((farmer) => (
                <Card
                  key={farmer.id}
                  className="backdrop-blur-md bg-card/80 border shadow-md hover:-translate-y-1 hover:border-primary hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base font-bold">{farmer.stall_name}</CardTitle>
                        <CardDescription className="text-xs">{farmer.user?.name}</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {farmer.products?.length || 0} Products
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {farmer.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{farmer.description}</p>
                    )}
                    {farmer.operating_days && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Clock className="size-3.5 text-blue-500" /> Days: {farmer.operating_days}
                      </p>
                    )}
                  </CardContent>

                  <div className="p-6 pt-0">
                    <Link to={`/farmers/${farmer.id}`}>
                      <Button size="sm" className="w-full text-xs">
                        View Farmer Profile & Products
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Login Required to Save Location"
        message="Please log in to save your favorite market locations to your account for quick access."
      />
    </PageContainer>
  )
}
