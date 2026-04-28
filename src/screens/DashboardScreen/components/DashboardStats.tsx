import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../../theme";

type Props = {
  doneTodayCount: number;
  earnedToday: number;
  totalUnpaid: number;
  unpaidWalkCount: number;
  onPressPayments: () => void;
  styles: any;
};

export function DashboardStats({
  doneTodayCount,
  earnedToday,
  totalUnpaid,
  unpaidWalkCount,
  onPressPayments,
  styles,
}: Props) {
  return (
    <View style={styles.statsRow}>
      <View style={styles.statBox}>
        <Text style={styles.statNum}>{doneTodayCount}</Text>
        <Text style={styles.statLbl}>Walks today</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.statNum}>${earnedToday}</Text>
        <Text style={styles.statLbl}>Earned today</Text>
      </View>
      <TouchableOpacity style={styles.statBox} onPress={onPressPayments} activeOpacity={0.82}>
        <Text style={[styles.statNum, { color: colors.amberDefault }]}>${totalUnpaid}</Text>
        <Text style={styles.statLbl}>
          Unpaid · {unpaidWalkCount} walk{unpaidWalkCount === 1 ? "" : "s"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
