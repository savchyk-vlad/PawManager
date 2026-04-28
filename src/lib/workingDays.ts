/**
 * Maps `Date.getDay()` (0 Sun … 6 Sat) to `settingsStore.workingDays` indices (0 Mon … 6 Sun).
 */
export function jsWeekdayToWorkingIndex(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function isUserWorkingDay(date: Date, workingDays: boolean[]): boolean {
  const i = jsWeekdayToWorkingIndex(date.getDay());
  return Boolean(workingDays[i]);
}

/** Walk from `start` one calendar step in `direction`, then continue until a working day or `maxSteps`. */
export function nearestWorkingDay(
  start: Date,
  direction: 1 | -1,
  workingDays: boolean[],
  maxSteps = 14,
): Date {
  const d = new Date(start);
  d.setDate(d.getDate() + direction);
  for (let s = 0; s < maxSteps; s += 1) {
    if (isUserWorkingDay(d, workingDays)) return new Date(d);
    d.setDate(d.getDate() + direction);
  }
  return new Date(start);
}

/** If `date` is already a working day, return a copy; else choose the nearest working day (ties → forward). */
export function snapToNearestWorkingDay(date: Date, workingDays: boolean[]): Date {
  if (isUserWorkingDay(date, workingDays)) return new Date(date);

  for (let dist = 1; dist <= 14; dist += 1) {
    const later = new Date(date);
    later.setDate(later.getDate() + dist);
    if (isUserWorkingDay(later, workingDays)) return later;
    const earlier = new Date(date);
    earlier.setDate(earlier.getDate() - dist);
    if (isUserWorkingDay(earlier, workingDays)) return earlier;
  }
  return new Date(date);
}
