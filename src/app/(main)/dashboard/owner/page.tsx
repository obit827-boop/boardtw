'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BILLBOARD_STATUS } from '@/lib/constants'
import type { Billboard, Booking } from '@/types/database'
import Link from 'next/link'
import {
  Plus,
  Eye,
  MessageSquare,
  TrendingUp,
  Loader2,
} from 'lucide-react'

export default function OwnerDashboard() {
  const [billboards, setBillboards] = useState<Billboard[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const [billboardRes, bookingRes] = await Promise.all([
        supabase
          .from('billboards')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('bookings')
          .select('*, billboards(title)')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
      ])

      if (billboardRes.data) setBillboards(billboardRes.data as Billboard[])
      if (bookingRes.data) setBookings(bookingRes.data as Booking[])
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

  const activeCount = billboards.filter((b) => b.status === 'active').length
  const rentedCount = billboards.filter((b) => b.status === 'rented').length
  const pendingBookings = bookings.filter((b) => b.status === 'inquiry').length

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">看板主後台</h1>
        <Link
          href="/list/step-1"
          className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          上架看板
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: '總看板數', value: billboards.length, icon: Eye },
          { label: '上架中', value: activeCount, icon: TrendingUp },
          { label: '已出租', value: rentedCount, icon: TrendingUp },
          { label: '待回覆詢價', value: pendingBookings, icon: MessageSquare },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border rounded-xl p-4">
            <stat.icon className="w-5 h-5 text-gray-400 mb-2" />
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Billboards list */}
      <div className="bg-white border rounded-xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b font-semibold">我的看板</div>
        {billboards.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            還沒有上架看板
          </div>
        ) : (
          <div className="divide-y">
            {billboards.map((b) => (
              <Link
                key={b.id}
                href={`/billboards/${b.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
              >
                <div>
                  <div className="font-medium">{b.title}</div>
                  <div className="text-sm text-gray-500">{b.address}</div>
                </div>
                <div className="flex items-center gap-4">
                  {b.price_monthly && (
                    <span className="text-sm font-medium">
                      NT${b.price_monthly.toLocaleString()}/月
                    </span>
                  )}
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      b.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : b.status === 'rented'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {BILLBOARD_STATUS[b.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent bookings */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b font-semibold">最近詢價</div>
        {bookings.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            尚無詢價紀錄
          </div>
        ) : (
          <div className="divide-y">
            {bookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/bookings/${booking.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
              >
                <div>
                  <div className="font-medium">
                    {(booking as Booking & { billboards?: { title: string } }).billboards?.title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {booking.start_date} ~ {booking.end_date}
                  </div>
                </div>
                <div className="text-sm">
                  NT${booking.total_price.toLocaleString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
