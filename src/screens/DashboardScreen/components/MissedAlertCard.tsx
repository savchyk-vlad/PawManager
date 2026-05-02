import React, {useState, useMemo} from "react";
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
import { format } from "date-fns";
import { RootStackParamList } from "../../../navigation";
import { useAppStore } from "../../../store";
import { Walk } from "../../../types";
import { walkCharge } from "../../../lib/walkMetrics";
import { ConfirmDeleteSheet } from "../../../components/ConfirmDeleteSheet";
import { DogEmojiStack } from "../../../components/DogEmojiStack";
import { useThemeColors, type ThemeColors } from "../../../theme";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  walks: Walk[];
  parseWalkDate: (iso: string | undefined) => Date | null;
};

export function MissedAlertCard({ walks, parseWalkDate }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createMissedalertcardStyles(colors), [colors]);
  const navigation = useNavigation<Nav>();
  const { clients, markMissedAsComplete, cancelWalk } = useAppStore();
  const [cancelSheetWalkId, setCancelSheetWalkId] = useState<string | null>(
    null,
  );
  const [cancellingCancel, setCancellingCancel] = useState(false);

  const sheetWalk = cancelSheetWalkId
    ? walks.find((w) => w.id === cancelSheetWalkId)
    : undefined;
  const sheetClient = sheetWalk
    ? clients.find((c) => c.id === sheetWalk.clientId)
    : undefined;
  const sheetParsed = sheetWalk ? parseWalkDate(sheetWalk.scheduledAt) : null;
  const sheetTimeLabel = sheetParsed
    ? format(sheetParsed, "EEE, MMM d · h:mm a")
    : "—";

  return (
    <View style={styles.stack}>
      {walks.map((walk) => {
        const client = clients.find((c) => c.id === walk.clientId);
        const dogs = client
          ? client.dogs.filter((d) => walk.dogIds.includes(d.id))
          : [];
        const t = parseWalkDate(walk.scheduledAt);
        const scheduledPart = t ? format(t, "EEE, MMM d · h:mm a") : "—";
        const price = walkCharge(walk, client);

        const onMarkDone = () =>
          Alert.alert(
            "Mark complete?",
            "This will add a completed walk to billing.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Mark done",
                onPress: () =>
                  void markMissedAsComplete(walk.id).catch((e: Error) =>
                    Alert.alert(
                      "Error",
                      e?.message ?? "Could not update walk.",
                    ),
                  ),
              },
            ],
          );

        const onReschedule = () =>
          navigation.navigate("EditWalk", { walkId: walk.id });

        const onCancel = () => setCancelSheetWalkId(walk.id);

        return (
          <View key={walk.id} style={styles.card}>
            <View style={styles.info}>
              <Text style={styles.clientName} numberOfLines={1}>
                {client?.name ?? "Client"}
              </Text>
              <View style={styles.missedPill}>
                <View style={styles.missedDot} />
                <Text style={styles.missedPillText}>Missed · {scheduledPart}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaTxt}>{walk.durationMinutes} min</Text>
                <View style={styles.metaDot} />
                <Text style={styles.metaTxt}>${price}</Text>
              </View>

              <View style={styles.dogsRow}>
                {dogs.length === 0 ? (
                  <Text style={styles.noDogs}>No dogs</Text>
                ) : dogs.length === 1 ? (
                  <View style={styles.dogChip}>
                    <View style={styles.dogEmojiCircle}>
                      <Text style={{ fontSize: 18 }}>{dogs[0].emoji}</Text>
                    </View>
                    <View style={{ flexShrink: 1 }}>
                      <Text style={styles.dogName} numberOfLines={1}>
                        {dogs[0].name}
                      </Text>
                      <Text style={styles.dogBreed} numberOfLines={1}>
                        {dogs[0].breed || "Breed not provided"}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.dogsMultiMissed}>
                    <DogEmojiStack variant="missed" dogs={dogs} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.dogName} numberOfLines={2}>
                        {dogs.map((d) => d.name).join(" · ")}
                      </Text>
                      <Text style={styles.dogBreed} numberOfLines={2}>
                        {dogs.map((d) => d.breed || "—").join(" · ")}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={onMarkDone}
                activeOpacity={0.75}>
                <View style={styles.actionIconCircle}>
                  <Ionicons name="checkmark" size={14} color="#4fc882" />
                </View>
                <Text style={styles.actionTxt}>Mark done</Text>
              </TouchableOpacity>
              <View style={styles.actionSep} />
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={onReschedule}
                activeOpacity={0.75}>
                <View style={styles.actionIconCircle}>
                  <Ionicons
                    name="return-up-back"
                    size={14}
                    color="rgba(255,255,255,0.7)"
                  />
                </View>
                <Text style={styles.actionTxt}>Reschedule</Text>
              </TouchableOpacity>
              <View style={styles.actionSep} />
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={onCancel}
                activeOpacity={0.75}>
                <View style={styles.actionIconCircle}>
                  <Ionicons name="close" size={14} color="#e05555" />
                </View>
                <Text style={styles.actionTxt}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
      <ConfirmDeleteSheet
        visible={sheetWalk != null}
        title="Cancel this walk?"
        subtitle="It will not be billable."
        confirmLabel="Cancel walk"
        loading={cancellingCancel}
        onConfirm={async () => {
          if (!sheetWalk) return;
          setCancellingCancel(true);
          try {
            await cancelWalk(sheetWalk.id);
            setCancelSheetWalkId(null);
          } catch (e: any) {
            Alert.alert("Error", e?.message ?? "Could not cancel.");
          } finally {
            setCancellingCancel(false);
          }
        }}
        onCancel={() => setCancelSheetWalkId(null)}
        rows={
          sheetWalk && sheetClient
            ? [
                { label: "Client", value: sheetClient.name },
                { label: "Scheduled", value: sheetTimeLabel },
              ]
            : []
        }
      />
    </View>
  );
}

function createMissedalertcardStyles(colors: ThemeColors) {
  return StyleSheet.create({
  stack: { gap: 10 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(224,64,64,0.18)",
    overflow: "hidden",
  },
  info: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14, gap: 6 },
  clientName: { fontSize: 18, fontWeight: "600", color: colors.text },
  missedPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(224,64,64,0.18)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  missedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#e05555",
  },
  missedPillText: { fontSize: 12, fontWeight: "500", color: "#e05555" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaTxt: { fontSize: 13, color: "rgba(255,255,255,0.5)" },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  dogsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  dogsMultiMissed: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    flex: 1,
    backgroundColor: "#252520",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: "100%",
  },
  dogChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#252520",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dogEmojiCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1A1A18",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dogName: { fontSize: 13, fontWeight: "600", color: colors.text },
  dogBreed: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  noDogs: { fontSize: 13, color: colors.textMuted },
  actions: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 12,
  },
  actionSep: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  actionIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionTxt: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255,255,255,0.75)",
  },
});
}
