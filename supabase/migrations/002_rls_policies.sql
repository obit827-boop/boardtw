-- BOARDTW RLS Policies

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE billboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE billboard_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE effect_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users: can read own, update own
CREATE POLICY "users_read_own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (auth.uid() = id);

-- Billboards: public read for active, owner can CRUD own
CREATE POLICY "billboards_public_read" ON billboards
  FOR SELECT USING (status = 'active' OR owner_id = auth.uid());

CREATE POLICY "billboards_owner_insert" ON billboards
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "billboards_owner_update" ON billboards
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "billboards_owner_delete" ON billboards
  FOR DELETE USING (owner_id = auth.uid());

-- Billboard photos: follow billboard visibility
CREATE POLICY "photos_public_read" ON billboard_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM billboards
      WHERE billboards.id = billboard_photos.billboard_id
      AND (billboards.status = 'active' OR billboards.owner_id = auth.uid())
    )
  );

CREATE POLICY "photos_owner_insert" ON billboard_photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM billboards
      WHERE billboards.id = billboard_photos.billboard_id
      AND billboards.owner_id = auth.uid()
    )
  );

CREATE POLICY "photos_owner_delete" ON billboard_photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM billboards
      WHERE billboards.id = billboard_photos.billboard_id
      AND billboards.owner_id = auth.uid()
    )
  );

-- Traffic data: public read
CREATE POLICY "traffic_public_read" ON traffic_data FOR SELECT USING (true);

-- Bookings: participants can read/update
CREATE POLICY "bookings_participant_read" ON bookings
  FOR SELECT USING (advertiser_id = auth.uid() OR owner_id = auth.uid());

CREATE POLICY "bookings_advertiser_insert" ON bookings
  FOR INSERT WITH CHECK (advertiser_id = auth.uid());

CREATE POLICY "bookings_participant_update" ON bookings
  FOR UPDATE USING (advertiser_id = auth.uid() OR owner_id = auth.uid());

-- Effect reports: advertiser can insert, public can read
CREATE POLICY "effects_public_read" ON effect_reports FOR SELECT USING (true);

CREATE POLICY "effects_advertiser_insert" ON effect_reports
  FOR INSERT WITH CHECK (advertiser_id = auth.uid());

-- Messages: sender/receiver can read
CREATE POLICY "messages_participant_read" ON messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "messages_sender_insert" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "messages_receiver_update" ON messages
  FOR UPDATE USING (receiver_id = auth.uid());
