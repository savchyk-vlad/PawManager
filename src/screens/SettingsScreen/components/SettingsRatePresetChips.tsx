import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { DEFAULT_RATE_PRESETS, matchesRatePreset } from "../settingsConstants";
import type { SettingsScreenStyles } from "../settingsScreen.styles";

type ChipStyles = Pick<
  SettingsScreenStyles,
  | "rateOptionsLabel"
  | "rateOptionsRow"
  | "rateOptionChip"
  | "rateOptionChipActive"
  | "rateOptionChipText"
  | "rateOptionChipTextActive"
>;

type Props = {
  fontsLoaded: boolean;
  rateDraft: string;
  onSelectPreset: (amount: number) => void;
  styles: ChipStyles;
};

export function SettingsRatePresetChips({
  fontsLoaded,
  rateDraft,
  onSelectPreset,
  styles,
}: Props) {
  const f = fontsLoaded;

  return (
    <View>
      <Text
        style={[styles.rateOptionsLabel, f && { fontFamily: "DMSans_500Medium" }]}>
        Available options
      </Text>
      <View style={styles.rateOptionsRow}>
        {DEFAULT_RATE_PRESETS.map((n) => {
          const selected = matchesRatePreset(rateDraft, n);
          return (
            <TouchableOpacity
              key={n}
              style={[styles.rateOptionChip, selected && styles.rateOptionChipActive]}
              onPress={() => onSelectPreset(n)}
              activeOpacity={0.85}>
              <Text
                style={[
                  styles.rateOptionChipText,
                  selected && styles.rateOptionChipTextActive,
                  f && { fontFamily: "DMSans_600SemiBold" },
                ]}>
                ${n}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
