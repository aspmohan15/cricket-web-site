// Warhawks Tournament Database Service (JavaScript)
import { DEFAULT_ORGANIZER_NAME, ORGANIZER_DETAILS } from '../constants';
import { isSupabaseConfigured, getSupabaseClient, updateSupabaseConfig } from './supabase';
import { supabaseDb } from './supabaseDb';

const STORAGE_KEY = 'warhawks_admin_db_v1';
const LEGACY_STORAGE_KEY = 'pavilionhq_admin_db_v1';

// Initial Seed Data with Official Organizer Identity
const initialTournaments = [
  {
    id: 'tour-ed5-2026',
    name: 'Premier Cricket Super League',
    editionNumber: 5,
    year: 2026,
    format: 'T20',
    status: 'current',
    organizer: DEFAULT_ORGANIZER_NAME,
    organizerRole: 'Official Tournament Organizer & Host',
    organizerBranch: ORGANIZER_DETAILS.branch,
    startDate: '2026-10-10',
    endDate: '2026-11-05',
    venue: 'National Cricket Stadium & Oval Grounds',
    city: 'Mumbai',
    registrationOpen: false,
    registrationStartDate: '2026-08-01',
    registrationEndDate: '2026-09-20',
    totalBudgetPointsPerTeam: 10000000,
    pointsPerWin: 2,
    pointsPerTie: 1,
    maxSquadSize: 18,
    minSquadSize: 14,
    maxOverseasPlayers: 4,
    description: 'The premier franchise T20 championship organized and hosted by Warhawks, bringing together top-tier athletic talent, franchise auctions, and international match officials.',
    isArchived: false,
    createdAt: '2026-07-15T09:00:00Z',
    updatedAt: '2026-10-12T14:30:00Z'
  },
  {
    id: 'tour-ed4-2025',
    name: 'Premier Cricket Super League - Season 4',
    editionNumber: 4,
    year: 2025,
    format: 'T20',
    status: 'completed',
    organizer: DEFAULT_ORGANIZER_NAME,
    organizerRole: 'Official Tournament Organizer & Host',
    organizerBranch: ORGANIZER_DETAILS.branch,
    startDate: '2025-10-05',
    endDate: '2025-11-02',
    venue: 'Central Metropolis Arena',
    city: 'Bengaluru',
    registrationOpen: false,
    registrationStartDate: '2025-07-15',
    registrationEndDate: '2025-09-01',
    totalBudgetPointsPerTeam: 8000000,
    pointsPerWin: 2,
    pointsPerTie: 1,
    maxSquadSize: 16,
    minSquadSize: 12,
    maxOverseasPlayers: 3,
    description: 'Edition 4 concluded under Warhawks tournament management with Royal Strikers lifting the championship trophy in a thrilling last-over final.',
    isArchived: true,
    createdAt: '2025-06-10T10:00:00Z',
    updatedAt: '2025-11-05T18:00:00Z'
  },
  {
    id: 'tour-ed6-2027',
    name: 'Premier Cricket Super League - Golden Jubilee Edition',
    editionNumber: 6,
    year: 2027,
    format: 'T20',
    status: 'upcoming',
    organizer: DEFAULT_ORGANIZER_NAME,
    organizerRole: 'Official Tournament Organizer & Host',
    organizerBranch: ORGANIZER_DETAILS.branch,
    startDate: '2027-10-15',
    endDate: '2027-11-12',
    venue: 'Grand International Cricket Complex',
    city: 'Ahmedabad',
    registrationOpen: true,
    registrationStartDate: '2026-10-01',
    registrationEndDate: '2027-04-30',
    totalBudgetPointsPerTeam: 12000000,
    pointsPerWin: 2,
    pointsPerTie: 1,
    maxSquadSize: 20,
    minSquadSize: 15,
    maxOverseasPlayers: 4,
    description: 'Upcoming landmark 6th edition hosted by Warhawks, featuring expanded team rosters, enhanced player auction budgets, and 4K broadcast production.',
    isArchived: false,
    createdAt: '2026-09-20T11:00:00Z',
    updatedAt: '2026-10-14T08:00:00Z'
  }
];

const initialTeams = [
  {
    id: 'team-titans',
    tournamentId: 'tour-ed5-2026',
    name: 'Apex Titans',
    shortCode: 'AT',
    city: 'Mumbai',
    primaryColor: '#0284c7',
    secondaryColor: '#0f172a',
    ownerName: 'Vanguard Sports Ventures',
    budgetTotal: 10000000,
    budgetSpent: 8750000,
    budgetRemaining: 1250000,
    totalPlayersAssigned: 15,
    createdAt: '2026-08-05T10:00:00Z'
  },
  {
    id: 'team-strikers',
    tournamentId: 'tour-ed5-2026',
    name: 'Royal Strikers',
    shortCode: 'RS',
    city: 'Bengaluru',
    primaryColor: '#dc2626',
    secondaryColor: '#f59e0b',
    ownerName: 'Crown Heights Capital',
    budgetTotal: 10000000,
    budgetSpent: 9100000,
    budgetRemaining: 900000,
    totalPlayersAssigned: 15,
    createdAt: '2026-08-05T10:15:00Z'
  },
  {
    id: 'team-blasters',
    tournamentId: 'tour-ed5-2026',
    name: 'Coastal Blasters',
    shortCode: 'CB',
    city: 'Chennai',
    primaryColor: '#eab308',
    secondaryColor: '#1e3a8a',
    ownerName: 'Marina Holdings Group',
    budgetTotal: 10000000,
    budgetSpent: 8300000,
    budgetRemaining: 1700000,
    totalPlayersAssigned: 14,
    createdAt: '2026-08-05T10:30:00Z'
  },
  {
    id: 'team-knights',
    tournamentId: 'tour-ed5-2026',
    name: 'Highland Knights',
    shortCode: 'HK',
    city: 'Kolkata',
    primaryColor: '#7c3aed',
    secondaryColor: '#fbbf24',
    ownerName: 'Eastern Heritage Media',
    budgetTotal: 10000000,
    budgetSpent: 8900000,
    budgetRemaining: 1100000,
    totalPlayersAssigned: 15,
    createdAt: '2026-08-05T10:45:00Z'
  },
  {
    id: 'team-cobras',
    tournamentId: 'tour-ed5-2026',
    name: 'Desert Cobras',
    shortCode: 'DC',
    city: 'Jaipur',
    primaryColor: '#059669',
    secondaryColor: '#064e3b',
    ownerName: 'Oasis Leisure Consortium',
    budgetTotal: 10000000,
    budgetSpent: 7950000,
    budgetRemaining: 2050000,
    totalPlayersAssigned: 14,
    createdAt: '2026-08-05T11:00:00Z'
  },
  {
    id: 'team-thunder',
    tournamentId: 'tour-ed5-2026',
    name: 'Thunderbolt XI',
    shortCode: 'TB',
    city: 'Hyderabad',
    primaryColor: '#f97316',
    secondaryColor: '#18181b',
    ownerName: 'Telangana Dynamo Sports',
    budgetTotal: 10000000,
    budgetSpent: 8600000,
    budgetRemaining: 1400000,
    totalPlayersAssigned: 14,
    createdAt: '2026-08-05T11:15:00Z'
  },
  {
    id: 'team-ed4-strikers',
    tournamentId: 'tour-ed4-2025',
    name: 'Royal Strikers 2025',
    shortCode: 'RS25',
    city: 'Bengaluru',
    primaryColor: '#dc2626',
    secondaryColor: '#f59e0b',
    ownerName: 'Crown Heights Capital',
    budgetTotal: 8000000,
    budgetSpent: 7850000,
    budgetRemaining: 150000,
    totalPlayersAssigned: 14,
    createdAt: '2025-07-01T10:00:00Z'
  },
  {
    id: 'team-ed4-titans',
    tournamentId: 'tour-ed4-2025',
    name: 'Apex Titans 2025',
    shortCode: 'AT25',
    city: 'Mumbai',
    primaryColor: '#0284c7',
    secondaryColor: '#0f172a',
    ownerName: 'Vanguard Sports Ventures',
    budgetTotal: 8000000,
    budgetSpent: 7700000,
    budgetRemaining: 300000,
    totalPlayersAssigned: 14,
    createdAt: '2025-07-01T10:00:00Z'
  }
];

