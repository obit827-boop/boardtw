'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FACING_LABELS } from '@/lib/constants'
import type { Facing } from '@/types/database'

export default function ListStep3() {
  const router = useRouter()
  const [widthM, setWidthM] = useState('')
  const [heightM, setHeightM] = useState('')
  const [facing, setFacing] = useState<Facing | ''>('')
  const [hasLighting, setHasLighting] = useState(false)
  const [isDigital, setIsDigital] = useState(false)

  useEffect(() => {
    const prev = sessionStorage.getItem('list_step2')
    if (!prev) {
      router.replace('/list/step-1')
      return
    }
    const saved = sessionStorage.getItem('list_step3')
    if (saved) {
      const data = JSON.parse(saved)
      setWidthM(data.widthM || '')
      setHeightM(data.heightM || '')
      setFacing(data.facing || '')
      setHasLighting(data.hasLighting || false)
      setIsDigital(data.isDigital || false)
    }
  }, [router])

  function handleNext() {
    if (!widthM || !heightM) return
    sessionStorage.setItem(
      'list_step3',
      JSON.stringify({ widthM, heightM, facing, hasLighting, isDigital })
    )
    router.push('/list/step-4')
  }

  const area = widthM && heightM ? (parseFloat(widthM) * parseFloat(heightM)).toFixed(1) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold mb-1">看板規格</h1>
        <p className="text-gray-500 text-sm">填寫看板尺寸和設備</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">寬度（公尺）</label>
          <input
            type="number"
            step="0.1"
            value={widthM}
            onChange={(e) => setWidthM(e.target.value)}
            placeholder="10.0"
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">高度（公尺）</label>
          <input
            type="number"
            step="0.1"
            value={heightM}
            onChange={(e) => setHeightM(e.target.value)}
            placeholder="5.0"
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {area && (
        <p className="text-sm text-gray-500">
          面積：{area} m2
        </p>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">面向</label>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(FACING_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFacing(key as Facing)}
              className={`border rounded-lg py-2 text-sm transition-all ${
                facing === key
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={hasLighting}
            onChange={(e) => setHasLighting(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>有夜間照明</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isDigital}
            onChange={(e) => setIsDigital(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>LED 數位看板</span>
        </label>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleNext}
            disabled={!widthM || !heightM}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            下一步
          </button>
        </div>
      </div>
    </div>
  )
}
