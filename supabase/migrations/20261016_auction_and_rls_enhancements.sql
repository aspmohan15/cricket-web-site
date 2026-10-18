-- ==============================================================================
-- Warhawks Tournament Management System — Auction System & Index Optimizations
-- Migration: 20261016_auction_and_rls_enhancements.sql
-- Description: Adds auction_configs and auction_bids tables with RLS and foreign key indexes.
-- ==============================================================================

-- 1. AUCTION CONFIGS TABLE
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

-- 2. AUCTION BIDS TABLE
CREATE TABLE IF NOT EXISTS public.auction_bids (
  id TEXT PRIMARY KEY DEFAULT ('bid-' || substr(md5(random()::text), 1, 10)),
  tournament_id TEXT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. INDEXES FOR PERFORMANCE & FAST LOOKUPS
CREATE INDEX IF NOT EXISTS idx_teams_tournament ON public.teams (tournament_id);
CREATE INDEX IF NOT EXISTS idx_players_tournament ON public.players (tournament_id);
CREATE INDEX IF NOT EXISTS idx_players_team ON public.players (team_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON public.matches (tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches (tournament_id, status);
CREATE INDEX IF NOT EXISTS idx_sponsors_tournament ON public.sponsors (tournament_id);
CREATE INDEX IF NOT EXISTS idx_registrations_tournament ON public.registrations (tournament_id);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations (email);
CREATE INDEX IF NOT EXISTS idx_expenses_tournament ON public.expenses (tournament_id);
CREATE INDEX IF NOT EXISTS idx_auction_bids_tournament ON public.auction_bids (tournament_id);
CREATE INDEX IF NOT EXISTS idx_auction_bids_player ON public.auction_bids (player_id);

-- 4. ROW LEVEL SECURITY (RLS) FOR AUCTION TABLES
ALTER TABLE public.auction_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_bids ENABLE ROW LEVEL SECURITY;

-- Auction Configs Policies
DROP POLICY IF EXISTS "Public & Players can view auction config" ON public.auction_configs;
CREATE POLICY "Public & Players can view auction config"
  ON public.auction_configs FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Organizers can manage auction config" ON public.auction_configs;
CREATE POLICY "Organizers can manage auction config"
  ON public.auction_configs FOR ALL
  USING (public.is_organizer());

-- Auction Bids Policies
DROP POLICY IF EXISTS "Public & Players can view auction bids" ON public.auction_bids;
CREATE POLICY "Public & Players can view auction bids"
  ON public.auction_bids FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Organizers can insert and manage auction bids" ON public.auction_bids;
CREATE POLICY "Organizers can insert and manage auction bids"
  ON public.auction_bids FOR ALL
  USING (public.is_organizer());
