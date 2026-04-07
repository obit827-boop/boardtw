'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PHOTO_TYPES } from '@/lib/constants'
import { Camera, X, Loader2 } from 'lucide-react'
import type { PhotoType } from '@/types/database'

interface PhotoItem {
  file: File
  preview: string
  type: PhotoType
}

export default function ListStep4() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [activeType, setActiveType] = useState<PhotoType>('front')

  useEffect(() => {
    const prev = sessionStorage.getItem('list_step3')
    if (!prev) {
      router.replace('/list/step-1')
      return
    }
  }, [router])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach((file) => {
      const preview = URL.createObjectURL(file)
      setPhotos((prev) => [...prev, { file, preview, type: activeType }])
    })
    if (fileRef.current) fileRef.current.value = ''
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  function handleNext() {
    // Store photo metadata in session (files will be uploaded on final submit)
    const photoMeta = photos.map((p) => ({
      name: p.file.name,
      type: p.type,
      size: p.file.size,
    }))
    sessionStorage.setItem('list_step4', JSON.stringify({ photos: photoMeta }))
    // Store files reference globally for step 5
    if (typeof window !== 'undefined') {
      ;(window as unknown as Record<string, unknown>).__listPhotos = photos.map((p) => p.file)
    }
    router.push('/list/step-5')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold mb-1">上傳照片</h1>
        <p className="text-gray-500 text-sm">
          好的照片能讓你的看板更容易被租出去
        </p>
      </div>

      {/* Photo type selector */}
      <div>
        <label className="block text-sm font-medium mb-2">照片類型</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PHOTO_TYPES).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveType(key as PhotoType)}
              className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                activeType === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Upload area */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all"
      >
        <Camera className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">
          點擊上傳{PHOTO_TYPES[activeType]}
        </p>
        <p className="text-xs text-gray-400 mt-1">支援 JPG, PNG, WebP</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Preview grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo, i) => (
            <div key={i} className="relative group">
              <img
                src={photo.preview}
                alt={photo.type}
                className="w-full h-24 object-cover rounded-lg"
              />
              <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                {PHOTO_TYPES[photo.type]}
              </span>
              <button
                onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleNext}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            {photos.length === 0 ? '跳過，稍後上傳' : '下一步'}
          </button>
        </div>
      </div>
    </div>
  )
}
