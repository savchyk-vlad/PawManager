import React from "react";
import { View, Text } from "react-native";

export function AuthNoticeCard({
  title,
  body,
  styles,
}: {
  title: string;
  body: string;
  styles: Record<string, object>;
}) {
  return (
    <View style={styles.successCard}>
      <Text style={styles.successIcon}>✓</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.successTitle}>{title}</Text>
        <Text style={styles.successBody}>{body}</Text>
      </View>
    </View>
  );
}
