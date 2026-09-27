import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/AppLayout'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Star, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'
import { Label } from '@/components/ui/label'

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  )
}

function ReviewCard({ review, onReply }) {
  const [expanded, setExpanded] = useState(false)
  const [reply, setReply] = useState(review.farmer_reply || '')
  const [saving, setSaving] = useState(false)
  const [showReplyBox, setShowReplyBox] = useState(false)

  const handleReply = async () => {
    setSaving(true)
    try {
      await api.post(`/farmer/reviews/${review.id}/reply`, { farmer_reply: reply })
      toast.success('Reply posted')
      setShowReplyBox(false)
      onReply()
    } catch {
      toast.error('Failed to post reply')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">{review.customer?.name || 'Customer'}</p>
            <StarDisplay rating={review.rating} />
            {review.product && (
              <p className="text-xs text-muted-foreground">On: {review.product.name}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {new Date(review.created_at).toLocaleDateString()}
            </span>
            <button onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-3">
          {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}

          {review.farmer_reply && (
            <div className="bg-accent rounded-md p-3">
              <p className="text-xs font-medium mb-1">Your reply:</p>
              <p className="text-sm text-muted-foreground">{review.farmer_reply}</p>
            </div>
          )}

          {!review.farmer_reply && !showReplyBox && (
            <Button size="sm" variant="outline" onClick={() => setShowReplyBox(true)}>
              <MessageSquare className="size-3 mr-1" /> Reply
            </Button>
          )}

          {showReplyBox && (
            <div className="space-y-2">
              <Label className="text-xs">Your Reply</Label>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                placeholder="Write a reply..."
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleReply} disabled={saving}>
                  {saving ? 'Posting...' : 'Post Reply'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowReplyBox(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export default function FarmerReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/farmer/reviews')
      .then(({ data }) => setReviews(data.data?.data || data.data || []))
      .catch(() => toast.error('Failed to load reviews'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Customer Reviews</h1>
            <p className="text-muted-foreground">Reviews left on your products and stall</p>
          </div>
          {avgRating && (
            <div className="flex items-center gap-2">
              <Star className="size-5 fill-amber-400 text-amber-400" />
              <span className="text-2xl font-bold">{avgRating}</span>
              <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
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
              <ReviewCard key={r.id} review={r} onReply={load} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
