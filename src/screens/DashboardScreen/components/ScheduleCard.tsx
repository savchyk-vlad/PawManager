import React from "react";
import {
  Alert,
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
import { Ionicons } from "@expo/vector-icons";

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
  const timeH = t ? format(t, "h:mm") : "—";
  const timeAp = t ? format(t, "a") : "";
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

  const badgeLabel = isOverdue ? "Waiting" : isActive ? "Active" : "Scheduled";
  const dogsTitle = dogs.map((d) => d.name).join(" & ") || "Walk";

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
        <View style={sc.timeCol}>
          <Text style={sc.timeVal}>{timeH}</Text>
          <Text style={sc.timeAp}>{timeAp}</Text>
        </View>
        <View style={sc.vDivider} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={sc.titleRow}>
            <View style={sc.titleLeft}>
              {dogs.length > 0 ? (
                <DogEmojiStack variant="schedule" dogs={dogs} />
              ) : null}
              <Text style={sc.walkTitle} numberOfLines={1}>
                {dogsTitle}
              </Text>
            </View>
            <View style={[sc.badge, sc[`badge_${variant}` as keyof typeof sc] as any]}>
              <Text
                style={[
                  sc.badgeText,
                  sc[`badgeText_${variant}` as keyof typeof sc] as any,
                ]}>
                {badgeLabel}
              </Text>
            </View>
          </View>
          <View style={sc.subMetaRow}>
            <Ionicons
              name="person-outline"
              size={14}
              color={colors.textMuted}
              style={{ marginTop: 1 }}
            />
            <Text style={sc.subMeta} numberOfLines={1}>
              {client?.name ?? "Client"}
            </Text>
          </View>
          <View style={sc.bottomRow}>
            <View style={sc.priceDurRow}>
              <Text style={sc.priceLine} numberOfLines={1}>
                ${totalPrice}
              </Text>
              <Text style={sc.priceSep}>·</Text>
              <Text style={sc.durLine} numberOfLines={1}>
                {walk.durationMinutes} min
              </Text>
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
        </View>
      </View>

      {/* Dog icons are shown in the title row; avoid duplicating them below. */}
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
  timeCol: { width: 62, alignItems: "center" },
  timeVal: { fontSize: 22, fontWeight: "700", color: colors.text, letterSpacing: -0.4 },
  timeAp: { marginTop: 2, fontSize: 12, color: colors.textMuted, fontWeight: "500" },
  vDivider: { width: StyleSheet.hairlineWidth, alignSelf: "stretch", backgroundColor: "rgba(255,255,255,0.10)" },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  titleLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, minWidth: 0 },
  walkTitle: { fontSize: 18, fontWeight: "700", color: colors.text, letterSpacing: -0.4, flex: 1, minWidth: 0 },
  subMetaRow: { marginTop: 3, flexDirection: "row", alignItems: "center", gap: 6 },
  subMeta: { fontSize: 13, color: colors.textMuted, fontWeight: "500", flex: 1, minWidth: 0 },
  bottomRow: { marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  priceDurRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1, minWidth: 0 },
  priceLine: { fontSize: 12, color: colors.textSecondary, fontWeight: "600" },
  priceSep: { fontSize: 12, color: "rgba(255,255,255,0.22)", fontWeight: "700" },
  durLine: { fontSize: 12, color: colors.textMuted, fontWeight: "600" },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  badge_overdue: { backgroundColor: colors.amberSubtle, borderColor: "rgba(240,160,48,0.35)" },
  badge_active: { backgroundColor: colors.greenSubtle, borderColor: colors.greenBorder },
  badge_soon: { backgroundColor: colors.greenSubtle, borderColor: colors.greenBorder },
  badge_later: { backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.10)" },
  badgeText: { fontSize: 11, fontWeight: "500" },
  badgeText_overdue: { color: colors.amberDefault, fontWeight: "700" },
  badgeText_active: { color: colors.greenText, fontWeight: "700" },
  badgeText_soon: { color: colors.greenText, fontWeight: "700" },
  badgeText_later: { color: colors.textSecondary, fontWeight: "700" },
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
});
