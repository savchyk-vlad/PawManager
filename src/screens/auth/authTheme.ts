import { onboarding } from "../onboarding/onboardingTheme";

// Auth shares the same dark palette as onboarding, but our existing auth UI
// components were built against `design.colors` / `design.radius` (light theme).
// Provide a tiny compatibility layer so we can keep those components simple.
export const auth = {
  colors: {
    ...onboarding.colors,
    // Aliases for existing auth components
    textMuted: onboarding.colors.text3,
    textSecondary: onboarding.colors.text2,
    greenDefault: onboarding.colors.accent,
    greenDeep: onboarding.colors.accentDk,
    greenSubtle: onboarding.colors.accentDim,
    redDefault: onboarding.colors.red,
    redSubtle: "rgba(240,85,85,0.10)",
    surface: onboarding.colors.bg,
    surfaceHigh: onboarding.colors.bg2,
  },
  radius: {
    // Match the app's general rounding (theme/radius.md=14, lg=18).
    sm: 10,
    md: 14,
    lg: 18,
    full: onboarding.radius.pill,
    // keep original keys too
    ...onboarding.radius,
  },
} as const;
