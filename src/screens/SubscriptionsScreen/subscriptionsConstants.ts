import { Platform } from "react-native";

export const SUBSCRIPTIONS_FREE_LIMIT = 5;

/** Matches HTML upgrade perks order/copy */
export const SUBSCRIPTIONS_PRO_PERKS = [
  "Unlimited clients",
  "Smart invoicing & receipts",
  "Route optimization",
  "Priority support",
];

export const SUBSCRIPTIONS_MONO_FONT = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});
