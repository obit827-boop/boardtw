'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function ListStep5() {
  const router = useRouter()
  const [priceMonthly, setPriceMonthly] = useState('')
  const [minRentalMonths, setMinRentalMonths] = useState('1')
  const [suggestedPrice, setSuggestedPrice] = useState<{
    min: number
    max: number
    suggested: number
  } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const prev = sessionStorage.getItem('list_step3')
    if (!prev) {
      router.replace('/list/step-1')
      return
    }

    // Fetch pricing suggestion
    async function fetchSuggestion() {
      const step2 = JSON.parse(sessionStorage.getItem('list_step2') || '{}')
      const step3 = JSON.parse(sessionStorage.getItem('list_step3') || '{}')
      const area = step3.widthM && step3.heightM
        ? parseFloat(step3.widthM) * parseFloat(step3.heightM)
        : 20

      try {
        const params = new URLSearchParams({
          area_m2: area.toString(),
          city: step2.city || '',
          district: step2.district || '',
          is_digital: step3.isDigital ? 'true' : 'false',
          has_lighting: step3.hasLighting ? 'true' : 'false',
        })
        const res = await fetch(`/api/pricing/suggest?${params}`)
        if (res.ok) {
          const data = await res.json()
          setSuggestedPrice(data)
          if (!priceMonthly) {
            setPriceMonthly(data.suggested.toString())
          }
        }
      } catch {
        // Non-critical
      }
    }
    fetchSuggestion()
  }, [router])

  async function handleSubmit() {
    if (!priceMonthly) return
    setSubmitting(true)
    setError('')

    try {
      const step1 = JSON.parse(sessionStorage.getItem('list_step1') || '{}')
      const step2 = JSON.parse(sessionStorage.getItem('list_step2') || '{}')
      const step3 = JSON.parse(sessionStorage.getItem('list_step3') || '{}')

      const body = {
        title: step1.title,
        type: step1.type,
        description: step1.description,
        address: step2.address,
        city: step2.city,
        district: step2.district,
        lat: step2.lat,
        lng: step2.lng,
        width_m: parseFloat(step3.widthM),
        height_m: parseFloat(step3.heightM),
        facing: step3.facing || null,
        has_lighting: step3.hasLighting,
        is_digital: step3.isDigital,
        price_monthly: parseInt(priceMonthly),
        price_suggested: suggestedPrice?.suggested || null,
        min_rental_months: parseInt(minRentalMonths),
      }

      const res = await fetch('/api/billboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || '上架失敗')
      }

      const billboard = await res.json()

      // Clean up session
      sessionStorage.removeItem('list_step1')
      sessionStorage.removeItem('list_step2')
      sessionStorage.removeItem('list_step3')
      sessionStorage.removeItem('list_step4')

      // TODO: Upload photos via Supabase Storage

      router.push(`/billboards/${billboard.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '發生錯誤，請重試')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold mb-1">設定價格</h1>
        <p className="text-gray-500 text-sm">
          設定你的月租金，平台會提供參考定價
        </p>
      </div>

      {/* Suggested price */}
      {suggestedPrice && (
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm text-blue-700 font-medium mb-1">
            平台建議定價
          </p>
          <p className="text-2xl font-bold text-blue-600">
            NT${suggestedPrice.min.toLocaleString()} ~ NT$
            {suggestedPrice.max.toLocaleString()}
          </p>
          <p className="text-xs text-blue-500 mt-1">
            建議 NT${suggestedPrice.suggested.toLocaleString()}/月
          </p>
          <p className="text-xs text-blue-400 mt-1">
            根據地段、面積、設備等因素計算
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">
          每月租金（NT$）
        </label>
        <input
          type="number"
          value={priceMonthly}
          onChange={(e) => setPriceMonthly(e.target.value)}
          placeholder="50000"
          className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          最低租期（月）
        </label>
        <select
          value={minRentalMonths}
          onChange={(e) => setMinRentalMonths(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[1, 3, 6, 12].map((m) => (
            <option key={m} value={m}>
              {m} 個月
            </option>
          ))}
        </select>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p>成交後平台收取 10% 服務費</p>
        {priceMonthly && (
          <p className="mt-1">
            你的實收：NT$
            {Math.round(parseInt(priceMonthly) * 0.9).toLocaleString()}/月
          </p>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!priceMonthly || submitting}
            className="w-full bg-amber-500 text-white font-semibold py-3 rounded-xl hover:bg-amber-400 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                正在上架
              </span>
            ) : (
              '確認上架'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
