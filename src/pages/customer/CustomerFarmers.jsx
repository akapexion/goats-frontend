import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, MapPin, Clock, Star } from 'lucide-react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'

export default function CustomerFarmers() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [farmers, setFarmers] = useState([])
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedMarket, setSelectedMarket] = useState(searchParams.get('market_id') || '')

  const load = (params = {}) => {
    setLoading(true)
    api.get('/farmers', { params })
      .then(({ data }) => setFarmers(data.data?.data || data.data || []))
      .catch(() => toast.error('Failed to load farmers'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const marketId = searchParams.get('market_id') || ''
    setSelectedMarket(marketId)
    load(marketId ? { market_id: marketId } : {})
    api.get('/markets')
      .then(({ data }) => setMarkets(data.data?.data || data.data || []))
      .catch(() => {})
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    load({ search, market_id: selectedMarket || undefined })
  }

  const handleMarketChange = (id) => {
    setSelectedMarket(id)
    load({ search, market_id: id || undefined })
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Find Farmers</h1>
          <p className="text-muted-foreground">Browse local farmers and their stalls</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <Input
              placeholder="Search farmers by stall name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="submit" variant="outline" size="icon">
              <Search className="size-4" />
            </Button>
          </form>
          <select
            value={selectedMarket}
            onChange={(e) => handleMarketChange(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All Markets</option>
            {markets.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}><CardContent className="pt-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : farmers.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="size-12 mx-auto mb-3 opacity-30" />
            <p>No farmers found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {farmers.map((f) => (
              <Card
                key={f.id}
                data-aos="fade-up"
                onClick={() => navigate(`/customer/farmers/${f.id}`)}
                className="backdrop-blur-md bg-card/80 border shadow-md hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/10 cursor-pointer transition-all duration-300 active:scale-[0.98]"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{f.stall_name}</CardTitle>
                  <CardDescription className="text-xs">
                    {f.user?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {f.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{f.description}</p>
                  )}
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {f.market && (
                      <p className="flex items-center gap-1">
                        <MapPin className="size-3" /> {f.market.name}
                      </p>
                    )}
                    {f.operating_days && (
                      <p className="flex items-center gap-1">
                        <Clock className="size-3" /> {f.operating_days}
                        {f.pickup_start_time && ` · ${f.pickup_start_time}–${f.pickup_end_time}`}
                      </p>
                    )}
                  </div>
                  <Link to={`/customer/farmers/${f.id}`}>
                    <Button size="sm" className="w-full">View Stall</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
