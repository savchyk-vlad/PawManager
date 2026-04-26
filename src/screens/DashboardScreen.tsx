import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { format, differenceInMinutes, isToday } from 'date-fns';
import { useAppStore } from '../store';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList } from '../navigation';
import { Walk } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/** Space so last list rows can scroll above the FAB (fab height + offset from bottom + breathing room). */
const SCROLL_BOTTOM_PAD = 20 + 52 + 28;

const C = {
  bg: '#141412',
  headerBg: '#1D3A22',
  statBox: '#243E2A',
  featuredCard: '#FEF3E8',
  featuredBorder: '#E89828',
  walkListCard: '#1D1D1A',
  divider: 'rgba(255,255,255,0.07)',
  amber: '#F0A030',
  amberBadgeBg: '#FEF0D4',
  amberBadgeText: '#A86010',
  green: '#2A5730',
  greenText: '#6BBF7A',
  text: '#FFFFFF',
  textSub: '#8BA890',
  textDark: '#1A1A12',
  textMutedDark: '#7A6A50',
  avatarBg: '#556655',
  featuredAvatarBg: '#F5E0C0',
  walkAvatarBg: '#252820',
  red: '#E04040',
  startBtnDark: '#2A2A26',
  doneBadgeBorder: '#3A3A36',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function minutesUntil(iso: string) {
  return differenceInMinutes(new Date(iso), new Date());
}

function isWithinNextThirtyMinutes(iso: string) {
  const mins = minutesUntil(iso);
  return mins >= 0 && mins <= 30;
}

/** Today’s non-done walks: order by how close the scheduled time is to now (next / most recent first). */
function sortByClosestToNow(walks: Walk[], nowMs: number) {
  return [...walks].sort(
    (a, b) =>
      Math.abs(new Date(a.scheduledAt).getTime() - nowMs) -
      Math.abs(new Date(b.scheduledAt).getTime() - nowMs)
  );
}

function sortDoneByNewestFirst(walks: Walk[]) {
  return [...walks].sort((a, b) => {
    const fa = a.finishedAt ? new Date(a.finishedAt).getTime() : new Date(a.scheduledAt).getTime();
    const fb = b.finishedAt ? new Date(b.finishedAt).getTime() : new Date(b.scheduledAt).getTime();
    return fb - fa;
  });
}

function formatElapsed(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return [hours, minutes, secs].map((value) => String(value).padStart(2, '0')).join(':');
  }

  return [minutes, secs].map((value) => String(value).padStart(2, '0')).join(':');
}

