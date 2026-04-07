'use client'

import { useState, useEffect } from 'react'
import { BOOKING_STATUS } from '@/lib/constants'
import type { Booking } from '@/types/database'
import Link from 'next/link'
import { Search, Loader2 } from 'lucide-react'

type BookingWithBillboard = Booking & { billboards?: { title: string; address: string } }

const MOCK_BOOKINGS: BookingWithBillboard[] = [
  {
    id: 'bk-a1',
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
    status: 'active',
    ad_industry: '科技業',
    ad_purpose: '新品上市',
    ecpay_trade_no: null,
    ecpay_payment_date: null,
    created_at: '2026-03-20',
    updated_at: '2026-04-01',
    billboards: { title: '忠孝東路四段 LED 電子牆', address: '台北市大安區忠孝東路四段 216 號' },
  },
  {
    id: 'bk-a2',
    billboard_id: 'bb-4',
    advertiser_id: 'adv-1',
    owner_id: 'owner-2',
    start_date: '2026-03-01',
    end_date: '2026-03-31',
    months: 1,
    monthly_price: 55000,
    total_price: 55000,
    platform_fee: 5500,
    owner_revenue: 49500,
    status: 'completed',
    ad_industry: '娛樂',
    ad_purpose: '演唱會宣傳',
    ecpay_trade_no: 'EC20260301001',
    ecpay_payment_date: '2026-02-25',
    created_at: '2026-02-10',
    updated_at: '2026-04-01',
    billboards: { title: '西門町中華路圍牆廣告', address: '台北市萬華區中華路一段 120 號' },
  },
  {
    id: 'bk-a3',
    billboard_id: 'bb-3',
    advertiser_id: 'adv-1',
    owner_id: 'owner-2',
    start_date: '2026-06-01',
    end_date: '2026-08-31',
    months: 3,
    monthly_price: 95000,
    total_price: 285000,
    platform_fee: 28500,
    owner_revenue: 256500,
    status: 'inquiry',
    ad_industry: '金融',
    ad_purpose: '信用卡推廣',
    ecpay_trade_no: null,
    ecpay_payment_date: null,
    created_at: '2026-04-05',
    updated_at: '2026-04-05',
    billboards: { title: '南京復興站 T 霸', address: '台北市中山區南京東路三段 1 號' },
  },
]

export default function AdvertiserDashboard() {
  const [bookings, setBookings] = useState<BookingWithBillboard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
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
        <div className="divide-y">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/bookings/${booking.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
            >
              <div>
                <div className="font-medium">{booking.billboards?.title}</div>
                <div className="text-sm text-gray-500">{booking.billboards?.address}</div>
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
          ))}
        </div>
      </div>
    </div>
  )
}
