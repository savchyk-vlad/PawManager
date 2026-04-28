import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  Platform,
  type TextInputProps,
} from "react-native";
import { colors } from "../theme";

export type TextFieldModalProps = {
  visible: boolean;
  title: string;
  /** Shown under the title; omit to hide. */
  hint?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
  /** Rendered between the text field and Save/Cancel (e.g. quick picks). */
  belowInput?: React.ReactNode;
  placeholder?: string;
  saveLabel?: string;
  cancelLabel?: string;
  /**
   * When true, applies DM Sans family names (use where `useFonts` from
   * @expo-google-fonts/dm-sans is already loaded).
   */
  useDmSans?: boolean;
  /** Merged into the inner `TextInput` (value / onChangeText / style are controlled by the modal). */
  textInputProps?: Omit<
    TextInputProps,
    "value" | "onChangeText" | "defaultValue" | "style" | "placeholder" | "placeholderTextColor"
  >;
  /** @default "fade" */
  animationType?: "none" | "slide" | "fade";
};

export function TextFieldModal({
  visible,
  title,
  hint,
  value,
  onChangeText,
  onSave,
  onCancel,
  belowInput,
  placeholder = "",
  saveLabel = "Save",
  cancelLabel = "Cancel",
  useDmSans = false,
  textInputProps,
  animationType = "fade",
}: TextFieldModalProps) {
  const inputRef = useRef<TextInput>(null);
  const f = useDmSans;

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, [visible]);

  const titleStyle = [s.title, f && { fontFamily: "DMSans_700Bold" }];
  const hintStyle = [s.hint, f && { fontFamily: "DMSans_400Regular" }];
  const inputStyle = [s.input, f && { fontFamily: "DMSans_500Medium" }];
  const cancelTextStyle = [s.btnSecondaryText, f && { fontFamily: "DMSans_600SemiBold" }];
  const saveTextStyle = [s.btnPrimaryText, f && { fontFamily: "DMSans_600SemiBold" }];

  const {
    onSubmitEditing: userOnSubmitEditing,
    autoFocus: _af,
    ...restInput
  } = textInputProps ?? {};

  return (
    <Modal
      visible={visible}
      animationType={animationType}
      transparent
      onRequestClose={onCancel}
    >
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
            <Text style={titleStyle}>{title}</Text>
            {hint ? <Text style={hintStyle}>{hint}</Text> : null}
            <TextInput
              ref={inputRef}
              style={[inputStyle, belowInput ? s.inputWithFooter : null]}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor={colors.textMuted}
              onSubmitEditing={(e) => {
                userOnSubmitEditing?.(e);
                onSave();
              }}
              {...restInput}
            />
            {belowInput ? <View style={s.belowInput}>{belowInput}</View> : null}
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
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
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
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 20,
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
  input: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 18,
  },
  inputWithFooter: {
    marginBottom: 12,
  },
  belowInput: {
    marginBottom: 18,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
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
