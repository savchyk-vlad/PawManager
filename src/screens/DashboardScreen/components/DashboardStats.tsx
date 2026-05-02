import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useThemeColors } from "../../../theme";

type Props = {
  doneTodayCount: number;
  earnedToday: number;
  totalUnpaid: number;
  unpaidWalkCount: number;
  onPressPayments: () => void;
  styles: any;
};

export function DashboardStats({
  earnedToday,
  totalUnpaid,
  unpaidWalkCount,
  onPressPayments,
  styles,
}: Props) {
  const colors = useThemeColors();
  return (
    <View style={styles.headerTopRow}>
      <Text style={styles.headerTitle}>Walks</Text>
      <View style={styles.headerStatsRight}>
        <View style={styles.headerStat}>
          <Text style={styles.headerStatVal}>${earnedToday}</Text>
          <Text style={styles.headerStatLbl}>Earned today</Text>
        </View>
        <TouchableOpacity
          style={styles.headerStat}
          onPress={onPressPayments}
          activeOpacity={0.82}
        >
          <Text style={[styles.headerStatVal, { color: colors.amberDefault }]}>
            ${totalUnpaid}
          </Text>
          <Text style={styles.headerStatLbl}>Unpaid</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
