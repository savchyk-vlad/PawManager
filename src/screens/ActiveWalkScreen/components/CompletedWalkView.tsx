import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Client, Dog, Walk } from '../../../types';
import { colors } from '../../../theme';
import { effectivePricePerWalk, walkCharge } from '../../../lib/walkMetrics';
import { formatWhen, paymentLabelAndColors } from '../activeWalkUtils';

type Props = {
  walk: Walk;
  clientRow: Client | undefined;
  dogsRow: Dog[];
  topInset: number;
  bottomInset: number;
  onBack: () => void;
};

export function CompletedWalkView({
  walk,
  clientRow,
  dogsRow,
  topInset,
  bottomInset,
  onBack,
}: Props) {
  const dogCount = Math.max(1, walk.dogIds.length);
  const pay = paymentLabelAndColors(walk.paymentStatus);
  const actual = walk.actualDurationMinutes ?? walk.durationMinutes;
  const walkTotal = walkCharge(walk, clientRow);
  const perDogMap = walk.perDogPrices;
  const hasPerDogRates = perDogMap != null && Object.keys(perDogMap).length > 0;
  const rateBase = clientRow?.pricePerWalk ?? 0;
  const durationLine =
    actual !== walk.durationMinutes
      ? `${actual} min actual . ${walk.durationMinutes} min booked`
      : `${actual} min`;

  return (
    <LinearGradient
      colors={[colors.bg, colors.greenDeep, colors.greenDefault]}
      locations={[0, 0.45, 1]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={{ paddingTop: topInset, flex: 1 }}>
        <ScrollView
          contentContainerStyle={[
            styles.compScroll,
            { paddingBottom: bottomInset + 28 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.compTopBar}>
            <TouchableOpacity style={styles.backBtn} onPress={onBack}>
              <Ionicons name="arrow-back" size={16} color="white" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <View style={styles.compStatusPill}>
              <Ionicons name="checkmark-circle" size={14} color={colors.greenText} />
              <Text style={styles.compStatusPillText}>COMPLETED</Text>
            </View>
            <View style={{ width: 88 }} />
          </View>

          <View style={styles.compCard}>
            <Text style={styles.compCardTitle}>Visit summary</Text>
            <View style={styles.compDetailRow}>
              <Text style={styles.compDetailLabel}>Scheduled</Text>
              <Text style={styles.compDetailValue}>{formatWhen(walk.scheduledAt)}</Text>
            </View>
            {walk.startedAt && (
              <View style={styles.compDetailRow}>
                <Text style={styles.compDetailLabel}>Started</Text>
                <Text style={styles.compDetailValue}>{formatWhen(walk.startedAt)}</Text>
              </View>
            )}
            {walk.finishedAt && (
              <View style={styles.compDetailRow}>
                <Text style={styles.compDetailLabel}>Finished</Text>
                <Text style={styles.compDetailValue}>{formatWhen(walk.finishedAt)}</Text>
              </View>
            )}
            <View style={[styles.compDetailRow, { borderBottomWidth: 0, paddingBottom: 2 }]}>
              <Text style={styles.compDetailLabel}>Duration</Text>
              <Text style={styles.compDetailValue}>{durationLine}</Text>
            </View>
          </View>

          {clientRow != null && (
            <View style={styles.compCard}>
              <Text style={styles.compCardTitle}>Client information</Text>
              <View style={styles.compDetailRow}>
                <Text style={styles.compDetailLabel}>Name</Text>
                <Text style={styles.compDetailValue}>{clientRow.name}</Text>
              </View>
              {clientRow.phone.trim() ? (
                <TouchableOpacity
                  style={styles.compDetailRow}
                  onPress={() =>
                    Linking.openURL(`tel:${clientRow.phone.replace(/[^0-9+]/g, '')}`)
                  }
                  activeOpacity={0.75}
                >
                  <Text style={styles.compDetailLabel}>Phone</Text>
                  <Text style={[styles.compDetailValue, { color: colors.greenText }]}>
                    {clientRow.phone}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.compDetailRow}>
                  <Text style={styles.compDetailLabel}>Phone</Text>
                  <Text style={styles.compDetailValue}>—</Text>
                </View>
              )}
              <View style={[styles.compDetailRow, { borderBottomWidth: 0, paddingBottom: 2 }]}>
                <Text style={styles.compDetailLabel}>Address</Text>
                <Text style={[styles.compDetailValue, { lineHeight: 20 }]}>
                  {clientRow.address.trim() || '—'}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.compCard}>
            <Text style={styles.compCardTitle}>Total price</Text>
            <View style={styles.compPayRow}>
              <View>
                {clientRow != null && (
                  <Text style={styles.compRateLine}>
                    ${walkTotal.toFixed(2)} <Text style={styles.compRateHint}>total</Text>
                  </Text>
                )}
                {clientRow != null &&
                  (hasPerDogRates ? (
                    dogsRow.map((d) => {
                      const amt = perDogMap![d.id] ?? rateBase;
                      return (
                        <Text key={d.id} style={styles.compRateSub}>
                          {d.name}: ${amt.toFixed(2)}
                        </Text>
                      );
                    })
                  ) : (
                    <Text style={styles.compRateSub}>
                      ${effectivePricePerWalk(walk, clientRow).toFixed(2)} × {dogCount} dog
                      {dogCount === 1 ? '' : 's'}
                    </Text>
                  ))}
              </View>
              <View style={[styles.compPayBadge, { backgroundColor: pay.bg }]}>
                <Text style={[styles.compPayBadgeText, { color: pay.fg }]}>{pay.label}</Text>
              </View>
            </View>
          </View>

          {dogsRow.length > 0 && (
            <View style={styles.compCard}>
              <Text style={styles.compCardTitle}>Dogs in this walk</Text>
              <View style={styles.compDogList}>
                {dogsRow.map((dog) => {
                  const traitsText = dog.traits.map((t) => t.label).join(' • ');
                  const details = [
                    dog.breed || 'Breed not provided',
                    dog.age > 0 ? `${dog.age}y` : null,
                    dog.weight > 0 ? `${dog.weight}kg` : null,
                  ]
                    .filter(Boolean)
                    .join(' • ');
                  return (
                    <View key={dog.id} style={styles.compDogRow}>
                      <View style={styles.compDogEmojiCircle}>
                        <Text style={{ fontSize: 20 }}>{dog.emoji}</Text>
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.compDogRowName} numberOfLines={1}>
                          {dog.name}
                        </Text>
                        <Text style={styles.compDogRowMeta} numberOfLines={2}>
                          {details}
                        </Text>
                        {traitsText.length > 0 && (
                          <Text style={styles.compDogRowTraits} numberOfLines={2}>
                            {traitsText}
                          </Text>
                        )}
                        {!!dog.medical?.trim() && (
                          <Text style={styles.compDogRowNote} numberOfLines={2}>
                            Medical: {dog.medical.trim()}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {!!walk.notes?.trim() && (
            <View style={styles.compNotesCard}>
              <Text style={styles.compNotesLabel}>WALK NOTE</Text>
              <Text style={styles.compNotesBody}>{walk.notes.trim()}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  compScroll: { paddingHorizontal: 20, paddingTop: 8 },
  compTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  backText: { fontSize: 13, fontWeight: '500', color: 'white' },
  compStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  compStatusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: 0.8,
  },
  compCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 16,
    marginBottom: 12,
  },
  compCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  compDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  compDetailLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '500',
    minWidth: 88,
  },
  compDetailValue: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
    textAlign: 'right',
    lineHeight: 20,
  },
  compPayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  compRateLine: { fontSize: 18, fontWeight: '700', color: 'white' },
  compRateHint: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.45)' },
  compRateSub: { marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
  compPayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  compPayBadgeText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.3 },
  compDogList: { gap: 10 },
  compDogRow: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 10,
  },
  compDogEmojiCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  compDogRowName: { fontSize: 14, fontWeight: '700', color: 'white' },
  compDogRowMeta: { marginTop: 2, fontSize: 12, color: 'rgba(255,255,255,0.72)' },
  compDogRowTraits: { marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.86)' },
  compDogRowNote: { marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  compNotesCard: {
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  compNotesLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  compNotesBody: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 21,
  },
});
