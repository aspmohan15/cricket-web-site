// Supabase Client Architecture for Warhawks Tournament Management
import { createClient } from '@supabase/supabase-js';

const STORAGE_SETTINGS_KEY = 'warhawks_supabase_config_v1';

// Read environment defaults or runtime storage overrides
const getInitialConfig = () => {
  try {
    const stored = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.url && parsed.anonKey) {
        return { url: parsed.url, anonKey: parsed.anonKey };
      }
    }
  } catch {
    // Ignore storage errors
  }

  return {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  };
};

let activeConfig = getInitialConfig();
let supabaseInstance = null;

export const isSupabaseConfigured = () => {
  const { url, anonKey } = activeConfig;
  return Boolean(
    url &&
    anonKey &&
    !url.includes('[YOUR-PROJECT-REF]') &&
    !anonKey.includes('your-supabase-anon-key') &&
    url.startsWith('https://')
  );
};

export const getSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(activeConfig.url, activeConfig.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    } catch (err) {
      console.warn('Supabase client initialization warning:', err.message);
      return null;
    }
  }

  return supabaseInstance;
};

/**
 * Updates the Supabase configuration at runtime (e.g. from Settings View)
 */
export const updateSupabaseConfig = (url, anonKey) => {
  activeConfig = { url: (url || '').trim(), anonKey: (anonKey || '').trim() };
  try {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(activeConfig));
  } catch {
    // ignore
  }
  supabaseInstance = null; // force re-instantiation
  return getSupabaseClient();
};

/**
 * Returns current configuration (safe for UI)
 */
export const getSupabaseConfig = () => {
  return { ...activeConfig };
};

/**
 * Live test to verify Supabase connectivity and credential validity
 */
export const testSupabaseConnection = async (testUrl, testAnonKey) => {
  const url = (testUrl || activeConfig.url || '').trim();
  const anonKey = (testAnonKey || activeConfig.anonKey || '').trim();

  if (!url || !anonKey) {
    return {
      connected: false,
      message: 'Supabase Project URL and Anon Key are required.'
    };
  }

  if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
    return {
      connected: false,
      message: 'Invalid Supabase URL format. Must start with https:// and end with .supabase.co'
    };
  }

  const startTime = Date.now();
  try {
    // Create a temporary client for testing
    const testClient = createClient(url, anonKey, {
      auth: { persistSession: false }
    });

    // Test a basic API ping via the auth health endpoint or public table probe
    const { data, error } = await testClient.from('tournaments').select('count', { count: 'exact', head: true });

    const latency = Date.now() - startTime;

    if (error) {
      // If table doesn't exist yet, it's still a valid connected Supabase project!
      if (error.code === '42P01' || error.message?.includes('relation "public.tournaments" does not exist')) {
        return {
          connected: true,
          latency,
          needsMigration: true,
          message: `Connected to Supabase project in ${latency}ms! Database schema needs to be initialized.`
        };
      }

      // If invalid API key
      if (error.code === 'PGRST301' || error.message?.includes('JWT') || error.message?.includes('key')) {
        return {
          connected: false,
          latency,
          message: 'Invalid Supabase Anon Key. Check Project Settings -> API in your Supabase dashboard.'
        };
      }

      return {
        connected: false,
        latency,
        message: `Supabase returned error: ${error.message}`
      };
    }

    return {
      connected: true,
      latency,
      needsMigration: false,
      message: `Successfully connected to Supabase PostgreSQL cluster! Latency: ${latency}ms.`
    };
  } catch (err) {
    return {
      connected: false,
      message: `Connection failed: ${err.message || 'Network error or CORS block'}`
    };
  }
};
