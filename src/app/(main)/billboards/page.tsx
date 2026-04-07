'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import BillboardCard from '@/components/billboard/BillboardCard'
import BillboardFilters, { DEFAULT_FILTERS, type BillboardFilterValues } from '@/components/billboard/BillboardFilters'
import type { Billboard } from '@/types/database'
import { Loader2 } from 'lucide-react'

export default function BillboardsPage() {
  const [billboards, setBillboards] = useState<Billboard[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<BillboardFilterValues>(DEFAULT_FILTERS)

  const fetchBillboards = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    let query = supabase
      .from('billboards')
      .select('*, billboard_photos(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (filters.city) query = query.eq('city', filters.city)
    if (filters.type) query = query.eq('type', filters.type)
    if (filters.priceMin) query = query.gte('price_monthly', parseInt(filters.priceMin))
    if (filters.priceMax) query = query.lte('price_monthly', parseInt(filters.priceMax))
    if (filters.hasLighting) query = query.eq('has_lighting', true)
    if (filters.isDigital) query = query.eq('is_digital', true)

    const { data } = await query.limit(50)
    if (data) setBillboards(data as Billboard[])
    setLoading(false)
  }, [filters])

  useEffect(() => {
    fetchBillboards()
  }, [fetchBillboards])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">搜尋看板</h1>

      <BillboardFilters values={filters} onChange={setFilters} />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-500">搜尋看板中</span>
        </div>
      ) : billboards.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">沒有找到符合條件的看板</p>
          <p className="mt-2">試試調整篩選條件</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4 mt-6">
            找到 {billboards.length} 塊看板
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {billboards.map((billboard) => (
              <BillboardCard key={billboard.id} billboard={billboard} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
