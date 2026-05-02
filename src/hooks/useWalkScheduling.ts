import { useMemo } from 'react';
import {
  addDays,
  addMinutes,
  endOfMonth,
  parseISO,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import { Walk } from '../types';
import {
  findNextAvailableStartIso,
  hasAvailableStartOnDay,
} from '../lib/schedulingOverlap';
import { localCalendarMidnightFromIso } from '../lib/localCalendar';
import { useSettingsStore } from '../store/settingsStore';

/** Default walk time when opening Add Walk: this many minutes after the current time (today’s first slot). */
const SCHEDULE_DEFAULT_LEAD_MINUTES = 30;

/** Next schedulable start from `now` across upcoming calendar days (minute steps, respects overlaps). */
export function nextWorkingSlotIso(now: Date, walks: Walk[]): string | null {
  const { defaultWalkDuration } = useSettingsStore.getState();
  const dur = defaultWalkDuration;

  for (let i = 0; i < 21; i += 1) {
    const day = addDays(startOfDay(now), i);
    const dayAtMidnight = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      0,
      0,
      0,
      0,
    );
    const preferredIso =
      i === 0
        ? addMinutes(now, SCHEDULE_DEFAULT_LEAD_MINUTES).toISOString()
        : dayAtMidnight.toISOString();
    const found = findNextAvailableStartIso({
      dayAtLocalMidnight: dayAtMidnight,
      preferredIso,
      durationMinutes: dur,
      walks,
      excludeWalkId: undefined,
      now,
    });
    if (found) return found;
  }
  return null;
}

type UseWalkSchedulingArgs = {
  walks: Walk[];
  selectedTime: string;
  monthDate: Date;
  duration: number;
  excludeWalkId?: string;
};

export function useWalkScheduling({
  walks,
  selectedTime,
  monthDate,
  duration,
  excludeWalkId,
}: UseWalkSchedulingArgs) {
  const selectedDay = useMemo(
    () => localCalendarMidnightFromIso(selectedTime),
    [selectedTime],
  );

  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const firstWeekday = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();

  const calendarCells = useMemo(() => {
    const cells: Array<{ type: 'empty' } | { type: 'day'; date: Date }> = [];
    for (let i = 0; i < firstWeekday; i += 1) cells.push({ type: 'empty' });
    for (let d = 1; d <= daysInMonth; d += 1) {
      cells.push({
        type: 'day',
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), d),
      });
    }
    return cells;
  }, [firstWeekday, daysInMonth, monthDate]);

  const noTimeAvailableThisDay = useMemo(
    () =>
      !hasAvailableStartOnDay({
        dayAtLocalMidnight: selectedDay,
        durationMinutes: duration,
        walks,
        excludeWalkId,
      }),
    [selectedDay, duration, walks, excludeWalkId],
  );

  const takenByDayMs = useMemo(() => {
    const map = new Map<number, number>();
    walks.forEach((w) => {
      if (w.id === excludeWalkId) return;
      if (w.status !== 'scheduled' && w.status !== 'in_progress') return;
      const d = parseISO(w.scheduledAt);
      const key = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
      ).getTime();
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return map;
  }, [walks, excludeWalkId]);

  return { selectedDay, calendarCells, takenByDayMs, noTimeAvailableThisDay };
}
