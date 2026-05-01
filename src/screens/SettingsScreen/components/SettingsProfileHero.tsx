import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme";

type Props = {
  styles: any;
  initials: string;
  fullName: string;
  onOpenNameModal: () => void;
  savingFullName: boolean;
  email: string;
  defaultRate: number;
  walksCount: number;
  clientsCount: number;
  defaultWalkDuration: number;
};

export function SettingsProfileHero({
  styles: st,
  initials,
  fullName,
  onOpenNameModal,
  savingFullName,
  email,
  defaultRate,
  walksCount,
  clientsCount,
  defaultWalkDuration,
}: Props) {
  return (
    <View style={st.profileHero}>
      <View style={st.profileBanner}>
        <View style={st.profileBannerInner}>
          <View style={st.avatarWrap}>
            <View style={st.avatarCircle}>
              <Text style={[st.avatarLetter, { fontFamily: "DMSans_700Bold" }]}>
                {initials}
              </Text>
            </View>

            <TouchableOpacity
              style={st.avatarEdit}
              onPress={onOpenNameModal}
              activeOpacity={0.85}
              hitSlop={{
                top: 8,
                bottom: 8,
                left: 8,
                right: 8,
              }}
            />
          </View>
          <View style={st.heroTitleCol}>
            <Text style={[st.profileName, { fontFamily: "DMSans_700Bold" }]} numberOfLines={1}>
              {fullName}
            </Text>
            <Text style={[st.profileEmail, { fontFamily: "DMSans_400Regular" }]} numberOfLines={1}>
              {email}
            </Text>
            {savingFullName ? (
              <Text style={[st.heroSaving, { fontFamily: "DMSans_400Regular" }]}>
                Saving…
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            style={st.editProfileBtn}
            onPress={onOpenNameModal}
            activeOpacity={0.85}>
            <Text
              style={[
                st.editProfileBtnText,
                { fontFamily: "DMSans_500Medium" },
              ]}>
              Edit profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={st.profileHeroBody}>
        <View style={st.profileStatsRow}>
          <View style={st.profileStatItem}>
            <Text
              style={[
                st.profileStatValue,
                st.profileStatValueAccent,
                { fontFamily: "DMSans_600SemiBold" },
              ]}>
              ${defaultRate}
            </Text>
            <Text
              style={[
                st.profileStatLabel,
                { fontFamily: "DMSans_400Regular" },
              ]}>
              Rate
            </Text>
          </View>

          <View style={st.profileStatDivider} />

          <View style={st.profileStatItem}>
            <Text
              style={[
                st.profileStatValue,
                { fontFamily: "DMSans_600SemiBold" },
              ]}>
              {walksCount}
            </Text>
            <Text
              style={[
                st.profileStatLabel,
                { fontFamily: "DMSans_400Regular" },
              ]}>
              Walks
            </Text>
          </View>

          <View style={st.profileStatDivider} />

          <View style={st.profileStatItem}>
            <Text
              style={[
                st.profileStatValue,
                { fontFamily: "DMSans_600SemiBold" },
              ]}>
              {clientsCount}
            </Text>
            <Text
              style={[
                st.profileStatLabel,
                { fontFamily: "DMSans_400Regular" },
              ]}>
              Clients
            </Text>
          </View>

          <View style={st.profileStatDivider} />

          <View style={st.profileStatItem}>
            <Text
              style={[
                st.profileStatValue,
                { fontFamily: "DMSans_600SemiBold" },
              ]}>
              {defaultWalkDuration}m
            </Text>
            <Text
              style={[
                st.profileStatLabel,
                { fontFamily: "DMSans_400Regular" },
              ]}>
              Duration
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
