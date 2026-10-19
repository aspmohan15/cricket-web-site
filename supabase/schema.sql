-- ==============================================================================
-- Warhawks Cricket Tournament Management System — Complete Master Schema
-- File: supabase/schema.sql
-- Description:
--   Single consolidated SQL initialization file for Supabase PostgreSQL.
--   Contains all table definitions, relationships, constraints, indexes,
--   triggers, security definer functions, storage bucket setup, and
--   strict Row Level Security (RLS) policies for Organizer and Player roles.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. TEARDOWN & COMPLETE DATABASE RESET
-- ------------------------------------------------------------------------------
-- Drop all existing application tables in reverse dependency order
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.import_jobs CASCADE;
DROP TABLE IF EXISTS public.media_assets CASCADE;
DROP TABLE IF EXISTS public.rules CASCADE;
DROP TABLE IF EXISTS public.auction_bids CASCADE;
DROP TABLE IF EXISTS public.auction_configs CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.sponsors CASCADE;
DROP TABLE IF EXISTS public.standings CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.players CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.registrations CASCADE;
DROP TABLE IF EXISTS public.tournaments CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Drop obsolete or legacy tables from old iterations
DROP TABLE IF EXISTS public.food_orders CASCADE;
DROP TABLE IF EXISTS public.food_order_records CASCADE;
DROP TABLE IF EXISTS public.registration_applications CASCADE;
DROP TABLE IF EXISTS public.tournament_rules CASCADE;

-- Drop functions & types
DROP FUNCTION IF EXISTS public.is_organizer() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.current_user_email() CASCADE;

DROP TYPE IF EXISTS public.tournament_status CASCADE;
DROP TYPE IF EXISTS public.match_status CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.dietary_preference CASCADE;

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS & PREREQUISITES
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. ENUMS & DOMAIN TYPES
-- ------------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE tournament_status AS ENUM ('upcoming', 'current', 'completed', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE match_status AS ENUM ('scheduled', 'live', 'completed', 'abandoned');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('organizer', 'player');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE dietary_preference AS ENUM ('Veg', 'Non-Veg');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 3. USER PROFILES TABLE (Supabase Auth Integration)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'player',
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger to safely auto-provision profile on new auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'player' -- Default to player role; organizers must be elevated explicitly
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Security Definer function to check if current user has organizer administrative authority
CREATE OR REPLACE FUNCTION public.is_organizer()
RETURNS BOOLEAN AS $$
BEGIN
  -- If user is signed in with a Supabase Auth session, verify their assigned role in user_profiles
  IF auth.uid() IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'organizer'
    );
  END IF;

  -- Default to false for anonymous / unverified client requests (enforces strict RLS)
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ------------------------------------------------------------------------------
-- 4. TOURNAMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tournaments (
  id TEXT PRIMARY KEY DEFAULT ('tour-' || substr(md5(random()::text), 1, 10)),
  name TEXT NOT NULL,
  edition_number INT NOT NULL,
  year INT NOT NULL,
  format TEXT NOT NULL DEFAULT 'T20',
  status tournament_status NOT NULL DEFAULT 'upcoming',
  organizer TEXT NOT NULL DEFAULT 'Warhawks',
  organizer_role TEXT NOT NULL DEFAULT 'Official Tournament Organizer & Host',
  organizer_branch TEXT NOT NULL DEFAULT 'Warhawks Tournament Operations',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  venue TEXT NOT NULL,
  city TEXT NOT NULL,
  registration_open BOOLEAN NOT NULL DEFAULT true,
  registration_start_date DATE,
  registration_end_date DATE,
  total_budget_points_per_team NUMERIC(14, 2) NOT NULL DEFAULT 10000000,
  points_per_win INT NOT NULL DEFAULT 2,
  points_per_tie INT NOT NULL DEFAULT 1,
  max_squad_size INT NOT NULL DEFAULT 18,
  min_squad_size INT NOT NULL DEFAULT 14,
  max_overseas_players INT NOT NULL DEFAULT 4,
  description TEXT,
  upi_qr_code_url TEXT,
  upi_id TEXT DEFAULT 'warhawks.sports@icici',
  registration_fee NUMERIC(10, 2) DEFAULT 1500.00,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_tournament_edition UNIQUE (name, edition_number)
);

