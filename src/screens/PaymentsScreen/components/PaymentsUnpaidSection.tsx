import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Client, Walk } from "../../../types";
import { walkCharge } from "../../../lib/walkMetrics";
import { RootStackParamList } from "../../../navigation";
import { useThemeColors } from "../../../theme";
import {
  createPaymentsSectionsStyles,
  type PaymentsSectionsStyles,
} from "../paymentsSections.styles";
import {
  ClientPaymentsEntry,
  currency,
  walkDate,
} from "../paymentsUtils";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  monthLabel: string;
  unpaidByClient: ClientPaymentsEntry[];
  expandedClientId: string | null;
  navigation: Nav;
  onToggleClient: (clientId: string) => void;
  onMarkWalkPaid: (walk: Walk, client: Client) => void;
};

export function PaymentsUnpaidSection({
  monthLabel,
  unpaidByClient,
  expandedClientId,
  navigation,
  onToggleClient,
  onMarkWalkPaid,
}: Props) {
  const colors = useThemeColors();
  const st = useMemo(() => createPaymentsSectionsStyles(colors), [colors]);
  const grandTotal = unpaidByClient.reduce((sum, entry) => sum + entry.total, 0);

  return (
    <>
      <View style={st.sectionRow}>
        <Text style={st.sectionLabel}>Unpaid</Text>
        {grandTotal > 0 ? (
          <Text style={st.unpaidSectionTotal}>{currency(grandTotal)}</Text>
        ) : null}
      </View>

      {unpaidByClient.length === 0 ? (
        <View style={st.paidSectionCard}>
          <View style={st.emptyPaidBody}>
          <Text style={st.emptyText}>
            No unpaid completed walks for {monthLabel}.
          </Text>
          </View>
        </View>
      ) : (
        unpaidByClient.map((entry) => {
          const isOpen = expandedClientId === entry.client.id;
          return (
            <View key={entry.client.id} style={st.unpaidClientCard}>
              <TouchableOpacity
                style={[st.unpaidClientHeader, !isOpen && st.unpaidClientHeaderCollapsed]}
                onPress={() => onToggleClient(entry.client.id)}
                activeOpacity={0.86}>
                <View style={st.unpaidClientLeft}>
                  <View
                    style={[
                      st.unpaidClientAvatar,
                      unpaidAvatarTone(entry.client.name, st),
                    ]}>
                    <Text style={st.unpaidClientAvatarText}>
                      {entry.client.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={st.unpaidClientName}>{entry.client.name}</Text>
                    <Text style={st.unpaidClientSub}>
                      {entry.walkCount} unpaid walk
                      {entry.walkCount === 1 ? "" : "s"}
                    </Text>
                  </View>
                </View>

                <View style={st.unpaidClientRight}>
                  <Text style={st.unpaidClientAmount}>{currency(entry.total)}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="rgba(255,255,255,0.2)"
                    style={isOpen ? st.chevronOpen : undefined}
                  />
                </View>
              </TouchableOpacity>

              {isOpen ? (
                <View style={st.unpaidClientBody}>
                  <View style={st.unpaidWalkList}>
                    {entry.walks.map((walk, index) => {
                      const amount = walkCharge(walk, entry.client);
                      const scheduled = walkDate(walk);
                      const duration =
                        walk.actualDurationMinutes ?? walk.durationMinutes;
                      const walkDogs = entry.client.dogs.filter((dog) =>
                        walk.dogIds.includes(dog.id),
                      );
                      const dogLabel =
                        walkDogs.map((dog) => dog.name).join(", ") || "Walk";
                      const dogMeta =
                        walkDogs.length <= 1
                          ? walkDogs[0]?.breed || "Breed not provided"
                          : `${walkDogs.length} dogs`;

                      return (
                        <View key={walk.id}>
                          <TouchableOpacity
                            style={st.unpaidWalkRow}
                            onPress={() =>
                              navigation.navigate("ActiveWalk", { walkId: walk.id })
                            }
                            activeOpacity={0.82}>
                            <View style={st.unpaidWalkBadge}>
                              <Text style={st.unpaidWalkBadgeDay}>
                                {format(scheduled, "d")}
                              </Text>
                              <Text style={st.unpaidWalkBadgeMon}>
                                {format(scheduled, "MMM")}
                              </Text>
                            </View>

                            <View style={st.unpaidWalkInfo}>
                              <View style={st.unpaidWalkTop}>
                                <Text style={st.unpaidWalkName}>
                                  {entry.client.name}
                                </Text>
                                <Text style={st.unpaidWalkDog} numberOfLines={1}>
                                  {dogLabel} · {dogMeta}
                                </Text>
                              </View>
                              <View style={st.unpaidWalkMeta}>
                                <Text style={st.unpaidWalkTime}>
                                  {format(scheduled, "h:mm a")}
                                </Text>
                                <Text style={st.unpaidWalkDuration}>· {duration} min</Text>
                              </View>
                            </View>

                            <View style={st.unpaidWalkRight}>
                              <Text style={st.unpaidWalkAmount}>{currency(amount)}</Text>
                              <TouchableOpacity
                                style={st.unpaidMarkPaidButton}
                                onPress={() => onMarkWalkPaid(walk, entry.client)}
                                activeOpacity={0.84}>
                                <Text style={st.unpaidMarkPaidButtonText}>Mark paid</Text>
                              </TouchableOpacity>
                            </View>
                          </TouchableOpacity>

                          {index < entry.walks.length - 1 ? (
                            <View style={st.unpaidWalkSeparator} />
                          ) : null}
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : null}
            </View>
          );
        })
      )}
    </>
  );
}

function unpaidAvatarTone(name: string, st: PaymentsSectionsStyles) {
  const first = name.trim().charCodeAt(0) || 0;
  return first % 2 === 0
    ? st.unpaidClientAvatarAmber
    : st.unpaidClientAvatarTeal;
}
