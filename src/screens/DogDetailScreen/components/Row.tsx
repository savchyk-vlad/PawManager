import React from "react";
import { Text, View } from "react-native";
import { colors } from "../../../theme";

type Props = {
  label: string;
  value: string;
  font: { regular: string; medium: string; semi?: string; bold?: string };
  last?: boolean;
  valueMid?: boolean;
  notProvidedToken: string;
  styles: any;
};

export function Row({
  label,
  value,
  font,
  last,
  valueMid,
  notProvidedToken,
  styles,
}: Props) {
  const isPlaceholder = value.toLowerCase().includes(notProvidedToken);
  return (
    <View style={[styles.infoRow, last ? { borderBottomWidth: 0 } : null]}>
      <Text style={[styles.ik, { fontFamily: font.regular }]}>{label}</Text>
      <Text
        style={[
          styles.iv,
          { fontFamily: font.medium },
          valueMid && { color: colors.greenDefault },
          isPlaceholder && { color: colors.textMuted },
        ]}
        numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
}
