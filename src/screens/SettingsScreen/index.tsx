import React, { useEffect, useMemo, useState } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
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
import { useSettingsStore } from "../../store/settingsStore";
import { useAuthStore } from "../../store/authStore";
import { colors } from "../../theme";
import { SettingsProfileHero } from "./components/SettingsProfileHero";
import { SettingsBusinessSection } from "./components/SettingsBusinessSection";
import { SettingsNotificationsSection } from "./components/SettingsNotificationsSection";
import { SettingsSupportSection } from "./components/SettingsSupportSection";
import { SettingsAccountSection } from "./components/SettingsAccountSection";

const mono = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

/** Common default walk rates ($) shown as quick picks in settings. */
const DEFAULT_RATE_PRESETS = [15, 20, 25, 30, 35, 40] as const;

function matchesRatePreset(draft: string, n: number): boolean {
  const parsed = parseFloat(draft.replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed === n;
}

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  const clients = useAppStore((st) => st.clients);
  const walks = useAppStore((st) => st.walks);
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
    setBusinessName,
    setDefaultWalkDuration,
    setDefaultRate,
    setReminderTiming,
    setWalkReminderOff,
    setNotificationsEnabled,
    setDailySummaryEnabled,
    setUnpaidReminderEnabled,
  } = useSettingsStore();

  const { signOut, user, updateFullName, persistUserPrefs, deleteAccount } =
    useAuthStore();

  const [bizInput, setBizInput] = useState(businessName);
  const [fullNameInput, setFullNameInput] = useState("");
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [savingFullName, setSavingFullName] = useState(false);
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [showSignOutSheet, setShowSignOutSheet] = useState(false);
  const [bizModalOpen, setBizModalOpen] = useState(false);
  const [bizDraft, setBizDraft] = useState("");
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [rateDraft, setRateDraft] = useState("");

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

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  async function flushPrefsToRemote() {
    const err = await persistUserPrefs();
    if (err) Alert.alert("Couldn't save settings", err);
  }

  function openNameModal() {
    setFullNameInput(fullName === "Your name" ? "" : fullName);
    setNameModalOpen(true);
  }

  async function saveNameModal() {
    const next = fullNameInput.trim();
    if (!next) {
      Alert.alert("Name", "Please enter your name.");
      return;
    }
    if (next === fullName || savingFullName) {
      Keyboard.dismiss();
      setNameModalOpen(false);
      return;
    }
    setSavingFullName(true);
    const err = await updateFullName(next);
    setSavingFullName(false);
    if (err) {
      Alert.alert("Error", err);
      return;
    }
    Keyboard.dismiss();
    setNameModalOpen(false);
  }

  function cancelNameModal() {
    Keyboard.dismiss();
    setNameModalOpen(false);
    setFullNameInput(fullName);
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
  const walksCount = useMemo(
    () => walks.filter((w) => w.status !== "cancelled").length,
    [walks],
  );

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
          initials={initials}
          fullName={fullName}
          onOpenNameModal={openNameModal}
          savingFullName={savingFullName}
          email={email}
          defaultRate={defaultRate}
          walksCount={walksCount}
          clientsCount={clients.length}
          defaultWalkDuration={defaultWalkDuration}
        />

        <SettingsBusinessSection
          styles={st}
          mono={mono}
          fontsReady={f}
          businessName={businessName}
          bizInput={bizInput}
          defaultRate={defaultRate}
          defaultWalkDuration={defaultWalkDuration}
          onOpenBusinessName={openBusinessNameModal}
          onOpenRate={openRateModal}
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
        visible={nameModalOpen}
        title="Edit profile"
        hint="Update the name shown in your profile."
        value={fullNameInput}
        onChangeText={setFullNameInput}
        placeholder="Your name"
        onSave={saveNameModal}
        onCancel={cancelNameModal}
        saveLabel="Save"
        useDmSans={f}
        textInputProps={{
          autoCapitalize: "words",
          autoCorrect: true,
          returnKeyType: "done",
          editable: !savingFullName,
        }}
      />

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
    marginTop: 4,
    marginBottom: 14,
  },
  profileBanner: {
    height: 102,
    borderRadius: 20,
    backgroundColor: colors.greenDeep,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: "visible",
  },
  profileBannerPattern: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  profileBannerInner: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    gap: 12,
  },
  profileHeroBody: {
    marginTop: 14,
    paddingHorizontal: 8,
    alignItems: "flex-start",
    width: "100%",
  },
  heroTitleCol: {
    flex: 1,
    minWidth: 0,
    paddingBottom: 6,
  },
  avatarWrap: { position: "relative", overflow: "visible" },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.greenDeep,
    borderWidth: 3,
    borderColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  avatarLetter: { fontSize: 24, fontWeight: "700", color: colors.greenText },

  editProfileBtn: {
    position: "absolute",
    top: 12,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.28)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.textSecondary,
  },
  editProfileBtnText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    letterSpacing: -0.5,
    textAlign: "left",
    paddingVertical: 2,
    minWidth: 0,
  },
  profileEmail: {
    fontSize: 12,
    color: "rgba(255,255,255,0.62)",
    marginTop: 0,
  },
  heroSaving: { fontSize: 11, color: colors.greenText, marginTop: 4 },
  profileStatsRow: {
    width: "100%",
    marginTop: 18,
    flexDirection: "row",
    alignItems: "stretch",
  },
  profileStatItem: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    minHeight: 56,
    paddingRight: 10,
  },
  profileStatDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginRight: 12,
    marginLeft: 2,
  },
  profileStatValue: {
    fontSize: 16,
    lineHeight: 20,
    color: colors.text,
    letterSpacing: -0.3,
  },
  profileStatValueAccent: {
    color: colors.greenText,
  },
  profileStatLabel: {
    marginTop: 2,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 0.4,
  },
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
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingRight: 2,
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
    backgroundColor: "rgba(139,168,144,0.16)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(139,168,144,0.45)",
  },
  comingSoonBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textSecondary,
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
