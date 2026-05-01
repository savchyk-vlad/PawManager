import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, radius } from "../theme";

type Props = {
  visible: boolean;
  title: string;
  children: React.ReactNode;
  onCancel: () => void;
  onSubmit: () => void;
  cancelLabel?: string;
  submitLabel?: string;
};

export function ActionModal({
  visible,
  title,
  children,
  onCancel,
  onSubmit,
  cancelLabel = "Cancel",
  submitLabel = "Submit",
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onCancel}
    >
      <View style={s.root}>
        <Pressable style={s.backdrop} onPress={onCancel} />

        <View style={s.card}>
          <Text style={s.title}>{title}</Text>
          <View style={s.body}>{children}</View>

          <View style={s.footer}>
            <TouchableOpacity
              onPress={onCancel}
              style={[s.btn, s.btnGhost]}
              activeOpacity={0.85}
            >
              <Text style={s.btnGhostText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSubmit}
              style={[s.btn, s.btnPrimary]}
              activeOpacity={0.85}
            >
              <Text style={s.btnPrimaryText}>{submitLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 10,
    textAlign: "center",
  },
  body: {
    paddingBottom: 14,
  },
  footer: {
    flexDirection: "row",
    gap: 10,
  },
  btn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhost: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  btnGhostText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMuted,
  },
  btnPrimary: {
    backgroundColor: colors.greenDeep,
    borderWidth: 1,
    borderColor: "rgba(92,175,114,0.24)",
  },
  btnPrimaryText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});

