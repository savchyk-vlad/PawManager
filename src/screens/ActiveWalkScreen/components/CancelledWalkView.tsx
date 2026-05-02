import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Client, Dog, Walk } from '../../../types';
import { useThemeColors, type ThemeColors } from '../../../theme';
import { formatWhen } from '../activeWalkUtils';

type Props = {
  walk: Walk;
  clientRow: Client | undefined;
  dogsRow: Dog[];
  topInset: number;
  bottomInset: number;
  onBack: () => void;
};

export function CancelledWalkView({
  walk,
  clientRow,
  dogsRow,
  topInset,
  bottomInset,
  onBack,
}: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createCancelledwalkviewStyles(colors), [colors]);
  const endNames = dogsRow.map((d) => d.name).join(' & ') || 'Walk';
  const endEmoji = dogsRow[0]?.emoji ?? '🐕';

  return (
    <LinearGradient
      colors={[colors.bg, colors.greenDeep, colors.greenDefault]}
      locations={[0, 0.45, 1]}
      style={{ flex: 1 }}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: topInset + 8, paddingBottom: bottomInset + 28 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={16} color={colors.textMuted} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
        </View>

        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>{endEmoji}</Text>
        </View>
        <View style={[styles.statusPill, styles.statusPillCancelled]}>
          <Text style={styles.statusPillText}>CANCELLED</Text>
        </View>
        <Text style={styles.title}>This walk is cancelled</Text>
        <Text style={styles.subtitle}>
          {endNames}
          {clientRow ? ` . ${clientRow.name}` : ''}
        </Text>
        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Scheduled</Text>
            <Text style={styles.metaValue}>{formatWhen(walk.scheduledAt)}</Text>
          </View>
          <View style={[styles.metaRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.metaLabel}>Planned duration</Text>
            <Text style={styles.metaValue}>{walk.durationMinutes} min</Text>
          </View>
        </View>
        <Text style={[styles.subtitle, styles.footnote]}>
          It's off your active schedule. You can still see it in history on the client or schedule.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

function createCancelledwalkviewStyles(colors: ThemeColors) {
  return StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  backText: { fontSize: 13, fontWeight: '500', color: colors.textMuted },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  avatarEmoji: { fontSize: 40 },
  statusPill: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 10,
  },
  statusPillCancelled: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 6,
  },
  metaCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginTop: 10,
    overflow: 'hidden',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  metaLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.58)',
    fontWeight: '500',
  },
  metaValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
  },
  footnote: {
    marginTop: 8,
    lineHeight: 20,
  },
});
}
