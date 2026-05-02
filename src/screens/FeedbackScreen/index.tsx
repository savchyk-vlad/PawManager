import React, { useMemo } from "react";
import { View, StyleSheet, ActivityIndicator, Linking, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { useThemeColors, type ThemeColors } from "../../theme";
import { GlyphBackScreenHeader } from "../../components/GlyphBackScreenHeader";
import { FeedbackBody } from "./components/FeedbackBody";

const FEEDBACK_EMAIL = "support@pawmanager.app";

export default function FeedbackScreen() {
  const colors = useThemeColors();
  const s = useMemo(() => createIndexStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });
  const f = fontsLoaded;

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";
  const buildNumber =
    Constants.expoConfig?.ios?.buildNumber?.toString() ??
    (Constants.expoConfig?.android?.versionCode != null
      ? String(Constants.expoConfig.android.versionCode)
      : null) ??
    (Constants as { nativeBuildVersion?: string }).nativeBuildVersion ??
    "—";

  const mailto = useMemo(() => {
    const subject = encodeURIComponent("PawManager feedback");
    const body = encodeURIComponent(
      `\n\n---\nApp: PawManager v${appVersion} · Build ${buildNumber}\nPlatform: ${Platform.OS}`,
    );
    return `mailto:${FEEDBACK_EMAIL}?subject=${subject}&body=${body}`;
  }, [appVersion, buildNumber]);

  async function openMail() {
    const can = await Linking.canOpenURL(mailto);
    if (!can) {
      Alert.alert("Email", `Send feedback to ${FEEDBACK_EMAIL} from your mail app.`);
      return;
    }
    await Linking.openURL(mailto);
  }

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
        title="Send feedback"
        onBack={() => navigation.goBack()}
        styles={s}
        titleStyle={f ? { fontFamily: "DMSans_700Bold" } : undefined}
      />

      <FeedbackBody
        fontsLoaded={f}
        onOpenMail={openMail}
        email={FEEDBACK_EMAIL}
        appVersion={appVersion}
        buildNumber={buildNumber}
        styles={s}
      />
    </View>
  );
}

function createIndexStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 20 },
  blurb: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  primaryBtn: {
    backgroundColor: colors.greenDeep,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.greenText,
  },
  meta: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 16,
    gap: 6,
  },
  metaLabel: { fontSize: 13, color: colors.text },
  metaHint: { fontSize: 12, color: colors.textSecondary },
});
}
