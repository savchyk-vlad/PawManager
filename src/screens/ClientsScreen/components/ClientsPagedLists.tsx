import React from "react";
import { View, Text, ScrollView, Platform } from "react-native";
import { FormKeyboardFlatList } from "../../../components/FormKeyboardScrollView";
import { EmptyPlaceholder } from "../../../components/EmptyPlaceholder";
import { Client, Walk } from "../../../types";
import { ClientCard } from "./ClientCard";

type Styles = Record<string, object>;

export function ClientsPagedLists({
  pagerRef,
  screenW,
  scrollEnabled,
  clientsListLayoutKey,
  displayedAll,
  displayedUnpaid,
  walks,
  emptyTextAll,
  emptyTextUnpaid,
  onMomentumScrollEnd,
  styles,
}: {
  pagerRef: React.RefObject<ScrollView | null>;
  screenW: number;
  scrollEnabled: boolean;
  clientsListLayoutKey: string;
  displayedAll: Client[];
  displayedUnpaid: Client[];
  walks: Walk[];
  emptyTextAll: string;
  emptyTextUnpaid: string;
  onMomentumScrollEnd: (e: { nativeEvent: { contentOffset: { x: number } } }) => void;
  styles: Styles;
}) {
  const renderClient = ({ item, index }: { item: Client; index: number }) => (
    <ClientCard client={item} index={index} walks={walks} styles={styles} />
  );

  return (
    <ScrollView
      ref={pagerRef}
      horizontal
      pagingEnabled
      scrollEnabled={scrollEnabled}
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled={Platform.OS === "android"}
      style={{ flex: 1 }}
      onMomentumScrollEnd={onMomentumScrollEnd}>
      <View style={[styles.page, { width: screenW }]}>
        <FormKeyboardFlatList
          layoutAnimationKey={clientsListLayoutKey}
          data={displayedAll}
          keyExtractor={(item) => item.id}
          renderItem={renderClient}
          contentContainerStyle={styles.listContent}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          viewIsInsideTabBar
          ListHeaderComponent={<Text style={styles.sectionLabel}>Clients</Text>}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={<EmptyPlaceholder text={emptyTextAll} />}
        />
      </View>
      <View style={[styles.page, { width: screenW }]}>
        <FormKeyboardFlatList
          layoutAnimationKey={clientsListLayoutKey}
          data={displayedUnpaid}
          keyExtractor={(item) => item.id}
          renderItem={renderClient}
          contentContainerStyle={styles.listContent}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          viewIsInsideTabBar
          ListHeaderComponent={<Text style={styles.sectionLabel}>Clients</Text>}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={<EmptyPlaceholder text={emptyTextUnpaid} />}
        />
      </View>
    </ScrollView>
  );
}
