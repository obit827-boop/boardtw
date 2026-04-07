import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const body = await request.json()

    const {
      billboard_id,
      start_date,
      end_date,
      months,
      monthly_price,
      ad_industry,
      ad_purpose,
    } = body

    if (!billboard_id || !start_date || !end_date || !monthly_price) {
      return NextResponse.json(
        { error: '缺少必要欄位：billboard_id, start_date, end_date, monthly_price' },
        { status: 400 }
      )
    }

    // Fetch billboard to get owner_id and verify it exists
    const { data: billboard, error: bbError } = await supabase
      .from('billboards')
      .select('owner_id, status')
      .eq('id', billboard_id)
      .single()

    if (bbError || !billboard) {
      return NextResponse.json({ error: '找不到此看板' }, { status: 404 })
    }

    if (billboard.status !== 'active') {
      return NextResponse.json(
        { error: '此看板目前無法預訂' },
        { status: 400 }
      )
    }

    if (billboard.owner_id === user.id) {
      return NextResponse.json(
        { error: '無法預訂自己的看板' },
        { status: 400 }
      )
    }

    // Calculate pricing
    const rentalMonths = months ?? 1
    const totalPrice = monthly_price * rentalMonths
    const platformFee = Math.round(totalPrice * 0.1)
    const ownerRevenue = totalPrice - platformFee

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        billboard_id,
        advertiser_id: user.id,
        owner_id: billboard.owner_id,
        start_date,
        end_date,
        months: rentalMonths,
        monthly_price,
        total_price: totalPrice,
        platform_fee: platformFee,
        owner_revenue: ownerRevenue,
        status: 'inquiry',
        ad_industry: ad_industry ?? null,
        ad_purpose: ad_purpose ?? null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: '無法建立預訂，請稍後再試' },
      { status: 500 }
    )
  }
}
