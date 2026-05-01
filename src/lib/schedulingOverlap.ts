import { addDays, isSameDay, isToday, parseISO } from 'date-fns';
import { Walk } from '../types';

const STEP_MS = 60_000;

/** Occupied [start,end) ranges in ms for scheduled/in-progress walks on this local calendar day. */
export function getOccupiedRangesMsForDay(
  walks: Walk[],
  dayAtLocalMidnight: Date,
  excludeWalkId?: string,
): { start: number; end: number }[] {
  return walks
    .filter(
      (w) =>
        w.id !== excludeWalkId &&
        (w.status === 'scheduled' || w.status === 'in_progress') &&
        isSameDay(parseISO(w.scheduledAt), dayAtLocalMidnight),
    )
    .map((w) => {
      const start = parseISO(w.scheduledAt).getTime();
      const end = start + Math.max(1, w.durationMinutes) * 60_000;
      return { start, end };
    });
}

export function findNextAvailableStartIso(args: {
  dayAtLocalMidnight: Date;
  preferredIso: string;
  durationMinutes: number;
  walks: Walk[];
  excludeWalkId?: string;
  now?: Date;
}): string | null {
  const now = args.now ?? new Date();
  const dayStart = args.dayAtLocalMidnight;
  const dayEnd = addDays(dayStart, 1).getTime();
  const durMs = Math.max(1, args.durationMinutes) * 60_000;
  const maxStart = dayEnd - durMs;
  if (maxStart < dayStart.getTime()) return null;

  const preferredMs = parseISO(args.preferredIso).getTime();
  const minStart = isToday(dayStart) ? now.getTime() : dayStart.getTime();
  let t = Math.max(preferredMs, minStart);
  if (t > maxStart) return null;

  const occupied = getOccupiedRangesMsForDay(args.walks, dayStart, args.excludeWalkId);

  for (; t <= maxStart; t += STEP_MS) {
    const end = t + durMs;
    const overlaps = occupied.some((r) =>
      rangesOverlap(t, end, r.start, r.end),
    );
    if (!overlaps) {
      return new Date(t).toISOString();
    }
  }
  return null;
}

export function hasAvailableStartOnDay(args: {
  dayAtLocalMidnight: Date;
  durationMinutes: number;
  walks: Walk[];
  excludeWalkId?: string;
  now?: Date;
}): boolean {
  const now = args.now ?? new Date();
  const minIso = new Date(
    isToday(args.dayAtLocalMidnight)
      ? now.getTime()
      : args.dayAtLocalMidnight.getTime(),
  ).toISOString();
  return (
    findNextAvailableStartIso({
      dayAtLocalMidnight: args.dayAtLocalMidnight,
      preferredIso: minIso,
      durationMinutes: args.durationMinutes,
      walks: args.walks,
      excludeWalkId: args.excludeWalkId,
      now: args.now,
    }) !== null
  );
}

export function rangesOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  return startA < endB && endA > startB;
}

export function getTakenSlotKeysForDay(args: {
  walks: Walk[];
  dayIso: string;
  slotIsos: string[];
  selectedDurationMinutes: number;
  excludeWalkId?: string;
}): Set<string> {
  const { walks, dayIso, slotIsos, selectedDurationMinutes, excludeWalkId } = args;
  const day = parseISO(dayIso);
  const occupiedRanges = walks
    .filter(
      (w) =>
        w.id !== excludeWalkId &&
        (w.status === 'scheduled' || w.status === 'in_progress') &&
        isSameDay(parseISO(w.scheduledAt), day)
    )
    .map((w) => {
      const start = parseISO(w.scheduledAt).getTime();
      const end = start + Math.max(1, w.durationMinutes) * 60_000;
      return { start, end };
    });

  const selectedDurationMs = Math.max(1, selectedDurationMinutes) * 60_000;
  const taken = new Set<string>();
  slotIsos.forEach((slotIso) => {
    const slotStart = parseISO(slotIso).getTime();
    const slotEnd = slotStart + selectedDurationMs;
    const isTaken = occupiedRanges.some((r) => rangesOverlap(slotStart, slotEnd, r.start, r.end));
    if (!isTaken) return;
    const when = parseISO(slotIso);
    taken.add(`${when.getHours()}:${when.getMinutes()}`);
  });
  return taken;
}

export function findOverlappingWalk(args: {
  walks: Walk[];
  startIso: string;
  durationMinutes: number;
  excludeWalkId?: string;
}): Walk | null {
  const { walks, startIso, durationMinutes, excludeWalkId } = args;
  const start = parseISO(startIso);
  if (Number.isNaN(start.getTime())) return null;
  const startMs = start.getTime();
  const endMs = startMs + Math.max(1, durationMinutes) * 60_000;
  for (const w of walks) {
    if (w.id === excludeWalkId) continue;
    if (w.status !== 'scheduled' && w.status !== 'in_progress') continue;
    const wStart = parseISO(w.scheduledAt);
    if (Number.isNaN(wStart.getTime())) continue;
    if (!isSameDay(wStart, start)) continue;
    const wStartMs = wStart.getTime();
    const wEndMs = wStartMs + Math.max(1, w.durationMinutes) * 60_000;
    if (rangesOverlap(startMs, endMs, wStartMs, wEndMs)) return w;
  }
  return null;
}
