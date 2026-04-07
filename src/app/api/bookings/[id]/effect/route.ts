import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    // Fetch booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: '找不到此預訂' }, { status: 404 })
    }

    // Only advertiser can submit effect report
    if (booking.advertiser_id !== user.id) {
      return NextResponse.json(
        { error: '只有廣告主可以提交成效報告' },
        { status: 403 }
      )
    }

    if (booking.status !== 'completed' && booking.status !== 'active') {
      return NextResponse.json(
        { error: '只有進行中或已完成的預訂可以提交成效報告' },
        { status: 400 }
      )
    }

    const body = await request.json()

    const {
      visibility_rating,
      location_rating,
      value_rating,
      ad_goal,
      perceived_reach,
      would_rebook,
      estimated_leads_increase,
      public_comment,
      private_note,
    } = body

    if (!visibility_rating || !location_rating || !value_rating) {
      return NextResponse.json(
        { error: '缺少必要評分欄位' },
        { status: 400 }
      )
    }

    const overall_rating = Math.round(
      ((visibility_rating + location_rating + value_rating) / 3) * 10
    ) / 10

    // Insert effect report
    const { data: report, error: insertError } = await supabase
      .from('effect_reports')
      .insert({
        booking_id: bookingId,
        billboard_id: booking.billboard_id,
        advertiser_id: user.id,
        visibility_rating,
        location_rating,
        value_rating,
        overall_rating,
        ad_goal: ad_goal ?? null,
        perceived_reach: perceived_reach ?? null,
        would_rebook: would_rebook ?? null,
        estimated_leads_increase: estimated_leads_increase ?? null,
        public_comment: public_comment ?? null,
        private_note: private_note ?? null,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    // Update billboard avg_effect_rating
    const { data: allReports } = await supabase
      .from('effect_reports')
      .select('overall_rating')
      .eq('billboard_id', booking.billboard_id)

    if (allReports && allReports.length > 0) {
      const avgRating =
        Math.round(
          (allReports.reduce((sum, r) => sum + r.overall_rating, 0) /
            allReports.length) *
            10
        ) / 10

      await supabase
        .from('billboards')
        .update({ avg_effect_rating: avgRating })
        .eq('id', booking.billboard_id)
    }

    return NextResponse.json({ data: report }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: '無法提交成效報告，請稍後再試' },
      { status: 500 }
    )
  }
}
