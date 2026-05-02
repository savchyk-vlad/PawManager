import React, { useMemo } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useThemeColors, useAppearance, radius } from "../theme";

type Props = {
  visible: boolean;
  title: string;
  /** Title uses `colors.textMuted` instead of primary text. */
  titleMuted?: boolean;
  /** Payment-style modal: green header band (matches Walk / Payments chrome). */
  headerTone?: "default" | "green";
  /** Override card width cap (default 340). */
  cardMaxWidth?: number;
  children: React.ReactNode;
  onCancel: () => void;
  onSubmit: () => void;
  cancelLabel?: string;
  submitLabel?: string;
};

export function ActionModal({
  visible,
  title,
  titleMuted = false,
  headerTone = "default",
  cardMaxWidth,
  children,
  onCancel,
  onSubmit,
  cancelLabel = "Cancel",
  submitLabel = "Submit",
}: Props) {
  const colors = useThemeColors();
  const appearance = useAppearance();
  const s = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        },
        backdrop: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor:
            appearance === "dark" ? "rgba(0,0,0,0.72)" : "rgba(0,0,0,0.5)",
        },
        card: {
          width: "100%",
          maxWidth: 340,
          backgroundColor: colors.surfaceHigh,
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
          paddingBottom: 14,
        },
        cardGreen: {
          backgroundColor: colors.greenDeep,
          borderColor: colors.greenBorder,
          paddingBottom: 0,
        },
        header: {
          backgroundColor: colors.surfaceHigh,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 12,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
          borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl,
        },
        headerGreen: {
          backgroundColor: colors.greenDeep,
          borderBottomWidth: 0,
          borderBottomColor: colors.greenBorder,
        },
        title: {
          fontSize: 16,
          fontWeight: "700",
          color: colors.text,
          textAlign: "center",
        },
        titleMutedOverride: {
          color: colors.textMuted,
          fontWeight: "600",
        },
        titleGreenMuted: {
          color: "rgba(255,255,255,0.72)",
          fontWeight: "600",
        },
        body: {
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 14,
        },
        bodyGreen: {
          backgroundColor: colors.greenDeep,
          paddingTop: 10,
          paddingBottom: 12,
        },
        footer: {
          flexDirection: "row",
          gap: 10,
          paddingHorizontal: 16,
        },
        footerGreenBand: {
          backgroundColor: colors.surfaceHigh,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 14,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.borderStrong,
        },
        footerRow: {
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
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        },
        btnGhostText: {
          fontSize: 14,
          fontWeight: "700",
          color: colors.textMuted,
        },
        btnPrimary: {
          backgroundColor: colors.greenDeep,
          borderWidth: 1,
          borderColor: colors.greenBorder,
        },
        btnPrimaryText: {
          fontSize: 14,
          fontWeight: "800",
          color: colors.white,
        },
      }),
    [colors, appearance]
  );

  const headerStyle =
    headerTone === "green" ? [s.header, s.headerGreen] : s.header;
  const titleStyle =
    titleMuted && headerTone === "green"
      ? [s.title, s.titleGreenMuted]
      : titleMuted
        ? [s.title, s.titleMutedOverride]
        : s.title;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onCancel}
    >
      <View style={s.root}>
        <Pressable style={s.backdrop} onPress={onCancel} />

        <View
          style={[
            s.card,
            headerTone === "green" && s.cardGreen,
            cardMaxWidth !== undefined && { maxWidth: cardMaxWidth },
          ]}>
          <View style={headerStyle}>
            <Text style={titleStyle}>{title}</Text>
          </View>
          <View style={[s.body, headerTone === "green" && s.bodyGreen]}>{children}</View>

          {headerTone === "green" ? (
            <View style={s.footerGreenBand}>
              <View style={s.footerRow}>
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
          ) : (
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
          )}
        </View>
      </View>
    </Modal>
  );
}
