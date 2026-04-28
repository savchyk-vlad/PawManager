import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme";

type Props = {
  styles: any;
  mono: string;
  clientCount: number;
  freeLimit: number;
  onPress: () => void;
};

export function SettingsSubscriptionCard({
  styles: st,
  mono,
  clientCount,
  freeLimit,
  onPress,
}: Props) {
  return (
    <>
      <Text style={[st.sectionLabel, { fontFamily: "DMSans_600SemiBold" }]}>
        Subscription
      </Text>
      <TouchableOpacity
        style={st.subEntryCard}
        onPress={onPress}
        activeOpacity={0.82}>
        <View style={st.subEntryInner}>
          <View style={st.subEntryLeft}>
            <View style={st.subIcon}>
              <Ionicons name="star" size={16} color={colors.greenDefault} />
            </View>
            <View>
              <Text
                style={[st.subEntryName, { fontFamily: "DMSans_600SemiBold" }]}>
                Free plan
              </Text>
              <Text style={[st.subEntryDetail, { fontFamily: mono }]}>
                {clientCount} of {freeLimit} clients used
              </Text>
            </View>
          </View>
          <View style={st.subEntryRight}>
            <View style={st.freeBadge}>
              <Text style={[st.freeBadgeText, { fontFamily: mono }]}>
                FREE
              </Text>
            </View>
            <Text style={st.rowChevron}>›</Text>
          </View>
        </View>
      </TouchableOpacity>
    </>
  );
}
