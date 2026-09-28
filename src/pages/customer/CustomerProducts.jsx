import { useEffect, useState } from 'react'
import PageContainer from '@/components/PageContainer'
import LoginRequiredModal from '@/components/LoginRequiredModal'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Search, ShoppingCart, Heart, X, Plus, Minus, Info, Filter, Store, Leaf, CheckCircle, AlertTriangle, Package } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { getProductImageUrl, getCategoryFallback } from '@/lib/imageUtils'

function ProductCard({ product, cartQty, onAdd, onRemove, onBookmark, onViewDetails }) {
  const isAvailable = product.status === 'available' && product.stock_quantity > 0
  const isLowStock = isAvailable && product.stock_quantity <= 5
  const imageUrl = getProductImageUrl(product.image_path) || getCategoryFallback(product.category?.name)

  return (
    <Card className="flex flex-col justify-between backdrop-blur-md bg-card/80 border shadow-md hover:-translate-y-1 hover:border-primary hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div>
        <div className="relative h-40 bg-accent/30 overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => { e.target.src = getCategoryFallback(product.category?.name) }}
          />
          <div className="absolute top-2 right-2">
            <Badge variant={isAvailable ? (isLowStock ? "warning" : "default") : "destructive"} className="text-[10px] px-2 py-0.5">
              {isAvailable ? (isLowStock ? 'Low Stock' : 'Available') : 'Sold Out'}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-1 pt-3">
          <div className="flex items-start justify-between gap-1">
            <CardTitle className="text-base font-bold leading-snug cursor-pointer hover:text-primary transition-colors" onClick={() => onViewDetails(product.id)}>
              {product.name}
            </CardTitle>
          </div>
          <CardDescription className="text-xs line-clamp-1">{product.category?.name || 'General'}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-2 text-xs">
          <div className="flex items-baseline justify-between pt-1">
            <span className="font-extrabold text-base text-primary">${Number(product.price).toFixed(2)}</span>
            <span className="text-muted-foreground font-medium">per {product.unit}</span>
          </div>

          <div className="space-y-1 text-muted-foreground pt-1 border-t">
            <p className="flex items-center gap-1 text-foreground/90 font-medium truncate">
              <Leaf className="size-3 text-emerald-500 shrink-0" /> {product.farmer?.stall_name || 'Local Farmer'}
            </p>
            {product.farmer?.market && (
              <p className="flex items-center gap-1 text-xs truncate">
                <Store className="size-3 text-primary shrink-0" /> {product.farmer.market.name}
              </p>
            )}
            <p className={`flex items-center gap-1 font-semibold ${isAvailable ? (isLowStock ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400') : 'text-destructive'}`}>
              {isAvailable ? (
                <>
                  {isLowStock ? <AlertTriangle className="size-3" /> : <CheckCircle className="size-3" />}
                  {product.stock_quantity} {product.unit}s left
                </>
              ) : (
                'Currently Unavailable'
              )}
            </p>
          </div>
        </CardContent>
      </div>

      <div className="p-4 pt-0 space-y-2">
        <div className="flex items-center gap-2">
          {cartQty > 0 ? (
            <div className="flex items-center gap-1 flex-1 bg-accent/50 rounded-md p-1 border">
              <button onClick={() => onRemove(product)} className="size-7 rounded bg-background border flex items-center justify-center">
                <Minus className="size-3" />
              </button>
              <span className="flex-1 text-center font-bold text-sm">{cartQty}</span>
              <button
                onClick={() => onAdd(product)}
                disabled={cartQty >= product.stock_quantity}
                className="size-7 rounded bg-background border flex items-center justify-center disabled:opacity-40"
              >
                <Plus className="size-3" />
              </button>
            </div>
          ) : (
            <Button
              size="sm"
              className="flex-1 font-semibold text-xs"
              onClick={() => onAdd(product)}
              disabled={!isAvailable}
            >
              <ShoppingCart className="size-3 mr-1" /> Add
            </Button>
          )}

          <Button size="sm" variant="outline" onClick={() => onViewDetails(product.id)} className="px-2">
            <Info className="size-3.5" />
          </Button>

          <Button size="sm" variant="ghost" onClick={() => onBookmark(product)} className="px-2 text-rose-500">
            <Heart className="size-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

function CartSidebar({ cart, products, onRemove, onAdd, onClear, onCheckout }) {
  const cartEntries = Object.entries(cart).filter(([, q]) => q > 0)
  const total = cartEntries.reduce((sum, [pid, qty]) => {
    const p = products.find((x) => x.id === Number(pid))
    return sum + (p ? p.price * qty : 0)
  }, 0)

  if (cartEntries.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
      <Card className="border-primary/30">
        <CardHeader className="pb-2 flex flex-row items-center justify-between border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ShoppingCart className="size-4 text-primary" /> Cart ({cartEntries.length} items)
          </CardTitle>
          <button onClick={onClear} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </CardHeader>
        <CardContent className="space-y-3 pt-3">
          <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y">
            {cartEntries.map(([pid, qty]) => {
              const p = products.find((x) => x.id === Number(pid))
              if (!p) return null
              return (
                <div key={pid} className="flex items-center justify-between text-xs pt-1">
                  <span className="truncate flex-1 mr-2 font-medium">{p.name} × {qty}</span>
                  <span className="font-bold text-primary">${(p.price * qty).toFixed(2)}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between text-sm font-bold pt-2 border-t">
            <span>Total Amount</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
          <Button size="sm" className="w-full font-bold shadow-md" onClick={onCheckout}>
            Proceed to Pre-Order
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function CheckoutModal({ cart, products, onClose, onSubmit, loading }) {
  const cartEntries = Object.entries(cart).filter(([, q]) => q > 0)
  const [pickupDate, setPickupDate] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [note, setNote] = useState('')
  const today = new Date().toISOString().split('T')[0]

  const total = cartEntries.reduce((sum, [pid, qty]) => {
    const p = products.find((x) => x.id === Number(pid))
    return sum + (p ? p.price * qty : 0)
  }, 0)

  const farmerGroups = {}
  cartEntries.forEach(([pid, qty]) => {
    const p = products.find((x) => x.id === Number(pid))
    if (!p) return
    const fid = p.farmer_profile_id
    if (!farmerGroups[fid]) farmerGroups[fid] = { farmer: p.farmer, items: [] }
    farmerGroups[fid].items.push({ product_id: Number(pid), quantity: qty, product: p })
  })

  const multipleFarmers = Object.keys(farmerGroups).length > 1

  const handleSubmit = (e) => {
    e.preventDefault()
    if (multipleFarmers) {
      toast.error('All items must be from the same farmer. Please adjust your cart.')
      return
    }
    const [farmerId, group] = Object.entries(farmerGroups)[0]
    onSubmit({
      farmer_profile_id: Number(farmerId),
      pickup_date: pickupDate,
      pickup_time: pickupTime,
      note,
      items: group.items.map(({ product_id, quantity }) => ({ product_id, quantity })),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <CardTitle className="text-base font-bold">Confirm Pre-Order</CardTitle>
          <button onClick={onClose}><X className="size-4" /></button>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {multipleFarmers && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-md text-xs font-semibold">
                Your cart contains items from multiple farmers. Please order from one farmer at a time.
              </div>
            )}

            <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
              {cartEntries.map(([pid, qty]) => {
                const p = products.find((x) => x.id === Number(pid))
                if (!p) return null
                return (
                  <div key={pid} className="flex items-center justify-between px-3 py-2 text-xs">
                    <span>{p.name} × {qty}</span>
                    <span className="font-bold">${(p.price * qty).toFixed(2)}</span>
                  </div>
                )
              })}
            </div>

            <div className="text-sm font-bold text-right">
              Total: <span className="text-primary">${total.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Pickup Date *</Label>
                <Input type="date" min={today} value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Pickup Time *</Label>
                <Input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1">
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
              <Button type="submit" disabled={loading || multipleFarmers} className="flex-1 font-bold shadow-md">
                {loading ? 'Placing...' : 'Place Pre-Order'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

import PageHeroBanner from '@/components/PageHeroBanner'

export default function CustomerProducts({ embedded = false }) {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters state
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedMarket, setSelectedMarket] = useState('')
  const [selectedDay, setSelectedDay] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)

  // Cart & Modals
  const [cart, setCart] = useState({})
  const [showCheckout, setShowCheckout] = useState(false)
  const [ordering, setOrdering] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginModalMessage, setLoginModalMessage] = useState('')

  const fetchProducts = () => {
    setLoading(true)
    const params = {}
    if (search) params.search = search
    if (selectedCategory) params.category_id = selectedCategory
    if (selectedMarket) params.market_id = selectedMarket
    if (selectedDay) params.market_day = selectedDay
    if (minPrice) params.min_price = minPrice
    if (maxPrice) params.max_price = maxPrice
    if (inStockOnly) params.in_stock_only = 1

    api.get('/products', { params })
      .then(({ data }) => setProducts(data.data?.data || data.data || []))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, selectedMarket, selectedDay, inStockOnly])

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.data?.data || data.data || [])).catch(() => {})
    api.get('/markets').then(({ data }) => setMarkets(data.data?.data || data.data || [])).catch(() => {})
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchProducts()
  }

  const addToCart = (product) => {
    setCart((prev) => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }))
  }

  const removeFromCart = (product) => {
    setCart((prev) => {
      const next = { ...prev, [product.id]: (prev[product.id] || 1) - 1 }
      if (next[product.id] <= 0) delete next[product.id]
      return next
    })
  }

  const handleBookmark = async (product) => {
    if (!user) {
      setLoginModalMessage('Please sign in to bookmark farm products.')
      setShowLoginModal(true)
      return
    }
    try {
      await api.post('/customer/favorites', { favoritable_type: 'product', favoritable_id: product.id })
      toast.success('Product bookmarked!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Already bookmarked')
    }
  }

  const handleInitiateCheckout = () => {
    if (!user) {
      setLoginModalMessage('Please sign in or create an account to confirm your pre-order.')
      setShowLoginModal(true)
      return
    }
    setShowCheckout(true)
  }

  const handleOrderSubmit = async (payload) => {
    setOrdering(true)
    try {
      await api.post('/customer/orders', payload)
      toast.success('Pre-order placed successfully! Check your orders on the web.')
      setCart({})
      setShowCheckout(false)
      fetchProducts()
    } catch (err) {
      const msgs = err.response?.data?.errors
      if (msgs) Object.values(msgs).flat().forEach((m) => toast.error(m))
      else toast.error(err.response?.data?.message || 'Failed to place pre-order')
    } finally {
      setOrdering(false)
    }
  }

  const daysList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <PageContainer embedded={embedded}>
      <div className="space-y-6">
        {!embedded && (
          <PageHeroBanner
            badge="Seasonal Produce & Harvests"
            title="Fresh Farm Produce"
            description="Browse fresh fruits, organic vegetables, dairy, and artisanal goods available for pre-order pickup from local farm stalls."
            icon={Package}
          />
        )}

        {/* Multi-Filter Bar */}
        <div className="bg-card border p-4 rounded-xl shadow-sm space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm font-medium"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm font-medium"
            >
              <option value="">All Markets</option>
              {markets.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>

            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm font-medium"
            >
              <option value="">All Market Days</option>
              {daysList.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-muted-foreground flex items-center gap-1">
                <Filter className="size-3" /> Price Range:
              </span>
              <Input
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-8 w-24 text-xs"
              />
              <span>–</span>
              <Input
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-8 w-24 text-xs"
              />
              <Button size="sm" variant="outline" onClick={fetchProducts} className="h-8 text-xs">
                Apply Price
              </Button>
            </div>

            <label className="flex items-center gap-2 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary size-4"
              />
              In Stock Only
            </label>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}><CardContent className="pt-6"><Skeleton className="h-56 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="size-12 mx-auto mb-3 opacity-30" />
            <p>No products match your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                cartQty={cart[p.id] || 0}
                onAdd={addToCart}
                onRemove={removeFromCart}
                onBookmark={handleBookmark}
                onViewDetails={(pid) => navigate(`/products/${pid}`)}
              />
            ))}
          </div>
        )}
      </div>

      <CartSidebar
        cart={cart}
        products={products}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onClear={() => setCart({})}
        onCheckout={handleInitiateCheckout}
      />

      {showCheckout && (
        <CheckoutModal
          cart={cart}
          products={products}
          onClose={() => setShowCheckout(false)}
          onSubmit={handleOrderSubmit}
          loading={ordering}
        />
      )}

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => setShowCheckout(true)}
        title="Authentication Required"
        message={loginModalMessage}
      />
    </PageContainer>
  )
}
