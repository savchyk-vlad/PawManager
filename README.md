# PawManager

A React Native (**Expo**) app for **dog walking businesses**: clients and dogs, scheduling walks, tracking walks and payments, and account settings. Auth and data use **Supabase** (Auth + Postgres with RLS). Client state lives in **Zustand**; schema and policies are in `supabase/migrations/`.

## Tech stack

- **Expo** ~54, **React** 19, **React Native** 0.81, **TypeScript**
- **React Navigation** — native stack + bottom tabs (`src/navigation/`)
- **Zustand** — clients, walks, settings, auth
- **Supabase** — `@supabase/supabase-js`
- **date-fns**, **react-native-svg**, **expo-notifications**, **expo-background-fetch**, and other modules listed in `package.json`

## Main navigation

After sign-in, the **bottom tabs** (left → right) are:

| Tab        | Notes                                      |
| ---------- | ------------------------------------------ |
| Clients    | Client list, search, unpaid filter         |
| Schedule   | Calendar and day carousel for walks        |
| Walks      | Today / upcoming / missed (default tab)    |
| Payments   | Earned, unpaid clients                     |
| Profile    | Account, business defaults, support        |

Modals and stacks (e.g. client detail, active walk, add/edit walk) sit above the tab navigator.

## Requirements

- **Node.js** 18+ (LTS recommended)
- **npm**
- **iOS / Android:** Xcode / Android Studio, or **[Expo Go](https://expo.dev/go)** for quick development

## Install and run

```bash
npm install
npm start
```

Then open **iOS Simulator**, **Android Emulator**, or scan the QR code in **Expo Go**. Native directories appear after `expo prebuild` / `expo run:*`.

```bash
npm run ios
npm run android
npm run web
```

## NPM scripts

| Script            | Purpose                                      |
| ----------------- | -------------------------------------------- |
| `npm start`       | Start Expo dev server (`expo start`)         |
| `npm run ios`     | Run on iOS (`expo run:ios`)                  |
| `npm run android` | Run on Android (`expo run:android`)        |
| `npm run web`     | Web target (`expo start --web`)              |
| `npm test`        | Unit tests (`tsx --test src/**/*.test.ts`)   |
| `npm run check:env` | Verify `.env` / Supabase vars are set    |
| `npm run clean:cache` | Clear caches (see `scripts/clean-cache.js`) |
| `npm run prepare` | Husky git hooks (after `npm install`)      |

Typecheck locally:

```bash
npx tsc --noEmit
```

## Configuration

1. Create **`.env`** in the **project root** (same folder as `package.json`). If the repo provides **`.env.example`**, copy it: `cp .env.example .env`. Set at least:

   - **`EXPO_PUBLIC_SUPABASE_URL`** and **`EXPO_PUBLIC_SUPABASE_ANON_KEY`**  
   - Or legacy names: **`SUPABASE_URL`** / **`SUPABASE_ANON_KEY`**

   Prefer **`EXPO_PUBLIC_*`** — see [Expo environment variables](https://docs.expo.dev/guides/environment-variables/).

2. **`app.config.js`** loads `.env` and maps values into **`expo.extra`**. Runtime code uses **`src/lib/expoEnv.ts`** (Metro-inlined `EXPO_PUBLIC_*` and `expo.extra`).

3. **`.env` is gitignored.** Open it via your editor (e.g. **Cmd/Ctrl+P** → `.env`) or `open .env`. For **EAS Build**, set the same keys in [EAS environment variables](https://docs.expo.dev/build-reference/variables/).

4. Run **`npm run check:env`** (no secrets printed).

5. After changing `.env`, reload the app; if values stick, run **`npx expo start -c`**. The repo includes **`babel.config.js`** and **`metro.config.js`** for consistent inlining.

6. **Phone + Expo Go:** The bundle is built on your **computer**; `.env` lives on the machine running `expo start`, not on the phone. Fix env there, then **`npx expo start -c`**. Connection issues: same Wi‑Fi, Local Network permission (iOS), or **`npx expo start --tunnel`**. Configure **Supabase Auth URLs** and OAuth per [Supabase Auth](https://supabase.com/docs/guides/auth) and your `scheme` in `app.config.js`.

If Supabase vars are missing at startup, the app may show **`MissingConfigScreen`** with setup steps instead of the main UI.

Rotate keys if they were ever committed; apply DB changes from **`supabase/migrations/`** in your Supabase project.

## Project layout

| Path | Purpose |
|------|---------|
| `App.tsx` | Root: providers, navigation gate, missing-config handling |
| `app.config.js` | Expo config, `expo.extra`, env wiring |
| `src/navigation/` | Stack + tab navigators, types |
| `src/screens/` | Feature screens (often `ScreenName/index.tsx` + `components/`) |
| `src/components/` | Shared UI (forms, sheets, auth blocks, …) |
| `src/lib/` | Supabase client, services, scheduling helpers, metrics |
| `src/store/` | Zustand stores |
| `src/theme/` | Design tokens / colors |
| `supabase/migrations/` | SQL schema and RLS |
| `scripts/` | `verify-env.js`, `clean-cache.js` |

Further tasks and notes: **`TASKS.md`**.

## License

Private; all rights reserved unless the repository owner states otherwise.
