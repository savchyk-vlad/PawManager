import React from "react";
import { View, Text } from "react-native";

type Styles = {
  sectionLabel: object;
  card: object;
  readOnlyName: object;
  readOnlyMeta: object;
};

export function EditWalkClientSummary({
  styles,
  clientName,
  dogNamesLine,
}: {
  styles: Styles;
  clientName: string;
  dogNamesLine: string;
}) {
  return (
    <>
      <Text style={styles.sectionLabel}>CLIENT & DOGS</Text>
      <View style={styles.card}>
        <Text style={styles.readOnlyName}>{clientName}</Text>
        <Text style={styles.readOnlyMeta}>{dogNamesLine}</Text>
      </View>
    </>
  );
}
