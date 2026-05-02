import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Alert,
  Platform,
  ActivityIndicator,
  Keyboard,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";
import {
  requestNotificationsPermissionAsync,
  syncExpoPushTokenAsync,
} from "../../lib/notificationsService";
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
import { useThemeColors } from "../../theme";
import { SettingsProfileHero } from "./components/SettingsProfileHero";
import { SHOW_APPEARANCE_SETTINGS } from "./settingsConstants";
import { SettingsAppearanceSection } from "./components/SettingsAppearanceSection";
import { SettingsBusinessSection } from "./components/SettingsBusinessSection";
import { SettingsNotificationsSection } from "./components/SettingsNotificationsSection";
import { SettingsSupportSection } from "./components/SettingsSupportSection";
import { SettingsLegalSection } from "./components/SettingsLegalSection";
import { SettingsAccountSection } from "./components/SettingsAccountSection";
import { SettingsRatePresetChips } from "./components/SettingsRatePresetChips";
import { createSettingsScreenStyles } from "./settingsScreen.styles";

const mono = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const colors = useThemeColors();
  const st = useMemo(() => createSettingsScreenStyles(colors), [colors]);
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

  const {
    businessName,
    defaultWalkDuration,
    defaultRate,
    walkReminderOff,
    notificationsEnabled,
    setBusinessName,
    setDefaultWalkDuration,
    setDefaultRate,
    setReminderTiming,
    setWalkReminderOff,
    setNotificationsEnabled,
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
  const headerCollapseY = useMemo(() => new Animated.Value(0), []);

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
  const collapseDistance = 72;
  const collapseProgress = headerCollapseY.interpolate({
    inputRange: [0, collapseDistance],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  function handleSettingsScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const rawY = event.nativeEvent.contentOffset.y;
    const nextY = Math.max(0, Math.min(collapseDistance, rawY));
    headerCollapseY.setValue(nextY);
  }

  const headerAnimatedStyle = useMemo(
    () => ({
      paddingBottom: headerCollapseY.interpolate({
        inputRange: [0, collapseDistance],
        outputRange: [20, 12],
        extrapolate: "clamp",
      }),
    }),
    [headerCollapseY],
  );

  const subtitleAnimatedStyle = useMemo(
    () => ({
      opacity: collapseProgress.interpolate({
        inputRange: [0, 0.8, 1],
        outputRange: [1, 0.25, 0],
        extrapolate: "clamp",
      }),
      transform: [
        {
          translateY: collapseProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -4],
            extrapolate: "clamp",
          }),
        },
      ],
    }),
    [collapseProgress],
  );

  const identityAnimatedStyle = useMemo(
    () => ({
      opacity: collapseProgress.interpolate({
        inputRange: [0, 0.55, 1],
        outputRange: [1, 0.22, 0],
        extrapolate: "clamp",
      }),
      maxHeight: headerCollapseY.interpolate({
        inputRange: [0, collapseDistance],
        outputRange: [88, 0],
        extrapolate: "clamp",
      }),
      marginTop: headerCollapseY.interpolate({
        inputRange: [0, collapseDistance],
        outputRange: [24, 0],
        extrapolate: "clamp",
      }),
      paddingBottom: headerCollapseY.interpolate({
        inputRange: [0, collapseDistance],
        outputRange: [18, 0],
        extrapolate: "clamp",
      }),
      transform: [
        {
          translateY: collapseProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -10],
            extrapolate: "clamp",
          }),
        },
        {
          scale: collapseProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.96],
            extrapolate: "clamp",
          }),
        },
      ],
      overflow: "hidden" as const,
    }),
    [headerCollapseY, collapseProgress],
  );

  const statsAnimatedStyle = useMemo(
    () => ({
      marginTop: headerCollapseY.interpolate({
        inputRange: [0, collapseDistance],
        outputRange: [18, 10],
        extrapolate: "clamp",
      }),
    }),
    [headerCollapseY],
  );

  async function flushPrefsToRemote() {
    const err = await persistUserPrefs();
    if (err) Alert.alert("Couldn't save settings", err);
  }

  async function handleToggleNotifications() {
    if (!notificationsEnabled) {
      const granted = await requestNotificationsPermissionAsync();
      if (!granted) {
        Alert.alert(
          "Notifications off",
          "Allow notifications on your device to receive walk reminders.",
        );
        return;
      }

      if (user?.id) {
        try {
          await syncExpoPushTokenAsync(user.id, false);
        } catch (error) {
          Alert.alert(
            "Notifications",
            error instanceof Error ? error.message : "Could not enable notifications.",
          );
          return;
        }
      }

      setNotificationsEnabled(true);
      if (walkReminderOff) {
        setWalkReminderOff(false);
      }
      setReminderTiming(30);
      await flushPrefsToRemote();
      return;
    }

    setNotificationsEnabled(false);
    await flushPrefsToRemote();
  }

  async function handleEnableWalkReminder() {
    if (!notificationsEnabled) {
      const granted = await requestNotificationsPermissionAsync();
      if (!granted) {
        Alert.alert(
          "Notifications off",
          "Allow notifications on your device to receive walk reminders.",
        );
        return;
      }
      if (user?.id) {
        try {
          await syncExpoPushTokenAsync(user.id, false);
        } catch (error) {
          Alert.alert(
            "Notifications",
            error instanceof Error ? error.message : "Could not enable notifications.",
          );
          return;
        }
      }
      setNotificationsEnabled(true);
    }

    setWalkReminderOff(false);
    setReminderTiming(30);
    await flushPrefsToRemote();
  }

  async function handleDisableWalkReminder() {
    setWalkReminderOff(true);
    await flushPrefsToRemote();
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
    <View style={st.safe}>
      <View style={{ height: insets.top, backgroundColor: colors.greenDeep }} />
      <SettingsProfileHero
        styles={st}
        identityAnimatedStyle={identityAnimatedStyle}
        subtitleAnimatedStyle={subtitleAnimatedStyle}
        statsAnimatedStyle={statsAnimatedStyle}
        headerAnimatedStyle={headerAnimatedStyle}
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
      <FormKeyboardScrollView
        layoutAnimationKey={settingsLayoutAnimationKey}
        style={{ flex: 1 }}
        contentContainerStyle={[
          st.pageBody,
          { paddingBottom: 24 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={handleSettingsScroll}
        scrollEventThrottle={16}
        smoothKeyboardHide
        viewIsInsideTabBar>
        {SHOW_APPEARANCE_SETTINGS ? <SettingsAppearanceSection styles={st} /> : null}

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
          onToggleNotifications={handleToggleNotifications}
          onEnableWalkReminder={handleEnableWalkReminder}
          onDisableWalkReminder={handleDisableWalkReminder}
        />

        <SettingsSupportSection
          styles={st}
          mono={mono}
          appVersion={appVersion}
          onHelp={() => navigation.navigate("HelpFAQ")}
          onFeedback={() => navigation.navigate("Feedback")}
        />

        <SettingsLegalSection styles={st} />

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
          <SettingsRatePresetChips
            fontsLoaded={f}
            rateDraft={rateDraft}
            onSelectPreset={(n: number) => setRateDraft(String(n))}
            styles={st}
          />
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
