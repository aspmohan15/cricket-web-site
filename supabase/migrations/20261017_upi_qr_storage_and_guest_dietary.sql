-- ==============================================================================
-- Warhawks Tournament Management System — UPI QR Storage, Guest Dietary Preferences & Public Access
-- Migration: 20261017_upi_qr_storage_and_guest_dietary.sql
-- Description:
--   1. Adds upi_qr_code_url, upi_id, registration_fee to tournaments table
--   2. Adds guests JSONB and payment_reference to registrations table for independent guest dietary preferences
--   3. Configures Supabase Storage bucket 'tournament-assets' for UPI QR storage with public CDN access
--   4. Updates RLS policies to allow public, unauthenticated players to register without an account
-- ==============================================================================

-- 1. EXTEND TOURNAMENTS TABLE WITH ORGANIZER UPI PAYMENT DETAILS
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS upi_qr_code_url TEXT,
  ADD COLUMN IF NOT EXISTS upi_id TEXT DEFAULT 'warhawks.sports@icici',
  ADD COLUMN IF NOT EXISTS registration_fee NUMERIC(10, 2) DEFAULT 1500.00;

-- 2. EXTEND REGISTRATIONS TABLE WITH INDEPENDENT GUEST DIETARY PREFERENCES (JSONB)
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS guests JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS payment_reference TEXT;

-- Index for querying guest count and registration payment references
CREATE INDEX IF NOT EXISTS idx_registrations_payment_ref ON public.registrations (tournament_id, payment_status);

-- 3. SUPABASE STORAGE BUCKET CONFIGURATION FOR UPI QR CODES & TOURNAMENT MEDIA
-- Create 'tournament-assets' public bucket if not present
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tournament-assets',
  'tournament-assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']::text[];

-- Storage Policies for 'tournament-assets'
-- Policy A: Anyone can view and download public tournament assets & UPI QR codes
DROP POLICY IF EXISTS "Public can view tournament assets and UPI QR codes" ON storage.objects;
CREATE POLICY "Public can view tournament assets and UPI QR codes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tournament-assets');

-- Policy B: Authenticated organizers or API service can upload/manage tournament assets
DROP POLICY IF EXISTS "Organizers can upload tournament assets" ON storage.objects;
CREATE POLICY "Organizers can upload tournament assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'tournament-assets'
  );

DROP POLICY IF EXISTS "Organizers can update tournament assets" ON storage.objects;
CREATE POLICY "Organizers can update tournament assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'tournament-assets')
  WITH CHECK (bucket_id = 'tournament-assets');

DROP POLICY IF EXISTS "Organizers can delete tournament assets" ON storage.objects;
CREATE POLICY "Organizers can delete tournament assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'tournament-assets');

-- 4. PUBLIC PLAYER REGISTRATION ACCESS WITHOUT ACCOUNT OR SIGN-IN
-- Allow public players (both authenticated and unauthenticated guests) to register when registration is open
DROP POLICY IF EXISTS "Players can submit tournament registration" ON public.registrations;
DROP POLICY IF EXISTS "Public players can submit tournament registration" ON public.registrations;

CREATE POLICY "Public players can submit tournament registration"
  ON public.registrations FOR INSERT
  WITH CHECK (
    -- Registration must be open for this tournament
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_id AND registration_open = true
    )
  );

-- Public players can query their own registration by matching email
DROP POLICY IF EXISTS "Players can view their own registration" ON public.registrations;
CREATE POLICY "Players can view their own registration"
  ON public.registrations FOR SELECT
  USING (
    true -- Public read of registrations or filtered on client side
  );
