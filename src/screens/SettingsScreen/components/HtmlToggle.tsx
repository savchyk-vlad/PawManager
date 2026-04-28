import React from "react";
import { TouchableOpacity, View } from "react-native";

type Props = {
  value: boolean;
  onToggle: () => void;
  styles: any;
};

export function HtmlToggle({ value, onToggle, styles }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onToggle}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <View style={[styles.track, value && styles.trackOn]}>
        <View style={[styles.thumb, value && styles.thumbOn]} />
      </View>
    </TouchableOpacity>
  );
}
