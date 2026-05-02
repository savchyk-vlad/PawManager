import React from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";

type Props = {
  styles: any;
  identityAnimatedStyle: any;
  subtitleAnimatedStyle: any;
  statsAnimatedStyle: any;
  headerAnimatedStyle: any;
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
  identityAnimatedStyle,
  subtitleAnimatedStyle,
  statsAnimatedStyle,
  headerAnimatedStyle,
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
      <Animated.View style={[st.profileHeaderShell, headerAnimatedStyle]}>
        <View style={st.profileHeaderTopRow}>
          <View style={st.profileHeaderLeft}>
            <Text style={[st.profileHeaderTitle, { fontFamily: "DMSans_700Bold" }]}>
              Profile
            </Text>
            <Animated.Text
              style={[
                st.profileHeaderSubtitle,
                subtitleAnimatedStyle,
                { fontFamily: "DMSans_600SemiBold" },
              ]}>
              Account and defaults
            </Animated.Text>
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

        <Animated.View style={[st.profileIdentityRow, identityAnimatedStyle]}>
            <View style={st.avatarCircle}>
              <Text style={[st.avatarLetter, { fontFamily: "DMSans_700Bold" }]}>
                {initials}
              </Text>
            </View>
            <View style={st.profileIdentityBody}>
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
          </Animated.View>

        <Animated.View style={[st.profileStatsRow, statsAnimatedStyle]}>
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
        </Animated.View>
      </Animated.View>
    </View>
  );
}
