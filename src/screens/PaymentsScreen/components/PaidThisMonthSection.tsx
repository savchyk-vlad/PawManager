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
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
