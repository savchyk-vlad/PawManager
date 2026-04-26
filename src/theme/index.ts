export const colors = {
  bg: '#F5F0E8',
  surface: '#FFFEF9',
  surface2: '#F0EBE0',
  border: '#E0D8CC',
  accent: '#2D5A27',
  accent2: '#5C8B56',
  accent3: '#A8C5A0',
  gold: '#C4963A',
  gold2: '#E8C876',
  danger: '#C0392B',
  dangerLight: '#FDECEA',
  warning: '#D4851A',
  warningLight: '#FEF3E2',
  text: '#1A1410',
  text2: '#5C4F3A',
  muted: '#9C8E78',
  white: '#FFFEF9',
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
} as const;

// New auth design system tokens
export const design = {
  colors: {
    brand: { dark: '#2A5730', mid: '#3B6D11', light: '#EAF3DE' },
    text: { primary: '#1A1510', secondary: '#5A5147', tertiary: '#9A8F82' },
    surface: { base: '#FFFFFF', subtle: '#F5F2EE', input: '#F9F7F5' },
    amber: { dark: '#633806', mid: '#EF9F27', light: '#FAEEDA' },
    danger: '#C0392B',
    border: 'rgba(60, 50, 35, 0.12)',
  },
  spacing: { screenH: 20, screenV: 24, gap: 16, gapSm: 8, gapLg: 28 },
  radius: { sm: 10, md: 14, lg: 20, full: 999 },
  typography: {
    displayLg: { fontSize: 26, fontWeight: '700' as const, letterSpacing: -0.5 },
    displayMd: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.3 },
    body:      { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
    label:     { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.6 },
    caption:   { fontSize: 12, fontWeight: '400' as const, lineHeight: 18 },
  },
} as const;
