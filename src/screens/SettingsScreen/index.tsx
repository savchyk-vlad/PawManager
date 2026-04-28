import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  Keyboard,
  Animated,
  Easing,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { RootStackParamList } from "../../navigation";
import { useAppStore } from "../../store";
import { FormKeyboardScrollView } from "../../components/FormKeyboardScrollView";
import { ConfirmDeleteSheet } from "../../components/ConfirmDeleteSheet";
import { TextFieldModal } from "../../components/TextFieldModal";
import { SheetModal } from "../../components/SheetModal";
import { useSettingsStore } from "../../store/settingsStore";
import { useAuthStore } from "../../store/authStore";
import { colors } from "../../theme";
import { SettingsProfileHero } from "./components/SettingsProfileHero";
import { SettingsSubscriptionCard } from "./components/SettingsSubscriptionCard";
import { SettingsBusinessSection } from "./components/SettingsBusinessSection";
import { SettingsNotificationsSection } from "./components/SettingsNotificationsSection";
import { SettingsSupportSection } from "./components/SettingsSupportSection";
import { SettingsAccountSection } from "./components/SettingsAccountSection";

const mono = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

/** Common default walk rates ($) shown as quick picks in settings. */
const DEFAULT_RATE_PRESETS = [15, 20, 25, 30, 35, 40] as const;

