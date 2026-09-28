import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Pencil, Trash2, X, MapPin, Navigation, Compass } from 'lucide-react'
import LocationPickerMap from '@/components/LocationPickerMap'

function MarketForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState(() => ({
    name: initial?.name || '',
    address: initial?.address || '',
    city: initial?.city || '',
    latitude: initial?.latitude !== null && initial?.latitude !== undefined ? initial.latitude : '',
    longitude: initial?.longitude !== null && initial?.longitude !== undefined ? initial.longitude : '',
    open_days: initial?.open_days || '',
    open_time: initial?.open_time || '',
    close_time: initial?.close_time || '',
  }))

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        address: initial.address || '',
        city: initial.city || '',
        latitude: initial.latitude !== null && initial.latitude !== undefined ? initial.latitude : '',
        longitude: initial.longitude !== null && initial.longitude !== undefined ? initial.longitude : '',
        open_days: initial.open_days || '',
        open_time: initial.open_time || '',
        close_time: initial.close_time || '',
      })
    }
  }, [initial])

  const set = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }))

  const handleLocationSelect = (lat, lng) => {
    setForm((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <Card className="mb-8 border-2 shadow-md overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/30 border-b">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <MapPin className="size-5 text-emerald-600" />
            {initial ? 'Edit Market Details' : 'Add New Market'}
          </CardTitle>
          <CardDescription className="text-xs">
            Fill in the market details and pick the exact geographic location on the map.
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 rounded-full">
          <X className="size-4" />
        </Button>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          {/* Responsive 2-column Grid: Left column for Form, Right column for Map */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Column 1: Add/Edit Market Form Details */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  General Information
                </span>
                <span className="text-[11px] text-muted-foreground">* Required fields</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="m-name" className="text-xs font-semibold">Market Name *</Label>
                  <Input
                    id="m-name"
                    value={form.name}
                    onChange={set('name')}
                    required
                    placeholder="e.g. Green Valley Farmers Market"
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="m-city" className="text-xs font-semibold">City</Label>
                  <Input
                    id="m-city"
                    value={form.city}
                    onChange={set('city')}
                    placeholder="e.g. Karachi, Lahore, Islamabad"
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="m-address" className="text-xs font-semibold">Full Address *</Label>
                  <Input
                    id="m-address"
                    value={form.address}
                    onChange={set('address')}
                    required
                    placeholder="e.g. Block 5, Clifton, Marine Drive"
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              {/* Coordinates Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                    <Compass className="size-3.5 text-emerald-600" />
                    GPS Coordinates (Latitude & Longitude)
                  </Label>
                  <span className="text-[11px] text-muted-foreground">Auto-filled from map</span>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 border">
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                      <MapPin className="size-3 text-emerald-600" /> Latitude
                    </span>
                    <Input
                      type="number"
                      step="any"
                      value={form.latitude}
                      onChange={set('latitude')}
                      placeholder="e.g. 24.8607"
                      className="h-9 font-mono text-xs bg-background"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                      <Navigation className="size-3 text-emerald-600" /> Longitude
                    </span>
                    <Input
                      type="number"
                      step="any"
                      value={form.longitude}
                      onChange={set('longitude')}
                      placeholder="e.g. 67.0011"
                      className="h-9 font-mono text-xs bg-background"
                    />
                  </div>
                </div>
              </div>

              {/* Operational Timing */}
              <div className="pt-2 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="m-days" className="text-xs font-semibold">Operating Days</Label>
                  <Input
                    id="m-days"
                    value={form.open_days}
                    onChange={set('open_days')}
                    placeholder="e.g. Saturday, Sunday or Mon-Fri"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="m-open" className="text-xs font-semibold">Open Time</Label>
                    <Input
                      id="m-open"
                      type="time"
                      value={form.open_time}
                      onChange={set('open_time')}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="m-close" className="text-xs font-semibold">Close Time</Label>
                    <Input
                      id="m-close"
                      type="time"
                      value={form.close_time}
                      onChange={set('close_time')}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm">
                  {loading ? 'Saving...' : initial ? 'Update Market' : 'Save Market'}
                </Button>
              </div>
            </div>

            {/* Column 2: Interactive Map Location Pin Picker */}
            <div className="lg:col-span-6 flex flex-col space-y-3 border-t lg:border-t-0 lg:border-l lg:pl-8 pt-6 lg:pt-0">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <MapPin className="size-4 text-emerald-600" />
                  Map Location Pin Picker
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Click or drag to drop pin
                </span>
              </div>

              <LocationPickerMap
                latitude={form.latitude}
                longitude={form.longitude}
                onLocationSelect={handleLocationSelect}
                addressHint={form.address || form.city}
                className="flex-1"
              />
            </div>

          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default function AdminMarkets() {
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = (silent = false) => {
    if (!silent && markets.length === 0) setLoading(true)
    api.get('/markets')
      .then(({ data }) => setMarkets(data.data?.data || data.data || []))
      .catch(() => toast.error('Failed to load markets'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(false) }, [])

  const handleSave = async (form) => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        latitude: form.latitude !== '' && form.latitude !== null && form.latitude !== undefined ? Number(form.latitude) : null,
        longitude: form.longitude !== '' && form.longitude !== null && form.longitude !== undefined ? Number(form.longitude) : null,
      }

      if (editing) {
        await api.put(`/admin/markets/${editing.id}`, payload)
        toast.success('Market updated successfully')
      } else {
        await api.post('/admin/markets', payload)
        toast.success('Market created successfully')
      }
      setShowForm(false)
      setEditing(null)
      load(true)
    } catch (err) {
      const msgs = err.response?.data?.errors
      if (msgs) {
        Object.values(msgs).flat().forEach((m) => toast.error(m))
      } else {
        toast.error('Failed to save market')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this market?')) return
    try {
      await api.delete(`/admin/markets/${id}`)
      toast.success('Market deleted')
      load()
    } catch {
      toast.error('Failed to delete market')
    }
  }

  const handleOpenAddForm = () => {
    setEditing(null)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenEditForm = (market) => {
    setEditing(market)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Markets</h1>
            <p className="text-sm text-muted-foreground">Manage farmer market hubs, schedules, and geographic coordinates</p>
          </div>
          <Button onClick={handleOpenAddForm} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm">
            <Plus className="size-4 mr-2" /> Add Market
          </Button>
        </div>

        {/* 2-Column Grid Add / Edit Market Form with Leaflet Pin Picker */}
        {showForm && (
          <MarketForm
            initial={editing}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false)
              setEditing(null)
            }}
            loading={saving}
          />
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}><CardContent className="pt-6"><Skeleton className="h-28 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : markets.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl border">
            <MapPin className="size-12 mx-auto mb-3 opacity-30 text-emerald-600" />
            <p className="font-semibold">No markets registered yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Click "Add Market" to create one with a location pin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {markets.map((m) => {
              const isCurrentlyEditing = editing?.id === m.id
              return (
                <Card
                  key={m.id}
                  className={`transition-all duration-200 ${
                    isCurrentlyEditing ? 'ring-2 ring-emerald-500 border-emerald-500' : 'hover:shadow-md'
                  }`}
                >
                  <CardHeader className="pb-2 flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-bold">{m.name}</CardTitle>
                      {m.city && <p className="text-xs font-medium text-emerald-600">{m.city}</p>}
                    </div>
                    <Badge variant={m.is_active ? 'default' : 'secondary'} className="text-[10px]">
                      {m.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <MapPin className="size-3.5 mt-0.5 shrink-0 text-emerald-600" />
                      <span>{m.address}</span>
                    </p>

                    {m.latitude && m.longitude && (
                      <p className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                        <Navigation className="size-3 text-emerald-600" />
                        <span>GPS: {Number(m.latitude).toFixed(4)}, {Number(m.longitude).toFixed(4)}</span>
                      </p>
                    )}

                    {m.open_days && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{m.open_days}</span>
                        {m.open_time && ` · ${m.open_time}–${m.close_time}`}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2 border-t">
                      <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => handleOpenEditForm(m)}>
                        <Pencil className="size-3 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="destructive" className="text-xs h-8" onClick={() => handleDelete(m.id)}>
                        <Trash2 className="size-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
