import type { Billboard } from '@/types/database'

const DISTRICT_MULTIPLIER: Record<string, number> = {
  '信義區': 2.5,
  '大安區': 2.0,
  '中山區': 1.8,
  '松山區': 1.7,
  '中正區': 1.6,
  '南港區': 1.3,
  '內湖區': 1.2,
  '士林區': 1.1,
  '北投區': 1.0,
  '萬華區': 1.0,
  '文山區': 0.9,
  // 新北
  '板橋區': 1.3,
  '中和區': 1.1,
  '永和區': 1.1,
  '新莊區': 1.0,
  '三重區': 1.0,
  // 台中
  '西屯區': 1.4,
  '南屯區': 1.2,
  '北屯區': 1.0,
  // 高雄
  '前鎮區': 1.3,
  '苓雅區': 1.2,
  '左營區': 1.1,
}

export function suggestPrice(billboard: Partial<Billboard>) {
  const areaSqm = billboard.area_m2 ?? 20
  // Base: NT$800 per sqm per month (Taipei average)
  let basePrice = areaSqm * 800

  // District multiplier
  const multiplier = billboard.district
    ? DISTRICT_MULTIPLIER[billboard.district] ?? 1.0
    : 1.0
  basePrice *= multiplier

  // Traffic score
  if (billboard.traffic_score) {
    if (billboard.traffic_score > 80) basePrice *= 1.4
    else if (billboard.traffic_score > 60) basePrice *= 1.2
    else if (billboard.traffic_score < 30) basePrice *= 0.8
  }

  // LED / digital premium
  if (billboard.is_digital) basePrice *= 1.5

  // Lighting premium
  if (billboard.has_lighting) basePrice *= 1.1

  return {
    min: Math.round((basePrice * 0.85) / 1000) * 1000,
    max: Math.round((basePrice * 1.15) / 1000) * 1000,
    suggested: Math.round(basePrice / 1000) * 1000,
  }
}
