// Supabase PostgreSQL Data Layer for Warhawks Tournament Management
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

/**
 * Normalizes a tournament record from database row to frontend model
 */
const mapTournamentFromDb = (row) => ({
  id: row.id,
  name: row.name,
  editionNumber: row.edition_number,
  year: row.year,
  format: row.format,
  status: row.status,
  organizer: row.organizer || 'Warhawks',
  organizerRole: row.organizer_role,
  organizerBranch: row.organizer_branch,
  startDate: row.start_date,
  endDate: row.end_date,
  venue: row.venue,
  city: row.city,
  registrationOpen: row.registration_open,
  registrationStartDate: row.registration_start_date,
  registrationEndDate: row.registration_end_date,
  totalBudgetPointsPerTeam: Number(row.total_budget_points_per_team),
  pointsPerWin: row.points_per_win,
  pointsPerTie: row.points_per_tie,
  maxSquadSize: row.max_squad_size,
  minSquadSize: row.min_squad_size,
  maxOverseasPlayers: row.max_overseas_players,
  description: row.description,
  isArchived: row.is_archived,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

/**
 * Normalizes a team record from database row
 */
const mapTeamFromDb = (row) => ({
  id: row.id,
  tournamentId: row.tournament_id,
  name: row.name,
  shortCode: row.short_code,
  city: row.city,
  primaryColor: row.primary_color,
  secondaryColor: row.secondary_color,
  logoUrl: row.logo_url,
  ownerName: row.owner_name,
  captainPlayerId: row.captain_player_id,
  budgetTotal: Number(row.budget_total),
  budgetSpent: Number(row.budget_spent),
  budgetRemaining: Number(row.budget_remaining),
  totalPlayersAssigned: row.total_players_assigned,
  createdAt: row.created_at
});

/**
 * Normalizes a player record from database row
 */
const mapPlayerFromDb = (row) => ({
  id: row.id,
  tournamentId: row.tournament_id,
  teamId: row.team_id,
  name: row.name,
  jerseyNumber: row.jersey_number,
  role: row.role,
  battingStyle: row.batting_style,
  bowlingStyle: row.bowling_style,
  basePrice: Number(row.base_price),
  soldPrice: row.sold_price ? Number(row.sold_price) : null,
  auctionStatus: row.auction_status,
  isCaptain: row.is_captain,
  isOverseas: row.is_overseas,
  email: row.email,
  phone: row.phone,
  city: row.city,
  shirtSize: row.shirt_size,
  foodPreference: row.food_preference,
  registrationStatus: row.registration_status,
  paymentStatus: row.payment_status,
  matchesPlayed: row.matches_played,
  runsScored: row.runs_scored,
  highestScore: row.highest_score,
  wicketsTaken: row.wickets_taken,
  bestBowling: row.best_bowling,
  strikeRate: Number(row.strike_rate),
  economyRate: Number(row.economy_rate),
  createdAt: row.created_at
});

/**
 * Normalizes a match record from database row
 */
const mapMatchFromDb = (row) => ({
  id: row.id,
  tournamentId: row.tournament_id,
  matchNumber: row.match_number,
  round: row.round,
  teamAId: row.team_a_id,
  teamBId: row.team_b_id,
  date: row.date,
  time: row.time,
  venue: row.venue,
  status: row.status,
  tossWinnerId: row.toss_winner_id,
  tossDecision: row.toss_decision,
  teamAScore: row.team_a_score,
  teamAOvers: row.team_a_overs ? Number(row.team_a_overs) : null,
  teamBScore: row.team_b_score,
  teamBOvers: row.team_b_overs ? Number(row.team_b_overs) : null,
  winnerId: row.winner_id,
  resultSummary: row.result_summary,
  manOfTheMatchPlayerId: row.man_of_the_match_player_id,
  isImported: row.is_imported,
  importSource: row.import_source,
  cricheroesMatchId: row.cricheroes_match_id,
  createdAt: row.created_at
});

/**
 * Normalizes a sponsor record from database row (includes name, contact_number, contribution_amount)
 */
const mapSponsorFromDb = (row) => ({
  id: row.id,
  tournamentId: row.tournament_id,
  name: row.name,
  contactNumber: row.contact_number,
  contributionAmount: Number(row.contribution_amount),
  contactEmail: row.contact_email,
  tier: row.tier || 'Official Partner',
  benefitsDescription: row.benefits_description,
  websiteUrl: row.website_url,
  isActive: row.is_active,
  displayOnPublicWeb: row.display_on_public_web,
  createdAt: row.created_at
});

/**
 * Normalizes a registration record from database row (includes player and guest dietary preferences and meal options)
 */
const mapRegistrationFromDb = (row) => ({
  id: row.id,
  tournamentId: row.tournament_id,
  fullName: row.full_name,
  email: row.email,
  phone: row.phone,
  age: row.age,
  city: row.city,
  primaryRole: row.primary_role,
  battingStyle: row.batting_style,
  bowlingStyle: row.bowling_style,
  preferredJerseyNo: row.preferred_jersey_no,
  shirtSize: row.shirt_size,
  foodPreference: row.food_preference,
  hasBreakfast: Boolean(row.has_breakfast),
  hasLunch: Boolean(row.has_lunch),
  guestCount: Number(row.guest_count) || 0,
  guestFoodPreference: row.guest_food_preference || 'Veg',
  hasGuestBreakfast: Boolean(row.has_guest_breakfast),
  hasGuestLunch: Boolean(row.has_guest_lunch),
  cateringStatus: row.catering_status || 'requested',
  approvalStatus: row.approval_status,
  paymentStatus: row.payment_status,
  cricHeroesProfileUrl: row.cric_heroes_profile_url,
  applicationDate: row.application_date,
  reviewedBy: row.reviewed_by,
  reviewNotes: row.review_notes
});

export const supabaseDb = {
  // Tournaments
  async getTournaments() {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await client
      .from('tournaments')
      .select('*')
      .order('edition_number', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapTournamentFromDb);
  },

  async createTournament(t) {
    const client = getSupabaseClient();
    if (!client) return null;

    const row = {
      id: t.id,
      name: t.name,
      edition_number: t.editionNumber,
      year: t.year,
      format: t.format || 'T20',
      status: t.status || 'upcoming',
      organizer: t.organizer || 'Warhawks',
      organizer_role: t.organizerRole || 'Official Tournament Organizer & Host',
      organizer_branch: t.organizerBranch || 'Warhawks Tournament Operations',
      start_date: t.startDate,
      end_date: t.endDate,
      venue: t.venue,
      city: t.city,
      registration_open: Boolean(t.registrationOpen),
      registration_start_date: t.registrationStartDate,
      registration_end_date: t.registrationEndDate,
      total_budget_points_per_team: t.totalBudgetPointsPerTeam || 10000000,
      points_per_win: t.pointsPerWin ?? 2,
      points_per_tie: t.pointsPerTie ?? 1,
      max_squad_size: t.maxSquadSize || 18,
      min_squad_size: t.minSquadSize || 14,
      max_overseas_players: t.maxOverseasPlayers || 4,
      description: t.description || '',
      is_archived: Boolean(t.isArchived)
    };

    const { data, error } = await client.from('tournaments').insert([row]).select().single();
    if (error) throw error;
    return mapTournamentFromDb(data);
  },

  async updateTournament(id, updates) {
    const client = getSupabaseClient();
    if (!client) return null;

    const row = {};
    if (updates.name !== undefined) row.name = updates.name;
    if (updates.format !== undefined) row.format = updates.format;
    if (updates.status !== undefined) row.status = updates.status;
    if (updates.venue !== undefined) row.venue = updates.venue;
    if (updates.city !== undefined) row.city = updates.city;
    if (updates.registrationOpen !== undefined) row.registration_open = updates.registrationOpen;
    if (updates.registrationStartDate !== undefined) row.registration_start_date = updates.registrationStartDate;
    if (updates.registrationEndDate !== undefined) row.registration_end_date = updates.registrationEndDate;
    if (updates.totalBudgetPointsPerTeam !== undefined) row.total_budget_points_per_team = updates.totalBudgetPointsPerTeam;
    if (updates.isArchived !== undefined) row.is_archived = updates.isArchived;

    const { data, error } = await client.from('tournaments').update(row).eq('id', id).select().single();
    if (error) throw error;
    return mapTournamentFromDb(data);
  },

  // Sponsors
  async getSponsors(tournamentId) {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await client
      .from('sponsors')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapSponsorFromDb);
  },

  async createSponsor(s) {
    const client = getSupabaseClient();
    if (!client) return null;

    const row = {
      id: s.id,
      tournament_id: s.tournamentId,
      name: s.name,
      contact_number: s.contactNumber,
      contribution_amount: s.contributionAmount,
      contact_email: s.contactEmail || null,
      tier: s.tier || 'Official Partner',
      benefits_description: s.benefitsDescription || null,
      website_url: s.websiteUrl || null,
      is_active: s.isActive ?? true,
      display_on_public_web: s.displayOnPublicWeb ?? true
    };

    const { data, error } = await client.from('sponsors').insert([row]).select().single();
    if (error) throw error;
    return mapSponsorFromDb(data);
  },

  async updateSponsor(id, updates) {
    const client = getSupabaseClient();
    if (!client) return null;

    const row = {};
    if (updates.name !== undefined) row.name = updates.name;
    if (updates.contactNumber !== undefined) row.contact_number = updates.contactNumber;
    if (updates.contributionAmount !== undefined) row.contribution_amount = updates.contributionAmount;
    if (updates.contactEmail !== undefined) row.contact_email = updates.contactEmail;
    if (updates.displayOnPublicWeb !== undefined) row.display_on_public_web = updates.displayOnPublicWeb;

    const { data, error } = await client.from('sponsors').update(row).eq('id', id).select().single();
    if (error) throw error;
    return mapSponsorFromDb(data);
  },

  async deleteSponsor(id) {
    const client = getSupabaseClient();
    if (!client) return null;

    const { error } = await client.from('sponsors').delete().eq('id', id);
    if (error) throw error;
  },

  // Registrations (Player and Guest Meal Logistics)
  async getRegistrations(tournamentId) {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await client
      .from('registrations')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('application_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapRegistrationFromDb);
  },

  async createRegistration(reg) {
    const client = getSupabaseClient();
    if (!client) return null;

    const row = {
      id: reg.id,
      tournament_id: reg.tournamentId,
      full_name: reg.fullName,
      email: reg.email,
      phone: reg.phone,
      age: reg.age,
      city: reg.city,
      primary_role: reg.primaryRole,
      batting_style: reg.battingStyle,
      bowling_style: reg.bowlingStyle,
      preferred_jersey_no: reg.preferredJerseyNo,
      shirt_size: reg.shirtSize,
      food_preference: reg.foodPreference === 'Non-Veg' ? 'Non-Veg' : 'Veg',
      has_breakfast: Boolean(reg.hasBreakfast),
      has_lunch: Boolean(reg.hasLunch),
      guest_count: Number(reg.guestCount) || 0,
      guest_food_preference: reg.guestFoodPreference === 'Non-Veg' ? 'Non-Veg' : 'Veg',
      has_guest_breakfast: Boolean(reg.hasGuestBreakfast),
      has_guest_lunch: Boolean(reg.hasGuestLunch),
      catering_status: reg.cateringStatus || 'requested',
      approval_status: reg.approvalStatus || 'pending',
      payment_status: reg.paymentStatus || 'pending'
    };

    const { data, error } = await client.from('registrations').insert([row]).select().single();
    if (error) throw error;
    return mapRegistrationFromDb(data);
  },

  async updateRegistration(id, updates) {
    const client = getSupabaseClient();
    if (!client) return null;

    const row = {};
    if (updates.approvalStatus !== undefined) row.approval_status = updates.approvalStatus;
    if (updates.reviewNotes !== undefined) row.review_notes = updates.reviewNotes;
    if (updates.reviewedBy !== undefined) row.reviewed_by = updates.reviewedBy;
    if (updates.foodPreference !== undefined) row.food_preference = updates.foodPreference;
    if (updates.hasBreakfast !== undefined) row.has_breakfast = updates.hasBreakfast;
    if (updates.hasLunch !== undefined) row.has_lunch = updates.hasLunch;
    if (updates.guestCount !== undefined) row.guest_count = updates.guestCount;
    if (updates.guestFoodPreference !== undefined) row.guest_food_preference = updates.guestFoodPreference;
    if (updates.hasGuestBreakfast !== undefined) row.has_guest_breakfast = updates.hasGuestBreakfast;
    if (updates.hasGuestLunch !== undefined) row.has_guest_lunch = updates.hasGuestLunch;
    if (updates.cateringStatus !== undefined) row.catering_status = updates.cateringStatus;

    const { data, error } = await client.from('registrations').update(row).eq('id', id).select().single();
    if (error) throw error;
    return mapRegistrationFromDb(data);
  },

  async cancelRegistration(id) {
    const client = getSupabaseClient();
    if (!client) return null;

    const { error } = await client.from('registrations').delete().eq('id', id);
    if (error) throw error;
  },

  // Teams
  async getTeams(tournamentId) {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await client
      .from('teams')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('name');

    if (error) throw error;
    return (data || []).map(mapTeamFromDb);
  },

  // Players
  async getPlayers(tournamentId) {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await client
      .from('players')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('name');

    if (error) throw error;
    return (data || []).map(mapPlayerFromDb);
  },

  // Matches
  async getMatches(tournamentId) {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await client
      .from('matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('match_number');

    if (error) throw error;
    return (data || []).map(mapMatchFromDb);
  },

  /**
   * One-click seed function: pushes all local sample records to Supabase tables
   */
  async seedSupabaseFromLocal(localSchema) {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase client is not connected.');

    const results = { tournaments: 0, teams: 0, players: 0, matches: 0, sponsors: 0, registrations: 0 };

    // 1. Tournaments
    for (const t of localSchema.tournaments || []) {
      const row = {
        id: t.id,
        name: t.name,
        edition_number: t.editionNumber,
        year: t.year,
        format: t.format,
        status: t.status,
        organizer: t.organizer || 'Warhawks',
        organizer_role: t.organizerRole,
        organizer_branch: t.organizerBranch,
        start_date: t.startDate,
        end_date: t.endDate,
        venue: t.venue,
        city: t.city,
        registration_open: t.registrationOpen,
        total_budget_points_per_team: t.totalBudgetPointsPerTeam,
        description: t.description,
        is_archived: t.isArchived
      };
      const { error } = await client.from('tournaments').upsert(row, { onConflict: 'id' });
      if (!error) results.tournaments++;
    }

    // 2. Teams
    for (const tm of localSchema.teams || []) {
      const row = {
        id: tm.id,
        tournament_id: tm.tournamentId,
        name: tm.name,
        short_code: tm.shortCode,
        city: tm.city,
        owner_name: tm.ownerName,
        budget_total: tm.budgetTotal
      };
      const { error } = await client.from('teams').upsert(row, { onConflict: 'id' });
      if (!error) results.teams++;
    }

    // 3. Players
    for (const p of localSchema.players || []) {
      const row = {
        id: p.id,
        tournament_id: p.tournamentId,
        team_id: p.teamId,
        name: p.name,
        jersey_number: p.jerseyNumber,
        role: p.role,
        batting_style: p.battingStyle,
        bowling_style: p.bowlingStyle,
        email: p.email,
        phone: p.phone,
        city: p.city,
        food_preference: p.foodPreference === 'Non-Veg' ? 'Non-Veg' : 'Veg'
      };
      const { error } = await client.from('players').upsert(row, { onConflict: 'id' });
      if (!error) results.players++;
    }

    // 4. Sponsors
    for (const s of localSchema.sponsors || []) {
      const row = {
        id: s.id,
        tournament_id: s.tournamentId,
        name: s.name,
        contact_number: s.contactNumber || '+91 98200 12345',
        contribution_amount: s.contributionAmount || 0,
        contact_email: s.contactEmail,
        is_active: s.isActive ?? true,
        display_on_public_web: s.displayOnPublicWeb ?? true
      };
      const { error } = await client.from('sponsors').upsert(row, { onConflict: 'id' });
      if (!error) results.sponsors++;
    }

    // 5. Registrations
    for (const r of localSchema.registrations || []) {
      const row = {
        id: r.id,
        tournament_id: r.tournamentId,
        full_name: r.fullName,
        email: r.email,
        phone: r.phone,
        age: r.age,
        city: r.city,
        primary_role: r.primaryRole,
        batting_style: r.battingStyle,
        bowling_style: r.bowlingStyle,
        food_preference: r.foodPreference === 'Non-Veg' ? 'Non-Veg' : 'Veg',
        has_breakfast: Boolean(r.hasBreakfast),
        has_lunch: Boolean(r.hasLunch),
        guest_count: Number(r.guestCount) || 0,
        guest_food_preference: r.guestFoodPreference === 'Non-Veg' ? 'Non-Veg' : 'Veg',
        has_guest_breakfast: Boolean(r.hasGuestBreakfast),
        has_guest_lunch: Boolean(r.hasGuestLunch),
        catering_status: r.cateringStatus || 'confirmed',
        approval_status: r.approvalStatus || 'approved'
      };
      const { error } = await client.from('registrations').upsert(row, { onConflict: 'id' });
      if (!error) results.registrations++;
    }

    return results;
  }
};
