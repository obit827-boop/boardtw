import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { BookingStatus } from '@/types/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('*, billboard:billboards(*, photos:billboard_photos(*))')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: '找不到此預訂' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Only allow owner or advertiser to view
    if (data.advertiser_id !== user.id && data.owner_id !== user.id) {
      return NextResponse.json({ error: '無權限查看此預訂' }, { status: 403 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json(
      { error: '無法取得預訂資料，請稍後再試' },
      { status: 500 }
    )
  }
}

const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  inquiry: ['negotiating', 'cancelled'],
  negotiating: ['confirmed', 'cancelled'],
  confirmed: ['paid', 'cancelled'],
  paid: ['active', 'cancelled'],
  active: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const body = await request.json()
    const newStatus = body.status as BookingStatus

    // Fetch existing booking
    const { data: existing, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: '找不到此預訂' }, { status: 404 })
    }

    // Only allow owner or advertiser to update
    if (existing.advertiser_id !== user.id && existing.owner_id !== user.id) {
      return NextResponse.json({ error: '無權限修改此預訂' }, { status: 403 })
    }

    // Validate status transition
    if (newStatus) {
      const currentStatus = existing.status as BookingStatus
      const allowed = VALID_TRANSITIONS[currentStatus] ?? []
      if (!allowed.includes(newStatus)) {
        return NextResponse.json(
          { error: `無法從「${currentStatus}」變更為「${newStatus}」` },
          { status: 400 }
        )
      }
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json(
      { error: '無法更新預訂，請稍後再試' },
      { status: 500 }
    )
  }
}
