import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Star, Trash2, Eye, EyeOff } from 'lucide-react'

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`size-3 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`} />
      ))}
    </div>
  )
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/admin/reviews')
      .then(({ data }) => setReviews(data.data?.data || data.data || []))
      .catch(() => toast.error('Failed to load reviews'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleHide = async (id) => {
    try {
      await api.delete(`/admin/reviews/${id}`)
      toast.success('Review hidden')
      load()
    } catch { toast.error('Failed to hide review') }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Content Moderation</h1>
          <p className="text-muted-foreground">Review and moderate customer reviews</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Star className="size-12 mx-auto mb-3 opacity-30" />
            <p>No reviews yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <Card key={r.id} className={!r.is_visible ? 'opacity-50' : ''}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{r.customer?.name || 'Customer'}</p>
                        <StarDisplay rating={r.rating} />
                        {!r.is_visible && <Badge variant="secondary">Hidden</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Farmer: {r.farmer?.stall_name || r.farmer?.user?.name || '—'}
                        {r.product && ` · Product: ${r.product.name}`}
                      </p>
                      {r.comment && <p className="text-sm text-muted-foreground mt-1">{r.comment}</p>}
                      <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                    {r.is_visible && (
                      <Button size="sm" variant="destructive" onClick={() => handleHide(r.id)}>
                        <EyeOff className="size-3 mr-1" /> Hide
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
