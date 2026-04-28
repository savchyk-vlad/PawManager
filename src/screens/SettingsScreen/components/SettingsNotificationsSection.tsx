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
  const notificationsComingSoon = true;

  return (
    <>
      <View style={st.sectionLabelRow}>
        <Text style={[st.sectionLabel, { fontFamily: "DMSans_600SemiBold" }]}>
          Notifications
        </Text>
        {notificationsComingSoon ? (
          <View style={st.comingSoonBadge}>
            <Text
              style={[
                st.comingSoonBadgeText,
                f && { fontFamily: "DMSans_600SemiBold" },
              ]}>
              Coming soon v1.0.2
            </Text>
          </View>
        ) : null}
      </View>
      <View style={st.card}>
        {notificationsComingSoon ? (
          <>
            <View style={st.row}>
              <View>
                <Text style={[st.rowLabel, { fontFamily: "DMSans_500Medium" }]}>
                  Notifications are in development
                </Text>
                <Text style={[st.rowSub, { fontFamily: mono }]}>
                  Walk reminders, summaries, and payment alerts will be
                  available soon.
                </Text>
              </View>
            </View>
            <View style={st.hairline} />
          </>
        ) : null}
        <View
          style={[
            st.row,
            notificationsComingSoon ? st.notifSubMuted : undefined,
          ]}
          pointerEvents={notificationsComingSoon ? "none" : "auto"}>
          <View>
            <Text style={[st.rowLabel, { fontFamily: "DMSans_500Medium" }]}>
              All notifications
            </Text>
            <Text style={[st.rowSub, { fontFamily: mono }]}>
              Walk reminders, summaries, payment alerts
            </Text>
          </View>
          <HtmlToggle
            value={notificationsComingSoon ? false : notificationsEnabled}
            onToggle={() => {
              if (notificationsComingSoon) return;
              setNotificationsEnabled(!notificationsEnabled);
              void onPersist();
            }}
            styles={st}
          />
        </View>
        <View style={st.hairline} />
        <View
          pointerEvents={
            notificationsComingSoon
              ? "none"
              : notificationsEnabled
                ? "auto"
                : "none"
          }
          style={
            notificationsComingSoon || !notificationsEnabled
              ? st.notifSubMuted
              : undefined
          }>
          <View style={st.notifWalkReminder}>
            <Text style={[st.rowLabel, { fontFamily: "DMSans_500Medium" }]}>
              Walk reminder
            </Text>
            <View style={st.notifPillRow}>
              <NotifPill
                label="Off"
                active={!notificationsEnabled || walkReminderOff}
                onPress={() => {
                  if (notificationsComingSoon) return;
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
                    if (notificationsComingSoon) return;
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
                if (notificationsComingSoon) return;
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
              <Text style={[st.rowSub, { fontFamily: mono }]}>
                After 7 days
              </Text>
            </View>
            <HtmlToggle
              value={notificationsEnabled && unpaidReminderEnabled}
              onToggle={() => {
                if (notificationsComingSoon) return;
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
          </View>
        </View>
      </View>
    </>
  );
}
