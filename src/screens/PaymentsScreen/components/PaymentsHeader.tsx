import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme';

type Props = {
  monthLabel: string;
};

export function PaymentsHeader({ monthLabel }: Props) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Payments</Text>
      <Text style={styles.subtitle}>{monthLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    letterSpacing: -0.5,
    color: colors.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
