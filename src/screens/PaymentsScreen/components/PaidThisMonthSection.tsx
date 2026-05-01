import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme';
import { PaidMonthCard } from './PaymentSummaryCards';

type Props = {
  monthLabel: string;
  paidWalkCount: number;
  earnedValue: string;
};

export function PaidThisMonthSection({
  monthLabel,
  paidWalkCount,
  earnedValue,
}: Props) {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Paid this month</Text>
      </View>
      <PaidMonthCard
        monthLabel={monthLabel}
        paidWalkCount={paidWalkCount}
        earnedValue={earnedValue}
      />
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    marginBottom: 8,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
});
