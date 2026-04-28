import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  styles: any;
  mono: string;
  appVersion: string;
  onHelp: () => void;
  onFeedback: () => void;
};

export function SettingsSupportSection({
  styles: st,
  mono,
  appVersion,
  onHelp,
  onFeedback,
}: Props) {
  return (
    <>
      <Text style={[st.sectionLabel, { fontFamily: "DMSans_600SemiBold" }]}>
        Support
      </Text>
      <View style={st.card}>
        <TouchableOpacity style={st.row} onPress={onHelp} activeOpacity={0.75}>
          <Text style={[st.rowLabel, { fontFamily: "DMSans_500Medium" }]}>
            Help & FAQ
          </Text>
          <Text style={st.rowChevron}>›</Text>
        </TouchableOpacity>
        <View style={st.hairline} />
        <TouchableOpacity
          style={st.row}
          onPress={onFeedback}
          activeOpacity={0.75}>
          <Text style={[st.rowLabel, { fontFamily: "DMSans_500Medium" }]}>
            Send feedback
          </Text>
          <Text style={st.rowChevron}>›</Text>
        </TouchableOpacity>
        <View style={st.hairline} />
        <View style={st.row}>
          <Text style={[st.rowLabel, { fontFamily: "DMSans_500Medium" }]}>
            App version
          </Text>
          <Text style={[st.supportVersionValue, { fontFamily: mono }]}>
            v{appVersion}
          </Text>
        </View>
      </View>
    </>
  );
}
