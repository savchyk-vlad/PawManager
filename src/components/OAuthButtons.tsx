import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { googleIosClientId, googleWebClientId } from '../lib/expoEnv';
import { supabase } from '../lib/supabase';
import { GoogleButton } from './auth/AuthComponents';

WebBrowser.maybeCompleteAuthSession();

interface Props {
  onError: (msg: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export default function OAuthButtons({ onError, onLoadingChange }: Props) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: googleIosClientId,
    webClientId: googleWebClientId,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params?.id_token;
      if (idToken) {
        onLoadingChange?.(true);
        supabase.auth
          .signInWithIdToken({ provider: 'google', token: idToken })
          .then(({ error }) => {
            if (error) onError(error.message);
          })
          .finally(() => onLoadingChange?.(false));
      } else {
        onError('Google sign-in failed: no token received.');
      }
    } else if (response?.type === 'error') {
      onError('Google sign-in was cancelled or failed.');
    }
  }, [response]);

  return (
    <View style={s.container}>
      <GoogleButton
        onPress={() => promptAsync()}
        loading={!request}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { width: '100%' },
});
