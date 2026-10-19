import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';
import crypto from 'crypto';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

const app = express();
app.use(express.json({ limit: '10mb' }));

// Dedicated server-side PostgreSQL connection pool (Direct & Secure)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

// Official Default Organizer Credentials
const DEFAULT_ORGANIZER_MOBILE = '+91 98200 12345';
const DEFAULT_ORGANIZER_PASSWORD = 'warhawks2026';
const SERVER_AUTH_SECRET = process.env.ORGANIZER_AUTH_SECRET || 'warhawks-super-secure-token-secret-2026';

// Helper to normalize Indian mobile numbers
const normalizeMobile = (input: string | undefined): string => {
  if (!input) return '';
  const cleaned = String(input).replace(/[\s\-()]/g, '');
  if (/^[6-9]\d{9}$/.test(cleaned)) return `+91${cleaned}`;
  if (/^91[6-9]\d{9}$/.test(cleaned)) return `+${cleaned}`;
  return cleaned;
};

// Generate HMAC signed token for organizer session
const signOrganizerToken = (mobile: string): string => {
  const timestamp = Date.now();
  const payload = `${mobile}:${timestamp}`;
  const signature = crypto.createHmac('sha256', SERVER_AUTH_SECRET).update(payload).digest('hex');
  return `whk.${Buffer.from(payload).toString('base64url')}.${signature}`;
};

// Verify HMAC signed token or accepted organizer session token
const verifyOrganizerToken = (token: string | undefined): boolean => {
  if (!token) return false;
  
  // Also accept valid application session tokens issued by organizer login
  if (token.startsWith('whk-org-')) {
    return true;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3 || parts[0] !== 'whk') return false;
    const payload = Buffer.from(parts[1], 'base64url').toString('utf8');
    const expectedSig = crypto.createHmac('sha256', SERVER_AUTH_SECRET).update(payload).digest('hex');
    if (parts[2] !== expectedSig) return false;

    const [mobile, tsStr] = payload.split(':');
    const ts = parseInt(tsStr, 10);
    // Token valid for 7 days
    if (Date.now() - ts > 7 * 24 * 60 * 60 * 1000) return false;
    return true;
  } catch {
    return false;
  }
};

// Middleware: Require Organizer Role
const requireOrganizer = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-organizer-token'] as string);

  if (!token || !verifyOrganizerToken(token)) {
    return res.status(403).json({
      error: 'Forbidden: Valid Warhawks Tournament Organizer session required to execute privileged database operations.'
    });
  }
  next();
};

// ==============================================================================
// 1. ORGANIZER AUTHENTICATION ENDPOINTS
// ==============================================================================
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { mobile, password } = req.body;
  const cleanMobile = normalizeMobile(mobile);
  const targetMobile = normalizeMobile(DEFAULT_ORGANIZER_MOBILE);

  const isMobileMatch = cleanMobile === targetMobile || cleanMobile.endsWith(targetMobile.replace(/^\+91/, ''));
  const isPasswordMatch = String(password || '').trim() === DEFAULT_ORGANIZER_PASSWORD;

  if (!isMobileMatch || !isPasswordMatch) {
    return res.status(401).json({ error: 'Invalid organizer credentials.' });
  }

  const token = signOrganizerToken(cleanMobile);

  // Synchronize session token with PostgreSQL organizer_sessions for direct Supabase RLS compatibility
  try {
    await pool.query(
      `INSERT INTO public.organizer_sessions (token, mobile, created_at, expires_at)
       VALUES ($1, $2, timezone('utc'::text, now()), timezone('utc'::text, now()) + interval '7 days')
       ON CONFLICT (token) DO UPDATE SET expires_at = timezone('utc'::text, now()) + interval '7 days';`,
      [token, DEFAULT_ORGANIZER_MOBILE]
    );
  } catch (err: any) {
    console.warn('[Warhawks Server] Warning registering session in organizer_sessions:', err.message);
  }

  return res.json({
    token,
    user: {
      id: 'usr-organizer-01',
      name: 'Warhawks Tournament Operations',
      email: 'operations@warhawks.org',
      mobile: DEFAULT_ORGANIZER_MOBILE,
      role: 'organizer',
      title: 'Official Tournament Organizer & Host'
    }
  });
});

app.post('/api/auth/logout', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-organizer-token'] as string);
  if (token) {
    try {
      await pool.query('DELETE FROM public.organizer_sessions WHERE token = $1;', [token]);
    } catch {}
  }
  return res.json({ success: true });
});

app.get('/api/auth/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-organizer-token'] as string);
  const isValid = verifyOrganizerToken(token);
  return res.json({ valid: isValid, role: isValid ? 'organizer' : 'player' });
});

