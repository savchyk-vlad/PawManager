import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors, type ThemeColors } from "../../../theme";

type Props = {
  isScheduled: boolean;
  onBack: () => void;
  onEdit: () => void;
};

export function ActiveWalkTopBar({ isScheduled, onBack, onEdit }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createActivewalktopbarStyles(colors), [colors]);
  return (
    <View style={styles.topBar}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={16} color={colors.textMuted} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.inProgressLabel}>
        {isScheduled ? "SCHEDULED" : "WALK IN PROGRESS"}
      </Text>
      {isScheduled ? (
        <TouchableOpacity style={styles.headerEditBtn} onPress={onEdit} activeOpacity={0.85}>
          <Text style={styles.headerEditText}>Edit walk</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.headerSpacer} />
      )}
    </View>
  );
}

function createActivewalktopbarStyles(colors: ThemeColors) {
  return StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  inProgressLabel: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 1.1,
    fontWeight: "700",
  },
  headerEditBtn: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerEditText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  headerSpacer: { width: 72 },
});
}
