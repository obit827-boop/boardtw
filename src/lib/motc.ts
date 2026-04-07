// MOTC TDX (Transport Data eXchange) API client
// https://tdx.transportdata.tw/

const TDX_AUTH_URL = 'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token'
const TDX_API_BASE = 'https://tdx.transportdata.tw/api/basic'

let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token
  }

  const clientId = process.env.MOTC_CLIENT_ID
  const clientSecret = process.env.MOTC_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('MOTC_CLIENT_ID and MOTC_CLIENT_SECRET are required')
  }

  const res = await fetch(TDX_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!res.ok) throw new Error(`TDX auth failed: ${res.status}`)

  const data = await res.json()
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  }

  return cachedToken.token
}

export interface MOTCTrafficData {
  AuthorityCode: string
  LinkID: string
  LinkName: string
  RoadName: string
  TravelSpeed: number
  TravelTime: number
  Occupancy: number
  Volume: number
}

// City code mapping
const CITY_CODES: Record<string, string> = {
  '台北市': 'Taipei',
  '新北市': 'NewTaipei',
  '桃園市': 'Taoyuan',
  '台中市': 'Taichung',
  '台南市': 'Tainan',
  '高雄市': 'Kaohsiung',
}

export async function fetchTrafficData(city: string): Promise<MOTCTrafficData[]> {
  const token = await getAccessToken()
  const cityCode = CITY_CODES[city] || city

  const res = await fetch(
    `${TDX_API_BASE}/v2/Road/Traffic/Live/City/${cityCode}?$top=1000&$format=JSON`,
    {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 }, // Cache 1 hour
    }
  )

  if (!res.ok) throw new Error(`TDX API failed: ${res.status}`)
  return res.json()
}

export async function findNearestTraffic(
  lat: number,
  lng: number,
  city: string
): Promise<{ volume: number; roadName: string; distance: number } | null> {
  try {
    const data = await fetchTrafficData(city)
    // Note: TDX live traffic data structure varies by city
    // This is a simplified implementation
    if (data.length === 0) return null

    // Return the highest volume road as fallback
    const sorted = data.sort((a, b) => (b.Volume || 0) - (a.Volume || 0))
    return {
      volume: sorted[0].Volume || 0,
      roadName: sorted[0].RoadName || '',
      distance: 0,
    }
  } catch {
    return null
  }
}
