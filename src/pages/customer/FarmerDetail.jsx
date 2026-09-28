import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import LoginRequiredModal from '@/components/LoginRequiredModal'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, Clock, Star, ShoppingCart, Heart, ArrowLeft, Leaf, Package, ExternalLink } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { X, Plus, Minus } from 'lucide-react'
import ReviewSubmitModal from '@/components/ReviewSubmitModal'
import { validateFutureDate, validateRequired } from '@/lib/validation'

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
  const [errors, setErrors] = useState({})
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
    setErrors({})
    if (cartItems.length === 0) {
      toast.error('Add at least one product to your order')
      return
    }

    const fieldErrors = {}
    const dateErr = validateFutureDate(pickupDate, 'Pickup Date')
    if (dateErr) fieldErrors.pickupDate = dateErr

    const timeErr = validateRequired(pickupTime, 'Pickup Time')
    if (timeErr) fieldErrors.pickupTime = timeErr

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <CardTitle className="text-base font-bold">Order from {farmer.stall_name}</CardTitle>
          <button onClick={onClose}><X className="size-4" /></button>
        </CardHeader>
        <CardContent className="pt-4">
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
                    <span className="w-6 text-center text-sm font-bold">{cart[p.id] || 0}</span>
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
                Total: <span className="text-primary font-bold">${total.toFixed(2)}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Pickup Date *</Label>
                <Input type="date" min={today} value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} required />
                {errors.pickupDate && <p className="text-[11px] text-destructive mt-0.5">{errors.pickupDate}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Pickup Time *</Label>
                <Input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} required />
                {errors.pickupTime && <p className="text-[11px] text-destructive mt-0.5">{errors.pickupTime}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Note (optional)</Label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                placeholder="Special requests..."
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={loading} className="flex-1 font-bold shadow-md">
                {loading ? 'Placing...' : 'Confirm Pre-Order'}
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
  const navigate = useNavigate()
  const { user } = useAuth()

  const [farmer, setFarmer] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [favoriteId, setFavoriteId] = useState(null)
  const [showOrder, setShowOrder] = useState(false)
  const [ordering, setOrdering] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginModalMessage, setLoginModalMessage] = useState('')

  const loadData = () => {
    setLoading(true)
    Promise.all([
      api.get(`/farmers/${id}`),
      api.get(`/farmers/${id}/reviews`).catch(() => ({ data: { data: [] } })),
    ]).then(([farmerRes, reviewsRes]) => {
      setFarmer(farmerRes.data.data)
      setReviews(reviewsRes.data?.data?.data || reviewsRes.data?.data || [])
    }).catch(() => toast.error('Failed to load farmer'))
      .finally(() => setLoading(false))
  }

  const checkFavorite = () => {
    if (!user) return
    api.get('/customer/favorites/check', {
      params: { favoritable_type: 'farmer', favoritable_id: id }
    }).then(({ data }) => {
      setIsSaved(data.is_favorited)
      setFavoriteId(data.favorite_id)
    }).catch(() => {})
  }

  useEffect(() => {
    loadData()
    checkFavorite()
  }, [id, user])

  const handleToggleBookmark = async () => {
    if (!user) {
      setLoginModalMessage('Please sign in to bookmark farmers and save their stalls.')
      setShowLoginModal(true)
      return
    }

    try {
      if (isSaved && favoriteId) {
        await api.delete(`/customer/favorites/${favoriteId}`)
        toast.success('Removed farmer from bookmarks')
        setIsSaved(false)
        setFavoriteId(null)
      } else {
        const { data } = await api.post('/customer/favorites', {
          favoritable_type: 'farmer',
          favoritable_id: Number(id),
        })
        toast.success('Farmer stall bookmarked!')
        setIsSaved(true)
        setFavoriteId(data.data?.id || data.favorite_id)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to bookmark farmer')
    }
  }

  const handleInitiatePreOrder = () => {
    if (!user) {
      setLoginModalMessage('Please sign in to place pre-orders with local farmers.')
      setShowLoginModal(true)
      return
    }
    setShowOrder(true)
  }

  const handleOrder = async (payload) => {
    setOrdering(true)
    try {
      await api.post('/customer/orders', payload)
      toast.success('Order placed successfully!')
      setShowOrder(false)
      loadData()
      navigate('/customer/orders')
    } catch (err) {
      const msgs = err.response?.data?.errors
      if (msgs) Object.values(msgs).flat().forEach((m) => toast.error(m))
      else toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setOrdering(false)
    }
  }

  const availableProducts = farmer?.products?.filter((p) => p.status === 'available') || []
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <PageContainer>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4 mr-1.5" /> Back
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : !farmer ? (
          <div className="text-center py-16 text-muted-foreground">
            <Leaf className="size-16 mx-auto mb-4 opacity-30" />
            <p>Farmer profile not found.</p>
          </div>
        ) : (
          <>
            <Card className="border shadow-lg bg-card">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold">{farmer.stall_name}</h1>
                    <p className="text-muted-foreground text-sm font-medium">{farmer.user?.name}</p>

                    {avgRating && (
                      <div className="flex items-center gap-2">
                        <StarDisplay rating={Math.round(avgRating)} />
                        <span className="text-sm font-semibold">{avgRating} ({reviews.length} customer reviews)</span>
                      </div>
                    )}

                    {farmer.description && <p className="text-sm text-muted-foreground max-w-md pt-1">{farmer.description}</p>}

                    <div className="space-y-1.5 text-xs text-muted-foreground pt-2">
                      {farmer.market && (
                        <p className="flex items-center gap-1.5 font-medium text-foreground">
                          <MapPin className="size-3.5 text-primary" /> Associated Market: {farmer.market.name}
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

                  <div className="flex flex-col gap-2 shrink-0 sm:w-48">
                    {availableProducts.length > 0 && (
                      <Button onClick={handleInitiatePreOrder} className="w-full font-bold shadow-md">
                        <ShoppingCart className="size-4 mr-2" /> Pre-Order Now
                      </Button>
                    )}
                    <Button variant={isSaved ? "default" : "outline"} onClick={handleToggleBookmark} className="w-full">
                      <Heart className={`size-4 mr-2 ${isSaved ? "fill-white" : "text-rose-500"}`} />
                      {isSaved ? "Saved Stall" : "Bookmark Stall"}
                    </Button>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-primary" /> Stall Location & Directions
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
                </div>
              </CardContent>
            </Card>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Package className="size-5 text-primary" /> Products Offered ({availableProducts.length})
                </h2>
              </div>

              {availableProducts.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  <p>No available products currently listed for this stall.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableProducts.map((p) => (
                    <Card key={p.id} className="border shadow-md hover:-translate-y-0.5 transition-all">
                      <CardContent className="pt-4 flex flex-col justify-between h-full">
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Link to={`/products/${p.id}`} className="font-bold text-sm hover:underline">
                                {p.name}
                              </Link>
                              {p.category && <p className="text-xs text-muted-foreground">{p.category.name}</p>}
                            </div>
                            <div className="text-right">
                              <p className="font-extrabold text-sm text-primary">${Number(p.price).toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">per {p.unit}</p>
                            </div>
                          </div>
                          {p.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{p.description}</p>
                          )}
                        </div>

                        <div className="pt-2 border-t flex items-center justify-between text-xs">
                          <span className={`font-semibold ${p.stock_quantity <= 5 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {p.stock_quantity} {p.unit}s in stock
                          </span>
                          <Link to={`/products/${p.id}`}>
                            <Button size="sm" variant="ghost" className="h-7 text-xs px-2">
                              Details <ExternalLink className="size-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Customer Reviews ({reviews.length})</h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (!user) {
                      setLoginModalMessage("Please sign in to write a review.")
                      setShowLoginModal(true)
                    } else {
                      setShowReviewModal(true)
                    }
                  }}
                  className="text-xs h-8 gap-1.5"
                >
                  <Star className="size-3.5 text-amber-500 fill-amber-500" />
                  Write a Review
                </Button>
              </div>

              {reviews.length === 0 ? (
                <Card className="p-6 text-center text-muted-foreground border">
                  <p className="text-sm">No reviews yet for this farmer. Be the first to share your experience!</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <Card key={r.id} className="border shadow-sm">
                      <CardContent className="pt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold">{r.customer?.name || "Customer"}</p>
                          <StarDisplay rating={r.rating} />
                        </div>
                        {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                        {r.farmer_reply && (
                          <div className="bg-muted/40 rounded-lg p-3 border text-xs space-y-1">
                            <p className="font-bold text-primary">Farmer Response:</p>
                            <p className="text-muted-foreground">{r.farmer_reply}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
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

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Login Required"
        message={loginModalMessage}
      />

      <ReviewSubmitModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSuccess={loadData}
        farmerProfileId={id}
        targetTitle={`Review ${farmer?.stall_name || 'Farmer'}`}
        targetSubtitle={farmer?.stall_name}
      />
    </PageContainer>
  )
}
