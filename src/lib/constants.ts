export const BILLBOARD_TYPES = {
  wall: '外牆廣告',
  rooftop: '屋頂看板',
  pole: '立柱/T霸',
  led: 'LED電子牆',
  bridge: '跨橋看板',
  fence: '圍牆廣告',
} as const

export const BILLBOARD_STATUS = {
  draft: '草稿',
  pending: '待審核',
  active: '上架中',
  rented: '已出租',
  inactive: '下架',
} as const

export const FACING_LABELS = {
  N: '北',
  S: '南',
  E: '東',
  W: '西',
  NE: '東北',
  NW: '西北',
  SE: '東南',
  SW: '西南',
} as const

export const PHOTO_TYPES = {
  front: '正面照',
  left: '左方路口視角',
  right: '右方路口視角',
  distant: '50公尺外視角',
  night: '夜間照',
  environment: '周邊環境',
} as const

export const BOOKING_STATUS = {
  inquiry: '詢價中',
  negotiating: '議價中',
  confirmed: '已確認',
  paid: '已付款',
  active: '刊登中',
  completed: '已完成',
  cancelled: '已取消',
} as const

export const CITIES = [
  '台北市',
  '新北市',
  '桃園市',
  '台中市',
  '台南市',
  '高雄市',
  '基隆市',
  '新竹市',
  '新竹縣',
  '苗栗縣',
  '彰化縣',
  '南投縣',
  '雲林縣',
  '嘉義市',
  '嘉義縣',
  '屏東縣',
  '宜蘭縣',
  '花蓮縣',
  '台東縣',
  '澎湖縣',
] as const

export const PLATFORM_FEE_RATE = 0.1 // 10%

export const MAPBOX_DEFAULT_CENTER: [number, number] = [121.5654, 25.033] // Taipei
export const MAPBOX_DEFAULT_ZOOM = 12
