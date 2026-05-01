// Read `.env*` the same way as Expo CLI (`@expo/env`) so `expo.extra` is filled even
// when `process.env` is already set / skipped by plain dotenv.
const path = require("path");
const { parseProjectEnv } = require("@expo/env");

const projectRoot = __dirname;
const { env: p } = parseProjectEnv(projectRoot, { silent: true });
const e = p || {};

const config = {
  name: "pawmanager",
  slug: "pawmanager",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  scheme: "pawmanager",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.pawmanager.app",
    usesAppleSignIn: true,
    buildNumber: "13",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-font",
    "expo-web-browser",
    "expo-apple-authentication",
    "expo-secure-store",
    "expo-background-task",
    "@react-native-community/datetimepicker",
  ],
  extra: {
    eas: {
      projectId: "667e0cb7-eaef-4329-b11f-3fd4754758ab",
    },
    supabaseUrl:
      e.SUPABASE_URL ||
      e.EXPO_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey:
      e.SUPABASE_ANON_KEY ||
      e.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    googleIosClientId:
      e.GOOGLE_IOS_CLIENT_ID ||
      e.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
      process.env.GOOGLE_IOS_CLIENT_ID ||
      process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    googleWebClientId:
      e.GOOGLE_WEB_CLIENT_ID ||
      e.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
      process.env.GOOGLE_WEB_CLIENT_ID ||
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  },
};

module.exports = { expo: config };
