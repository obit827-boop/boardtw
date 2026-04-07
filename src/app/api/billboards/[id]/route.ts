import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Billboard } from '@/types/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('billboards')
      .select('*, photos:billboard_photos(*), traffic_data(*)')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: '找不到此看板' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json(
      { error: '無法取得看板資料，請稍後再試' },
      { status: 500 }
    )
  }
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

    // Verify ownership
    const { data: existing } = await supabase
      .from('billboards')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: '找不到此看板' }, { status: 404 })
    }

    if (existing.owner_id !== user.id) {
      return NextResponse.json({ error: '無權限修改此看板' }, { status: 403 })
    }

    const body: Partial<Billboard> = await request.json()

    // Remove fields that should not be updated directly
    const { id: _id, owner_id, created_at, updated_at, photos, traffic_data, ...updates } = body as Billboard

    const { data, error } = await supabase
      .from('billboards')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json(
      { error: '無法更新看板，請稍後再試' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Verify ownership
    const { data: existing } = await supabase
      .from('billboards')
      .select('owner_id')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: '找不到此看板' }, { status: 404 })
    }

    if (existing.owner_id !== user.id) {
      return NextResponse.json({ error: '無權限刪除此看板' }, { status: 403 })
    }

    const { error } = await supabase
      .from('billboards')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: '無法刪除看板，請稍後再試' },
      { status: 500 }
    )
  }
}
