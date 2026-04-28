import { useEffect, useMemo } from 'react';
import { addDays, endOfMonth, parseISO, startOfDay, startOfMonth } from 'date-fns';
import { Walk } from '../types';
import { getTakenSlotKeysForDay } from '../lib/schedulingOverlap';
import { localCalendarMidnightFromIso } from '../lib/localCalendar';
import { buildWalkTimeSlots } from '../lib/shiftTimeSlots';
import {
  isUserWorkingDay,
  snapToNearestWorkingDay,
} from '../lib/workingDays';
import { useSettingsStore } from '../store/settingsStore';

/** Next schedulable slot from `now`: respects active days, shift hours, and default walk duration. */
export function nextWorkingSlotIso(now: Date): string | null {
  const {
    shiftStart,
    shiftEnd,
    workingDays,
    defaultWalkDuration,
  } = useSettingsStore.getState();
  const dur = defaultWalkDuration;

  for (let i = 0; i < 21; i += 1) {
    const day = addDays(startOfDay(now), i);
    if (!isUserWorkingDay(day, workingDays)) continue;
    const slots = buildWalkTimeSlots(day, shiftStart, shiftEnd, dur);
    if (slots.length === 0) continue;
    const found = slots.find(
      (s) => parseISO(s.iso).getTime() >= now.getTime(),
    );
    if (found) return found.iso;
  }
  return null;
}

type UseWalkSchedulingArgs = {
  walks: Walk[];
  selectedTime: string;
  monthDate: Date;
  duration: number;
  excludeWalkId?: string;
  onSelectedTimeChange: (value: string) => void;
};

export function useWalkScheduling({
  walks,
  selectedTime,
  monthDate,
  duration,
  excludeWalkId,
  onSelectedTimeChange,
}: UseWalkSchedulingArgs) {
  const workingDays = useSettingsStore((s) => s.workingDays);
  const shiftStart = useSettingsStore((s) => s.shiftStart);
  const shiftEnd = useSettingsStore((s) => s.shiftEnd);

  /** Local calendar day for the picked walk (matches month grid cells, not raw UTC ISO day). */
  const selectedDay = useMemo(
    () => localCalendarMidnightFromIso(selectedTime),
    [selectedTime],
  );
  const slots = useMemo(() => {
    return buildWalkTimeSlots(selectedDay, shiftStart, shiftEnd, duration);
  }, [selectedDay, shiftStart, shiftEnd, duration]);

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

  const takenSlotKeys = useMemo(() => {
    return getTakenSlotKeysForDay({
      walks,
      dayIso: selectedTime,
      slotIsos: slots.map((s) => s.iso),
      selectedDurationMinutes: duration,
      excludeWalkId,
    });
  }, [walks, selectedTime, slots, duration, excludeWalkId]);

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

  useEffect(() => {
    const selectedInstant = parseISO(selectedTime);
    const selectedCal = localCalendarMidnightFromIso(selectedTime);

    if (!isUserWorkingDay(selectedCal, workingDays)) {
      const snapped = snapToNearestWorkingDay(selectedCal, workingDays);
      snapped.setHours(
        selectedInstant.getHours(),
        selectedInstant.getMinutes(),
        0,
        0,
      );
      if (snapped.getTime() !== selectedInstant.getTime()) {
        onSelectedTimeChange(snapped.toISOString());
      }
      return;
    }

    if (slots.length === 0) return;

    const selKey = `${selectedInstant.getHours()}:${selectedInstant.getMinutes()}`;
    const slotKeySet = new Set(
      slots.map((s) => {
        const w = parseISO(s.iso);
        return `${w.getHours()}:${w.getMinutes()}`;
      }),
    );

    if (!slotKeySet.has(selKey)) {
      const selectedMs = selectedInstant.getTime();
      const nextSlot =
        slots.find((s) => parseISO(s.iso).getTime() >= selectedMs) ??
        slots[0];
      if (nextSlot) onSelectedTimeChange(nextSlot.iso);
      return;
    }

    const selectedKey = `${selectedInstant.getHours()}:${selectedInstant.getMinutes()}`;
    if (!takenSlotKeys.has(selectedKey)) return;
    const selectedMs = selectedInstant.getTime();
    const isFree = (slot: { iso: string }) => {
      const when = parseISO(slot.iso);
      return !takenSlotKeys.has(`${when.getHours()}:${when.getMinutes()}`);
    };
    const nextFree = slots.find(
      (slot) => parseISO(slot.iso).getTime() > selectedMs && isFree(slot),
    );
    const target = nextFree ?? slots.find(isFree);
    if (target) onSelectedTimeChange(target.iso);
  }, [
    selectedTime,
    workingDays,
    slots,
    takenSlotKeys,
    onSelectedTimeChange,
  ]);

  return { selectedDay, slots, calendarCells, takenSlotKeys, takenByDayMs };
}
