import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { googleIosClientId, googleWebClientId } from '../lib/expoEnv';
import { supabase } from '../lib/supabase';
import { AppleButton, GoogleButton } from './auth/AuthComponents';

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
  const [appleLoading, setAppleLoading] = React.useState(false);

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

  const signInWithApple = async () => {
    try {
      setAppleLoading(true);
      onLoadingChange?.(true);
      const cred = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const token = cred.identityToken;
      if (!token) {
        onError('Apple sign-in failed: no token received.');
        return;
      }
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token,
      });
      if (error) onError(error.message);
    } catch (e: any) {
      if (e?.code === 'ERR_REQUEST_CANCELED') return;
      onError(e?.message ?? 'Apple sign-in failed.');
    } finally {
      setAppleLoading(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <View style={s.container}>
      {Platform.OS === 'ios' ? (
        <AppleButton onPress={signInWithApple} loading={appleLoading} />
      ) : null}
      {Platform.OS === 'ios' ? <View style={{ height: 10 }} /> : null}
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
