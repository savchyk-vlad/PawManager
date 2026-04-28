import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Platform,
} from 'react-native';
import type { Dog } from '../types';
import { colors } from '../theme';

/** Schedule / edit walk pricing — colors aligned with AddWalk / EditWalk. */

type Props = {
  dogs: Dog[];
  /** Display strings per dog id (typically default from client profile). */
  priceInputs: Record<string, string>;
  onPriceChange: (dogId: string, value: string) => void;
};

export function computeWalkPricingTotal(
  dogs: Dog[],
  priceInputs: Record<string, string>,
): number {
  let sum = 0;
  for (const dog of dogs) {
    const raw = Number.parseFloat((priceInputs[dog.id] ?? '').replace(/,/g, ''));
    if (Number.isFinite(raw) && raw >= 0) sum += raw;
  }
  return sum;
}

/** Shown below schedule fields, above Schedule / Save — sum of per-dog rates. */
export function WalkPricingTotalBar({
  dogs,
  priceInputs,
}: {
  dogs: Dog[];
  priceInputs: Record<string, string>;
}) {
  const walkTotal = useMemo(
    () => computeWalkPricingTotal(dogs, priceInputs),
    [dogs, priceInputs],
  );
  const [totalFlash, setTotalFlash] = useState(false);
  const prevTotalRef = useRef<number | null>(null);

  useEffect(() => {
    if (dogs.length === 0) return;
    if (prevTotalRef.current === null) {
      prevTotalRef.current = walkTotal;
      return;
    }
    if (prevTotalRef.current !== walkTotal) {
      prevTotalRef.current = walkTotal;
      setTotalFlash(true);
      const t = setTimeout(() => setTotalFlash(false), 800);
      return () => clearTimeout(t);
    }
  }, [walkTotal, dogs.length]);

  if (dogs.length === 0) return null;

  return (
    <View style={barStyles.wrap}>
      <Text style={barStyles.label}>Walk total</Text>
      <Text style={[barStyles.amount, totalFlash && barStyles.amountFlash]}>
        ${Math.round(walkTotal)}
      </Text>
    </View>
  );
}

export function WalkPricingFields({ dogs, priceInputs, onPriceChange }: Props) {
  if (dogs.length === 0) return null;

  return (
    <>
      <Text style={styles.sectionLabel}>PRICING</Text>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderLabel}>Rate per dog</Text>
        </View>

        {dogs.map((dog, idx) => (
          <View
            key={dog.id}
            style={[styles.dogRow, idx < dogs.length - 1 && styles.dogRowBorder]}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>{dog.emoji}</Text>
            </View>
            <View style={styles.dogInfo}>
              <Text style={styles.dogName}>{dog.name}</Text>
              <Text style={styles.dogBreed} numberOfLines={1}>
                {dog.breed || 'Dog'}
              </Text>
            </View>
            <View style={styles.priceWrap}>
              <Text style={styles.priceSymbol}>$</Text>
              <TextInput
                style={styles.priceInput}
                value={priceInputs[dog.id] ?? ''}
                onChangeText={(t) => onPriceChange(dog.id, t.replace(/[^0-9.]/g, ''))}
                keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

const barStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: colors.surfaceHigh,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: colors.textSecondary,
  },
  amount: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  amountFlash: {
    color: colors.greenDefault,
  },
});

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: colors.textMuted,
    marginBottom: 8,
    marginTop: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: colors.surfaceHigh,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  dogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  dogRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceHigh,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 18,
  },
  dogInfo: {
    flex: 1,
    minWidth: 0,
  },
  dogName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 18,
  },
  dogBreed: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  priceWrap: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceSymbol: {
    position: 'absolute',
    left: 11,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    zIndex: 1,
    pointerEvents: 'none',
  },
  priceInput: {
    width: 76,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    paddingLeft: 22,
    paddingRight: 10,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.greenBorder,
    borderRadius: 10,
    fontSize: 15,
    fontWeight: '600',
    color: colors.greenDefault,
    textAlign: 'right',
  },
});
