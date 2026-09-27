import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Star, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Label } from '@/components/ui/label'

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          onMouseEnter={() => setHovered(i + 1)}
          onMouseLeave={() => setHovered(0)}
        >
          <Star
            className={`size-6 transition-colors ${
              i < (hovered || value) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function ReviewForm({ order, onClose, onSuccess }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) { toast.error('Please select a rating'); return }
    setSaving(true)
    try {
      await api.post('/customer/reviews', {
        farmer_profile_id: order.farmer_profile_id,
        order_id: order.id,
        rating,
        comment,
      })
      toast.success('Review submitted!')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Leave a Review</CardTitle>
          <button onClick={onClose}><X className="size-4" /></button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-accent rounded-md text-sm">
              Order #{order.id} · {order.farmer?.stall_name || 'Farmer'}
            </div>
            <div className="space-y-2">
              <Label>Rating *</Label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div className="space-y-2">
              <Label>Comment (optional)</Label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                placeholder="Share your experience..."
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function OrderCard({ order, onCancel, onReview }) {
  const [expanded, setExpanded] = useState(false)
  const canCancel = ['placed', 'accepted'].includes(order.status)
  const canReview = order.status === 'completed'

  const statusColor = {
    placed: 'secondary', accepted: 'default', declined: 'destructive',
    ready: 'default', completed: 'outline', cancelled: 'destructive',
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Order #{order.id}</p>
            <p className="text-xs text-muted-foreground">
              {order.farmer?.stall_name || 'Farmer'} · {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">${Number(order.total_amount).toFixed(2)}</span>
            <Badge variant={statusColor[order.status] || 'secondary'} className="capitalize">
              {order.status}
            </Badge>
            <button onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-3">
          <div className="text-sm space-y-1">
            <p><span className="text-muted-foreground">Pickup:</span> {order.pickup_date} at {order.pickup_time}</p>
            {order.note && <p><span className="text-muted-foreground">Note:</span> {order.note}</p>}
          </div>

          {order.items?.length > 0 && (
            <div className="border rounded-md divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span>{item.product?.name || 'Product'} × {item.quantity}</span>
                  <span className="text-muted-foreground">${Number(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {canCancel && (
              <Button size="sm" variant="destructive" onClick={() => onCancel(order.id)}>
                Cancel Order
              </Button>
            )}
            {canReview && (
              <Button size="sm" variant="outline" onClick={() => onReview(order)}>
                <Star className="size-3 mr-1" /> Leave Review
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export default function CustomerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewOrder, setReviewOrder] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/customer/orders')
      .then(({ data }) => setOrders(data.data?.data || data.data || []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCancel = async (id) => {
    if (!confirm('Cancel this order?')) return
    try {
      await api.patch(`/customer/orders/${id}/cancel`)
      toast.success('Order cancelled')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order')
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>No orders yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                onCancel={handleCancel}
                onReview={setReviewOrder}
              />
            ))}
          </div>
        )}
      </div>

      {reviewOrder && (
        <ReviewForm
          order={reviewOrder}
          onClose={() => setReviewOrder(null)}
          onSuccess={load}
        />
      )}
    </AppLayout>
  )
}
