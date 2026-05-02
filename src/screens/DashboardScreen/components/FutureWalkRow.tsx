import React, {useState, useMemo} from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { format, isValid, parseISO } from "date-fns";
import { DogEmojiStack } from "../../../components/DogEmojiStack";
import { ScheduledAnotherDayModal } from "../../../components/ScheduledAnotherDayModal";
import { walkCharge } from "../../../lib/walkMetrics";
import { RootStackParamList } from "../../../navigation";
import { useAppStore } from "../../../store";
import { useThemeColors, type ThemeColors } from "../../../theme";
import { Walk } from "../../../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Props = { walk: Walk };

export function FutureWalkRow({ walk }: Props) {
  const colors = useThemeColors();
  const s = useMemo(() => createFuturewalkrowStyles(colors), [colors]);
  const navigation = useNavigation<Nav>();
  const { clients } = useAppStore();
  const [modalOpen, setModalOpen] = useState(false);

  const client = clients.find((c) => c.id === walk.clientId);
  const dogs = client
    ? client.dogs.filter((d) => walk.dogIds.includes(d.id))
    : [];
  const dogsTitle = dogs.map((d) => d.name).join(" & ") || "Walk";
  const totalPrice = walkCharge(walk, client);

  const t = walk.scheduledAt ? parseISO(walk.scheduledAt) : null;
  const timeH = t && isValid(t) ? format(t, "h:mm") : "—";
  const timeAp = t && isValid(t) ? format(t, "a") : "";

  const openWalk = () =>
    navigation.navigate("ActiveWalk", { walkId: walk.id });

  const onStart = () => setModalOpen(true);

  return (
    <>
      <View style={s.row}>
        <TouchableOpacity
          style={s.rowMain}
          onPress={openWalk}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Open walk for ${dogsTitle}`}>
          <Text style={s.time} numberOfLines={1}>
            {timeH}{" "}
            <Text style={s.timePeriod}>{timeAp}</Text>
          </Text>
          <View style={s.divider} />
          <View style={s.detail}>
            <View style={s.nameRow}>
              <View style={s.emojiSlot} pointerEvents="none">
                <DogEmojiStack variant="schedule" dogs={dogs} />
              </View>
              <Text style={s.dogName} numberOfLines={1}>
                {dogsTitle}
              </Text>
              {client?.name ? (
                <Text style={s.clientName} numberOfLines={1}>
                  · {client.name}
                </Text>
              ) : null}
            </View>
            <Text style={s.meta} numberOfLines={1}>
              ${totalPrice} · {walk.durationMinutes} min
            </Text>
          </View>
        </TouchableOpacity>
        <View style={s.actions}>
          <Text style={s.badge}>Scheduled</Text>
          <TouchableOpacity
            style={s.btnStart}
            onPress={onStart}
            activeOpacity={0.78}
            accessibilityRole="button"
            accessibilityLabel="Start walk">
            <Text style={s.btnStartText}>Start</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScheduledAnotherDayModal
        visible={modalOpen}
        onDismiss={() => setModalOpen(false)}
        onReschedule={() => {
          setModalOpen(false);
          navigation.navigate("EditWalk", { walkId: walk.id });
        }}
      />
    </>
  );
}

function createFuturewalkrowStyles(colors: ThemeColors) {
  return StyleSheet.create({
  row: {
    marginTop: 6,
    marginHorizontal: 10,
    marginBottom: 10,
    backgroundColor: colors.surfaceHigh,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  time: {
    fontSize: 18,
    fontWeight: "500",
    color: colors.text,
    letterSpacing: -0.03 * 18,
    flexShrink: 0,
  },
  timePeriod: {
    fontSize: 11,
    fontWeight: "400",
    color: colors.textMuted,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    backgroundColor: colors.border,
    flexShrink: 0,
  },
  detail: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: 0,
  },
  emojiSlot: {
    flexShrink: 0,
  },
  dogName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    flexShrink: 1,
  },
  clientName: {
    fontSize: 12,
    color: colors.textMuted,
    flexShrink: 0,
  },
  meta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 6,
    flexShrink: 0,
  },
  badge: {
    backgroundColor: colors.greenSubtle,
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 9,
    fontSize: 11,
    color: colors.textMuted,
    overflow: "hidden",
  },
  btnStart: {
    backgroundColor: colors.greenDeep,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.greenBorder,
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 16,
  },
  btnStartText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.greenText,
  },
});
}
