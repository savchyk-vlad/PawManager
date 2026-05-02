import { StyleSheet } from "react-native";
import type { ThemeColors } from "../../../theme";
import { PAYMENTS_MIN_TOUCH } from "../paymentsConstants";

export function createPaymentsScreenHeaderStyles(colors: ThemeColors) {
  return StyleSheet.create({
    headerShell: {
      backgroundColor: colors.greenDeep,
      marginHorizontal: 0,
      marginTop: 0,
      paddingTop: 18,
      paddingBottom: 12,
      paddingHorizontal: 24,
      borderBottomLeftRadius: 14,
      borderBottomRightRadius: 14,
    },
    headerTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    headerLeft: {
      flex: 1,
      minWidth: 0,
    },
    headerRight: {
      alignItems: "flex-end",
      marginLeft: 12,
    },
    headerTitle: {
      fontSize: 34,
      lineHeight: 36,
      fontWeight: "700",
      color: colors.text,
      letterSpacing: -1.1,
    },
    headerSubtitle: {
      fontSize: 15,
      color: "rgba(255,255,255,0.58)",
      fontWeight: "600",
    },
    periodRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 6,
    },
    exportButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.greenSubtle,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.greenBorder,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: PAYMENTS_MIN_TOUCH,
      justifyContent: "center",
    },
    exportButtonText: {
      fontSize: 14,
      color: colors.greenText,
      fontWeight: "600",
    },
  });
}
