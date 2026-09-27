import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Store, MapPin, Clock, Search, Leaf, Navigation, Calendar } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

export default function CustomerMarkets() {
  const navigate = useNavigate()
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedDay, setSelectedDay] = useState('')

  const load = () => {
    setLoading(true)
    const params = {}
    if (search) params.search = search
    api.get('/markets', { params })
      .then(({ data }) => setMarkets(data.data?.data || data.data || []))
      .catch(() => toast.error('Failed to load markets'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search])

  const daysList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const filteredMarkets = markets.filter((m) => {
    if (!selectedDay) return true
    return m.open_days?.toLowerCase().includes(selectedDay.toLowerCase())
  })

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Farmers Markets & Locations</h1>
          <p className="text-muted-foreground">Browse nearby markets by location or operating days, and explore embedded pickup maps.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <div className="relative flex-1">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search market name or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm font-medium"
          >
            <option value="">All Operating Days</option>
            {daysList.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}><CardContent className="pt-6"><Skeleton className="h-60 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Store className="size-12 mx-auto mb-3 opacity-30" />
            <p>No markets match your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMarkets.map((m) => {
              const lat = m.latitude || 37.7749
              const lon = m.longitude || -122.4194
              const bbox = `${lon - 0.015},${lat - 0.015},${lon + 0.015},${lat + 0.015}`

              return (
                <Card
                  key={m.id}
                  data-aos="fade-up"
                  className="backdrop-blur-md bg-card/80 border shadow-md hover:-translate-y-1 hover:border-primary hover:shadow-xl hover:shadow-primary/10 flex flex-col justify-between overflow-hidden transition-all duration-300"
                >
                  <div>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-base font-bold">{m.name}</CardTitle>
                          {m.city && <CardDescription className="text-xs">{m.city}</CardDescription>}
                        </div>
                        <Badge variant={m.is_active ? 'default' : 'secondary'}>
                          {m.is_active ? 'Active Market' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        {m.address && (
                          <p className="flex items-start gap-1.5 font-medium text-foreground/80">
                            <MapPin className="size-3.5 shrink-0 mt-0.5 text-primary" />
                            {m.address}
                          </p>
                        )}
                        {m.open_days && (
                          <p className="flex items-center gap-1.5">
                            <Calendar className="size-3.5 shrink-0 text-amber-500" />
                            {m.open_days}
                            {m.open_time && ` (${m.open_time} – ${m.close_time})`}
                          </p>
                        )}
                      </div>

                      <div className="relative rounded-lg overflow-hidden border h-36 bg-accent/50">
                        <iframe
                          title={`Map for ${m.name}`}
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          scrolling="no"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`}
                          className="w-full h-full filter saturate-[0.85] contrast-[1.05]"
                        />
                      </div>
                    </CardContent>
                  </div>

                  <div className="p-6 pt-0 space-y-2">
                    <div className="flex gap-2">
                      <a
                        href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=;${lat}%2C${lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          <Navigation className="size-3 mr-1 text-blue-500" /> Get Directions
                        </Button>
                      </a>

                      <Button
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => navigate(`/customer/farmers?market_id=${m.id}`)}
                      >
                        <Leaf className="size-3 mr-1 text-green-300" /> View Farmers
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
