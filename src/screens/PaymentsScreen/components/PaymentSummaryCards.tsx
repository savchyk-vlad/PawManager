import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../../../theme";

type TotalOutstandingProps = {
  totalLabel: string;
  totalValue: string;
  totalSub: string;
};

export function TotalOutstandingCard({
  totalLabel,
  totalValue,
  totalSub,
}: TotalOutstandingProps) {
  return (
    <View style={styles.totalBox}>
      <Text style={styles.totalLabel}>{totalLabel}</Text>
      <Text style={styles.totalValue}>{totalValue}</Text>
      <Text style={styles.totalSub}>{totalSub}</Text>
    </View>
  );
}

type PaidMonthProps = {
  monthLabel: string;
  paidWalkCount: number;
  earnedValue: string;
};

export function PaidMonthCard({
  monthLabel,
  paidWalkCount,
  earnedValue,
}: PaidMonthProps) {
  return (
    <View style={styles.monthCard}>
      <View>
        <Text style={styles.monthName}>{monthLabel}</Text>
        <Text style={styles.monthMeta}>
          {paidWalkCount} walk{paidWalkCount === 1 ? "" : "s"}
        </Text>
      </View>
      <Text style={styles.monthAmount}>{earnedValue}</Text>
    </View>
  );
}

export function EmptyPaidUpCard() {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyIcon}>✓</Text>
      <Text style={styles.emptyTitle}>Everything is paid up</Text>
      <Text style={styles.emptyText}>No outstanding balances right now.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  totalBox: {
    backgroundColor: colors.greenDeep,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.greenSubtle,
    padding: 18,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    color: "rgba(255,255,255,0.62)",
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.8,
    color: colors.text,
    marginBottom: 4,
  },
  totalSub: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  monthCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  monthName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  monthMeta: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },
  monthAmount: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.4,
    color: colors.greenText,
  },
  emptyCard: {
    backgroundColor: colors.greenDeep,
    borderWidth: 1,
    borderColor: colors.greenSubtle,
    borderRadius: radius.lg,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 28,
    color: colors.greenText,
    marginBottom: 8,
    fontWeight: "700",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
