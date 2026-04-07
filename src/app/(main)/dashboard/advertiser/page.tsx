'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BOOKING_STATUS } from '@/lib/constants'
import type { Booking } from '@/types/database'
import Link from 'next/link'
import { Search, FileText, Loader2 } from 'lucide-react'

export default function AdvertiserDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('bookings')
        .select('*, billboards(title, address, price_monthly)')
        .eq('advertiser_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setBookings(data as Booking[])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-500">載入資料中</span>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">廣告主後台</h1>
        <Link
          href="/billboards"
          className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Search className="w-4 h-4" />
          搜尋看板
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: '總詢價數', value: bookings.length },
          {
            label: '進行中',
            value: bookings.filter((b) =>
              ['inquiry', 'negotiating', 'confirmed', 'paid', 'active'].includes(b.status)
            ).length,
          },
          {
            label: '已完成',
            value: bookings.filter((b) => b.status === 'completed').length,
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border rounded-xl p-4">
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Bookings */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b font-semibold">我的詢價與預訂</div>
        {bookings.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>還沒有詢價紀錄</p>
            <Link href="/billboards" className="text-blue-600 hover:underline mt-2 inline-block">
              開始搜尋看板
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {bookings.map((booking) => {
              const bb = (booking as Booking & { billboards?: { title: string; address: string } }).billboards
              return (
                <Link
                  key={booking.id}
                  href={`/bookings/${booking.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium">{bb?.title}</div>
                    <div className="text-sm text-gray-500">{bb?.address}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {booking.start_date} ~ {booking.end_date}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      NT${booking.total_price.toLocaleString()}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        booking.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : booking.status === 'completed'
                            ? 'bg-blue-100 text-blue-700'
                            : booking.status === 'cancelled'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {BOOKING_STATUS[booking.status]}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
