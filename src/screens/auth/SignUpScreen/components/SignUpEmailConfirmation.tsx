import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthNoticeCard } from "../../../../components/auth/AuthNoticeCard";

type Styles = Record<string, object>;

export function SignUpEmailConfirmation({
  email,
  onGoToSignIn,
  styles,
}: {
  email: string;
  onGoToSignIn: () => void;
  styles: Styles;
}) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.successBox}>
        <AuthNoticeCard
          title="Check your inbox"
          body={`We sent a confirmation link to ${email}. It expires in 15 minutes.`}
          styles={styles}
        />
        <TouchableOpacity onPress={onGoToSignIn}>
          <Text style={styles.signInLink}>
            Go to <Text style={styles.signInLinkBold}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
