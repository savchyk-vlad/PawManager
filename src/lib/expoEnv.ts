import Constants from 'expo-constants';

type Extra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  googleIosClientId?: string;
  googleWebClientId?: string;
}

/** `expo.extra` can appear on `expoConfig` and (legacy) `manifest` — e.g. Expo Go on a device. */
function mergedExtra(): Extra {
  const a = (Constants.expoConfig?.extra as Extra) ?? {};
  const b = (Constants.manifest as { extra?: Extra } | null)?.extra ?? {};
  // Prefer explicit keys from expoConfig, fill gaps from manifest
  return {
    ...b,
    ...a,
  };
}

const e: Extra = mergedExtra();

/**
 * Inlined from `.env` at bundle time; use `process.env.EXPO_PUBLIC_...` (dot only).
 * `e.*` is the `expo.extra` fallback (app.config + manifest on device / Expo Go).
 */
export const supabaseUrl: string =
  e.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';

export const supabaseAnonKey: string =
  e.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const googleIosClientId: string | undefined =
  e.googleIosClientId || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export const googleWebClientId: string | undefined =
  e.googleWebClientId || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

export const isSupabaseConfigured: boolean = Boolean(
  (supabaseUrl && supabaseUrl.trim()) && (supabaseAnonKey && supabaseAnonKey.trim())
);
