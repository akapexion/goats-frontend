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
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getProductImageUrl, getCategoryFallback } from '@/lib/imageUtils'

import ProductCard from '@/components/ProductCard'
import { useCart } from '@/context/CartContext'

function CartSidebar({ onClear, onCheckout }) {
  const { cartItems, cartTotal } = useCart()
  const cartEntries = cartItems.filter((item) => (item.quantity || 0) > 0)

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
            {cartEntries.map(({ product, quantity }) => {
              if (!product) return null
              return (
                <div key={product.id} className="flex items-center justify-between text-xs pt-1">
                  <span className="truncate flex-1 mr-2 font-medium">{product.name} × {quantity}</span>
                  <span className="font-bold text-primary">${(product.price * quantity).toFixed(2)}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between text-sm font-bold pt-2 border-t">
            <span>Total Amount</span>
            <span className="text-primary">${cartTotal.toFixed(2)}</span>
          </div>
          <Button size="sm" className="w-full font-bold shadow-md" onClick={onCheckout}>
            Proceed to Pre-Order
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

import PageHeroBanner from '@/components/PageHeroBanner'

export default function CustomerProducts({ embedded = false }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const { clearCart } = useCart()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [markets, setMarkets] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedMarket, setSelectedMarket] = useState('')
  const [selectedDay, setSelectedDay] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)

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
    const querySearch = searchParams.get('search')
    if (querySearch !== null && querySearch !== search) {
      setSearch(querySearch)
    }
  }, [searchParams])

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.data?.data || data.data || [])).catch(() => {})
    api.get('/markets').then(({ data }) => setMarkets(data.data?.data || data.data || [])).catch(() => {})
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchProducts()
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
              onChange={(e) => {
                if (e.target.value) {
                  navigate(`/categories/${e.target.value}`)
                } else {
                  setSelectedCategory('')
                }
              }}
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
                onRequireLogin={(msg) => {
                  setLoginModalMessage(msg)
                  setShowLoginModal(true)
                }}
              />
            ))}
          </div>
        )}
      </div>

      <CartSidebar
        onClear={clearCart}
        onCheckout={() => navigate('/cart')}
      />

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Authentication Required"
        message={loginModalMessage}
      />
    </PageContainer>
  )
}
