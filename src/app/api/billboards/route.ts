import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Billboard } from '@/types/database'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = request.nextUrl

    let query = supabase.from('billboards').select('*, photos:billboard_photos(*)')

    // Filter: city
    const city = searchParams.get('city')
    if (city) {
      query = query.eq('city', city)
    }

    // Filter: type
    const type = searchParams.get('type')
    if (type) {
      query = query.eq('type', type)
    }

    // Filter: status
    const status = searchParams.get('status')
    if (status) {
      query = query.eq('status', status)
    }

    // Filter: price range
    const priceMin = searchParams.get('price_min')
    if (priceMin) {
      query = query.gte('price_monthly', Number(priceMin))
    }

    const priceMax = searchParams.get('price_max')
    if (priceMax) {
      query = query.lte('price_monthly', Number(priceMax))
    }

    // Filter: map bounds (lat/lng/radius in meters)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const radius = searchParams.get('radius')
    if (lat && lng && radius) {
      // Use PostGIS-style bounding box approximation
      // 1 degree lat ~= 111,000m
      const latNum = Number(lat)
      const lngNum = Number(lng)
      const radiusNum = Number(radius)
      const latDelta = radiusNum / 111000
      const lngDelta = radiusNum / (111000 * Math.cos((latNum * Math.PI) / 180))

      query = query
        .gte('lat', latNum - latDelta)
        .lte('lat', latNum + latDelta)
        .gte('lng', lngNum - lngDelta)
        .lte('lng', lngNum + lngDelta)
    }

    // Pagination
    const page = Number(searchParams.get('page') || '1')
    const limit = Math.min(Number(searchParams.get('limit') || '20'), 100)
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data, page, limit, count })
  } catch (err) {
    return NextResponse.json(
      { error: '無法取得看板列表，請稍後再試' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const body: Partial<Billboard> = await request.json()

    const { data, error } = await supabase
      .from('billboards')
      .insert({
        owner_id: user.id,
        title: body.title,
        description: body.description ?? null,
        type: body.type,
        address: body.address,
        district: body.district ?? null,
        city: body.city ?? null,
        lat: body.lat ?? null,
        lng: body.lng ?? null,
        width_m: body.width_m ?? null,
        height_m: body.height_m ?? null,
        area_m2: body.area_m2 ?? null,
        facing: body.facing ?? null,
        has_lighting: body.has_lighting ?? false,
        is_digital: body.is_digital ?? false,
        price_monthly: body.price_monthly ?? null,
        min_rental_months: body.min_rental_months ?? 1,
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: '無法建立看板，請稍後再試' },
      { status: 500 }
    )
  }
}
