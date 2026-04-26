# PawManager MVP — Task List

> Update this file as tasks are completed. Mark done with `[x]`.

---

## ✅ Phase 0 — Project Setup
- [x] Initialize Expo + TypeScript project
- [x] Install core dependencies (React Navigation, Zustand, date-fns, Supabase, Expo Notifications)
- [x] Define design tokens (`src/theme/index.ts`)
- [x] Define TypeScript types (`src/types/index.ts`)
- [x] Create seed data (`src/lib/data.ts`)
- [x] Set up Zustand store (`src/store/index.ts`)
- [x] Set up navigation (`src/navigation/index.tsx`)
- [x] `App.tsx` wired to navigation

---

## ✅ Phase 1 — Core Screens (skeleton)
- [x] `src/screens/DashboardScreen.tsx`
- [x] `src/screens/ClientsScreen.tsx`
- [x] `src/screens/ClientDetailScreen.tsx`
- [x] `src/screens/ScheduleScreen.tsx`
- [x] `src/screens/PaymentsScreen.tsx`
- [x] `src/screens/ActiveWalkScreen.tsx`

---

## ✅ Phase 2 — Auth (Week 2)
- [x] `src/lib/supabase.ts` — Supabase client + env config
- [x] `src/store/authStore.ts` — Zustand: user session
- [x] `src/navigation/AuthNavigator.tsx` — auth stack (guards main tabs)
- [x] `src/screens/auth/WelcomeScreen.tsx` — value prop + CTA
- [x] `src/screens/auth/SignUpScreen.tsx` — email + password
- [x] `src/screens/auth/SignInScreen.tsx` — login

---

## 🔲 Phase 3 — Clients CRUD (Week 3)
- [ ] `src/screens/AddClientScreen.tsx` — Owner Info + Dog Info form
- [ ] `src/screens/EditClientScreen.tsx` — edit existing client/dog
- [ ] `src/components/DogForm.tsx` — reusable dog sub-form
- [ ] `src/lib/api/clients.ts` — Supabase CRUD for clients + dogs

---

## 🔲 Phase 4 — Schedule CRUD (Week 4)
- [ ] `src/screens/AddWalkScreen.tsx` — client, date, time, duration
- [ ] `src/screens/WalkDetailScreen.tsx` — walk details + quick actions (complete, cancel, edit)
- [ ] `src/components/CalendarView.tsx` — react-native-calendars wrapper
- [ ] `src/lib/api/walks.ts` — Supabase CRUD for walks

---

## 🔲 Phase 5 — Recurring Walks + Notifications (Week 5)
- [ ] `src/screens/AddRecurringWalkScreen.tsx` — days of week, start/end date
- [ ] `src/lib/recurringWalks.ts` — generate instances for next 60 days
- [ ] `src/lib/notifications.ts` — scheduleWalkReminder, cancelReminder
- [ ] `src/hooks/useNotifications.ts` — permission request on startup
- [ ] Update `src/store/index.ts` — add recurringTemplates + generateInstances

---

## 🔲 Phase 6 — Payments + Reports + Settings (Week 6)
- [ ] `src/screens/MarkPaidScreen.tsx` — amount, date, method, note
- [ ] `src/screens/PaymentHistoryScreen.tsx` — list of completed payments
- [ ] `src/lib/api/payments.ts` — Supabase CRUD for payments
- [ ] `src/screens/ReportsScreen.tsx` — monthly stats, earnings chart (Pro)
- [ ] `src/lib/reports.ts` — metrics calculations
- [ ] `src/screens/SettingsScreen.tsx` — business name, default rate, reminder timing

---

## 🔲 Phase 7 — Paywall / RevenueCat (Week 6)
- [ ] `src/lib/purchases.ts` — RevenueCat init + checkSubscription
- [ ] `src/hooks/useSubscription.ts` — isPro state
- [ ] `src/screens/PaywallScreen.tsx` — Monthly / Annual plans, Best Value badge
- [ ] Wire paywall to: adding 4th client, creating recurring walk

---

## 🔲 Phase 8 — Beta & Launch (Weeks 7–8)
- [ ] TestFlight build + internal testing (20 walkers)
- [ ] Fix critical bugs from beta feedback
- [ ] App Store screenshots + description
- [ ] App Store submission
