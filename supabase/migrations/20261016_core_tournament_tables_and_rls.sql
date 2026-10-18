-- ==============================================================================
-- Warhawks Tournament Management System — Core Tables Migration & RLS
-- Migration: 20261016_core_tournament_tables_and_rls.sql
-- Tables Covered:
--   1. Tournaments (Championship editions, formats, scheduling, budget caps)
--   2. Registrations (Player & guest dietary requisitions, meal checkboxes, approvals)
--   3. Sponsors (Sponsor name, contact number, contributions, tier, web display)
--   4. Fixtures / Matches (Fixtures, teams, live scores, results, venues)
-- Includes:
--   - Foreign key constraints with ON DELETE CASCADE / SET NULL
--   - Performance indexes on foreign keys, status fields, and query filters
--   - Strict Row Level Security (RLS) policies for 'Organizer' and 'Player' roles
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. EXTENSIONS & PREREQUISITES
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Role and Status Enums (safe creation)
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
-- 1. ROLE RESOLUTION & USER PROFILES
-- ------------------------------------------------------------------------------
-- Central profile table linked with Supabase auth.users to resolve user roles
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

-- Security Definer function to check if current authenticated user is an Organizer
CREATE OR REPLACE FUNCTION public.is_organizer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'organizer'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Security Definer function to retrieve current user's email
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT email FROM public.user_profiles WHERE id = auth.uid()),
    (auth.jwt()->>'email')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ------------------------------------------------------------------------------
-- 2. TABLE: TOURNAMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tournaments (
  id TEXT PRIMARY KEY DEFAULT ('tour-' || substr(md5(random()::text), 1, 10)),
  name TEXT NOT NULL,
  edition_number INT NOT NULL,
  year INT NOT NULL,
  format TEXT NOT NULL DEFAULT 'T20', -- Freeform format string (e.g., T20, ODI, 10-Over, Box Cricket)
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
  CONSTRAINT uq_tournaments_edition UNIQUE (name, edition_number)
);

-- ------------------------------------------------------------------------------
-- 3. TABLE: TEAMS (Required Foreign Key Reference for Fixtures)
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
-- 4. TABLE: FIXTURES / MATCHES
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
  toss_winner_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL,
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
  CONSTRAINT uq_match_tournament_number UNIQUE (tournament_id, match_number),
  CONSTRAINT chk_different_teams CHECK (team_a_id <> team_b_id)
);

-- ------------------------------------------------------------------------------
-- 5. TABLE: SPONSORS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sponsors (
  id TEXT PRIMARY KEY DEFAULT ('sp-' || substr(md5(random()::text), 1, 10)),
  tournament_id TEXT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Sponsor Name
  contact_number TEXT NOT NULL, -- Direct phone / contact number
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
-- 6. TABLE: REGISTRATIONS (PLAYER & GUEST DIETARY REQUISITIONS)
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
  -- Individual Athlete Meal Requirements
  food_preference dietary_preference NOT NULL DEFAULT 'Veg', -- Veg or Non-Veg only
  has_breakfast BOOLEAN NOT NULL DEFAULT true,               -- Breakfast checkbox
  has_lunch BOOLEAN NOT NULL DEFAULT true,                   -- Lunch checkbox
  -- Guest Meal Requirements
  guest_count INT NOT NULL DEFAULT 0,                        -- Guest Number
  guest_food_preference dietary_preference NOT NULL DEFAULT 'Veg',
  has_guest_breakfast BOOLEAN NOT NULL DEFAULT false,        -- Guest Breakfast checkbox
  has_guest_lunch BOOLEAN NOT NULL DEFAULT false,            -- Guest Lunch checkbox
  -- Administrative & Catering Pipeline
  catering_status TEXT NOT NULL DEFAULT 'requested',         -- requested, confirmed, served
  approval_status TEXT NOT NULL DEFAULT 'pending',           -- pending, approved, rejected, waitlisted
  payment_status TEXT NOT NULL DEFAULT 'pending',            -- pending, paid, waived
  cric_heroes_profile_url TEXT,
  application_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  reviewed_by TEXT,
  review_notes TEXT,
  CONSTRAINT uq_registration_tournament_email UNIQUE (tournament_id, email),
  CONSTRAINT chk_positive_guests CHECK (guest_count >= 0)
);

-- ------------------------------------------------------------------------------
-- 7. PERFORMANCE & LOOKUP INDEXES
-- ------------------------------------------------------------------------------
-- Tournaments indexes
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments (status);
CREATE INDEX IF NOT EXISTS idx_tournaments_active ON public.tournaments (is_archived, registration_open);

-- Teams indexes
CREATE INDEX IF NOT EXISTS idx_teams_tournament_id ON public.teams (tournament_id);

