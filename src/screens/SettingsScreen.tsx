import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Switch, Alert,
} from 'react-native';
import { FormKeyboardScrollView } from '../components/FormKeyboardScrollView';
import { colors, radius } from '../theme';
import { useSettingsStore, WalkDuration, ReminderTiming } from '../store/settingsStore';
import { useAuthStore } from '../store/authStore';

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowValue}>{children}</View>
    </View>
  );
}

function SegmentedControl<T extends number>({
  options,
  value,
  onChange,
  format,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  format?: (v: T) => string;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[styles.segment, value === opt && styles.segmentActive]}
          onPress={() => onChange(opt)}
        >
          <Text style={[styles.segmentText, value === opt && styles.segmentTextActive]}>
            {format ? format(opt) : String(opt)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function SettingsScreen() {
  const {
    businessName, defaultWalkDuration, defaultRate, reminderTiming,
    dailySummaryEnabled, unpaidReminderEnabled,
    setBusinessName, setDefaultWalkDuration, setDefaultRate,
    setReminderTiming, setDailySummaryEnabled, setUnpaidReminderEnabled,
  } = useSettingsStore();

  const { signOut, user } = useAuthStore();
  const [nameInput, setNameInput] = useState(businessName);
  const [rateInput, setRateInput] = useState(String(defaultRate));

  function handleNameBlur() {
    setBusinessName(nameInput.trim());
  }

  function handleRateBlur() {
    const parsed = parseFloat(rateInput);
    if (!isNaN(parsed) && parsed > 0) {
      setDefaultRate(parsed);
    } else {
      setRateInput(String(defaultRate));
    }
  }

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <FormKeyboardScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        viewIsInsideTabBar
      >
        <Text style={styles.title}>Settings</Text>

        {/* Business */}
        <SectionHeader title="BUSINESS" />
        <View style={styles.card}>
          <View style={styles.fieldRow}>
            <Text style={styles.rowLabel}>Business Name</Text>
            <TextInput
              style={styles.textInput}
              value={nameInput}
              onChangeText={setNameInput}
              onBlur={handleNameBlur}
              placeholder="e.g. Jake's Dog Walking"
              placeholderTextColor={colors.muted}
              returnKeyType="done"
            />
          </View>
          <View style={styles.divider} />
          <Row label="Default Rate">
            <View style={styles.rateRow}>
              <Text style={styles.currencySign}>$</Text>
              <TextInput
                style={styles.rateInput}
                value={rateInput}
                onChangeText={setRateInput}
                onBlur={handleRateBlur}
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
              <Text style={styles.rateSuffix}>/walk</Text>
            </View>
          </Row>
          <View style={styles.divider} />
          <Row label="Default Duration">
            <SegmentedControl<WalkDuration>
              options={[15, 30, 45, 60]}
              value={defaultWalkDuration}
              onChange={setDefaultWalkDuration}
              format={(v) => `${v}m`}
            />
          </Row>
        </View>

        {/* Notifications */}
        <SectionHeader title="NOTIFICATIONS" />
        <View style={styles.card}>
          <Row label="Walk Reminder">
            <SegmentedControl<ReminderTiming>
              options={[15, 30, 60]}
              value={reminderTiming}
              onChange={setReminderTiming}
              format={(v) => `${v}m`}
            />
          </Row>
          <View style={styles.divider} />
          <Row label="Daily Summary (8pm)">
            <Switch
              value={dailySummaryEnabled}
              onValueChange={setDailySummaryEnabled}
              trackColor={{ false: colors.border, true: colors.accent3 }}
              thumbColor={dailySummaryEnabled ? colors.accent : colors.muted}
            />
          </Row>
          <View style={styles.divider} />
          <Row label="Unpaid Reminder (7 days)">
            <Switch
              value={unpaidReminderEnabled}
              onValueChange={setUnpaidReminderEnabled}
              trackColor={{ false: colors.border, true: colors.accent3 }}
              thumbColor={unpaidReminderEnabled ? colors.accent : colors.muted}
            />
          </Row>
        </View>

        {/* Subscription */}
        <SectionHeader title="SUBSCRIPTION" />
        <View style={styles.card}>
          <Row label="Plan">
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>FREE</Text>
            </View>
          </Row>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.upgradeBtn}>
            <Text style={styles.upgradeBtnText}>Upgrade to Pro — $12/month</Text>
          </TouchableOpacity>
          <Text style={styles.upgradeSubtext}>
            Unlimited clients · Reports · PDF export · No commissions ever
          </Text>
        </View>

        {/* Account */}
        <SectionHeader title="ACCOUNT" />
        <View style={styles.card}>
          {user?.email && (
            <>
              <Row label="Email">
                <Text style={styles.emailText} numberOfLines={1}>{user.email}</Text>
              </Row>
              <View style={styles.divider} />
            </>
          )}
          <TouchableOpacity onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>PawManager v1.0.0</Text>
      </FormKeyboardScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, marginBottom: 20 },
  sectionHeader: {
    fontSize: 10, letterSpacing: 2, color: colors.muted,
    fontWeight: '600', marginBottom: 8, marginTop: 16, marginLeft: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 13, minHeight: 52,
  },
  rowLabel: { fontSize: 14, color: colors.text, fontWeight: '500', flex: 1 },
  rowValue: { alignItems: 'flex-end' },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },
  fieldRow: { paddingHorizontal: 16, paddingVertical: 12 },
  textInput: {
    fontSize: 14, color: colors.text, marginTop: 6,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 8,
  },
  rateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  currencySign: { fontSize: 15, color: colors.text2, fontWeight: '500' },
  rateInput: {
    fontSize: 15, color: colors.text, fontWeight: '600',
    borderBottomWidth: 1, borderColor: colors.border,
    minWidth: 50, textAlign: 'center', paddingVertical: 2,
  },
  rateSuffix: { fontSize: 12, color: colors.muted },
  segmented: {
    flexDirection: 'row', backgroundColor: colors.surface2,
    borderRadius: radius.sm, padding: 2, gap: 2,
  },
  segment: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 7,
  },
  segmentActive: { backgroundColor: colors.white },
  segmentText: { fontSize: 12, color: colors.muted, fontWeight: '500' },
  segmentTextActive: { color: colors.accent, fontWeight: '600' },
  freeBadge: {
    backgroundColor: colors.surface2, borderRadius: radius.sm,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  freeBadgeText: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 1 },
  upgradeBtn: {
    backgroundColor: colors.gold,
    margin: 12, borderRadius: radius.md,
    paddingVertical: 13, alignItems: 'center',
  },
  upgradeBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  upgradeSubtext: {
    textAlign: 'center', fontSize: 11, color: colors.muted,
    marginBottom: 12, marginHorizontal: 16,
  },
  emailText: { fontSize: 13, color: colors.muted, maxWidth: 200 },
  signOutText: {
    color: colors.danger, fontSize: 14, fontWeight: '500',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  version: { textAlign: 'center', fontSize: 11, color: colors.muted, marginTop: 24 },
});
