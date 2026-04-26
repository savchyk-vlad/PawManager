import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FormKeyboardScrollView } from "../../components/FormKeyboardScrollView";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { design } from "../../theme";
import { useAuthStore } from "../../store/authStore";
import { AuthStackParamList } from "../../navigation/AuthNavigator";
import {
  PrimaryButton,
  OrDivider,
  FormField,
  AuthInput,
  ErrorBox,
} from "../../components/auth/AuthComponents";
import OAuthButtons from "../../components/OAuthButtons";

type Nav = NativeStackNavigationProp<AuthStackParamList, "SignUp">;

const dc = design.colors;

export default function SignUpScreen() {
  const navigation = useNavigation<Nav>();
  const { signUp } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSignUp() {
    if (!fullName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError(null);
    const err = await signUp(
      email.trim(),
      password,
      fullName.trim(),
      businessName.trim(),
    );
    setLoading(false);
    if (err) setError(err);
    else setSuccess(true);
  }

  if (success) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.successBox}>
          <View style={s.successCard}>
            <Text style={s.successIcon}>✓</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.successTitle}>Check your inbox</Text>
              <Text style={s.successBody}>
                We sent a confirmation link to {email}. It expires in 15
                minutes.
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
            <Text style={s.signInLink}>
              Go to <Text style={s.signInLinkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <FormKeyboardScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => navigation.goBack()}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={s.headings}>
            <Text style={s.title}>Create account</Text>
          </View>

          {error && <ErrorBox message={error} />}

          <View style={s.form}>
            <FormField label="Full name">
              <AuthInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Jane Smith"
                autoCapitalize="words"
                returnKeyType="next"
              />
            </FormField>

            <FormField label="Email">
              <AuthInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
              />
            </FormField>

            <FormField label="Password">
              <AuthInput
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 6 characters"
                secureTextEntry
                returnKeyType="next"
              />
            </FormField>

            <FormField label="Business name" optional>
              <AuthInput
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="e.g. Jake's Dog Walking"
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
              />
            </FormField>
          </View>

          <PrimaryButton
            label="Create Account"
            onPress={handleSignUp}
            loading={loading}
          />

          <OrDivider />
          <OAuthButtons onError={setError} onLoadingChange={setLoading} />

          <Text style={s.terms}>
            By continuing you agree to our{" "}
            <Text style={s.termsLink}>Terms</Text> and{" "}
            <Text style={s.termsLink}>Privacy Policy</Text>
          </Text>
      </FormKeyboardScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: dc.surface.subtle },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 20,
  },
  backBtn: { marginBottom: 4 },
  backText: { fontSize: 14, fontWeight: "500", color: dc.text.tertiary },
  headings: { gap: 4 },
  title: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: dc.text.primary,
  },
  subtitle: { fontSize: 15, color: dc.text.secondary },
  form: { gap: 18 },
  terms: {
    textAlign: "center",
    fontSize: 12,
    color: dc.text.tertiary,
    lineHeight: 18,
  },
  termsLink: { color: dc.brand.mid },
  signInLink: { textAlign: "center", fontSize: 13, color: dc.text.tertiary },
  signInLinkBold: { fontWeight: "600", color: dc.brand.mid },
  successBox: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    gap: 20,
  },
  successCard: {
    backgroundColor: dc.brand.light,
    borderLeftWidth: 3,
    borderLeftColor: dc.brand.dark,
    borderRadius: design.radius.sm,
    padding: 16,
    flexDirection: "row",
    gap: 12,
  },
  successIcon: { fontSize: 20, color: dc.brand.dark, fontWeight: "700" },
  successTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: dc.brand.dark,
    marginBottom: 4,
  },
  successBody: { fontSize: 12, color: dc.brand.mid, lineHeight: 18 },
});
