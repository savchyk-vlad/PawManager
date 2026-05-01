/** Parse `HH:mm` (24h) to minutes from midnight; invalid → null. `24:00` is end-of-day (1440). */
export function minutesFromHHmm(value: string): number | null {
  const t = value.trim();
  if (t === "24:00") return 24 * 60;
  const m = /^(\d{1,2}):(\d{2})$/.exec(t);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (
    !Number.isFinite(h) ||
    !Number.isFinite(min) ||
    min < 0 ||
    min > 59 ||
    h < 0 ||
    h > 23
  ) {
    return null;
  }
  return h * 60 + min;
}

const SLOT_STEP = 30;
const FALLBACK_START_MINS = 6 * 60;
const FALLBACK_END_MINS = 22 * 60;

/** Full local day — scheduling UI lists starts from midnight through end of day. */
export const DEFAULT_SCHEDULE_WINDOW_START_HHMM = "00:00";
export const DEFAULT_SCHEDULE_WINDOW_END_HHMM = "24:00";

/**
 * 30-minute walk start times on `dayAtLocalMidnight` such that the walk fits fully inside [shiftStart, shiftEnd].
 * Same-calendar-day shift only; if end ≤ start, falls back to 6:00–22:00 for slot listing.
 */
export function buildWalkTimeSlots(
  dayAtLocalMidnight: Date,
  shiftStartHHmm: string,
  shiftEndHHmm: string,
  durationMinutes: number,
): { label: string; iso: string }[] {
  let startM = minutesFromHHmm(shiftStartHHmm) ?? FALLBACK_START_MINS;
  let endM = minutesFromHHmm(shiftEndHHmm) ?? FALLBACK_END_MINS;
  if (endM <= startM) {
    startM = FALLBACK_START_MINS;
    endM = FALLBACK_END_MINS;
  }

  const dur = Math.max(5, Math.min(durationMinutes, 24 * 60));
  const maxStartM = endM - dur;
  if (maxStartM < startM) return [];

  const slots: { label: string; iso: string }[] = [];
  const base = new Date(dayAtLocalMidnight);
  base.setHours(0, 0, 0, 0);

  for (let mins = startM; mins <= maxStartM; mins += SLOT_STEP) {
    const d = new Date(base);
    const h24 = Math.floor(mins / 60);
    const min = mins % 60;
    d.setHours(h24, min, 0, 0);
    const h = d.getHours();
    const mPart = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    slots.push({ label: `${h12}:${mPart} ${ampm}`, iso: d.toISOString() });
  }
  return slots;
}
