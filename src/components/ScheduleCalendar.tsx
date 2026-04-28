import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addMonths, endOfMonth, format, isSameDay, isToday, parseISO, startOfDay, subMonths } from 'date-fns';
import { chunkIntoRows, padCalendarToFullWeeks } from '../lib/calendarWeekRows';
import { localCalendarMidnightFromIso } from '../lib/localCalendar';
import {
  isUserWorkingDay,
  snapToNearestWorkingDay,
} from '../lib/workingDays';
import { useSettingsStore } from '../store/settingsStore';
import { colors } from '../theme';

type CalendarCell = { type: 'empty' } | { type: 'day'; date: Date };

type Props = {
  monthDate: Date;
  selectedTime: string;
  calendarCells: CalendarCell[];
  takenByDayMs: Map<number, number>;
  onMonthDateChange: (value: Date) => void;
  onSelectedTimeChange: (value: string) => void;
  onPickDate?: () => void;
};

export function ScheduleCalendar({
  monthDate,
  selectedTime,
  calendarCells,
  takenByDayMs,
  onMonthDateChange,
  onSelectedTimeChange,
  onPickDate,
}: Props) {
  const workingDays = useSettingsStore((s) => s.workingDays);
  const selectedCalendarDay = localCalendarMidnightFromIso(selectedTime);

  const weekRows = useMemo(() => {
    const padded = padCalendarToFullWeeks(calendarCells);
    return chunkIntoRows(padded, 7);
  }, [calendarCells]);

  const applyDayToSelectedTime = (date: Date) => {
    const current = parseISO(selectedTime);
    const next = new Date(date);
    next.setHours(current.getHours(), current.getMinutes(), 0, 0);
    onSelectedTimeChange(next.toISOString());
    onPickDate?.();
  };

  const shiftMonthWithSelectedDay = (delta: -1 | 1) => {
    const selected = parseISO(selectedTime);
    const targetMonth = delta > 0 ? addMonths(monthDate, 1) : subMonths(monthDate, 1);
    const maxDayInTarget = endOfMonth(targetMonth).getDate();
    const targetDay = Math.min(selected.getDate(), maxDayInTarget);
    let next = new Date(targetMonth);
    next.setDate(targetDay);
    if (!isUserWorkingDay(next, workingDays)) {
      next = snapToNearestWorkingDay(next, workingDays);
    }
    next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    onMonthDateChange(targetMonth);
    onSelectedTimeChange(next.toISOString());
    onPickDate?.();
  };

  return (
    <View style={s.calWrap}>
      <View style={s.calNav}>
        <TouchableOpacity style={s.calArrow} onPress={() => shiftMonthWithSelectedDay(-1)}>
          <Ionicons name="chevron-back" size={20} color={colors.greenDefault} />
        </TouchableOpacity>
        <Text style={s.calMonth}>{format(monthDate, 'MMMM yyyy')}</Text>
        <TouchableOpacity style={s.calArrow} onPress={() => shiftMonthWithSelectedDay(1)}>
          <Ionicons name="chevron-forward" size={20} color={colors.greenDefault} />
        </TouchableOpacity>
      </View>
      <View style={s.calWeekdays}>
        {['Su', 'M', 'T', 'W', 'T', 'F', 'Sa'].map((d, i) => (
          <Text key={`${d}-${i}`} style={s.calWeekday}>{d}</Text>
        ))}
      </View>
      <View style={s.calGrid}>
        {weekRows.map((row, wi) => (
          <View key={`week-${wi}`} style={s.calWeekRow}>
            {row.map((cell, di) => {
              const idx = wi * 7 + di;
              if (cell.type === 'empty') {
                return <View key={`e-${idx}`} style={s.calDayEmpty} />;
              }
              const selected = isSameDay(cell.date, selectedCalendarDay);
              const today = isToday(cell.date);
              const takenCount =
                takenByDayMs.get(startOfDay(cell.date).getTime()) ?? 0;
              const hasTaken = takenCount > 0;
              const allowed = isUserWorkingDay(cell.date, workingDays);
              return (
                <TouchableOpacity
                  key={format(cell.date, 'yyyy-MM-dd')}
                  style={[
                    s.calDay,
                    selected && s.calDaySelected,
                    !allowed && s.calDayDisabled,
                  ]}
                  disabled={!allowed}
                  onPress={() => allowed && applyDayToSelectedTime(cell.date)}
                  activeOpacity={allowed ? 0.8 : 1}
                >
                  <Text
                    style={[
                      s.calDayNum,
                      today && s.calDayNumToday,
                      selected && s.calDayNumSelected,
                      !allowed && s.calDayNumDisabled,
                    ]}
                  >
                    {format(cell.date, 'd')}
                  </Text>
                  {hasTaken && (
                    <View style={[s.calTakenDot, selected && s.calTakenDotSelected]}>
                      <Text style={s.calTakenDotText}>
                        {takenCount > 9 ? '9+' : String(takenCount)}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  calWrap: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 12,
  },
  calNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  calArrow: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#252522',
    borderWidth: 1, borderColor: colors.border,
  },
  calMonth: { fontSize: 13, fontWeight: '600', color: colors.text },
  calWeekdays: { flexDirection: 'row', marginBottom: 4 },
  calWeekday: { flex: 1, textAlign: 'center', fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  calGrid: { width: '100%' },
  calWeekRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 2,
  },
  calDayEmpty: { flex: 1, height: 36 },
  calDay: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  calDaySelected: { backgroundColor: colors.greenDeep },
  calDayDisabled: { opacity: 0.38 },
  calDayNum: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  calDayNumDisabled: { color: colors.textMuted },
  calDayNumToday: {
    backgroundColor: colors.greenDeep,
    color: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    minWidth: 20,
    textAlign: 'center',
  },
  calDayNumSelected: { color: colors.greenDefault, fontWeight: '700' },
  calTakenDot: {
    position: 'absolute',
    right: 3,
    top: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.amberDefault,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  calTakenDotSelected: { backgroundColor: colors.amberDefault },
  calTakenDotText: {
    fontSize: 9,
    lineHeight: 10,
    fontWeight: '700',
    color: '#fff',
  },
});