function matchesRatePreset(draft: string, n: number): boolean {
  const parsed = parseFloat(draft.replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed === n;
}

/** Display stored 24h "HH:mm" as "h:mm AM/PM". */
function format24To12(time24: string): string {
  const parts = time24.trim().split(":");
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1] ?? "0", 10);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return time24.trim();
  const hh = ((h % 24) + 24) % 24;
  const mm = Math.min(59, Math.max(0, m));
  const isPm = hh >= 12;
  let h12 = hh % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${isPm ? "PM" : "AM"}`;
}

/**
 * Accepts 12-hour times ("8:00 AM", "6:30 PM") or legacy 24-hour ("08:00").
 * Returns normalized "HH:mm" or null.
 */
function parseTimeTo24(input: string): string | null {
  const s = input.trim().replace(/\s+/g, " ");

  let m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m) {
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const ap = m[3].toUpperCase();
    if (min < 0 || min > 59 || h < 1 || h > 12) return null;
    if (ap === "AM") {
      if (h === 12) h = 0;
    } else if (h !== 12) {
      h += 12;
    }
    return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  }

  m = s.match(/^(\d{1,2})\s*(AM|PM)$/i);
  if (m) {
    let h = parseInt(m[1], 10);
    const ap = m[2].toUpperCase();
    if (h < 1 || h > 12) return null;
    if (ap === "AM") {
      if (h === 12) h = 0;
    } else if (h !== 12) {
      h += 12;
    }
    return `${String(h).padStart(2, "0")}:00`;
  }

  m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m) {
    const h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    if (h >= 0 && h <= 23 && min >= 0 && min <= 59) {
      return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    }
  }

  return null;
}

function computeShiftDurationLabel(start: string, end: string): string {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if (![sh, sm, eh, em].every(Number.isFinite)) return "—";
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  const h = Math.floor(mins / 60);
  const minute = mins % 60;
  return minute ? `${h}h ${minute}m` : `${h} hrs`;
}

/** Local Date with hours/minutes from stored "HH:mm". */
function time24ToDate(time24: string): Date {
  const [hs, ms] = time24.trim().split(":");
  const h = parseInt(hs, 10);
  const m = parseInt(ms ?? "0", 10);
  const d = new Date();
  d.setHours(
    Number.isFinite(h) ? ((h % 24) + 24) % 24 : 8,
    Number.isFinite(m) ? Math.min(59, Math.max(0, m)) : 0,
    0,
    0,
  );
  return d;
}

function dateToTime24(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function draftTimeToDate(draft: string, fallback24: string): Date {
  const p = parseTimeTo24(draft);
  return time24ToDate(p ?? fallback24);
}

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const nameInputRef = useRef<TextInput>(null);

  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  const clients = useAppStore((st) => st.clients);
  const FREE_LIMIT = 5;

  const {
    businessName,
    defaultWalkDuration,
    defaultRate,
    reminderTiming,
    walkReminderOff,
    notificationsEnabled,
    dailySummaryEnabled,
    unpaidReminderEnabled,
    workingDays,
    shiftStart,
    shiftEnd,
    setBusinessName,
    setDefaultWalkDuration,
    setDefaultRate,
    setReminderTiming,
    setWalkReminderOff,
    setNotificationsEnabled,
    setDailySummaryEnabled,
    setUnpaidReminderEnabled,
    setWorkingDays,
    setShiftStart,
    setShiftEnd,
  } = useSettingsStore();

  const { signOut, user, updateFullName, persistUserPrefs, deleteAccount } =
    useAuthStore();

  const [bizInput, setBizInput] = useState(businessName);
  const [fullNameInput, setFullNameInput] = useState("");
  const [savingFullName, setSavingFullName] = useState(false);
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [showSignOutSheet, setShowSignOutSheet] = useState(false);
  const [bizModalOpen, setBizModalOpen] = useState(false);
  const [bizDraft, setBizDraft] = useState("");
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [rateDraft, setRateDraft] = useState("");
  const [daysModalOpen, setDaysModalOpen] = useState(false);
  const [daysDraft, setDaysDraft] = useState([
    true,
    true,
    true,
    true,
    true,
    false,
    false,
  ]);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [shiftStartDraft, setShiftStartDraft] = useState(() =>
    format24To12("08:00"),
  );
  const [shiftEndDraft, setShiftEndDraft] = useState(() =>
    format24To12("18:00"),
  );
  const [shiftTimePicker, setShiftTimePicker] = useState<
    "start" | "end" | null
  >(null);

  const shiftPickerOpacity = useRef(new Animated.Value(0)).current;
  const shiftPickerTranslate = useRef(new Animated.Value(10)).current;

  const fullName =
    ((user?.user_metadata?.full_name as string | undefined) ?? "").trim() ||
    "Your name";
  const email = user?.email ?? "";

  const initials = useMemo(() => {
    const parts = fullName.split(/\s+/).filter(Boolean);
    if (!parts.length || fullName === "Your name") return "PM";
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  }, [fullName]);

  useEffect(() => {
    setFullNameInput(fullName);
  }, [fullName]);

  useEffect(() => {
    setBizInput(businessName);
  }, [businessName]);

  useEffect(() => {
    if (!shiftModalOpen) setShiftTimePicker(null);
  }, [shiftModalOpen]);

  useEffect(() => {
    if (Platform.OS !== "ios") return;
    if (!shiftModalOpen) {
      shiftPickerOpacity.setValue(0);
      shiftPickerTranslate.setValue(10);
      return;
    }
    if (shiftTimePicker === null) return;
    shiftPickerOpacity.setValue(0);
    shiftPickerTranslate.setValue(12);
    Animated.parallel([
      Animated.timing(shiftPickerOpacity, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(shiftPickerTranslate, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [shiftModalOpen, shiftTimePicker]);

  const shiftDraftTotal = useMemo(() => {
    const a = parseTimeTo24(shiftStartDraft);
    const b = parseTimeTo24(shiftEndDraft);
    if (!a || !b) return "—";
    return computeShiftDurationLabel(a, b);
  }, [shiftStartDraft, shiftEndDraft]);

  const shiftHoursLabel = `${format24To12(shiftStart)} – ${format24To12(shiftEnd)}`;

  const activeDaysShort = useMemo(() => {
    return workingDays
      .map((on, i) => (on ? DAY_LABELS[i] : null))
      .filter(Boolean)
      .join(" ");
  }, [workingDays]);

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  async function flushPrefsToRemote() {
    const err = await persistUserPrefs();
    if (err) Alert.alert("Couldn't save settings", err);
  }

  function handleNameBlur() {
    const next = fullNameInput.trim();
    if (!next || next === fullName || savingFullName) {
      setFullNameInput(fullName);
      return;
    }
    setSavingFullName(true);
    updateFullName(next).then((err) => {
      setSavingFullName(false);
      if (err) {
        Alert.alert("Error", err);
        setFullNameInput(fullName);
      }
    });
  }

  function openBusinessNameModal() {
    setBizDraft(businessName.trim() ? businessName : bizInput);
    setBizModalOpen(true);
  }

  async function saveBusinessNameModal() {
    const next = bizDraft.trim();
    const prev = useSettingsStore.getState().businessName;
    setBusinessName(next);
    const err = await persistUserPrefs();
    if (err) {
      setBusinessName(prev);
      Alert.alert("Couldn't save business name", err);
      return;
    }
    setBizInput(next);
    Keyboard.dismiss();
    setBizModalOpen(false);
  }

  function cancelBusinessNameModal() {
    Keyboard.dismiss();
    setBizModalOpen(false);
  }

  function openRateModal() {
    setRateDraft(String(defaultRate));
    setRateModalOpen(true);
  }

  async function saveRateModal() {
    const parsed = parseFloat(rateDraft.replace(/,/g, ""));
    if (Number.isNaN(parsed) || parsed <= 0) {
      Alert.alert("Invalid rate", "Enter a positive number.");
      return;
    }
    const prev = useSettingsStore.getState().defaultRate;
    setDefaultRate(parsed);
    const err = await persistUserPrefs();
    if (err) {
      setDefaultRate(prev);
      Alert.alert("Couldn't save rate", err);
      return;
    }
    Keyboard.dismiss();
    setRateModalOpen(false);
  }

  function cancelRateModal() {
    Keyboard.dismiss();
    setRateModalOpen(false);
  }

  function toggleDaysDraft(index: number) {
    setDaysDraft((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }

  function openDaysModal() {
    setDaysDraft([...workingDays]);
    setDaysModalOpen(true);
  }

  async function saveDaysModal() {
    if (!daysDraft.some(Boolean)) {
      Alert.alert("Active days", "Select at least one day.");
      return;
    }
    const prev = useSettingsStore.getState().workingDays;
    setWorkingDays(daysDraft);
    const err = await persistUserPrefs();
    if (err) {
      setWorkingDays(prev);
      Alert.alert("Couldn't save active days", err);
      return;
    }
    Keyboard.dismiss();
    setDaysModalOpen(false);
  }

  function cancelDaysModal() {
    Keyboard.dismiss();
    setDaysModalOpen(false);
  }

  function openShiftModal() {
    setShiftTimePicker(null);
    setShiftStartDraft(format24To12(shiftStart));
    setShiftEndDraft(format24To12(shiftEnd));
    setShiftModalOpen(true);
  }

  async function saveShiftModal() {
    const start24 = parseTimeTo24(shiftStartDraft);
    const end24 = parseTimeTo24(shiftEndDraft);
    if (!start24 || !end24) {
      Alert.alert(
        "Shift hours",
        "Enter times in 12-hour form, e.g. 8:00 AM and 6:00 PM.",
      );
      return;
    }
    const prevStart = useSettingsStore.getState().shiftStart;
    const prevEnd = useSettingsStore.getState().shiftEnd;
    setShiftStart(start24);
    setShiftEnd(end24);
    const err = await persistUserPrefs();
    if (err) {
      setShiftStart(prevStart);
      setShiftEnd(prevEnd);
      Alert.alert("Couldn't save shift hours", err);
      return;
    }
    Keyboard.dismiss();
    setShiftModalOpen(false);
  }

  function cancelShiftModal() {
    Keyboard.dismiss();
    setShiftModalOpen(false);
  }

  async function handleDeleteAccountConfirm() {
    setDeleteAccountLoading(true);
    const err = await deleteAccount();
    setDeleteAccountLoading(false);
    if (err) {
      Alert.alert("Couldn't delete account", err);
      return;
    }
    setShowDeleteSheet(false);
  }

  const settingsLayoutAnimationKey = useMemo(
    () =>
      [
        savingFullName ? 1 : 0,
        notificationsEnabled ? 1 : 0,
        clients.length,
      ].join("|"),
    [savingFullName, notificationsEnabled, clients.length],
  );

  const f = fontsLoaded;

  if (!fontsLoaded) {
    return (
      <View style={[st.safe, st.fontFallback, { paddingTop: insets.top }]}>
        <ActivityIndicator
          color={colors.greenDefault}
          style={{ marginTop: 40 }}
        />
      </View>
    );
  }

  return (
    <View style={[st.safe, { paddingTop: insets.top }]}>
      <FormKeyboardScrollView
        layoutAnimationKey={settingsLayoutAnimationKey}
        style={{ flex: 1 }}
        contentContainerStyle={[
          st.pageBody,
          { paddingBottom: 24 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        smoothKeyboardHide
        viewIsInsideTabBar>
        <SettingsProfileHero
          styles={st}
          nameInputRef={nameInputRef}
          initials={initials}
          fullNameInput={fullNameInput}
          onChangeFullName={setFullNameInput}
          onNameBlur={handleNameBlur}
          savingFullName={savingFullName}
          email={email}
        />

        <SettingsSubscriptionCard
          styles={st}
          mono={mono}
          clientCount={clients.length}
          freeLimit={FREE_LIMIT}
          onPress={() => navigation.navigate("Subscriptions")}
        />

        <SettingsBusinessSection
          styles={st}
          mono={mono}
          fontsReady={f}
          businessName={businessName}
          bizInput={bizInput}
          defaultRate={defaultRate}
          defaultWalkDuration={defaultWalkDuration}
          activeDaysShort={activeDaysShort}
          shiftHoursLabel={shiftHoursLabel}
          onOpenBusinessName={openBusinessNameModal}
          onOpenRate={openRateModal}
          onOpenDays={openDaysModal}
          onOpenShift={openShiftModal}
          onSelectWalkDuration={(d) => {
            setDefaultWalkDuration(d);
            void flushPrefsToRemote();
          }}
        />

        <SettingsNotificationsSection
          styles={st}
          mono={mono}
          fontsReady={f}
          notificationsEnabled={notificationsEnabled}
          walkReminderOff={walkReminderOff}
          reminderTiming={reminderTiming}
          dailySummaryEnabled={dailySummaryEnabled}
          unpaidReminderEnabled={unpaidReminderEnabled}
          setNotificationsEnabled={setNotificationsEnabled}
          setWalkReminderOff={setWalkReminderOff}
          setReminderTiming={setReminderTiming}
          setDailySummaryEnabled={setDailySummaryEnabled}
          setUnpaidReminderEnabled={setUnpaidReminderEnabled}
          onPersist={flushPrefsToRemote}
        />

        <SettingsSupportSection
          styles={st}
          mono={mono}
          appVersion={appVersion}
          onHelp={() => navigation.navigate("HelpFAQ")}
          onFeedback={() => navigation.navigate("Feedback")}
        />

        <SettingsAccountSection
          styles={st}
          onSignOut={() => setShowSignOutSheet(true)}
          onDelete={() => setShowDeleteSheet(true)}
        />
      </FormKeyboardScrollView>

      <TextFieldModal
        visible={bizModalOpen}
        title="Business name"
        hint="Shown on receipts and client-facing details where applicable."
        value={bizDraft}
        onChangeText={setBizDraft}
        placeholder="e.g. Jake's Dog Walking"
        onSave={saveBusinessNameModal}
        onCancel={cancelBusinessNameModal}
        useDmSans={f}
        textInputProps={{
          autoCapitalize: "words",
          autoCorrect: true,
          returnKeyType: "done",
        }}
      />

      <TextFieldModal
        visible={rateModalOpen}
        title="Default rate"
        hint="Applied as the default walk price when adding new walks."
        value={rateDraft}
        onChangeText={setRateDraft}
        placeholder="e.g. 25"
        onSave={saveRateModal}
        onCancel={cancelRateModal}
        useDmSans={f}
        textInputProps={{
          keyboardType: "decimal-pad",
          returnKeyType: "done",
        }}
        belowInput={
          <View>
            <Text
              style={[
                st.rateOptionsLabel,
                f && { fontFamily: "DMSans_500Medium" },
              ]}>
              Available options
            </Text>
            <View style={st.rateOptionsRow}>
              {DEFAULT_RATE_PRESETS.map((n) => {
                const selected = matchesRatePreset(rateDraft, n);
                return (
                  <TouchableOpacity
                    key={n}
                    style={[
                      st.rateOptionChip,
                      selected && st.rateOptionChipActive,
                    ]}
                    onPress={() => setRateDraft(String(n))}
                    activeOpacity={0.85}>
                    <Text
                      style={[
                        st.rateOptionChipText,
                        selected && st.rateOptionChipTextActive,
                        f && { fontFamily: "DMSans_600SemiBold" },
                      ]}>
                      ${n}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        }
      />

      <SheetModal
        visible={daysModalOpen}
        title="Active days"
        hint="Days you typically schedule walks."
        onSave={saveDaysModal}
        onCancel={cancelDaysModal}
        useDmSans={f}>
        <View style={st.dayEditor}>
          <View style={st.dayRow}>
            {DAY_LABELS.map((label, i) => (
              <TouchableOpacity
                key={i}
                style={st.dayCol}
                onPress={() => toggleDaysDraft(i)}
                activeOpacity={0.85}>
                <Text
                  style={[
                    st.dayLabel,
                    f && { fontFamily: "DMSans_500Medium" },
                  ]}>
                  {label}
                </Text>
                <View style={[st.dayDot, daysDraft[i] && st.dayDotOn]}>
                  <Text
                    style={[
                      st.dayDotTxt,
                      daysDraft[i] && st.dayDotTxtOn,
                      f && { fontFamily: "DMSans_600SemiBold" },
                    ]}>
                    {daysDraft[i] ? "✓" : ""}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SheetModal>

      <SheetModal
        visible={shiftModalOpen}
        title="Shift hours"
        hint={
          Platform.OS === "web"
            ? "Your usual working window (12-hour time, e.g. 8:00 AM)."
            : "Tap a time to open the picker. Uses 12-hour format."
        }
        onSave={saveShiftModal}
        onCancel={cancelShiftModal}
        useDmSans={f}>
        <View style={st.shiftEditor}>
          <View style={st.shiftRow}>
            <View style={{ flex: 1 }}>
              <Text
                style={[st.shiftLbl, f && { fontFamily: "DMSans_500Medium" }]}>
                Start
              </Text>
              {Platform.OS === "web" ? (
                <TextInput
                  style={[st.timeInput, { fontFamily: mono }]}
                  value={shiftStartDraft}
                  onChangeText={setShiftStartDraft}
                  placeholder="8:00 AM"
                  placeholderTextColor={colors.textMuted}
                />
              ) : (
                <TouchableOpacity
                  style={st.timePickTrigger}
                  onPress={() => setShiftTimePicker("start")}
                  activeOpacity={0.82}
                  accessibilityRole="button"
                  accessibilityLabel={`Start time, ${shiftStartDraft}`}>
                  <Text style={[st.timePickTriggerText, { fontFamily: mono }]}>
                    {shiftStartDraft}
                  </Text>
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              )}
            </View>
            <Text style={st.shiftSep}>–</Text>
            <View style={{ flex: 1 }}>
              <Text
                style={[st.shiftLbl, f && { fontFamily: "DMSans_500Medium" }]}>
                End
              </Text>
              {Platform.OS === "web" ? (
                <TextInput
                  style={[st.timeInput, { fontFamily: mono }]}
                  value={shiftEndDraft}
                  onChangeText={setShiftEndDraft}
                  placeholder="6:00 PM"
                  placeholderTextColor={colors.textMuted}
                />
              ) : (
                <TouchableOpacity
                  style={st.timePickTrigger}
                  onPress={() => setShiftTimePicker("end")}
                  activeOpacity={0.82}
                  accessibilityRole="button"
                  accessibilityLabel={`End time, ${shiftEndDraft}`}>
                  <Text style={[st.timePickTriggerText, { fontFamily: mono }]}>
                    {shiftEndDraft}
                  </Text>
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
          {Platform.OS !== "web" && shiftTimePicker !== null
            ? (() => {
                const pickerEl = (
                  <DateTimePicker
                    value={draftTimeToDate(
                      shiftTimePicker === "start"
                        ? shiftStartDraft
                        : shiftEndDraft,
                      shiftTimePicker === "start" ? shiftStart : shiftEnd,
                    )}
                    mode="time"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    themeVariant="dark"
                    is24Hour={false}
                    onChange={(event, date) => {
                      if (Platform.OS === "android") {
                        const which = shiftTimePicker;
                        setShiftTimePicker(null);
                        if (event.type !== "set" || !date || !which) return;
                        const fmt = format24To12(dateToTime24(date));
                        if (which === "start") setShiftStartDraft(fmt);
                        else setShiftEndDraft(fmt);
                        return;
                      }
                      if (!date || !shiftTimePicker) return;
                      const fmt = format24To12(dateToTime24(date));
                      if (shiftTimePicker === "start") setShiftStartDraft(fmt);
                      else setShiftEndDraft(fmt);
                    }}
                  />
                );
                return Platform.OS === "ios" ? (
                  <Animated.View
                    style={{
                      opacity: shiftPickerOpacity,
                      transform: [{ translateY: shiftPickerTranslate }],
                    }}>
                    {pickerEl}
                  </Animated.View>
                ) : (
                  pickerEl
                );
              })()
            : null}
          <View style={st.totalShiftRow}>
            <Text
              style={[
                st.totalShiftLabel,
                f && { fontFamily: "DMSans_500Medium" },
              ]}>
              Total shift
            </Text>
            <Text style={[st.totalShiftValue, { fontFamily: mono }]}>
              {shiftDraftTotal}
            </Text>
          </View>
        </View>
      </SheetModal>

      <ConfirmDeleteSheet
        visible={showSignOutSheet}
        title="Sign out?"
        subtitle="You'll need to sign in again to access your walks, clients, and schedule."
        confirmLabel="Sign Out"
        visualVariant="leave"
        onConfirm={() => {
          setShowSignOutSheet(false);
          signOut();
        }}
        onCancel={() => setShowSignOutSheet(false)}
      />

      <ConfirmDeleteSheet
        visible={showDeleteSheet}
        title="Delete Account?"
        subtitle="This will permanently remove your account, all clients, schedules and payment history. This cannot be undone."
        confirmLabel="Delete Forever"
        loading={deleteAccountLoading}
        onConfirm={handleDeleteAccountConfirm}
        onCancel={() => {
          if (!deleteAccountLoading) setShowDeleteSheet(false);
        }}
      />
    </View>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  fontFallback: { alignItems: "center" },
  pageBody: {
    paddingHorizontal: 12,
    paddingBottom: 16,
    paddingTop: 0,
  },
  profileHero: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 20,
  },
  avatarWrap: { position: "relative", marginBottom: 12 },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.greenDeep,
    borderWidth: 2,
    borderColor: colors.greenDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { fontSize: 28, fontWeight: "700", color: colors.greenDefault },
  avatarEdit: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.greenDeep,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.bg,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.5,
    textAlign: "center",
    paddingVertical: 4,
    minWidth: 200,
  },
  profileEmail: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },
  heroSaving: { fontSize: 11, color: colors.greenDefault, marginTop: 6 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.8,
    color: colors.textMuted,
    textTransform: "uppercase",
    paddingHorizontal: 4,
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: 10,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: 0,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  /** Sign out / Delete account rows — taller tap area and aligned with icon size 18 */
  accountActionRow: {
    paddingVertical: 15,
    minHeight: 52,
  },
  rowLabel: { fontSize: 13, fontWeight: "500", color: colors.text },
  rowLabelSignOut: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.amberDefault,
  },
  rowLabelDelete: { fontSize: 13, fontWeight: "500", color: colors.redDefault },
  rowSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  rowValueWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: "58%",
  },
  rowValueDisplay: {
    flex: 1,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "right",
  },
  rowValuePlaceholder: {
    color: colors.textMuted,
  },
  rowChevron: { fontSize: 14, color: colors.textMuted },

  comingSoonBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#222",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
  },
  comingSoonBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 0.35,
    textTransform: "uppercase",
  },

  rateMono: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },
  rateWalk: { fontSize: 10, color: colors.textMuted },

  rateOptionsLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.4,
    color: colors.textMuted,
    marginBottom: 8,
  },
  rateOptionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  rateOptionChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  rateOptionChipActive: {
    backgroundColor: colors.greenDeep,
    borderColor: "rgba(126,203,90,0.3)",
  },
  rateOptionChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },
  rateOptionChipTextActive: {
    color: colors.greenDefault,
  },

  activeDaysText: { fontSize: 12, color: colors.textMuted },

  dayEditor: { paddingHorizontal: 12, paddingBottom: 12 },
  dayRow: { flexDirection: "row", justifyContent: "space-between" },
  dayCol: { alignItems: "center", gap: 6 },
  dayLabel: { fontSize: 11, color: colors.textMuted, letterSpacing: 0.5 },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  dayDotOn: {
    backgroundColor: colors.greenDeep,
    borderColor: "rgba(126,203,90,0.3)",
  },
  dayDotTxt: { fontSize: 12, fontWeight: "600", color: colors.textMuted },
  dayDotTxtOn: { color: colors.greenDefault },

  shiftSummary: { fontSize: 13, color: colors.textMuted },

  shiftEditor: { paddingHorizontal: 16, paddingBottom: 14 },
  shiftRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  shiftLbl: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 6,
    textAlign: "center",
  },
  timeInput: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 8,
    fontSize: 15,
    fontWeight: "500",
    color: colors.text,
    textAlign: "center",
  },
  timePickTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: "100%",
  },
  timePickTriggerText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text,
  },
  shiftSep: {
    color: colors.textMuted,
    fontSize: 14,
    paddingTop: 18,
  },
  totalShiftRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#1a1a12",
    borderRadius: 10,
  },
  totalShiftLabel: { fontSize: 13, color: colors.textMuted },
  totalShiftValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.greenDefault,
  },

  notifWalkReminder: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    gap: 10,
  },
  notifSubMuted: {
    opacity: 0.45,
  },
  notifPillRow: { flexDirection: "row", gap: 6, width: "100%" },
  pill: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: "center",
  },
  pillActive: {
    backgroundColor: colors.greenDeep,
    borderColor: "rgba(126,203,90,0.3)",
  },
  pillText: { fontSize: 11, fontWeight: "600", color: colors.textMuted },
  pillTextActive: { color: colors.greenDefault },

  track: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    justifyContent: "center",
    position: "relative",
  },
  trackOn: {
    backgroundColor: colors.greenDeep,
    borderColor: colors.greenDeep,
  },
  thumb: {
    position: "absolute",
    left: 3,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  thumbOn: {
    transform: [{ translateX: 18 }],
  },

  subEntryCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginBottom: 10,
    overflow: "hidden",
  },
  subEntryInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  subEntryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  subIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.greenDeep,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(126,203,90,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  subEntryName: { fontSize: 13, fontWeight: "600", color: colors.text },
  subEntryDetail: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  subEntryRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  freeBadge: {
    backgroundColor: "#222",
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
  },
  freeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 0.3,
  },

  supportVersionValue: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textMuted,
    textAlign: "right",
    maxWidth: "42%",
  },
});
