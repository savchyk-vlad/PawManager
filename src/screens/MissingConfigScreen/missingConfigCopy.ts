export const MISSING_CONFIG_STEPS = [
  "1. In the project root (next to app.config.js and package.json), create or edit the file .env",
  "2. Set both (names must match):",
  "   EXPO_PUBLIC_SUPABASE_URL=your project URL from Supabase → Settings → API",
  "   EXPO_PUBLIC_SUPABASE_ANON_KEY=your anon public key from the same page",
  "   (You can also use SUPABASE_URL and SUPABASE_ANON_KEY without EXPO_PUBLIC_.)",
  "3. On your computer, run: npx expo start -c  then reload the app in Expo Go.",
  "4. If Expo Go on the phone does not connect, try: npx expo start --tunnel on the same machine.",
  "5. The phone only loads the JS bundle; it does not read .env — .env is only on your dev machine.",
] as const;
