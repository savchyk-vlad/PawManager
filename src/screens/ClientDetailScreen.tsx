import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { format, isToday } from 'date-fns';
import { useAppStore } from '../store';
import { RootStackParamList } from '../navigation';
import { Dog, Walk } from '../types';

type Route = RouteProp<RootStackParamList, 'ClientDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const C = {
  bg: '#141412',
  headerBg: '#1D3A22',
  card: '#1D1D1A',
  border: 'rgba(255,255,255,0.07)',
  green: '#2A5730',
  greenText: '#5CAF72',
  amber: '#F0A030',
  amberBg: 'rgba(240,160,48,0.12)',
  red: '#E04040',
  redBg: 'rgba(224,64,64,0.12)',
  text: '#FFFFFF',
  textSub: '#8BA890',
  textMuted: '#606058',
};

const TABS = ['Dogs', 'Walks', 'Info'] as const;
type Tab = typeof TABS[number];

function InfoRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <View style={s.infoRow}>
      <Text style={s.infoKey}>{label}</Text>
      <Text style={s.infoVal} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function DogCard({ dog }: { dog: Dog }) {
  return (
    <View style={s.dogCard}>
      <View style={s.dogCardHeader}>
        <View style={s.dogAvatarLg}>
          <Text style={{ fontSize: 32 }}>{dog.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.dogName}>{dog.name}</Text>
          <Text style={s.dogBreed}>{dog.breed}</Text>
          {(dog.age > 0 || dog.weight > 0) && (
            <Text style={s.dogMeta}>
              {dog.age > 0 ? `${dog.age} yrs` : ''}
              {dog.age > 0 && dog.weight > 0 ? ' · ' : ''}
              {dog.weight > 0 ? `${dog.weight} lbs` : ''}
            </Text>
          )}
        </View>
      </View>

      {dog.traits.length > 0 && (
        <View style={s.traitRow}>
          {dog.traits.map((t) => (
            <View
              key={t.label}
              style={[s.trait, { backgroundColor: t.type === 'positive' ? 'rgba(91,175,114,0.15)' : C.amberBg }]}
            >
              <Text style={[s.traitText, { color: t.type === 'positive' ? C.greenText : C.amber }]}>
                {t.type === 'positive' ? '✓' : '⚠'} {t.label}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={s.dogInfoBlock}>
        {dog.vet ? <InfoRow label="Vet" value={`${dog.vet}${dog.vetPhone ? ` · ${dog.vetPhone}` : ''}`} /> : null}
        {dog.medical ? <InfoRow label="Medical" value={dog.medical} /> : null}
        {dog.keyLocation ? <InfoRow label="Key" value={dog.keyLocation} /> : null}
      </View>
    </View>
  );
}

function WalkRow({ walk, pricePerWalk }: { walk: Walk; pricePerWalk: number }) {
  const date = new Date(walk.scheduledAt);
  const dateLabel = isToday(date)
    ? `Today, ${format(date, 'h:mm a')}`
    : format(date, 'EEE MMM d · h:mm a');

  const statusMap = {
    done:        { label: 'Done',      color: C.greenText,  bg: 'rgba(91,175,114,0.12)' },
    scheduled:   { label: 'Scheduled', color: C.textMuted,  bg: 'rgba(255,255,255,0.06)' },
    in_progress: { label: 'Active',    color: C.amber,      bg: C.amberBg },
    cancelled:   { label: 'Cancelled', color: C.red,        bg: C.redBg },
  };
  const st = statusMap[walk.status] ?? statusMap.scheduled;

  return (
    <View style={s.walkRow}>
      <View style={{ flex: 1 }}>
        <Text style={s.walkDate}>{dateLabel}</Text>
        <Text style={s.walkMeta}>
          {walk.actualDurationMinutes ?? walk.durationMinutes} min · ${pricePerWalk}
          {walk.paymentStatus === 'unpaid' && walk.status === 'done' ? ' · Unpaid' : ''}
        </Text>
      </View>
      <View style={[s.statusBadge, { backgroundColor: st.bg }]}>
        <Text style={[s.statusText, { color: st.color }]}>{st.label}</Text>
      </View>
    </View>
  );
}

export default function ClientDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { clients, walks } = useAppStore();
  const [tab, setTab] = useState<Tab>('Dogs');

  const client = clients.find((c) => c.id === route.params.clientId);
  if (!client) return null;

  const clientWalks = walks
    .filter((w) => w.clientId === client.id)
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));

  const totalEarned = clientWalks
    .filter((w) => w.status === 'done')
    .reduce((sum) => sum + client.pricePerWalk, 0);

  const unpaidCount = clientWalks.filter(
    (w) => w.status === 'done' && w.paymentStatus === 'unpaid'
  ).length;

  const initials = client.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <View style={[s.safe, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor={C.headerBg} />
      <View style={{ height: insets.top, backgroundColor: C.headerBg }} />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color="white" />
        </TouchableOpacity>

        <View style={s.headerBody}>
          <View style={s.avatarLg}>
            <Text style={s.avatarLgText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.clientName}>{client.name}</Text>
            <Text style={s.clientSub}>{client.dogs.map((d) => d.name).join(' & ')}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statNum}>{clientWalks.length}</Text>
            <Text style={s.statLbl}>Total walks</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statNum}>${client.pricePerWalk}</Text>
            <Text style={s.statLbl}>Per walk</Text>
          </View>
          <View style={s.statBox}>
            <Text style={[s.statNum, unpaidCount > 0 && { color: C.amber }]}>
              ${unpaidCount * client.pricePerWalk}
            </Text>
            <Text style={s.statLbl}>Unpaid</Text>
          </View>
        </View>

        {/* Quick actions */}
        <View style={s.actionsRow}>
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => client.phone && Linking.openURL(`tel:${client.phone}`)}
          >
            <Ionicons name="call-outline" size={16} color="white" />
            <Text style={s.actionLabel}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => {
              const addr = encodeURIComponent(client.address);
              Linking.openURL(`maps://maps.google.com/maps?daddr=${addr}`);
            }}
          >
            <Ionicons name="navigate-outline" size={16} color="white" />
            <Text style={s.actionLabel}>Navigate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => navigation.navigate('EditClient', { clientId: client.id })}
          >
            <Ionicons name="create-outline" size={16} color="white" />
            <Text style={s.actionLabel}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Tabs ── */}
      <View style={s.tabBar}>
        {TABS.map((t) => (
          <TouchableOpacity key={t} style={s.tabItem} onPress={() => setTab(t)}>
            <Text style={[s.tabLabel, tab === t && s.tabLabelActive]}>{t}</Text>
            {tab === t && <View style={s.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Content ── */}
      <ScrollView
        style={{ flex: 1, backgroundColor: C.bg }}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'Dogs' && (
          client.dogs.length === 0
            ? <Text style={s.emptyText}>No dogs added yet.</Text>
            : client.dogs.map((dog) => <DogCard key={dog.id} dog={dog} />)
        )}

        {tab === 'Walks' && (
          clientWalks.length === 0
            ? <Text style={s.emptyText}>No walks yet.</Text>
            : (
              <View style={s.card}>
                {clientWalks.map((w, i) => (
                  <React.Fragment key={w.id}>
                    <WalkRow walk={w} pricePerWalk={client.pricePerWalk} />
                    {i < clientWalks.length - 1 && <View style={s.rowDivider} />}
                  </React.Fragment>
                ))}
              </View>
            )
        )}

        {tab === 'Info' && (
          <View style={s.card}>
            <InfoRow label="Phone" value={client.phone} />
            <View style={s.rowDivider} />
            <InfoRow label="Address" value={client.address} />
            <View style={s.rowDivider} />
            <InfoRow label="Price per walk" value={`$${client.pricePerWalk}`} />
            <View style={s.rowDivider} />
            <InfoRow label="Total earned" value={`$${totalEarned}`} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: { backgroundColor: C.headerBg, paddingHorizontal: 16, paddingBottom: 16 },

  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, alignSelf: 'flex-start', marginTop: 12,
  },

  headerBody: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  avatarLg: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarLgText: { fontSize: 20, fontWeight: '700', color: 'white' },
  clientName: { fontSize: 22, fontWeight: '700', color: 'white', letterSpacing: -0.3 },
  clientSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statBox: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12, paddingVertical: 10, alignItems: 'center',
  },
  statNum: { fontSize: 18, fontWeight: '700', color: 'white', marginBottom: 2 },
  statLbl: { fontSize: 10, color: 'rgba(255,255,255,0.55)' },

  actionsRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10, paddingVertical: 10,
  },
  actionLabel: { fontSize: 13, fontWeight: '500', color: 'white' },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: C.headerBg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabLabel: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.45)' },
  tabLabelActive: { color: 'white', fontWeight: '600' },
  tabIndicator: {
    position: 'absolute', bottom: 0,
    height: 2, width: 24, borderRadius: 1,
    backgroundColor: C.greenText,
  },

  content: { padding: 16, paddingBottom: 48 },

  card: { backgroundColor: C.card, borderRadius: 14, overflow: 'hidden' },

  dogCard: {
    backgroundColor: C.card, borderRadius: 14, marginBottom: 12, overflow: 'hidden',
  },
  dogCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 14,
  },
  dogAvatarLg: {
    width: 60, height: 60, borderRadius: 16,
    backgroundColor: '#252820',
    alignItems: 'center', justifyContent: 'center',
  },
  dogName: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 2 },
  dogBreed: { fontSize: 13, color: C.textSub },
  dogMeta: { fontSize: 12, color: C.textMuted, marginTop: 2 },

  traitRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 6,
    paddingHorizontal: 14, paddingBottom: 12,
  },
  trait: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  traitText: { fontSize: 12, fontWeight: '500' },

  dogInfoBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.border,
    paddingHorizontal: 14,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border,
  },
  infoKey: { fontSize: 12, color: C.textMuted, fontWeight: '500' },
  infoVal: { fontSize: 13, color: C.text, textAlign: 'right', flex: 1, marginLeft: 16 },

  walkRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 14,
  },
  walkDate: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 3 },
  walkMeta: { fontSize: 12, color: C.textSub },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 11, fontWeight: '600' },

  rowDivider: { height: StyleSheet.hairlineWidth, backgroundColor: C.border, marginHorizontal: 14 },

  emptyText: { fontSize: 14, color: C.textMuted, textAlign: 'center', paddingTop: 40 },
});
