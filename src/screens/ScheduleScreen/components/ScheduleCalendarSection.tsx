import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { format, isSameDay, isToday } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { isUserWorkingDay } from "../../../lib/workingDays";
import { colors } from "../../../theme";

type CalendarCell = { type: "empty" } | { type: "day"; date: Date };

type Props = {
  monthDate: Date;
  weekRows: CalendarCell[][];
  selectedDate: Date | null;
  workingDays: boolean[];
  walkCountForDate: (date: Date) => number;
  onChangeMonth: (delta: -1 | 1) => void;
  onSelectDate: (date: Date) => void;
};

export function ScheduleCalendarSection({
  monthDate,
  weekRows,
  selectedDate,
  workingDays,
  walkCountForDate,
  onChangeMonth,
  onSelectDate,
}: Props) {
  return (
    <View style={styles.calendarWrap}>
      <View style={styles.calNav}>
        <TouchableOpacity style={styles.calArrow} onPress={() => onChangeMonth(-1)}>
          <Ionicons name="chevron-back" size={22} color={colors.greenDefault} />
        </TouchableOpacity>
        <Text style={styles.calMonth}>{format(monthDate, "MMMM yyyy")}</Text>
        <TouchableOpacity style={styles.calArrow} onPress={() => onChangeMonth(1)}>
          <Ionicons name="chevron-forward" size={22} color={colors.greenDefault} />
        </TouchableOpacity>
      </View>
      <View style={styles.weekDays}>
        {["Su", "M", "T", "W", "T", "F", "Sa"].map((d, i) => (
          <Text key={`${d}-${i}`} style={styles.weekDayTxt}>
            {d}
          </Text>
        ))}
      </View>
      <View style={styles.calGrid}>
        {weekRows.map((row, wi) => (
          <View key={`week-${wi}`} style={styles.calWeekRow}>
            {row.map((cell, di) => {
              const idx = wi * 7 + di;
              if (cell.type === "empty") {
                return <View key={`e-${idx}`} style={styles.dayEmpty} />;
              }
              const selected = selectedDate ? isSameDay(cell.date, selectedDate) : false;
              const today = isToday(cell.date);
              const walksOnDay = walkCountForDate(cell.date);
              const dots = Math.min(walksOnDay, 3);
              const canSelectDay = isUserWorkingDay(cell.date, workingDays) || walksOnDay > 0;
              return (
                <TouchableOpacity
                  key={format(cell.date, "yyyy-MM-dd")}
                  style={[
                    styles.dayCell,
                    selected && styles.dayCellSelected,
                    !canSelectDay && styles.dayCellMuted,
                  ]}
                  disabled={!canSelectDay}
                  onPress={() => {
                    if (!canSelectDay) return;
                    onSelectDate(cell.date);
                  }}
                  activeOpacity={canSelectDay ? 0.8 : 1}>
                  <Text
                    style={[
                      styles.dayNum,
                      today && styles.dayNumToday,
                      selected && styles.dayNumSelected,
                      !canSelectDay && styles.dayNumMuted,
                    ]}>
                    {format(cell.date, "d")}
                  </Text>
                  <View style={styles.dotRow}>
                    {Array.from({ length: dots }).map((_, i) => (
                      <View key={i} style={styles.dot} />
                    ))}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  calendarWrap: {
    backgroundColor: colors.surface,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  calNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  calArrow: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceHigh,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  calMonth: { fontSize: 14, fontWeight: "600", color: colors.text },
  weekDays: { flexDirection: "row", marginBottom: 6 },
  weekDayTxt: { flex: 1, textAlign: "center", fontSize: 10, color: colors.textMuted, fontWeight: "500" },
  calGrid: { width: "100%" },
  calWeekRow: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 2,
  },
  dayEmpty: { flex: 1, height: 40 },
  dayCell: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "flex-start",
    borderRadius: 10,
    paddingTop: 4,
  },
  dayCellSelected: { backgroundColor: "#182410" },
  dayCellMuted: { opacity: 0.38 },
  dayNum: { fontSize: 12, color: colors.textSecondary, width: 24, height: 24, textAlign: "center", lineHeight: 24 },
  dayNumMuted: { color: colors.textMuted },
  dayNumToday: {
    backgroundColor: colors.greenDeep,
    color: colors.greenText,
    borderRadius: 12,
    overflow: "hidden",
    fontWeight: "700",
    fontSize: 11,
  },
  dayNumSelected: { color: colors.greenDefault, fontWeight: "700" },
  dotRow: { flexDirection: "row", gap: 2, minHeight: 5, marginTop: 3 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.greenDeep },
});
