import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Client } from "../../../types";
import { colors } from "../../../theme";

type Styles = {
  sectionLabel: object;
  clientPending: object;
  borderedCard: object;
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
      {clientMatch && selectedClientId && String(selectedClientId).startsWith("temp-") && (
        <Text style={styles.clientPending}>Saving new client to server…</Text>
      )}
      <View style={styles.borderedCard}>
        {schedulableClients.length === 0 ? (
          <View style={styles.emptyClients}>
            <Text style={styles.emptyClientsTitle}>No clients with dogs available</Text>
            <Text style={styles.emptyClientsText}>
              Add a dog to a client first, then you can schedule a walk.
            </Text>
          </View>
        ) : (
          schedulableClients.map((client, i) => {
            const active = Boolean(selectedClient && client.id === selectedClient.id);
            return (
              <TouchableOpacity
                key={client.id}
                style={[
                  styles.clientRow,
                  i < schedulableClients.length - 1 && styles.rowBorder,
                  active && styles.clientRowActive,
                ]}
                onPress={() => onSelectClient(client)}>
                <View style={[styles.clientInitial, active && styles.clientInitialActive]}>
                  <Text style={[styles.clientInitialText, active && { color: colors.greenDefault }]}>
                    {client.name[0]}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.clientName}>{client.name}</Text>
                  <Text style={styles.clientMeta}>
                    {client.dogs.filter((d) => !d.isDeleted).map((d) => d.name).join(", ")} · $
                    {client.pricePerWalk}
                  </Text>
                </View>
                {active && <Ionicons name="checkmark-circle" size={20} color={colors.greenDefault} />}
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </>
  );
}
