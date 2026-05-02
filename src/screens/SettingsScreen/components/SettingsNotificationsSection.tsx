import React from "react";
import { Text, View } from "react-native";
import { NotifPill } from "./NotifPill";
import { HtmlToggle } from "./HtmlToggle";

type Props = {
  styles: any;
  mono: string;
  fontsReady: boolean;
  notificationsEnabled: boolean;
  walkReminderOff: boolean;
  onToggleNotifications: () => void;
  onEnableWalkReminder: () => void;
  onDisableWalkReminder: () => void;
};

export function SettingsNotificationsSection({
  styles: st,
  mono,
  fontsReady: f,
  notificationsEnabled,
  walkReminderOff,
  onToggleNotifications,
  onEnableWalkReminder,
  onDisableWalkReminder,
}: Props) {
  return (
    <>
      <View style={st.sectionLabelRow}>
        <Text style={[st.sectionLabel, { fontFamily: "DMSans_600SemiBold" }]}>
          Notifications
        </Text>
      </View>
      <View style={st.card}>
        <View style={st.row}>
          <View>
            <Text style={[st.rowLabel, { fontFamily: "DMSans_500Medium" }]}>
              All notifications
            </Text>
            <Text style={[st.rowSub, { fontFamily: mono }]}>
              Allow walk reminder notifications on this device
            </Text>
          </View>
          <HtmlToggle
            value={notificationsEnabled}
            onToggle={onToggleNotifications}
            styles={st}
          />
        </View>
        <View style={st.hairline} />
        <View
          pointerEvents={notificationsEnabled ? "auto" : "none"}
          style={!notificationsEnabled ? st.notifSubMuted : undefined}>
          <View style={st.notifWalkReminder}>
            <Text style={[st.rowLabel, { fontFamily: "DMSans_500Medium" }]}>
              Walk reminder
            </Text>
            <View style={st.notifPillRow}>
              <NotifPill
                label="Off"
                active={!notificationsEnabled || walkReminderOff}
                onPress={onDisableWalkReminder}
                fontsReady={f}
                styles={st}
              />
              <NotifPill
                label="30m"
                active={notificationsEnabled && !walkReminderOff}
                onPress={onEnableWalkReminder}
                fontsReady={f}
                styles={st}
              />
            </View>
          </View>
          <View style={st.hairline} />
          <View style={st.row}>
            <View>
              <Text style={[st.rowLabel, { fontFamily: "DMSans_500Medium" }]}>
                Reminder timing
              </Text>
              <Text style={[st.rowSub, { fontFamily: mono }]}>
                30 minutes before every scheduled walk
              </Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}
