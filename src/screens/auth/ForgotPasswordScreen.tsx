import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FormKeyboardScrollView } from '../../components/FormKeyboardScrollView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { design } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { PrimaryButton, FormField, AuthInput, ErrorBox } from '../../components/auth/AuthComponents';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const dc = design.colors;
const dr = design.radius;

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
        style={{ flex: 1 }}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>

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
            <View style={s.successCard}>
              <Text style={s.successIcon}>✓</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.successTitle}>Check your inbox</Text>
                <Text style={s.successBody}>
                  We sent a reset link to {email}. It expires in 15 minutes.
                </Text>
              </View>
            </View>
          ) : (
            <PrimaryButton label="Send Reset Link" onPress={handleReset} loading={loading} />
          )}

          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
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
  container: { flex: 1, backgroundColor: dc.surface.subtle },
  content: {
    paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40, gap: 20,
  },
  backBtn: { marginBottom: 8 },
  backText: { fontSize: 14, fontWeight: '500', color: dc.text.tertiary },
  hero: { gap: 8, marginBottom: 4 },
  heroIcon: { fontSize: 40, marginBottom: 6 },
  title: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5, color: dc.text.primary },
  body: { fontSize: 15, color: dc.text.secondary, lineHeight: 22 },
  successCard: {
    backgroundColor: dc.brand.light,
    borderLeftWidth: 3, borderLeftColor: dc.brand.dark,
    borderRadius: dr.sm,
    padding: 16,
    flexDirection: 'row', gap: 12,
  },
  successIcon: { fontSize: 20, color: dc.brand.dark, fontWeight: '700' },
  successTitle: { fontSize: 14, fontWeight: '600', color: dc.brand.dark, marginBottom: 4 },
  successBody: { fontSize: 12, color: dc.brand.mid, lineHeight: 18 },
  signInLink: { textAlign: 'center', fontSize: 13, color: dc.text.tertiary },
  signInLinkBold: { fontWeight: '600', color: dc.brand.mid },
});
