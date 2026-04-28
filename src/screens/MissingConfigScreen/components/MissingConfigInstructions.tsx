import React from "react";
import { Text, ScrollView, Platform } from "react-native";
import { MISSING_CONFIG_STEPS } from "../missingConfigCopy";

type Styles = Record<string, object>;

export function MissingConfigInstructions({ styles }: { styles: Styles }) {
  return (
    <ScrollView contentContainerStyle={styles.outer}>
      <Text style={styles.title}>Configuration needed</Text>
      <Text style={styles.body}>
        Supabase URL and key were not found. The app is blocked until your machine provides them in .env and Metro bundles
        again.
      </Text>
      {MISSING_CONFIG_STEPS.map((line) => (
        <Text key={line} style={styles.step}>
          {line}
        </Text>
      ))}
      <Text style={styles.muted}>
        {Platform.select({ ios: "iOS", android: "Android" })} · Open the Metro terminal for errors. Run npm run check:env in the
        project root to verify the file is read.
      </Text>
    </ScrollView>
  );
}
