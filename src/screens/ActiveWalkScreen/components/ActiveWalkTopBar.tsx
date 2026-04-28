import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme";

type Props = {
  isScheduled: boolean;
  onBack: () => void;
  onEdit: () => void;
};

export function ActiveWalkTopBar({ isScheduled, onBack, onEdit }: Props) {
  return (
    <View style={styles.topBar}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={16} color="white" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.inProgressLabel}>
        {isScheduled ? "SCHEDULED" : "WALK IN PROGRESS"}
      </Text>
      {isScheduled ? (
        <TouchableOpacity style={styles.headerEditBtn} onPress={onEdit} activeOpacity={0.85}>
          <Text style={styles.headerEditText}>Edit</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.headerSpacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  backText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
  inProgressLabel: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 11,
    letterSpacing: 1.1,
    fontWeight: "700",
  },
  headerEditBtn: {
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerEditText: {
    color: colors.greenDeep,
    fontSize: 13,
    fontWeight: "700",
  },
  headerSpacer: { width: 72 },
});