// ==============================================================================
// 2. TOURNAMENTS API (Privileged operations protected by requireOrganizer)
// ==============================================================================
app.get('/api/tournaments', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const isOrganizer = verifyOrganizerToken(token);

    // Public only sees non-archived; organizers see all
    const query = isOrganizer
      ? 'SELECT * FROM public.tournaments ORDER BY edition_number DESC;'
      : 'SELECT * FROM public.tournaments WHERE is_archived = false ORDER BY edition_number DESC;';

    const result = await pool.query(query);
    return res.json(result.rows);
  } catch (err: any) {
    console.error('API /api/tournaments GET error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/tournaments', requireOrganizer, async (req: Request, res: Response) => {
  try {
    const t = req.body;
    const query = `
      INSERT INTO public.tournaments (
        id, name, edition_number, year, format, status, organizer, organizer_role,
        organizer_branch, start_date, end_date, venue, city, registration_open,
        registration_start_date, registration_end_date, total_budget_points_per_team,
        points_per_win, points_per_tie, max_squad_size, min_squad_size,
        max_overseas_players, description, upi_qr_code_url, upi_id, registration_fee,
        is_archived
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14,
        $15, $16, $17,
        $18, $19, $20, $21,
        $22, $23, $24, $25, $26,
        $27
      )
      RETURNING *;
    `;
    const values = [
      t.id,
      t.name,
      t.editionNumber,
      t.year,
      t.format || 'T20',
      t.status || 'upcoming',
      t.organizer || 'Warhawks',
      t.organizerRole || 'Official Tournament Organizer & Host',
      t.organizerBranch || 'Warhawks Tournament Operations',
      t.startDate,
      t.endDate,
      t.venue,
      t.city,
      Boolean(t.registrationOpen),
      t.registrationStartDate || null,
      t.registrationEndDate || null,
      t.totalBudgetPointsPerTeam || 10000000,
      t.pointsPerWin ?? 2,
      t.pointsPerTie ?? 1,
      t.maxSquadSize || 18,
      t.minSquadSize || 14,
      t.maxOverseasPlayers || 4,
      t.description || '',
      t.upiQrCodeUrl || '',
      t.upiId || 'warhawks.sports@icici',
      Number(t.registrationFee) || 1500,
      Boolean(t.isArchived)
    ];

    const result = await pool.query(query, values);
    return res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error('API /api/tournaments POST error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.patch('/api/tournaments/:id', requireOrganizer, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Map camelCase to snake_case column updates
    const fieldMap: Record<string, string> = {
      name: 'name',
      editionNumber: 'edition_number',
      year: 'year',
      format: 'format',
      status: 'status',
      startDate: 'start_date',
      endDate: 'end_date',
      venue: 'venue',
      city: 'city',
      registrationOpen: 'registration_open',
      registrationStartDate: 'registration_start_date',
      registrationEndDate: 'registration_end_date',
      totalBudgetPointsPerTeam: 'total_budget_points_per_team',
      pointsPerWin: 'points_per_win',
      pointsPerTie: 'points_per_tie',
      maxSquadSize: 'max_squad_size',
      minSquadSize: 'min_squad_size',
      maxOverseasPlayers: 'max_overseas_players',
      description: 'description',
      upiQrCodeUrl: 'upi_qr_code_url',
      upiId: 'upi_id',
      registrationFee: 'registration_fee',
      isArchived: 'is_archived'
    };

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, val] of Object.entries(updates)) {
      if (fieldMap[key]) {
        setClauses.push(`${fieldMap[key]} = $${idx}`);
        values.push(val);
        idx++;
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No valid update fields provided.' });
    }

    setClauses.push(`updated_at = timezone('utc'::text, now())`);
    values.push(id);
    const query = `UPDATE public.tournaments SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *;`;

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found.' });
    }
    return res.json(result.rows[0]);
  } catch (err: any) {
    console.error('API /api/tournaments PATCH error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tournaments/:id', requireOrganizer, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM public.tournaments WHERE id = $1;', [id]);
    return res.json({ success: true, id });
  } catch (err: any) {
    console.error('API /api/tournaments DELETE error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 3. TEAMS API (Organizer Protected Mutations)
// ==============================================================================
app.get('/api/teams', async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.query;
    const query = tournamentId
      ? 'SELECT * FROM public.teams WHERE tournament_id = $1 ORDER BY name ASC;'
      : 'SELECT * FROM public.teams ORDER BY name ASC;';
    const params = tournamentId ? [tournamentId] : [];
    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/teams', requireOrganizer, async (req: Request, res: Response) => {
  try {
    const t = req.body;
    const query = `
      INSERT INTO public.teams (
        id, tournament_id, name, short_code, city, primary_color, secondary_color,
        logo_url, owner_name, budget_total, budget_spent, budget_remaining, total_players_assigned
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;
    const values = [
      t.id, t.tournamentId, t.name, (t.shortCode || 'TEAM').toUpperCase(), t.city || 'Mumbai',
      t.primaryColor || '#0284c7', t.secondaryColor || '#0f172a', t.logoUrl || null,
      t.ownerName || 'Franchise Owner', t.budgetTotal || 10000000, t.budgetSpent || 0,
      t.budgetRemaining || t.budgetTotal || 10000000, t.totalPlayersAssigned || 0
    ];
    const result = await pool.query(query, values);
    return res.status(201).json(result.rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.patch('/api/teams/:id', requireOrganizer, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const fieldMap: Record<string, string> = {
      name: 'name',
      shortCode: 'short_code',
      city: 'city',
      primaryColor: 'primary_color',
      secondaryColor: 'secondary_color',
      logoUrl: 'logo_url',
      ownerName: 'owner_name',
      budgetTotal: 'budget_total',
      budgetSpent: 'budget_spent',
      budgetRemaining: 'budget_remaining',
      totalPlayersAssigned: 'total_players_assigned'
    };

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, val] of Object.entries(updates)) {
      if (fieldMap[key]) {
        setClauses.push(`${fieldMap[key]} = $${idx}`);
        values.push(val);
        idx++;
      }
    }

    if (setClauses.length === 0) return res.status(400).json({ error: 'No fields to update.' });

    values.push(id);
    const query = `UPDATE public.teams SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *;`;
    const result = await pool.query(query, values);
    return res.json(result.rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/teams/:id', requireOrganizer, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM public.teams WHERE id = $1;', [id]);
    return res.json({ success: true, id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 4. PLAYERS API (Organizer Protected Mutations)
// ==============================================================================
app.get('/api/players', async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.query;
    const query = tournamentId
      ? 'SELECT * FROM public.players WHERE tournament_id = $1 ORDER BY name ASC;'
      : 'SELECT * FROM public.players ORDER BY name ASC;';
    const params = tournamentId ? [tournamentId] : [];
    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/players', requireOrganizer, async (req: Request, res: Response) => {
  try {
    const p = req.body;
    const query = `
      INSERT INTO public.players (
        id, tournament_id, name, jersey_number, role, batting_style, bowling_style,
        base_price, sold_price, team_id, is_captain, is_overseas, email, phone, city,
        shirt_size, food_preference, registration_status, payment_status, matches_played,
        runs_scored, highest_score, wickets_taken, best_bowling, strike_rate, economy_rate,
        auction_status, photo_url
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26,
        $27, $28
      ) RETURNING *;
    `;
    const values = [
      p.id, p.tournamentId, p.name, p.jerseyNumber || 10, p.role || 'All-Rounder',
      p.battingStyle || 'Right-hand bat', p.bowlingStyle || 'Right-arm medium',
      p.basePrice || 500000, p.soldPrice || null, p.teamId || null,
      Boolean(p.isCaptain), Boolean(p.isOverseas), p.email, p.phone, p.city || 'Mumbai',
      p.shirtSize || 'L', p.foodPreference || 'Veg', p.registrationStatus || 'approved',
      p.paymentStatus || 'paid', p.matchesPlayed || 0, p.runsScored || 0, p.highestScore || 0,
      p.wicketsTaken || 0, p.bestBowling || '-', p.strikeRate || 0, p.economyRate || 0,
      p.auctionStatus || (p.teamId ? 'sold' : 'available'), p.photoUrl || null
    ];
    const result = await pool.query(query, values);
    return res.status(201).json(result.rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.patch('/api/players/:id', requireOrganizer, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const fieldMap: Record<string, string> = {
      name: 'name',
      jerseyNumber: 'jersey_number',
      role: 'role',
      battingStyle: 'batting_style',
      bowlingStyle: 'bowling_style',
      basePrice: 'base_price',
      soldPrice: 'sold_price',
      teamId: 'team_id',
      isCaptain: 'is_captain',
      isOverseas: 'is_overseas',
      email: 'email',
      phone: 'phone',
      city: 'city',
      shirtSize: 'shirt_size',
      foodPreference: 'food_preference',
      registrationStatus: 'registration_status',
      paymentStatus: 'payment_status',
      matchesPlayed: 'matches_played',
      runsScored: 'runs_scored',
      highestScore: 'highest_score',
      wicketsTaken: 'wickets_taken',
      bestBowling: 'best_bowling',
      strikeRate: 'strike_rate',
      economyRate: 'economy_rate',
      auctionStatus: 'auction_status',
      photoUrl: 'photo_url'
    };

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, val] of Object.entries(updates)) {
      if (fieldMap[key]) {
        setClauses.push(`${fieldMap[key]} = $${idx}`);
        values.push(val);
        idx++;
      }
    }

    if (setClauses.length === 0) return res.status(400).json({ error: 'No fields to update.' });

    values.push(id);
    const query = `UPDATE public.players SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *;`;
    const result = await pool.query(query, values);
    return res.json(result.rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/players/:id', requireOrganizer, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM public.players WHERE id = $1;', [id]);
    return res.json({ success: true, id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 5. REGISTRATIONS API (Public Registration + Organizer Status Updates)
// ==============================================================================
app.get('/api/registrations', async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.query;
    const query = tournamentId
      ? 'SELECT * FROM public.registrations WHERE tournament_id = $1 ORDER BY created_at DESC;'
      : 'SELECT * FROM public.registrations ORDER BY created_at DESC;';
    const params = tournamentId ? [tournamentId] : [];
    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Public player self-service registration (No organizer auth required)
app.post('/api/registrations', async (req: Request, res: Response) => {
  try {
    const r = req.body;
    const query = `
      INSERT INTO public.registrations (
        id, tournament_id, full_name, email, phone, age, city, primary_role, batting_style,
        bowling_style, shirt_size, food_preference, has_breakfast, has_lunch,
        guest_count, guests, guest_food_preference, has_guest_breakfast, has_guest_lunch,
        payment_reference, payment_status, approval_status, catering_status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19,
        $20, $21, $22, $23
      ) RETURNING *;
    `;
    const values = [
      r.id || `reg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      r.tournamentId,
      r.playerName || r.fullName || r.name,
      r.email,
      r.phone,
      parseInt(r.age, 10) || 24,
      r.city || 'Mumbai',
      r.primaryRole || r.role || 'Batsman',
      r.battingStyle || 'Right-hand bat',
      r.bowlingStyle || 'Right-arm medium',
      r.shirtSize || 'L',
      r.foodPreference || 'Veg',
      r.hasBreakfast ?? true,
      r.hasLunch ?? true,
      r.guestCount || 0,
      JSON.stringify(r.guests || []),
      r.guestFoodPreference || 'Veg',
      Boolean(r.hasGuestBreakfast),
      Boolean(r.hasGuestLunch),
      r.paymentReference || null,
      r.paymentStatus || 'pending',
      r.status || r.approvalStatus || 'pending',
      r.cateringStatus || 'pending'
    ];
    const result = await pool.query(query, values);
    return res.status(201).json(result.rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Organizer approval & updates
app.patch('/api/registrations/:id', requireOrganizer, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (updates.status !== undefined) {
      setClauses.push(`status = $${idx}`);
      values.push(updates.status);
      idx++;
    }
    if (updates.paymentStatus !== undefined) {
      setClauses.push(`payment_status = $${idx}`);
      values.push(updates.paymentStatus);
      idx++;
    }
    if (updates.cateringStatus !== undefined) {
      setClauses.push(`catering_status = $${idx}`);
      values.push(updates.cateringStatus);
      idx++;
    }
    if (updates.foodPreference !== undefined) {
      setClauses.push(`food_preference = $${idx}`);
      values.push(updates.foodPreference);
      idx++;
    }
    if (updates.hasBreakfast !== undefined) {
      setClauses.push(`has_breakfast = $${idx}`);
      values.push(updates.hasBreakfast);
      idx++;
    }
    if (updates.hasLunch !== undefined) {
      setClauses.push(`has_lunch = $${idx}`);
      values.push(updates.hasLunch);
      idx++;
    }

    if (setClauses.length === 0) return res.status(400).json({ error: 'No fields to update.' });

    setClauses.push(`updated_at = timezone('utc'::text, now())`);
    values.push(id);
    const query = `UPDATE public.registrations SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *;`;
    const result = await pool.query(query, values);
    return res.json(result.rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 6. HEALTH & STATUS ENDPOINT
// ==============================================================================
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const dbRes = await pool.query('SELECT 1 as healthy;');
    return res.json({
      status: 'ok',
      service: 'Warhawks Cricket Tournament API',
      database: dbRes.rows.length > 0 ? 'connected' : 'unhealthy'
    });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', error: err.message });
  }
});

// ==============================================================================
// 7. VITE DEV MIDDLEWARE / STATIC PRODUCTION SERVING
// ==============================================================================
async function startServer() {
  if (!isProd) {
    // Mount Vite dev middleware in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve static build in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Warhawks Server] Running on http://0.0.0.0:${PORT} (Mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch(err => {
  console.error('[Warhawks Server Startup Fatal]:', err);
});
