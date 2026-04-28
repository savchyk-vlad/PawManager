import React from "react";
import { TouchableOpacity, Text, StyleProp, ViewStyle, TextStyle } from "react-native";

export function AuthBackLink({
  onPress,
  style,
  textStyle,
}: {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  return (
    <TouchableOpacity style={style} onPress={onPress}>
      <Text style={textStyle}>← Back</Text>
    </TouchableOpacity>
  );
}
