import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

type Styles = {
  pageHeader: object;
  backBtn: object;
  backGlyph: object;
  headerTitle: object;
};

export function SubscriptionsScreenHeader({
  title,
  titleFontFamily,
  onBack,
  styles,
}: {
  title: string;
  titleFontFamily?: string;
  onBack: () => void;
  styles: Styles;
}) {
  return (
    <View style={styles.pageHeader}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
        <Text style={styles.backGlyph}>‹</Text>
      </TouchableOpacity>
      <Text style={[styles.headerTitle, titleFontFamily && { fontFamily: titleFontFamily }]}>{title}</Text>
    </View>
  );
}
