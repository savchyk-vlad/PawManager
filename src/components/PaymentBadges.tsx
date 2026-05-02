import React from "react";
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors, type ThemeColors } from "../theme";
import { Walk } from "../types";

export type PaymentBadgeTone = {
  label: string;
  bg: string;
  fg: string;
};

export function getPaymentStatusTone(status: Walk["paymentStatus"]): PaymentBadgeTone {
  if (status === "paid") {
    return { label: "Paid", fg: "#D1FAE5", bg: "rgba(16, 185, 129, 0.22)" };
  }
  if (status === "no_pay") {
    return { label: "No pay", fg: "rgba(255,255,255,0.75)", bg: "rgba(255,255,255,0.1)" };
  }
  return { label: "Unpaid", fg: "#FCD34D", bg: "rgba(245, 158, 11, 0.2)" };
}

export function getPaymentMethodTone(
  method: string | undefined,
  colors: ThemeColors,
): PaymentBadgeTone | null {
  const raw = (method ?? "").trim();
  if (!raw) return null;

  const normalized = raw.toLowerCase();
  if (normalized === "cash") return { label: "Cash", bg: "rgba(92,175,114,0.14)", fg: "#6BBF7A" };
  if (normalized === "venmo") return { label: "Venmo", bg: "rgba(0,103,255,0.14)", fg: "#6eaaff" };
  if (normalized === "cash app" || normalized === "cash_app" || normalized === "cashapp") {
    return { label: "Cash App", bg: "rgba(92,175,114,0.16)", fg: "#7fd995" };
  }
  if (normalized === "zelle") return { label: "Zelle", bg: "rgba(122,0,255,0.14)", fg: "#DCC2FF" };
  if (normalized === "card") return { label: "Card", bg: "rgba(76,141,255,0.14)", fg: "#8cb6ff" };
  return { label: raw, bg: colors.surfaceExtra, fg: colors.textSecondary };
}

type PaymentPillProps = {
  label: string;
  fg: string;
  bg: string;
  withCheck?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconSize?: number;
  borderColor?: string;
};

export function PaymentPill({
  label,
  fg,
  bg,
  withCheck = false,
  style,
  textStyle,
  iconSize = 10,
  borderColor = "transparent",
}: PaymentPillProps) {
  return (
    <View style={[styles.pill, { backgroundColor: bg, borderColor }, style]}>
      {withCheck ? <Ionicons name="checkmark" size={iconSize} color={fg} /> : null}
      <Text style={[styles.pillText, { color: fg }, textStyle]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

type PaidWithMethodPillProps = {
  method: string | undefined;
  appBg?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function PaidWithMethodPill({ method, appBg = false, style, textStyle }: PaidWithMethodPillProps) {
  const colors = useThemeColors();
  const methodTone = getPaymentMethodTone(method, colors);
  const fg = methodTone?.fg ?? colors.greenDefault;
  const label = methodTone ? `Paid - ${methodTone.label}` : "Paid";
  const bg = methodTone?.bg ?? "rgba(42,87,48,0.4)";
  const borderColor = methodTone ? "transparent" : "rgba(91,175,114,0.2)";

  return (
    <PaymentPill
      label={label}
      fg={fg}
      bg={bg}
      withCheck
      borderColor={borderColor}
      style={style}
      textStyle={textStyle}
    />
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
