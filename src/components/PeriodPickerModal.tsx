import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { format, startOfMonth } from "date-fns";
import { useThemeColors, useAppearance, radius } from "../theme";

type Tab = "month" | "year";

type Props = {
  visible: boolean;
  value: Date;
  onClose: () => void;
  onConfirm: (next: Date) => void;
};

/** Month/year picker — tabbed grids (Payments period). Theme-aware (light / dark). */
export function PeriodPickerModal({ visible, value, onClose, onConfirm }: Props) {
  const colors = useThemeColors();
  const appearance = useAppearance();
  const s = useMemo(() => createStyles(colors), [colors]);

  const [draft, setDraft] = useState(() => value);
  const [tab, setTab] = useState<Tab>("month");

  useEffect(() => {
    if (visible) {
      setDraft(value);
      setTab("month");
    }
  }, [visible, value]);

  const y = draft.getFullYear();
  const m = draft.getMonth();

  const years = useMemo(() => {
    const cy = new Date().getFullYear();
    return Array.from({ length: 9 }, (_, i) => cy - 4 + i);
  }, []);

  const shortMonths = useMemo(
    () => Array.from({ length: 12 }, (_, i) => format(new Date(2000, i, 1), "MMM")),
    [],
  );

  function pickMonth(idx: number) {
    setDraft(startOfMonth(new Date(y, idx, 1)));
  }

  function pickYear(yy: number) {
    setDraft(startOfMonth(new Date(yy, m, 1)));
  }

  function handleConfirm() {
    onConfirm(startOfMonth(draft));
    onClose();
  }

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={s.root}>
        <Pressable
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor:
                appearance === "dark" ? "rgba(0,0,0,0.72)" : "rgba(0,0,0,0.5)",
            },
          ]}
          onPress={onClose}
        />

        <View style={s.card}>
          {/* Green preview header */}
          <View style={s.hero}>
            <Text style={s.heroLabel}>Period</Text>
            <View style={s.heroValueRow}>
              <Text style={s.heroMonth}>{format(draft, "MMMM")}</Text>
              <Text style={s.heroYear}> {String(y)}</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={s.tabs}>
            <TouchableOpacity
              style={s.tabHit}
              onPress={() => setTab("month")}
              activeOpacity={0.75}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === "month" }}>
              <Text style={[s.tabText, tab === "month" && s.tabTextActive]}>Month</Text>
              {tab === "month" ? <View style={s.tabUnderline} /> : null}
            </TouchableOpacity>
            <TouchableOpacity
              style={s.tabHit}
              onPress={() => setTab("year")}
              activeOpacity={0.75}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === "year" }}>
              <Text style={[s.tabText, tab === "year" && s.tabTextActive]}>Year</Text>
              {tab === "year" ? <View style={s.tabUnderline} /> : null}
            </TouchableOpacity>
          </View>

          {/* Panels */}
          <View style={s.panel}>
            {tab === "month" ? (
              <View style={s.grid}>
                {shortMonths.map((label, idx) => {
                  const sel = idx === m;
                  return (
                    <View key={label} style={s.cellSlot}>
                      <TouchableOpacity
                        style={[s.cell, sel && s.cellSelected]}
                        onPress={() => pickMonth(idx)}
                        activeOpacity={0.82}>
                        <Text style={[s.cellText, sel && s.cellTextSelected]} numberOfLines={1}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={s.grid}>
                {years.map((yy) => {
                  const sel = yy === y;
                  return (
                    <View key={yy} style={s.cellSlot}>
                      <TouchableOpacity
                        style={[s.cell, sel && s.cellSelected]}
                        onPress={() => pickYear(yy)}
                        activeOpacity={0.82}>
                        <Text style={[s.cellText, sel && s.cellTextSelected]}>{String(yy)}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          <View style={s.footer}>
            <TouchableOpacity style={s.btnCancel} onPress={onClose} activeOpacity={0.85}>
              <Text style={s.btnCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.btnDone} onPress={handleConfirm} activeOpacity={0.88}>
              <Text style={s.btnDoneText}>Done →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ReturnType<typeof useThemeColors>) {
  const cardBg = colors.surfaceHigh;
  const border = colors.border;
  const borderStrong = colors.borderStrong;

  return StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    card: {
      width: "100%",
      maxWidth: 340,
      backgroundColor: cardBg,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: borderStrong,
      overflow: "hidden",
    },
    hero: {
      backgroundColor: colors.greenDeep,
      paddingHorizontal: 24,
      paddingTop: 22,
      paddingBottom: 18,
    },
    heroLabel: {
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: 2,
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.55)",
      marginBottom: 6,
    },
    heroValueRow: {
      flexDirection: "row",
      alignItems: "baseline",
      flexWrap: "wrap",
    },
    heroMonth: {
      fontSize: 30,
      fontWeight: "700",
      color: colors.white,
      letterSpacing: -0.6,
    },
    heroYear: {
      fontSize: 21,
      fontWeight: "600",
      color: "rgba(255,255,255,0.45)",
      marginLeft: 6,
    },
    tabs: {
      flexDirection: "row",
      borderBottomWidth: 1.5,
      borderBottomColor: border,
    },
    tabHit: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    tabText: {
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 1.2,
      textTransform: "uppercase",
      color: colors.textMuted,
    },
    tabTextActive: {
      color: colors.greenDefault,
    },
    tabUnderline: {
      position: "absolute",
      bottom: -1.5,
      left: "12%",
      right: "12%",
      height: 2,
      borderRadius: 1,
      backgroundColor: colors.greenDefault,
    },
    panel: {
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 16,
      backgroundColor: cardBg,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: -3,
      marginTop: -3,
    },
    cellSlot: {
      width: "33.333%",
      padding: 3,
    },
    cell: {
      paddingVertical: 11,
      paddingHorizontal: 4,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: border,
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "center",
    },
    cellSelected: {
      backgroundColor: colors.greenDeep,
      borderColor: colors.greenDeep,
    },
    cellText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text,
    },
    cellTextSelected: {
      color: colors.white,
    },
    footer: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 18,
      paddingTop: 14,
      paddingBottom: 16,
      borderTopWidth: 1.5,
      borderTopColor: border,
      backgroundColor: cardBg,
    },
    btnCancel: {
      flex: 1,
      paddingVertical: 11,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: border,
      alignItems: "center",
      justifyContent: "center",
    },
    btnCancelText: {
      fontSize: 12,
      fontWeight: "600",
      letterSpacing: 0.5,
      color: colors.textMuted,
    },
    btnDone: {
      flex: 2,
      paddingVertical: 11,
      borderRadius: 10,
      backgroundColor: colors.greenDeep,
      borderWidth: 1,
      borderColor: colors.greenBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    btnDoneText: {
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.5,
      color: colors.white,
    },
  });
}
