import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import {
  LEGAL_PRIVACY_URL,
  LEGAL_TERMS_URL,
  openLegalUrl,
} from "../../../lib/legalUrls";

type Props = {
  styles: any;
};

export function SettingsLegalSection({ styles: st }: Props) {
  return (
    <>
      <Text style={[st.sectionLabel, { fontFamily: "DMSans_600SemiBold" }]}>
        Legal
      </Text>
      <View style={st.card}>
        <TouchableOpacity
          style={st.row}
          onPress={() => void openLegalUrl(LEGAL_TERMS_URL)}
          activeOpacity={0.75}>
          <Text style={[st.rowLabel, { fontFamily: "DMSans_500Medium" }]}>
            Terms & conditions
          </Text>
          <Text style={st.rowChevron}>›</Text>
        </TouchableOpacity>
        <View style={st.hairline} />
        <TouchableOpacity
          style={st.row}
          onPress={() => void openLegalUrl(LEGAL_PRIVACY_URL)}
          activeOpacity={0.75}>
          <Text style={[st.rowLabel, { fontFamily: "DMSans_500Medium" }]}>
            Privacy policy
          </Text>
          <Text style={st.rowChevron}>›</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
