import React, { useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { useThemeColors, type ThemeColors } from "../theme";

export type SheetModalProps = {
  visible: boolean;
  title: string;
  hint?: string;
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  useDmSans?: boolean;
  children: React.ReactNode;
  /** @default "fade" */
  animationType?: "none" | "slide" | "fade";
};

export function SheetModal({
  visible,
  title,
  hint,
  onSave,
  onCancel,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  useDmSans = false,
  children,
  animationType = "fade",
}: SheetModalProps) {
  const colors = useThemeColors();
  const s = useMemo(() => createSheetModalStyles(colors), [colors]);
  const f = useDmSans;
  const titleStyle = [s.title, f && { fontFamily: "DMSans_700Bold" }];
  const hintStyle = [s.hint, f && { fontFamily: "DMSans_400Regular" }];
  const cancelTextStyle = [s.btnSecondaryText, f && { fontFamily: "DMSans_600SemiBold" }];
  const saveTextStyle = [s.btnPrimaryText, f && { fontFamily: "DMSans_600SemiBold" }];

  return (
    <Modal visible={visible} animationType={animationType} transparent onRequestClose={onCancel}>
      <View style={s.wrap}>
        <Pressable
          style={s.backdrop}
          onPress={() => {
            Keyboard.dismiss();
            onCancel();
          }}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={[s.avoid, { zIndex: 1 }]}
        >
          <View style={s.card}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <Text style={titleStyle}>{title}</Text>
              {hint ? <Text style={hintStyle}>{hint}</Text> : null}
              <View style={s.body}>{children}</View>
              <View style={s.actions}>
                <TouchableOpacity
                  style={s.btnSecondary}
                  onPress={() => {
                    Keyboard.dismiss();
                    onCancel();
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={cancelTextStyle}>{cancelLabel}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.btnPrimary} onPress={onSave} activeOpacity={0.88}>
                  <Text style={saveTextStyle}>{saveLabel}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function createSheetModalStyles(colors: ThemeColors) {
  return StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  avoid: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    maxHeight: "88%",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: 14,
  },
  body: {
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    paddingTop: 8,
    paddingBottom: 8,
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  btnSecondaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  btnPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: colors.greenDeep,
  },
  btnPrimaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.greenText,
  },
});
}
