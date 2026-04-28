import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { format, isToday } from "date-fns";
import { useAppStore } from "../../../store";
import { RootStackParamList } from "../../../navigation";
import { Client, Dog, Walk } from "../../../types";
import { walkCharge } from "../../../lib/walkMetrics";
import { colors } from "../../../theme";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function InfoRow({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: any;
}) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoKey}>{label}</Text>
      <Text style={styles.infoVal} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

export function DogCard({
  dog,
  clientId,
  styles,
}: {
  dog: Dog;
  clientId: string;
  styles: any;
}) {
  const navigation = useNavigation<Nav>();
  const walks = useAppStore((st) => st.walks);
  const doneWalks = walks.filter((w) => w.dogIds.includes(dog.id) && w.status === "done");
  const lastWalk = doneWalks.sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))[0];

  return (
    <TouchableOpacity
      style={styles.dogListItem}
      activeOpacity={0.92}
      onPress={() => navigation.navigate("DogDetail", { clientId, dogId: dog.id })}>
      <View style={styles.dogCardHeader}>
        <View style={styles.dogAvatarLg}>
          <Text style={{ fontSize: 32 }}>{dog.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.dogName}>{dog.name}</Text>
          <Text style={styles.dogBreed}>{dog.breed}</Text>
          {(dog.age > 0 || dog.weight > 0) && (
            <Text style={styles.dogMeta}>
              {dog.age > 0 ? `${dog.age} yrs` : ""}
              {dog.age > 0 && dog.weight > 0 ? " · " : ""}
              {dog.weight > 0 ? `${dog.weight} lbs` : ""}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>

      <View style={styles.dogStatStrip}>
        <View style={styles.dogStat}>
          <Ionicons name="paw-outline" size={12} color={colors.textMuted} />
          <Text style={styles.dogStatTxt}>
            {doneWalks.length} walk{doneWalks.length !== 1 ? "s" : ""}
          </Text>
        </View>
        {lastWalk ? (
          <View style={styles.dogStat}>
            <Ionicons name="time-outline" size={12} color={colors.textMuted} />
            <Text style={styles.dogStatTxt}>
              Last {format(new Date(lastWalk.scheduledAt), "MMM d")}
            </Text>
          </View>
        ) : null}
        {dog.keyLocation ? (
          <View style={styles.dogStat}>
            <Ionicons name="key-outline" size={12} color={colors.textMuted} />
            <Text style={styles.dogStatTxt} numberOfLines={1}>
              {dog.keyLocation}
            </Text>
          </View>
        ) : null}
        {dog.medical ? (
          <View style={[styles.dogStat, styles.dogStatAmber]}>
            <Ionicons name="alert-circle-outline" size={12} color={colors.amberDefault} />
            <Text style={[styles.dogStatTxt, { color: colors.amberDefault }]}>Medical notes</Text>
          </View>
        ) : null}
      </View>

      {dog.traits.length > 0 && (
        <View style={styles.traitRow}>
          {dog.traits.map((t) => (
            <View
              key={t.label}
              style={[
                styles.trait,
                {
                  backgroundColor:
                    t.type === "positive"
                      ? "rgba(91,175,114,0.15)"
                      : t.type === "red"
                        ? "rgba(226,75,74,0.16)"
                        : colors.amberSubtle,
                },
              ]}>
              <Text
                style={[
                  styles.traitText,
                  {
                    color:
                      t.type === "positive"
                        ? colors.greenDefault
                        : t.type === "red"
                          ? "#F09595"
                          : colors.amberDefault,
                  },
                ]}>
                {t.type === "positive" ? "✓" : t.type === "red" ? "!" : "⚠"} {t.label}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.dogInfoBlock}>
        {dog.vet ? (
          <InfoRow
            label="Vet"
            value={`${dog.vet}${dog.vetPhone ? ` · ${dog.vetPhone}` : ""}`}
            styles={styles}
          />
        ) : null}
        {dog.medical ? <InfoRow label="Medical" value={dog.medical} styles={styles} /> : null}
        {dog.keyLocation ? <InfoRow label="Key" value={dog.keyLocation} styles={styles} /> : null}
      </View>
    </TouchableOpacity>
  );
}

export function WalkRow({
  walk,
  client,
  styles,
}: {
  walk: Walk;
  client: Client;
  styles: any;
}) {
  const billTotal = walkCharge(walk, client);
  const navigation = useNavigation<Nav>();
  const date = new Date(walk.scheduledAt);
  const dateLabel = isToday(date) ? `Today, ${format(date, "h:mm a")}` : format(date, "EEE MMM d · h:mm a");

  const statusMap = {
    done: { label: "Done", color: colors.greenDefault, bg: "rgba(91,175,114,0.12)" },
    scheduled: { label: "Scheduled", color: colors.textMuted, bg: "rgba(255,255,255,0.06)" },
    in_progress: { label: "Active", color: colors.amberDefault, bg: colors.amberSubtle },
    cancelled: { label: "Cancelled", color: colors.redDefault, bg: colors.redSubtle },
    missed: { label: "Missed", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  };
  const st = statusMap[walk.status] ?? statusMap.scheduled;
  const paymentMap = {
    unpaid: { label: "Unpaid", color: colors.amberDefault, bg: colors.amberSubtle },
    paid: { label: "Paid", color: colors.greenDefault, bg: "rgba(91,175,114,0.14)" },
    no_pay: { label: "No pay", color: colors.textSecondary, bg: "rgba(255,255,255,0.08)" },
  };
  const pay = paymentMap[walk.paymentStatus];

  return (
    <TouchableOpacity
      style={styles.walkRow}
      activeOpacity={0.82}
      onPress={() => navigation.navigate("ActiveWalk", { walkId: walk.id })}
      accessibilityRole="button"
      accessibilityLabel="Open walk details">
      <View style={{ flex: 1 }}>
        <Text style={styles.walkDate}>{dateLabel}</Text>
        <Text style={styles.walkMeta}>
          {walk.actualDurationMinutes ?? walk.durationMinutes} min · ${billTotal}
        </Text>
        {walk.status === "done" && (
          <View style={[styles.paymentBadge, { backgroundColor: pay.bg }]}>
            <Text style={[styles.paymentBadgeText, { color: pay.color }]}>{pay.label}</Text>
          </View>
        )}
      </View>
      <View style={styles.walkRight}>
        <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
          <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}
