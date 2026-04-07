interface TrafficEstimation {
  estimated_daily_impressions: number
  estimation_method: string
}

export function estimateDailyImpressions(params: {
  motc_daily_vehicles?: number | null
  mrt_distance_m?: number | null
  has_lighting?: boolean
  area_m2?: number | null
}): TrafficEstimation {
  const {
    motc_daily_vehicles = 0,
    mrt_distance_m,
    has_lighting,
    area_m2,
  } = params

  const parts: string[] = []

  // Base: vehicle count * average passengers (1.3)
  let base = (motc_daily_vehicles ?? 0) * 1.3
  parts.push(`base=${motc_daily_vehicles}x1.3`)

  // MRT proximity bonus
  if (mrt_distance_m != null) {
    if (mrt_distance_m < 200) {
      base *= 1.3
      parts.push('mrt<200m +30%')
    } else if (mrt_distance_m < 500) {
      base *= 1.1
      parts.push('mrt<500m +10%')
    }
  }

  // Nighttime visibility bonus
  if (has_lighting) {
    base *= 1.15
    parts.push('lighting +15%')
  }

  // Size bonus
  if (area_m2 != null) {
    if (area_m2 > 40) {
      base *= 1.2
      parts.push('area>40m2 +20%')
    } else if (area_m2 > 20) {
      base *= 1.1
      parts.push('area>20m2 +10%')
    }
  }

  return {
    estimated_daily_impressions: Math.round(base),
    estimation_method: parts.join(', '),
  }
}

// Haversine distance in meters
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
