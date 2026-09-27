import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Heart, Trash2, Package, Leaf } from 'lucide-react'

export default function CustomerFavorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/customer/favorites')
      .then(({ data }) => setFavorites(data.data || []))
      .catch(() => {
        toast.error('Failed to load favorites')
        setFavorites([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleRemove = async (id) => {
    try {
      await api.delete(`/customer/favorites/${id}`)
      toast.success('Removed from favorites')
      load()
    } catch {
      toast.error('Failed to remove')
    }
  }

  const products = favorites.filter((f) => f.favoritable_type?.includes('Product') || f.favoritable?.name)
  const farmers  = favorites.filter((f) => f.favoritable_type?.includes('FarmerProfile') || f.favoritable?.stall_name)

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Favorites</h1>
          <p className="text-muted-foreground">Products and farmers you've saved</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}><CardContent className="pt-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Heart className="size-12 mx-auto mb-3 opacity-30" />
            <p>Nothing saved yet. Browse products and farmers to add favorites.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {products.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Package className="size-4" /> Saved Products
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((fav) => {
                    const item = fav.favoritable || fav
                    return (
                      <Card key={fav.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-sm">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.category?.name}</p>
                            </div>
                            <Badge variant="secondary">{item.status}</Badge>
                          </div>
                          <div className="flex justify-between text-sm mb-3">
                            <span className="font-semibold">${Number(item.price).toFixed(2)}</span>
                            <span className="text-muted-foreground">per {item.unit}</span>
                          </div>
                          <Button size="sm" variant="destructive" onClick={() => handleRemove(fav.id)} className="w-full">
                            <Trash2 className="size-3 mr-1" /> Remove
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {farmers.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Leaf className="size-4" /> Saved Farmers
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {farmers.map((fav) => {
                    const item = fav.favoritable || fav
                    return (
                      <Card key={fav.id}>
                        <CardContent className="pt-4">
                          <p className="font-semibold text-sm mb-1">{item.stall_name}</p>
                          <p className="text-xs text-muted-foreground mb-3">{item.user?.name}</p>
                          <Button size="sm" variant="destructive" onClick={() => handleRemove(fav.id)} className="w-full">
                            <Trash2 className="size-3 mr-1" /> Remove
                          </Button>
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
