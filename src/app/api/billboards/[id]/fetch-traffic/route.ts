import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { findNearestTraffic } from '@/lib/motc'
import { estimateDailyImpressions } from '@/lib/traffic'

export async function POST(
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

    // Fetch billboard data
    const { data: billboard, error: bbError } = await supabase
      .from('billboards')
      .select('*')
      .eq('id', id)
      .single()

    if (bbError || !billboard) {
      return NextResponse.json({ error: '找不到此看板' }, { status: 404 })
    }

    if (billboard.owner_id !== user.id) {
      return NextResponse.json({ error: '無權限操作此看板' }, { status: 403 })
    }

    if (!billboard.lat || !billboard.lng || !billboard.city) {
      return NextResponse.json(
        { error: '看板缺少座標或城市資訊，無法查詢車流資料' },
        { status: 400 }
      )
    }

    // Call MOTC API
    const trafficResult = await findNearestTraffic(
      billboard.lat,
      billboard.lng,
      billboard.city
    )

    if (!trafficResult) {
      return NextResponse.json(
        { error: '無法取得車流資料，可能此區域暫無資料' },
        { status: 404 }
      )
    }

    // Estimate daily impressions
    const estimation = estimateDailyImpressions({
      motc_daily_vehicles: trafficResult.volume,
      mrt_distance_m: billboard.mrt_distance_m,
      has_lighting: billboard.has_lighting,
      area_m2: billboard.area_m2,
    })

    // Upsert traffic_data
    const { data, error } = await supabase
      .from('traffic_data')
      .upsert(
        {
          billboard_id: id,
          motc_daily_vehicles: trafficResult.volume,
          motc_data_date: new Date().toISOString().split('T')[0],
          estimated_daily_impressions: estimation.estimated_daily_impressions,
          estimation_method: estimation.estimation_method,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'billboard_id' }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json(
      { error: '車流資料查詢失敗，請稍後再試' },
      { status: 500 }
    )
  }
}
