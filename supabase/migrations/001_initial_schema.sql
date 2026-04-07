-- BOARDTW Initial Schema
-- Run this in Supabase SQL Editor

-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('owner', 'advertiser', 'admin')),
  verified BOOLEAN DEFAULT false,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. billboards
CREATE TABLE billboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id),

  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('wall', 'rooftop', 'pole', 'led', 'bridge', 'fence')),

  address TEXT NOT NULL,
  district TEXT,
  city TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  location GEOGRAPHY(POINT, 4326),

  width_m DECIMAL(5, 2),
  height_m DECIMAL(5, 2),
  area_m2 DECIMAL(8, 2),
  facing TEXT CHECK (facing IN ('N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW')),
  has_lighting BOOLEAN DEFAULT false,
  is_digital BOOLEAN DEFAULT false,

  price_monthly INT,
  price_suggested INT,
  min_rental_months INT DEFAULT 1,

  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'rented', 'inactive')),

  nearby_mrt TEXT,
  mrt_distance_m INT,
  traffic_score INT,
  foot_traffic_score INT,
  visibility_score INT,
  competition_density INT,

  avg_effect_rating DECIMAL(3, 2),
  total_bookings INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX billboards_location_idx ON billboards USING GIST(location);
CREATE INDEX billboards_city_idx ON billboards(city);
CREATE INDEX billboards_status_idx ON billboards(status);
CREATE INDEX billboards_type_idx ON billboards(type);

-- 3. billboard_photos
CREATE TABLE billboard_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billboard_id UUID REFERENCES billboards(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  photo_type TEXT CHECK (photo_type IN ('front', 'left', 'right', 'distant', 'night', 'environment')),
  is_primary BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX billboard_photos_billboard_idx ON billboard_photos(billboard_id);

-- 4. traffic_data
CREATE TABLE traffic_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billboard_id UUID REFERENCES billboards(id) ON DELETE CASCADE,

  motc_intersection_id TEXT,
  motc_daily_vehicles INT,
  motc_peak_am INT,
  motc_peak_pm INT,
  motc_data_date DATE,

  google_popularity_score INT,
  google_peak_hour INT,

  owner_reported_daily INT,

  estimated_daily_impressions INT,
  estimation_method TEXT,

  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billboard_id UUID REFERENCES billboards(id),
  advertiser_id UUID REFERENCES users(id),
  owner_id UUID REFERENCES users(id),

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  months INT,

  monthly_price INT NOT NULL,
  total_price INT NOT NULL,
  platform_fee INT,
  owner_revenue INT,

  status TEXT DEFAULT 'inquiry' CHECK (status IN (
    'inquiry', 'negotiating', 'confirmed', 'paid', 'active', 'completed', 'cancelled'
  )),

  ad_industry TEXT,
  ad_purpose TEXT,

  ecpay_trade_no TEXT,
  ecpay_payment_date TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX bookings_billboard_idx ON bookings(billboard_id);
CREATE INDEX bookings_advertiser_idx ON bookings(advertiser_id);
CREATE INDEX bookings_status_idx ON bookings(status);

-- 6. effect_reports
CREATE TABLE effect_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  billboard_id UUID REFERENCES billboards(id),
  advertiser_id UUID REFERENCES users(id),

  visibility_rating INT CHECK (visibility_rating BETWEEN 1 AND 5),
  location_rating INT CHECK (location_rating BETWEEN 1 AND 5),
  value_rating INT CHECK (value_rating BETWEEN 1 AND 5),
  overall_rating INT CHECK (overall_rating BETWEEN 1 AND 5),

  ad_goal TEXT,
  perceived_reach TEXT,
  would_rebook BOOLEAN,
  estimated_leads_increase TEXT,

  public_comment TEXT,
  private_note TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX messages_booking_idx ON messages(booking_id);
CREATE INDEX messages_receiver_idx ON messages(receiver_id, read);

-- 8. pricing_suggestions
CREATE TABLE pricing_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT,
  district TEXT,
  billboard_type TEXT,
  area_m2_min DECIMAL,
  area_m2_max DECIMAL,
  traffic_score_min INT,
  traffic_score_max INT,
  suggested_price_min INT,
  suggested_price_max INT,
  sample_count INT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER billboards_updated_at
  BEFORE UPDATE ON billboards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-calculate area
CREATE OR REPLACE FUNCTION calculate_area()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.width_m IS NOT NULL AND NEW.height_m IS NOT NULL THEN
    NEW.area_m2 = NEW.width_m * NEW.height_m;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER billboards_calc_area
  BEFORE INSERT OR UPDATE ON billboards
  FOR EACH ROW EXECUTE FUNCTION calculate_area();

-- Auto-set PostGIS location from lat/lng
CREATE OR REPLACE FUNCTION set_location_from_latlng()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER billboards_set_location
  BEFORE INSERT OR UPDATE ON billboards
  FOR EACH ROW EXECUTE FUNCTION set_location_from_latlng();