const initialPlayers = [
  {
    id: 'ply-rohit-k',
    tournamentId: 'tour-ed5-2026',
    teamId: 'team-titans',
    name: 'Rohit Khandelwal',
    jerseyNumber: 45,
    role: 'Batsman',
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'Right-arm offbreak',
    basePrice: 500000,
    soldPrice: 1800000,
    auctionStatus: 'sold',
    isCaptain: true,
    isOverseas: false,
    email: 'rohit.k@apexcricket.org',
    phone: '+91 98201 44521',
    city: 'Mumbai',
    shirtSize: 'L',
    foodPreference: 'Veg',
    registrationStatus: 'approved',
    paymentStatus: 'paid',
    matchesPlayed: 4,
    runsScored: 214,
    highestScore: 88,
    wicketsTaken: 0,
    bestBowling: '-',
    strikeRate: 154.2,
    economyRate: 0,
    createdAt: '2026-08-10T11:00:00Z'
  },
  {
    id: 'ply-sam-curran',
    tournamentId: 'tour-ed5-2026',
    teamId: 'team-titans',
    name: 'Samuel Curran',
    jerseyNumber: 58,
    role: 'All-Rounder',
    battingStyle: 'Left-hand bat',
    bowlingStyle: 'Left-arm fast',
    basePrice: 750000,
    soldPrice: 2200000,
    auctionStatus: 'sold',
    isCaptain: false,
    isOverseas: true,
    email: 'sam.c@vanguardsports.co.uk',
    phone: '+44 7911 123456',
    city: 'London',
    shirtSize: 'M',
    foodPreference: 'Non-Veg',
    registrationStatus: 'approved',
    paymentStatus: 'paid',
    matchesPlayed: 4,
    runsScored: 112,
    highestScore: 48,
    wicketsTaken: 7,
    bestBowling: '3/22',
    strikeRate: 142.5,
    economyRate: 7.8,
    createdAt: '2026-08-10T11:00:00Z'
  },
  {
    id: 'ply-varun-c',
    tournamentId: 'tour-ed5-2026',
    teamId: 'team-titans',
    name: 'Varun Chakravarthy',
    jerseyNumber: 29,
    role: 'Bowler',
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'Right-arm offbreak',
    basePrice: 400000,
    soldPrice: 1400000,
    auctionStatus: 'sold',
    isCaptain: false,
    isOverseas: false,
    email: 'varun.c@spinnerhub.in',
    phone: '+91 94440 88219',
    city: 'Chennai',
    shirtSize: 'XL',
    foodPreference: 'Veg',
    registrationStatus: 'approved',
    paymentStatus: 'paid',
    matchesPlayed: 4,
    runsScored: 14,
    highestScore: 9,
    wicketsTaken: 9,
    bestBowling: '4/18',
    strikeRate: 95.0,
    economyRate: 6.2,
    createdAt: '2026-08-10T11:00:00Z'
  },
  {
    id: 'ply-virat-s',
    tournamentId: 'tour-ed5-2026',
    teamId: 'team-strikers',
    name: 'Vikramaditya Rao',
    jerseyNumber: 18,
    role: 'Batsman',
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'Right-arm medium',
    basePrice: 750000,
    soldPrice: 2450000,
    auctionStatus: 'sold',
    isCaptain: true,
    isOverseas: false,
    email: 'vikram.rao@royalstrikers.com',
    phone: '+91 98800 12345',
    city: 'Bengaluru',
    shirtSize: 'M',
    foodPreference: 'Vegan',
    registrationStatus: 'approved',
    paymentStatus: 'paid',
    matchesPlayed: 4,
    runsScored: 248,
    highestScore: 94,
    wicketsTaken: 1,
    bestBowling: '1/14',
    strikeRate: 161.8,
    economyRate: 8.2,
    createdAt: '2026-08-10T11:00:00Z'
  },
  {
    id: 'ply-rashid-k',
    tournamentId: 'tour-ed5-2026',
    teamId: 'team-strikers',
    name: 'Rashid Arman',
    jerseyNumber: 19,
    role: 'All-Rounder',
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'Right-arm legbreak',
    basePrice: 750000,
    soldPrice: 2300000,
    auctionStatus: 'sold',
    isCaptain: false,
    isOverseas: true,
    email: 'rashid.arman@cricketmail.com',
    phone: '+93 700 882910',
    city: 'Kabul',
    shirtSize: 'M',
    foodPreference: 'Halal',
    registrationStatus: 'approved',
    paymentStatus: 'paid',
    matchesPlayed: 4,
    runsScored: 86,
    highestScore: 35,
    wicketsTaken: 8,
    bestBowling: '3/15',
    strikeRate: 178.4,
    economyRate: 6.4,
    createdAt: '2026-08-10T11:00:00Z'
  },
  {
    id: 'ply-dhruv-j',
    tournamentId: 'tour-ed5-2026',
    teamId: 'team-blasters',
    name: 'Dhruv Jurel',
    jerseyNumber: 21,
    role: 'Wicket-Keeper',
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'Right-arm offbreak',
    basePrice: 400000,
    soldPrice: 1550000,
    auctionStatus: 'sold',
    isCaptain: true,
    isOverseas: false,
    email: 'dhruv.jurel@coastalblasters.in',
    phone: '+91 97190 44321',
    city: 'Agra',
    shirtSize: 'M',
    foodPreference: 'Veg',
    registrationStatus: 'approved',
    paymentStatus: 'paid',
    matchesPlayed: 4,
    runsScored: 176,
    highestScore: 68,
    wicketsTaken: 0,
    bestBowling: '-',
    strikeRate: 148.0,
    economyRate: 0,
    createdAt: '2026-08-10T11:00:00Z'
  },
  {
    id: 'ply-mitchell-s',
    tournamentId: 'tour-ed5-2026',
    name: 'Mitchell Santner',
    jerseyNumber: 74,
    role: 'All-Rounder',
    battingStyle: 'Left-hand bat',
    bowlingStyle: 'Slow left-arm orthodox',
    basePrice: 500000,
    auctionStatus: 'available',
    isCaptain: false,
    isOverseas: true,
    email: 'm.santner@blackcaps.nz',
    phone: '+64 21 890 1234',
    city: 'Hamilton',
    shirtSize: 'L',
    foodPreference: 'Non-Veg',
    registrationStatus: 'approved',
    paymentStatus: 'paid',
    matchesPlayed: 0,
    runsScored: 0,
    highestScore: 0,
    wicketsTaken: 0,
    bestBowling: '-',
    strikeRate: 0,
    economyRate: 0,
    createdAt: '2026-08-15T09:00:00Z'
  },
  {
    id: 'ply-mayank-a',
    tournamentId: 'tour-ed5-2026',
    name: 'Mayank Agarwal',
    jerseyNumber: 14,
    role: 'Batsman',
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'Right-arm offbreak',
    basePrice: 400000,
    auctionStatus: 'available',
    isCaptain: false,
    isOverseas: false,
    email: 'mayank.a@cricketkarnataka.in',
    phone: '+91 98450 55678',
    city: 'Bengaluru',
    shirtSize: 'L',
    foodPreference: 'Veg',
    registrationStatus: 'approved',
    paymentStatus: 'paid',
    matchesPlayed: 0,
    runsScored: 0,
    highestScore: 0,
    wicketsTaken: 0,
    bestBowling: '-',
    strikeRate: 0,
    economyRate: 0,
    createdAt: '2026-08-15T09:30:00Z'
  },
  {
    id: 'ply-chetan-s',
    tournamentId: 'tour-ed5-2026',
    name: 'Chetan Sakariya',
    jerseyNumber: 55,
    role: 'Bowler',
    battingStyle: 'Left-hand bat',
    bowlingStyle: 'Left-arm fast',
    basePrice: 300000,
    auctionStatus: 'unsold',
    isCaptain: false,
    isOverseas: false,
    email: 'chetan.s@saurashtracricket.in',
    phone: '+91 94260 11982',
    city: 'Bhavnagar',
    shirtSize: 'M',
    foodPreference: 'Veg',
    registrationStatus: 'approved',
    paymentStatus: 'paid',
    matchesPlayed: 0,
    runsScored: 0,
    highestScore: 0,
    wicketsTaken: 0,
    bestBowling: '-',
    strikeRate: 0,
    economyRate: 0,
    createdAt: '2026-08-15T10:00:00Z'
  }
];