function UpNextCard({ walk }: { walk: Walk }) {
  const navigation = useNavigation<Nav>();
  const { clients, startWalk } = useAppStore();
  const client = clients.find((c) => c.id === walk.clientId);
  if (!client) return null;
  const dogs = client.dogs.filter((d) => walk.dogIds.includes(d.id));
  const dogNames = dogs.map((d) => d.name).join(' & ');
  const dogEmoji = dogs[0]?.emoji ?? '🐕';
  const time = format(new Date(walk.scheduledAt), 'h:mm a');

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={s.featuredCard}
      onPress={() => navigation.navigate('ActiveWalk', { walkId: walk.id })}
    >
      <View style={s.featuredAvatar}>
        <Text style={{ fontSize: 28 }}>{dogEmoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.featuredName}>{dogNames}</Text>
        <Text style={s.featuredMeta}>
          {client.name} · {time} · {walk.durationMinutes} min
        </Text>
      </View>
      <TouchableOpacity
        style={s.featuredStartBtn}
        onPress={async () => {
          try {
            await startWalk(walk.id);
          } catch (error: any) {
            Alert.alert('Error', error?.message ?? 'Could not start walk.');
          }
        }}
      >
        <Text style={s.featuredStartBtnText}>START</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function ActiveWalkCard({ walk }: { walk: Walk }) {
  const navigation = useNavigation<Nav>();
  const { clients } = useAppStore();
  const client = clients.find((c) => c.id === walk.clientId);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const updateElapsed = () => {
      if (!walk.startedAt) {
        setElapsed(0);
        return;
      }

      const startedAtMs = new Date(walk.startedAt).getTime();
      setElapsed(Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000)));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [walk.startedAt]);

  if (!client) return null;

  const dogs = client.dogs.filter((d) => walk.dogIds.includes(d.id));
  const dogNames = dogs.map((d) => d.name).join(' & ');
  const dogEmoji = dogs[0]?.emoji ?? '🐕';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={s.activeCard}
      onPress={() => navigation.navigate('ActiveWalk', { walkId: walk.id })}
    >
      <View style={s.activeCardTop}>
        <View style={s.activeBadge}>
          <Text style={s.activeBadgeText}>ACTIVE WALK</Text>
        </View>
        <Text style={s.activeTimer}>{formatElapsed(elapsed)}</Text>
      </View>

      <View style={s.activeCardBody}>
        <View style={s.activeAvatar}>
          <Text style={{ fontSize: 28 }}>{dogEmoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.activeName}>{dogNames}</Text>
          <Text style={s.activeMeta}>
            {client.name} · {walk.durationMinutes} min walk
          </Text>
        </View>
        <View style={s.activeChevron}>
          <Ionicons name="arrow-forward" size={18} color={C.text} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function WalkRow({ walk, isLast }: { walk: Walk; isLast: boolean }) {
  const navigation = useNavigation<Nav>();
  const { clients, startWalk } = useAppStore();
  const client = clients.find((c) => c.id === walk.clientId);
  if (!client) return null;
  const dogs = client.dogs.filter((d) => walk.dogIds.includes(d.id));
  const dogNames = dogs.map((d) => d.name).join(' & ');
  const dogEmoji = dogs[0]?.emoji ?? '🐕';
  const time = format(new Date(walk.scheduledAt), 'h:mm a');
  const isDone = walk.status === 'done';

  return (
    <View style={[s.walkRow, !isLast && s.walkRowBorder]}>
      <View style={s.walkAvatar}>
        <Text style={{ fontSize: 20 }}>{dogEmoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.walkName}>{dogNames}</Text>
        <Text style={s.walkMeta}>
          {client.name} · {time} · {walk.durationMinutes} min
        </Text>
      </View>
      {isDone ? (
        <View style={s.doneBadge}>
          <Text style={s.doneBadgeText}>Done ✓</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={s.startBtn}
          onPress={async () => {
            try {
              await startWalk(walk.id);
            } catch (error: any) {
              Alert.alert('Error', error?.message ?? 'Could not start walk.');
            }
          }}
        >
          <Text style={s.startBtnText}>START</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { walks, clients, clientsLoading } = useAppStore();
  const { user } = useAuthStore();

  const fullName = (user?.user_metadata?.full_name as string | undefined) ?? '';
  const firstName = fullName.split(' ')[0] || 'there';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  const clientIds = new Set(clients.map((c) => c.id));
  const now = new Date();
  const nowMs = now.getTime();

  const todayWalks = walks
    .filter((w) => isToday(new Date(w.scheduledAt)) && clientIds.has(w.clientId))
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  const earnedToday = todayWalks
    .filter((w) => w.status === 'done')
    .reduce((sum, w) => sum + (clients.find((c) => c.id === w.clientId)?.pricePerWalk ?? 0), 0);

  const unpaidWalks = walks.filter((w) => w.paymentStatus === 'unpaid' && w.status === 'done');
  const totalUnpaid = unpaidWalks.reduce(
    (sum, w) => sum + (clients.find((c) => c.id === w.clientId)?.pricePerWalk ?? 0), 0
  );
  const unpaidClientCount = new Set(unpaidWalks.map((w) => w.clientId)).size;

  const activeWalks = todayWalks.filter((w) => w.status === 'in_progress');
  const upNext = todayWalks.find((w) => w.status === 'scheduled' && isWithinNextThirtyMinutes(w.scheduledAt));

  const activeWalkIds = new Set(activeWalks.map((walk) => walk.id));
  const listWalks = sortByClosestToNow(
    todayWalks.filter(
      (w) =>
        w.status !== 'done' &&
        !activeWalkIds.has(w.id) &&
        w.id !== upNext?.id
    ),
    nowMs
  );
  const doneTodayWalks = sortDoneByNewestFirst(
    todayWalks.filter((w) => w.status === 'done')
  );
  const insets = useSafeAreaInsets();

  if (clientsLoading && clients.length === 0) {
    return (
      <View style={[s.safe, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={C.greenText} size="large" />
      </View>
    );
  }

  return (
    <View style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.headerBg} />
      <View style={{ height: insets.top, backgroundColor: C.headerBg }} />
      {/* ── Header (fixed) ── */}
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.greeting}>{getGreeting()}</Text>
          <Text style={s.name}>{firstName} 👋</Text>
          <Text style={s.date}>{format(new Date(), 'EEEE, MMMM d')}</Text>
        </View>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initials}</Text>
        </View>
      </View>

      {/* ── Stats (fixed) ── */}
      <View style={s.statsRow}>
        <View style={s.statBox}>
          <Text style={s.statNum}>{todayWalks.length}</Text>
          <Text style={s.statLbl}>Walks today</Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statNum}>${earnedToday}</Text>
          <Text style={s.statLbl}>Earned today</Text>
        </View>
        <View style={s.statBox}>
          <Text style={[s.statNum, { color: C.amber }]}>${totalUnpaid}</Text>
          <Text style={s.statLbl}>Unpaid</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: C.bg }}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 0) + SCROLL_BOTTOM_PAD }}
      >

        {/* ── Content ── */}
        <View style={s.content}>

          {/* Active walk */}
          {activeWalks.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionLabel}>ACTIVE NOW</Text>
              </View>
              <View style={s.activeWalksList}>
                {activeWalks.map((walk) => (
                  <View key={walk.id} style={s.activeWalkItem}>
                    <ActiveWalkCard walk={walk} />
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Up next */}
          {upNext && (
            <View style={{ marginBottom: 24 }}>
              <View style={s.upNextBadge}>
                <Text style={s.upNextBadgeText}>⚡ Up next</Text>
              </View>
              <UpNextCard walk={upNext} />
            </View>
          )}

          {/* Today's walks (not completed) — closest scheduled time to now first */}
          {listWalks.length > 0 && (
            <View style={{ marginBottom: doneTodayWalks.length > 0 ? 24 : 0 }}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionLabel}>TODAY'S WALKS</Text>
                <TouchableOpacity>
                  <Text style={s.seeAll}>See all</Text>
                </TouchableOpacity>
              </View>

              <View style={s.walkListCard}>
                {listWalks.map((w, i) => (
                  <WalkRow key={w.id} walk={w} isLast={i === listWalks.length - 1} />
                ))}
              </View>
            </View>
          )}

          {/* Completed today — bottom section */}
          {doneTodayWalks.length > 0 && (
            <View>
              <View style={s.sectionHeader}>
                <Text style={s.sectionLabel}>COMPLETED</Text>
              </View>
              <View style={s.walkListCard}>
                {doneTodayWalks.map((w, i) => (
                  <WalkRow key={w.id} walk={w} isLast={i === doneTodayWalks.length - 1} />
                ))}
              </View>
            </View>
          )}

          {totalUnpaid > 0 && (
            <View style={[s.walkListCard, { marginTop: 16 }]}>
              <View style={s.unpaidBar}>
                <View style={s.unpaidDot} />
                <Text style={s.unpaidText}>
                  {unpaidClientCount} client{unpaidClientCount !== 1 ? 's' : ''} owe you{' '}
                  <Text style={{ color: C.amber }}>${totalUnpaid}</Text>
                </Text>
                <TouchableOpacity>
                  <Text style={s.unpaidView}>View →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {todayWalks.length === 0 && (
            <View style={s.empty}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🐾</Text>
              <Text style={s.emptyText}>No walks scheduled today</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={s.fab} onPress={() => navigation.navigate('AddWalk')}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    backgroundColor: C.headerBg,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  greeting: { fontSize: 14, color: C.textSub, marginBottom: 2 },
  name: { fontSize: 28, fontWeight: '700', color: C.text, letterSpacing: -0.5, marginBottom: 2 },
  date: { fontSize: 13, color: C.textSub, marginBottom: 20 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.avatarBg,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '600', color: C.text },

  // Stats
  statsRow: {
    backgroundColor: C.headerBg,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: C.statBox,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  statNum: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 2 },
  statLbl: { fontSize: 10, color: C.textSub, textAlign: 'center' },

  // Content
  content: { padding: 16, paddingBottom: 40 },

  // Up next
  upNextBadge: {
    alignSelf: 'flex-start',
    backgroundColor: C.amberBadgeBg,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 10,
  },
  upNextBadgeText: { fontSize: 12, fontWeight: '600', color: C.amberBadgeText },

  featuredCard: {
    backgroundColor: C.featuredCard,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: C.featuredBorder,
    borderWidth: 1,
    borderColor: 'rgba(232,152,40,0.2)',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featuredAvatar: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: C.featuredAvatarBg,
    alignItems: 'center', justifyContent: 'center',
  },
  featuredName: { fontSize: 16, fontWeight: '700', color: C.textDark, marginBottom: 3 },
  featuredMeta: { fontSize: 12, color: C.textMutedDark },
  featuredStartBtn: {
    backgroundColor: C.green,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  featuredStartBtnText: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },

  activeCard: {
    backgroundColor: C.green,
    borderRadius: 24,
    padding: 18,
  },
  activeWalksList: {
    gap: 12,
  },
  activeWalkItem: {
    width: '100%',
  },
  activeCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  activeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.88)',
    letterSpacing: 0.8,
  },
  activeTimer: {
    fontSize: 28,
    fontWeight: '700',
    color: C.text,
    letterSpacing: 1,
  },
  activeCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  activeAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeName: {
    fontSize: 22,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -0.4,
    marginBottom: 3,
  },
  activeMeta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.82)',
  },
  activeChevron: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 11, fontWeight: '600', letterSpacing: 1.2, color: C.textSub,
  },
  seeAll: { fontSize: 13, color: C.greenText, fontWeight: '500' },

  // Walk list card
  walkListCard: {
    backgroundColor: C.walkListCard,
    borderRadius: 16,
    overflow: 'hidden',
  },
  walkRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 14, gap: 12,
  },
  walkRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.divider,
  },
  walkAvatar: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: C.walkAvatarBg,
    alignItems: 'center', justifyContent: 'center',
  },
  walkName: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 3 },
  walkMeta: { fontSize: 11, color: C.textSub },
  startBtn: {
    backgroundColor: C.startBtnDark,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  startBtnText: { color: C.text, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  doneBadge: {
    borderWidth: 1,
    borderColor: C.doneBadgeBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  doneBadgeText: { color: C.greenText, fontSize: 11, fontWeight: '600' },

  // Unpaid bar
  unpaidBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.divider,
    gap: 8,
  },
  unpaidDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.red },
  unpaidText: { flex: 1, fontSize: 13, color: C.text },
  unpaidView: { fontSize: 13, color: C.greenText, fontWeight: '500' },

  // Empty
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14, color: C.textSub },

  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
