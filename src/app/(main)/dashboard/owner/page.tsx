'use client'

import { useState, useEffect } from 'react'
import { BILLBOARD_STATUS } from '@/lib/constants'
import { MOCK_BILLBOARDS } from '@/lib/mock-data'
import type { Billboard, Booking } from '@/types/database'
import Link from 'next/link'
import {
  Plus,
  Eye,
  MessageSquare,
  TrendingUp,
  Loader2,
} from 'lucide-react'

const MOCK_BOOKINGS: (Booking & { billboards?: { title: string } })[] = [
  {
    id: 'bk-1',
    billboard_id: 'bb-1',
    advertiser_id: 'adv-1',
    owner_id: 'owner-1',
    start_date: '2026-05-01',
    end_date: '2026-07-31',
    months: 3,
    monthly_price: 180000,
    total_price: 540000,
    platform_fee: 54000,
    owner_revenue: 486000,
    status: 'confirmed',
    ad_industry: '科技業',
    ad_purpose: '新品上市',
    ecpay_trade_no: null,
    ecpay_payment_date: null,
    created_at: '2026-03-20',
    updated_at: '2026-03-25',
    billboards: { title: '忠孝東路四段 LED 電子牆' },
  },
  {
    id: 'bk-2',
    billboard_id: 'bb-2',
    advertiser_id: 'adv-2',
    owner_id: 'owner-1',
    start_date: '2026-04-01',
    end_date: '2026-09-30',
    months: 6,
    monthly_price: 250000,
    total_price: 1500000,
    platform_fee: 150000,
    owner_revenue: 1350000,
    status: 'inquiry',
    ad_industry: '精品',
    ad_purpose: '品牌形象',
    ecpay_trade_no: null,
    ecpay_payment_date: null,
    created_at: '2026-03-28',
    updated_at: '2026-03-28',
    billboards: { title: '信義計畫區松仁路大型看板' },
  },
]

export default function OwnerDashboard() {
  const [billboards, setBillboards] = useState<Billboard[]>([])
  const [bookings, setBookings] = useState<(Booking & { billboards?: { title: string } })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setBillboards(MOCK_BILLBOARDS.filter((b) => b.owner_id === 'owner-1'))
      setBookings(MOCK_BOOKINGS)
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
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
      </div>

      {/* Recent bookings */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b font-semibold">最近詢價</div>
        <div className="divide-y">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/bookings/${booking.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
            >
              <div>
                <div className="font-medium">{booking.billboards?.title}</div>
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
      </div>
    </div>
  )
}
