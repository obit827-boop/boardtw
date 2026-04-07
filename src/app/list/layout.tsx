'use client'

import { usePathname, useRouter } from 'next/navigation'
import StepIndicator from '@/components/ui/StepIndicator'
import { X } from 'lucide-react'

const STEPS = ['基本資訊', '位置', '規格', '照片', '定價']
const STEP_PATHS = ['/list/step-1', '/list/step-2', '/list/step-3', '/list/step-4', '/list/step-5']

export default function ListLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const currentStep = STEP_PATHS.indexOf(pathname)

  function handleClose() {
    if (typeof window !== 'undefined') {
      const hasData = sessionStorage.getItem('list_step1')
      if (hasData) {
        const confirmed = window.confirm('還沒儲存，要離開嗎？')
        if (!confirmed) return
        sessionStorage.removeItem('list_step1')
        sessionStorage.removeItem('list_step2')
        sessionStorage.removeItem('list_step3')
        sessionStorage.removeItem('list_step4')
      }
    }
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h2 className="font-semibold">上架看板</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-4">
          <StepIndicator steps={STEPS} currentStep={currentStep >= 0 ? currentStep : 0} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">{children}</div>
    </div>
  )
}
