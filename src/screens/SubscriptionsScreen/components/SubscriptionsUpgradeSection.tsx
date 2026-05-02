import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SUBSCRIPTIONS_PRO_PERKS } from "../subscriptionsConstants";

type Styles = Record<string, object>;

export function SubscriptionsUpgradeSection({
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
    <View style={styles.upgradeCard}>
      <View style={styles.upgradeTopRow}>
        <Text style={[styles.upgradeTitle, f && { fontFamily: "DMSans_700Bold" }]}>PawManager Pro</Text>
        <Text style={[styles.upgradePrice, { fontFamily: monoFont }]}>$9.99 / mo</Text>
      </View>
      <View style={styles.perks}>
        {SUBSCRIPTIONS_PRO_PERKS.map((p) => (
          <View key={p} style={styles.perkRow}>
            <View style={styles.perkDot} />
            <Text style={[styles.perkText, f && { fontFamily: "DMSans_400Regular" }]}>{p}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity
        style={styles.upgradeBtn}
        activeOpacity={0.85}
        onPress={() => Alert.alert("Not available yet", "Subscriptions aren't available in this build yet.")}>
        <Text style={[styles.upgradeBtnText, f && { fontFamily: "DMSans_700Bold" }]}>Upgrade Now →</Text>
      </TouchableOpacity>
    </View>
  );
}
