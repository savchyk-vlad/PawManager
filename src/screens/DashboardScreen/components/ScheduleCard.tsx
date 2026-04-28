import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { differenceInMinutes, format, isValid, parseISO } from "date-fns";
import { RootStackParamList } from "../../../navigation";
import { useAppStore } from "../../../store";
import { Walk } from "../../../types";
import { isWalkLateToStart } from "../../../lib/missedWalksService";
import { walkCharge } from "../../../lib/walkMetrics";
import { DogEmojiStack } from "../../../components/DogEmojiStack";
import { colors } from "../../../theme";

type Nav = NativeStackNavigationProp<RootStackParamList>;

function parseWalkDate(iso: string | undefined): Date | null {
  if (!iso) return null;
  const t = parseISO(iso);
  return isValid(t) ? t : null;
}

export function ScheduleCard({ walk }: { walk: Walk }) {
  const navigation = useNavigation<Nav>();
  const { clients, startWalk } = useAppStore();
  const client = clients.find((c) => c.id === walk.clientId);
  const dogs = client ? client.dogs.filter((d) => walk.dogIds.includes(d.id)) : [];
  const totalPrice = walkCharge(walk, client);
  const t = parseWalkDate(walk.scheduledAt);
  const scheduledPart = t ? format(t, "EEE, MMM d · h:mm a") : "—";
  const now = new Date();
  const isOverdue = walk.status === "scheduled" && isWalkLateToStart(walk);
  const isActive = walk.status === "in_progress";
  const minutesUntil = t ? differenceInMinutes(t, now) : 999;
  const isSoon = !isOverdue && !isActive && minutesUntil <= 90;
  const variant: "overdue" | "active" | "soon" | "later" = isActive
    ? "active"
    : isOverdue
      ? "overdue"
      : isSoon
        ? "soon"
        : "later";

  const badgeLabel = isOverdue
    ? `Overdue · ${scheduledPart}`
    : isActive
      ? "Active now"
      : scheduledPart;

  const handlePress = () => navigation.navigate("ActiveWalk", { walkId: walk.id });
  const handleStart = async () => {
    try {
      await startWalk(walk.id);
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Could not start walk.");
    }
  };

  return (
    <TouchableOpacity style={sc.card} onPress={handlePress} activeOpacity={0.75}>
      <View style={sc.top}>
        <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
          <Text style={sc.clientName} numberOfLines={1}>
            {client?.name ?? "Client"}
          </Text>
          <View style={[sc.badge, sc[`badge_${variant}` as keyof typeof sc] as any]}>
            <Text style={[sc.badgeText, sc[`badgeText_${variant}` as keyof typeof sc] as any]}>
              {badgeLabel}
            </Text>
          </View>
          <View style={sc.meta}>
            <Text style={sc.metaTxt}>{walk.durationMinutes} min</Text>
            <View style={sc.metaDot} />
            <Text style={sc.metaPrice}>${totalPrice}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[sc.btn, sc[`btn_${variant}` as keyof typeof sc] as any]}
          onPress={isActive ? handlePress : handleStart}
          activeOpacity={0.8}>
          <Text style={[sc.btnText, sc[`btnText_${variant}` as keyof typeof sc] as any]}>
            {isActive ? "Details" : "Start"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={sc.dogsWrap}>
        {dogs.length === 0 ? (
          <View style={sc.dogsRowPad}>
            <Text style={sc.noDogs}>No dogs</Text>
          </View>
        ) : dogs.length === 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={sc.dogsRow}>
              <View style={sc.dpill}>
                <View style={sc.dpillIcon}>
                  <Text style={{ fontSize: 12 }}>{dogs[0].emoji}</Text>
                </View>
                <Text style={sc.dpillName}>{dogs[0].name}</Text>
              </View>
            </View>
          </ScrollView>
        ) : (
          <View style={sc.dogsRowPad}>
            <View style={sc.dogsMultiRow}>
              <DogEmojiStack variant="schedule" dogs={dogs} />
              <Text style={sc.dogsMultiNames} numberOfLines={2}>
                {dogs.map((d) => d.name).join(" · ")}
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const sc = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    overflow: "hidden",
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 13,
  },
  clientName: { fontSize: 15, fontWeight: "500", color: "#fff" },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  badge_overdue: { backgroundColor: "#3a1e00", borderColor: "#7a4010" },
  badge_active: { backgroundColor: "#1a3a2a", borderColor: "#2a6040" },
  badge_soon: { backgroundColor: "#1a3a2a", borderColor: "#2a6040" },
  badge_later: { backgroundColor: "#1a3a2a", borderColor: "#2a6040" },
  badgeText: { fontSize: 11, fontWeight: "500" },
  badgeText_overdue: { color: "#e5a040" },
  badgeText_active: { color: colors.greenText },
  badgeText_soon: { color: colors.greenText },
  badgeText_later: { color: colors.greenText },
  meta: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaTxt: { fontSize: 12, color: "rgba(255,255,255,0.45)" },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  metaPrice: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.75)",
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    flexShrink: 0,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "transparent",
  },
  btn_overdue: { backgroundColor: "#e5a040", borderColor: "#e5a040" },
  btn_active: { backgroundColor: "#1a3a2a", borderColor: "#2a6040" },
  btn_soon: { backgroundColor: "#1a3a2a", borderColor: "#2a6040" },
  btn_later: { backgroundColor: "#1a3a2a", borderColor: "#2a6040" },
  btnText: { fontSize: 13, fontWeight: "500" },
  btnText_overdue: { color: "#1a0e00" },
  btnText_active: { color: colors.greenText },
  btnText_soon: { color: colors.greenText },
  btnText_later: { color: colors.greenText },
  dogsWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.07)",
  },
  dogsRow: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dogsRowPad: { paddingHorizontal: 12, paddingVertical: 8 },
  dogsMultiRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dogsMultiNames: {
    flex: 1,
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.75)",
  },
  dpill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    paddingLeft: 4,
    paddingRight: 9,
    paddingVertical: 4,
  },
  dpillIcon: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  dpillName: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255,255,255,0.75)",
  },
  noDogs: { fontSize: 12, color: "rgba(255,255,255,0.3)", paddingVertical: 4 },
});
