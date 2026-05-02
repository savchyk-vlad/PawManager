import React from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { differenceInCalendarDays, isValid, parseISO } from "date-fns";
import { RootStackParamList } from "../../../navigation";
import { Client, Walk } from "../../../types";
import { clientAvatarTint } from "../../../lib/clientAvatarColors";
import { getInitials } from "../../../lib/utils";
import { useThemeColors } from "../../../theme";

type Nav = NativeStackNavigationProp<RootStackParamList>;

function lastWalkLabel(clientId: string, walks: Walk[]): string {
  const done = walks.filter(
    (w) => w.clientId === clientId && (w.status === "done" || w.status === "in_progress"),
  );
  if (done.length === 0) return "No walks yet";
  const latest = done.reduce((best, w) =>
    w.scheduledAt.localeCompare(best.scheduledAt) > 0 ? w : best,
  );
  const d = parseISO(latest.scheduledAt);
  if (!isValid(d)) return "No walks yet";
  const diff = differenceInCalendarDays(new Date(), d);
  if (diff === 0) return "Last walk today";
  if (diff === 1) return "Last walk yesterday";
  return `Last walk ${diff} days ago`;
}

type Props = {
  client: Client;
  walks: Walk[];
  styles: any;
};

export function ClientCard({ client, walks, styles }: Props) {
  const colors = useThemeColors();
  const navigation = useNavigation<Nav>();
  const activeDogs = client.dogs.filter((dog) => !dog.isDeleted);

  const unpaidWalks = walks.filter(
    (w) => w.clientId === client.id && w.paymentStatus === "unpaid" && w.status === "done",
  );
  const unpaidCount = unpaidWalks.length;
  const allPaid = unpaidCount === 0;
  const avatarTint = clientAvatarTint(client.id);
  const walkLabel = lastWalkLabel(client.id, walks);

  const handleCall = () => {
    if (!client.phone) return;
    Linking.openURL(`tel:${client.phone.replace(/[^0-9+]/g, "")}`).catch(() => {});
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("ClientDetail", { clientId: client.id })}
      activeOpacity={0.75}>
      <View style={styles.cardTop}>
        <View style={styles.avatarWrap}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: avatarTint.backgroundColor },
            ]}>
            <Text style={[styles.avatarText, { color: avatarTint.color }]}>
              {getInitials(client.name)}
            </Text>
          </View>
          <View style={styles.dot} />
        </View>

        <View style={styles.cardMid}>
          <Text style={styles.clientName} numberOfLines={1}>
            {client.name}
          </Text>
          <View style={styles.chipsRow}>
            {activeDogs.length > 0 ? (
              activeDogs.map((dog) => (
                <View key={dog.id} style={styles.chip}>
                  <Text style={styles.chipEmoji}>{dog.emoji}</Text>
                  <Text style={styles.chipText}>{dog.name}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDog}>No dogs added</Text>
            )}
          </View>
        </View>

        <View style={styles.payCol}>
          <Text style={styles.priceWalk}>${client.pricePerWalk}/walk</Text>
          <Ionicons
            name="chevron-forward"
            size={11}
            color={colors.textMuted}
            style={{ marginTop: 3 }}
          />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBottom}>
        <View style={styles.bottomLeft}>
          <Text style={styles.bottomIcon}>🗓</Text>
          <Text style={styles.bottomMeta}>{walkLabel}</Text>
        </View>

        <View style={styles.bottomSep} />

        <View style={styles.bottomMid}>
          {allPaid ? (
            <>
              <Ionicons name="checkmark" size={12} color={colors.textSecondary} />
              <Text style={styles.allPaidText}> All paid up</Text>
            </>
          ) : (
            <>
              <Text style={styles.bottomIcon}>🗒</Text>
              <Text style={styles.unpaidMeta}>
                {unpaidCount} unpaid walk{unpaidCount !== 1 ? "s" : ""}
              </Text>
            </>
          )}
        </View>

        <TouchableOpacity
          style={[styles.callBtn, !client.phone && { opacity: 0.3 }]}
          onPress={handleCall}
          disabled={!client.phone}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
          <Ionicons name="call-outline" size={13} color={colors.greenDefault} />
          <Text style={styles.callText}>Call</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
