export type UserRole = 'owner' | 'advertiser' | 'admin'

export type BillboardType = 'wall' | 'rooftop' | 'pole' | 'led' | 'bridge' | 'fence'

export type BillboardStatus = 'draft' | 'pending' | 'active' | 'rented' | 'inactive'

export type Facing = 'N' | 'S' | 'E' | 'W' | 'NE' | 'NW' | 'SE' | 'SW'

export type PhotoType = 'front' | 'left' | 'right' | 'distant' | 'night' | 'environment'

export type BookingStatus =
  | 'inquiry'
  | 'negotiating'
  | 'confirmed'
  | 'paid'
  | 'active'
  | 'completed'
  | 'cancelled'

export interface User {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: UserRole
  verified: boolean
  avatar_url: string | null
  created_at: string
}

export interface Billboard {
  id: string
  owner_id: string
  title: string
  description: string | null
  type: BillboardType
  address: string
  district: string | null
  city: string | null
  lat: number | null
  lng: number | null
  width_m: number | null
  height_m: number | null
  area_m2: number | null
  facing: Facing | null
  has_lighting: boolean
  is_digital: boolean
  price_monthly: number | null
  price_suggested: number | null
  min_rental_months: number
  status: BillboardStatus
  nearby_mrt: string | null
  mrt_distance_m: number | null
  traffic_score: number | null
  foot_traffic_score: number | null
  visibility_score: number | null
  competition_density: number | null
  avg_effect_rating: number | null
  total_bookings: number
  created_at: string
  updated_at: string
  photos?: BillboardPhoto[]
  traffic_data?: TrafficData
}

export interface BillboardPhoto {
  id: string
  billboard_id: string
  url: string
  photo_type: PhotoType
  is_primary: boolean
  sort_order: number
  created_at: string
}

export interface TrafficData {
  id: string
  billboard_id: string
  motc_intersection_id: string | null
  motc_daily_vehicles: number | null
  motc_peak_am: number | null
  motc_peak_pm: number | null
  motc_data_date: string | null
  google_popularity_score: number | null
  google_peak_hour: number | null
  owner_reported_daily: number | null
  estimated_daily_impressions: number | null
  estimation_method: string | null
  updated_at: string
}

export interface Booking {
  id: string
  billboard_id: string
  advertiser_id: string
  owner_id: string
  start_date: string
  end_date: string
  months: number | null
  monthly_price: number
  total_price: number
  platform_fee: number | null
  owner_revenue: number | null
  status: BookingStatus
  ad_industry: string | null
  ad_purpose: string | null
  ecpay_trade_no: string | null
  ecpay_payment_date: string | null
  created_at: string
  updated_at: string
  billboard?: Billboard
}

export interface EffectReport {
  id: string
  booking_id: string
  billboard_id: string
  advertiser_id: string
  visibility_rating: number
  location_rating: number
  value_rating: number
  overall_rating: number
  ad_goal: string | null
  perceived_reach: string | null
  would_rebook: boolean | null
  estimated_leads_increase: string | null
  public_comment: string | null
  private_note: string | null
  created_at: string
}

export interface Message {
  id: string
  booking_id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
}
