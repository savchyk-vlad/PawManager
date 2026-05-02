import React from "react";
import { View } from "react-native";
import { useThemeColors } from "../../../theme";

type Props = {
  insetTop: number;
  children: React.ReactNode;
  styles: any;
};

export function DashboardHeader({ insetTop, children, styles }: Props) {
  const colors = useThemeColors();
  return (
    <>
      <View style={{ height: insetTop, backgroundColor: colors.greenDeep }} />
      <View style={styles.header}>{children}</View>
    </>
  );
}
