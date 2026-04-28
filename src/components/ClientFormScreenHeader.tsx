import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

type Styles = {
  header: object;
  closeBtn: object;
  headerTitle: object;
  saveBtn: object;
  saveBtnText: object;
};

export function ClientFormScreenHeader({
  title,
  onClose,
  onSave,
  canSave,
  saving,
  styles,
}: {
  title: string;
  onClose: () => void;
  onSave: () => void;
  canSave: boolean;
  saving: boolean;
  styles: Styles;
}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Ionicons name="close" size={20} color={colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity
        style={[styles.saveBtn, (!canSave || saving) && { opacity: 0.4 }]}
        onPress={onSave}
        disabled={!canSave || saving}>
        {saving ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.saveBtnText}>Save</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
