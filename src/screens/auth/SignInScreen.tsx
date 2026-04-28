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
import { AuthBackLink } from "../../components/auth/AuthBackLink";
import OAuthButtons from "../../components/OAuthButtons";

type Nav = NativeStackNavigationProp<AuthStackParamList, "SignIn">;

const dc = design.colors;

export default function SignInScreen() {
  const navigation = useNavigation<Nav>();
  const { signIn } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError(null);
    const err = await signIn(email.trim(), password);
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <SafeAreaView style={s.container}>
      <FormKeyboardScrollView
        layoutAnimationKey={`${error ? "e" : ""}-${loading}`}
        style={{ flex: 1 }}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
          <AuthBackLink
            onPress={() => navigation.goBack()}
            style={s.backBtn}
            textStyle={s.backText}
          />

          <View style={s.headings}>
            <Text style={s.title}>Welcome back</Text>
            <Text style={s.subtitle}>Sign in to PawManager</Text>
          </View>

          {error && <ErrorBox message={error} />}

          <View style={s.form}>
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
                placeholder="Your password"
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
              />
            </FormField>

            <TouchableOpacity
              style={s.forgotBtn}
              onPress={() => navigation.navigate("ForgotPassword")}>
              <Text style={s.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <PrimaryButton
            label="Sign In"
            onPress={handleSignIn}
            loading={loading}
          />

          <OrDivider />

          <OAuthButtons onError={setError} onLoadingChange={setLoading} />

          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={s.signUpLink}>
              Don't have an account?{" "}
              <Text style={s.signUpLinkBold}>Sign up free</Text>
            </Text>
          </TouchableOpacity>
      </FormKeyboardScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: dc.surface },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 20,
  },
  backBtn: { marginBottom: 4 },
  backText: { fontSize: 14, fontWeight: "500", color: dc.textMuted },
  headings: { gap: 4, marginBottom: 4 },
  title: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: dc.text,
  },
  subtitle: { fontSize: 15, color: dc.textSecondary },
  form: { gap: 16 },
  forgotBtn: { alignSelf: "flex-end", marginTop: -8 },
  forgotText: { fontSize: 13, fontWeight: "500", color: dc.greenDefault },
  signUpLink: {
    textAlign: "center",
    fontSize: 12,
    color: dc.textMuted,
    lineHeight: 18,
  },
  signUpLinkBold: { fontWeight: "600", color: dc.greenDefault },
});
