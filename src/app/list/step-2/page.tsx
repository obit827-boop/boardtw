'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CITIES } from '@/lib/constants'
import { MapPin, Loader2 } from 'lucide-react'

export default function ListStep2() {
  const router = useRouter()
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    const prev = sessionStorage.getItem('list_step1')
    if (!prev) {
      router.replace('/list/step-1')
      return
    }
    const saved = sessionStorage.getItem('list_step2')
    if (saved) {
      const data = JSON.parse(saved)
      setAddress(data.address || '')
      setCity(data.city || '')
      setDistrict(data.district || '')
      setLat(data.lat || null)
      setLng(data.lng || null)
    }
  }, [router])

  function handleLocate() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude)
        setLng(pos.coords.longitude)
        setLocating(false)
      },
      () => setLocating(false)
    )
  }

  function handleNext() {
    if (!address || !city) return
    sessionStorage.setItem(
      'list_step2',
      JSON.stringify({ address, city, district, lat, lng })
    )
    router.push('/list/step-3')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold mb-1">看板位置</h1>
        <p className="text-gray-500 text-sm">填寫看板的確切地址</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">縣市</label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">選擇縣市</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">行政區</label>
        <input
          type="text"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          placeholder="例如：信義區"
          className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">詳細地址</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="例如：台北市信義區忠孝東路五段68號"
          className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">GPS 定位</label>
        <button
          onClick={handleLocate}
          disabled={locating}
          className="inline-flex items-center gap-2 border rounded-lg px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
        >
          {locating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              定位中
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              使用目前位置
            </>
          )}
        </button>
        {lat && lng && (
          <p className="text-xs text-gray-400 mt-2">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </p>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleNext}
            disabled={!address || !city}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            下一步
          </button>
        </div>
      </div>
    </div>
  )
}
