import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput, StatusBar,
} from 'react-native';
import { FormKeyboardFlatList } from '../components/FormKeyboardScrollView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store';
import { RootStackParamList } from '../navigation';
import { Client } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const C = {
  bg: '#141412',
  headerBg: '#1D3A22',
  card: '#1D1D1A',
  border: 'rgba(255,255,255,0.07)',
  green: '#2A5730',
  greenText: '#5CAF72',
  amber: '#F0A030',
  red: '#E04040',
  redBg: 'rgba(224,64,64,0.12)',
  text: '#FFFFFF',
  textSub: '#8BA890',
  textMuted: '#606058',
  inputBg: '#1D1D1A',
  avatarBg: '#252820',
};

const AVATAR_COLORS = ['#1F3D28', '#2A3520', '#1E2F3A', '#2E2A1A', '#2A1F30'];

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function ClientCard({ client, index }: { client: Client; index: number }) {
  const navigation = useNavigation<Nav>();
  const { walks } = useAppStore();

  const unpaidAmount = walks
    .filter((w) => w.clientId === client.id && w.paymentStatus === 'unpaid' && w.status === 'done')
    .reduce((sum, w) => sum + client.pricePerWalk, 0);

  const dogNames = client.dogs.map((d) => d.name).join(' & ');
  const avatarBg = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <TouchableOpacity
      style={s.card}
      onPress={() => navigation.navigate('ClientDetail', { clientId: client.id })}
      activeOpacity={0.7}
    >
      <View style={[s.avatar, { backgroundColor: avatarBg }]}>
        <Text style={s.avatarText}>{initials(client.name)}</Text>
      </View>

      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.clientName} numberOfLines={1}>{client.name}</Text>
        <Text style={s.clientMeta} numberOfLines={1}>
          {dogNames} · ${client.pricePerWalk}/walk
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {unpaidAmount > 0 && (
          <View style={s.unpaidBadge}>
            <Text style={s.unpaidText}>${unpaidAmount} owed</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={16} color={C.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

export default function ClientsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { clients } = useAppStore();
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? clients.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.dogs.some((d) => d.name.toLowerCase().includes(query.toLowerCase()))
      )
    : clients;

  return (
    <View style={[s.safe, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor={C.headerBg} />
      <View style={{ height: insets.top, backgroundColor: C.headerBg }} />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.title}>Clients</Text>
          <Text style={s.subtitle}>{clients.length} active</Text>
        </View>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <Ionicons name="search-outline" size={16} color={C.textMuted} />
          <TextInput
            style={s.searchInput}
            placeholder="Search clients or dogs…"
            placeholderTextColor={C.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={16} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      <FormKeyboardFlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <ClientCard client={item} index={index} />}
        contentContainerStyle={s.listContent}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        viewIsInsideTabBar
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>🐾</Text>
            <Text style={s.emptyText}>No clients found</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={s.separator} />}
      />

      {/* FAB */}
      <TouchableOpacity style={s.fab} onPress={() => navigation.navigate('AddClient')}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    backgroundColor: C.headerBg,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: { fontSize: 28, fontWeight: '700', color: C.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: C.textSub, marginTop: 2 },

  searchWrap: { backgroundColor: C.headerBg, paddingHorizontal: 16, paddingBottom: 16 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.text },

  listContent: { padding: 16, paddingBottom: 100 },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 14,
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: C.text },
  clientName: { fontSize: 15, fontWeight: '600', color: C.text, marginBottom: 3 },
  clientMeta: { fontSize: 12, color: C.textSub },

  unpaidBadge: {
    backgroundColor: C.redBg,
    borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  unpaidText: { fontSize: 11, fontWeight: '600', color: C.red },

  separator: { height: 8 },

  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 14, color: C.textMuted },

  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 52, height: 52,
    borderRadius: 16,
    backgroundColor: C.green,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
