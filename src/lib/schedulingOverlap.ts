import { isSameDay, parseISO } from 'date-fns';
import { Walk } from '../types';

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
