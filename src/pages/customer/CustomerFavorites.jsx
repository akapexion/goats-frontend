import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Heart, Trash2, Package, Leaf, Store, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CustomerFavorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/customer/favorites')
      .then(({ data }) => setFavorites(data.data || []))
      .catch(() => {
        toast.error('Failed to load saved items')
        setFavorites([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleRemove = async (id) => {
    try {
      await api.delete(`/customer/favorites/${id}`)
      toast.success('Removed from saved items')
      load()
    } catch {
      toast.error('Failed to remove item')
    }
  }

  const products = favorites.filter((f) => f.favoritable_type?.includes('Product'))
  const farmers  = favorites.filter((f) => f.favoritable_type?.includes('FarmerProfile'))
  const markets  = favorites.filter((f) => f.favoritable_type?.includes('Market'))

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Saved Bookmarks & Locations</h1>
          <p className="text-muted-foreground">Manage your saved products, farmer stalls, and market locations</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}><CardContent className="pt-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Heart className="size-12 mx-auto mb-3 opacity-30 text-rose-500" />
            <p>Nothing saved yet. Browse markets, farmers, and products to bookmark items.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {markets.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-primary">
                  <Store className="size-5" /> Saved Market Locations ({markets.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {markets.map((fav) => {
                    const item = fav.favoritable
                    if (!item) return null
                    return (
                      <Card key={fav.id} className="border shadow-sm hover:border-primary transition-all">
                        <CardContent className="pt-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-sm">{item.name}</p>
                              {item.city && <p className="text-xs text-muted-foreground">{item.city}</p>}
                            </div>
                            <Badge variant={item.is_active ? 'default' : 'secondary'}>
                              {item.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          {item.address && <p className="text-xs text-muted-foreground line-clamp-1">{item.address}</p>}
                          <div className="flex gap-2 pt-1 border-t">
                            <Link to={`/markets/${item.id}`} className="flex-1">
                              <Button size="sm" variant="outline" className="w-full text-xs">
                                <ExternalLink className="size-3 mr-1" /> View Market
                              </Button>
                            </Link>
                            <Button size="sm" variant="destructive" onClick={() => handleRemove(fav.id)} className="px-3">
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {farmers.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <Leaf className="size-5" /> Saved Farmers ({farmers.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {farmers.map((fav) => {
                    const item = fav.favoritable
                    if (!item) return null
                    return (
                      <Card key={fav.id} className="border shadow-sm hover:border-emerald-500 transition-all">
                        <CardContent className="pt-4 space-y-3">
                          <div>
                            <p className="font-bold text-sm">{item.stall_name}</p>
                            <p className="text-xs text-muted-foreground">{item.user?.name}</p>
                          </div>
                          {item.market && (
                            <p className="text-xs text-muted-foreground font-medium">Stall at: {item.market.name}</p>
                          )}
                          <div className="flex gap-2 pt-1 border-t">
                            <Link to={`/farmers/${item.id}`} className="flex-1">
                              <Button size="sm" variant="outline" className="w-full text-xs">
                                <ExternalLink className="size-3 mr-1" /> View Stall
                              </Button>
                            </Link>
                            <Button size="sm" variant="destructive" onClick={() => handleRemove(fav.id)} className="px-3">
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {products.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Package className="size-5" /> Saved Products ({products.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((fav) => {
                    const item = fav.favoritable
                    if (!item) return null
                    return (
                      <Card key={fav.id} className="border shadow-sm hover:border-primary transition-all">
                        <CardContent className="pt-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-sm">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.category?.name}</p>
                            </div>
                            <Badge variant={item.status === 'available' ? 'default' : 'secondary'}>
                              {item.status}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-primary">${Number(item.price).toFixed(2)} / {item.unit}</span>
                            <span className="text-muted-foreground">{item.stock_quantity} left</span>
                          </div>
                          <div className="flex gap-2 pt-1 border-t">
                            <Link to={`/products/${item.id}`} className="flex-1">
                              <Button size="sm" variant="outline" className="w-full text-xs">
                                <ExternalLink className="size-3 mr-1" /> View Product
                              </Button>
                            </Link>
                            <Button size="sm" variant="destructive" onClick={() => handleRemove(fav.id)} className="px-3">
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
