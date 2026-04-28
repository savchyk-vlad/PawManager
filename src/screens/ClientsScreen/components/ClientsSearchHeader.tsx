import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FormField } from "../../../components/FormField";
import { colors } from "../../../theme";

export type ClientsFilterMode = "all" | "unpaid";

export const CLIENT_FILTER_TABS: { key: ClientsFilterMode; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unpaid", label: "Unpaid" },
];

type Styles = {
  searchWrap: object;
  searchBar: object;
  searchField: object;
  searchFieldInput: object;
  tabs: object;
  tab: object;
  tabText: object;
  tabTextActive: object;
  tabLine: object;
};

export function ClientsSearchHeader({
  styles,
  query,
  onChangeQuery,
  filter,
  onSelectFilter,
  showTabs,
}: {
  styles: Styles;
  query: string;
  onChangeQuery: (q: string) => void;
  filter: ClientsFilterMode;
  onSelectFilter: (key: ClientsFilterMode) => void;
  showTabs: boolean;
}) {
  return (
    <View style={styles.searchWrap}>
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={15} color={"rgba(255,255,255,0.4)"} />
        <FormField
          label=""
          value={query}
          onChangeText={onChangeQuery}
          placeholder="Search clients or dogs…"
          placeholderTextColor={"rgba(255,255,255,0.4)"}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.searchField}
          inputStyle={styles.searchFieldInput}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => onChangeQuery("")}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {showTabs && (
        <View style={styles.tabs}>
          {CLIENT_FILTER_TABS.map((tab) => (
            <TouchableOpacity key={tab.key} style={styles.tab} onPress={() => onSelectFilter(tab.key)}>
              <Text style={[styles.tabText, filter === tab.key && styles.tabTextActive]}>{tab.label}</Text>
              {filter === tab.key && <View style={styles.tabLine} />}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
