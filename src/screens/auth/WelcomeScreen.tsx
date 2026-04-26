import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { design } from '../../theme';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { PrimaryButton } from '../../components/auth/AuthComponents';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

const dc = design.colors;
const dr = design.radius;

const VALUE_PROPS = [
  {
    emoji: '📋',
    title: 'All your clients in one place',
    sub: 'Dogs, owners, notes, vets — organized and ready.',
  },
  {
    emoji: '📅',
    title: 'Smart scheduling',
    sub: 'Recurring walks, reminders, one-tap START.',
  },
  {
    emoji: '💵',
    title: 'Track every payment',
    sub: 'See who owes what, mark paid in one tap.',
  },
];

export default function WelcomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={s.hero}>
          <Text style={s.pawEmoji}>🐾</Text>
          <Text style={s.title}>PawManager</Text>
          <Text style={s.subtitle}>
            The business app built for dog walkers.{'\n'}No commissions. Ever.
          </Text>
        </View>

        <View style={s.body}>
          <View style={s.card}>
            {VALUE_PROPS.map((prop, i) => (
              <View key={prop.title}>
                <View style={s.propRow}>
                  <Text style={s.propEmoji}>{prop.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.propTitle}>{prop.title}</Text>
                    <Text style={s.propSub}>{prop.sub}</Text>
                  </View>
                </View>
                {i < VALUE_PROPS.length - 1 && <View style={s.propDivider} />}
              </View>
            ))}
          </View>

          <PrimaryButton
            label="Get Started Free"
            onPress={() => navigation.navigate('SignUp')}
          />

          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={s.signInLink}>
              Already have an account?{' '}
              <Text style={s.signInLinkBold}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: dc.surface.subtle },

  hero: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 48,
    gap: 12,
  },
  pawEmoji: { fontSize: 100, marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5, color: dc.text.primary },
  subtitle: {
    fontSize: 15, color: dc.text.secondary,
    textAlign: 'center', lineHeight: 22,
  },

  body: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, gap: 34 },
  card: {
    backgroundColor: dc.surface.base,
    borderRadius: dr.lg,
    borderWidth: 1,
    borderColor: dc.border,
    overflow: 'hidden',
    marginBottom: 6,
  },
  propRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 16, gap: 14,
  },
  propEmoji: { fontSize: 24 },
  propTitle: { fontSize: 14, fontWeight: '600', color: dc.text.primary, marginBottom: 2 },
  propSub: { fontSize: 12, color: dc.text.secondary, lineHeight: 17 },
  propDivider: { height: 1, backgroundColor: dc.border },

  signInLink: { textAlign: 'center', fontSize: 13, color: dc.text.tertiary },
  signInLinkBold: { fontWeight: '600', color: dc.brand.mid },
});
