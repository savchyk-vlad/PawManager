import React from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  clientName,
  dogSubtitle,
  initials,
  phone,
  address,
  styles,
  onBack,
  onEdit,
}: {
  clientName: string;
  dogSubtitle: string;
  initials: string;
  phone: string;
  address: string;
  styles: Styles;
  onBack: () => void;
  onEdit: () => void;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} accessibilityRole="button">
          <Ionicons name="arrow-back" size={18} color="white" />
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
          <View style={styles.avatarLg}>
            <Text style={styles.avatarLgText}>{initials}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => phone && Linking.openURL(`tel:${phone}`)}>
          <Ionicons name="call-outline" size={16} color="white" />
          <Text style={styles.actionLabel}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => {
            const addr = encodeURIComponent(address);
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
