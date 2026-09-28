import { useEffect, useState } from 'react'
import PageContainer from '@/components/PageContainer'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Star, X, ChevronDown, ChevronUp, RotateCcw, Edit, ShoppingCart, Calendar, Clock, MapPin, Store } from 'lucide-react'

import { validateRating, validateFutureDate, validateRequired } from '@/lib/validation'

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
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    const ratingErr = validateRating(rating)
    if (ratingErr) {
      setErrors({ rating: ratingErr })
      return
    }

    if (comment.length > 1000) {
      setErrors({ comment: 'Comment cannot exceed 1000 characters.' })
      return
    }

    setSaving(true)
    try {
      await api.post('/customer/reviews', {
        farmer_profile_id: order.farmer_profile_id,
        order_id: order.id,
        rating,
        comment: comment.trim() || null,
      })
      toast.success('Review submitted successfully!')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <CardTitle className="text-base font-bold">Review Farmer</CardTitle>
          <button onClick={onClose}><X className="size-4" /></button>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-accent/50 rounded-lg text-xs space-y-1">
              <p className="font-bold">Order #{order.id} · {order.farmer?.stall_name || 'Farmer'}</p>
              <p className="text-muted-foreground">Pickup Date: {order.pickup_date}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Rating *</Label>
              <StarRating value={rating} onChange={(val) => {
                setRating(val)
                if (errors.rating) setErrors((prev) => ({ ...prev, rating: null }))
              }} />
              {errors.rating && <p className="text-xs text-destructive mt-1">{errors.rating}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-semibold">Comment (optional)</Label>
                <span className="text-[11px] text-muted-foreground">{comment.length} / 1000</span>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                maxLength={1000}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                placeholder="Share your experience with this farmer..."
              />
              {errors.comment && <p className="text-xs text-destructive mt-1">{errors.comment}</p>}
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={saving} className="flex-1 font-bold shadow-md">
                {saving ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function ModifyOrderModal({ order, onClose, onSuccess }) {
  const [pickupDate, setPickupDate] = useState(order.pickup_date || '')
  const [pickupTime, setPickupTime] = useState(order.pickup_time || '')
  const [note, setNote] = useState(order.note || '')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const today = new Date().toISOString().split('T')[0]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    const fieldErrors = {}
    const dateErr = validateFutureDate(pickupDate, 'Pickup Date')
    if (dateErr) fieldErrors.pickupDate = dateErr

    const timeErr = validateRequired(pickupTime, 'Pickup Time')
    if (timeErr) fieldErrors.pickupTime = timeErr

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    setSaving(true)
    try {
      await api.put(`/customer/orders/${order.id}`, {
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        note,
      })
      toast.success('Order updated successfully!')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <CardTitle className="text-base font-bold">Modify Order #{order.id}</CardTitle>
          <button onClick={onClose}><X className="size-4" /></button>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Pickup Date *</Label>
                <Input
                  type="date"
                  min={today}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  required
                />
                {errors.pickupDate && <p className="text-[11px] text-destructive mt-0.5">{errors.pickupDate}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Pickup Time *</Label>
                <Input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  required
                />
                {errors.pickupTime && <p className="text-[11px] text-destructive mt-0.5">{errors.pickupTime}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Note / Special Instructions</Label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={saving} className="flex-1 font-bold shadow-md">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function OrderCard({ order, onCancel, onReview, onModify, onReorder, reorderingId }) {
  const [expanded, setExpanded] = useState(true)
  const canModify = ['placed', 'accepted'].includes(order.status)
  const canCancel = ['placed', 'accepted'].includes(order.status)
  const canReview = order.status === 'completed'
  const canReorder = ['completed', 'cancelled'].includes(order.status)

  const statusColor = {
    placed: 'secondary', accepted: 'default', ready_for_pickup: 'default',
    completed: 'outline', cancelled: 'destructive',
  }

  return (
    <Card className="border shadow-md overflow-hidden">
      <CardHeader className="pb-3 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base">Order #{order.id}</span>
              <Badge variant={statusColor[order.status] || 'secondary'} className="capitalize text-xs">
                {order.status.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
              <span>{order.farmer?.stall_name || 'Farmer Stall'}</span>
              <span>•</span>
              <span>Placed {new Date(order.created_at).toLocaleDateString()}</span>
            </p>
          </div>
          <div className="flex items-center gap-3 justify-between sm:justify-end">
            <span className="text-base font-extrabold text-primary">${Number(order.total_amount).toFixed(2)}</span>
            <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-accent rounded-md">
              {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-accent/30 p-3 rounded-lg border">
            <div>
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Calendar className="size-3.5 text-amber-500" /> Pickup Date:
              </span>
              <p className="font-bold text-foreground mt-0.5">{order.pickup_date}</p>
            </div>
            <div>
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Clock className="size-3.5 text-blue-500" /> Pickup Time:
              </span>
              <p className="font-bold text-foreground mt-0.5">{order.pickup_time}</p>
            </div>
            {order.farmer?.market && (
              <div className="sm:col-span-2 pt-1 border-t">
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  <Store className="size-3.5 text-primary" /> Market Stall Location:
                </span>
                <p className="font-semibold text-foreground mt-0.5">{order.farmer.market.name} ({order.farmer.market.address})</p>
              </div>
            )}
            {order.note && (
              <div className="sm:col-span-2 pt-1 border-t">
                <span className="text-muted-foreground font-medium">Order Note:</span>
                <p className="text-foreground mt-0.5">{order.note}</p>
              </div>
            )}
          </div>

          {order.items?.length > 0 && (
            <div className="border rounded-lg divide-y overflow-hidden">
              <div className="bg-muted/40 px-3 py-1.5 text-xs font-bold text-muted-foreground flex justify-between">
                <span>Item</span>
                <span>Subtotal</span>
              </div>
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-3 py-2 text-xs">
                  <span className="font-medium">{item.product?.name || 'Product'} × {item.quantity}</span>
                  <span className="font-bold text-foreground">${Number(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2 border-t justify-end">
            {canModify && (
              <Button size="sm" variant="outline" onClick={() => onModify(order)}>
                <Edit className="size-3 mr-1" /> Modify Order
              </Button>
            )}
            {canCancel && (
              <Button size="sm" variant="destructive" onClick={() => onCancel(order.id)}>
                Cancel Order
              </Button>
            )}
            {canReorder && (
              <Button size="sm" variant="default" disabled={reorderingId === order.id} onClick={() => onReorder(order.id)}>
                <RotateCcw className="size-3 mr-1" /> {reorderingId === order.id ? 'Re-ordering...' : 'Re-Order'}
              </Button>
            )}
            {canReview && (
              <Button size="sm" variant="outline" onClick={() => onReview(order)}>
                <Star className="size-3 mr-1 text-amber-500 fill-amber-500" /> Rate & Review Farmer
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
  const [modifyOrder, setModifyOrder] = useState(null)
  const [reorderingId, setReorderingId] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/customer/orders')
      .then(({ data }) => setOrders(data.data?.data || data.data || []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this order? Reserved stock will be restored.')) return
    try {
      await api.patch(`/customer/orders/${id}/cancel`)
      toast.success('Order cancelled and stock restored')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order')
    }
  }

  const handleReorder = async (id) => {
    setReorderingId(id)
    try {
      await api.post(`/customer/orders/${id}/reorder`)
      toast.success('Re-ordered successfully!')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to re-order items')
    } finally {
      setReorderingId(null)
    }
  }

  return (
    <PageContainer>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold">My Pre-Orders & History</h1>
          <p className="text-muted-foreground">View order details, modify pickup dates, cancel orders, or re-order past purchases</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardContent className="pt-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-card border rounded-xl p-8">
            <ShoppingCart className="size-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-lg">No orders found</p>
            <p className="text-sm mt-1">Browse fresh produce and place your first pre-order.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                onCancel={handleCancel}
                onReview={setReviewOrder}
                onModify={setModifyOrder}
                onReorder={handleReorder}
                reorderingId={reorderingId}
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

      {modifyOrder && (
        <ModifyOrderModal
          order={modifyOrder}
          onClose={() => setModifyOrder(null)}
          onSuccess={load}
        />
      )}
    </PageContainer>
  )
}
