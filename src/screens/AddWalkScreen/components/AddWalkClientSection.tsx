import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Client } from "../../../types";
import { colors } from "../../../theme";

type Styles = {
  sectionLabel: object;
  clientPending: object;
  borderedCard: object;
  borderedCardHeader: object;
  borderedCardHeaderLabel: object;
  clientRow: object;
  rowBorder: object;
  clientRowActive: object;
  clientInitial: object;
  clientInitialActive: object;
  clientInitialText: object;
  clientName: object;
  clientMeta: object;
  emptyClients: object;
  emptyClientsTitle: object;
  emptyClientsText: object;
};

export function AddWalkClientSection({
  styles,
  schedulableClients,
  selectedClient,
  selectedClientId,
  clientMatch,
  onSelectClient,
}: {
  styles: Styles;
  schedulableClients: Client[];
  selectedClient: Client | null;
  selectedClientId: string | null;
  clientMatch: { name: string; phone: string } | null;
  onSelectClient: (client: Client) => void;
}) {
  return (
    <>
      <Text style={styles.sectionLabel}>CLIENTS</Text>
      {clientMatch &&
        selectedClientId &&
        String(selectedClientId).startsWith("temp-") && (
          <Text style={styles.clientPending}>Saving new client to server…</Text>
        )}
      <View style={styles.borderedCard}>
        {schedulableClients.length === 0 ? (
          <View style={styles.emptyClients}>
            <Text style={styles.emptyClientsTitle}>
              No clients with dogs available
            </Text>
            <Text style={styles.emptyClientsText}>
              Add a dog to a client first, then you can schedule a walk.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.borderedCardHeader}>
              <Text style={styles.borderedCardHeaderLabel}>Active clients</Text>
            </View>
            {schedulableClients.map((client, i) => {
              // Use the id directly so selection doesn't briefly flicker during re-renders
              // (e.g. while resolving temp client ids).
              const active = Boolean(
                selectedClientId && client.id === selectedClientId,
              );
              const dogNames = client.dogs
                .filter((d) => !d.isDeleted)
                .map((d) => d.name)
                .join(", ");
              return (
                <TouchableOpacity
                  key={client.id}
                  style={[
                    styles.clientRow,
                    i < schedulableClients.length - 1 && styles.rowBorder,
                    active && styles.clientRowActive,
                  ]}
                  activeOpacity={1}
                  onPress={() => onSelectClient(client)}>
                  <View style={[styles.clientInitial]}>
                    <Text
                      style={[
                        styles.clientInitialText,
                        active && { color: colors.greenDefault },
                      ]}>
                      {client.name[0]}
                    </Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.clientName} numberOfLines={1}>
                      {client.name}
                    </Text>
                    <Text style={styles.clientMeta} numberOfLines={1}>
                      {dogNames}
                    </Text>
                  </View>

                  <View style={{ alignItems: "flex-end", gap: 8 }}>
                    <View
                      style={{
                        backgroundColor: active
                          ? "rgba(92, 175, 114, 0.12)"
                          : "rgba(255,255,255,0.06)",
                        borderWidth: 1,
                        borderColor: active
                          ? "rgba(92, 175, 114, 0.28)"
                          : "rgba(255,255,255,0.08)",
                        borderRadius: 999,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                      }}>
                      <Text
                        style={{
                          color: active
                            ? colors.greenDefault
                            : colors.textSecondary,
                          fontSize: 12,
                          fontWeight: "700",
                        }}>
                        ${client.pricePerWalk}/walk
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </View>
    </>
  );
}
