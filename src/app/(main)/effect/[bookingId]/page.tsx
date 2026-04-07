'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Star, Loader2 } from 'lucide-react'

function StarRating({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className="p-0.5"
        >
          <Star
            className={`w-6 h-6 ${
              star <= value
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export default function EffectReportPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const router = useRouter()

  const [visibility, setVisibility] = useState(0)
  const [location, setLocation] = useState(0)
  const [valueRating, setValueRating] = useState(0)
  const [overall, setOverall] = useState(0)
  const [comment, setComment] = useState('')
  const [wouldRebook, setWouldRebook] = useState<boolean | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!visibility || !location || !valueRating || !overall) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/bookings/${bookingId}/effect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visibility_rating: visibility,
          location_rating: location,
          value_rating: valueRating,
          overall_rating: overall,
          public_comment: comment || null,
          would_rebook: wouldRebook,
        }),
      })

      if (!res.ok) throw new Error('提交失敗')

      router.push('/dashboard/advertiser')
    } catch {
      setError('提交失敗，請重試')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-1">廣告效果回饋</h1>
      <p className="text-gray-500 text-sm mb-8">
        你的評價會幫助其他廣告主做出更好的選擇
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">可視性</label>
          <StarRating value={visibility} onChange={setVisibility} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">地點</label>
          <StarRating value={location} onChange={setLocation} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">性價比</label>
          <StarRating value={valueRating} onChange={setValueRating} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">整體評分</label>
          <StarRating value={overall} onChange={setOverall} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            是否願意再次租用？
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setWouldRebook(true)}
              className={`px-6 py-2 rounded-lg border transition-all ${
                wouldRebook === true
                  ? 'border-green-600 bg-green-50 text-green-700'
                  : 'hover:border-gray-300'
              }`}
            >
              願意
            </button>
            <button
              onClick={() => setWouldRebook(false)}
              className={`px-6 py-2 rounded-lg border transition-all ${
                wouldRebook === false
                  ? 'border-red-500 bg-red-50 text-red-600'
                  : 'hover:border-gray-300'
              }`}
            >
              不願意
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            公開評論（選填）
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="分享你的廣告效果體驗..."
            rows={4}
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!visibility || !location || !valueRating || !overall || submitting}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                送出中
              </span>
            ) : (
              '送出評價'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
