import { addMinutes, isAfter, isBefore, isValid, parseISO } from 'date-fns';
import { Walk } from '../types';

export function isScheduledWalkPastEndTime(w: Walk, now: Date = new Date()): boolean {
  if (w.status !== 'scheduled') return false;
  const t = parseISO(w.scheduledAt);
  if (!isValid(t)) return false;
  const end = addMinutes(t, w.durationMinutes);
  return isBefore(end, now);
}

export function isWalkLateToStart(w: Walk, now: Date = new Date()): boolean {
  if (w.status !== 'scheduled') return false;
  const start = parseISO(w.scheduledAt);
  if (!isValid(start)) return false;
  const end = addMinutes(start, w.durationMinutes);
  if (!isAfter(now, start)) return false;
  if (isAfter(now, end)) return false;
  return true;
}

export function getWalkWindowEndTime(w: Walk): Date | null {
  if (w.status !== 'scheduled') return null;
  const start = parseISO(w.scheduledAt);
  if (!isValid(start)) return null;
  return addMinutes(start, w.durationMinutes);
}
