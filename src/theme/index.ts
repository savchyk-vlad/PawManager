/**
 * PawManager theme — minimal edition.
 * Use `useThemeColors()` in components for surfaces that follow Settings → Appearance.
 *
 * Static `design.colors` stays for auth/onboarding flows that intentionally use fixed light chrome.
 */

export {
  darkPalette,
  lightPalette,
  type ThemeColors,
} from "./palettes";

export { useThemeColors, useAppearance, useSetAppearance } from "./themeHooks";

// ---------------------------------------------------------------------------
// Radius
// ---------------------------------------------------------------------------

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
} as const;

// ---------------------------------------------------------------------------
// Auth / onboarding (light surfaces)
// Mirrors the exact same 3-tier pattern as dark theme.
// ---------------------------------------------------------------------------

export const design = {
  colors: {
    bg: "#FFFFFF",
    surface: "#F5F2EE",
    surfaceHigh: "#F9F7F5",

    text: "#1A1510",
    textSecondary: "#5A5147",
    textMuted: "#9A8F82",

    border: "rgba(60,50,35,0.12)",
    borderStrong: "rgba(60,50,35,0.22)",

    greenDefault: "#3D7C47",
    greenText: "#2A5730",
    greenDeep: "#1e3612",
    greenSubtle: "#EAF3DE",

    amberDefault: "#EF9F27",
    amberText: "#633806",
    amberDeep: "#412402",
    amberSubtle: "#FAEEDA",

    redDefault: "#C0392B",
    redText: "#7a1f1f",
    redDeep: "#4a0f0f",
    redSubtle: "#fceaea",
  },

  spacing: { screenH: 20, screenV: 24, gap: 16, gapSm: 8, gapLg: 28 },
  radius: { sm: 10, md: 14, lg: 20, full: 999 },

  typography: {
    displayLg: { fontSize: 26, fontWeight: "700" as const, letterSpacing: -0.5 },
    displayMd: { fontSize: 20, fontWeight: "700" as const, letterSpacing: -0.3 },
    body: { fontSize: 15, fontWeight: "400" as const, lineHeight: 22 },
    label: { fontSize: 12, fontWeight: "600" as const, letterSpacing: 0.6 },
    caption: { fontSize: 12, fontWeight: "400" as const, lineHeight: 18 },
  },
} as const;
