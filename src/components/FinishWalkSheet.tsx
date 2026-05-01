import React, { useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme";

type Props = {
  visible: boolean;
  elapsedSeconds: number;
  plannedMinutes: number;
  clientName: string;
  dogsLabel: string;
  dogsValue: string;
  totalAmount: number;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const CLOSED_Y = 720;

function fmtSignedMmSs(totalSeconds: number): string {
  const sign = totalSeconds < 0 ? "\u2212" : "";
  const s = Math.abs(totalSeconds);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${sign}${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function fmtPlusMmSs(totalSeconds: number): string {
  const s = Math.abs(totalSeconds);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `+${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function fmtElapsed(seconds: number): string {
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function FinishWalkSheet({
  visible,
  elapsedSeconds,
  plannedMinutes,
  clientName,
  dogsLabel,
  dogsValue,
  totalAmount,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  const insets = useSafeAreaInsets();
  const openY = useRef(new Animated.Value(CLOSED_Y)).current;

  const plannedSeconds = Math.max(1, plannedMinutes) * 60;
  const remainingSeconds = plannedSeconds - Math.max(0, elapsedSeconds);
  const isOver = remainingSeconds < 0;
  const overtimeSeconds = Math.max(0, Math.max(0, elapsedSeconds) - plannedSeconds);

  const overlayOpacity = useMemo(
    () =>
      openY.interpolate({
        inputRange: [0, CLOSED_Y],
        outputRange: [1, 0],
        extrapolate: "clamp",
      }),
    [openY],
  );

  useEffect(() => {
    if (!visible) return;
    openY.setValue(CLOSED_Y);
    Animated.spring(openY, {
      toValue: 0,
      damping: 22,
      stiffness: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, openY]);

  const dismiss = () => {
    Animated.timing(openY, {
      toValue: CLOSED_Y,
      duration: 240,
      useNativeDriver: true,
    }).start(() => {
      openY.setValue(CLOSED_Y);
      onCancel();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => dismiss()}
    >
      <View style={s.root}>
        <Animated.View
          style={[StyleSheet.absoluteFill, s.overlay, { opacity: overlayOpacity }]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={loading ? undefined : () => dismiss()}
          />
        </Animated.View>

        <Animated.View
          style={[
            s.sheet,
            {
              paddingBottom: Math.max(insets.bottom, 28),
              transform: [{ translateY: openY }],
            },
          ]}
        >
          <View style={s.handleRow}>
            <View style={s.handle} />
          </View>

          <View style={s.iconWrap}>
            <Ionicons name="checkmark" size={26} color={colors.greenDefault} />
          </View>

          <Text style={s.title}>Finish walk?</Text>

          <View style={s.statsRow}>
            <View style={s.stat}>
              <Text style={s.statVal}>{fmtElapsed(Math.max(0, elapsedSeconds))}</Text>
              <Text style={s.statLbl}>Duration</Text>
            </View>
            <View style={s.statSep} />
            <View style={s.stat}>
              <Text style={s.statVal}>{plannedMinutes} min</Text>
              <Text style={s.statLbl}>Planned</Text>
            </View>
            <View style={s.statSep} />
            <View style={s.stat}>
              <Text style={[s.statVal, isOver && s.statValRed]}>
                {isOver ? fmtPlusMmSs(overtimeSeconds) : fmtSignedMmSs(remainingSeconds)}
              </Text>
              <Text style={s.statLbl}>{isOver ? "Overtime" : "Remaining"}</Text>
            </View>
          </View>

          <View style={s.summaryCard}>
            <View style={s.sumRow}>
              <Text style={s.sl}>Client</Text>
              <Text style={s.sv} numberOfLines={1}>
                {clientName || "\u2014"}
              </Text>
            </View>
            <View style={s.sumRow}>
              <Text style={s.sl}>{dogsLabel}</Text>
              <Text style={s.sv} numberOfLines={1}>
                {dogsValue || "\u2014"}
              </Text>
            </View>
            <View style={[s.sumRow, s.sumRowLast]}>
              <Text style={s.sl}>Total</Text>
              <Text style={[s.sv, s.svGreen]}>${totalAmount.toFixed(2)}</Text>
            </View>
          </View>

          <View style={s.btns}>
            <TouchableOpacity
              style={[s.btnFinish, loading && { opacity: 0.6 }]}
              onPress={onConfirm}
              disabled={loading}
              activeOpacity={0.86}
            >
              {loading ? (
                <ActivityIndicator color={colors.greenText} />
              ) : (
                <>
                  <Ionicons name="checkmark" size={16} color={colors.greenText} />
                  <Text style={s.btnFinishText}>Finish walk</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btnCancel, loading && { opacity: 0.6 }]}
              onPress={() => dismiss()}
              disabled={loading}
              activeOpacity={0.86}
            >
              <Text style={s.btnCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  overlay: { backgroundColor: "rgba(0,0,0,0.65)" },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.10)",
  },
  handleRow: { alignItems: "center", paddingTop: 12, paddingBottom: 20 },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: colors.greenSubtle,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(91,175,114,0.20)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    letterSpacing: -0.4,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    marginBottom: 24,
  },
  stat: {
    alignItems: "center",
    paddingHorizontal: 22,
    gap: 3,
  },
  statSep: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  statVal: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    letterSpacing: -0.3,
  },
  statValRed: { color: colors.redText },
  statLbl: {
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  sumRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.05)",
    gap: 12,
  },
  sumRowLast: { borderBottomWidth: 0 },
  sl: { fontSize: 14, color: colors.textMuted },
  sv: { fontSize: 14, fontWeight: "600", color: colors.text, flexShrink: 1, textAlign: "right" },
  svGreen: { color: colors.greenDefault },
  btns: { paddingHorizontal: 16, gap: 8 },
  btnFinish: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.greenDeep,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.greenBorder,
    borderRadius: 14,
    paddingVertical: 16,
  },
  btnFinishText: { fontSize: 15, fontWeight: "700", color: colors.greenText },
  btnCancel: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnCancelText: { fontSize: 14, fontWeight: "600", color: colors.textMuted },
});
