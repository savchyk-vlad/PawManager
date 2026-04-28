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
import { effectivePricePerWalk } from '../../../lib/walkMetrics';
import { ActiveWalkTopBar } from './ActiveWalkTopBar';

type Props = {
  walk: Walk;
  client: Client;
  dogs: Dog[];
  isScheduled: boolean;
  isInProgress: boolean;
  elapsedLabel: string;
  scheduleWhen: string;
  isLateToStart: boolean;
  endTimeLabel: string;
  notesText: string;
  billingTotal: number;
  billingUsesPerDog: boolean;
  billingDogCount: number;
  walkPerDogMap: Record<string, number> | undefined;
  topInset: number;
  bottomInset: number;
  onBack: () => void;
  onEdit: () => void;
  onStartWalk: () => void;
  onFinishWalk: () => void;
};

export function ActiveWalkMainView({
  walk,
  client,
  dogs,
  isScheduled,
  isInProgress,
  elapsedLabel,
  scheduleWhen,
  isLateToStart,
  endTimeLabel,
  notesText,
  billingTotal,
  billingUsesPerDog,
  billingDogCount,
  walkPerDogMap,
  topInset,
  bottomInset,
  onBack,
  onEdit,
  onStartWalk,
  onFinishWalk,
}: Props) {
  return (
    <LinearGradient
      colors={[colors.greenDeep, colors.greenDefault, colors.greenText]}
      locations={[0, 0.6, 1]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={{ paddingTop: topInset, flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: bottomInset + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <ActiveWalkTopBar
            isScheduled={isScheduled}
            onBack={onBack}
            onEdit={onEdit}
          />

          {isInProgress && (
            <View style={[styles.timerBlock, styles.timerBlockTop]}>
              <Text style={styles.timer}>{elapsedLabel}</Text>
              <Text style={styles.timerSub}>of {walk.durationMinutes} min walk</Text>
            </View>
          )}

          <View style={[styles.actionsRow, styles.actionsRowTop]}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => client.phone && Linking.openURL(`tel:${client.phone.replace(/[^0-9+]/g, '')}`)}
            >
              <Ionicons name="call-outline" size={20} color="white" />
              <Text style={styles.actionLabel}>Call Owner</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                const addr = encodeURIComponent(client.address);
                Linking.openURL(`maps://maps.google.com/maps?daddr=${addr}`);
              }}
            >
              <Ionicons name="location-outline" size={20} color="white" />
              <Text style={styles.actionLabel}>Navigate</Text>
            </TouchableOpacity>
          </View>

          {isScheduled && (
            <TouchableOpacity style={[styles.startWalkBtn, styles.primaryWalkAction]} onPress={onStartWalk}>
              <Ionicons name="play" size={20} color={colors.greenDeep} style={{ marginRight: 8 }} />
              <Text style={styles.startWalkBtnText}>Start walk</Text>
            </TouchableOpacity>
          )}

          {isInProgress && (
            <TouchableOpacity style={[styles.finishBtn, styles.primaryWalkAction]} onPress={onFinishWalk}>
              <Text style={styles.finishBtnText}>Finish Walk</Text>
            </TouchableOpacity>
          )}

          {(isScheduled || isInProgress) && (
            <View style={styles.compCard}>
              <Text style={styles.compCardTitle}>Schedule</Text>
              <View style={styles.compDetailRow}>
                <Text style={styles.compDetailLabel}>When</Text>
                <Text style={styles.compDetailValue}>{scheduleWhen}</Text>
              </View>
              <View style={[styles.compDetailRow, { borderBottomWidth: 0, paddingBottom: 2 }]}>
                <Text style={styles.compDetailLabel}>Planned duration</Text>
                <Text style={styles.compDetailValue}>{walk.durationMinutes} min</Text>
              </View>
            </View>
          )}

          {isScheduled && isLateToStart && (
            <View style={[styles.lateNotice, { marginBottom: 12 }]}>
              <Ionicons name="alert-circle-outline" size={22} color={colors.amberDefault} style={{ marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.lateNoticeTitle}>Overdue to start</Text>
                <Text style={styles.lateNoticeSub}>
                  You can still start this walk before the planned window ends ({endTimeLabel}). After
                  that, it will show as missed.
                </Text>
              </View>
            </View>
          )}

          <View style={styles.compCard}>
            <Text style={styles.compCardTitle}>Client information</Text>
            <View style={styles.compDetailRow}>
              <Text style={styles.compDetailLabel}>Name</Text>
              <Text style={styles.compDetailValue}>{client.name}</Text>
            </View>
            {client.phone.trim() ? (
              <TouchableOpacity
                style={styles.compDetailRow}
                onPress={() => Linking.openURL(`tel:${client.phone.replace(/[^0-9+]/g, '')}`)}
                activeOpacity={0.75}
              >
                <Text style={styles.compDetailLabel}>Phone</Text>
                <Text style={[styles.compDetailValue, { color: colors.greenText }]}>{client.phone}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.compDetailRow}>
                <Text style={styles.compDetailLabel}>Phone</Text>
                <Text style={styles.compDetailValue}>—</Text>
              </View>
            )}
            <View style={[styles.compDetailRow, { borderBottomWidth: 0, paddingBottom: 2 }]}>
              <Text style={styles.compDetailLabel}>Address</Text>
              <Text style={[styles.compDetailValue, { lineHeight: 20 }]}>{client.address.trim() || '—'}</Text>
            </View>
          </View>

          {dogs.length > 0 && (
            <View style={styles.compCard}>
              <Text style={styles.compCardTitle}>Dogs in this walk</Text>
              <View style={styles.compDogList}>
                {dogs.map((dogItem) => {
                  const meta = [
                    dogItem.breed || 'Breed not provided',
                    dogItem.age > 0 ? `${dogItem.age}y` : null,
                    dogItem.weight > 0 ? `${dogItem.weight}kg` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ');
                  return (
                    <View key={dogItem.id} style={styles.compDogRow}>
                      <View style={styles.compDogEmojiCircle}>
                        <Text style={{ fontSize: 20 }}>{dogItem.emoji}</Text>
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={styles.compDogRowName} numberOfLines={1}>{dogItem.name}</Text>
                        <Text style={styles.compDogRowMeta} numberOfLines={2}>{meta}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.compCard}>
            <Text style={styles.compCardTitle}>Total price</Text>
            <Text style={styles.compRateLine}>
              ${billingTotal.toFixed(2)} <Text style={styles.compRateHint}>total</Text>
            </Text>
            {billingUsesPerDog
              ? dogs.map((d) => (
                  <Text key={d.id} style={styles.compRateSub}>
                    {d.name}: ${(walkPerDogMap?.[d.id] ?? client.pricePerWalk).toFixed(2)}
                  </Text>
                ))
              : (
                  <Text style={styles.compRateSub}>
                    ${effectivePricePerWalk(walk, client).toFixed(2)} × {billingDogCount} dog
                    {billingDogCount === 1 ? '' : 's'}
                  </Text>
                )}
          </View>

          {notesText.length > 0 && (
            <View style={styles.notesCard}>
              <Text style={styles.notesLabel}>WALKER NOTES</Text>
              <Text style={styles.notesText}>{notesText}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 12 },
  timerBlock: { alignItems: 'center', paddingVertical: 28 },
  timerBlockTop: {
    paddingVertical: 14,
    marginBottom: 4,
  },
  actionsRowTop: {
    marginBottom: 12,
    marginTop: 0,
  },
  primaryWalkAction: {
    marginBottom: 14,
    marginTop: 0,
  },
  timer: {
    fontSize: 52,
    fontWeight: '300',
    color: 'white',
    letterSpacing: 2,
  },
  timerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
  },
  actionLabel: { fontSize: 13, fontWeight: '600', color: 'white' },
  notesCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
  finishBtn: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
  },
  finishBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.greenDeep,
  },
  lateNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  lateNoticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.amberText,
    marginBottom: 4,
  },
  lateNoticeSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 17,
  },
  startWalkBtn: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startWalkBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.greenDeep,
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
  compRateLine: { fontSize: 18, fontWeight: '700', color: 'white' },
  compRateHint: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.45)' },
  compRateSub: {
    marginTop: 4,
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
  },
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
});