-- ------------------------------------------------------------------------------
-- 5. TEAMS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teams (
  id TEXT PRIMARY KEY DEFAULT ('team-' || substr(md5(random()::text), 1, 10)),
  tournament_id TEXT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  short_code TEXT NOT NULL,
  city TEXT NOT NULL,
  primary_color TEXT NOT NULL DEFAULT '#0284c7',
  secondary_color TEXT NOT NULL DEFAULT '#0f172a',
  logo_url TEXT,
  owner_name TEXT NOT NULL,
  captain_player_id TEXT,
  budget_total NUMERIC(14, 2) NOT NULL DEFAULT 10000000,
  budget_spent NUMERIC(14, 2) NOT NULL DEFAULT 0,
  budget_remaining NUMERIC(14, 2) NOT NULL DEFAULT 10000000,
  total_players_assigned INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_team_tournament_name UNIQUE (tournament_id, name),
  CONSTRAINT uq_team_tournament_short_code UNIQUE (tournament_id, short_code)
);

-- ------------------------------------------------------------------------------
-- 6. PLAYERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.players (
  id TEXT PRIMARY KEY DEFAULT ('ply-' || substr(md5(random()::text), 1, 10)),
  tournament_id TEXT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  team_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  jersey_number INT,
  role TEXT NOT NULL DEFAULT 'All-Rounder',
  batting_style TEXT NOT NULL DEFAULT 'Right-hand bat',
  bowling_style TEXT NOT NULL DEFAULT 'Right-arm medium',
  base_price NUMERIC(14, 2) NOT NULL DEFAULT 500000,
  sold_price NUMERIC(14, 2),
  auction_status TEXT NOT NULL DEFAULT 'available',
  is_captain BOOLEAN NOT NULL DEFAULT false,
  is_overseas BOOLEAN NOT NULL DEFAULT false,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  shirt_size TEXT NOT NULL DEFAULT 'L',
  food_preference dietary_preference NOT NULL DEFAULT 'Veg',
  registration_status TEXT NOT NULL DEFAULT 'approved',
  payment_status TEXT NOT NULL DEFAULT 'paid',
  matches_played INT NOT NULL DEFAULT 0,
  runs_scored INT NOT NULL DEFAULT 0,
  highest_score INT NOT NULL DEFAULT 0,
  wickets_taken INT NOT NULL DEFAULT 0,
  best_bowling TEXT NOT NULL DEFAULT '-',
  strike_rate NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
  economy_rate NUMERIC(6, 2) NOT NULL DEFAULT 0.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 7. MATCHES / FIXTURES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.matches (
  id TEXT PRIMARY KEY DEFAULT ('mat-' || substr(md5(random()::text), 1, 10)),
  tournament_id TEXT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  match_number INT NOT NULL,
  round TEXT NOT NULL DEFAULT 'Group Stage',
  team_a_id TEXT NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  team_b_id TEXT NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  status match_status NOT NULL DEFAULT 'scheduled',
  toss_winner_id TEXT,
  toss_decision TEXT,
  team_a_score TEXT,
  team_a_overs NUMERIC(4, 1),
  team_b_score TEXT,
  team_b_overs NUMERIC(4, 1),
  winner_id TEXT,
  result_summary TEXT,
  man_of_the_match_player_id TEXT,
  is_imported BOOLEAN NOT NULL DEFAULT false,
  import_source TEXT,
  cricheroes_match_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_match_tournament_number UNIQUE (tournament_id, match_number)
);

-- ------------------------------------------------------------------------------
-- 8. STANDINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.standings (
  id TEXT PRIMARY KEY DEFAULT ('std-' || substr(md5(random()::text), 1, 10)),
  tournament_id TEXT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  matches_played INT NOT NULL DEFAULT 0,
  won INT NOT NULL DEFAULT 0,
  lost INT NOT NULL DEFAULT 0,
  tied INT NOT NULL DEFAULT 0,
  no_result INT NOT NULL DEFAULT 0,
  points INT NOT NULL DEFAULT 0,
  runs_scored INT NOT NULL DEFAULT 0,
  overs_faced NUMERIC(6, 1) NOT NULL DEFAULT 0.0,
  runs_conceded INT NOT NULL DEFAULT 0,
  overs_bowled NUMERIC(6, 1) NOT NULL DEFAULT 0.0,
  net_run_rate NUMERIC(6, 3) NOT NULL DEFAULT 0.000,
  CONSTRAINT uq_standings_tournament_team UNIQUE (tournament_id, team_id)
);

-- ------------------------------------------------------------------------------
-- 9. SPONSORS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sponsors (
  id TEXT PRIMARY KEY DEFAULT ('sp-' || substr(md5(random()::text), 1, 10)),
  tournament_id TEXT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  contribution_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  contact_email TEXT,
  tier TEXT DEFAULT 'Official Partner',
  benefits_description TEXT,
  website_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_on_public_web BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 10. EXPENSES TABLE (Financial Ledger)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY DEFAULT ('exp-' || substr(md5(random()::text), 1, 10)),
  tournament_id TEXT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  date DATE NOT NULL,
  vendor_name TEXT NOT NULL,
  receipt_url TEXT,
  payment_mode TEXT NOT NULL DEFAULT 'Bank Transfer',
  payment_status TEXT NOT NULL DEFAULT 'paid',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 11. REGISTRATIONS TABLE (Dietary preferences & Independent Guest Selections)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.registrations (
  id TEXT PRIMARY KEY DEFAULT ('reg-' || substr(md5(random()::text), 1, 10)),
  tournament_id TEXT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  age INT NOT NULL,
  city TEXT NOT NULL,
  primary_role TEXT NOT NULL DEFAULT 'All-Rounder',
  batting_style TEXT NOT NULL DEFAULT 'Right-hand bat',
  bowling_style TEXT NOT NULL DEFAULT 'Right-arm medium',
  preferred_jersey_no INT,
  shirt_size TEXT NOT NULL DEFAULT 'L',
  food_preference dietary_preference NOT NULL DEFAULT 'Veg',
  has_breakfast BOOLEAN NOT NULL DEFAULT true,
  has_lunch BOOLEAN NOT NULL DEFAULT true,
  guest_count INT NOT NULL DEFAULT 0,
  guests JSONB NOT NULL DEFAULT '[]'::jsonb,
  guest_food_preference dietary_preference NOT NULL DEFAULT 'Veg',
  has_guest_breakfast BOOLEAN NOT NULL DEFAULT false,
  has_guest_lunch BOOLEAN NOT NULL DEFAULT false,
  catering_status TEXT NOT NULL DEFAULT 'requested',
  approval_status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_reference TEXT,
  cric_heroes_profile_url TEXT,
  application_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  reviewed_by TEXT,
  review_notes TEXT,
  CONSTRAINT uq_registration_tournament_email UNIQUE (tournament_id, email)
);

-- ------------------------------------------------------------------------------
-- 12. AUCTION CONFIGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.auction_configs (
  tournament_id TEXT PRIMARY KEY REFERENCES public.tournaments(id) ON DELETE CASCADE,
  base_budget NUMERIC(14, 2) NOT NULL DEFAULT 10000000,
  bid_increments JSONB NOT NULL DEFAULT '[{"upTo": 1000000, "increment": 50000}, {"upTo": 5000000, "increment": 100000}, {"upTo": 10000000, "increment": 250000}]'::JSONB,
  is_auction_live BOOLEAN NOT NULL DEFAULT false,
  active_player_id TEXT,
  current_highest_bid NUMERIC(14, 2) NOT NULL DEFAULT 0,
  current_leading_team_id TEXT,
  auction_demo_video_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 13. AUCTION BIDS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.auction_bids (
  id TEXT PRIMARY KEY DEFAULT ('bid-' || substr(md5(random()::text), 1, 10)),
  tournament_id TEXT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 14. TOURNAMENT RULES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rules (
  id TEXT PRIMARY KEY DEFAULT ('rule-' || substr(md5(random()::text), 1, 10)),
  tournament_id TEXT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  video_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 15. MEDIA ASSETS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media_assets (
  id TEXT PRIMARY KEY DEFAULT ('med-' || substr(md5(random()::text), 1, 10)),
  tournament_id TEXT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'image',
  file_size_kb INT NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 16. IMPORT JOBS TABLE (CricHeroes & Spreadsheets)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.import_jobs (
  id TEXT PRIMARY KEY DEFAULT ('job-' || substr(md5(random()::text), 1, 10)),
  tournament_id TEXT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  total_rows INT NOT NULL DEFAULT 0,
  imported_rows INT NOT NULL DEFAULT 0,
  skipped_rows INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  import_summary TEXT,
  errors TEXT[] DEFAULT ARRAY[]::TEXT[],
  imported_by TEXT NOT NULL DEFAULT 'Warhawks Organizer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 17. AUDIT LOGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY DEFAULT ('log-' || substr(md5(random()::text), 1, 10)),
  tournament_id TEXT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_role user_role NOT NULL DEFAULT 'player',
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 18. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_teams_tournament ON public.teams (tournament_id);
CREATE INDEX IF NOT EXISTS idx_players_tournament ON public.players (tournament_id);
CREATE INDEX IF NOT EXISTS idx_players_team ON public.players (team_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON public.matches (tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches (tournament_id, status);
CREATE INDEX IF NOT EXISTS idx_standings_tournament ON public.standings (tournament_id);
CREATE INDEX IF NOT EXISTS idx_sponsors_tournament ON public.sponsors (tournament_id);
CREATE INDEX IF NOT EXISTS idx_expenses_tournament ON public.expenses (tournament_id);
CREATE INDEX IF NOT EXISTS idx_registrations_tournament ON public.registrations (tournament_id);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations (email);
CREATE INDEX IF NOT EXISTS idx_registrations_payment ON public.registrations (tournament_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_auction_configs_tournament ON public.auction_configs (tournament_id);
CREATE INDEX IF NOT EXISTS idx_auction_bids_tournament ON public.auction_bids (tournament_id);
CREATE INDEX IF NOT EXISTS idx_auction_bids_player ON public.auction_bids (player_id);
CREATE INDEX IF NOT EXISTS idx_rules_tournament ON public.rules (tournament_id);
CREATE INDEX IF NOT EXISTS idx_media_tournament ON public.media_assets (tournament_id);

-- ------------------------------------------------------------------------------
-- 19. SUPABASE STORAGE BUCKET CONFIGURATION (UPI QR & Media Assets)
-- ------------------------------------------------------------------------------
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

-- Storage Object Policies
DROP POLICY IF EXISTS "Public can view tournament assets and UPI QR codes" ON storage.objects;
CREATE POLICY "Public can view tournament assets and UPI QR codes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tournament-assets');

DROP POLICY IF EXISTS "Organizers can upload tournament assets" ON storage.objects;
CREATE POLICY "Organizers can upload tournament assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'tournament-assets');

DROP POLICY IF EXISTS "Organizers can update tournament assets" ON storage.objects;
CREATE POLICY "Organizers can update tournament assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'tournament-assets')
  WITH CHECK (bucket_id = 'tournament-assets');

DROP POLICY IF EXISTS "Organizers can delete tournament assets" ON storage.objects;
CREATE POLICY "Organizers can delete tournament assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'tournament-assets');

-- ------------------------------------------------------------------------------
-- 20. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- USER PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id OR public.is_organizer());

DROP POLICY IF EXISTS "Organizers can view and manage all user profiles" ON public.user_profiles;
CREATE POLICY "Organizers can view and manage all user profiles"
  ON public.user_profiles FOR ALL
  USING (public.is_organizer())
  WITH CHECK (public.is_organizer());

-- TOURNAMENTS POLICIES
DROP POLICY IF EXISTS "Public & Players can view published non-archived tournaments" ON public.tournaments;
CREATE POLICY "Public & Players can view published non-archived tournaments"
  ON public.tournaments FOR SELECT
  USING (is_archived = false OR public.is_organizer());

DROP POLICY IF EXISTS "Organizers have full control over tournaments" ON public.tournaments;
CREATE POLICY "Organizers have full control over tournaments"
  ON public.tournaments FOR ALL
  USING (public.is_organizer())
  WITH CHECK (public.is_organizer());

-- TEAMS POLICIES
DROP POLICY IF EXISTS "Public & Players can view teams" ON public.teams;
CREATE POLICY "Public & Players can view teams"
  ON public.teams FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Organizers can manage teams" ON public.teams;
CREATE POLICY "Organizers can manage teams"
  ON public.teams FOR ALL
  USING (public.is_organizer())
  WITH CHECK (public.is_organizer());

-- PLAYERS POLICIES
DROP POLICY IF EXISTS "Public & Players can view players" ON public.players;
CREATE POLICY "Public & Players can view players"
  ON public.players FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Organizers can manage players" ON public.players;
CREATE POLICY "Organizers can manage players"
  ON public.players FOR ALL
  USING (public.is_organizer())
  WITH CHECK (public.is_organizer());

-- MATCHES POLICIES
DROP POLICY IF EXISTS "Public & Players can view matches" ON public.matches;
CREATE POLICY "Public & Players can view matches"
  ON public.matches FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Organizers can manage fixtures, scores, and results" ON public.matches;
CREATE POLICY "Organizers can manage fixtures, scores, and results"
  ON public.matches FOR ALL
  USING (public.is_organizer())
  WITH CHECK (public.is_organizer());

-- STANDINGS POLICIES
DROP POLICY IF EXISTS "Public & Players can view standings" ON public.standings;
CREATE POLICY "Public & Players can view standings"
  ON public.standings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Organizers can manage standings" ON public.standings;
CREATE POLICY "Organizers can manage standings"
  ON public.standings FOR ALL
  USING (public.is_organizer())
  WITH CHECK (public.is_organizer());

-- SPONSORS POLICIES
DROP POLICY IF EXISTS "Public & Players can view active public sponsors" ON public.sponsors;
CREATE POLICY "Public & Players can view active public sponsors"
  ON public.sponsors FOR SELECT
  USING (display_on_public_web = true OR public.is_organizer());

DROP POLICY IF EXISTS "Organizers can manage sponsors" ON public.sponsors;
CREATE POLICY "Organizers can manage sponsors"
  ON public.sponsors FOR ALL
  USING (public.is_organizer())
  WITH CHECK (public.is_organizer());

-- EXPENSES POLICIES (ORGANIZER ONLY)
DROP POLICY IF EXISTS "Only organizers can view expenses" ON public.expenses;
CREATE POLICY "Only organizers can view expenses"
  ON public.expenses FOR SELECT
  USING (public.is_organizer());

DROP POLICY IF EXISTS "Only organizers can manage expenses" ON public.expenses;
CREATE POLICY "Only organizers can manage expenses"
  ON public.expenses FOR ALL
  USING (public.is_organizer())
  WITH CHECK (public.is_organizer());

-- REGISTRATIONS POLICIES
-- 1. Public players (both authenticated and unauthenticated guests) can register without an account
DROP POLICY IF EXISTS "Public players can submit tournament registration" ON public.registrations;
CREATE POLICY "Public players can submit tournament registration"
  ON public.registrations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_id AND registration_open = true
    )
    OR public.is_organizer()
  );

-- 2. Public read of registrations or players checking admission
DROP POLICY IF EXISTS "Public players can view registrations" ON public.registrations;
CREATE POLICY "Public players can view registrations"
  ON public.registrations FOR SELECT
  USING (true);

-- 3. Organizers have full management over registrations
DROP POLICY IF EXISTS "Organizers can manage registrations" ON public.registrations;
CREATE POLICY "Organizers can manage registrations"
  ON public.registrations FOR ALL
  USING (public.is_organizer())
  WITH CHECK (public.is_organizer());

-- AUCTION CONFIGS & BIDS POLICIES
DROP POLICY IF EXISTS "Public & Players can view auction config" ON public.auction_configs;
CREATE POLICY "Public & Players can view auction config"
  ON public.auction_configs FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Organizers can manage auction config" ON public.auction_configs;
CREATE POLICY "Organizers can manage auction config"
  ON public.auction_configs FOR ALL
  USING (public.is_organizer())
  WITH CHECK (public.is_organizer());

DROP POLICY IF EXISTS "Public & Players can view auction bids" ON public.auction_bids;
CREATE POLICY "Public & Players can view auction bids"
  ON public.auction_bids FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Organizers can insert and manage auction bids" ON public.auction_bids;
CREATE POLICY "Organizers can insert and manage auction bids"
  ON public.auction_bids FOR ALL
  USING (public.is_organizer())
  WITH CHECK (public.is_organizer());

-- RULES & MEDIA ASSETS POLICIES
DROP POLICY IF EXISTS "Public can view published rules" ON public.rules;
CREATE POLICY "Public can view published rules"
  ON public.rules FOR SELECT
  USING (is_published = true OR public.is_organizer());

DROP POLICY IF EXISTS "Organizers can manage rules" ON public.rules;
CREATE POLICY "Organizers can manage rules"
  ON public.rules FOR ALL
  USING (public.is_organizer())
  WITH CHECK (public.is_organizer());

DROP POLICY IF EXISTS "Public can view media assets" ON public.media_assets;
CREATE POLICY "Public can view media assets"
  ON public.media_assets FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Organizers can manage media assets" ON public.media_assets;
CREATE POLICY "Organizers can manage media assets"
  ON public.media_assets FOR ALL
  USING (public.is_organizer())
  WITH CHECK (public.is_organizer());

-- IMPORT JOBS & AUDIT LOGS (ORGANIZER ONLY)
DROP POLICY IF EXISTS "Organizers can manage import jobs" ON public.import_jobs;
CREATE POLICY "Organizers can manage import jobs"
  ON public.import_jobs FOR ALL
  USING (public.is_organizer())
  WITH CHECK (public.is_organizer());

DROP POLICY IF EXISTS "Organizers can manage audit logs" ON public.audit_logs;
CREATE POLICY "Organizers can manage audit logs"
  ON public.audit_logs FOR ALL
  USING (public.is_organizer())
  WITH CHECK (public.is_organizer());
