import React, { useMemo, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions,
  LayoutAnimation, Platform, UIManager, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  addDays,
} from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { isScheduledWalkPastEndTime, isWalkLateToStart } from '../../lib/missedWalksService';
import { useAppStore } from '../../store';
import { Walk } from '../../types';
import { RootStackParamList } from '../../navigation';
import { WalkListCard } from '../../components/WalkListCard';
import { chunkIntoRows, padCalendarToFullWeeks } from '../../lib/calendarWeekRows';
import { colors } from '../../theme';
import { ScheduleHeader } from './components/ScheduleHeader';
import { ScheduleCalendarSection } from './components/ScheduleCalendarSection';
import { ScheduleDayCarouselSection } from './components/ScheduleDayCarouselSection';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ScheduleScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { walks, clients } = useAppStore();
  const [monthDate, setMonthDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [openHours, setOpenHours] = useState<Record<string, boolean>>({});
  const { width: screenW } = useWindowDimensions();

  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const firstWeekday = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();

  const dayCells = useMemo(() => {
    const cells: Array<{ type: 'empty' } | { type: 'day'; date: Date }> = [];
    for (let i = 0; i < firstWeekday; i += 1) cells.push({ type: 'empty' });
    for (let d = 1; d <= daysInMonth; d += 1) {
      cells.push({ type: 'day', date: new Date(monthDate.getFullYear(), monthDate.getMonth(), d) });
    }
    return cells;
  }, [firstWeekday, daysInMonth, monthDate]);

  const scheduleWeekRows = useMemo(() => {
    const padded = padCalendarToFullWeeks(dayCells);
    return chunkIntoRows(padded, 7);
  }, [dayCells]);

  const selectedWalks = useMemo(() => {
    if (!selectedDate) return [];
    return walks
      .filter((w) => isSameDay(parseISO(w.scheduledAt), selectedDate))
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  }, [walks, selectedDate]);

  const walksByHour = useMemo(() => {
    const groups = new Map<string, Walk[]>();
    selectedWalks.forEach((walk) => {
      const d = parseISO(walk.scheduledAt);
      const key = format(d, 'h:mm a');
      const existing = groups.get(key) ?? [];
      existing.push(walk);
      groups.set(key, existing);
    });
    return Array.from(groups.entries()).map(([hourLabel, hourWalks]) => ({ hourLabel, walks: hourWalks }));
  }, [selectedWalks]);

  const getDogsText = (walk: Walk) => {
    const client = clients.find((c) => c.id === walk.clientId);
    const dogs = client?.dogs.filter((d) => walk.dogIds.includes(d.id)) ?? [];
    return dogs.map((d) => d.name).join(' + ') || 'Walk';
  };

  const walkCountForDate = (date: Date) =>
    walks.filter((w) => isSameDay(parseISO(w.scheduledAt), date)).length;

  const toggleHour = (hourLabel: string) => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenHours((prev) => {
      const nextOpen = !prev[hourLabel];
      // Accordion behavior: only one section open at a time.
      return nextOpen ? { [hourLabel]: true } : {};
    });
  };

  const changeMonth = (delta: -1 | 1) => {
    const next = delta < 0 ? subMonths(monthDate, 1) : addMonths(monthDate, 1);
    const now = new Date();
    const isCurrentMonth =
      next.getFullYear() === now.getFullYear() && next.getMonth() === now.getMonth();
    setMonthDate(next);
    if (isCurrentMonth) {
      setSelectedDate(now);
    } else {
      setSelectedDate(null);
    }
    setOpenHours({});
  };

  const moveSelectedDay = (delta: -1 | 1) => {
    const base = selectedDate ?? new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const next = addDays(base, delta);
    setSelectedDate(next);
    setMonthDate(new Date(next.getFullYear(), next.getMonth(), 1));
    setOpenHours({});
  };

  const carouselBaseDay = selectedDate ?? new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const carouselDays =
    selectedDate != null
      ? [addDays(selectedDate, -1), selectedDate, addDays(selectedDate, 1)]
      : [
          addDays(carouselBaseDay, -1),
          carouselBaseDay,
          addDays(carouselBaseDay, 1),
        ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScheduleHeader
        monthLabel={format(monthDate, 'MMMM yyyy')}
        onAddPress={() =>
          navigation.navigate('AddWalk', {
            preselectedDateIso: (selectedDate ?? new Date()).toISOString(),
          })
        }
      />

      <ScheduleCalendarSection
        monthDate={monthDate}
        weekRows={scheduleWeekRows}
        selectedDate={selectedDate}
        walkCountForDate={walkCountForDate}
        onChangeMonth={changeMonth}
        onSelectDate={(date) => {
          setSelectedDate(date);
          setOpenHours({});
        }}
      />

      <ScheduleDayCarouselSection
        selectedDate={selectedDate}
        screenW={screenW}
        carouselDays={carouselDays}
        walks={walks}
        clients={clients}
        openHours={openHours}
        onToggleHour={toggleHour}
        onMoveSelectedDay={moveSelectedDay}
        getDogsText={getDogsText}
        onWalkPress={(walk) => {
          if (walk.status === 'scheduled' && isScheduledWalkPastEndTime(walk)) {
            navigation.navigate('Tabs', { screen: 'Walks' });
            return;
          }
          navigation.navigate('ActiveWalk', { walkId: walk.id });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  title: { fontSize: 30, fontWeight: '700', color: colors.text, letterSpacing: -1 },
  sub: { fontSize: 12, color: colors.textSecondary, marginTop: 3 },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.greenDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarWrap: {
    backgroundColor: colors.surface,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  calNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  calArrow: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHigh,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  calMonth: { fontSize: 14, fontWeight: '600', color: colors.text },
  weekDays: { flexDirection: 'row', marginBottom: 6 },
  weekDayTxt: { flex: 1, textAlign: 'center', fontSize: 10, color: colors.textMuted, fontWeight: '500' },
  calGrid: { width: '100%' },
  calWeekRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 2,
  },
  dayEmpty: { flex: 1, height: 40 },
  dayCell: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 10,
    paddingTop: 4,
  },
  dayCellSelected: { backgroundColor: '#182410' },
  dayCellMuted: { opacity: 0.38 },
  dayNum: { fontSize: 12, color: colors.textSecondary, width: 24, height: 24, textAlign: 'center', lineHeight: 24 },
  dayNumMuted: { color: colors.textMuted },
  dayNumToday: {
    backgroundColor: colors.greenDeep,
    color: colors.greenText,
    borderRadius: 12,
    overflow: 'hidden',
    fontWeight: '700',
    fontSize: 11,
  },
  dayNumSelected: { color: colors.greenDefault, fontWeight: '700' },
  dotRow: { flexDirection: 'row', gap: 2, minHeight: 5, marginTop: 3 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.greenDeep },
});
