import { parseISO } from 'date-fns';

/**
 * Local midnight on the calendar day this instant falls on in the device timezone.
 * Matches grid cells built as `new Date(year, monthIndex, day)` for scheduling UIs.
 */
export function localCalendarMidnightFromIso(iso: string): Date {
  const d = parseISO(iso);
  if (Number.isNaN(d.getTime())) {
    return new Date(NaN);
  }
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
