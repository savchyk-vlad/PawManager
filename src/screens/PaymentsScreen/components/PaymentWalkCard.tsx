import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useThemeColors } from "../../../theme";
import { getPaymentMethodTone } from "../../../components/PaymentBadges";
import { Client, Walk } from "../../../types";
import { currency, walkDate } from "../paymentsUtils";
import { createPaymentsSectionsStyles } from "../paymentsSections.styles";

type Props = {
  walk: Walk;
  client: Client;
  amount: number;
  onPress?: () => void;
  footerActionLabel?: string;
  onFooterActionPress?: () => void;
  paid?: boolean;
};

export function PaymentWalkCard({
  walk,
  client,
  amount,
  onPress,
  footerActionLabel,
  onFooterActionPress,
  paid = false,
}: Props) {
  const colors = useThemeColors();
  const st = useMemo(() => createPaymentsSectionsStyles(colors), [colors]);
  const scheduled = walkDate(walk);
  const duration = walk.actualDurationMinutes ?? walk.durationMinutes;
  const walkDogs = client.dogs.filter((dog) => walk.dogIds.includes(dog.id));
  const dogLabel = walkDogs.map((dog) => dog.name).join(", ") || "Walk";
  const dogSubLabel =
    walkDogs.length <= 1
      ? walkDogs[0]?.breed || "Breed not provided"
      : `${walkDogs.length} dogs`;
  const dogIcon = walkDogs[0]?.emoji || "🐕";
  const paymentLabel = walk.paymentMethod
    ? `Paid · ${formatPaymentMethod(walk.paymentMethod)}`
    : "Paid";
  const methodTone = getPaymentMethodTone(walk.paymentMethod, colors);

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      {...(onPress
        ? {
            onPress,
            activeOpacity: 0.84,
          }
        : {})}
      style={st.paymentWalkCard}>
      <View style={st.paymentWalkMainRow}>
        <View style={st.paymentWalkDateBlock}>
          <Text style={st.paymentWalkDateDay}>{format(scheduled, "d")}</Text>
          <Text style={st.paymentWalkDateMonth}>{format(scheduled, "MMM")}</Text>
        </View>

        <View style={st.paymentWalkDetailCol}>
          <View style={st.paymentWalkPeopleRow}>
            <View style={st.paymentWalkClientRow}>
              <View style={st.paymentWalkClientInfo}>
                <View style={st.paymentWalkPersonIcon}>
                  <Ionicons
                    name="person-outline"
                    size={13}
                    color="rgba(255,255,255,0.48)"
                  />
                </View>
                <Text style={st.paymentWalkPersonLabel}>Client</Text>
                <Text style={st.paymentWalkPersonName} numberOfLines={1}>
                  {client.name}
                </Text>
              </View>

              <Text
                style={[
                  st.paymentWalkAmount,
                  paid ? st.paymentWalkAmountPaid : undefined,
                ]}>
                {currency(amount)}
              </Text>
            </View>

            <View style={st.paymentWalkPersonLine}>
              <View style={st.paymentWalkPersonIcon}>
                <Text style={st.paymentWalkDogEmoji}>{dogIcon}</Text>
              </View>
              <Text style={st.paymentWalkPersonLabel}>Dog</Text>
              <Text style={st.paymentWalkPersonName} numberOfLines={1}>
                {dogLabel}
                {dogSubLabel ? (
                  <Text style={st.paymentWalkPersonSub}>{` · ${dogSubLabel}`}</Text>
                ) : null}
              </Text>
            </View>
          </View>

          <View style={st.paymentWalkMetaRow}>
            <View style={st.paymentWalkMetaGroup}>
              <Text style={st.paymentWalkMetaText}>{format(scheduled, "h:mm a")}</Text>
              <Text style={st.paymentWalkMetaText}>{duration} min</Text>
            </View>
            {paid ? (
              <View
                style={[
                  st.paymentWalkPaidBadge,
                  methodTone
                    ? {
                        backgroundColor: methodTone.bg,
                        borderColor: "transparent",
                      }
                    : null,
                ]}>
                <Ionicons
                  name="checkmark"
                  size={11}
                  color={methodTone?.fg ?? colors.greenText}
                />
                <Text
                  style={[
                    st.paymentWalkPaidBadgeText,
                    methodTone ? { color: methodTone.fg } : null,
                  ]}>
                  {paymentLabel}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {!paid ? (
        <View style={st.paymentWalkFooter}>
          <TouchableOpacity
            style={st.paymentWalkActionButton}
            onPress={(event) => {
              event.stopPropagation?.();
              onFooterActionPress?.();
            }}
            activeOpacity={0.84}>
            <Text style={st.paymentWalkActionButtonText}>
              {footerActionLabel ?? "Mark paid"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </CardWrapper>
  );
}

function formatPaymentMethod(method: string) {
  return method
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}
