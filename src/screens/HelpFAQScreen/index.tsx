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
import { colors } from "../../theme";
import { GlyphBackScreenHeader } from "../../components/GlyphBackScreenHeader";
import { HelpFaqList } from "./components/HelpFaqList";

export default function HelpFAQScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });
  const f = fontsLoaded;

  if (!fontsLoaded) {
    return (
      <View style={[s.safe, { paddingTop: insets.top, justifyContent: "center" }]}>
        <ActivityIndicator color={colors.greenDefault} />
      </View>
    );
  }

  return (
    <View style={[s.safe, { paddingTop: insets.top }]}>
      <GlyphBackScreenHeader
        title="Help & FAQ"
        onBack={() => navigation.goBack()}
        styles={s}
        titleStyle={f ? { fontFamily: "DMSans_700Bold" } : undefined}
      />

      <ScrollView
        contentContainerStyle={[s.body, { paddingBottom: 28 + insets.bottom }]}
        showsVerticalScrollIndicator={false}>
        <HelpFaqList fontsLoaded={f} styles={s} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
    gap: 6,
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backGlyph: {
    fontSize: 28,
    color: colors.greenDefault,
    marginTop: -2,
    fontWeight: "300",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.3,
    flex: 1,
  },
  body: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  intro: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
  },
  q: { fontSize: 15, fontWeight: "600", color: colors.text, letterSpacing: -0.2 },
  a: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
});
