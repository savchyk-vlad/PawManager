import React from "react";
import { View, Text, TouchableOpacity, TextStyle } from "react-native";

type Styles = {
  header: object;
  backBtn: object;
  backGlyph: object;
  headerTitle: object;
};

export function GlyphBackScreenHeader({
  title,
  onBack,
  styles,
  titleStyle,
}: {
  title: string;
  onBack: () => void;
  styles: Styles;
  titleStyle?: TextStyle;
}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
        <Text style={styles.backGlyph}>‹</Text>
      </TouchableOpacity>
      <Text style={[styles.headerTitle, titleStyle]}>{title}</Text>
    </View>
  );
}
