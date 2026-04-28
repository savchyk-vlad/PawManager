import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme";

type Props = {
  monthLabel: string;
  onAddPress: () => void;
};

export function ScheduleHeader({ monthLabel, onAddPress }: Props) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>Schedule</Text>
        <Text style={styles.sub}>{monthLabel}</Text>
      </View>
      <TouchableOpacity style={styles.addBtn} onPress={onAddPress}>
        <Ionicons name="add" size={22} color={colors.greenText} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  title: { fontSize: 30, fontWeight: "700", color: colors.text, letterSpacing: -1 },
  sub: { fontSize: 12, color: colors.textSecondary, marginTop: 3 },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.greenDeep,
    alignItems: "center",
    justifyContent: "center",
  },
});
