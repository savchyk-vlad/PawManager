/**
 * Deterministic avatar colors per client so initials look varied but stay stable.
 */

export type ClientAvatarTint = {
  backgroundColor: string;
  color: string;
};

const PALETTE: readonly ClientAvatarTint[] = [
  { backgroundColor: "#1E4D2E", color: "#90EEA8" },
  { backgroundColor: "#3D2E5C", color: "#D4C4F7" },
  { backgroundColor: "#1E3A5F", color: "#93C5FD" },
  { backgroundColor: "#5C4318", color: "#FDE68A" },
  { backgroundColor: "#164542", color: "#7EE8DC" },
  { backgroundColor: "#5C1E2E", color: "#FCA5B8" },
  { backgroundColor: "#2E1F47", color: "#DDD6FE" },
  { backgroundColor: "#1F3847", color: "#BAE6FD" },
  { backgroundColor: "#3A3020", color: "#FDE68A" },
  { backgroundColor: "#1A4D4A", color: "#99F6E4" },
];

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Same client id → same colors everywhere (list, detail, schedule walk). */
export function clientAvatarTint(seed: string): ClientAvatarTint {
  const key = seed.trim() || " ";
  const idx = hashString(key) % PALETTE.length;
  return PALETTE[idx]!;
}
