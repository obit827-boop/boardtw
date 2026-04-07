'use client'

import { useCallback } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { CITIES, BILLBOARD_TYPES } from '@/lib/constants'
import type { BillboardType } from '@/types/database'

export interface BillboardFilterValues {
  city: string
  type: string
  priceMin: string
  priceMax: string
  hasLighting: boolean
  isDigital: boolean
}

interface BillboardFiltersProps {
  values: BillboardFilterValues
  onChange: (values: BillboardFilterValues) => void
}

export const DEFAULT_FILTERS: BillboardFilterValues = {
  city: '',
  type: '',
  priceMin: '',
  priceMax: '',
  hasLighting: false,
  isDigital: false,
}

export default function BillboardFilters({ values, onChange }: BillboardFiltersProps) {
  const update = useCallback(
    (patch: Partial<BillboardFilterValues>) => {
      onChange({ ...values, ...patch })
    },
    [values, onChange],
  )

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
        <SlidersHorizontal className="h-4 w-4" />
        篩選條件
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* City */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">縣市</label>
          <select
            value={values.city}
            onChange={(e) => update({ city: e.target.value })}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          >
            <option value="">全部縣市</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">看板類型</label>
          <select
            value={values.type}
            onChange={(e) => update({ type: e.target.value })}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          >
            <option value="">全部類型</option>
            {(Object.entries(BILLBOARD_TYPES) as [BillboardType, string][]).map(
              ([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ),
            )}
          </select>
        </div>

        {/* Price min */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">最低月租</label>
          <input
            type="number"
            placeholder="NT$"
            value={values.priceMin}
            onChange={(e) => update({ priceMin: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          />
        </div>

        {/* Price max */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">最高月租</label>
          <input
            type="number"
            placeholder="NT$"
            value={values.priceMax}
            onChange={(e) => update({ priceMax: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
          />
        </div>

        {/* Toggles */}
        <div className="flex items-end gap-4 sm:col-span-2 xl:col-span-2">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={values.hasLighting}
              onChange={(e) => update({ hasLighting: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]"
            />
            <span className="text-sm text-gray-700">有照明</span>
          </label>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={values.isDigital}
              onChange={(e) => update({ isDigital: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]"
            />
            <span className="text-sm text-gray-700">數位看板</span>
          </label>
        </div>
      </div>
    </div>
  )
}
