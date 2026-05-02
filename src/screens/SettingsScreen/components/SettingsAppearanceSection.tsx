import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppearance, useSetAppearance, useThemeColors } from "../../../theme";
import type { SettingsScreenStyles } from "../settingsScreen.styles";

type Props = {
  styles: Pick<SettingsScreenStyles, "sectionLabel" | "card">;
};

export function SettingsAppearanceSection({ styles: st }: Props) {
  const appearance = useAppearance();
  const setAppearance = useSetAppearance();
  const colors = useThemeColors();

  return (
    <>
      <Text style={[st.sectionLabel, { fontFamily: "DMSans_600SemiBold" }]}>
        Appearance
      </Text>
      <View style={st.card}>
        <View style={{ flexDirection: "row", padding: 6, gap: 8 }}>
          {(["dark", "light"] as const).map((mode) => {
            const active = appearance === mode;
            return (
              <Pressable
                key={mode}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setAppearance(mode)}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    paddingVertical: 11,
                    borderRadius: 14,
                    alignItems: "center",
                    backgroundColor: active ? colors.greenSubtle : colors.surfaceHigh,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: active ? colors.greenBorder : "transparent",
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: active ? colors.greenText : colors.textMuted,
                  }}>
                  {mode === "dark" ? "Dark" : "Light"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </>
  );
}
