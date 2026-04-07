import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { BILLBOARD_TYPES, FACING_LABELS, BOOKING_STATUS } from '@/lib/constants'
import {
  MapPin,
  Ruler,
  Sun,
  Monitor,
  Train,
  Car,
  Users,
  Star,
  ChevronLeft,
} from 'lucide-react'
import Link from 'next/link'
import type { Billboard, BillboardPhoto } from '@/types/database'

export default async function BillboardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: billboard } = await supabase
    .from('billboards')
    .select('*, billboard_photos(*), traffic_data(*)')
    .eq('id', id)
    .single()

  if (!billboard) notFound()

  const b = billboard as Billboard & {
    billboard_photos: BillboardPhoto[]
    traffic_data: Array<{ estimated_daily_impressions: number | null }>
  }

  const photos = b.billboard_photos || []
  const primaryPhoto = photos.find((p) => p.is_primary) || photos[0]
  const trafficData = b.traffic_data?.[0]

  // Fetch effect reports
  const { data: effects } = await supabase
    .from('effect_reports')
    .select('*')
    .eq('billboard_id', id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back */}
      <Link
        href="/billboards"
        className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-800 mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        返回搜尋
      </Link>

      {/* Photos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {primaryPhoto ? (
          <img
            src={primaryPhoto.url}
            alt={b.title}
            className="w-full h-64 md:h-80 object-cover rounded-xl"
          />
        ) : (
          <div className="w-full h-64 md:h-80 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
            尚未上傳照片
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          {photos.slice(1, 5).map((photo) => (
            <img
              key={photo.id}
              src={photo.url}
              alt={photo.photo_type}
              className="w-full h-36 object-cover rounded-lg"
            />
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div>
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded mb-2">
              {BILLBOARD_TYPES[b.type]}
            </span>
            <h1 className="text-2xl font-bold">{b.title}</h1>
            <p className="text-gray-500 flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4" />
              {b.address}
            </p>
          </div>

          {b.description && (
            <p className="text-gray-600">{b.description}</p>
          )}

          {/* Specs */}
          <div className="grid grid-cols-2 gap-4">
            {b.area_m2 && (
              <div className="flex items-center gap-2 text-sm">
                <Ruler className="w-4 h-4 text-gray-400" />
                {b.width_m} x {b.height_m} m ({b.area_m2} m2)
              </div>
            )}
            {b.facing && (
              <div className="flex items-center gap-2 text-sm">
                面向 {FACING_LABELS[b.facing]}
              </div>
            )}
            {b.has_lighting && (
              <div className="flex items-center gap-2 text-sm">
                <Sun className="w-4 h-4 text-amber-500" />
                有照明
              </div>
            )}
            {b.is_digital && (
              <div className="flex items-center gap-2 text-sm">
                <Monitor className="w-4 h-4 text-blue-500" />
                LED 數位看板
              </div>
            )}
          </div>

          {/* Traffic data */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold">車流與曝光數據</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {b.nearby_mrt && (
                <div className="flex items-center gap-2">
                  <Train className="w-4 h-4 text-green-600" />
                  {b.nearby_mrt}（{b.mrt_distance_m}m）
                </div>
              )}
              {b.traffic_score != null && (
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-blue-600" />
                  車流評分 {b.traffic_score}/100
                </div>
              )}
              {b.foot_traffic_score != null && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  人流評分 {b.foot_traffic_score}/100
                </div>
              )}
              {trafficData?.estimated_daily_impressions && (
                <div className="font-medium text-blue-700">
                  預估日曝光 {trafficData.estimated_daily_impressions.toLocaleString()} 次
                </div>
              )}
            </div>
          </div>

          {/* Effect reports */}
          {effects && effects.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-semibold">廣告主評價</h2>
              {effects.map((effect) => (
                <div key={effect.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: effect.overall_rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                  {effect.public_comment && (
                    <p className="text-sm text-gray-600">{effect.public_comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price sidebar */}
        <div className="space-y-4">
          <div className="bg-white border rounded-xl p-6 sticky top-24">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {b.price_monthly
                ? `NT$${b.price_monthly.toLocaleString()}`
                : '洽詢'}
            </div>
            <p className="text-gray-500 text-sm mb-1">/月</p>
            {b.min_rental_months > 1 && (
              <p className="text-xs text-gray-400 mb-4">
                最低租期 {b.min_rental_months} 個月
              </p>
            )}

            {b.price_suggested && (
              <p className="text-xs text-gray-400 mb-4">
                平台建議價 NT${b.price_suggested.toLocaleString()}/月
              </p>
            )}

            {b.avg_effect_rating && (
              <div className="flex items-center gap-1 mb-4">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-medium">{b.avg_effect_rating}</span>
                <span className="text-xs text-gray-400">
                  ({b.total_bookings} 次成交)
                </span>
              </div>
            )}

            <Link
              href={`/bookings/new?billboard=${b.id}`}
              className="block w-full text-center bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              立即詢價
            </Link>

            <Link
              href={`/map?selected=${b.id}`}
              className="block w-full text-center border border-gray-200 text-gray-700 font-medium py-3 rounded-xl mt-3 hover:bg-gray-50 transition-colors"
            >
              在地圖上查看
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
