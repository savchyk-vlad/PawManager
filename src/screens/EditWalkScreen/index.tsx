import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { FormKeyboardScrollView } from "../../components/FormKeyboardScrollView";
import { WalkFormCloseHeader } from "../../components/WalkFormCloseHeader";
import { WalkScheduleFields } from "../../components/WalkScheduleFields";
import { WalkPricingFields, WalkPricingTotalBar } from "../../components/WalkPricingFields";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { format, isValid, parseISO } from "date-fns";
import { useAppStore } from "../../store";
import { RootStackParamList } from "../../navigation";
import { ConfirmDeleteSheet } from "../../components/ConfirmDeleteSheet";
import { colors } from "../../theme";
import { applyFieldsFromWalk } from "./applyFieldsFromWalk";
import { EditWalkClientSummary } from "./components/EditWalkClientSummary";
import { EditWalkDangerActions } from "./components/EditWalkDangerActions";

type Nav = NativeStackNavigationProp<RootStackParamList, "EditWalk">;
type Route = RouteProp<RootStackParamList, "EditWalk">;

export default function EditWalkScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { walkId } = route.params;
  const { walks, clients, updateScheduledWalk, cancelWalk } = useAppStore();
  const walk = walks.find((w) => w.id === walkId);

  const [selectedTime, setSelectedTime] = useState("");
  const [monthDate, setMonthDate] = useState<Date>(new Date());
  const [duration, setDuration] = useState(30);
  const [customDuration, setCustomDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [dogPrices, setDogPrices] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelWalkSheet, setShowCancelWalkSheet] = useState(false);
  const leavingAfterCancelRef = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!walk) return;
    const c = clients.find((cl) => cl.id === walk.clientId);
    const f = applyFieldsFromWalk(walk, c);
    setSelectedTime(f.selectedTime);
    setMonthDate(f.monthDate);
    setDuration(f.duration);
    setCustomDuration(f.customDuration);
    setNotes(f.notes);
    setDogPrices(f.dogPrices);
    setReady(true);
  }, [
    walk?.id,
    walk?.scheduledAt,
    walk?.durationMinutes,
    walk?.notes,
    walk?.status,
    walk?.pricePerWalkOverride,
    walk?.perDogPrices,
    clients,
  ]);

  useEffect(() => {
    if (!ready || !walk) return;
    if (walk.status === "scheduled") return;
    if (leavingAfterCancelRef.current) return;
    Alert.alert("Can't edit", "Only scheduled walks can be edited. Go back to view this walk.");
    navigation.goBack();
  }, [ready, walk, navigation]);

  const client = walk ? clients.find((c) => c.id === walk.clientId) : null;
  const dogNames =
    walk && client
      ? client.dogs
          .filter((d) => walk.dogIds.includes(d.id))
          .map((d) => d.name)
          .join(" + ")
      : "—";

  const dogsForPricing =
    client && walk
      ? [...new Set(walk.dogIds)]
          .map((id) => client.dogs.find((d) => d.id === id))
          .filter((d): d is NonNullable<typeof d> => Boolean(d && !d.isDeleted))
      : [];

  const handleSave = async () => {
    if (!walk) return;
    const dogIds = [...new Set(walk.dogIds)];
    for (const id of dogIds) {
      const t = dogPrices[id]?.trim() ?? "";
      const raw = Number.parseFloat(t.replace(/,/g, ""));
      if (t === "" || !Number.isFinite(raw) || raw < 0) {
        Alert.alert("Price", "Enter a valid amount for each dog on this walk.");
        return;
      }
    }
    setSaving(true);
    try {
      await updateScheduledWalk(walkId, {
        scheduledAt: selectedTime,
        durationMinutes: duration,
        notes: notes || undefined,
        pricePerWalkOverride: null,
        perDogPrices: Object.fromEntries(
          dogIds.map((id) => [id, Number.parseFloat((dogPrices[id] ?? "").replace(/,/g, ""))]),
        ),
      });
      navigation.goBack();
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "message" in e ? String((e as { message?: string }).message) : "";
      Alert.alert("Error", msg || "Could not update walk.");
    } finally {
      setSaving(false);
    }
  };

  const layoutAnimationKey = useMemo(
    () => [walkId, String(ready), monthDate.getTime(), walks.length].join("|"),
    [walkId, ready, monthDate, walks.length],
  );

  const confirmCancelWalk = async () => {
    leavingAfterCancelRef.current = true;
    setCancelling(true);
    try {
      await cancelWalk(walkId);
      setShowCancelWalkSheet(false);
      if (typeof navigation.pop === "function") {
        navigation.pop(2);
      } else {
        navigation.goBack();
        requestAnimationFrame(() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate("Tabs", { screen: "Walks" });
          }
        });
      }
    } catch (e: unknown) {
      leavingAfterCancelRef.current = false;
      const msg = e && typeof e === "object" && "message" in e ? String((e as { message?: string }).message) : "";
      Alert.alert("Error", msg || "Could not cancel walk.");
    } finally {
      setCancelling(false);
    }
  };

  if (!walk) {
    return (
      <View
        style={[
          styles.safe,
          { paddingTop: insets.top, flex: 1, justifyContent: "center", alignItems: "center" },
        ]}>
        <Text style={{ color: colors.text, marginBottom: 16 }}>Walk not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.greenDefault, fontSize: 16, fontWeight: "600" }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={[styles.safe, { paddingTop: insets.top, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={colors.greenDefault} />
      </View>
    );
  }

  if (walk.status !== "scheduled") {
    return null;
  }

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <WalkFormCloseHeader title="Edit Walk" onClose={() => navigation.goBack()} styles={styles} />

      <FormKeyboardScrollView
        layoutAnimationKey={layoutAnimationKey}
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        smoothKeyboardHide
        extraHeight={100}
        extraScrollHeight={48}>
        <EditWalkClientSummary
          styles={styles}
          clientName={client?.name ?? "—"}
          dogNamesLine={dogNames}
        />

        {client && walk ? (
          <WalkPricingFields
            dogs={dogsForPricing}
            priceInputs={dogPrices}
            onPriceChange={(dogId, value) => setDogPrices((prev) => ({ ...prev, [dogId]: value }))}
          />
        ) : null}

        <WalkScheduleFields
          walks={walks}
          excludeWalkId={walkId}
          selectedTime={selectedTime}
          monthDate={monthDate}
          duration={duration}
          customDuration={customDuration}
          notes={notes}
          onSelectedTimeChange={setSelectedTime}
          onMonthDateChange={setMonthDate}
          onDurationChange={setDuration}
          onCustomDurationChange={setCustomDuration}
          onNotesChange={setNotes}
        />

        {client && walk ? (
          <WalkPricingTotalBar dogs={dogsForPricing} priceInputs={dogPrices} />
        ) : null}

        <TouchableOpacity style={[styles.saveFull, saving && { opacity: 0.5 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="white" /> : <Text style={styles.saveFullText}>Save changes</Text>}
        </TouchableOpacity>

        <EditWalkDangerActions
          styles={styles}
          cancelling={cancelling}
          saving={saving}
          onCancelWalkPress={() => setShowCancelWalkSheet(true)}
        />
      </FormKeyboardScrollView>

      <ConfirmDeleteSheet
        visible={showCancelWalkSheet}
        title="Cancel this walk?"
        subtitle="This walk will be marked as cancelled. You can still see it in history where applicable."
        confirmLabel="Cancel walk"
        loading={cancelling}
        onConfirm={confirmCancelWalk}
        onCancel={() => setShowCancelWalkSheet(false)}
        rows={
          walk && client
            ? [
                { label: "Client", value: client.name },
                {
                  label: "Scheduled",
                  value: (() => {
                    const d = parseISO(walk.scheduledAt);
                    return isValid(d) ? format(d, "EEE, MMM d · h:mm a") : "—";
                  })(),
                },
                { label: "Dogs", value: dogNames },
              ]
            : []
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
  headerSpacer: { width: 36, height: 36 },
  content: { padding: 16, paddingBottom: 48 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    color: colors.textMuted,
    marginBottom: 8,
    marginTop: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    overflow: "hidden",
  },
  readOnlyName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  readOnlyMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  saveFull: {
    marginTop: 28,
    backgroundColor: colors.greenDeep,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
  },
  saveFullText: { fontSize: 15, fontWeight: "700", color: "white" },
  dangerSectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.1,
    color: colors.textMuted,
    marginBottom: 8,
    marginTop: 28,
  },
  cancelWalkBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(224, 64, 64, 0.45)",
    backgroundColor: "rgba(224, 64, 64, 0.08)",
  },
  cancelWalkBtnText: { fontSize: 15, fontWeight: "600", color: "#E87070" },
});
