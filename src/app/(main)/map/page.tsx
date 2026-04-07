'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import MapView from '@/components/map/MapView'
import BillboardCard from '@/components/billboard/BillboardCard'
import type { Billboard } from '@/types/database'
import { List, Map as MapIcon, Loader2 } from 'lucide-react'

export default function MapPage() {
  const [billboards, setBillboards] = useState<Billboard[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showList, setShowList] = useState(false)

  const fetchBillboards = useCallback(async (bounds?: {
    north: number
    south: number
    east: number
    west: number
  }) => {
    setLoading(true)
    const supabase = createClient()
    let query = supabase
      .from('billboards')
      .select('*, billboard_photos(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(100)

    if (bounds) {
      query = query
        .gte('lat', bounds.south)
        .lte('lat', bounds.north)
        .gte('lng', bounds.west)
        .lte('lng', bounds.east)
    }

    const { data } = await query
    if (data) setBillboards(data as Billboard[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchBillboards()
  }, [fetchBillboards])

  const selectedBillboard = billboards.find((b) => b.id === selectedId)

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row">
      {/* Mobile toggle */}
      <div className="md:hidden flex border-b">
        <button
          onClick={() => setShowList(false)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium ${
            !showList ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
        >
          <MapIcon className="w-4 h-4" />
          地圖
        </button>
        <button
          onClick={() => setShowList(true)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium ${
            showList ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
        >
          <List className="w-4 h-4" />
          列表 ({billboards.length})
        </button>
      </div>

      {/* Map */}
      <div className={`flex-1 ${showList ? 'hidden md:block' : ''}`}>
        <MapView
          billboards={billboards}
          selectedId={selectedId}
          onBoundsChange={fetchBillboards}
        />
      </div>

      {/* Sidebar / List */}
      <div
        className={`w-full md:w-96 border-l overflow-y-auto bg-white ${
          !showList ? 'hidden md:block' : ''
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-500">搜尋看板中</span>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <p className="text-sm text-gray-500">
              找到 {billboards.length} 塊看板
            </p>
            {selectedBillboard && (
              <div className="border-2 border-blue-500 rounded-xl">
                <BillboardCard billboard={selectedBillboard} />
              </div>
            )}
            {billboards
              .filter((b) => b.id !== selectedId)
              .map((billboard) => (
                <div
                  key={billboard.id}
                  onClick={() => setSelectedId(billboard.id)}
                  className="cursor-pointer"
                >
                  <BillboardCard billboard={billboard} />
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
