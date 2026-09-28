import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Heart, Plus, Minus, Info, Store, Leaf, CheckCircle, AlertTriangle } from 'lucide-react'
import { getProductImageUrl, getCategoryFallback } from '@/lib/imageUtils'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'

export default function ProductCard({ product, onRequireLogin }) {
  const navigate = useNavigate()
  const { cart, addToCart, updateQuantity } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()

  if (!product) return null

  const isAvailable = product.status === 'available' && product.stock_quantity > 0
  const isLowStock = isAvailable && product.stock_quantity <= 5
  const dbImage = product.image_url || product.image_path || product.image
  const imageUrl = getProductImageUrl(dbImage) || getCategoryFallback()
  const cartQty = cart[product.id]?.quantity || 0
  const wishlisted = isWishlisted(product.id)

  const handleNavigate = () => {
    navigate(`/products/${product.id}`)
  }

  const handleAdd = (e) => {
    e.stopPropagation()
    addToCart(product, 1)
  }

  const handleRemove = (e) => {
    e.stopPropagation()
    updateQuantity(product.id, cartQty - 1)
  }

  const handleBookmark = async (e) => {
    e.stopPropagation()
    const result = await toggleWishlist(product)
    if (result?.requiresLogin && onRequireLogin) {
      onRequireLogin('Please sign in to bookmark farm products.')
    }
  }

  return (
    <Card className="flex flex-col justify-between backdrop-blur-md bg-card/80 border shadow-md hover:-translate-y-1 hover:border-primary hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="cursor-pointer" onClick={handleNavigate}>
        <div className="relative h-40 bg-accent/30 overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.src = getCategoryFallback()
            }}
          />
          <div className="absolute top-2 right-2">
            <Badge
              variant={isAvailable ? (isLowStock ? 'warning' : 'default') : 'destructive'}
              className="text-[10px] px-2 py-0.5"
            >
              {isAvailable ? (isLowStock ? 'Low Stock' : 'Available') : 'Sold Out'}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-1 pt-3">
          <div className="flex items-start justify-between gap-1">
            <CardTitle className="text-base font-bold leading-snug cursor-pointer hover:text-primary transition-colors">
              {product.name}
            </CardTitle>
          </div>
          <CardDescription className="text-xs line-clamp-1">
            {product.category?.name || 'General'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-2 text-xs">
          <div className="flex items-baseline justify-between pt-1">
            <span className="font-extrabold text-base text-primary">
              ${Number(product.price).toFixed(2)}
            </span>
            <span className="text-muted-foreground font-medium">per {product.unit}</span>
          </div>

          <div className="space-y-1 text-muted-foreground pt-1 border-t">
            <p className="flex items-center gap-1 text-foreground/90 font-medium truncate">
              <Leaf className="size-3 text-emerald-500 shrink-0" />{' '}
              {product.farmer?.stall_name || 'Local Farmer'}
            </p>
            {product.farmer?.market && (
              <p className="flex items-center gap-1 text-xs truncate">
                <Store className="size-3 text-primary shrink-0" /> {product.farmer.market.name}
              </p>
            )}
            <p
              className={`flex items-center gap-1 font-semibold ${
                isAvailable
                  ? isLowStock
                    ? 'text-amber-500'
                    : 'text-emerald-600 dark:text-emerald-400'
                  : 'text-destructive'
              }`}
            >
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
              <button
                type="button"
                onClick={handleRemove}
                className="size-7 rounded bg-background border flex items-center justify-center hover:bg-muted transition-colors"
                title="Decrease quantity"
              >
                <Minus className="size-3" />
              </button>
              <span className="flex-1 text-center font-bold text-sm">{cartQty}</span>
              <button
                type="button"
                onClick={handleAdd}
                disabled={cartQty >= product.stock_quantity}
                className="size-7 rounded bg-background border flex items-center justify-center disabled:opacity-40 hover:bg-muted transition-colors"
                title="Increase quantity"
              >
                <Plus className="size-3" />
              </button>
            </div>
          ) : (
            <Button
              size="sm"
              className="flex-1 font-semibold text-xs"
              onClick={handleAdd}
              disabled={!isAvailable}
            >
              <ShoppingCart className="size-3 mr-1" /> Add
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              handleNavigate()
            }}
            className="px-2"
            title="View Details"
          >
            <Info className="size-3.5" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleBookmark}
            className={`px-2 ${wishlisted ? 'text-rose-600' : 'text-rose-500 hover:text-rose-600'}`}
            title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`size-3.5 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </Button>
        </div>
      </div>
    </Card>
  )
}
