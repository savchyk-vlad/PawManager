import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { WalkDuration, WALK_DURATION_PRESETS } from "../../../store/settingsStore";
import { NotifPill } from "./NotifPill";

type Props = {
  styles: any;
  mono: string;
  fontsReady: boolean;
  businessName: string;
  bizInput: string;
  defaultRate: number;
  defaultWalkDuration: WalkDuration;
  onOpenBusinessName: () => void;
  onOpenRate: () => void;
  onSelectWalkDuration: (d: WalkDuration) => void;
};

export function SettingsBusinessSection({
  styles: st,
  mono,
  fontsReady: f,
  businessName,
  bizInput,
  defaultRate,
  defaultWalkDuration,
  onOpenBusinessName,
  onOpenRate,
  onSelectWalkDuration,
}: Props) {
  return (
    <>
      <Text style={[st.sectionLabel, { fontFamily: "DMSans_600SemiBold" }]}>
        Business
      </Text>
      <View style={st.card}>
        <TouchableOpacity
          style={st.row}
          onPress={onOpenBusinessName}
          activeOpacity={0.75}>
          <Text style={[st.rowLabel, { fontFamily: "DMSans_500Medium" }]}>
            Business name
          </Text>
          <View style={st.rowValueWrap}>
            <Text
              style={[
                st.rowValueDisplay,
                !(businessName.trim() || bizInput.trim()) &&
                  st.rowValuePlaceholder,
                { fontFamily: mono },
              ]}
              numberOfLines={1}>
              {businessName.trim() || bizInput.trim() || "—"}
            </Text>
            <Text style={st.rowChevron}>›</Text>
          </View>
        </TouchableOpacity>
        <View style={st.hairline} />
        <TouchableOpacity style={st.row} onPress={onOpenRate} activeOpacity={0.75}>
          <Text style={[st.rowLabel, { fontFamily: "DMSans_500Medium" }]}>
            Default rate
          </Text>
          <View style={st.rowValueWrap}>
            <Text style={[st.rateMono, { fontFamily: mono }]}>${defaultRate}</Text>
            <Text style={[st.rateWalk, { fontFamily: "DMSans_400Regular" }]}>
              /walk
            </Text>
            <Text style={st.rowChevron}>›</Text>
          </View>
        </TouchableOpacity>
        <View style={st.hairline} />
        <View style={[st.row, { flexWrap: "wrap", alignItems: "flex-start" }]}>
          <Text
            style={[
              st.rowLabel,
              { fontFamily: "DMSans_500Medium", marginBottom: 10 },
            ]}>
            Default walk duration
          </Text>
          <View style={st.notifPillRow}>
            {WALK_DURATION_PRESETS.map((d) => (
              <NotifPill
                key={d}
                label={`${d}m`}
                active={defaultWalkDuration === d}
                onPress={() => onSelectWalkDuration(d)}
                fontsReady={f}
                styles={st}
              />
            ))}
          </View>
        </View>
      </View>
    </>
  );
}
