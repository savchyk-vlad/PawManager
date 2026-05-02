import React, { useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from "react-native";
import { useThemeColors } from "../theme";

type Props = {
  visible: boolean;
  onDismiss: () => void;
};

export function PastTimeModal({ visible, onDismiss }: Props) {
  const colors = useThemeColors();
  const s = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
        },
        backdrop: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.65)",
        },
        card: {
          backgroundColor: colors.surface,
          borderRadius: 20,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 16,
          width: "100%",
          maxWidth: 400,
          alignSelf: "center",
          zIndex: 1,
        },
        title: {
          fontSize: 18,
          fontWeight: "700",
          color: colors.text,
          letterSpacing: -0.4,
          marginBottom: 8,
        },
        body: {
          fontSize: 14,
          color: colors.textSecondary,
          lineHeight: 21,
          marginBottom: 18,
        },
        btn: {
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: "center",
          backgroundColor: colors.greenDeep,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.greenBorder,
        },
        btnText: {
          fontSize: 15,
          fontWeight: "600",
          color: colors.greenText,
        },
      }),
    [colors]
  );
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onDismiss}
    >
      <View style={s.wrap} pointerEvents="box-none">
        <Pressable
          style={s.backdrop}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />
        <View style={s.card}>
          <Text style={s.title}>Past time not allowed</Text>
          <Text style={s.body}>
            The scheduled time cannot be in the past. Please select a future date and time.
          </Text>
          <TouchableOpacity
            style={s.btn}
            onPress={onDismiss}
            activeOpacity={0.88}>
            <Text style={s.btnText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
