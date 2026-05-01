import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FormKeyboardScrollView } from '../../components/FormKeyboardScrollView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth } from './authTheme';
import { useAuthStore } from '../../store/authStore';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { PrimaryButton, FormField, AuthInput, ErrorBox } from '../../components/auth/AuthComponents';
import { AuthBackLink } from '../../components/auth/AuthBackLink';
import { AuthNoticeCard } from '../../components/auth/AuthNoticeCard';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const dc = auth.colors;
const dr = auth.radius;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<Nav>();
  const { resetPassword } = useAuthStore();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    if (!email) { setError('Please enter your email.'); return; }
    setLoading(true);
    setError(null);
    const err = await resetPassword(email.trim());
    setLoading(false);
    if (err) setError(err);
    else setSent(true);
  }

  return (
    <SafeAreaView style={s.container}>
      <FormKeyboardScrollView
        layoutAnimationKey={`${sent ? "sent" : "form"}-${error ? "e" : ""}`}
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

          <View style={s.hero}>
            <Text style={s.heroIcon}>🔑</Text>
            <Text style={s.title}>Forgot password?</Text>
            <Text style={s.body}>
              Enter the email linked to your account and we'll send a reset link.
            </Text>
          </View>

          {error && <ErrorBox message={error} />}

          <FormField label="Email">
            <AuthInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="done"
              onSubmitEditing={handleReset}
            />
          </FormField>

          {sent ? (
            <AuthNoticeCard
              title="Check your inbox"
              body={`We sent a reset link to ${email}. It expires in 15 minutes.`}
              styles={s}
            />
          ) : (
            <PrimaryButton label="Send Reset Link" onPress={handleReset} loading={loading} />
          )}

          <TouchableOpacity
            onPress={() => navigation.navigate('SignIn')}
            style={s.linkBtn}
            activeOpacity={0.85}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={s.signInLink}>
              Remembered it?{' '}
              <Text style={s.signInLinkBold}>Sign in</Text>
            </Text>
          </TouchableOpacity>
      </FormKeyboardScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: dc.bg },
  content: {
    paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40, gap: 20,
  },
  backBtn: { marginBottom: 8 },
  backText: { fontSize: 14, fontWeight: '500', color: dc.text3 },
  hero: { gap: 8, marginBottom: 4 },
  heroIcon: { fontSize: 40, marginBottom: 6 },
  title: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5, color: dc.text },
  body: { fontSize: 15, color: dc.text2, lineHeight: 22 },
  successCard: {
    backgroundColor: dc.accentDim,
    borderWidth: 1,
    borderColor: 'rgba(74,224,112,0.25)',
    borderRadius: dr.rSm,
    padding: 16,
    flexDirection: 'row', gap: 12,
  },
  successIcon: { fontSize: 20, color: dc.accent, fontWeight: '800' },
  successTitle: { fontSize: 14, fontWeight: '600', color: dc.text, marginBottom: 4 },
  successBody: { fontSize: 12, color: dc.text2, lineHeight: 18 },
  signInLink: { textAlign: 'center', fontSize: 13, color: dc.text3 },
  signInLinkBold: { fontWeight: '600', color: dc.accent },
  linkBtn: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignSelf: 'center',
  },
});
