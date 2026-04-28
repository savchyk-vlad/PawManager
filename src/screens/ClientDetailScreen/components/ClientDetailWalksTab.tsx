import React from "react";
import { View, ScrollView } from "react-native";
import { EmptyPlaceholder } from "../../../components/EmptyPlaceholder";
import { Client, Walk } from "../../../types";
import { WalkRow } from "./DetailPieces";

type Styles = Record<string, object>;

export function ClientDetailWalksTab({
  clientWalks,
  client,
  styles,
}: {
  clientWalks: Walk[];
  client: Client;
  styles: Styles;
}) {
  return (
    <ScrollView
      style={styles.tabPageScroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {clientWalks.length === 0 ? (
        <EmptyPlaceholder text="No walks yet" />
      ) : (
        <View style={styles.card}>
          {clientWalks.map((w, i) => (
            <React.Fragment key={w.id}>
              <WalkRow walk={w} client={client} styles={styles} />
              {i < clientWalks.length - 1 && <View style={styles.rowDivider} />}
            </React.Fragment>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
