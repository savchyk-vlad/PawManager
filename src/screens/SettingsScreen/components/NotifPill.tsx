import React from "react";
import { Text, TouchableOpacity } from "react-native";

type Props = {
  label: string;
  active: boolean;
  onPress: () => void;
  fontsReady: boolean;
  styles: any;
};

export function NotifPill({
  label,
  active,
  onPress,
  fontsReady,
  styles,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.pill, active && styles.pillActive]}
      onPress={onPress}
      activeOpacity={0.85}>
      <Text
        style={[
          styles.pillText,
          active && styles.pillTextActive,
          fontsReady && { fontFamily: "DMSans_600SemiBold" },
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
