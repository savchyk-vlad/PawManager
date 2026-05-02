import React from "react";
import { Text, StyleSheet } from "react-native";
import { auth } from "../../screens/auth/authTheme";
import { LEGAL_PRIVACY_URL, LEGAL_TERMS_URL, openLegalUrl } from "../../lib/legalUrls";

const dc = auth.colors;

const styles = StyleSheet.create({
  terms: {
    textAlign: "center",
    fontSize: 12,
    color: dc.text3,
    lineHeight: 18,
  },
  termsLink: { color: dc.accent, fontWeight: "600" },
});

type Props = { variant: "signup" | "signin" | "forgot" };

export function AuthLegalLinks({ variant }: Props) {
  if (variant === "forgot") {
    return (
      <Text style={styles.terms}>
        <Text style={styles.termsLink} onPress={() => void openLegalUrl(LEGAL_TERMS_URL)}>
          Terms
        </Text>
        <Text style={styles.terms}> · </Text>
        <Text style={styles.termsLink} onPress={() => void openLegalUrl(LEGAL_PRIVACY_URL)}>
          Privacy Policy
        </Text>
      </Text>
    );
  }

  const intro =
    variant === "signup"
      ? "By continuing you agree to our "
      : "By signing in you agree to our ";

  return (
    <Text style={styles.terms}>
      {intro}
      <Text style={styles.termsLink} onPress={() => void openLegalUrl(LEGAL_TERMS_URL)}>
        Terms
      </Text>
      {" and "}
      <Text style={styles.termsLink} onPress={() => void openLegalUrl(LEGAL_PRIVACY_URL)}>
        Privacy Policy
      </Text>
    </Text>
  );
}
