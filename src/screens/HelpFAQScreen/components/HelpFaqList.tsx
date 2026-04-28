import React from "react";
import { View, Text } from "react-native";
import { HELP_FAQ_ITEMS } from "../helpFaqData";

type Styles = Record<string, object>;

export function HelpFaqList({ fontsLoaded, styles }: { fontsLoaded: boolean; styles: Styles }) {
  const f = fontsLoaded;

  return (
    <>
      <Text style={[styles.intro, f && { fontFamily: "DMSans_400Regular" }]}>
        Quick answers about PawManager. More help options are in Profile → Support.
      </Text>
      {HELP_FAQ_ITEMS.map((item, i) => (
        <View key={i} style={styles.card}>
          <Text style={[styles.q, f && { fontFamily: "DMSans_600SemiBold" }]}>{item.q}</Text>
          <Text style={[styles.a, f && { fontFamily: "DMSans_400Regular" }]}>{item.a}</Text>
        </View>
      ))}
    </>
  );
}
