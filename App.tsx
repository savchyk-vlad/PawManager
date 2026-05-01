import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Navigation from './src/navigation';
import MissingConfigScreen from './src/screens/MissingConfigScreen';
import { isSupabaseConfigured } from './src/lib/expoEnv';
import { supabase } from './src/lib/supabase';

export default function App() {
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    void import('./src/lib/backgroundTasks').then((m) =>
      m.registerBackgroundTaskAsync().catch(() => {
        /* dev client / unsupported */
      })
    );
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <MissingConfigScreen />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Navigation />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
