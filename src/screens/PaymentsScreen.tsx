import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { format } from 'date-fns';
import { colors, design, radius } from '../theme';
import { useAppStore } from '../store';
import { Client, Walk } from '../types';

type UnpaidEntry = {
  client: Client;
  unpaidWalks: Walk[];
  total: number;
  last: Walk;
};

const AVATAR_TONES = [
  { bg: '#FDECEA', text: '#C0392B' },
  { bg: '#E6F1FB', text: '#185FA5' },
  { bg: '#EEEDFE', text: '#534AB7' },
  { bg: '#E8F3EA', text: '#2A5730' },
];

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function currency(amount: number) {
  return `$${amount.toFixed(2)}`;
}

function PaymentRow({
  entry,
  index,
  onMarkPaid,
}: {
  entry: UnpaidEntry;
  index: number;
  onMarkPaid: (clientId: string, amount: number, name: string) => void;
}) {
  const tone = AVATAR_TONES[index % AVATAR_TONES.length];
  const { client, unpaidWalks, total, last } = entry;

  return (
    <View style={styles.paymentRow}>
      <View style={[styles.avatar, { backgroundColor: tone.bg }]}>
        <Text style={[styles.avatarText, { color: tone.text }]}>{initials(client.name)}</Text>
      </View>

      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{client.name}</Text>
        <Text style={styles.rowMeta}>
          {unpaidWalks.length} walk{unpaidWalks.length === 1 ? '' : 's'} · last{' '}
          {format(new Date(last.scheduledAt), 'MMM d')}
        </Text>
      </View>

      <View style={styles.rowRight}>
        <Text style={styles.rowAmount}>{currency(total)}</Text>
        <TouchableOpacity
          style={styles.markPaidBtn}
          onPress={() => onMarkPaid(client.id, total, client.name)}
          activeOpacity={0.85}
        >
          <Text style={styles.markPaidText}>Mark paid</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function PaymentsScreen() {
  const { walks, clients, markClientPaid } = useAppStore();

  const now = new Date();
  const monthLabel = format(now, 'MMMM yyyy');

  const unpaidByClient = clients
    .map((client) => {
      const unpaidWalks = walks.filter(
        (walk) => walk.clientId === client.id && walk.paymentStatus === 'unpaid' && walk.status === 'done'
      );
      if (unpaidWalks.length === 0) return null;

      const total = unpaidWalks.length * client.pricePerWalk;
      const last = [...unpaidWalks].sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))[0];
      return { client, unpaidWalks, total, last };
    })
    .filter((entry): entry is UnpaidEntry => entry !== null)
    .sort((a, b) => b.total - a.total);

  const totalUnpaid = unpaidByClient.reduce((sum, entry) => sum + entry.total, 0);
  const unpaidWalkCount = unpaidByClient.reduce((sum, entry) => sum + entry.unpaidWalks.length, 0);

  const thisMonthPrefix = format(now, 'yyyy-MM');
  const paidThisMonthWalks = walks.filter(
    (walk) =>
      walk.status === 'done' &&
      walk.paymentStatus === 'paid' &&
      walk.scheduledAt.startsWith(thisMonthPrefix)
  );
  const earnedThisMonth = paidThisMonthWalks.reduce(
    (sum, walk) => sum + (clients.find((client) => client.id === walk.clientId)?.pricePerWalk ?? 0),
    0
  );

  const handleMarkPaid = (clientId: string, amount: number, name: string) => {
    Alert.alert(
      'Mark as Paid',
      `Mark ${currency(amount)} from ${name} as paid?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Paid',
          onPress: async () => {
            try {
              await markClientPaid(clientId);
            } catch (error: any) {
              Alert.alert('Error', error?.message ?? 'Could not mark walks as paid.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Payments</Text>
          <Text style={styles.subtitle}>{monthLabel}</Text>
        </View>

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>TOTAL OUTSTANDING</Text>
          <Text style={styles.totalValue}>{currency(totalUnpaid)}</Text>
          <Text style={styles.totalSub}>
            Across {unpaidByClient.length} client{unpaidByClient.length === 1 ? '' : 's'} ·{' '}
            {unpaidWalkCount} walk{unpaidWalkCount === 1 ? '' : 's'} unpaid
          </Text>
        </View>

        {unpaidByClient.length > 0 ? (
          <View style={styles.listBlock}>
            {unpaidByClient.map((entry, index) => (
              <PaymentRow
                key={entry.client.id}
                entry={entry}
                index={index}
                onMarkPaid={handleMarkPaid}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>✓</Text>
            <Text style={styles.emptyTitle}>Everything is paid up</Text>
            <Text style={styles.emptyText}>No outstanding balances right now.</Text>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Paid this month</Text>
        </View>

        <View style={styles.monthCard}>
          <View>
            <Text style={styles.monthName}>{monthLabel}</Text>
            <Text style={styles.monthMeta}>
              {paidThisMonthWalks.length} walk{paidThisMonthWalks.length === 1 ? '' : 's'}
            </Text>
          </View>
          <Text style={styles.monthAmount}>{currency(earnedThisMonth)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141412',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    letterSpacing: -0.5,
    color: '#FFFFFF',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14,
    color: '#8BA890',
  },
  totalBox: {
    backgroundColor: '#1D3A22',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(107,191,122,0.16)',
    padding: 18,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.62)',
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.8,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  totalSub: {
    fontSize: 13,
    color: '#8BA890',
  },
  listBlock: {
    marginBottom: 24,
  },
  paymentRow: {
    backgroundColor: '#1D1D1A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.sm,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
  },
  rowInfo: {
    flex: 1,
    minWidth: 0,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rowMeta: {
    marginTop: 2,
    fontSize: 12,
    color: '#8BA890',
  },
  rowRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  rowAmount: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: '#FFFFFF',
  },
  markPaidBtn: {
    marginTop: 6,
    backgroundColor: '#2A5730',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.sm,
  },
  markPaidText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#1D3A22',
    borderWidth: 1,
    borderColor: 'rgba(107,191,122,0.16)',
    borderRadius: radius.lg,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 28,
    color: '#6BBF7A',
    marginBottom: 8,
    fontWeight: '700',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: '#8BA890',
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8BA890',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  monthCard: {
    backgroundColor: '#1D1D1A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.sm,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  monthMeta: {
    marginTop: 2,
    fontSize: 12,
    color: '#8BA890',
  },
  monthAmount: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#6BBF7A',
  },
});
