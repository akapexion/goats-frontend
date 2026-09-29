import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import PageContainer from "@/components/PageContainer"
import LoginRequiredModal from "@/components/LoginRequiredModal"
import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/context/CartContext"
import { useWishlist } from "@/context/WishlistContext"
import api from "@/lib/axios"
import toast from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Package, Store, Leaf, MapPin, Calendar, Clock, ShoppingCart, Heart, ArrowLeft, Plus, Minus, CheckCircle, AlertTriangle, XCircle, Star } from "lucide-react"
import { getProductImageUrl, getCategoryFallback } from "@/lib/imageUtils"

import ReviewSubmitModal from '@/components/ReviewSubmitModal'
import { validateFutureDate, validateRequired, validateQuantity } from '@/lib/validation'

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`size-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
      ))}
    </div>
  )
}

export default function ProductDetail() {
  const { productId, id } = useParams()
  const effectiveId = productId || id
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cart, addToCart } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginModalMessage, setLoginModalMessage] = useState("")

  const [showCheckout, setShowCheckout] = useState(false)
  const [pickupDate, setPickupDate] = useState("")
  const [pickupTime, setPickupTime] = useState("")
  const [note, setNote] = useState("")
  const [ordering, setOrdering] = useState(false)
  const [checkoutErrors, setCheckoutErrors] = useState({})

  const [reviews, setReviews] = useState([])
  const [showReviewModal, setShowReviewModal] = useState(false)

  const today = new Date().toISOString().split("T")[0]
  const isSaved = effectiveId ? isWishlisted(effectiveId) : false

  const loadProduct = () => {
    if (!effectiveId) return
    setLoading(true)
    api.get(`/products/${effectiveId}`)
      .then(({ data }) => {
        setProduct(data.data)
        if (data.data?.stock_quantity > 0) {
          setQuantity(1)
        } else {
          setQuantity(0)
        }
      })
      .catch(() => toast.error("Failed to load product details"))
      .finally(() => setLoading(false))

    api.get(`/products/${effectiveId}/reviews`)
      .then(({ data }) => setReviews(data.data?.data || data.data || []))
      .catch(() => {})
  }

  useEffect(() => {
    loadProduct()
  }, [effectiveId])

  const handleToggleBookmark = async () => {
    if (!user) {
      setLoginModalMessage("Please sign in to bookmark your favorite farm products.")
      setShowLoginModal(true)
      return
    }

    if (!product) return
    const result = await toggleWishlist(product)
    if (result?.requiresLogin) {
      setLoginModalMessage("Please sign in to bookmark your favorite farm products.")
      setShowLoginModal(true)
    }
  }

  const handleInitiateOrder = () => {
    if (!user) {
      setLoginModalMessage("Please sign in to place a pre-order with this farmer.")
      setShowLoginModal(true)
      return
    }
    if (quantity <= 0 || quantity > product.stock_quantity) {
      toast.error("Invalid order quantity.")
      return
    }
    setShowCheckout(true)
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setCheckoutErrors({})
    if (!product || !product.farmer) return

    const fieldErrors = {}
    const dateErr = validateFutureDate(pickupDate, 'Pickup Date')
    if (dateErr) fieldErrors.pickupDate = dateErr

    const timeErr = validateRequired(pickupTime, 'Pickup Time')
    if (timeErr) fieldErrors.pickupTime = timeErr

    const qtyErr = validateQuantity(quantity, product.stock_quantity)
    if (qtyErr) fieldErrors.quantity = qtyErr

    if (Object.keys(fieldErrors).length > 0) {
      setCheckoutErrors(fieldErrors)
      return
    }

    setOrdering(true)
    try {
      await api.post("/customer/orders", {
        farmer_profile_id: product.farmer_profile_id,
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        note,
        items: [{ product_id: product.id, quantity }],
      })

      toast.success("Pre-order placed successfully!")
      setShowCheckout(false)
      loadProduct()
      navigate("/customer/orders")
    } catch (err) {
      const msgs = err.response?.data?.errors
      if (msgs) Object.values(msgs).flat().forEach((m) => toast.error(m))
      else toast.error(err.response?.data?.message || "Failed to place order")
    } finally {
      setOrdering(false)
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Skeleton className="h-8 w-40" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full rounded-2xl" />
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </PageContainer>
    )
  }

  if (!product) {
    return (
      <PageContainer>
        <div className="text-center py-16">
          <Package className="size-16 mx-auto mb-4 opacity-30 text-muted-foreground" />
          <h2 className="text-2xl font-bold">Product Not Found</h2>
          <p className="text-muted-foreground mt-2">This product does not exist or is no longer listed.</p>
          <Button onClick={() => navigate("/products")} className="mt-4">
            <ArrowLeft className="size-4 mr-2" /> Browse Products
          </Button>
        </div>
      </PageContainer>
    )
  }

  const isAvailable = product.status === "available" && product.stock_quantity > 0
  const isLowStock = isAvailable && product.stock_quantity <= 5
  const farmer = product.farmer
  const market = farmer?.market

  return (
    <PageContainer>
      <div className="space-y-8 max-w-5xl mx-auto">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-4 mr-1.5" /> Back
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <Card className="overflow-hidden border shadow-lg bg-card">
            <div className="relative h-72 sm:h-96 bg-accent/40 flex items-center justify-center">
              <img
                src={getProductImageUrl(product.image_url || product.image_path || product.image) || getCategoryFallback()}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = getCategoryFallback() }}
              />
              <div className="absolute top-4 right-4">
                <Badge variant={isAvailable ? (isLowStock ? "warning" : "default") : "destructive"} className="px-3 py-1 text-xs shadow-md">
                  {isAvailable ? (isLowStock ? "Low Stock" : "In Stock") : "Currently Unavailable"}
                </Badge>
              </div>
            </div>

            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Category:</span>
                <Badge variant="outline" className="font-semibold">
                  {product.category?.name || "General"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Available Quantity:</span>
                <span className={`font-bold flex items-center gap-1.5 ${isAvailable ? (isLowStock ? "text-amber-500" : "text-emerald-600 dark:text-emerald-400") : "text-destructive"}`}>
                  {isAvailable ? (
                    <>
                      {isLowStock ? <AlertTriangle className="size-4" /> : <CheckCircle className="size-4" />}
                      {product.stock_quantity} {product.unit}s available
                    </>
                  ) : (
                    <>
                      <XCircle className="size-4" /> 0 {product.unit}s left
                    </>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border shadow-lg p-6 space-y-6 bg-card">
              <div className="space-y-2 border-b pb-4">
                <h1 className="text-3xl font-extrabold tracking-tight">{product.name}</h1>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-3xl font-black text-primary">RS{Number(product.price).toFixed(2)}</span>
                  <span className="text-muted-foreground font-medium text-sm">per {product.unit}</span>
                </div>
              </div>

              {product.description && (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Product Description</h3>
                  <p className="text-sm text-foreground/90 leading-relaxed">{product.description}</p>
                </div>
              )}

              <div className="space-y-4 pt-2 border-t">
                {isAvailable && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Select Quantity ({product.unit}):</Label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="size-10 rounded-lg border bg-background flex items-center justify-center text-foreground hover:bg-accent disabled:opacity-40 transition-colors"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="w-12 text-center text-lg font-bold">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                        disabled={quantity >= product.stock_quantity}
                        className="size-10 rounded-lg border bg-background flex items-center justify-center text-foreground hover:bg-accent disabled:opacity-40 transition-colors"
                      >
                        <Plus className="size-4" />
                      </button>
                      <span className="text-xs text-muted-foreground ml-2">
                        Total: <strong className="text-foreground">RS{(product.price * quantity).toFixed(2)}</strong>
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 font-bold border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                    disabled={!isAvailable}
                    onClick={() => {
                      addToCart(product, quantity)
                    }}
                  >
                    <Plus className="size-4 mr-1.5" /> Add to Cart
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 font-bold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={!isAvailable}
                    onClick={handleInitiateOrder}
                  >
                    <ShoppingCart className="size-5 mr-2" /> Pre-Order Now
                  </Button>
                  <Button
                    size="lg"
                    variant={isSaved ? "default" : "outline"}
                    onClick={handleToggleBookmark}
                    title={isSaved ? "Remove from wishlist" : "Save to wishlist"}
                    className={isSaved ? "bg-rose-600 hover:bg-rose-700 text-white" : ""}
                  >
                    <Heart className={`size-5 ${isSaved ? "fill-white" : "text-rose-500"}`} />
                  </Button>
                </div>
              </div>
            </Card>

            {farmer && (
              <Card className="border shadow-md p-6 space-y-4 bg-card/80">
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                      <Leaf className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base">{farmer.stall_name}</h3>
                      <p className="text-xs text-muted-foreground">Farmer: {farmer.user?.name}</p>
                    </div>
                  </div>
                  <Link to={`/farmers/${farmer.id}`}>
                    <Button size="sm" variant="outline" className="text-xs">
                      View Farmer
                    </Button>
                  </Link>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  {market && (
                    <p className="flex items-center gap-2 font-medium text-foreground">
                      <Store className="size-4 text-primary shrink-0" /> Market: {market.name}
                    </p>
                  )}
                  {farmer.address && (
                    <p className="flex items-start gap-2">
                      <MapPin className="size-4 text-amber-500 shrink-0 mt-0.5" /> Stall Location: {farmer.address}
                    </p>
                  )}
                  {farmer.operating_days && (
                    <p className="flex items-center gap-2">
                      <Clock className="size-4 text-blue-500 shrink-0" /> Market Days: {farmer.operating_days}
                      {farmer.pickup_start_time && ` (${farmer.pickup_start_time} – ${farmer.pickup_end_time})`}
                    </p>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
        {/* Customer Reviews Section */}
        <div className="space-y-4 pt-6 border-t">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Star className="size-5 text-amber-500 fill-amber-500" />
                Customer Reviews ({reviews.length})
              </h2>
              {reviews.length > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Average Rating: {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)} / 5 Stars
                </p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (!user) {
                  setLoginModalMessage("Please sign in to write a product review.")
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
              <p className="text-sm">No customer reviews yet for this product. Be the first to share your thoughts!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((r) => (
                <Card key={r.id} className="border shadow-sm">
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold">{r.customer?.name || "Customer"}</p>
                      <StarDisplay rating={r.rating} />
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                    <p className="text-[11px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                    {r.farmer_reply && (
                      <div className="bg-muted/40 rounded-lg p-2.5 border text-xs space-y-1">
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
      </div>

      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-lg font-bold">Confirm Pre-Order</CardTitle>
              <CardDescription className="text-xs">
                {product.name} ({quantity} {product.unit}s) from {farmer?.stall_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="p-3 bg-muted/40 rounded-lg text-sm space-y-1 border">
                  <div className="flex justify-between font-semibold">
                    <span>{product.name} × {quantity}</span>
                    <span className="text-primary">RS{(product.price * quantity).toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Unit price: RS{Number(product.price).toFixed(2)} / {product.unit}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Pickup Date *</Label>
                    <Input
                      type="date"
                      min={today}
                      value={pickupDate}
                      onChange={(e) => {
                        setPickupDate(e.target.value)
                        if (checkoutErrors.pickupDate) setCheckoutErrors(prev => ({ ...prev, pickupDate: null }))
                      }}
                      required
                    />
                    {checkoutErrors.pickupDate && <p className="text-[11px] text-destructive mt-0.5">{checkoutErrors.pickupDate}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Pickup Time *</Label>
                    <Input
                      type="time"
                      value={pickupTime}
                      onChange={(e) => {
                        setPickupTime(e.target.value)
                        if (checkoutErrors.pickupTime) setCheckoutErrors(prev => ({ ...prev, pickupTime: null }))
                      }}
                      required
                    />
                    {checkoutErrors.pickupTime && <p className="text-[11px] text-destructive mt-0.5">{checkoutErrors.pickupTime}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Order Note (optional)</Label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                    placeholder="Instructions or special requests..."
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowCheckout(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={ordering} className="flex-1 font-bold shadow-md">
                    {ordering ? "Placing..." : "Confirm Pre-Order"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
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
        onSuccess={loadProduct}
        farmerProfileId={product?.farmer_profile_id}
        productId={id}
        targetTitle={`Review ${product?.name || 'Product'}`}
        targetSubtitle={`${product?.name} from ${farmer?.stall_name || 'Farmer'}`}
      />
    </PageContainer>
  )
}
