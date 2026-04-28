import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

type HeaderStyles = {
  header: object;
  backBtn: object;
  headerTitle: object;
  headerSpacer: object;
};

export function WalkFormCloseHeader({
  title,
  onClose,
  styles,
}: {
  title: string;
  onClose: () => void;
  styles: HeaderStyles;
}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onClose} style={styles.backBtn}>
        <Ionicons name="close" size={20} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}
