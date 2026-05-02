import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Platform,
  TouchableOpacity,
} from "react-native";
import type { Dog } from "../types";
import { useThemeColors, type ThemeColors } from "../theme";
import { ActionModal } from "./ActionModal";

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
    const raw = Number.parseFloat(
      (priceInputs[dog.id] ?? "").replace(/,/g, ""),
    );
    if (Number.isFinite(raw) && raw >= 0) sum += raw;
  }
  return sum;
}

/** Sum of per-dog rates — on Add Walk, render below schedule / above primary action. */
export function WalkPricingTotalBar({
  dogs,
  priceInputs,
}: {
  dogs: Dog[];
  priceInputs: Record<string, string>;
}) {
  const colors = useThemeColors();
  const barStyles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
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
          fontWeight: "600",
          letterSpacing: 0.3,
          color: colors.textMuted,
        },
        amount: {
          fontSize: 22,
          fontWeight: "700",
          color: colors.text,
        },
        amountFlash: {
          color: colors.greenDefault,
        },
      }),
    [colors],
  );
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
  const colors = useThemeColors();
  const styles = useMemo(() => createWalkPricingFieldsStyles(colors), [colors]);
  const [editingDog, setEditingDog] = useState<Dog | null>(null);
  const editingValue = editingDog ? priceInputs[editingDog.id] ?? "" : "";

  const closeModal = () => setEditingDog(null);

  if (dogs.length === 0) return null;

  return (
    <>
      <Text style={styles.sectionLabel}>PRICING</Text>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderLabel}>Rate per dog</Text>
        </View>

        {dogs.map((dog, idx) => (
          <TouchableOpacity
            key={dog.id}
            style={[
              styles.dogRow,
              styles.dogRowSelected,
              idx < dogs.length - 1 && styles.dogRowBorder,
            ]}
            activeOpacity={0.8}
            onPress={() => setEditingDog(dog)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>{dog.emoji}</Text>
            </View>
            <View style={styles.dogInfo}>
              <Text style={styles.dogName}>{dog.name}</Text>
              <Text style={styles.dogBreed} numberOfLines={1}>
                {dog.breed || "Dog"}
              </Text>
            </View>
            <View style={styles.pricePill}>
              <Text style={styles.pricePillText}>
                ${priceInputs[dog.id] && priceInputs[dog.id]?.trim() ? priceInputs[dog.id] : "0"}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ActionModal
        visible={editingDog != null}
        title="Set rate"
        cancelLabel="Cancel"
        submitLabel="Submit"
        onCancel={closeModal}
        onSubmit={closeModal}
      >
        <Text style={styles.modalDogName} numberOfLines={1}>
          {editingDog ? `${editingDog.emoji} ${editingDog.name}` : ""}
        </Text>

        <View style={styles.modalInputWrap}>
          <Text style={styles.modalDollar}>$</Text>
          <TextInput
            style={styles.modalInput}
            value={editingValue}
            onChangeText={(t) => {
              if (!editingDog) return;
              onPriceChange(editingDog.id, t.replace(/[^0-9.]/g, ""));
            }}
            keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            autoFocus
          />
        </View>
        <Text style={styles.modalHint}>Per dog, per walk</Text>
      </ActionModal>
    </>
  );
}

function createWalkPricingFieldsStyles(colors: ThemeColors) {
  return StyleSheet.create({
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
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
    overflow: "hidden",
  },
  cardHeader: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: colors.surfaceHigh,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardHeaderLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
  dogRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    minHeight: 56,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  dogRowSelected: {
    backgroundColor: colors.greenDeep,
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
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: {
    fontSize: 18,
  },
  dogInfo: {
    flex: 1,
    minWidth: 0,
  },
  dogName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 18,
  },
  dogBreed: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 1,
  },
  priceWrap: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  priceSymbol: {
    position: "absolute",
    left: 11,
    fontSize: 13,
    fontWeight: "500",
    color: colors.textSecondary,
    zIndex: 1,
    pointerEvents: "none",
  },
  priceInput: {
    width: 76,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    paddingLeft: 22,
    paddingRight: 10,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.greenBorder,
    borderRadius: 10,
    fontSize: 15,
    fontWeight: "600",
    color: colors.greenDefault,
    textAlign: "right",
  },
  pricePill: {
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.greenBorder,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
    minWidth: 70,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  pricePillText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.greenDefault,
  },

  modalDogName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  modalInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  modalDollar: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textSecondary,
    marginRight: 8,
  },
  modalInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    textAlign: "right",
  },
  modalHint: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textMuted,
  },
});
}
