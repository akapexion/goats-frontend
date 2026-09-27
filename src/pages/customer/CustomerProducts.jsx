import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Search, ShoppingCart, Heart, X, Plus, Minus } from 'lucide-react'

function ProductCard({ product, cartQty, onAdd, onRemove, onFavorite }) {
  return (
    <Card className="flex flex-col card-hover">
      {product.image_path && (
        <img
          src={`http://localhost:8000/storage/${product.image_path}`}
          alt={product.name}
          className="h-36 w-full object-cover rounded-t-xl"
          onError={(e) => { e.target.style.display = 'none' }}
        />
      )}
      <CardHeader className="pb-1 flex-1">
        <CardTitle className="text-sm leading-tight">{product.name}</CardTitle>
        <CardDescription className="text-xs line-clamp-2">{product.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold">${Number(product.price).toFixed(2)}</span>
          <span className="text-xs text-muted-foreground">per {product.unit}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{product.farmer?.stall_name || 'Farmer'}</span>
          <span>{product.stock_quantity} left</span>
        </div>
        <div className="flex items-center gap-2">
          {cartQty > 0 ? (
            <div className="flex items-center gap-1 flex-1">
              <button onClick={() => onRemove(product)} className="size-7 rounded border flex items-center justify-center">
                <Minus className="size-3" />
              </button>
              <span className="flex-1 text-center text-sm font-medium">{cartQty}</span>
              <button
                onClick={() => onAdd(product)}
                disabled={cartQty >= product.stock_quantity}
                className="size-7 rounded border flex items-center justify-center disabled:opacity-40"
              >
                <Plus className="size-3" />
              </button>
            </div>
          ) : (
            <Button size="sm" className="flex-1" onClick={() => onAdd(product)} disabled={product.stock_quantity === 0}>
              <ShoppingCart className="size-3 mr-1" /> Add
            </Button>
          )}
          <button
            onClick={() => onFavorite(product)}
            className="size-8 rounded border flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors"
          >
            <Heart className="size-3.5" />
          </button>
        </div>
      </CardContent>
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
    <div className="fixed bottom-4 right-4 z-40 w-80 shadow-xl">
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm">Cart ({cartEntries.length} items)</CardTitle>
          <button onClick={onClear} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="max-h-48 overflow-y-auto space-y-1">
            {cartEntries.map(([pid, qty]) => {
              const p = products.find((x) => x.id === Number(pid))
              if (!p) return null
              return (
                <div key={pid} className="flex items-center justify-between text-xs">
                  <span className="truncate flex-1 mr-2">{p.name} × {qty}</span>
                  <span className="font-medium shrink-0">${(p.price * qty).toFixed(2)}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between text-sm font-semibold pt-1 border-t">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <Button size="sm" className="w-full" onClick={onCheckout}>
            <ShoppingCart className="size-3 mr-2" /> Place Order
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function CheckoutModal({ cart, products, farmerGroups, onClose, onSubmit, loading }) {
  const cartEntries = Object.entries(cart).filter(([, q]) => q > 0)
  const [pickupDate, setPickupDate] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [note, setNote] = useState('')
  const today = new Date().toISOString().split('T')[0]

  const total = cartEntries.reduce((sum, [pid, qty]) => {
    const p = products.find((x) => x.id === Number(pid))
    return sum + (p ? p.price * qty : 0)
  }, 0)

  const farmerGroups_ = {}
  cartEntries.forEach(([pid, qty]) => {
    const p = products.find((x) => x.id === Number(pid))
    if (!p) return
    const fid = p.farmer_profile_id
    if (!farmerGroups_[fid]) farmerGroups_[fid] = { farmer: p.farmer, items: [] }
    farmerGroups_[fid].items.push({ product_id: Number(pid), quantity: qty, product: p })
  })

  const multipleFFarmers = Object.keys(farmerGroups_).length > 1

  const handleSubmit = (e) => {
    e.preventDefault()
    if (multipleFFarmers) {
      toast.error('All items must be from the same farmer. Please split into separate orders.')
      return
    }
    const [farmerId, group] = Object.entries(farmerGroups_)[0]
    onSubmit({
      farmer_profile_id: Number(farmerId),
      pickup_date: pickupDate,
      pickup_time: pickupTime,
      note,
      items: group.items.map(({ product_id, quantity }) => ({ product_id, quantity })),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <Card className="w-full max-w-md my-4">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Confirm Order</CardTitle>
          <button onClick={onClose}><X className="size-4" /></button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {multipleFFarmers && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                Your cart has products from multiple farmers. Each order must be from a single farmer.
              </div>
            )}

            <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
              {cartEntries.map(([pid, qty]) => {
                const p = products.find((x) => x.id === Number(pid))
                if (!p) return null
                return (
                  <div key={pid} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span>{p.name} × {qty}</span>
                    <span className="font-medium">${(p.price * qty).toFixed(2)}</span>
                  </div>
                )
              })}
            </div>

            <div className="text-sm font-semibold text-right">Total: ${total.toFixed(2)}</div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Pickup Date *</Label>
                <Input type="date" min={today} value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>Pickup Time *</Label>
                <Input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1">
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
              <Button type="submit" disabled={loading || multipleFFarmers} className="flex-1">
                {loading ? 'Placing...' : 'Place Order'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CustomerProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [cart, setCart] = useState({})
  const [showCheckout, setShowCheckout] = useState(false)
  const [ordering, setOrdering] = useState(false)

  const load = (params = {}) => {
    setLoading(true)
    api.get('/products', { params })
      .then(({ data }) => {
        const result = data.data
        setProducts(result?.data || result || [])
      })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    api.get('/categories')
      .then(({ data }) => setCategories(data.data?.data || data.data || []))
      .catch(() => {})
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    load({ search, category_id: selectedCategory || undefined })
  }

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId)
    load({ search, category_id: catId || undefined })
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

  const handleFavorite = async (product) => {
    try {
      await api.post('/customer/favorites', { favoritable_type: 'product', favoritable_id: product.id })
      toast.success('Added to favorites')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Already in favorites')
    }
  }

  const handleOrder = async (payload) => {
    setOrdering(true)
    try {
      await api.post('/customer/orders', payload)
      toast.success('Order placed successfully!')
      setCart({})
      setShowCheckout(false)
      load({ search, category_id: selectedCategory || undefined })
    } catch (err) {
      const msgs = err.response?.data?.errors
      if (msgs) Object.values(msgs).flat().forEach((m) => toast.error(m))
      else toast.error(err.response?.data?.message || 'Failed to place order')
    } finally {
      setOrdering(false)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Browse Products</h1>
          <p className="text-muted-foreground">Fresh products from local farmers</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="submit" variant="outline" size="icon">
              <Search className="size-4" />
            </Button>
          </form>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}><CardContent className="pt-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="size-12 mx-auto mb-3 opacity-30" />
            <p>No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                cartQty={cart[p.id] || 0}
                onAdd={addToCart}
                onRemove={removeFromCart}
                onFavorite={handleFavorite}
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
        onCheckout={() => setShowCheckout(true)}
      />

      {showCheckout && (
        <CheckoutModal
          cart={cart}
          products={products}
          onClose={() => setShowCheckout(false)}
          onSubmit={handleOrder}
          loading={ordering}
        />
      )}
    </AppLayout>
  )
}
