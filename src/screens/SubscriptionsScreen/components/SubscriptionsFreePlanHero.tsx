import React from "react";
import { View, Text } from "react-native";
import { SUBSCRIPTIONS_FREE_LIMIT } from "../subscriptionsConstants";

type Styles = Record<string, object>;

export function SubscriptionsFreePlanHero({
  used,
  fontsLoaded,
  monoFont,
  styles,
}: {
  used: number;
  fontsLoaded: boolean;
  monoFont: string;
  styles: Styles;
}) {
  const f = fontsLoaded;
  const meterPct = Math.min(used / SUBSCRIPTIONS_FREE_LIMIT, 1);
  const remaining = Math.max(SUBSCRIPTIONS_FREE_LIMIT - used, 0);

  return (
    <View style={styles.heroCard}>
      <View style={styles.heroTopRow}>
        <Text style={[styles.heroPlanName, f && { fontFamily: "DMSans_700Bold" }]}>Free plan</Text>
        <View style={styles.freeBadge}>
          <Text style={[styles.freeBadgeText, { fontFamily: monoFont }]}>FREE</Text>
        </View>
      </View>
      <View style={styles.statusRow}>
        <View style={styles.statusDot} />
        <Text style={[styles.statusText, { fontFamily: monoFont }]}>No active subscription</Text>
      </View>
      <View style={styles.meterLabelRow}>
        <Text style={[styles.meterLabel, { fontFamily: monoFont }]}>Clients</Text>
        <Text style={[styles.meterCount, { fontFamily: monoFont }]}>
          {used} / {SUBSCRIPTIONS_FREE_LIMIT} used
        </Text>
      </View>
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { width: `${meterPct * 100}%` }]} />
      </View>
      <Text style={[styles.meterHint, { fontFamily: monoFont }]}>
        {remaining > 0
          ? `${remaining} client slot${remaining === 1 ? "" : "s"} remaining on free plan`
          : "Client limit reached — upgrade to add more"}
      </Text>
    </View>
  );
}
