import Link from 'next/link'
import { MapPin } from 'lucide-react'
import type { Billboard } from '@/types/database'
import { BILLBOARD_TYPES } from '@/lib/constants'

interface BillboardCardProps {
  billboard: Billboard
}

function formatPrice(price: number | null): string {
  if (price == null) return '洽詢'
  return `NT$${price.toLocaleString()}/月`
}

export default function BillboardCard({ billboard }: BillboardCardProps) {
  const primaryPhoto = billboard.photos?.find((p) => p.is_primary) ?? billboard.photos?.[0]

  return (
    <Link
      href={`/billboards/${billboard.id}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {primaryPhoto ? (
          <img
            src={primaryPhoto.url}
            alt={billboard.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
            尚無照片
          </div>
        )}

        {/* Type badge */}
        <span className="absolute left-3 top-3 rounded-md bg-[#2563EB] px-2 py-0.5 text-xs font-medium text-white">
          {BILLBOARD_TYPES[billboard.type]}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="truncate text-base font-semibold text-gray-900 group-hover:text-[#2563EB]">
          {billboard.title}
        </h3>

        <div className="mt-1.5 flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{billboard.address}</span>
        </div>

        {/* Price */}
        <p className="mt-3 text-lg font-bold text-[#2563EB]">
          {formatPrice(billboard.price_monthly)}
        </p>

        {/* Meta row */}
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          {billboard.area_m2 != null && (
            <span>{billboard.area_m2} m&sup2;</span>
          )}

          {billboard.traffic_score != null && (
            <div className="flex items-center gap-1.5">
              <span>車流</span>
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-[#F59E0B]"
                  style={{ width: `${Math.min(billboard.traffic_score, 100)}%` }}
                />
              </div>
              <span>{billboard.traffic_score}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
