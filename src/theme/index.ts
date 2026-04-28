/**
 * PawManager theme — minimal edition.
 * 24 tokens total. No one-offs, no near-duplicates.
 *
 * Rule: if two tokens are used in the same context and look the same
 * on screen, they are the same token.
 */

// ---------------------------------------------------------------------------
// Surfaces (3)
// ---------------------------------------------------------------------------
// bg          → page / screen background
// surface     → cards, sheets, tab bar, navigation chrome
// surfaceHigh → modals, menus, elevated overlays, chips, tags
//               (inputs just use `surface` + a focus border — no extra token)

// ---------------------------------------------------------------------------
// Text (3)
// ---------------------------------------------------------------------------
// text          → headings, values, anything that needs to pop
// textSecondary → labels, captions, meta
// textMuted     → placeholders, timestamps, disabled

// ---------------------------------------------------------------------------
// Borders (2)
// ---------------------------------------------------------------------------
// border       → default card / input / divider border
// borderStrong → focused inputs, hover states, selected items

// ---------------------------------------------------------------------------
// Color scales (4 stops × 3 colors = 12)
// ---------------------------------------------------------------------------
// Each color has: default · text · deep · subtle
// default → icons, checkmarks, active indicators
// text    → readable labels on dark backgrounds
// deep    → button / FAB backgrounds, badge fills
// subtle  → tinted surface backgrounds (rgba)

export const colors = {
  // Surfaces
  bg: '#0e0e0c',
  surface: '#181816',
  surfaceHigh: '#222220',
  surfaceExtra: '#rgba(45, 45, 42, 0.3)',


  // Text
  text: '#eeebe2',
  textSecondary: '#8BA890',
  textMuted: '#606058',

  // Borders
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.14)',

  // Green
  greenDefault: '#5CAF72',
  greenText: '#6BBF7A',
  greenDeep: '#2A5730',
  greenSubtle: 'rgba(61,124,71,0.12)',

  // Amber
  amberDefault: '#F59E0B',
  amberText: '#FCD34D',
  amberDeep: '#633806',
  amberSubtle: 'rgba(240,160,48,0.12)',

  // Red
  redDefault: '#E04040',
  redText: '#F09595',
  redDeep: '#7a1f1f',
  redSubtle: 'rgba(224,64,64,0.12)',

  // Focus ring (greenBorder, fabBorder, borderInputGreen all collapse here)
  greenBorder: 'rgba(91,175,114,0.35)',

  // Pure white for icons on colored backgrounds
  white: '#FFFFFF',
} as const;

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
    bg: '#FFFFFF',
    surface: '#F5F2EE',
    surfaceHigh: '#F9F7F5',

    text: '#1A1510',
    textSecondary: '#5A5147',
    textMuted: '#9A8F82',

    border: 'rgba(60,50,35,0.12)',
    borderStrong: 'rgba(60,50,35,0.22)',

    greenDefault: '#3D7C47',
    greenText: '#2A5730',
    greenDeep: '#1e3612',
    greenSubtle: '#EAF3DE',

    amberDefault: '#EF9F27',
    amberText: '#633806',
    amberDeep: '#412402',
    amberSubtle: '#FAEEDA',

    redDefault: '#C0392B',
    redText: '#7a1f1f',
    redDeep: '#4a0f0f',
    redSubtle: '#fceaea',
  },

  spacing: { screenH: 20, screenV: 24, gap: 16, gapSm: 8, gapLg: 28 },
  radius: { sm: 10, md: 14, lg: 20, full: 999 },

  typography: {
    displayLg: { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.5 },
    displayMd: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.3 },
    body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
    label: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.6 },
    caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 18 },
  },
} as const;
