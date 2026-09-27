import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Pencil, Trash2, X, MapPin } from 'lucide-react'

function MarketForm({ initial, onSave, onCancel, loading }) {
  const [form, setForm] = useState(
    initial || { name: '', address: '', city: '', open_days: '', open_time: '', close_time: '' }
  )

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">{initial ? 'Edit Market' : 'Add Market'}</CardTitle>
        <button onClick={onCancel}><X className="size-4" /></button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={form.name} onChange={set('name')} required placeholder="Market name" />
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Input value={form.city} onChange={set('city')} placeholder="City" />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>Address *</Label>
            <Input value={form.address} onChange={set('address')} required placeholder="Full address" />
          </div>
          <div className="space-y-2">
            <Label>Open Days</Label>
            <Input value={form.open_days} onChange={set('open_days')} placeholder="Mon-Fri" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Open Time</Label>
              <Input type="time" value={form.open_time} onChange={set('open_time')} />
            </div>
            <div className="space-y-2">
              <Label>Close Time</Label>
              <Input type="time" value={form.close_time} onChange={set('close_time')} />
            </div>
          </div>
          <div className="sm:col-span-2 flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Market'}
            </Button>
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
      if (editing) {
        await api.put(`/admin/markets/${editing.id}`, form)
        toast.success('Market updated')
      } else {
        await api.post('/admin/markets', form)
        toast.success('Market created')
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
    if (!confirm('Delete this market?')) return
    try {
      await api.delete(`/admin/markets/${id}`)
      toast.success('Market deleted')
      load()
    } catch {
      toast.error('Failed to delete market')
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Markets</h1>
            <p className="text-muted-foreground">Manage farmer markets and locations</p>
          </div>
          <Button onClick={() => { setShowForm(true); setEditing(null) }}>
            <Plus className="size-4 mr-2" /> Add Market
          </Button>
        </div>

        {(showForm && !editing) && (
          <MarketForm
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
            loading={saving}
          />
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}><CardContent className="pt-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : markets.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <MapPin className="size-12 mx-auto mb-3 opacity-30" />
            <p>No markets yet. Add one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {markets.map((m) => (
              <Card key={m.id}>
                {editing?.id === m.id ? (
                  <MarketForm
                    initial={editing}
                    onSave={handleSave}
                    onCancel={() => setEditing(null)}
                    loading={saving}
                  />
                ) : (
                  <>
                    <CardHeader className="pb-2 flex flex-row items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{m.name}</CardTitle>
                        {m.city && <p className="text-xs text-muted-foreground">{m.city}</p>}
                      </div>
                      <Badge variant={m.is_active ? 'default' : 'secondary'}>
                        {m.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground flex items-start gap-1">
                        <MapPin className="size-3 mt-0.5 shrink-0" /> {m.address}
                      </p>
                      {m.open_days && (
                        <p className="text-xs text-muted-foreground">
                          {m.open_days}
                          {m.open_time && ` · ${m.open_time}–${m.close_time}`}
                        </p>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" onClick={() => setEditing(m)}>
                          <Pencil className="size-3 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(m.id)}>
                          <Trash2 className="size-3 mr-1" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
