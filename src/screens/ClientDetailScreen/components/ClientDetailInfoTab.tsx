import React, { useMemo } from "react";
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DangerZoneAction } from "../../../components/DangerZoneAction";
import { Client } from "../../../types";
import { formatClientAddressMultiline } from "../../../lib/clientAddress";
import { useThemeColors } from "../../../theme";

type Styles = Record<string, object>;

export function ClientDetailInfoTab({
  client,
  clientWalkCount,
  totalEarned,
  unpaidCount,
  unpaidTotal,
  removingClient,
  styles,
  onOpenPayments,
  onDeleteClient,
}: {
  client: Client;
  clientWalkCount: number;
  totalEarned: number;
  unpaidCount: number;
  unpaidTotal: number;
  removingClient: boolean;
  styles: Styles;
  onOpenPayments: () => void;
  onDeleteClient: () => void;
}) {
  const addressDisplay = formatClientAddressMultiline(client.address);
  const colors = useThemeColors();
  const s = useMemo(
    () =>
      StyleSheet.create({
        card: {
          marginBottom: 12,
          backgroundColor: colors.surface,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          borderRadius: 16,
          overflow: "hidden",
        },
        cardLast: { marginBottom: 0 },
        cardHead: {
          paddingHorizontal: 14,
          paddingTop: 12,
          paddingBottom: 10,
          backgroundColor: colors.surfaceHigh,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        cardHeadText: {
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 1.1,
          textTransform: "uppercase",
          color: colors.textMuted,
        },
        row: {
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          paddingHorizontal: 14,
          paddingVertical: 11,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
          gap: 12,
        },
        rowLast: { borderBottomWidth: 0 },
        rl: { fontSize: 13, color: colors.textMuted, paddingTop: 1 },
        rv: {
          fontSize: 13,
          color: colors.text,
          fontWeight: "600",
          flexShrink: 1,
          textAlign: "right",
          lineHeight: 18,
        },
        rvEmpty: { color: "#3e3e38", fontWeight: "400" },
      }),
    [colors],
  );

  const Card = ({
    title,
    children,
    last,
  }: {
    title: string;
    children: React.ReactNode;
    last?: boolean;
  }) => (
    <View style={[s.card, last && s.cardLast]}>
      <View style={s.cardHead}>
        <Text style={s.cardHeadText}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const Row = ({
    label,
    value,
    empty,
    last,
    valueColor,
  }: {
    label: string;
    value: string;
    empty?: boolean;
    last?: boolean;
    valueColor?: string;
  }) => (
    <View style={[s.row, last && s.rowLast]}>
      <Text style={s.rl}>{label}</Text>
      <Text
        style={[s.rv, empty && s.rvEmpty, valueColor && { color: valueColor }]}
        numberOfLines={3}
      >
        {value}
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.tabPageScroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <Card title="Client information">
        <Row label="Name" value={client.name} />
        <Row label="Phone" value={client.phone.trim() || "—"} empty={!client.phone.trim()} />
        <Row
          label="Address"
          value={addressDisplay.trim() || "—"}
          empty={!addressDisplay.trim()}
        />
        <Row
          label="Client notes"
          value={client.keyLocation?.trim() || "—"}
          empty={!client.keyLocation?.trim()}
          last
        />
      </Card>

      <Card title="Pricing">
        <Row label="Rate per walk" value={`$${client.pricePerWalk}`} last valueColor={colors.greenText} />
      </Card>

      <Card title="Payments" last>
        <Row label="Total walks" value={`${clientWalkCount}`} />
        <Row label="Total earned" value={`$${totalEarned.toFixed(2)}`} valueColor={colors.greenText} />
        <Row
          label="Unpaid"
          value={`$${unpaidTotal.toFixed(2)} (${unpaidCount} walk${unpaidCount === 1 ? "" : "s"})`}
          valueColor={unpaidCount > 0 ? colors.amberDefault : colors.textSecondary}
          last
        />
      </Card>

      <TouchableOpacity style={styles.paymentsBtn} onPress={onOpenPayments} activeOpacity={0.85}>
        <Ionicons name="card-outline" size={17} color="white" />
        <Text style={styles.paymentsBtnText}>Open Payments</Text>
      </TouchableOpacity>
      <DangerZoneAction buttonText="Delete Client" onPress={onDeleteClient} disabled={removingClient} />
    </ScrollView>
  );
}
