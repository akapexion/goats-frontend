import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const defaultForm = {
  stall_name: '',
  market_id: '',
  description: '',
  address: '',
  operating_days: '',
  pickup_start_time: '',
  pickup_end_time: '',
  cutoff_hours: 12,
  latitude: '',
  longitude: '',
}

export default function FarmerProfile() {
  const [profile, setProfile] = useState(null)
  const [markets, setMarkets] = useState([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(defaultForm)

  const load = () => {
    Promise.all([
      api.get('/farmer/profile').catch(() => ({ data: { data: null } })),
      api.get('/markets').catch(() => ({ data: { data: [] } })),
    ]).then(([profileRes, marketsRes]) => {
      const p = profileRes.data?.data
      setProfile(p)
      setMarkets(marketsRes.data?.data?.data || marketsRes.data?.data || [])
      if (p) {
        setForm({
          stall_name:        p.stall_name || '',
          market_id:         p.market_id || '',
          description:       p.description || '',
          address:           p.address || '',
          operating_days:    p.operating_days || '',
          pickup_start_time: p.pickup_start_time || '',
          pickup_end_time:   p.pickup_end_time || '',
          cutoff_hours:      p.cutoff_hours || 12,
          latitude:          p.latitude || '',
          longitude:         p.longitude || '',
        })
      }
    })
  }

  useEffect(() => { load() }, [])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.put('/farmer/profile', form)
      toast.success('Profile saved successfully!')
      if (data?.data) setProfile(data.data)
    } catch (err) {
      const msgs = err.response?.data?.errors
      if (msgs) {
        Object.values(msgs).flat().forEach((m) => toast.error(m))
      } else {
        toast.error(err.response?.data?.message || 'Failed to save profile')
      }
    } finally {
      setSaving(false)
    }
  }

  const statusVariant = { pending: 'secondary', approved: 'default', suspended: 'destructive' }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Farmer Profile</h1>
            <p className="text-muted-foreground">Manage your stall information</p>
          </div>
          {profile && (
            <Badge variant={statusVariant[profile.approval_status] || 'secondary'} className="capitalize">
              {profile.approval_status}
            </Badge>
          )}
        </div>

        <Card className="backdrop-blur-md bg-card/80 border shadow-md">
          <CardHeader>
            <CardTitle>{profile ? 'Update Stall Profile' : 'Create Your Stall Profile'}</CardTitle>
            <CardDescription>
              {!profile
                ? 'Fill in your stall details below. Your profile will be submitted for admin verification.'
                : 'Keep your stall address, operating hours, and market location updated for your customers.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stall_name">Stall Name *</Label>
                <Input
                  id="stall_name"
                  placeholder="e.g. Green Valley Organic Produce"
                  value={form.stall_name}
                  onChange={set('stall_name')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="market_id">Associated Farmers Market</Label>
                <select
                  id="market_id"
                  value={form.market_id}
                  onChange={set('market_id')}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select a market (optional)</option>
                  {markets.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.city ? `(${m.city})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Stall Description</Label>
                <Input
                  id="description"
                  placeholder="Tell customers about your farm and fresh crops..."
                  value={form.description}
                  onChange={set('description')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Physical Address / Stall Location</Label>
                <Input
                  id="address"
                  placeholder="e.g. Stall #14, Main Market Square"
                  value={form.address}
                  onChange={set('address')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operating_days">Operating Days</Label>
                <Input
                  id="operating_days"
                  placeholder="e.g. Sat, Sun (or Mon-Fri)"
                  value={form.operating_days}
                  onChange={set('operating_days')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pickup_start_time">Pickup Start Time</Label>
                  <Input
                    id="pickup_start_time"
                    type="time"
                    value={form.pickup_start_time}
                    onChange={set('pickup_start_time')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickup_end_time">Pickup End Time</Label>
                  <Input
                    id="pickup_end_time"
                    type="time"
                    value={form.pickup_end_time}
                    onChange={set('pickup_end_time')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cutoff_hours">Pre-Order Cutoff (hours before pickup)</Label>
                <Input
                  id="cutoff_hours"
                  type="number"
                  min="1"
                  max="72"
                  value={form.cutoff_hours}
                  onChange={set('cutoff_hours')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude (optional)</Label>
                  <Input
                    id="latitude"
                    placeholder="e.g. 37.7749"
                    value={form.latitude}
                    onChange={set('latitude')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude (optional)</Label>
                  <Input
                    id="longitude"
                    placeholder="e.g. -122.4194"
                    value={form.longitude}
                    onChange={set('longitude')}
                  />
                </div>
              </div>

              <Button type="submit" disabled={saving} className="w-full mt-4">
                {saving ? 'Saving Profile...' : 'Save Stall Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
