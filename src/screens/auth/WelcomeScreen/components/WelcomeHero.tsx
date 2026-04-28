import React from "react";
import { View, Text } from "react-native";

type Styles = Record<string, object>;

export function WelcomeHero({ styles }: { styles: Styles }) {
  return (
    <View style={styles.hero}>
      <Text style={styles.pawEmoji}>🐾</Text>
      <Text style={styles.title}>PawManager</Text>
      <Text style={styles.subtitle}>
        The business app built for dog walkers.{"\n"}No commissions. Ever.
      </Text>
    </View>
  );
}
