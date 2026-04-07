'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BILLBOARD_TYPES } from '@/lib/constants'
import type { BillboardType } from '@/types/database'

export default function ListStep1() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [type, setType] = useState<BillboardType | ''>('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    const saved = sessionStorage.getItem('list_step1')
    if (saved) {
      const data = JSON.parse(saved)
      setTitle(data.title || '')
      setType(data.type || '')
      setDescription(data.description || '')
    }
  }, [])

  function handleNext() {
    if (!title || !type) return
    sessionStorage.setItem('list_step1', JSON.stringify({ title, type, description }))
    router.push('/list/step-2')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold mb-1">看板基本資訊</h1>
        <p className="text-gray-500 text-sm">填寫看板名稱和類型</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">看板名稱</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例如：忠孝東路四段大型LED看板"
          className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">看板類型</label>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(BILLBOARD_TYPES).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setType(key as BillboardType)}
              className={`border rounded-lg px-4 py-3 text-left transition-all ${
                type === key
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          描述（選填）
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="補充看板的特色、優勢等"
          rows={3}
          className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleNext}
            disabled={!title || !type}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            下一步
          </button>
        </div>
      </div>
    </div>
  )
}
