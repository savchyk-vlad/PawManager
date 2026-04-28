import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";

type Styles = Record<string, object>;

export function SubscriptionsManageSection({
  fontsLoaded,
  styles,
}: {
  fontsLoaded: boolean;
  styles: Styles;
}) {
  const f = fontsLoaded;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.row}
        onPress={() => Alert.alert("Restore", "Checking for previous purchases…")}
        activeOpacity={0.75}>
        <Text style={[styles.rowLabel, f && { fontFamily: "DMSans_500Medium" }]}>Restore purchase</Text>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.cancelRow}
        onPress={() => Alert.alert("No subscription", "You have no active subscription to cancel.")}
        activeOpacity={0.75}>
        <Text style={[styles.cancelRowText, f && { fontFamily: "DMSans_400Regular" }]}>Cancel subscription</Text>
      </TouchableOpacity>
    </View>
  );
}
