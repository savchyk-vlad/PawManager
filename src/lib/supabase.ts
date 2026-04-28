import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from './expoEnv';
import { storage } from './storage';

const authOptions = {
  storage,
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: false,
} as const;

// Valid-looking placeholder so the module loads; the UI shows a config screen if env is missing.
const placeholderUrl = 'https://config-missing.localhost.supabase.co';
const placeholderKey = 'eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? supabaseUrl : placeholderUrl,
  isSupabaseConfigured ? supabaseAnonKey : placeholderKey,
  { auth: { ...authOptions } }
);
