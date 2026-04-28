import React from "react";
import { View } from "react-native";
import { colors } from "../../../theme";

type Props = {
  insetTop: number;
  children: React.ReactNode;
  styles: any;
};

export function DashboardHeader({ insetTop, children, styles }: Props) {
  return (
    <>
      <View style={{ height: insetTop, backgroundColor: colors.greenDeep }} />
      <View style={styles.header}>{children}</View>
    </>
  );
}
