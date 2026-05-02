import React, { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../navigation";
import { useThemeColors } from "../../../theme";
import { createPaymentsSectionsStyles } from "../paymentsSections.styles";
import { currency, PaidWalkEntry, walkDate } from "../paymentsUtils";
import { getPaymentMethodTone } from "../../../components/PaymentBadges";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  monthLabel: string;
  paidWalks: PaidWalkEntry[];
  collectedTotal: number;
  paidClientsThisMonth: number;
  navigation: Nav;
};

export function PaymentsPaidThisMonthSection({
  monthLabel,
  paidWalks,
  collectedTotal,
  paidClientsThisMonth,
  navigation,
}: Props) {
  const colors = useThemeColors();
  const st = useMemo(() => createPaymentsSectionsStyles(colors), [colors]);
  const [expandedDateKeys, setExpandedDateKeys] = useState<Record<string, boolean>>({});

  const groupedPaidWalks = useMemo(() => {
    const groups: Array<{
      key: string;
      label: string;
      shortLabel: string;
      walks: PaidWalkEntry[];
      total: number;
    }> = [];

    paidWalks.forEach((entry) => {
      const scheduled = walkDate(entry.walk);
      const key = format(scheduled, "yyyy-MM-dd");
      const label = format(scheduled, "EEEE, MMM d");
      const shortLabel = format(scheduled, "MMM yyyy");
      const existing = groups.find((group) => group.key === key);

      if (existing) {
        existing.walks.push(entry);
        existing.total += entry.amount;
        return;
      }

      groups.push({
        key,
        label,
        shortLabel,
        walks: [entry],
        total: entry.amount,
      });
    });

    return groups;
  }, [paidWalks]);

  return (
    <>
      <View style={[st.sectionRow, st.sectionRowPaid]}>
        <Text style={st.sectionLabel}>Paid this month</Text>
      </View>

      {paidWalks.length === 0 ? (
        <View style={st.paidSectionCard}>
          <View style={st.emptyPaidBody}>
            <Text style={st.emptyText}>No paid walks for {monthLabel}.</Text>
          </View>
        </View>
      ) : (
        groupedPaidWalks.map((group) => {
          const isExpanded = expandedDateKeys[group.key] === true;

          return (
            <View key={group.key} style={st.paidDayGroup}>
              <TouchableOpacity
                style={[st.paidDayHeader, !isExpanded && st.paidDayHeaderCollapsed]}
                onPress={() =>
                  setExpandedDateKeys((prev) => ({
                    ...prev,
                    [group.key]: !prev[group.key],
                  }))
                }
                activeOpacity={0.86}>
                <View style={st.paidDayLeft}>
                  <View style={st.paidDayDot} />
                  <Text style={st.paidDayLabel}>{group.label}</Text>
                </View>

                <View style={st.paidDayRight}>
                  <Text style={st.paidDaySum}>{currency(group.total)}</Text>
                  <View style={st.paidDayCountPill}>
                    <Text style={st.paidDayCountText}>
                      {group.walks.length} walk{group.walks.length === 1 ? "" : "s"}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color="rgba(255,255,255,0.22)"
                    style={isExpanded ? st.paidDayChevronOpen : undefined}
                  />
                </View>
              </TouchableOpacity>

              {isExpanded ? (
                <View style={st.paidDayWalks}>
                  {group.walks.map((entry, index) => {
                    const scheduled = walkDate(entry.walk);
                    const duration =
                      entry.walk.actualDurationMinutes ?? entry.walk.durationMinutes;
                    const walkDogs = entry.client.dogs.filter((dog) =>
                      entry.walk.dogIds.includes(dog.id),
                    );
                    const dogLabel = walkDogs.map((dog) => dog.name).join(", ") || "Walk";
                    const dogMeta =
                      walkDogs.length <= 1
                        ? walkDogs[0]?.breed || "Breed not provided"
                        : `${walkDogs.length} dogs`;
                    const methodLabel = entry.walk.paymentMethod
                      ? `Paid · ${formatMethod(entry.walk.paymentMethod)}`
                      : "Paid";
                    const methodTone = getPaymentMethodTone(entry.walk.paymentMethod, colors);

                    return (
                      <View key={entry.walk.id}>
                        <TouchableOpacity
                          style={st.paidWalkRow}
                          onPress={() =>
                            navigation.navigate("ActiveWalk", { walkId: entry.walk.id })
                          }
                          activeOpacity={0.82}>
                          <View style={st.paidWalkBadge}>
                            <Text style={st.paidWalkBadgeNum}>{format(scheduled, "d")}</Text>
                            <Text style={st.paidWalkBadgeMon}>{format(scheduled, "MMM")}</Text>
                          </View>

                          <View style={st.paidWalkInfo}>
                            <View style={st.paidWalkTop}>
                              <Text style={st.paidWalkClient}>{entry.client.name}</Text>
                              <Text style={st.paidWalkDog} numberOfLines={1}>
                                {dogLabel} · {dogMeta}
                              </Text>
                            </View>

                            <View style={st.paidWalkBottom}>
                              <Text style={st.paidWalkTime}>{format(scheduled, "h:mm a")}</Text>
                              <Text style={st.paidWalkDuration}>· {duration} min</Text>
                              <View
                                style={[
                                  st.paidWalkStatusPill,
                                  methodTone
                                    ? {
                                        backgroundColor: methodTone.bg,
                                        borderColor: "transparent",
                                      }
                                    : null,
                                ]}>
                                <Text
                                  style={[
                                    st.paidWalkStatusText,
                                    methodTone ? { color: methodTone.fg } : null,
                                  ]}>
                                  {methodLabel}
                                </Text>
                              </View>
                            </View>
                          </View>

                          <Text style={st.paidWalkAmount}>{currency(entry.amount)}</Text>
                        </TouchableOpacity>

                        {index < group.walks.length - 1 ? <View style={st.paidWalkSeparator} /> : null}
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </View>
          );
        })
      )}
    </>
  );
}

function formatMethod(method: string) {
  return method
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}
