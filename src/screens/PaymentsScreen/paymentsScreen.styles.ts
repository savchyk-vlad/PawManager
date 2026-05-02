import { StyleSheet } from "react-native";
import type { ThemeColors } from "../../theme";

export function createPaymentsScreenStyles(colors: ThemeColors) {
  return StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: colors.bg,
  },
  });
}
