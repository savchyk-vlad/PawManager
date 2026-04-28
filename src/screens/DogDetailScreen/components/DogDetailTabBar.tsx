import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { DOG_DETAIL_TABS, DogDetailTabKey } from "./DogDetailTabs";

type FontSet = { medium: string };

type Styles = {
  tabs: object;
  tab: object;
  tabText: object;
  tabTextActive: object;
  tabUnderline: object;
};

export function DogDetailTabBar({
  tab,
  onSelectTab,
  font,
  styles,
}: {
  tab: DogDetailTabKey;
  onSelectTab: (k: DogDetailTabKey) => void;
  font: FontSet;
  styles: Styles;
}) {
  return (
    <View style={styles.tabs}>
      {DOG_DETAIL_TABS.map(({ key, label }) => (
        <TouchableOpacity key={key} style={styles.tab} onPress={() => onSelectTab(key)}>
          <Text style={[styles.tabText, { fontFamily: font.medium }, tab === key && styles.tabTextActive]}>
            {label}
          </Text>
          {tab === key ? <View style={styles.tabUnderline} /> : null}
        </TouchableOpacity>
      ))}
    </View>
  );
}
