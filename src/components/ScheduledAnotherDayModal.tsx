import React, { useMemo } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { useThemeColors } from "../theme";

function CalendarGlyph({ size = 18 }: { size?: number }) {
  const colors = useThemeColors();
  const stroke = colors.amberDefault;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={3}
        y={4}
        width={18}
        height={17}
        rx={2.5}
        stroke={stroke}
        strokeWidth={1.5}
      />
      <Path d="M3 9h18" stroke={stroke} strokeWidth={1.5} />
      <Path
        d="M8 2v3M16 2v3"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

type ModalProps = {
  visible: boolean;
  onDismiss: () => void;
  onReschedule: () => void;
};

export function ScheduledAnotherDayModal({
  visible,
  onDismiss,
  onReschedule,
}: ModalProps) {
  const colors = useThemeColors();
  const shared = useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 32,
        },
        backdrop: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.6)",
        },
        modal: {
          width: "100%",
          maxWidth: 280,
          backgroundColor: colors.surfaceHigh,
          borderRadius: 18,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          overflow: "hidden",
          zIndex: 1,
        },
        modalBody: {
          paddingTop: 24,
          paddingHorizontal: 22,
          paddingBottom: 20,
          alignItems: "center",
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        iconWrap: {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: colors.amberSubtle,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        },
        modalTitle: {
          fontSize: 16,
          fontWeight: "500",
          color: colors.text,
          marginBottom: 8,
          textAlign: "center",
          lineHeight: 21,
        },
        modalDesc: {
          fontSize: 13,
          color: colors.textSecondary,
          lineHeight: 20,
          textAlign: "center",
        },
        modalActions: {
          flexDirection: "row",
        },
        actionBtn: {
          flex: 1,
          paddingVertical: 15,
          alignItems: "center",
          justifyContent: "center",
        },
        actionBtnLeft: {
          borderRightWidth: StyleSheet.hairlineWidth,
          borderRightColor: colors.border,
        },
        btnDismiss: {
          fontSize: 14,
          fontWeight: "500",
          color: colors.textMuted,
        },
        btnReschedule: {
          fontSize: 14,
          fontWeight: "500",
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
      onRequestClose={onDismiss}>
      <View style={shared.overlay} pointerEvents="box-none">
        <Pressable
          style={shared.backdrop}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />
        <View style={shared.modal}>
          <View style={shared.modalBody}>
            <View style={shared.iconWrap}>
              <CalendarGlyph />
            </View>
            <Text style={shared.modalTitle}>Scheduled for another day</Text>
            <Text style={shared.modalDesc}>
              This walk can be started on its scheduled day, or rescheduled for today.
            </Text>
          </View>
          <View style={shared.modalActions}>
            <TouchableOpacity
              style={[shared.actionBtn, shared.actionBtnLeft]}
              onPress={onDismiss}
              activeOpacity={0.65}
              accessibilityRole="button"
              accessibilityLabel="Dismiss">
              <Text style={shared.btnDismiss}>Dismiss</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={shared.actionBtn}
              onPress={onReschedule}
              activeOpacity={0.65}
              accessibilityRole="button"
              accessibilityLabel="Reschedule">
              <Text style={shared.btnReschedule}>Reschedule</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
