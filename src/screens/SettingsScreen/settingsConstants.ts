/** Set to `true` when shipping Settings → Appearance (dark/light). Hidden until next release. */
export const SHOW_APPEARANCE_SETTINGS = false;

/** Common default walk rates ($) shown as quick picks in settings. */
export const DEFAULT_RATE_PRESETS = [15, 20, 25, 30, 35, 40] as const;

export function matchesRatePreset(draft: string, n: number): boolean {
  const parsed = parseFloat(draft.replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed === n;
}
