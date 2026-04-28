# PawManager

A React Native (Expo) app for **dog walking businesses**: clients and dogs, scheduling walks, tracking active walks, and sign-in with Supabase. State is handled with Zustand; data lives in **Supabase** with row-level security (see `supabase/migrations/`).

## Tech stack

- **Expo** ~54, **TypeScript**
- **React Navigation** (native stack + bottom tabs)
- **Zustand** for client/walks/auth state
- **Supabase** (Auth + Postgres)
- **date-fns**, **expo-notifications** (and other Expo modules per `package.json`)

## Requirements

- Node.js 18+ (use current LTS)
- npm
- For device builds: Xcode (iOS), Android Studio (Android), or [Expo Go](https://expo.dev/go) for quick dev

## Install and run

```bash
npm install
npm start
```

From the dev menu, open **iOS simulator**, **Android emulator**, or scan the QR code for Expo Go. Native projects live under `ios/` when you use `expo prebuild` / `expo run:*`.

```bash
npm run ios
npm run android
npm run web
```

## Configuration

1. **Copy** `.env.example` to **`.env`** in the project root. Prefer **`EXPO_PUBLIC_*` variables** (see [Expo env docs](https://docs.expo.dev/guides/environment-variables/)) — they are loaded by `npx expo start` and inlined into the app; this avoids “empty `expo.extra`” in dev. Optional legacy names (`SUPABASE_URL`, etc.) are still read by `app.config.js` as a fallback.

2. **`app.config.js`** loads **`.env` from the project root** (same folder as this file) and also maps both naming styles into **`expo.extra`**. Runtime reads **`src/lib/expoEnv.ts`**, which uses `expo.extra` and `EXPO_PUBLIC_*` from Metro.

3. **`.env` is gitignored** (so it may not show in the Explorer). Open it with **File → Open** or **Cmd/Ctrl + P** and type **`.env`**, or in a terminal: `code .env` / `open -e .env`. For **EAS Build**, set the same variable names in [EAS environment variables](https://docs.expo.dev/build-reference/variables/).

4. **Verify** with `npm run check:env` (no secret output).

5. After changing `.env`, reload the app; if the old values stick, run **`npx expo start -c`**. The repo includes **`babel.config.js`** and **`metro.config.js`** so the Expo toolchain can inline `EXPO_PUBLIC_*` the same on simulators and devices.

6. **Physical phone + Expo Go:** The **JavaScript bundle is built on your computer**; `.env` must be on the **PC/Mac running `npx expo start`**, not on the phone. The phone only loads the bundle over the network. If the app shows a red error about Supabase env, fix `.env` on the dev machine, then **`npx expo start -c`**, and reload. If the phone **cannot open the project at all** (connection error): use the **same Wi‑Fi** as the computer, allow **“Local network”** for Expo Go (iOS), or start with a tunnel: **`npx expo start --tunnel`**. For **auth redirects**, add your app’s URLs in the [Supabase Auth URL config](https://supabase.com/docs/guides/auth) and Google OAuth (see `scheme` in `app.config.js` / `pawmanager`).

If these values were ever committed in an old `app.json`, **rotate** the Supabase anon key and any OAuth client secrets in the provider consoles, then update `.env` only.

Apply database changes with the SQL in `supabase/migrations/` (e.g. `001_clients_dogs.sql`, `002_walks.sql`) in your Supabase project.

## Project layout (high level)

| Path | Purpose |
|------|--------|
| `app.config.js` | Expo app config and `expo.extra` (env-backed); there is no `app.json` |
| `App.tsx` | Root: safe area, auth refresh, navigation |
| `src/navigation/` | Tab + stack navigators |
| `src/screens/` | Feature screens (dashboard, clients, schedule, etc.) |
| `src/lib/` | Supabase client, services (`clientsService`, `walksService`, …) |
| `src/store/` | Zustand stores |
| `src/theme/` | Design tokens / theme |
| `supabase/migrations/` | SQL schema and RLS policies |

More granular roadmap and checklists: `TASKS.md`.

## License

Private; all rights reserved unless the repository owner states otherwise.