-- Fixtures / Matches indexes
CREATE INDEX IF NOT EXISTS idx_matches_tournament_id ON public.matches (tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_date_status ON public.matches (tournament_id, date, status);
CREATE INDEX IF NOT EXISTS idx_matches_team_a ON public.matches (team_a_id);
CREATE INDEX IF NOT EXISTS idx_matches_team_b ON public.matches (team_b_id);

-- Sponsors indexes
CREATE INDEX IF NOT EXISTS idx_sponsors_tournament_id ON public.sponsors (tournament_id);
CREATE INDEX IF NOT EXISTS idx_sponsors_public ON public.sponsors (tournament_id, is_active, display_on_public_web);

-- Registrations indexes
CREATE INDEX IF NOT EXISTS idx_registrations_tournament_id ON public.registrations (tournament_id);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations (email);
CREATE INDEX IF NOT EXISTS idx_registrations_approval_status ON public.registrations (tournament_id, approval_status);
CREATE INDEX IF NOT EXISTS idx_registrations_catering_status ON public.registrations (tournament_id, catering_status);

-- ------------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all 4 core tables (plus teams and user_profiles)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 8.1 TOURNAMENTS RLS POLICIES
-- ------------------------------------------------------------------------------
-- Players & General Public: Can read any non-archived tournament
DROP POLICY IF EXISTS "Players can view active tournaments" ON public.tournaments;
CREATE POLICY "Players can view active tournaments"
  ON public.tournaments FOR SELECT
  USING (is_archived = false OR public.is_organizer());

-- Organizers: Full CRUD control over tournaments
DROP POLICY IF EXISTS "Organizers have full control over tournaments" ON public.tournaments;
CREATE POLICY "Organizers have full control over tournaments"
  ON public.tournaments FOR ALL
  USING (public.is_organizer())
  WITH CHECK (public.is_organizer());

-- ------------------------------------------------------------------------------
-- 8.2 FIXTURES / MATCHES RLS POLICIES
-- ------------------------------------------------------------------------------
-- Players & General Public: Can view fixtures, live scores, and verified results
DROP POLICY IF EXISTS "Players can view fixtures and match results" ON public.matches;
CREATE POLICY "Players can view fixtures and match results"
  ON public.matches FOR SELECT
  USING (true);

-- Organizers: Full CRUD control over fixtures, scoring, and CricHeroes imports
DROP POLICY IF EXISTS "Organizers can manage fixtures and match scoring" ON public.matches;
CREATE POLICY "Organizers can manage fixtures and match scoring"
  ON public.matches FOR ALL
  USING (public.is_organizer())
  WITH CHECK (public.is_organizer());

-- ------------------------------------------------------------------------------
-- 8.3 SPONSORS RLS POLICIES
-- ------------------------------------------------------------------------------
-- Players & General Public: Can view sponsors enabled for public display
DROP POLICY IF EXISTS "Players can view active public sponsors" ON public.sponsors;
CREATE POLICY "Players can view active public sponsors"
  ON public.sponsors FOR SELECT
  USING (display_on_public_web = true OR public.is_organizer());

-- Organizers: Full CRUD control over sponsor contracts, contacts, and funding
DROP POLICY IF EXISTS "Organizers can manage tournament sponsors" ON public.sponsors;
CREATE POLICY "Organizers can manage tournament sponsors"
  ON public.sponsors FOR ALL
  USING (public.is_organizer())
  WITH CHECK (public.is_organizer());

-- ------------------------------------------------------------------------------
-- 8.4 REGISTRATIONS RLS POLICIES
-- ------------------------------------------------------------------------------
-- Players: Can view their own submitted registration application
DROP POLICY IF EXISTS "Players can view their own registration" ON public.registrations;
CREATE POLICY "Players can view their own registration"
  ON public.registrations FOR SELECT
  USING (
    email = public.current_user_email()
    OR public.is_organizer()
  );

-- Players: Can submit registration when the tournament registration portal is open
DROP POLICY IF EXISTS "Players can submit tournament registration" ON public.registrations;
CREATE POLICY "Players can submit tournament registration"
  ON public.registrations FOR INSERT
  WITH CHECK (
    -- Registration must be currently active and open for the target tournament
    EXISTS (
      SELECT 1 FROM public.tournaments
      WHERE id = tournament_id AND registration_open = true
    )
    -- Enforce that non-organizers can only submit under their own verified email
    AND (
      public.is_organizer()
      OR email = public.current_user_email()
    )
  );

-- Players: Can update their personal dietary preference and meal requirements while pending
DROP POLICY IF EXISTS "Players can update their pending registration" ON public.registrations;
CREATE POLICY "Players can update their pending registration"
  ON public.registrations FOR UPDATE
  USING (
    approval_status = 'pending' AND (
      email = public.current_user_email()
      OR public.is_organizer()
    )
  )
  WITH CHECK (
    approval_status = 'pending' AND (
      email = public.current_user_email()
      OR public.is_organizer()
    )
  );

-- Players: Can withdraw/cancel their registration if still pending review
DROP POLICY IF EXISTS "Players can cancel their pending registration" ON public.registrations;
CREATE POLICY "Players can cancel their pending registration"
  ON public.registrations FOR DELETE
  USING (
    approval_status = 'pending' AND (
      email = public.current_user_email()
      OR public.is_organizer()
    )
  );

-- Organizers: Full administrative control over registrations (reviews, dietary reports, status)
DROP POLICY IF EXISTS "Organizers have full control over all registrations" ON public.registrations;
CREATE POLICY "Organizers have full control over all registrations"
  ON public.registrations FOR ALL
  USING (public.is_organizer())
  WITH CHECK (public.is_organizer());
