import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { format, isValid, parseISO } from "date-fns";
import { colors } from "../theme";
import { SheetModal } from "./SheetModal";

type DogChip = { emoji?: string; name: string };

export function TimeTakenModal({
  visible,
  onClose,
  onViewWalk,
  clientName,
  dogs,
  scheduledAtIso,
  durationMinutes,
}: {
  visible: boolean;
  onClose: () => void;
  onViewWalk: () => void;
  clientName: string;
  dogs: DogChip[];
  scheduledAtIso: string;
  durationMinutes: number;
}) {
  const whenLabel = useMemo(() => {
    const d = parseISO(scheduledAtIso);
    if (!isValid(d)) return "—";
    return format(d, "EEE, MMM d · h:mm a");
  }, [scheduledAtIso]);

  const dogLabel = useMemo(() => {
    if (!dogs.length) return "—";
    return dogs.map((d) => d.name).join(", ");
  }, [dogs]);

  return (
    <SheetModal
      visible={visible}
      title="Time already taken"
      hint="This time slot overlaps another walk. Pick another time, or view the scheduled walk details."
      onCancel={onClose}
      onSave={onViewWalk}
      cancelLabel="Change time"
      saveLabel="View walk"
      animationType="fade"
    >
      <View style={s.card}>
        <Row label="Client" value={clientName || "—"} />
        <Row
          label={dogs.length > 1 ? "Dogs" : "Dog"}
          value={dogLabel}
          chips={dogs}
        />
        <Row label="Scheduled" value={whenLabel} />
        <Row label="Duration" value={`${durationMinutes} min`} last />
      </View>
    </SheetModal>
  );
}

function Row({
  label,
  value,
  last,
  chips,
}: {
  label: string;
  value: string;
  last?: boolean;
  chips?: DogChip[];
}) {
  return (
    <View style={[s.row, last && s.rowLast]}>
      <Text style={s.rl}>{label}</Text>
      {chips && chips.length > 0 ? (
        <View style={s.chipsWrap}>
          {chips.slice(0, 3).map((d, i) => (
            <View key={`${d.name}-${i}`} style={s.chip}>
              {d.emoji ? <Text style={s.chipEmoji}>{d.emoji}</Text> : null}
              <Text style={s.chipText} numberOfLines={1}>
                {d.name}
              </Text>
            </View>
          ))}
          {chips.length > 3 ? (
            <Text style={s.chipMore}>+{chips.length - 3}</Text>
          ) : null}
        </View>
      ) : (
        <Text style={s.rv} numberOfLines={3}>
          {value}
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.05)",
    gap: 12,
  },
  rowLast: { borderBottomWidth: 0 },
  rl: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.9,
    paddingTop: 2,
  },
  rv: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
    textAlign: "right",
    lineHeight: 18,
  },
  chipsWrap: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.surfaceHigh,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.10)",
    maxWidth: 160,
  },
  chipEmoji: { fontSize: 12 },
  chipText: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  chipMore: { fontSize: 12, fontWeight: "600", color: colors.textMuted },
});

