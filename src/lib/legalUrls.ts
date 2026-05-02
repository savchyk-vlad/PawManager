import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';

export const LEGAL_TERMS_URL =
  'https://savchyk-vlad.github.io/pawmanager-legal/terms.html';

export const LEGAL_PRIVACY_URL =
  'https://savchyk-vlad.github.io/pawmanager-legal/privacy.html';

/** Opens in an in-app browser when possible; falls back to the system browser. */
export async function openLegalUrl(url: string): Promise<void> {
  try {
    await WebBrowser.openBrowserAsync(url);
  } catch {
    const can = await Linking.canOpenURL(url);
    if (can) await Linking.openURL(url);
  }
}