const initialMatches = [
  {
    id: 'match-01',
    tournamentId: 'tour-ed5-2026',
    matchNumber: 1,
    round: 'Group Stage',
    teamAId: 'team-titans',
    teamBId: 'team-strikers',
    date: '2026-10-10',
    time: '19:30',
    venue: 'Wankhede Arena, Pitch 2',
    status: 'completed',
    tossWinnerId: 'team-titans',
    tossDecision: 'bat',
    teamAScore: '188/5',
    teamAOvers: 20.0,
    teamBScore: '182/7',
    teamBOvers: 20.0,
    winnerId: 'team-titans',
    resultSummary: 'Apex Titans won by 6 runs',
    manOfTheMatchPlayerId: 'ply-rohit-k',
    isImported: true,
    importSource: 'cricheroes',
    cricheroesMatchId: 'CH-2026-M01',
    createdAt: '2026-10-10T23:00:00Z'
  },
  {
    id: 'match-02',
    tournamentId: 'tour-ed5-2026',
    matchNumber: 2,
    round: 'Group Stage',
    teamAId: 'team-blasters',
    teamBId: 'team-knights',
    date: '2026-10-11',
    time: '15:30',
    venue: 'Central Cricket Ground, Oval 1',
    status: 'completed',
    tossWinnerId: 'team-knights',
    tossDecision: 'bowl',
    teamAScore: '165/8',
    teamAOvers: 20.0,
    teamBScore: '168/4',
    teamBOvers: 18.5,
    winnerId: 'team-knights',
    resultSummary: 'Highland Knights won by 6 wickets (7 balls left)',
    manOfTheMatchPlayerId: undefined,
    isImported: true,
    importSource: 'cricheroes',
    cricheroesMatchId: 'CH-2026-M02',
    createdAt: '2026-10-11T19:30:00Z'
  },
  {
    id: 'match-03',
    tournamentId: 'tour-ed5-2026',
    matchNumber: 3,
    round: 'Group Stage',
    teamAId: 'team-cobras',
    teamBId: 'team-thunder',
    date: '2026-10-12',
    time: '19:30',
    venue: 'Wankhede Arena, Pitch 1',
    status: 'completed',
    tossWinnerId: 'team-cobras',
    tossDecision: 'bowl',
    teamAScore: '142/9',
    teamAOvers: 19.3,
    teamBScore: '139/10',
    teamBOvers: 20.0,
    winnerId: 'team-cobras',
    resultSummary: 'Desert Cobras won by 1 wicket',
    isImported: false,
    importSource: 'manual',
    createdAt: '2026-10-12T23:30:00Z'
  },
  {
    id: 'match-04',
    tournamentId: 'tour-ed5-2026',
    matchNumber: 4,
    round: 'Group Stage',
    teamAId: 'team-strikers',
    teamBId: 'team-blasters',
    date: '2026-10-14',
    time: '19:30',
    venue: 'Wankhede Arena, Pitch 2',
    status: 'live',
    tossWinnerId: 'team-strikers',
    tossDecision: 'bat',
    teamAScore: '142/3',
    teamAOvers: 14.4,
    teamBScore: undefined,
    teamBOvers: undefined,
    resultSummary: 'Live: Royal Strikers batting at 9.68 RPO',
    isImported: false,
    createdAt: '2026-10-14T19:00:00Z'
  },
  {
    id: 'match-05',
    tournamentId: 'tour-ed5-2026',
    matchNumber: 5,
    round: 'Group Stage',
    teamAId: 'team-titans',
    teamBId: 'team-knights',
    date: '2026-10-16',
    time: '19:30',
    venue: 'Wankhede Arena, Pitch 1',
    status: 'scheduled',
    isImported: false,
    createdAt: '2026-09-28T10:00:00Z'
  },
  {
    id: 'match-06',
    tournamentId: 'tour-ed5-2026',
    matchNumber: 6,
    round: 'Group Stage',
    teamAId: 'team-thunder',
    teamBId: 'team-strikers',
    date: '2026-10-18',
    time: '15:30',
    venue: 'Central Cricket Ground, Oval 1',
    status: 'scheduled',
    isImported: false,
    createdAt: '2026-09-28T10:00:00Z'
  }
];

const initialSponsors = [
  {
    id: 'sp-01',
    tournamentId: 'tour-ed5-2026',
    name: 'Atlas Financial Technologies',
    contactNumber: '+91 98201 12345',
    tier: 'Title Sponsor',
    contributionAmount: 7500000,
    benefitsDescription: 'Title naming rights across all broadcasts, jersey center chest branding, stadium boundary 3D decals, presentation stage backdrop.',
    websiteUrl: 'https://atlasfintech.example.com',
    contactPerson: 'Sanjay Deshmukh',
    contactEmail: 'sanjay.d@atlasfintech.example.com',
    isActive: true,
    displayOnPublicWeb: true,
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'sp-02',
    tournamentId: 'tour-ed5-2026',
    name: 'Volt Energy Beverages',
    contactNumber: '+91 98110 99887',
    tier: 'Powered By',
    contributionAmount: 3500000,
    benefitsDescription: 'Dugout branding, drinks break segment ownership, official hydrator of the league, umpire sleeve patches.',
    websiteUrl: 'https://voltenergy.example.com',
    contactPerson: 'Elena Rossi',
    contactEmail: 'elena@voltenergy.example.com',
    isActive: true,
    displayOnPublicWeb: true,
    createdAt: '2026-08-05T12:00:00Z'
  },
  {
    id: 'sp-03',
    tournamentId: 'tour-ed5-2026',
    name: 'PaceMaker Sports Equipment',
    contactNumber: '+91 98450 66554',
    tier: 'Official Partner',
    contributionAmount: 1800000,
    benefitsDescription: 'Official match ball provider, Player of the Match kit awards, boundary perimeter LED boards (4 mins per match).',
    websiteUrl: 'https://pacemakersports.example.com',
    contactPerson: 'Anand Mehta',
    contactEmail: 'anand@pacemakersports.example.com',
    isActive: true,
    displayOnPublicWeb: true,
    createdAt: '2026-08-12T14:00:00Z'
  }
];

const initialExpenses = [
  {
    id: 'exp-01',
    tournamentId: 'tour-ed5-2026',
    title: 'Stadium & Pitch Preparation Lease (Wankhede Arena)',
    category: 'Ground & Pitch',
    amount: 1450000,
    date: '2026-09-25',
    vendorName: 'Metropolitan Cricket Association',
    paymentMode: 'Bank Transfer',
    paymentStatus: 'paid',
    notes: 'Includes main pitch preparation, floodlight usage for 18 evening fixtures, and practice net access.',
    createdAt: '2026-09-25T11:00:00Z'
  },
  {
    id: 'exp-02',
    tournamentId: 'tour-ed5-2026',
    title: 'BCCI/State Panel Umpires & Match Referees Remuneration',
    category: 'Umpiring & Match Officials',
    amount: 580000,
    date: '2026-10-02',
    vendorName: 'Elite Umpires Board West Zone',
    paymentMode: 'Bank Transfer',
    paymentStatus: 'paid',
    notes: 'Stipend for 4 on-field umpires, 2 third-umpires, and 2 match referees for league phase.',
    createdAt: '2026-10-02T15:00:00Z'
  },
  {
    id: 'exp-03',
    tournamentId: 'tour-ed5-2026',
    title: 'High-Definition 6-Camera Live Streaming & Third Umpire Replay Rig',
    category: 'Live Streaming & Digital Scoring',
    amount: 820000,
    date: '2026-10-05',
    vendorName: 'StreamPro Broadcast Solutions',
    paymentMode: 'Bank Transfer',
    paymentStatus: 'paid',
    notes: 'Includes robotic ball-tracking simulation, graphics overlays, and YouTube/OTT live feed encoding.',
    createdAt: '2026-10-05T09:30:00Z'
  },
  {
    id: 'exp-04',
    tournamentId: 'tour-ed5-2026',
    title: 'Match Day Catering & Player Buffet (Phase 1)',
    category: 'Catering & Food',
    amount: 320000,
    date: '2026-10-09',
    vendorName: 'Grand Gourmet Sports Hospitality',
    paymentMode: 'Bank Transfer',
    paymentStatus: 'paid',
    notes: 'Breakfast, lunch, post-match high tea for 8 team squads, officials, and support staff.',
    createdAt: '2026-10-09T18:00:00Z'
  },
  {
    id: 'exp-05',
    tournamentId: 'tour-ed5-2026',
    title: 'Custom Sublimated Team Kits & Kookaburra Match Balls',
    category: 'Team Kits & Match Balls',
    amount: 460000,
    date: '2026-09-18',
    vendorName: 'Apex Athletic Manufacturing',
    paymentMode: 'Bank Transfer',
    paymentStatus: 'paid',
    notes: '160 custom player jerseys, team caps, training bibs, and 48 A-Grade turf match balls.',
    createdAt: '2026-09-18T14:00:00Z'
  }
];

const initialFoodOrders = [
  {
    id: 'fo-01',
    tournamentId: 'tour-ed5-2026',
    teamId: 'team-titans',
    playerId: 'ply-rohit-k',
    mealType: 'Lunch',
    date: '2026-10-14',
    foodChoice: 'Veg',
    quantity: 1,
    status: 'served',
    specialInstructions: 'High protein paneer & steamed quinoa',
    updatedAt: '2026-10-14T13:10:00Z'
  },
  {
    id: 'fo-02',
    tournamentId: 'tour-ed5-2026',
    teamId: 'team-titans',
    playerId: 'ply-sam-curran',
    mealType: 'Lunch',
    date: '2026-10-14',
    foodChoice: 'Non-Veg',
    quantity: 1,
    status: 'served',
    specialInstructions: 'Grilled chicken breast with steamed greens',
    updatedAt: '2026-10-14T13:15:00Z'
  },
  {
    id: 'fo-03',
    tournamentId: 'tour-ed5-2026',
    teamId: 'team-strikers',
    playerId: 'ply-virat-s',
    mealType: 'Lunch',
    date: '2026-10-14',
    foodChoice: 'Vegan',
    quantity: 1,
    status: 'confirmed',
    specialInstructions: 'Gluten-free tofu salad bowl, almond milk shake',
    updatedAt: '2026-10-14T11:45:00Z'
  },
  {
    id: 'fo-04',
    tournamentId: 'tour-ed5-2026',
    teamId: 'team-strikers',
    playerId: 'ply-rashid-k',
    mealType: 'Lunch',
    date: '2026-10-14',
    foodChoice: 'Halal',
    quantity: 1,
    status: 'confirmed',
    specialInstructions: 'Strictly certified halal roasted chicken and aromatic rice',
    updatedAt: '2026-10-14T11:40:00Z'
  },
  {
    id: 'fo-05',
    tournamentId: 'tour-ed5-2026',
    teamId: 'team-blasters',
    playerId: 'ply-dhruv-j',
    mealType: 'High Tea',
    date: '2026-10-14',
    foodChoice: 'Veg',
    quantity: 1,
    status: 'requested',
    specialInstructions: 'Energy fruit platter and sports electrolyte bottle',
    updatedAt: '2026-10-14T09:00:00Z'
  }
];

