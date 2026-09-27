import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppLayout } from '@/components/AppLayout'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, Clock, Star, ShoppingCart, Heart, Package } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { X, Plus, Minus } from 'lucide-react'

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`size-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
      ))}
    </div>
  )
}

function OrderModal({ farmer, products, onClose, onSubmit, loading }) {
  const [cart, setCart] = useState({})
  const [pickupDate, setPickupDate] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [note, setNote] = useState('')
  const today = new Date().toISOString().split('T')[0]

  const setQty = (productId, qty) => {
    if (qty <= 0) {
      const next = { ...cart }
      delete next[productId]
      setCart(next)
    } else {
      setCart({ ...cart, [productId]: qty })
    }
  }

  const cartItems = Object.entries(cart).filter(([, qty]) => qty > 0)
  const total = cartItems.reduce((sum, [pid, qty]) => {
    const p = products.find((x) => x.id === Number(pid))
    return sum + (p ? p.price * qty : 0)
  }, 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (cartItems.length === 0) {
      toast.error('Add at least one product to your order')
      return
    }
    onSubmit({
      farmer_profile_id: farmer.id,
      pickup_date: pickupDate,
      pickup_time: pickupTime,
      note,
      items: cartItems.map(([product_id, quantity]) => ({ product_id: Number(product_id), quantity })),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <Card className="w-full max-w-lg my-4">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Order from {farmer.stall_name}</CardTitle>
          <button onClick={onClose}><X className="size-4" /></button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md divide-y">
              {products.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">${Number(p.price).toFixed(2)} / {p.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setQty(p.id, (cart[p.id] || 0) - 1)}
                      className="size-6 rounded border flex items-center justify-center">
                      <Minus className="size-3" />
                    </button>
                    <span className="w-6 text-center text-sm">{cart[p.id] || 0}</span>
                    <button type="button" onClick={() => setQty(p.id, Math.min(p.stock_quantity, (cart[p.id] || 0) + 1))}
                      className="size-6 rounded border flex items-center justify-center">
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {cartItems.length > 0 && (
              <div className="text-sm font-semibold text-right">
                Total: ${total.toFixed(2)}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Pickup Date *</Label>
                <Input type="date" min={today} value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Pickup Time *</Label>
                <Input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                placeholder="Special requests..."
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Placing...' : 'Place Order'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function FarmerDetail() {
  const { id } = useParams()
  const [farmer, setFarmer] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showOrder, setShowOrder] = useState(false)
  const [ordering, setOrdering] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get(`/farmers/${id}`),
      api.get(`/farmers/${id}/reviews`).catch(() => ({ data: { data: [] } })),
    ]).then(([farmerRes, reviewsRes]) => {
      setFarmer(farmerRes.data.data)
      setReviews(reviewsRes.data?.data?.data || reviewsRes.data?.data || [])
    }).catch(() => toast.error('Failed to load farmer'))
      .finally(() => setLoading(false))
  }, [id])

  const handleFavorite = async () => {
    try {
      await api.post('/customer/favorites', { favoritable_type: 'farmer', favoritable_id: farmer.id })
      toast.success('Added to favorites')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add favorite')
    }
  }

  const handleOrder = async (payload) => {
    setOrdering(true)
    try {
      await api.post('/customer/orders', payload)
      toast.success('Order placed!')
      setShowOrder(false)
    } catch (err) {
      const msgs = err.response?.data?.errors
      if (msgs) {
        Object.values(msgs).flat().forEach((m) => toast.error(m))
      } else {
        toast.error(err.response?.data?.message || 'Failed to place order')
      }
    } finally {
      setOrdering(false)
    }
  }

  const availableProducts = farmer?.products?.filter((p) => p.status === 'available') || []
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : !farmer ? (
          <p className="text-center text-muted-foreground py-12">Farmer not found.</p>
        ) : (
          <>
            <Card data-aos="fade-down" className="glass-card">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold">{farmer.stall_name}</h1>
                    <p className="text-muted-foreground text-sm font-medium">{farmer.user?.name}</p>
                    {avgRating && (
                      <div className="flex items-center gap-2">
                        <StarDisplay rating={Math.round(avgRating)} />
                        <span className="text-sm font-semibold">{avgRating} ({reviews.length} reviews)</span>
                      </div>
                    )}
                    {farmer.description && <p className="text-sm text-muted-foreground max-w-md">{farmer.description}</p>}
                    <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                      {farmer.market && (
                        <p className="flex items-center gap-1.5 font-medium text-foreground/80">
                          <MapPin className="size-3.5 text-primary" /> Market Stall: {farmer.market.name}
                        </p>
                      )}
                      {farmer.address && (
                        <p className="flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-amber-500" /> Stall Location: {farmer.address}
                        </p>
                      )}
                      {farmer.operating_days && (
                        <p className="flex items-center gap-1.5">
                          <Clock className="size-3.5 text-blue-500" /> Operating Days: {farmer.operating_days}
                          {farmer.pickup_start_time && ` (${farmer.pickup_start_time} – ${farmer.pickup_end_time})`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0 sm:w-44">
                    {availableProducts.length > 0 && (
                      <Button onClick={() => setShowOrder(true)} className="w-full shadow-md">
                        <ShoppingCart className="size-4 mr-2" /> Pre-Order Now
                      </Button>
                    )}
                    <Button variant="outline" onClick={handleFavorite} className="w-full">
                      <Heart className="size-4 mr-2 text-rose-500" /> Save Stall
                    </Button>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-primary" /> Pickup Location Map & Directions
                  </h3>
                  <div className="relative rounded-xl overflow-hidden border h-44 bg-accent/40">
                    <iframe
                      title={`Pickup location for ${farmer.stall_name}`}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${(farmer.longitude || -122.4194) - 0.01},${(farmer.latitude || 37.7749) - 0.01},${(farmer.longitude || -122.4194) + 0.01},${(farmer.latitude || 37.7749) + 0.01}&layer=mapnik&marker=${farmer.latitude || 37.7749},${farmer.longitude || -122.4194}`}
                      className="w-full h-full filter saturate-[0.9]"
                    />
                  </div>
                  <div className="flex justify-end pt-1">
                    <a
                      href={`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=;${farmer.latitude || 37.7749}%2C${farmer.longitude || -122.4194}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline" className="text-xs">
                        <MapPin className="size-3.5 mr-1 text-primary" /> Directions to Selected Pickup Point
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {availableProducts.length > 0 && (
              <div data-aos="fade-up">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold">Current Weekly Stock</h2>
                  <Badge variant="outline" className="text-xs">
                    {availableProducts.length} Items Available
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableProducts.map((p) => (
                    <Card key={p.id} className="glass-card card-hover">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <p className="font-bold text-sm">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.category?.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-extrabold text-sm text-primary">${Number(p.price).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">per {p.unit}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3 text-xs pt-2 border-t">
                          <span className="text-muted-foreground">Stock remaining:</span>
                          <span className={`font-semibold ${p.stock_quantity < 5 ? 'text-amber-500 font-bold' : 'text-green-600 dark:text-green-400'}`}>
                            {p.stock_quantity} {p.unit}s left
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {reviews.length > 0 && (
              <div data-aos="fade-up">
                <h2 className="text-lg font-bold mb-3">Customer Reviews</h2>
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <Card key={r.id} className="glass-card">
                      <CardContent className="pt-4 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold">{r.customer?.name}</p>
                          <StarDisplay rating={r.rating} />
                        </div>
                        {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                        {r.farmer_reply && (
                          <div className="bg-accent/60 rounded-xl p-3 mt-2 border">
                            <p className="text-xs font-bold text-primary mb-0.5">Farmer Reply:</p>
                            <p className="text-xs text-muted-foreground">{r.farmer_reply}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showOrder && farmer && (
        <OrderModal
          farmer={farmer}
          products={availableProducts}
          onClose={() => setShowOrder(false)}
          onSubmit={handleOrder}
          loading={ordering}
        />
      )}
    </AppLayout>
  )
}
