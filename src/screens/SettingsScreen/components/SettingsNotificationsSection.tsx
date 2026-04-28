import React from "react";
import { Text, View } from "react-native";
import { ReminderTiming } from "../../../store/settingsStore";
import { NotifPill } from "./NotifPill";
import { HtmlToggle } from "./HtmlToggle";

type Props = {
  styles: any;
  mono: string;
  fontsReady: boolean;
  notificationsEnabled: boolean;
  walkReminderOff: boolean;
  reminderTiming: ReminderTiming;
  dailySummaryEnabled: boolean;
  unpaidReminderEnabled: boolean;
  setNotificationsEnabled: (v: boolean) => void;
  setWalkReminderOff: (v: boolean) => void;
  setReminderTiming: (v: ReminderTiming) => void;
  setDailySummaryEnabled: (v: boolean) => void;
  setUnpaidReminderEnabled: (v: boolean) => void;
  onPersist: () => void;
};

export function SettingsNotificationsSection({
  styles: st,
  mono,
  fontsReady: f,
  notificationsEnabled,
  walkReminderOff,
  reminderTiming,
  dailySummaryEnabled,
  unpaidReminderEnabled,
  setNotificationsEnabled,
  setWalkReminderOff,
  setReminderTiming,
  setDailySummaryEnabled,
  setUnpaidReminderEnabled,
  onPersist,
}: Props) {
  return (
    <>
      <Text style={[st.sectionLabel, { fontFamily: "DMSans_600SemiBold" }]}>
        Notifications
      </Text>
      <View style={st.card}>
        <View style={st.row}>
          <View>
            <Text style={[st.rowLabel, { fontFamily: "DMSans_500Medium" }]}>
              All notifications
            </Text>
            <Text style={[st.rowSub, { fontFamily: mono }]}>
              Walk reminders, summaries, payment alerts
            </Text>
          </View>
          <HtmlToggle
            value={notificationsEnabled}
            onToggle={() => {
              setNotificationsEnabled(!notificationsEnabled);
              void onPersist();
            }}
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
                onPress={() => {
                  setWalkReminderOff(true);
                  void onPersist();
                }}
                fontsReady={f}
                styles={st}
              />
              {([15, 30, 60] as ReminderTiming[]).map((v) => (
                <NotifPill
                  key={v}
                  label={`${v}m`}
                  active={
                    notificationsEnabled &&
                    !walkReminderOff &&
                    reminderTiming === v
                  }
                  onPress={() => {
                    setWalkReminderOff(false);
                    setReminderTiming(v);
                    void onPersist();
                  }}
                  fontsReady={f}
                  styles={st}
                />
              ))}
            </View>
          </View>
          <View style={st.hairline} />
          <View style={st.row}>
            <View>
              <Text style={[st.rowLabel, { fontFamily: "DMSans_500Medium" }]}>
                Daily summary
              </Text>
              <Text style={[st.rowSub, { fontFamily: mono }]}>
                Every day at 8:00 PM
              </Text>
            </View>
            <HtmlToggle
              value={notificationsEnabled && dailySummaryEnabled}
              onToggle={() => {
                setDailySummaryEnabled(!dailySummaryEnabled);
                void onPersist();
              }}
              styles={st}
            />
          </View>
          <View style={st.hairline} />
          <View style={st.row}>
            <View>
              <Text style={[st.rowLabel, { fontFamily: "DMSans_500Medium" }]}>
                Unpaid reminder
              </Text>
              <Text style={[st.rowSub, { fontFamily: mono }]}>After 7 days</Text>
            </View>
            <HtmlToggle
              value={notificationsEnabled && unpaidReminderEnabled}
              onToggle={() => {
                setUnpaidReminderEnabled(!unpaidReminderEnabled);
                void onPersist();
              }}
              styles={st}
            />
          </View>
          <View style={st.hairline} />
          <View style={st.row}>
            <View>
              <Text style={[st.rowLabel, { fontFamily: "DMSans_500Medium" }]}>
                New client requests
              </Text>
              <Text style={[st.rowSub, { fontFamily: mono }]}>
                Instant notification · not available yet
              </Text>
            </View>
            <View style={st.comingSoonBadge}>
              <Text
                style={[
                  st.comingSoonBadgeText,
                  f && { fontFamily: "DMSans_600SemiBold" },
                ]}>
                Coming soon
              </Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}
