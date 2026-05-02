/**
 * Dark / light palettes — same keys so screens can swap via useThemeColors().
 */

export const darkPalette = {
  bg: "#0e0e0c",
  surface: "#181816",
  surfaceHigh: "#222220",
  surfaceExtra: "rgba(45, 45, 42, 0.3)",

  text: "#eeebe2",
  textSecondary: "#8BA890",
  textMuted: "#606058",

  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",

  greenDefault: "#5CAF72",
  greenText: "#6BBF7A",
  greenDeep: "#2A5730",
  greenSubtle: "rgba(61,124,71,0.12)",

  amberDefault: "#F59E0B",
  amberText: "#FCD34D",
  amberDeep: "#633806",
  amberSubtle: "rgba(240,160,48,0.12)",

  redDefault: "#E04040",
  redText: "#F09595",
  redDeep: "#7a1f1f",
  redSubtle: "rgba(224,64,64,0.12)",

  greenBorder: "rgba(91,175,114,0.35)",

  white: "#FFFFFF",
} as const;

/** Shared shape so dark/light palettes are interchangeable at runtime. */
export type ThemeColors = Record<keyof typeof darkPalette, string>;

/** Warm light surfaces — aligned with `design.colors` in theme index. */
export const lightPalette: ThemeColors = {
  bg: "#FFFFFF",
  surface: "#F5F2EE",
  surfaceHigh: "#F9F7F5",
  surfaceExtra: "rgba(60, 50, 35, 0.06)",

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

  greenBorder: "rgba(61,124,71,0.35)",

  white: "#FFFFFF",
};
