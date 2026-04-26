// Ensures the same Metro pipeline as the Expo CLI (incl. EXPO_PUBLIC_ handling).
const { getDefaultConfig } = require('expo/metro-config');

module.exports = getDefaultConfig(__dirname);
