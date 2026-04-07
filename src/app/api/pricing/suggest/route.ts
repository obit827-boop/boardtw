import { NextRequest, NextResponse } from 'next/server'
import { suggestPrice } from '@/lib/pricing'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    const area_m2 = searchParams.get('area_m2')
    const district = searchParams.get('district')
    const city = searchParams.get('city')
    const traffic_score = searchParams.get('traffic_score')
    const is_digital = searchParams.get('is_digital')
    const has_lighting = searchParams.get('has_lighting')

    const result = suggestPrice({
      area_m2: area_m2 ? Number(area_m2) : undefined,
      district: district ?? undefined,
      city: city ?? undefined,
      traffic_score: traffic_score ? Number(traffic_score) : undefined,
      is_digital: is_digital === 'true',
      has_lighting: has_lighting === 'true',
    })

    return NextResponse.json({ data: result })
  } catch (err) {
    return NextResponse.json(
      { error: '無法計算建議價格，請稍後再試' },
      { status: 500 }
    )
  }
}
