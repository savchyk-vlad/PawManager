import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { clientAvatarTint } from "../../../lib/clientAvatarColors";

type Styles = {
  header: object;
  headerTopRow: object;
  backBtn: object;
  headerBody: object;
  headerTextCol: object;
  clientName: object;
  clientSub: object;
  avatarLg: object;
  avatarLgText: object;
  actionsRow: object;
  actionBtn: object;
  actionLabel: object;
};

export function ClientDetailHeader({
  clientId,
  clientName,
  dogSubtitle,
  initials,
  phone,
  addressForMaps,
  styles,
  onBack,
  onEdit,
}: {
  clientId: string;
  clientName: string;
  dogSubtitle: string;
  initials: string;
  phone: string;
  /** Single-line address for navigation; empty disables Navigate. */
  addressForMaps: string;
  styles: Styles;
  onBack: () => void;
  onEdit: () => void;
}) {
  const avatarTint = useMemo(() => clientAvatarTint(clientId), [clientId]);

  return (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} accessibilityRole="button">
          <Ionicons name="arrow-back" size={18} color="rgba(255,255,255,0.45)" />
        </TouchableOpacity>

        <View style={styles.headerBody}>
          <View style={styles.headerTextCol}>
            <Text style={styles.clientName} numberOfLines={2}>
              {clientName}
            </Text>
            <Text style={styles.clientSub} numberOfLines={2}>
              {dogSubtitle}
            </Text>
          </View>
          <View
            style={[
              styles.avatarLg,
              {
                backgroundColor: avatarTint.backgroundColor,
                borderColor: "rgba(255,255,255,0.22)",
              },
            ]}>
            <Text style={[styles.avatarLgText, { color: avatarTint.color }]}>
              {initials}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => phone && Linking.openURL(`tel:${phone}`)}>
          <Ionicons name="call-outline" size={16} color="white" />
          <Text style={styles.actionLabel}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, !addressForMaps.trim() && { opacity: 0.45 }]}
          disabled={!addressForMaps.trim()}
          onPress={() => {
            const addr = encodeURIComponent(addressForMaps.trim());
            Linking.openURL(`maps://maps.google.com/maps?daddr=${addr}`);
          }}>
          <Ionicons name="navigate-outline" size={16} color="white" />
          <Text style={styles.actionLabel}>Navigate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
          <Ionicons name="create-outline" size={16} color="white" />
          <Text style={styles.actionLabel}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
