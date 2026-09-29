import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'
import LoginRequiredModal from '@/components/LoginRequiredModal'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ArrowRight, Store, Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react'
import { getProductImageUrl, getCategoryFallback } from '@/lib/imageUtils'
import { validateFutureDate, validateRequired } from '@/lib/validation'

export default function CartPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart()

  const [pickupDate, setPickupDate] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState({})
  const [ordering, setOrdering] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  // Group items by farmer
  const farmerGroups = {}
  cartItems.forEach(({ product, quantity }) => {
    if (!product) return
    const fid = product.farmer_profile_id || product.farmer?.id || 'unknown'
    if (!farmerGroups[fid]) {
      farmerGroups[fid] = {
        farmer: product.farmer,
        items: [],
      }
    }
    farmerGroups[fid].items.push({ product, quantity })
  })

  const groupKeys = Object.keys(farmerGroups)
  const multipleFarmers = groupKeys.length > 1

  const handleCheckout = async (e) => {
    e.preventDefault()
    setErrors({})

    if (!user) {
      setShowLoginModal(true)
      return
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty.')
      return
    }

    if (multipleFarmers) {
      toast.error('Pre-orders must be placed per farmer stall. Please checkout items from one farmer at a time.')
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

    const farmerId = groupKeys[0]
    const payload = {
      farmer_profile_id: Number(farmerId),
      pickup_date: pickupDate,
      pickup_time: pickupTime,
      note: note.trim() || null,
      items: cartItems.map(({ product, quantity }) => ({
        product_id: Number(product.id),
        quantity: Number(quantity),
      })),
    }

    setOrdering(true)
    try {
      await api.post('/customer/orders', payload)
      toast.success('Pre-order reserved successfully! View your pickup details in My Orders.')
      clearCart()
      navigate('/orders')
    } catch (err) {
      const msgs = err.response?.data?.errors
      if (msgs) Object.values(msgs).flat().forEach((m) => toast.error(m))
      else toast.error(err.response?.data?.message || 'Failed to place pre-order')
    } finally {
      setOrdering(false)
    }
  }

  return (
    <PageContainer>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground flex items-center gap-2.5">
              <ShoppingCart className="size-7 text-emerald-600" />
              Pre-Order Reservation Cart
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Review your reserved harvest produce and schedule your weekend market stall pickup.
            </p>
          </div>
          {cartItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearCart}
              className="text-xs rounded-xl text-destructive hover:bg-destructive/10 border-destructive/30"
            >
              <Trash2 className="size-3.5 mr-1" /> Clear Cart
            </Button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border shadow-sm space-y-4 p-8">
            <div className="size-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
              <ShoppingCart className="size-10 opacity-60" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Your Pre-Order Cart is Empty</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Explore local farm harvest produce, add fresh seasonal fruits and vegetables, and reserve pickup at your nearest market stall.
            </p>
            <div className="pt-2">
              <Button onClick={() => navigate('/products')} className="font-semibold gap-2">
                <ArrowLeft className="size-4" /> Browse Fresh Produce
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {multipleFarmers && (
                <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="size-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <span className="font-bold">Notice: Multiple Farmer Stalls Detected</span>
                    <p className="mt-0.5 leading-relaxed">
                      Farmers prepare pre-orders independently at their stalls. Please checkout items from one farmer at a time.
                    </p>
                  </div>
                </div>
              )}

              {Object.entries(farmerGroups).map(([fid, group]) => (
                <Card key={fid} className="overflow-hidden border shadow-sm bg-card/90">
                  <CardHeader className="bg-muted/30 pb-3 pt-3.5 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Store className="size-4 text-emerald-600" />
                        <CardTitle className="text-sm font-bold text-foreground">
                          {group.farmer?.stall_name || 'Farmer Stall'}
                        </CardTitle>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 divide-y divide-border/60">
                    {group.items.map(({ product, quantity }) => {
                      const imageUrl =
                        getProductImageUrl(product.image_url || product.image_path || product.image) ||
                        getCategoryFallback()
                      const itemTotal = (Number(product.price) * quantity).toFixed(2)

                      return (
                        <div key={product.id} className="p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="size-16 rounded-xl object-cover border bg-accent/20 shrink-0 cursor-pointer"
                              onClick={() => navigate(`/products/${product.id}`)}
                              onError={(e) => {
                                e.target.src = getCategoryFallback()
                              }}
                            />
                            <div className="space-y-1 min-w-0">
                              <h4
                                className="font-bold text-sm text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                                onClick={() => navigate(`/products/${product.id}`)}
                              >
                                {product.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                RS{Number(product.price).toFixed(2)} / {product.unit}
                              </p>
                              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="size-3" />
                                Subtotal: RS{itemTotal}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-1 bg-accent/40 rounded-lg p-1 border">
                              <button
                                type="button"
                                onClick={() => updateQuantity(product.id, quantity - 1)}
                                className="size-7 rounded bg-background border flex items-center justify-center hover:bg-muted transition-colors"
                                title="Decrease quantity"
                              >
                                <Minus className="size-3" />
                              </button>
                              <span className="w-8 text-center font-bold text-xs">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(product.id, quantity + 1)}
                                disabled={quantity >= (product.stock_quantity ?? 999)}
                                className="size-7 rounded bg-background border flex items-center justify-center hover:bg-muted disabled:opacity-40 transition-colors"
                                title="Increase quantity"
                              >
                                <Plus className="size-3" />
                              </button>
                            </div>

                            {/* Remove item */}
                            <button
                              type="button"
                              onClick={() => removeFromCart(product.id)}
                              className="size-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              ))}

              <div className="pt-2">
                <Link
                  to="/products"
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  <ArrowLeft className="size-3.5" /> Continue Shopping For More Produce
                </Link>
              </div>
            </div>

            {/* Pickup Details & Summary Card */}
            <div>
              <Card className="border shadow-md bg-card sticky top-24">
                <CardHeader className="pb-3 border-b bg-muted/20">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Calendar className="size-4 text-emerald-600" />
                    Pickup & Checkout
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Choose pickup date and reserve with the farmer.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Total Items</span>
                      <span className="font-semibold text-foreground">{cartItems.length}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Farmer Stalls</span>
                      <span className="font-semibold text-foreground">{groupKeys.length}</span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-foreground pt-2 border-t">
                      <span>Order Total</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        RS{cartTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleCheckout} className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold flex items-center gap-1">
                        <Calendar className="size-3 text-muted-foreground" /> Pickup Date *
                      </Label>
                      <Input
                        type="date"
                        min={today}
                        value={pickupDate}
                        onChange={(e) => {
                          setPickupDate(e.target.value)
                          if (errors.pickupDate) setErrors((prev) => ({ ...prev, pickupDate: null }))
                        }}
                        required
                        className="text-xs h-9 rounded-xl"
                      />
                      {errors.pickupDate && (
                        <p className="text-[11px] text-destructive">{errors.pickupDate}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold flex items-center gap-1">
                        <Clock className="size-3 text-muted-foreground" /> Pickup Time *
                      </Label>
                      <Input
                        type="time"
                        value={pickupTime}
                        onChange={(e) => {
                          setPickupTime(e.target.value)
                          if (errors.pickupTime) setErrors((prev) => ({ ...prev, pickupTime: null }))
                        }}
                        required
                        className="text-xs h-9 rounded-xl"
                      />
                      {errors.pickupTime && (
                        <p className="text-[11px] text-destructive">{errors.pickupTime}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Special Instructions (optional)</Label>
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="e.g., ripe fruits, arrive around 10am..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={ordering || multipleFarmers || cartItems.length === 0}
                      className="w-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md h-10 mt-2 gap-1.5"
                    >
                      {ordering ? (
                        'Submitting Pre-Order...'
                      ) : (
                        <>
                          Reserve Pre-Order (RS{cartTotal.toFixed(2)})
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {showLoginModal && (
        <LoginRequiredModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          message="Please sign in or create an account to confirm your pre-order reservation."
        />
      )}
    </PageContainer>
  )
}
