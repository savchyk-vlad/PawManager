import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Walk } from "../types";
import { useThemeColors } from "../theme";

export function PaymentStatusPill({ status }: { status: Walk["paymentStatus"] }) {
  const colors = useThemeColors();
  const cfg =
    status === "paid"
      ? {
          label: "Paid",
          bg: "rgba(110,222,160,0.12)",
          border: "rgba(110,222,160,0.28)",
          color: "#6edea0",
        }
      : status === "no_pay"
        ? {
            label: "No pay",
            bg: "rgba(255,255,255,0.06)",
            border: "rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.45)",
          }
        : {
            label: "Unpaid",
            bg: "rgba(240,160,48,0.12)",
            border: "rgba(240,160,48,0.3)",
            color: colors.amberDefault,
          };

  return (
    <View
      style={[
        st.pill,
        { backgroundColor: cfg.bg, borderColor: cfg.border },
      ]}>
      <Text style={[st.text, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
