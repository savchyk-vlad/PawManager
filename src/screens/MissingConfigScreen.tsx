import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';

const STEPS = [
  '1. In the project root (next to app.config.js and package.json), create or edit the file .env',
  '2. Set both (names must match):',
  '   EXPO_PUBLIC_SUPABASE_URL=your project URL from Supabase → Settings → API',
  '   EXPO_PUBLIC_SUPABASE_ANON_KEY=your anon public key from the same page',
  '   (You can also use SUPABASE_URL and SUPABASE_ANON_KEY without EXPO_PUBLIC_.)',
  '3. On your computer, run: npx expo start -c  then reload the app in Expo Go.',
  '4. If Expo Go on the phone does not connect, try: npx expo start --tunnel on the same machine.',
  '5. The phone only loads the JS bundle; it does not read .env — .env is only on your dev machine.',
];

export default function MissingConfigScreen() {
  return (
    <ScrollView contentContainerStyle={s.outer}>
      <Text style={s.title}>Configuration needed</Text>
      <Text style={s.body}>
        Supabase URL and key were not found. The app is blocked until your machine provides them
        in .env and Metro bundles again.
      </Text>
      {STEPS.map((line) => (
        <Text key={line} style={s.step}>
          {line}
        </Text>
      ))}
      <Text style={s.muted}>
        {Platform.select({ ios: 'iOS', android: 'Android' })} · Open the Metro terminal for errors. Run npm run
        check:env in the project root to verify the file is read.
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  outer: { padding: 24, paddingTop: 60, maxWidth: 520, alignSelf: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#111' },
  body: { fontSize: 15, lineHeight: 22, marginBottom: 16, color: '#333' },
  step: { fontSize: 14, lineHeight: 20, marginBottom: 6, color: '#222' },
  muted: { fontSize: 12, lineHeight: 18, marginTop: 20, color: '#666' },
});
