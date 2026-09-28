import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Star, X } from 'lucide-react'
import api from '@/lib/axios'
import toast from 'react-hot-toast'
import { validateRating } from '@/lib/validation'

export default function ReviewSubmitModal({
  isOpen,
  onClose,
  onSuccess,
  farmerProfileId,
  productId = null,
  targetTitle = '',
  targetSubtitle = '',
}) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  if (!isOpen) return null

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
        farmer_profile_id: Number(farmerProfileId),
        product_id: productId ? Number(productId) : null,
        rating,
        comment: comment.trim() || null,
      })

      toast.success('Your review has been submitted successfully!')
      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-md shadow-2xl border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
          <div>
            <CardTitle className="text-base font-bold">Write a Customer Review</CardTitle>
            <CardDescription className="text-xs">
              {targetTitle || 'Share your authentic experience with the community'}
            </CardDescription>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-full"
          >
            <X className="size-4" />
          </button>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {targetSubtitle && (
            <div className="p-3 bg-muted/40 rounded-xl text-xs space-y-0.5 border">
              <span className="font-semibold text-foreground">{targetSubtitle}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Your Rating *</Label>
              <div className="flex gap-1.5 items-center pt-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const starVal = i + 1
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setRating(starVal)
                        if (errors.rating) setErrors((prev) => ({ ...prev, rating: null }))
                      }}
                      onMouseEnter={() => setHovered(starVal)}
                      onMouseLeave={() => setHovered(0)}
                      className="p-1 hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`size-7 transition-colors ${
                          starVal <= (hovered || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/30 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  )
                })}
                <span className="text-xs font-bold text-muted-foreground ml-2">
                  {rating > 0 ? `${rating} / 5 Stars` : 'Select rating'}
                </span>
              </div>
              {errors.rating && <p className="text-xs text-destructive mt-1">{errors.rating}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="review-comment" className="text-xs font-semibold">
                  Review Comment (optional)
                </Label>
                <span className="text-[11px] text-muted-foreground">{comment.length} / 1000</span>
              </div>
              <textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                maxLength={1000}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="How was the produce quality, fresh taste, or pickup experience?"
              />
              {errors.comment && <p className="text-xs text-destructive mt-1">{errors.comment}</p>}
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
              >
                {saving ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
