import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { format, parseISO } from "date-fns";
import { Client, Walk } from "../../../types";
import { walkDogCount } from "../../../lib/walkMetrics";
import { colors, radius } from "../../../theme";
import { Ionicons } from "@expo/vector-icons";

export type UnpaidEntry = {
  client: Client;
  unpaidWalks: Walk[];
  total: number;
};

type Props = {
  unpaidByClient: UnpaidEntry[];
  expandedClientId: string | null;
  currency: (amount: number) => string;
  dogNamesForWalk: (walk: Walk, client: Client) => string;
  onToggleClient: (clientId: string) => void;
  onMarkAllPaid: (entry: UnpaidEntry) => void;
  onMarkWalkPaid: (walk: Walk, client: Client) => void;
  onOpenWalk: (walkId: string) => void;
};

export function UnpaidClientsSection({
  unpaidByClient,
  expandedClientId,
  currency,
  dogNamesForWalk,
  onToggleClient,
  onMarkAllPaid,
  onMarkWalkPaid,
  onOpenWalk,
}: Props) {
  return (
    <View style={styles.listBlock}>
      {unpaidByClient.map((entry) => (
        <View key={entry.client.id} style={styles.clientCard}>
          <TouchableOpacity
            style={styles.clientHeader}
            onPress={() => onToggleClient(entry.client.id)}
            activeOpacity={0.85}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.clientName}>{entry.client.name}</Text>
              <Text style={styles.clientMeta}>
                {entry.unpaidWalks.reduce((sum, walk) => sum + walkDogCount(walk), 0)} unpaid walk
                {entry.unpaidWalks.reduce((sum, walk) => sum + walkDogCount(walk), 0) === 1 ? "" : "s"}
              </Text>
            </View>
            <View style={styles.amountCol}>
              <Text style={styles.clientAmount}>{currency(entry.total)}</Text>
              <Ionicons
                name={expandedClientId === entry.client.id ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.textMuted}
                style={{ marginTop: 4 }}
              />
            </View>
          </TouchableOpacity>

          {expandedClientId === entry.client.id && (
            <>
              <View style={styles.clientActions}>
                <TouchableOpacity
                  style={styles.markPaidBtn}
                  onPress={() => onMarkAllPaid(entry)}
                  activeOpacity={0.85}>
                  <Text style={styles.markPaidText}>Mark all paid</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.walkList}>
                {entry.unpaidWalks.map((walk, i) => (
                  <TouchableOpacity
                    key={walk.id}
                    style={[styles.walkRow, i < entry.unpaidWalks.length - 1 && styles.walkRowBorder]}
                    onPress={() => onOpenWalk(walk.id)}
                    activeOpacity={0.82}
                    accessibilityRole="button"
                    accessibilityLabel="Open completed walk details">
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.walkDog}>{dogNamesForWalk(walk, entry.client)}</Text>
                      <Text style={styles.walkMeta}>
                        {format(parseISO(walk.scheduledAt), "EEE, MMM d · h:mm a")} ·{" "}
                        {walk.actualDurationMinutes ?? walk.durationMinutes} min
                      </Text>
                    </View>
                    <View style={styles.walkActions}>
                      <TouchableOpacity
                        style={styles.walkPaidBtn}
                        onPress={() => onMarkWalkPaid(walk, entry.client)}
                        activeOpacity={0.85}>
                        <Text style={styles.walkPaidBtnText}>Mark paid</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  listBlock: {
    marginBottom: 24,
    gap: 12,
  },
  clientCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  clientHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: colors.surfaceHigh,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  clientName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  clientMeta: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textSecondary,
  },
  clientAmount: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.4,
    color: colors.text,
  },
  amountCol: { alignItems: "flex-end", flexShrink: 0, paddingLeft: 8 },
  clientActions: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 12,
  },
  markPaidBtn: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.greenDeep,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.greenBorder,
  },
  markPaidText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  walkList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  walkRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  walkRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  walkDog: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  walkMeta: {
    marginTop: 3,
    fontSize: 11,
    color: colors.textSecondary,
  },
  walkActions: {
    gap: 6,
    alignItems: "flex-end",
  },
  walkPaidBtn: {
    backgroundColor: "rgba(91, 175, 114, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(91, 175, 114, 0.4)",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
  },
  walkPaidBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.greenText,
  },
});