const initialRules = [
  {
    id: 'rule-01',
    tournamentId: 'tour-ed5-2026',
    title: 'T20 Match Playing Conditions & Powerplay Protocol',
    category: 'Match Playing Conditions',
    content: 'Each innings shall consist of 20 overs. Overs 1 to 6 shall constitute Mandatory Powerplay with a maximum of 2 fielders allowed outside the 30-yard circle. A maximum of 5 fielders are permitted on the leg side at any point.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    isPublished: true,
    updatedAt: '2026-09-01T10:00:00Z'
  },
  {
    id: 'rule-02',
    tournamentId: 'tour-ed5-2026',
    title: 'Player Auction Bidding Limits & Minimum Squad Constitution',
    category: 'Auction Rules',
    content: 'Every franchise has a fixed purse of 10,000,000 Points. A minimum of 14 players and maximum of 18 players must be acquired. Each franchise must preserve sufficient purse to meet base prices for remaining roster slots.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    isPublished: true,
    updatedAt: '2026-08-15T12:00:00Z'
  },
  {
    id: 'rule-03',
    tournamentId: 'tour-ed5-2026',
    title: 'CricHeroes Scoring Protocol & Scorecard Verification',
    category: 'Tournament General',
    content: 'All official matches must be live scored on the certified CricHeroes terminal by the appointed lead scorer. Official result sign-off must occur within 30 minutes of match conclusion by both team captains and the match referee.',
    isPublished: true,
    updatedAt: '2026-09-10T14:00:00Z'
  },
  {
    id: 'rule-04',
    tournamentId: 'tour-ed5-2026',
    title: 'Code of Conduct & Spirit of Cricket Guidelines',
    category: 'Code of Conduct',
    content: 'Zero tolerance for dissent towards match officials. Level 1 offenses result in an official warning and match fee penalty; Level 2 or higher offenses result in immediate 2-match suspension upon referee review.',
    isPublished: true,
    updatedAt: '2026-08-20T08:00:00Z'
  }
];

const initialRegistrations = [
  {
    id: 'reg-01',
    tournamentId: 'tour-ed5-2026',
    fullName: 'Rohit Kulkarni',
    email: 'rohit.k@cricketmumbai.in',
    phone: '+91 98200 99887',
    age: 27,
    city: 'Mumbai',
    primaryRole: 'All-Rounder',
    battingStyle: 'Left-hand bat',
    bowlingStyle: 'Left-arm fast',
    preferredJerseyNo: 24,
    shirtSize: 'L',
    foodPreference: 'Veg',
    hasBreakfast: true,
    hasLunch: true,
    guestCount: 2,
    guestFoodPreference: 'Non-Veg',
    hasGuestBreakfast: true,
    hasGuestLunch: true,
    cricHeroesProfileUrl: 'https://cricheroes.com/player-profile/sample-rohit',
    approvalStatus: 'approved',
    paymentStatus: 'paid',
    cateringStatus: 'confirmed',
    applicationDate: '2026-10-05T14:20:00Z',
    reviewedBy: 'Warhawks Organizer',
    reviewNotes: 'Verified first-class state player. Cleared for Edition 5 match squad.'
  },
  {
    id: 'reg-02',
    tournamentId: 'tour-ed5-2026',
    fullName: 'Shubham Gill Jr',
    email: 'shubham.g@punjabcricket.org',
    phone: '+91 98760 11223',
    age: 23,
    city: 'Chandigarh',
    primaryRole: 'Batsman',
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'Right-arm offbreak',
    preferredJerseyNo: 7,
    shirtSize: 'M',
    foodPreference: 'Non-Veg',
    hasBreakfast: true,
    hasLunch: true,
    guestCount: 1,
    guestFoodPreference: 'Veg',
    hasGuestBreakfast: true,
    hasGuestLunch: true,
    cricHeroesProfileUrl: 'https://cricheroes.com/player-profile/sample-shubham',
    approvalStatus: 'approved',
    paymentStatus: 'paid',
    cateringStatus: 'served',
    applicationDate: '2026-10-08T09:15:00Z',
    reviewedBy: 'Warhawks Organizer',
    reviewNotes: 'Opening batsman credentials verified.'
  },
  {
    id: 'reg-03',
    tournamentId: 'tour-ed5-2026',
    fullName: 'Farhan Zaidi',
    email: 'farhan.z@delhiclub.in',
    phone: '+91 98110 55443',
    age: 26,
    city: 'New Delhi',
    primaryRole: 'Bowler',
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'Right-arm fast',
    preferredJerseyNo: 99,
    shirtSize: 'XL',
    foodPreference: 'Non-Veg',
    hasBreakfast: false,
    hasLunch: true,
    guestCount: 0,
    guestFoodPreference: 'Veg',
    hasGuestBreakfast: false,
    hasGuestLunch: false,
    approvalStatus: 'approved',
    paymentStatus: 'paid',
    cateringStatus: 'confirmed',
    applicationDate: '2026-10-09T16:45:00Z',
    reviewedBy: 'Warhawks Organizer',
    reviewNotes: 'Verified fast-bowling fitness certification.'
  },
  {
    id: 'reg-04',
    tournamentId: 'tour-ed5-2026',
    fullName: 'Venkatesh Iyer',
    email: 'venky.i@cricketmp.in',
    phone: '+91 98930 22334',
    age: 25,
    city: 'Indore',
    primaryRole: 'All-Rounder',
    battingStyle: 'Left-hand bat',
    bowlingStyle: 'Right-arm medium',
    preferredJerseyNo: 23,
    shirtSize: 'L',
    foodPreference: 'Veg',
    hasBreakfast: true,
    hasLunch: true,
    guestCount: 3,
    guestFoodPreference: 'Veg',
    hasGuestBreakfast: true,
    hasGuestLunch: true,
    approvalStatus: 'approved',
    paymentStatus: 'paid',
    cateringStatus: 'requested',
    applicationDate: '2026-10-10T11:30:00Z',
    reviewedBy: 'Warhawks Organizer',
    reviewNotes: 'Hard-hitting all-rounder approved.'
  },
  {
    id: 'reg-05',
    tournamentId: 'tour-ed6-2027',
    fullName: 'Arjun Tendulkar',
    email: 'arjun.t@cricketmumbai.in',
    phone: '+91 98200 99887',
    age: 27,
    city: 'Mumbai',
    primaryRole: 'All-Rounder',
    battingStyle: 'Left-hand bat',
    bowlingStyle: 'Left-arm fast',
    preferredJerseyNo: 24,
    shirtSize: 'L',
    foodPreference: 'Non-Veg',
    hasBreakfast: true,
    hasLunch: true,
    guestCount: 2,
    guestFoodPreference: 'Veg',
    hasGuestBreakfast: true,
    hasGuestLunch: true,
    approvalStatus: 'approved',
    paymentStatus: 'paid',
    cateringStatus: 'confirmed',
    applicationDate: '2026-10-05T14:20:00Z',
    reviewedBy: 'Warhawks Organizer',
    reviewNotes: 'Verified first-class state player. Cleared for Edition 6.'
  },
  {
    id: 'reg-06',
    tournamentId: 'tour-ed6-2027',
    fullName: 'Kabir Khan',
    email: 'kabir.k@mumbaiclub.org',
    phone: '+91 98200 44332',
    age: 22,
    city: 'Mumbai',
    primaryRole: 'Wicket-Keeper',
    battingStyle: 'Right-hand bat',
    bowlingStyle: 'Right-arm medium',
    preferredJerseyNo: 12,
    shirtSize: 'M',
    foodPreference: 'Veg',
    hasBreakfast: true,
    hasLunch: true,
    guestCount: 1,
    guestFoodPreference: 'Veg',
    hasGuestBreakfast: false,
    hasGuestLunch: true,
    approvalStatus: 'pending',
    paymentStatus: 'paid',
    cateringStatus: 'requested',
    applicationDate: '2026-10-15T08:30:00Z'
  }
];

const initialMediaAssets = [
  {
    id: 'med-01',
    tournamentId: 'tour-ed5-2026',
    title: 'Super League Edition 5 Grand Launch Banner',
    category: 'Tournament Banners',
    fileUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
    fileType: 'image/jpeg',
    fileSizeKb: 840,
    tags: ['banner', 'edition5', 'stadium', 'promo'],
    uploadedAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'med-02',
    tournamentId: 'tour-ed5-2026',
    title: 'Apex Titans Official Vector Crest',
    category: 'Team Crests',
    fileUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=80',
    fileType: 'image/png',
    fileSizeKb: 320,
    tags: ['titans', 'crest', 'logo'],
    uploadedAt: '2026-08-02T11:30:00Z'
  },
  {
    id: 'med-03',
    tournamentId: 'tour-ed5-2026',
    title: 'Live Auctioneer Walkthrough Demo Tutorial',
    category: 'Auction Demo Videos',
    fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    fileType: 'video/mp4',
    fileSizeKb: 4500,
    tags: ['auction', 'demo', 'tutorial', 'rules'],
    uploadedAt: '2026-08-10T16:00:00Z'
  }
];

