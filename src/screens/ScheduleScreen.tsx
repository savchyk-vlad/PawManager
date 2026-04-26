import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
} from 'react-native';
import { format, startOfWeek, addDays, isToday } from 'date-fns';
import { colors } from '../theme';
import { useAppStore } from '../store';

export default function ScheduleScreen() {
  const { walks, clients } = useAppStore();

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Schedule</Text>
        <Text style={styles.sub}>
          {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </Text>

        {weekDays.map((day) => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const dayWalks = walks
            .filter((w) => w.scheduledAt.startsWith(dayStr))
            .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

          const todayStyle = isToday(day);

          return (
            <View key={dayStr} style={styles.dayBlock}>
              <View style={[styles.dayHeader, todayStyle && styles.dayHeaderToday]}>
                <Text style={[styles.dayName, todayStyle && styles.dayNameToday]}>
                  {format(day, 'EEE')}
                </Text>
                <Text style={[styles.dayNum, todayStyle && styles.dayNumToday]}>
                  {format(day, 'd')}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                {dayWalks.length === 0 ? (
                  <View style={styles.emptyDay}>
                    <Text style={styles.emptyDayText}>—</Text>
                  </View>
                ) : (
                  dayWalks.map((walk) => {
                    const client = clients.find((c) => c.id === walk.clientId);
                    if (!client) return null;
                    const dogs = client.dogs.filter((d) => walk.dogIds.includes(d.id));
                    const statusColors: Record<string, string> = {
                      done: colors.accent,
                      scheduled: colors.gold,
                      in_progress: colors.danger,
                      cancelled: colors.muted,
                    };

                    return (
                      <View key={walk.id} style={styles.walkChip}>
                        <View style={[styles.chipDot, { backgroundColor: statusColors[walk.status] }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.chipDogName}>
                            {dogs.map((d) => d.name).join(' + ')}
                          </Text>
                          <Text style={styles.chipMeta}>
                            {format(new Date(walk.scheduledAt), 'HH:mm')} · {walk.durationMinutes} min · {client.name}
                          </Text>
                        </View>
                        <Text style={[styles.chipStatus, { color: statusColors[walk.status] }]}>
                          {walk.status === 'in_progress' ? 'Active' : walk.status.charAt(0).toUpperCase() + walk.status.slice(1)}
                        </Text>
                      </View>
                    );
                  })
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 2 },
  sub: { fontSize: 12, color: colors.muted, marginBottom: 16 },
  dayBlock: {
    flexDirection: 'row', gap: 12, marginBottom: 10,
  },
  dayHeader: {
    width: 40, alignItems: 'center', paddingTop: 4,
  },
  dayHeaderToday: {},
  dayName: { fontSize: 9, color: colors.muted, fontWeight: '500', textTransform: 'uppercase' },
  dayNameToday: { color: colors.accent, fontWeight: '700' },
  dayNum: {
    fontSize: 18, fontWeight: '600', color: colors.text2,
    width: 36, height: 36, borderRadius: 18,
    textAlign: 'center', lineHeight: 36,
  },
  dayNumToday: {
    backgroundColor: colors.accent, color: '#fff', overflow: 'hidden',
  },
  emptyDay: {
    backgroundColor: colors.surface2, borderRadius: 12,
    padding: 10, justifyContent: 'center', alignItems: 'center',
  },
  emptyDayText: { color: colors.muted, fontSize: 12 },
  walkChip: {
    backgroundColor: colors.white, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 10, paddingVertical: 8,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 6,
  },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipDogName: { fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 1 },
  chipMeta: { fontSize: 10, color: colors.muted },
  chipStatus: { fontSize: 10, fontWeight: '600' },
});
