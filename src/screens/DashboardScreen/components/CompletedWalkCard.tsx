import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { RootStackParamList } from '../../../navigation';
import { useAppStore } from '../../../store';
import { Walk } from '../../../types';
import {
  effectivePricePerWalk,
  walkCharge,
  walkDogCount,
} from '../../../lib/walkMetrics';
import { DogEmojiStack } from '../../../components/DogEmojiStack';
import { PaymentStatusPill } from '../../../components/PaymentStatusPill';
import { colors } from '../../../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  walk: Walk;
  parseWalkDate: (iso: string | undefined) => Date | null;
};

export function CompletedWalkCard({ walk, parseWalkDate }: Props) {
  const navigation = useNavigation<Nav>();
  const { clients } = useAppStore();
  const client = clients.find((c) => c.id === walk.clientId);
  const dogs = client
    ? client.dogs.filter((d) => walk.dogIds.includes(d.id))
    : [];
  const dogNames = dogs.map((d) => d.name).join(' · ') || 'Walk';
  const dogCount = walkDogCount(walk);
  const t = parseWalkDate(walk.scheduledAt);
  const scheduledPart = t ? format(t, 'EEE, MMM d · h:mm a') : '—';
  const walkTotal = walkCharge(walk, client);
  const perDogMap = walk.perDogPrices;
  const hasPerDogRates = perDogMap != null && Object.keys(perDogMap).length > 0;
  const rateSummary = hasPerDogRates
    ? 'Per-dog rates'
    : `$${effectivePricePerWalk(walk, client)} × ${dogCount}`;
  const booked = walk.durationMinutes;
  const actual = walk.actualDurationMinutes;
  const durationLabel =
    actual != null && actual !== booked
      ? `${actual} min actual · ${booked} min booked`
      : `${actual ?? booked} min`;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ActiveWalk', { walkId: walk.id })}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={`Completed walk, ${client?.name ?? 'client'}, ${dogNames}`}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <DogEmojiStack variant="completed" dogs={dogs} />
          <View style={styles.doneStamp}>
            <Ionicons name="checkmark" size={10} color="#0d1f12" />
          </View>
        </View>
        <View style={styles.cardMain}>
          <View style={styles.titleRow}>
            <Text style={styles.clientName} numberOfLines={1}>
              {client?.name ?? 'Client'}
            </Text>
            <Text style={styles.time}>{scheduledPart}</Text>
          </View>
          <Text style={styles.dogsLine} numberOfLines={2}>
            {dogNames}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaLeft}>
              <Text style={styles.duration}>{durationLabel}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.duration}>
                {dogCount} dog{dogCount === 1 ? '' : 's'}
              </Text>
            </View>
            <PaymentStatusPill status={walk.paymentStatus} />
          </View>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.amountLabel}>{rateSummary}</Text>
        <View style={styles.footerRight}>
          <Text style={styles.amount}>${walkTotal}</Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color="rgba(255,255,255,0.22)"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#222220',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
  },
  avatar: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 48,
  },
  doneStamp: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.greenText,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#222220',
    zIndex: 3,
  },
  cardMain: { flex: 1, minWidth: 0 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 4,
  },
  clientName: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
  time: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.38)',
    flexShrink: 0,
  },
  dogsLine: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 18,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  metaLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaDot: { fontSize: 10, color: 'rgba(255,255,255,0.25)' },
  duration: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 0.2,
  },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  amount: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
});
