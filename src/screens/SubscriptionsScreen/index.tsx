import React, { useMemo } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
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
import { useThemeColors } from "../../theme";
import { SectionLabel } from "./components/SectionLabel";
import { SUBSCRIPTIONS_MONO_FONT } from "./subscriptionsConstants";
import { SubscriptionsScreenHeader } from "./components/SubscriptionsScreenHeader";
import { SubscriptionsFreePlanHero } from "./components/SubscriptionsFreePlanHero";
import { SubscriptionsBillingSection } from "./components/SubscriptionsBillingSection";
import { SubscriptionsUpgradeSection } from "./components/SubscriptionsUpgradeSection";
import { SubscriptionsManageSection } from "./components/SubscriptionsManageSection";
import { createSubscriptionsScreenStyles } from "./subscriptionsScreen.styles";

export default function SubscriptionsScreen() {
  const colors = useThemeColors();
  const s = useMemo(() => createSubscriptionsScreenStyles(colors), [colors]);
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
