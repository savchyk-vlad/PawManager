import React, { useMemo } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  onOpenDog?: (dogId: string) => void;
};

export function CompletedWalkView({
  walk,
  clientRow,
  dogsRow,
  topInset,
  bottomInset,
  onBack,
  onOpenDog,
}: Props) {
  const dogCount = Math.max(1, walk.dogIds.length);
  const pay = paymentLabelAndColors(walk.paymentStatus);
  const actual = walk.actualDurationMinutes ?? walk.durationMinutes;
  const walkTotal = walkCharge(walk, clientRow);
  const perDogMap = walk.perDogPrices;
  const hasPerDogRates = perDogMap != null && Object.keys(perDogMap).length > 0;
  const rateBase = clientRow?.pricePerWalk ?? 0;
  const durationLine = actual !== walk.durationMinutes ? `${actual} min · booked ${walk.durationMinutes} min` : `${actual} min`;

  const dogNames = useMemo(() => dogsRow.map((d) => d.name).join(' & '), [dogsRow]);

  const notesDisplay = useMemo(() => {
    const trimmed = (walk.notes ?? '').trim();
    if (trimmed.length === 0) return 'No notes added…';
    // Some older walks may have duplicated auto-notes (e.g. client notes) saved twice.
    // Collapse exact duplicate lines to keep the details clean.
    const lines = trimmed
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const deduped: string[] = [];
    for (const line of lines) {
      if (deduped.includes(line)) continue;
      deduped.push(line);
    }
    return deduped.join('\n');
  }, [walk.notes]);

  const Card = ({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) => (
    <View style={[styles.card, last && styles.cardLast]}>
      <View style={styles.cardHead}>
        <Text style={styles.cardHeadText}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const Row = ({
    label,
    value,
    empty,
    last,
    valueColor,
  }: {
    label: string;
    value: string;
    empty?: boolean;
    last?: boolean;
    valueColor?: string;
  }) => (
    <View style={[styles.row, last && styles.rowLast]}>
      <Text style={styles.rl}>{label}</Text>
      <Text style={[styles.rv, empty && styles.rvEmpty, valueColor && { color: valueColor }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );

  return (
    <View style={[styles.safe, { paddingTop: topInset }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomInset + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={16} color={colors.textSecondary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.screenLabel}>COMPLETED</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Card title="Schedule">
          <Row label="Scheduled" value={formatWhen(walk.scheduledAt)} />
          {walk.startedAt ? <Row label="Started" value={formatWhen(walk.startedAt)} /> : null}
          {walk.finishedAt ? <Row label="Finished" value={formatWhen(walk.finishedAt)} /> : null}
          <Row label="Duration" value={durationLine} last />
        </Card>

        {clientRow ? (
          <Card title="Client information">
            <Row label="Name" value={clientRow.name} />
            <Row label="Phone" value={clientRow.phone.trim() || '—'} empty={!clientRow.phone.trim()} />
            <Row label="Address" value={clientRow.address.trim() || '—'} empty={!clientRow.address.trim()} last />
          </Card>
        ) : null}

        <Card title="Dogs in this walk">
          {dogsRow.length > 0 ? (
            dogsRow.map((d, i) => (
              <TouchableOpacity
                key={d.id}
                style={[styles.dogRow, i < dogsRow.length - 1 && styles.dogRowBorder]}
                onPress={() => onOpenDog?.(d.id)}
                activeOpacity={onOpenDog ? 0.75 : 1}
                disabled={!onOpenDog}
              >
                <View style={styles.dogAvatar}>
                  <Text style={{ fontSize: 18 }}>{d.emoji}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.dogName} numberOfLines={1}>{d.name}</Text>
                  <Text style={styles.dogBreed} numberOfLines={1}>{d.breed || 'Breed not provided'}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.notesContent}>
              <Text style={styles.rvEmpty}>—</Text>
            </View>
          )}
        </Card>

        <Card title="Notes">
          <View style={styles.notesContent}>
            <Text style={[styles.notesText, (walk.notes ?? '').trim().length === 0 && styles.notesTextEmpty]}>
              {notesDisplay}
            </Text>
          </View>
        </Card>

        <Card title="Total price" last>
          <View style={styles.priceBlock}>
            <View style={styles.priceTopRow}>
              <Text style={styles.priceAmount}>
                ${walkTotal.toFixed(2)} <Text style={styles.priceAmountSub}>total</Text>
              </Text>
              <View style={[styles.payBadge, { backgroundColor: pay.bg }]}>
                <Text style={[styles.payBadgeText, { color: pay.fg }]}>{pay.label}</Text>
              </View>
            </View>
            {clientRow &&
              (hasPerDogRates
                ? dogsRow.map((d) => {
                    const amt = perDogMap![d.id] ?? rateBase;
                    return (
                      <Text key={d.id} style={styles.priceBreakdown}>
                        {d.name}: ${amt.toFixed(2)}
                      </Text>
                    );
                  })
                : (
                  <Text style={styles.priceBreakdown}>
                    ${effectivePricePerWalk(walk, clientRow).toFixed(2)} × {dogCount} dog{dogCount === 1 ? '' : 's'}
                    {dogNames ? ` (${dogNames})` : ''}
                  </Text>
                ))}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingTop: 10, paddingBottom: 24 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  screenLabel: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 1.1,
    fontWeight: '700',
  },
  headerSpacer: { width: 72 },

  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardLast: { marginBottom: 0 },
  cardHead: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: colors.surfaceHigh,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  cardHeadText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  rowLast: { borderBottomWidth: 0 },
  rl: { fontSize: 13, color: colors.textMuted },
  rv: { fontSize: 13, color: colors.text, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  rvEmpty: { color: '#3e3e38', fontWeight: '400' },

  dogRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  dogRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.05)' },
  dogAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceHigh,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dogName: { fontSize: 14, color: colors.text, fontWeight: '600' },
  dogBreed: { fontSize: 12, color: colors.textMuted, marginTop: 1 },

  notesContent: { paddingHorizontal: 14, paddingVertical: 12 },
  notesText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  notesTextEmpty: { color: colors.textMuted, fontStyle: 'italic' },

  priceBlock: { paddingHorizontal: 14, paddingVertical: 12 },
  priceTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  priceAmount: { fontSize: 22, fontWeight: '700', color: colors.greenText, letterSpacing: -0.5 },
  priceAmountSub: { fontSize: 13, color: colors.textMuted, fontWeight: '400' },
  priceBreakdown: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
  payBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  payBadgeText: { fontSize: 11, fontWeight: '700' },
});
