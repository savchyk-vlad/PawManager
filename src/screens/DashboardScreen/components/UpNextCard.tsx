import React, { useMemo } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { differenceInMinutes, format } from "date-fns";
import { RootStackParamList } from "../../../navigation";
import { useAppStore } from "../../../store";
import { Walk } from "../../../types";
import {
  getWalkWindowEndTime,
  isWalkLateToStart,
} from "../../../lib/missedWalksService";
import { DogEmojiStack } from "../../../components/DogEmojiStack";
import { useThemeColors, type ThemeColors } from "../../../theme";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  walk: Walk;
  parseWalkDate: (iso: string | undefined) => Date | null;
};

export function UpNextCard({ walk, parseWalkDate }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createUpnextcardStyles(colors), [colors]);
  const navigation = useNavigation<Nav>();
  const { clients, startWalk } = useAppStore();
  const client = clients.find((c) => c.id === walk.clientId);
  const dogs = client
    ? client.dogs.filter((d) => walk.dogIds.includes(d.id))
    : [];
  const dogNames = dogs.map((d) => d.name).join(" & ") || "Walk";
  const t = parseWalkDate(walk.scheduledAt);
  const time = t ? format(t, "EEE, MMM d · h:mm a") : "—";
  const minsUntil = t ? differenceInMinutes(t, new Date()) : 0;
  const inMinutesLabel =
    minsUntil <= 0 ? null : minsUntil === 1 ? "1" : String(minsUntil);
  const isLate = isWalkLateToStart(walk);
  const windowEnd = getWalkWindowEndTime(walk);
  const minsToWindowEnd = windowEnd
    ? differenceInMinutes(windowEnd, new Date())
    : null;

  const openWalk = () => navigation.navigate("ActiveWalk", { walkId: walk.id });

  return (
    <View style={styles.shell}>
      <TouchableOpacity
        style={styles.main}
        activeOpacity={0.9}
        onPress={openWalk}>
        <View style={styles.timeRow}>
          <View>
            <Text style={styles.timeLabel}>Scheduled</Text>
            <Text style={styles.timeBig}>{time}</Text>
          </View>
          <View style={styles.countdown}>
            <Ionicons
              name="time-outline"
              size={16}
              color={isLate ? colors.amberDefault : colors.greenText}
            />
            {isLate ? (
              <View>
                <Text style={styles.overdueLabel}>Waiting</Text>
                {minsToWindowEnd != null && minsToWindowEnd >= 0 && (
                  <Text style={styles.overdueSub}>
                    {minsToWindowEnd === 0
                      ? "Under 1 min"
                      : `~${minsToWindowEnd} min`}{" "}
                    to window end
                  </Text>
                )}
              </View>
            ) : minsUntil <= 0 ? (
              <Text style={styles.countdownEm}>Starting now</Text>
            ) : (
              <Text style={styles.countdownText}>
                in <Text style={styles.countdownEm}>{inMinutesLabel} min</Text>
              </Text>
            )}
          </View>
        </View>
        <View style={styles.bodyRow}>
          <DogEmojiStack variant="upNext" dogs={dogs} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.dog} numberOfLines={2}>
              {dogNames}
            </Text>
            <Text style={styles.client} numberOfLines={1}>
              {client?.name ?? "Client"}
              <Text style={styles.dot}> · </Text>
              {walk.durationMinutes} min
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.start}
        activeOpacity={0.9}
        onPress={async () => {
          try {
            await startWalk(walk.id);
          } catch (error: any) {
            Alert.alert("Error", error?.message ?? "Could not start walk.");
          }
        }}
        accessibilityLabel="Start walk">
        <Ionicons
          name="play"
          size={18}
          color="#fff"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.startText}>Start</Text>
      </TouchableOpacity>
    </View>
  );
}

function createUpnextcardStyles(colors: ThemeColors) {
  return StyleSheet.create({
  shell: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.greenBorder,
  },
  main: {
    padding: 16,
    paddingBottom: 12,
    backgroundColor: colors.greenSubtle,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textSecondary,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  timeBig: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.5,
  },
  countdown: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: "58%",
  },
  countdownText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  countdownEm: {
    color: colors.greenText,
    fontWeight: "700",
  },
  overdueLabel: {
    color: colors.amberDefault,
    fontSize: 13,
    fontWeight: "800",
  },
  overdueSub: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 1,
  },
  bodyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  dog: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  client: { fontSize: 13, color: colors.textSecondary },
  dot: { color: colors.textSecondary, opacity: 0.6 },
  start: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.greenDeep,
    paddingVertical: 15,
  },
  startText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
}
