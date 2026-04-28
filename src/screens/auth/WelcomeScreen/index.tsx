import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { design } from "../../../theme";
import { AuthStackParamList } from "../../../navigation/AuthNavigator";
import { PrimaryButton } from "../../../components/auth/AuthComponents";
import { WelcomeHero } from "./components/WelcomeHero";
import { WelcomeValuePropsCard } from "./components/WelcomeValuePropsCard";

type Nav = NativeStackNavigationProp<AuthStackParamList, "Welcome">;

const dc = design.colors;
const dr = design.radius;

export default function WelcomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <WelcomeHero styles={s} />

        <View style={s.body}>
          <WelcomeValuePropsCard styles={s} />

          <PrimaryButton label="Get Started Free" onPress={() => navigation.navigate("SignUp")} />

          <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
            <Text style={s.signInLink}>
              Already have an account? <Text style={s.signInLinkBold}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: dc.surface },

  hero: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 48,
    gap: 12,
  },
  pawEmoji: { fontSize: 100, marginBottom: 4 },
  title: { fontSize: 28, fontWeight: "700", letterSpacing: -0.5, color: dc.text },
  subtitle: {
    fontSize: 15,
    color: dc.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },

  body: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, gap: 34 },
  card: {
    backgroundColor: dc.bg,
    borderRadius: dr.lg,
    borderWidth: 1,
    borderColor: dc.border,
    overflow: "hidden",
    marginBottom: 6,
  },
  propRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  propEmoji: { fontSize: 24 },
  propTitle: { fontSize: 14, fontWeight: "600", color: dc.text, marginBottom: 2 },
  propSub: { fontSize: 12, color: dc.textSecondary, lineHeight: 17 },
  propDivider: { height: 1, backgroundColor: dc.border },

  signInLink: { textAlign: "center", fontSize: 13, color: dc.textMuted },
  signInLinkBold: { fontWeight: "600", color: dc.greenDefault },
});
