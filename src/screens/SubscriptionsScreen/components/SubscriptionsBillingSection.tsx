import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";

type Styles = Record<string, object>;

export function SubscriptionsBillingSection({
  fontsLoaded,
  monoFont,
  styles,
}: {
  fontsLoaded: boolean;
  monoFont: string;
  styles: Styles;
}) {
  const f = fontsLoaded;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={[styles.rowLabel, f && { fontFamily: "DMSans_500Medium" }]}>Billing cycle</Text>
        <Text style={[styles.rowValueMuted, { fontFamily: monoFont }]}>—</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={[styles.rowLabel, f && { fontFamily: "DMSans_500Medium" }]}>Next renewal</Text>
        <Text style={[styles.rowValueMuted, { fontFamily: monoFont }]}>—</Text>
      </View>
      <View style={styles.divider} />
      <TouchableOpacity
        style={styles.row}
        onPress={() => Alert.alert("Coming soon", "Payment methods will be available with Pro.")}
        activeOpacity={0.75}>
        <View>
          <Text style={[styles.rowLabel, f && { fontFamily: "DMSans_500Medium" }]}>Payment method</Text>
          <Text style={[styles.rowSub, { fontFamily: monoFont }]}>None added</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity
        style={styles.row}
        onPress={() => Alert.alert("Coming soon", "Invoices will be available with Pro.")}
        activeOpacity={0.75}>
        <Text style={[styles.rowLabel, f && { fontFamily: "DMSans_500Medium" }]}>Invoices</Text>
        <View style={styles.rowRight}>
          <Text style={[styles.rowValueMuted, { fontFamily: monoFont }]}>None</Text>
          <Text style={styles.chevron}>›</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