const initialImportJobs = [
  {
    id: 'imp-01',
    tournamentId: 'tour-ed5-2026',
    jobType: 'cricheroes_matches',
    fileName: 'cricheroes_edition5_opening_matches.csv',
    totalRows: 2,
    importedRows: 2,
    skippedRows: 0,
    status: 'completed',
    importSummary: 'Successfully imported Match #1 (AT vs RS) and Match #2 (CB vs HK) with full CricHeroes scorecard mapping.',
    importedBy: 'Super Admin',
    createdAt: '2026-10-12T08:00:00Z'
  },
  {
    id: 'imp-02',
    tournamentId: 'tour-ed5-2026',
    jobType: 'players_roster',
    fileName: 'franchise_registered_squad_mastersheet.xlsx',
    totalRows: 34,
    importedRows: 34,
    skippedRows: 0,
    status: 'completed',
    importSummary: 'Bulk imported 34 player profiles including base prices, dietary preferences, and shirt sizing.',
    importedBy: 'Warhawks Organizer',
    createdAt: '2026-08-20T14:30:00Z'
  }
];

const initialAuditLogs = [
  {
    id: 'log-01',
    tournamentId: 'tour-ed5-2026',
    userName: 'Vikram Sengupta',
    userRole: 'organizer',
    action: 'MATCH_COMPLETED',
    entityType: 'Match',
    entityId: 'match-01',
    details: 'Verified CricHeroes scorecard: Apex Titans won by 6 runs against Royal Strikers.',
    timestamp: '2026-10-10T23:05:00Z'
  },
  {
    id: 'log-02',
    tournamentId: 'tour-ed5-2026',
    userName: 'Vikram Sengupta',
    userRole: 'organizer',
    action: 'AUCTION_BID_CONFIRMED',
    entityType: 'AuctionBid',
    entityId: 'ply-rohit-k',
    details: 'Sold Rohit Khandelwal to Apex Titans for 1,800,000 Points.',
    timestamp: '2026-08-25T15:22:00Z'
  },
  {
    id: 'log-03',
    tournamentId: 'tour-ed5-2026',
    userName: 'Priya Nambiar',
    userRole: 'organizer',
    action: 'EXPENSE_RECORDED',
    entityType: 'Expense',
    entityId: 'exp-03',
    details: 'Approved live broadcast streaming equipment lease of 820,000 INR with StreamPro.',
    timestamp: '2026-10-05T09:35:00Z'
  }
];

const initialUsers = [
  {
    id: 'usr-01',
    name: 'Vikram Sengupta',
    email: 'operations@warhawks.org',
    role: 'organizer',
    avatarUrl: '',
    assignedTournaments: ['*']
  },
  {
    id: 'usr-02',
    name: 'Priya Nambiar',
    email: 'tournaments@warhawks.org',
    role: 'organizer',
    avatarUrl: '',
    assignedTournaments: ['tour-ed5-2026', 'tour-ed6-2027']
  },
  {
    id: 'usr-03',
    name: 'Rohan Sharma',
    email: 'rohan.sharma@crickethq.local',
    role: 'player',
    avatarUrl: '',
    assignedTournaments: ['tour-ed5-2026']
  },
  {
    id: 'usr-04',
    name: 'Mitchell Starc',
    email: 'mitchell.s@crickethq.local',
    role: 'player',
    avatarUrl: '',
    assignedTournaments: ['tour-ed5-2026']
  }
];

const initialSettings = {
  organizerName: DEFAULT_ORGANIZER_NAME,
  organizerRole: 'Official Tournament Organizer & Host',
  organizerBranch: ORGANIZER_DETAILS.branch,
  organizerEmail: ORGANIZER_DETAILS.contactEmail,
  supabaseConnected: true,
  supabaseUrl: 'https://xyzabcdefg.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiY2RlZmciLCJyb2xlIjoiYW5vbiJ9',
  cloudinaryConnected: true,
  cloudinaryCloudName: 'warhawks-cricket-cloud',
  cloudinaryUploadPreset: 'tournament_admin_unsigned',
  cloudinaryApiKey: '894729184719284',
  currencySymbol: '₹',
  pointsUnitName: 'Pts',
  cricheroesIntegrationMode: 'csv_upload'
};

