import React from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DangerZoneAction } from "../../../components/DangerZoneAction";
import { Client } from "../../../types";
import { colors } from "../../../theme";
import { InfoRow } from "./DetailPieces";

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
  return (
    <ScrollView
      style={styles.tabPageScroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.infoStatsRow}>
        <View style={styles.infoStatBox}>
          <Text style={styles.statNum}>{clientWalkCount}</Text>
          <Text style={styles.statLbl}>Total walks</Text>
        </View>
        <View style={styles.infoStatBox}>
          <Text style={styles.statNum}>${client.pricePerWalk}</Text>
          <Text style={styles.statLbl}>Per walk</Text>
        </View>
        <TouchableOpacity
          style={styles.infoStatBox}
          activeOpacity={0.82}
          onPress={onOpenPayments}
          accessibilityRole="button"
          accessibilityLabel="Open payments for this client">
          <Text style={[styles.statNum, unpaidCount > 0 && { color: colors.amberDefault }]}>
            ${unpaidTotal.toFixed(2)}
          </Text>
          <Text style={styles.statLbl}>Unpaid</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <InfoRow label="Phone" value={client.phone} styles={styles} />
        <View style={styles.rowDivider} />
        <InfoRow label="Address" value={client.address} styles={styles} />
        <View style={styles.rowDivider} />
        <InfoRow label="Total earned" value={`$${totalEarned.toFixed(2)}`} styles={styles} />
      </View>
      <TouchableOpacity style={styles.paymentsBtn} onPress={onOpenPayments} activeOpacity={0.85}>
        <Ionicons name="cash-outline" size={17} color="white" />
        <Text style={styles.paymentsBtnText}>Open Payments</Text>
      </TouchableOpacity>
      <DangerZoneAction buttonText="Delete Client" onPress={onDeleteClient} disabled={removingClient} />
    </ScrollView>
  );
}
