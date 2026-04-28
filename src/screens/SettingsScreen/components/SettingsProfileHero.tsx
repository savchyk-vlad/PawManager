import React, { RefObject } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme";

type Props = {
  styles: any;
  nameInputRef: RefObject<TextInput | null>;
  initials: string;
  fullNameInput: string;
  onChangeFullName: (t: string) => void;
  onNameBlur: () => void;
  savingFullName: boolean;
  email: string;
};

export function SettingsProfileHero({
  styles: st,
  nameInputRef,
  initials,
  fullNameInput,
  onChangeFullName,
  onNameBlur,
  savingFullName,
  email,
}: Props) {
  return (
    <View style={st.profileHero}>
      <View style={st.avatarWrap}>
        <View style={st.avatarCircle}>
          <Text style={[st.avatarLetter, { fontFamily: "DMSans_700Bold" }]}>
            {initials}
          </Text>
        </View>
        <TouchableOpacity
          style={st.avatarEdit}
          onPress={() => nameInputRef.current?.focus()}
          activeOpacity={0.85}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="create-outline" size={11} color={colors.greenText} />
        </TouchableOpacity>
      </View>
      <TextInput
        ref={nameInputRef}
        style={[st.profileName, { fontFamily: "DMSans_700Bold" }]}
        value={fullNameInput}
        onChangeText={onChangeFullName}
        onBlur={onNameBlur}
        editable={!savingFullName}
        placeholder="Your name"
        placeholderTextColor={colors.textMuted}
      />
      <Text style={[st.profileEmail, { fontFamily: "DMSans_400Regular" }]}>
        {email}
      </Text>
      {savingFullName ? (
        <Text style={[st.heroSaving, { fontFamily: "DMSans_400Regular" }]}>
          Saving…
        </Text>
      ) : null}
    </View>
  );
}
