'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BOOKING_STATUS } from '@/lib/constants'
import type { Booking, Message } from '@/types/database'
import { Send, Loader2, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) setUserId(user.id)

      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*, billboards(title, address)')
        .eq('id', id)
        .single()

      if (bookingData) setBooking(bookingData as Booking)

      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('booking_id', id)
        .order('created_at', { ascending: true })

      if (msgs) setMessages(msgs as Message[])
    }
    load()
  }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!newMessage.trim() || !booking || !userId) return
    setSending(true)

    const supabase = createClient()
    const receiverId =
      userId === booking.advertiser_id ? booking.owner_id : booking.advertiser_id

    const { data } = await supabase
      .from('messages')
      .insert({
        booking_id: id,
        sender_id: userId,
        receiver_id: receiverId,
        content: newMessage.trim(),
      })
      .select()
      .single()

    if (data) {
      setMessages((prev) => [...prev, data as Message])
      setNewMessage('')
    }
    setSending(false)
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    )
  }

  const bb = (booking as Booking & { billboards?: { title: string; address: string } }).billboards

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href={userId === booking.owner_id ? '/dashboard/owner' : '/dashboard/advertiser'}
        className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-800 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        返回後台
      </Link>

      {/* Booking info */}
      <div className="bg-white border rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{bb?.title}</h1>
            <p className="text-sm text-gray-500">{bb?.address}</p>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded ${
              booking.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {BOOKING_STATUS[booking.status]}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
          <div>
            <span className="text-gray-500">租期</span>
            <p className="font-medium">
              {booking.start_date} ~ {booking.end_date}
            </p>
          </div>
          <div>
            <span className="text-gray-500">月租</span>
            <p className="font-medium">
              NT${booking.monthly_price.toLocaleString()}
            </p>
          </div>
          <div>
            <span className="text-gray-500">總金額</span>
            <p className="font-medium">
              NT${booking.total_price.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b font-semibold">對話紀錄</div>
        <div className="h-80 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-gray-400 py-8">開始對話</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                    msg.sender_id === userId
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="輸入訊息..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
