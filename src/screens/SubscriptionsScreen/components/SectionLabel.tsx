import React from "react";
import { Text } from "react-native";

type Props = {
  children: string;
  fontsLoaded: boolean;
  styles: any;
};

export function SectionLabel({ children, fontsLoaded, styles }: Props) {
  return (
    <Text style={[styles.sectionLabel, fontsLoaded && { fontFamily: "DMSans_600SemiBold" }]}>
      {children}
    </Text>
  );
}
