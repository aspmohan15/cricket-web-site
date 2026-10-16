-- ==============================================================================
-- Warhawks Tournament Management System — Production Supabase Schema & RLS
-- Migration: 20261016_initial_warhawks_schema.sql
-- Description: Two-Role RBAC (organizer, player), full tournament management,
--              player & guest dietary requisition, sponsors, fixtures, and RLS policies.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS & DOMAINS
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

-- 3. USER PROFILES TABLE (Linked with Supabase auth.users)
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

-- Ensure non-organizers cannot grant themselves organizer access
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'player' -- Strict security: default all public signups to 'player'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to check if current authenticated user is an Organizer
CREATE OR REPLACE FUNCTION public.is_organizer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'organizer'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 4. TOURNAMENTS TABLE
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
  registration_open BOOLEAN NOT NULL DEFAULT false,
  registration_start_date DATE,
  registration_end_date DATE,
  total_budget_points_per_team NUMERIC(14, 2) NOT NULL DEFAULT 10000000,
  points_per_win INT NOT NULL DEFAULT 2,
  points_per_tie INT NOT NULL DEFAULT 1,
  max_squad_size INT NOT NULL DEFAULT 18,
  min_squad_size INT NOT NULL DEFAULT 14,
  max_overseas_players INT NOT NULL DEFAULT 4,
  description TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_tournament_edition UNIQUE (name, edition_number)
);

-- 5. TEAMS TABLE
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

-- 6. PLAYERS TABLE
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

-- 7. MATCHES / FIXTURES TABLE
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

-- 8. STANDINGS TABLE
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

-- 9. SPONSORS TABLE (Streamlined: Sponsor Name, Contact Number, Financial Commitment)
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

-- 10. EXPENSES TABLE
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

-- 11. REGISTRATIONS TABLE (Dietary preferences & Breakfast/Lunch for players & guests)
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
  guest_food_preference dietary_preference NOT NULL DEFAULT 'Veg',
  has_guest_breakfast BOOLEAN NOT NULL DEFAULT false,
  has_guest_lunch BOOLEAN NOT NULL DEFAULT false,
  catering_status TEXT NOT NULL DEFAULT 'requested', -- requested, confirmed, served
  approval_status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, waitlisted
  payment_status TEXT NOT NULL DEFAULT 'pending',
  cric_heroes_profile_url TEXT,
  application_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  reviewed_by TEXT,
  review_notes TEXT,
  CONSTRAINT uq_registration_tournament_email UNIQUE (tournament_id, email)
);

-- 12. TOURNAMENT RULES TABLE
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

-- 13. MEDIA ASSETS TABLE
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

-- 14. IMPORT JOBS TABLE
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

-- 15. AUDIT LOGS TABLE
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

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- USER PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id OR public.is_organizer());

CREATE POLICY "Users can update their personal profile info (except role)"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.user_profiles WHERE id = auth.uid()));

CREATE POLICY "Organizers can view and manage all user profiles"
  ON public.user_profiles FOR ALL
  USING (public.is_organizer());

-- TOURNAMENTS POLICIES
CREATE POLICY "Public & Players can view published non-archived tournaments"
  ON public.tournaments FOR SELECT
  USING (is_archived = false OR public.is_organizer());

CREATE POLICY "Organizers have full control over tournaments"
  ON public.tournaments FOR ALL
  USING (public.is_organizer());

-- TEAMS POLICIES
CREATE POLICY "Public & Players can view teams"
  ON public.teams FOR SELECT
  USING (true);

CREATE POLICY "Organizers can manage teams"
  ON public.teams FOR ALL
  USING (public.is_organizer());

-- PLAYERS POLICIES
CREATE POLICY "Public & Players can view players"
  ON public.players FOR SELECT
  USING (true);

CREATE POLICY "Organizers can manage players"
  ON public.players FOR ALL
  USING (public.is_organizer());

-- MATCHES POLICIES
CREATE POLICY "Public & Players can view matches"
  ON public.matches FOR SELECT
  USING (true);

CREATE POLICY "Organizers can manage fixtures, scores, and results"
  ON public.matches FOR ALL
  USING (public.is_organizer());

-- STANDINGS POLICIES
CREATE POLICY "Public & Players can view standings"
  ON public.standings FOR SELECT
  USING (true);

CREATE POLICY "Organizers can manage standings"
  ON public.standings FOR ALL
  USING (public.is_organizer());

-- SPONSORS POLICIES
CREATE POLICY "Public & Players can view active public sponsors"
  ON public.sponsors FOR SELECT
  USING (display_on_public_web = true OR public.is_organizer());

CREATE POLICY "Organizers can manage sponsors"
  ON public.sponsors FOR ALL
  USING (public.is_organizer());

-- EXPENSES POLICIES (ORGANIZER ONLY)
CREATE POLICY "Only organizers can view expenses"
  ON public.expenses FOR SELECT
  USING (public.is_organizer());

CREATE POLICY "Only organizers can manage expenses"
  ON public.expenses FOR ALL
  USING (public.is_organizer());

-- REGISTRATIONS POLICIES (PLAYERS SELF-REGISTER & CAN VIEW OWN; ORGANIZERS FULL ACCESS)
CREATE POLICY "Players can view their own registration"
  ON public.registrations FOR SELECT
  USING (
    email = (SELECT email FROM public.user_profiles WHERE id = auth.uid())
    OR public.is_organizer()
  );

CREATE POLICY "Players can submit their tournament application"
  ON public.registrations FOR INSERT
  WITH CHECK (
    -- Verify registration portal is currently open
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_id AND registration_open = true
    )
  );

CREATE POLICY "Players can cancel their own pending registration"
  ON public.registrations FOR DELETE
  USING (
    approval_status = 'pending' AND (
      email = (SELECT email FROM public.user_profiles WHERE id = auth.uid())
      OR public.is_organizer()
    )
  );

CREATE POLICY "Organizers have full control over registrations"
  ON public.registrations FOR ALL
  USING (public.is_organizer());

-- RULES POLICIES
CREATE POLICY "Public & Players can view published rules"
  ON public.rules FOR SELECT
  USING (is_published = true OR public.is_organizer());

CREATE POLICY "Organizers can manage tournament rules"
  ON public.rules FOR ALL
  USING (public.is_organizer());

-- MEDIA ASSETS POLICIES
CREATE POLICY "Public & Players can view media assets"
  ON public.media_assets FOR SELECT
  USING (true);

CREATE POLICY "Organizers can upload and manage media"
  ON public.media_assets FOR ALL
  USING (public.is_organizer());

-- IMPORT JOBS & AUDIT LOGS (ORGANIZERS ONLY)
CREATE POLICY "Organizers can view and record import jobs"
  ON public.import_jobs FOR ALL
  USING (public.is_organizer());

CREATE POLICY "Organizers can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.is_organizer());

CREATE POLICY "Audit logs insertion allowed"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);
