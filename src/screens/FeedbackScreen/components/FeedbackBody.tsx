import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

type Styles = Record<string, object>;

export function FeedbackBody({
  fontsLoaded,
  onOpenMail,
  email,
  appVersion,
  buildNumber,
  styles,
}: {
  fontsLoaded: boolean;
  onOpenMail: () => void;
  email: string;
  appVersion: string;
  buildNumber: string;
  styles: Styles;
}) {
  const f = fontsLoaded;

  return (
    <View style={styles.content}>
      <Text style={[styles.blurb, f && { fontFamily: "DMSans_400Regular" }]}>
        Tell us what would make PawManager better — bugs, ideas, or anything else. We read every message.
      </Text>

      <TouchableOpacity style={styles.primaryBtn} onPress={onOpenMail} activeOpacity={0.85}>
        <Text style={[styles.primaryBtnText, f && { fontFamily: "DMSans_600SemiBold" }]}>Open email</Text>
      </TouchableOpacity>

      <View style={styles.meta}>
        <Text style={[styles.metaLabel, f && { fontFamily: "DMSans_500Medium" }]}>{email}</Text>
        <Text style={[styles.metaHint, f && { fontFamily: "DMSans_400Regular" }]}>
          v{appVersion} · Build {buildNumber}
        </Text>
      </View>
    </View>
  );
}
