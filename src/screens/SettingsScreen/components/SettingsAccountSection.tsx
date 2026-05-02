import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../../../theme";

type Props = {
  styles: any;
  onSignOut: () => void;
  onDelete: () => void;
};

export function SettingsAccountSection({
  styles: st,
  onSignOut,
  onDelete,
}: Props) {
  const colors = useThemeColors();
  return (
    <>
      <Text style={[st.sectionLabel, { fontFamily: "DMSans_600SemiBold" }]}>
        Account
      </Text>
      <View style={st.card}>
        <TouchableOpacity
          style={[st.row, st.accountActionRow]}
          onPress={onSignOut}
          activeOpacity={0.75}>
          <Text style={[st.rowLabelSignOut, { fontFamily: "DMSans_500Medium" }]}>
            Sign Out
          </Text>
          <Ionicons name="exit-outline" size={18} color={colors.amberDefault} />
        </TouchableOpacity>
      </View>

      <Text style={[st.sectionLabel, { fontFamily: "DMSans_600SemiBold" }]}>
        Delete account
      </Text>
      <View style={st.card}>
        <TouchableOpacity
          style={[st.row, st.accountActionRow]}
          onPress={onDelete}
          activeOpacity={0.75}>
          <Text style={[st.rowLabelDelete, { fontFamily: "DMSans_500Medium" }]}>
            Delete Account
          </Text>
          <Ionicons name="warning-outline" size={18} color={colors.redDefault} />
        </TouchableOpacity>
      </View>
    </>
  );
}