class TournamentDatabase {
  constructor() {
    this.schema = this.loadFromStorage();
    this.initSupabaseSync();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure seamless backward compatibility and Warhawks organizer consistency
        if (parsed.tournaments && Array.isArray(parsed.tournaments)) {
          parsed.tournaments = parsed.tournaments.map(t => ({
            ...t,
            organizer: t.organizer || DEFAULT_ORGANIZER_NAME,
            organizerRole: t.organizerRole || 'Official Tournament Organizer & Host',
            organizerBranch: t.organizerBranch || ORGANIZER_DETAILS.branch
          }));
        }
        if (parsed.settings) {
          parsed.settings.organizerName = parsed.settings.organizerName || DEFAULT_ORGANIZER_NAME;
          parsed.settings.organizerRole = parsed.settings.organizerRole || 'Official Tournament Organizer & Host';
          parsed.settings.organizerBranch = parsed.settings.organizerBranch || ORGANIZER_DETAILS.branch;
        }

        // Two-Role RBAC Migration: Ensure active users are mapped strictly to 'organizer' or 'player'
        if (parsed.users && Array.isArray(parsed.users)) {
          parsed.users = parsed.users.map(u => {
            let role = u.role;
            if (role === 'super_admin' || role === 'tournament_admin' || role === 'organizer') {
              role = 'organizer';
            } else {
              role = 'player';
            }
            return {
              ...u,
              role
            };
          });
        } else {
          parsed.users = initialUsers;
        }

        if (parsed.auditLogs && Array.isArray(parsed.auditLogs)) {
          parsed.auditLogs = parsed.auditLogs.map(log => ({
            ...log,
            userRole: (log.userRole === 'super_admin' || log.userRole === 'tournament_admin' || log.userRole === 'organizer') ? 'organizer' : 'player'
          }));
        }

        // Dietary & Guest Migration: strictly 'Veg' and 'Non-Veg' (remove Jain, Vegan, Halal)
        if (parsed.players && Array.isArray(parsed.players)) {
          parsed.players = parsed.players.map(p => {
            let pref = p.foodPreference;
            if (pref === 'Jain' || pref === 'Vegan') pref = 'Veg';
            else if (pref === 'Halal') pref = 'Non-Veg';
            else if (pref !== 'Veg' && pref !== 'Non-Veg') pref = 'Veg';
            return { ...p, foodPreference: pref };
          });
        }

        if (parsed.registrations && Array.isArray(parsed.registrations)) {
          parsed.registrations = parsed.registrations.map(r => {
            let pref = r.foodPreference;
            if (pref === 'Jain' || pref === 'Vegan') pref = 'Veg';
            else if (pref === 'Halal') pref = 'Non-Veg';
            else if (pref !== 'Veg' && pref !== 'Non-Veg') pref = 'Veg';

            let guestPref = r.guestFoodPreference;
            if (guestPref === 'Jain' || guestPref === 'Vegan') guestPref = 'Veg';
            else if (guestPref === 'Halal') guestPref = 'Non-Veg';
            else if (guestPref !== 'Veg' && guestPref !== 'Non-Veg') guestPref = 'Veg';

            const guestCount = Math.max(0, parseInt(r.guestCount ?? r.guestNumber, 10) || 0);

            return {
              ...r,
              foodPreference: pref,
              hasBreakfast: r.hasBreakfast ?? true,
              hasLunch: r.hasLunch ?? true,
              guestCount,
              guestFoodPreference: guestPref,
              hasGuestBreakfast: r.hasGuestBreakfast ?? (guestCount > 0),
              hasGuestLunch: r.hasGuestLunch ?? (guestCount > 0),
              cateringStatus: r.cateringStatus || 'confirmed',
              reviewedBy: (r.reviewedBy === 'Super Admin' || r.reviewedBy === 'Tournament Admin') ? 'Warhawks Organizer' : r.reviewedBy
            };
          });

          // Ensure default registrations for current edition exist if missing
          const hasEd5Regs = parsed.registrations.some(r => r.tournamentId === 'tour-ed5-2026');
          if (!hasEd5Regs) {
            const ed5Seeds = initialRegistrations.filter(r => r.tournamentId === 'tour-ed5-2026');
            parsed.registrations = [...parsed.registrations, ...ed5Seeds];
          }
        } else {
          parsed.registrations = initialRegistrations;
        }

        if (parsed.sponsors && Array.isArray(parsed.sponsors)) {
          parsed.sponsors = parsed.sponsors.map((s, idx) => ({
            ...s,
            contactNumber: s.contactNumber || `+91 9820${idx} 5544${idx}`
          }));
        }

        return parsed;
      }
    } catch {
      // ignore
    }
    return this.getInitialSchema();
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.schema));
    } catch {
      // storage quota or disabled
    }
  }

  // Supabase Synchronization & Hybrid Storage Engine
  async initSupabaseSync() {
    if (!isSupabaseConfigured()) return;
    try {
      const remoteTournaments = await supabaseDb.getTournaments();
      if (remoteTournaments && remoteTournaments.length > 0) {
        const existingIds = new Set(remoteTournaments.map(t => t.id));
        const localOnly = (this.schema.tournaments || []).filter(t => !existingIds.has(t.id));
        this.schema.tournaments = [...remoteTournaments, ...localOnly];
        this.saveToStorage();
      }
    } catch (err) {
      console.info('Supabase background sync notice:', err.message);
    }
  }

  async syncTournamentData(tournamentId) {
    if (!isSupabaseConfigured() || !tournamentId) return;
    try {
      const [remoteTournaments, remoteSponsors, remoteRegistrations] = await Promise.all([
        supabaseDb.getTournaments().catch(() => null),
        supabaseDb.getSponsors(tournamentId).catch(() => null),
        supabaseDb.getRegistrations(tournamentId).catch(() => null)
      ]);

      if (remoteTournaments && remoteTournaments.length > 0) {
        this.schema.tournaments = remoteTournaments;
      }
      if (remoteSponsors && remoteSponsors.length > 0) {
        const others = this.schema.sponsors.filter(s => s.tournamentId !== tournamentId);
        this.schema.sponsors = [...others, ...remoteSponsors];
      }
      if (remoteRegistrations && remoteRegistrations.length > 0) {
        const others = this.schema.registrations.filter(r => r.tournamentId !== tournamentId);
        this.schema.registrations = [...others, ...remoteRegistrations];
      }
      this.saveToStorage();
    } catch (err) {
      console.warn('Supabase sync error:', err.message);
    }
  }

  async seedSupabaseDatabase() {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase project URL and Anon Key must be configured first in Project Settings.');
    }
    return await supabaseDb.seedSupabaseFromLocal(this.schema);
  }

  isSupabaseActive() {
    return isSupabaseConfigured();
  }

  getInitialSchema() {
    return {
      tournaments: initialTournaments,
      teams: initialTeams,
      players: initialPlayers,
      matches: initialMatches,
      auctionConfigs: {
        'tour-ed5-2026': {
          tournamentId: 'tour-ed5-2026',
          baseBudget: 10000000,
          bidIncrements: [
            { upTo: 1000000, increment: 50000 },
            { upTo: 5000000, increment: 100000 },
            { upTo: 10000000, increment: 250000 }
          ],
          isAuctionLive: false,
          activePlayerId: 'ply-mitchell-s',
          currentHighestBid: 500000,
          currentLeadingTeamId: undefined,
          auctionDemoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
        }
      },
      auctionBids: [
        {
          id: 'bid-01',
          tournamentId: 'tour-ed5-2026',
          playerId: 'ply-rohit-k',
          teamId: 'team-titans',
          amount: 1800000,
          timestamp: '2026-08-25T15:20:00Z'
        },
        {
          id: 'bid-02',
          tournamentId: 'tour-ed5-2026',
          playerId: 'ply-sam-curran',
          teamId: 'team-titans',
          amount: 2200000,
          timestamp: '2026-08-25T15:45:00Z'
        },
        {
          id: 'bid-03',
          tournamentId: 'tour-ed5-2026',
          playerId: 'ply-virat-s',
          teamId: 'team-strikers',
          amount: 2450000,
          timestamp: '2026-08-25T16:10:00Z'
        }
      ],
      sponsors: initialSponsors,
      expenses: initialExpenses,
      foodOrders: initialFoodOrders,
      rules: initialRules,
      registrations: initialRegistrations,
      mediaAssets: initialMediaAssets,
      importJobs: initialImportJobs,
      auditLogs: initialAuditLogs,
      users: initialUsers,
      settings: initialSettings
    };
  }

  resetToDefault() {
    this.schema = this.getInitialSchema();
    this.saveToStorage();
  }

  // Tournaments
  getTournaments() {
    return [...this.schema.tournaments];
  }

  getTournament(id) {
    return this.schema.tournaments.find(t => t.id === id);
  }

  getOrganizers() {
    return [
      {
        id: 'warhawks',
        name: DEFAULT_ORGANIZER_NAME,
        role: 'Official Tournament Organizer & Host',
        branch: ORGANIZER_DETAILS.branch,
        contactEmail: ORGANIZER_DETAILS.contactEmail,
        isDefault: true
      }
    ];
  }

  createTournament(data) {
    const newTournament = {
      organizer: data.organizer || DEFAULT_ORGANIZER_NAME,
      organizerRole: data.organizerRole || 'Official Tournament Organizer & Host',
      organizerBranch: data.organizerBranch || ORGANIZER_DETAILS.branch,
      ...data,
      id: `tour-ed${data.editionNumber}-${data.year}-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.schema.tournaments.unshift(newTournament);
    this.saveToStorage();
    this.logAction(newTournament.id, 'Warhawks Organizer', 'organizer', 'CREATE_TOURNAMENT', 'Tournament', newTournament.id, `Created edition: ${newTournament.name} (Organizer: ${newTournament.organizer})`);

    if (isSupabaseConfigured()) {
      supabaseDb.createTournament(newTournament).catch(err => console.warn('Supabase createTournament async warning:', err.message));
    }

    return newTournament;
  }

  updateTournament(id, updates) {
    const idx = this.schema.tournaments.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Tournament not found');
    this.schema.tournaments[idx] = {
      ...this.schema.tournaments[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveToStorage();
    this.logAction(id, 'Warhawks Organizer', 'organizer', 'UPDATE_TOURNAMENT', 'Tournament', id, `Updated tournament details for ${this.schema.tournaments[idx].name}`);

    if (isSupabaseConfigured()) {
      supabaseDb.updateTournament(id, updates).catch(err => console.warn('Supabase updateTournament async warning:', err.message));
    }

    return this.schema.tournaments[idx];
  }

  // Teams
  getTeams(tournamentId) {
    return this.schema.teams.filter(t => t.tournamentId === tournamentId);
  }

  getTeam(id) {
    return this.schema.teams.find(t => t.id === id);
  }

  createTeam(data) {
    const newTeam = {
      ...data,
      id: `team-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString()
    };
    this.schema.teams.push(newTeam);
    this.saveToStorage();
    this.logAction(data.tournamentId, 'Warhawks Organizer', 'organizer', 'CREATE_TEAM', 'Team', newTeam.id, `Created franchise team: ${newTeam.name} (${newTeam.shortCode})`);
    return newTeam;
  }

  updateTeam(id, updates) {
    const idx = this.schema.teams.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Team not found');
    this.schema.teams[idx] = { ...this.schema.teams[idx], ...updates };
    this.saveToStorage();
    return this.schema.teams[idx];
  }

  deleteTeam(id) {
    const team = this.schema.teams.find(t => t.id === id);
    if (!team) return;
    this.schema.teams = this.schema.teams.filter(t => t.id !== id);
    this.schema.players = this.schema.players.map(p => p.teamId === id ? { ...p, teamId: undefined, auctionStatus: 'available' } : p);
    this.saveToStorage();
    this.logAction(team.tournamentId, 'Warhawks Organizer', 'organizer', 'DELETE_TEAM', 'Team', id, `Deleted team ${team.name}`);
  }

  // Players
  getPlayers(tournamentId, teamId) {
    return this.schema.players.filter(p => {
      const matchTournament = p.tournamentId === tournamentId;
      if (!matchTournament) return false;
      if (teamId) return p.teamId === teamId;
      return true;
    });
  }

  createPlayer(data) {
    const newPlayer = {
      ...data,
      id: `ply-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString()
    };
    this.schema.players.push(newPlayer);
    this.syncTeamSquadCount(data.tournamentId);
    this.saveToStorage();
    this.logAction(data.tournamentId, 'Warhawks Organizer', 'organizer', 'CREATE_PLAYER', 'Player', newPlayer.id, `Added player profile: ${newPlayer.name} (${newPlayer.role})`);
    return newPlayer;
  }

  updatePlayer(id, updates) {
    const idx = this.schema.players.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Player not found');
    const existing = this.schema.players[idx];
    this.schema.players[idx] = { ...existing, ...updates };
    this.syncTeamSquadCount(existing.tournamentId);
    this.saveToStorage();
    return this.schema.players[idx];
  }

  deletePlayer(id) {
    const player = this.schema.players.find(p => p.id === id);
    if (!player) return;
    this.schema.players = this.schema.players.filter(p => p.id !== id);
    this.syncTeamSquadCount(player.tournamentId);
    this.saveToStorage();
    this.logAction(player.tournamentId, 'Warhawks Organizer', 'organizer', 'DELETE_PLAYER', 'Player', id, `Deleted player: ${player.name}`);
  }

  syncTeamSquadCount(tournamentId) {
    const teams = this.schema.teams.filter(t => t.tournamentId === tournamentId);
    for (const team of teams) {
      const assigned = this.schema.players.filter(p => p.teamId === team.id);
      team.totalPlayersAssigned = assigned.length;
      const spent = assigned.reduce((acc, curr) => acc + (curr.soldPrice || 0), 0);
      team.budgetSpent = spent;
      team.budgetRemaining = Math.max(0, team.budgetTotal - spent);
    }
  }

  // Matches
  getMatches(tournamentId) {
    return this.schema.matches
      .filter(m => m.tournamentId === tournamentId)
      .sort((a, b) => a.matchNumber - b.matchNumber);
  }

  createMatch(data) {
    const newMatch = {
      ...data,
      id: `match-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString()
    };
    this.schema.matches.push(newMatch);
    this.saveToStorage();
    this.logAction(data.tournamentId, 'Warhawks Organizer', 'organizer', 'CREATE_MATCH', 'Match', newMatch.id, `Scheduled Match #${newMatch.matchNumber}`);
    return newMatch;
  }

  updateMatch(id, updates) {
    const idx = this.schema.matches.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Match not found');
    this.schema.matches[idx] = { ...this.schema.matches[idx], ...updates };
    this.saveToStorage();
    this.logAction(this.schema.matches[idx].tournamentId, 'Warhawks Organizer', 'organizer', 'UPDATE_MATCH', 'Match', id, `Updated match scorecard/result for Match #${this.schema.matches[idx].matchNumber}`);
    return this.schema.matches[idx];
  }

  deleteMatch(id) {
    const match = this.schema.matches.find(m => m.id === id);
    if (!match) return;
    this.schema.matches = this.schema.matches.filter(m => m.id !== id);
    this.saveToStorage();
  }

  // Dynamic Standings
  getStandings(tournamentId) {
    const teams = this.getTeams(tournamentId);
    const matches = this.getMatches(tournamentId).filter(m => m.status === 'completed');

    const standingsMap = {};

    teams.forEach(team => {
      standingsMap[team.id] = {
        teamId: team.id,
        tournamentId,
        matchesPlayed: 0,
        won: 0,
        lost: 0,
        tied: 0,
        noResult: 0,
        points: 0,
        runsScored: 0,
        oversFaced: 0,
        runsConceded: 0,
        oversBowled: 0,
        netRunRate: 0
      };
    });

    matches.forEach(m => {
      const standingA = standingsMap[m.teamAId];
      const standingB = standingsMap[m.teamBId];
      if (!standingA || !standingB) return;

      standingA.matchesPlayed += 1;
      standingB.matchesPlayed += 1;

      const runsA = m.teamAScore ? parseInt(m.teamAScore.split('/')[0], 10) || 0 : 0;
      const oversA = m.teamAOvers || 20.0;
      const runsB = m.teamBScore ? parseInt(m.teamBScore.split('/')[0], 10) || 0 : 0;
      const oversB = m.teamBOvers || 20.0;

      standingA.runsScored += runsA;
      standingA.oversFaced += oversA;
      standingA.runsConceded += runsB;
      standingA.oversBowled += oversB;

      standingB.runsScored += runsB;
      standingB.oversFaced += oversB;
      standingB.runsConceded += runsA;
      standingB.oversBowled += oversA;

      if (m.winnerId === m.teamAId) {
        standingA.won += 1;
        standingA.points += 2;
        standingB.lost += 1;
      } else if (m.winnerId === m.teamBId) {
        standingB.won += 1;
        standingB.points += 2;
        standingA.lost += 1;
      } else {
        standingA.tied += 1;
        standingB.tied += 1;
        standingA.points += 1;
        standingB.points += 1;
      }
    });

    return Object.values(standingsMap).map(s => {
      const forRate = s.oversFaced > 0 ? s.runsScored / s.oversFaced : 0;
      const againstRate = s.oversBowled > 0 ? s.runsConceded / s.oversBowled : 0;
      const nrr = Number((forRate - againstRate).toFixed(3));
      return {
        ...s,
        netRunRate: isNaN(nrr) ? 0 : nrr
      };
    }).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.netRunRate - a.netRunRate;
    });
  }

  // Auction System
  getAuctionConfig(tournamentId) {
    if (!this.schema.auctionConfigs[tournamentId]) {
      this.schema.auctionConfigs[tournamentId] = {
        tournamentId,
        baseBudget: 10000000,
        bidIncrements: [
          { upTo: 1000000, increment: 50000 },
          { upTo: 5000000, increment: 100000 },
          { upTo: 10000000, increment: 250000 }
        ],
        isAuctionLive: false,
        currentHighestBid: 500000,
        auctionDemoVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
      };
      this.saveToStorage();
    }
    return this.schema.auctionConfigs[tournamentId];
  }

  updateAuctionConfig(tournamentId, updates) {
    const current = this.getAuctionConfig(tournamentId);
    this.schema.auctionConfigs[tournamentId] = { ...current, ...updates };
    this.saveToStorage();
    return this.schema.auctionConfigs[tournamentId];
  }

  placeAuctionBid(tournamentId, playerId, teamId, amount) {
    const team = this.schema.teams.find(t => t.id === teamId);
    const player = this.schema.players.find(p => p.id === playerId);
    if (!team) return { success: false, message: 'Invalid team' };
    if (!player) return { success: false, message: 'Invalid player' };

    if (amount > team.budgetRemaining) {
      return { success: false, message: `Budget Exceeded! ${team.name} only has ${team.budgetRemaining.toLocaleString()} Pts remaining.` };
    }

    const newBid = {
      id: `bid-${Date.now().toString(36)}`,
      tournamentId,
      playerId,
      teamId,
      amount,
      timestamp: new Date().toISOString()
    };
    this.schema.auctionBids.unshift(newBid);

    const config = this.getAuctionConfig(tournamentId);
    config.currentHighestBid = amount;
    config.currentLeadingTeamId = teamId;
    config.activePlayerId = playerId;
    this.schema.auctionConfigs[tournamentId] = config;

    this.saveToStorage();
    this.logAction(tournamentId, 'Warhawks Auctioneer', 'organizer', 'AUCTION_BID', 'Player', playerId, `${team.name} raised bid to ${amount.toLocaleString()} Pts on ${player.name}`);
    return { success: true, message: `Bid of ${amount.toLocaleString()} Pts registered for ${team.name}!` };
  }

  finalizePlayerSale(tournamentId, playerId, teamId, finalAmount) {
    const player = this.schema.players.find(p => p.id === playerId);
    const team = this.schema.teams.find(t => t.id === teamId);
    if (!player || !team) return;

    player.teamId = teamId;
    player.soldPrice = finalAmount;
    player.auctionStatus = 'sold';

    this.syncTeamSquadCount(tournamentId);
    const config = this.getAuctionConfig(tournamentId);
    config.activePlayerId = undefined;
    config.currentLeadingTeamId = undefined;
    config.currentHighestBid = 0;

    this.saveToStorage();
    this.logAction(tournamentId, 'Warhawks Organizer', 'organizer', 'PLAYER_SOLD', 'Player', playerId, `SOLD: ${player.name} to ${team.name} for ${finalAmount.toLocaleString()} Pts`);
  }

  markPlayerUnsold(tournamentId, playerId) {
    const player = this.schema.players.find(p => p.id === playerId);
    if (!player) return;
    player.auctionStatus = 'unsold';
    player.teamId = undefined;
    const config = this.getAuctionConfig(tournamentId);
    config.activePlayerId = undefined;
    config.currentLeadingTeamId = undefined;
    config.currentHighestBid = 0;
    this.saveToStorage();
    this.logAction(tournamentId, 'Warhawks Organizer', 'organizer', 'PLAYER_UNSOLD', 'Player', playerId, `${player.name} passed unsold.`);
  }

  getAuctionBids(tournamentId) {
    return this.schema.auctionBids.filter(b => b.tournamentId === tournamentId);
  }

  // Sponsors
  getSponsors(tournamentId) {
    return this.schema.sponsors.filter(s => s.tournamentId === tournamentId);
  }

  createSponsor(data) {
    const newSponsor = {
      ...data,
      id: `sp-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString()
    };
    this.schema.sponsors.push(newSponsor);
    this.saveToStorage();
    this.logAction(data.tournamentId, 'Warhawks Organizer', 'organizer', 'CREATE_SPONSOR', 'Sponsor', newSponsor.id, `Added sponsor: ${newSponsor.name} (${newSponsor.tier || 'Sponsor'})`);

    if (isSupabaseConfigured()) {
      supabaseDb.createSponsor(newSponsor).catch(err => console.warn('Supabase createSponsor async warning:', err.message));
    }

    return newSponsor;
  }

  updateSponsor(id, updates) {
    const idx = this.schema.sponsors.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Sponsor not found');
    this.schema.sponsors[idx] = { ...this.schema.sponsors[idx], ...updates };
    this.saveToStorage();

    if (isSupabaseConfigured()) {
      supabaseDb.updateSponsor(id, updates).catch(err => console.warn('Supabase updateSponsor async warning:', err.message));
    }

    return this.schema.sponsors[idx];
  }

  deleteSponsor(id) {
    const sp = this.schema.sponsors.find(s => s.id === id);
    if (!sp) return;
    this.schema.sponsors = this.schema.sponsors.filter(s => s.id !== id);
    this.saveToStorage();

    if (isSupabaseConfigured()) {
      supabaseDb.deleteSponsor(id).catch(err => console.warn('Supabase deleteSponsor async warning:', err.message));
    }
  }

  // Expenses
  getExpenses(tournamentId) {
    return this.schema.expenses.filter(e => e.tournamentId === tournamentId);
  }

  createExpense(data) {
    const newExpense = {
      ...data,
      id: `exp-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString()
    };
    this.schema.expenses.unshift(newExpense);
    this.saveToStorage();
    this.logAction(data.tournamentId, 'Warhawks Organizer', 'organizer', 'CREATE_EXPENSE', 'Expense', newExpense.id, `Recorded expense of ₹${newExpense.amount.toLocaleString()} for ${newExpense.title}`);
    return newExpense;
  }

  deleteExpense(id) {
    const exp = this.schema.expenses.find(e => e.id === id);
    if (!exp) return;
    this.schema.expenses = this.schema.expenses.filter(e => e.id !== id);
    this.saveToStorage();
  }

  // Food Orders
  getFoodOrders(tournamentId) {
    return this.schema.foodOrders.filter(f => f.tournamentId === tournamentId);
  }

  createFoodOrder(data) {
    const newOrder = {
      ...data,
      id: `fo-${Date.now().toString(36)}`,
      updatedAt: new Date().toISOString()
    };
    this.schema.foodOrders.unshift(newOrder);
    this.saveToStorage();
    return newOrder;
  }

  updateFoodOrderStatus(id, status) {
    const order = this.schema.foodOrders.find(f => f.id === id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      this.saveToStorage();
    }
  }

  // Rules & Demo Videos
  getRules(tournamentId) {
    return this.schema.rules.filter(r => r.tournamentId === tournamentId);
  }

  createRule(data) {
    const newRule = {
      ...data,
      id: `rule-${Date.now().toString(36)}`,
      updatedAt: new Date().toISOString()
    };
    this.schema.rules.push(newRule);
    this.saveToStorage();
    return newRule;
  }

  updateRule(id, updates) {
    const idx = this.schema.rules.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Rule not found');
    this.schema.rules[idx] = { ...this.schema.rules[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveToStorage();
    return this.schema.rules[idx];
  }

  deleteRule(id) {
    this.schema.rules = this.schema.rules.filter(r => r.id !== id);
    this.saveToStorage();
  }

  // Registration Queue & Self-Service Portal
  getRegistrations(tournamentId) {
    return this.schema.registrations.filter(r => r.tournamentId === tournamentId);
  }

  createRegistration(data) {
    const tournament = this.getTournament(data.tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    if (!tournament.registrationOpen) {
      throw new Error('Tournament registration portal is closed for this edition.');
    }

    const existing = this.schema.registrations.find(
      r => r.tournamentId === data.tournamentId && r.email?.toLowerCase() === data.email?.toLowerCase()
    );
    if (existing) {
      throw new Error('A registration application with this email already exists for this edition.');
    }

    const guestCount = Math.max(0, parseInt(data.guestCount ?? data.guestNumber, 10) || 0);
    const newReg = {
      id: `reg-${Date.now().toString(36)}`,
      tournamentId: data.tournamentId,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || '+91 98000 00000',
      age: parseInt(data.age, 10) || 24,
      city: data.city || tournament.city,
      primaryRole: data.primaryRole || 'All-Rounder',
      battingStyle: data.battingStyle || 'Right-hand bat',
      bowlingStyle: data.bowlingStyle || 'Right-arm medium',
      preferredJerseyNo: parseInt(data.preferredJerseyNo, 10) || 18,
      shirtSize: data.shirtSize || 'L',
      foodPreference: data.foodPreference === 'Non-Veg' ? 'Non-Veg' : 'Veg',
      hasBreakfast: Boolean(data.hasBreakfast),
      hasLunch: Boolean(data.hasLunch),
      guestCount,
      guestFoodPreference: data.guestFoodPreference === 'Non-Veg' ? 'Non-Veg' : 'Veg',
      hasGuestBreakfast: guestCount > 0 ? Boolean(data.hasGuestBreakfast) : false,
      hasGuestLunch: guestCount > 0 ? Boolean(data.hasGuestLunch) : false,
      cateringStatus: 'requested',
      approvalStatus: 'pending',
      paymentStatus: 'pending',
      applicationDate: new Date().toISOString(),
      reviewNotes: 'Application pending review by Warhawks Tournament Operations'
    };

    this.schema.registrations.unshift(newReg);
    this.saveToStorage();
    this.logAction(
      data.tournamentId,
      data.fullName || 'Player Applicant',
      'player',
      'PLAYER_REGISTERED',
      'Registration',
      newReg.id,
      `Player registration submitted by ${newReg.fullName} (${newReg.primaryRole})`
    );
    return newReg;
  }

  cancelRegistration(id, userEmail) {
    const reg = this.schema.registrations.find(r => r.id === id);
    if (!reg) throw new Error('Registration record not found');
    if (userEmail && reg.email?.toLowerCase() !== userEmail.toLowerCase()) {
      throw new Error('Unauthorized: You can only cancel your own registration application.');
    }
    if (reg.approvalStatus !== 'pending') {
      throw new Error('Cannot cancel an application that has already been approved or processed.');
    }
    this.schema.registrations = this.schema.registrations.filter(r => r.id !== id);
    this.saveToStorage();
    this.logAction(
      reg.tournamentId,
      reg.fullName,
      'player',
      'REGISTRATION_CANCELLED',
      'Registration',
      id,
      `Registration application cancelled by player ${reg.fullName}`
    );
    return { success: true, message: 'Application cancelled successfully.' };
  }

  updateRegistrationStatus(id, approvalStatus, reviewNotes) {
    const reg = this.schema.registrations.find(r => r.id === id);
    if (!reg) return;
    reg.approvalStatus = approvalStatus;
    if (reviewNotes) reg.reviewNotes = reviewNotes;
    reg.reviewedBy = 'Warhawks Organizer';

    if (approvalStatus === 'approved') {
      const exists = this.schema.players.find(p => p.email === reg.email && p.tournamentId === reg.tournamentId);
      if (!exists) {
        this.createPlayer({
          tournamentId: reg.tournamentId,
          name: reg.fullName,
          jerseyNumber: reg.preferredJerseyNo,
          role: reg.primaryRole,
          battingStyle: reg.battingStyle,
          bowlingStyle: reg.bowlingStyle,
          basePrice: 300000,
          auctionStatus: 'available',
          isCaptain: false,
          isOverseas: false,
          email: reg.email,
          phone: reg.phone,
          city: reg.city,
          shirtSize: reg.shirtSize,
          foodPreference: reg.foodPreference,
          registrationStatus: 'approved',
          paymentStatus: reg.paymentStatus,
          matchesPlayed: 0,
          runsScored: 0,
          highestScore: 0,
          wicketsTaken: 0,
          bestBowling: '-',
          strikeRate: 0,
          economyRate: 0
        });
      }
    }
    this.saveToStorage();
    this.logAction(reg.tournamentId, 'Warhawks Organizer', 'organizer', 'REGISTRATION_STATUS_UPDATE', 'Registration', id, `Updated ${reg.fullName} application to ${approvalStatus}`);
  }

  updateRegistration(id, updates) {
    const idx = this.schema.registrations.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Registration record not found');
    this.schema.registrations[idx] = { ...this.schema.registrations[idx], ...updates };
    this.saveToStorage();
    return this.schema.registrations[idx];
  }

  updateRegistrationCateringStatus(id, cateringStatus) {
    return this.updateRegistration(id, { cateringStatus });
  }

  // Media Library
  getMediaAssets(tournamentId) {
    return this.schema.mediaAssets.filter(m => m.tournamentId === tournamentId);
  }

  addMediaAsset(data) {
    const asset = {
      ...data,
      id: `med-${Date.now().toString(36)}`,
      uploadedAt: new Date().toISOString()
    };
    this.schema.mediaAssets.unshift(asset);
    this.saveToStorage();
    this.logAction(data.tournamentId, 'Warhawks Organizer', 'organizer', 'UPLOAD_MEDIA', 'MediaAsset', asset.id, `Uploaded ${asset.title} (${asset.category})`);
    return asset;
  }

  deleteMediaAsset(id) {
    this.schema.mediaAssets = this.schema.mediaAssets.filter(m => m.id !== id);
    this.saveToStorage();
  }

  // Import Jobs
  getImportJobs(tournamentId) {
    return this.schema.importJobs.filter(j => j.tournamentId === tournamentId);
  }

  recordImportJob(job) {
    const newJob = {
      ...job,
      id: `imp-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString()
    };
    this.schema.importJobs.unshift(newJob);
    this.saveToStorage();
    this.logAction(job.tournamentId, job.importedBy || 'Warhawks Organizer', 'organizer', 'IMPORT_DATA', 'ImportJob', newJob.id, `Imported ${job.importedRows} records from ${job.fileName}`);
    return newJob;
  }

  // Audit Logs
  getAuditLogs(tournamentId) {
    return this.schema.auditLogs.filter(a => a.tournamentId === tournamentId);
  }

  logAction(tournamentId, userName, userRole, action, entityType, entityId, details) {
    const log = {
      id: `log-${Date.now().toString(36)}`,
      tournamentId,
      userName,
      userRole,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString()
    };
    this.schema.auditLogs.unshift(log);
    if (this.schema.auditLogs.length > 200) {
      this.schema.auditLogs = this.schema.auditLogs.slice(0, 200);
    }
  }

  // Centralized Two-Role RBAC Authorization Guard
  assertOrganizer(userRole) {
    if (userRole && userRole !== 'organizer') {
      throw new Error('Access Denied: Operational action restricted to Warhawks Organizer role.');
    }
  }

  // Register New User - strictly defaults to 'player' role
  registerUser(userData) {
    const newUser = {
      id: `usr-${Date.now().toString(36)}`,
      name: userData.name || 'Tournament Athlete',
      email: userData.email,
      role: 'player', // Ordinary users are strictly assigned 'player' by default
      avatarUrl: userData.avatarUrl || '',
      assignedTournaments: userData.tournamentId ? [userData.tournamentId] : []
    };
    this.schema.users.push(newUser);
    this.saveToStorage();
    return newUser;
  }

  getUsers() {
    return this.schema.users;
  }

  getSettings() {
    return this.schema.settings;
  }

  updateSettings(updates) {
    this.schema.settings = { ...this.schema.settings, ...updates };
    this.saveToStorage();
    return this.schema.settings;
  }
}

export const db = new TournamentDatabase();
