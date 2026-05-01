import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, parseISO } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme';
import { useAppStore } from '../../store';
import { Client, Walk } from '../../types';
import { walkCharge, walkDogCount } from '../../lib/walkMetrics';
import { RootStackParamList } from '../../navigation';
import {
  EmptyPaidUpCard,
  TotalOutstandingCard,
} from './components/PaymentSummaryCards';
import { PaidThisMonthSection } from './components/PaidThisMonthSection';
import { PaymentsHeader } from './components/PaymentsHeader';
import { UnpaidClientsSection, UnpaidEntry } from './components/UnpaidClientsSection';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function currency(amount: number) {
  return `$${amount.toFixed(2)}`;
}

function dogNamesForWalk(walk: Walk, client: Client) {
  const dogs = client.dogs.filter((d) => walk.dogIds.includes(d.id));
  return dogs.map((d) => d.name).join(' + ') || 'Walk';
}

function sortByScheduleAsc(walks: Walk[]) {
  return [...walks].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
}

export default function PaymentsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { walks, clients, markClientPaid, markWalkPaid } = useAppStore();
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  const now = new Date();
  const monthLabel = format(now, 'MMMM yyyy');

  const unpaidByClient = clients
    .map((client) => {
      const unpaidWalks = sortByScheduleAsc(
        walks.filter(
          (walk) =>
            walk.clientId === client.id &&
            walk.paymentStatus === 'unpaid' &&
            walk.status === 'done'
        )
      );
      if (unpaidWalks.length === 0) return null;
      const total = unpaidWalks.reduce(
        (sum, walk) => sum + walkCharge(walk, client),
        0,
      );
      return { client, unpaidWalks, total };
    })
    .filter((entry): entry is UnpaidEntry => entry !== null)
    .sort((a, b) => b.total - a.total);

  const totalUnpaid = unpaidByClient.reduce((sum, entry) => sum + entry.total, 0);
  const unpaidWalkCount = unpaidByClient.reduce(
    (sum, entry) => sum + entry.unpaidWalks.reduce((n, walk) => n + walkDogCount(walk), 0),
    0
  );

  const thisMonthPrefix = format(now, 'yyyy-MM');
  const paidThisMonthWalks = walks.filter(
    (walk) =>
      walk.status === 'done' &&
      walk.paymentStatus === 'paid' &&
      walk.scheduledAt.startsWith(thisMonthPrefix)
  );
  const earnedThisMonth = paidThisMonthWalks.reduce((sum, walk) => {
    const client = clients.find((c) => c.id === walk.clientId);
    return sum + walkCharge(walk, client);
  }, 0);

  const handleMarkAllPaid = (entry: UnpaidEntry) => {
    Alert.alert(
      'Mark all paid',
      `Mark ${entry.unpaidWalks.length} walk${entry.unpaidWalks.length === 1 ? '' : 's'} (${currency(entry.total)}) from ${entry.client.name} as paid?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark paid',
          onPress: async () => {
            try {
              await markClientPaid(entry.client.id);
            } catch (error: any) {
              Alert.alert('Error', error?.message ?? 'Could not mark walks as paid.');
            }
          },
        },
      ]
    );
  };

  const handleMarkWalkPaid = (walk: Walk, client: Client) => {
    const when = format(parseISO(walk.scheduledAt), 'MMM d, h:mm a');
    const amount = walkCharge(walk, client);
    Alert.alert(
      'Mark walk paid',
      `${dogNamesForWalk(walk, client)} · ${when}\nAmount: ${currency(amount)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark paid',
          onPress: async () => {
            try {
              await markWalkPaid(walk.id);
            } catch (error: any) {
              Alert.alert('Error', error?.message ?? 'Could not mark this walk as paid.');
            }
          },
        },
      ]
    );
  };

  const toggleClient = (clientId: string) => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedClientId((prev) => (prev === clientId ? null : clientId));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PaymentsHeader monthLabel={monthLabel} />

        <TotalOutstandingCard
          totalLabel="TOTAL OUTSTANDING"
          totalValue={currency(totalUnpaid)}
          totalSub={`Across ${unpaidByClient.length} client${unpaidByClient.length === 1 ? '' : 's'} · ${unpaidWalkCount} walk${unpaidWalkCount === 1 ? '' : 's'} unpaid`}
        />

        {unpaidByClient.length > 0 ? (
          <UnpaidClientsSection
            unpaidByClient={unpaidByClient}
            expandedClientId={expandedClientId}
            currency={currency}
            dogNamesForWalk={dogNamesForWalk}
            onToggleClient={toggleClient}
            onMarkAllPaid={handleMarkAllPaid}
            onMarkWalkPaid={handleMarkWalkPaid}
            onOpenWalk={(walkId) => navigation.navigate('ActiveWalk', { walkId })}
          />
        ) : (
          <EmptyPaidUpCard />
        )}

        <PaidThisMonthSection
          monthLabel={monthLabel}
          paidWalkCount={paidThisMonthWalks.length}
          earnedValue={currency(earnedThisMonth)}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
});
