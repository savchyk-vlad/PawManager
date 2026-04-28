import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CLIENT_DETAIL_TABS, ClientDetailTab } from "./ClientDetailTabs";

type Styles = {
  tabBar: object;
  tabItem: object;
  tabLabel: object;
  tabLabelActive: object;
  tabIndicator: object;
};

export function ClientDetailTabBar({
  tab,
  onSelectTab,
  styles,
}: {
  tab: ClientDetailTab;
  onSelectTab: (t: ClientDetailTab) => void;
  styles: Styles;
}) {
  return (
    <View style={styles.tabBar}>
      {CLIENT_DETAIL_TABS.map((t) => (
        <TouchableOpacity
          key={t}
          style={styles.tabItem}
          onPress={() => onSelectTab(t)}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === t }}>
          <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>{t}</Text>
          {tab === t && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}
