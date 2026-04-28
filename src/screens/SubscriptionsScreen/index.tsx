import React from "react";
import { View, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { useAppStore } from "../../store";
import { colors } from "../../theme";
import { SectionLabel } from "./components/SectionLabel";
import { SUBSCRIPTIONS_MONO_FONT } from "./subscriptionsConstants";
import { SubscriptionsScreenHeader } from "./components/SubscriptionsScreenHeader";
import { SubscriptionsFreePlanHero } from "./components/SubscriptionsFreePlanHero";
import { SubscriptionsBillingSection } from "./components/SubscriptionsBillingSection";
import { SubscriptionsUpgradeSection } from "./components/SubscriptionsUpgradeSection";
import { SubscriptionsManageSection } from "./components/SubscriptionsManageSection";

export default function SubscriptionsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const clients = useAppStore((st) => st.clients);

  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  const used = clients.length;
  const f = fontsLoaded;
  const mono = SUBSCRIPTIONS_MONO_FONT;

  if (!fontsLoaded) {
    return (
      <View style={[s.safe, { paddingTop: insets.top, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={colors.greenDefault} />
      </View>
    );
  }

  return (
    <View style={[s.safe, { paddingTop: insets.top }]}>
      <SubscriptionsScreenHeader
        title="Subscription"
        titleFontFamily="DMSans_700Bold"
        onBack={() => navigation.goBack()}
        styles={s}
      />

      <ScrollView
        contentContainerStyle={[s.content, { paddingBottom: 32 + insets.bottom }]}
        showsVerticalScrollIndicator={false}>
        <SubscriptionsFreePlanHero used={used} fontsLoaded={f} monoFont={mono} styles={s} />

        <SectionLabel fontsLoaded={f} styles={s}>
          Billing
        </SectionLabel>
        <SubscriptionsBillingSection fontsLoaded={f} monoFont={mono} styles={s} />

        <SectionLabel fontsLoaded={f} styles={s}>
          Upgrade
        </SectionLabel>
        <SubscriptionsUpgradeSection fontsLoaded={f} monoFont={mono} styles={s} />

        <SectionLabel fontsLoaded={f} styles={s}>
          Manage
        </SectionLabel>
        <SubscriptionsManageSection fontsLoaded={f} styles={s} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backGlyph: {
    fontSize: 18,
    lineHeight: 20,
    color: colors.greenDefault,
    marginTop: -2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.4,
    flex: 1,
  },

  content: { paddingHorizontal: 12, gap: 0, paddingTop: 0 },

  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 10,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  heroPlanName: { fontSize: 20, fontWeight: "700", color: colors.text, letterSpacing: -0.5 },
  freeBadge: {
    backgroundColor: "#222",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
    marginTop: 4,
  },
  freeBadgeText: { fontSize: 10, fontWeight: "700", color: colors.textMuted, letterSpacing: 0.3 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 16, marginTop: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.textMuted },
  statusText: { fontSize: 12, color: colors.textMuted },
  meterLabelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  meterLabel: { fontSize: 11, color: colors.textMuted },
  meterCount: { fontSize: 11, color: colors.amberText },
  meterTrack: {
    height: 5,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 3,
    overflow: "hidden",
  },
  meterFill: { height: 5, backgroundColor: colors.amberDefault, borderRadius: 3 },
  meterHint: { fontSize: 10, color: colors.textMuted, marginTop: 6 },

  sectionLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.8,
    color: colors.textMuted,
    textTransform: "uppercase",
    paddingHorizontal: 4,
    marginTop: 16,
    marginBottom: 8,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: 10,
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  rowLabel: { fontSize: 13, fontWeight: "500", color: colors.text },
  rowSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowValueMuted: { fontSize: 13, color: colors.textMuted },
  chevron: { fontSize: 14, color: colors.textMuted },

  upgradeCard: {
    backgroundColor: colors.greenDeep,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(126,203,90,0.15)",
    padding: 16,
    marginBottom: 10,
  },
  upgradeTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  upgradeTitle: { fontSize: 15, fontWeight: "700", color: colors.text, letterSpacing: -0.3 },
  upgradePrice: { fontSize: 13, fontWeight: "700", color: colors.greenDefault },
  perks: { gap: 7, marginBottom: 14 },
  perkRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  perkDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.greenDefault },
  perkText: { fontSize: 12, color: colors.greenText, flex: 1 },
  upgradeBtn: {
    backgroundColor: colors.greenDeep,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },
  upgradeBtnText: { fontSize: 13, fontWeight: "700", color: colors.greenText, letterSpacing: 0.1 },

  cancelRow: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  cancelRowText: { fontSize: 13, color: colors.textMuted },
});
