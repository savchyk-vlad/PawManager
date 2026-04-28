import React, { useState, useMemo, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { FormKeyboardScrollView } from "../../components/FormKeyboardScrollView";
import { WalkFormCloseHeader } from "../../components/WalkFormCloseHeader";
import { WalkScheduleFields } from "../../components/WalkScheduleFields";
import { WalkPricingFields, WalkPricingTotalBar } from "../../components/WalkPricingFields";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { parseISO } from "date-fns";
import { nextWorkingSlotIso } from "../../hooks/useWalkScheduling";
import { useAppStore } from "../../store";
import { useSettingsStore } from "../../store/settingsStore";
import { Client } from "../../types";
import { RootStackParamList } from "../../navigation";
import type { CreateWalkInput } from "../../lib/walksService";
import { colors } from "../../theme";
import { AddWalkClientSection } from "./components/AddWalkClientSection";
import { AddWalkDogsSection } from "./components/AddWalkDogsSection";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, "AddWalk">;

export default function AddWalkScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { clients, walks, addWalk } = useAppStore();

  const { initialIso, initialTimePicked } = useMemo(() => {
    const now = new Date();
    const slot = nextWorkingSlotIso(now);
    const preDate = route.params?.preselectedDateIso ? parseISO(route.params.preselectedDateIso) : null;

    if (preDate && !Number.isNaN(preDate.getTime())) {
      if (slot) {
        const slotDate = new Date(slot);
        const d = new Date(preDate);
        d.setHours(slotDate.getHours(), slotDate.getMinutes(), 0, 0);
        return { initialIso: d.toISOString(), initialTimePicked: true };
      }
      const d = new Date(preDate);
      d.setHours(0, 0, 0, 0);
      return { initialIso: d.toISOString(), initialTimePicked: false };
    }

    if (slot) return { initialIso: slot, initialTimePicked: true };

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return { initialIso: tomorrow.toISOString(), initialTimePicked: false };
  }, [route.params?.preselectedDateIso]);

  const initialDay = parseISO(initialIso);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientMatch, setClientMatch] = useState<{ name: string; phone: string } | null>(null);
  const [selectedDogs, setSelectedDogs] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>(initialIso);
  const [monthDate, setMonthDate] = useState<Date>(
    new Date(initialDay.getFullYear(), initialDay.getMonth(), 1),
  );
  const [duration, setDuration] = useState<number>(() => useSettingsStore.getState().defaultWalkDuration);
  const [customDuration, setCustomDuration] = useState("");
  const [hasPickedDate, setHasPickedDate] = useState(true);
  const [hasPickedTime, setHasPickedTime] = useState(initialTimePicked);
  const [hasPickedDuration, setHasPickedDuration] = useState(true);
  const [notes, setNotes] = useState("");
  const [dogPrices, setDogPrices] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<React.ComponentRef<typeof FormKeyboardScrollView> | null>(null);
  const schedulableClients = useMemo(
    () => clients.filter((c) => c.dogs.some((d) => !d.isDeleted)),
    [clients],
  );

  const selectedClient = useMemo((): Client | null => {
    if (!selectedClientId) return null;
    const byId = clients.find((c) => c.id === selectedClientId);
    if (byId) return byId;
    if (clientMatch) {
      return clients.find((c) => c.name === clientMatch.name && c.phone === clientMatch.phone) ?? null;
    }
    return null;
  }, [clients, selectedClientId, clientMatch]);
  const selectedClientActiveDogs = selectedClient?.dogs.filter((d) => !d.isDeleted) ?? [];

  useEffect(() => {
    if (!selectedClientId || !String(selectedClientId).startsWith("temp-")) return;
    if (schedulableClients.some((c) => c.id === selectedClientId)) return;
    if (clientMatch) {
      const resolved = schedulableClients.find(
        (c) =>
          !String(c.id).startsWith("temp-") &&
          c.name === clientMatch.name &&
          c.phone === clientMatch.phone,
      );
      if (resolved) {
        setSelectedClientId(resolved.id);
        setSelectedDogs(resolved.dogs.filter((d) => !d.isDeleted).map((d) => d.id));
        setClientMatch(null);
        return;
      }
    }
    setSelectedClientId(null);
    setSelectedDogs([]);
    setClientMatch(null);
  }, [schedulableClients, selectedClientId, clientMatch]);

  useEffect(() => {
    if (!selectedClientId) return;
    const c = schedulableClients.find((x) => x.id === selectedClientId);
    if (!c) return;
    const activeDogs = c.dogs.filter((d) => !d.isDeleted);
    if (activeDogs.some((d) => String(d.id).startsWith("temp-"))) return;
    setSelectedDogs((prev) => {
      if (!prev.length) return prev;
      if (!prev.some((id) => !activeDogs.some((d) => d.id === id))) return prev;
      const still = prev.filter((id) => activeDogs.some((d) => d.id === id));
      const lost = prev.length - still.length;
      if (lost <= 0) return still;
      const add = activeDogs.filter((d) => !still.includes(d.id));
      return [...still, ...add.map((d) => d.id).slice(0, lost)];
    });
  }, [schedulableClients, selectedClientId]);

  useEffect(() => {
    setDogPrices({});
  }, [selectedClientId]);

  useEffect(() => {
    if (!selectedClient) return;
    const base = String(selectedClient.pricePerWalk);
    setDogPrices((prev) => {
      const next = { ...prev };
      for (const id of selectedDogs) {
        if (!(id in next)) next[id] = base;
      }
      for (const key of Object.keys(next)) {
        if (!selectedDogs.includes(key)) delete next[key];
      }
      return next;
    });
  }, [selectedDogs, selectedClient?.id, selectedClient?.pricePerWalk]);

  const toggleDog = (dogId: string) => {
    setSelectedDogs((prev) =>
      prev.includes(dogId) ? prev.filter((id) => id !== dogId) : [...prev, dogId],
    );
  };

  const selectClient = (client: Client) => {
    setSelectedClientId(client.id);
    setClientMatch(String(client.id).startsWith("temp-") ? { name: client.name, phone: client.phone } : null);
    setSelectedDogs(client.dogs.filter((d) => !d.isDeleted).map((d) => d.id));
  };

  const hasPersistedClientAndDogs = Boolean(
    selectedClient &&
      selectedDogs.length > 0 &&
      !String(selectedClient.id).startsWith("temp-") &&
      !selectedDogs.some((id) => String(id).includes("temp")),
  );

  const pricingValid =
    selectedDogs.length > 0 &&
    selectedDogs.every((id) => {
      const t = dogPrices[id]?.trim() ?? "";
      const n = Number.parseFloat(t.replace(/,/g, ""));
      return t !== "" && Number.isFinite(n) && n >= 0;
    });

  const canSave =
    hasPersistedClientAndDogs && hasPickedDate && hasPickedTime && hasPickedDuration && pricingValid;

  const handleSave = async () => {
    if (!canSave || saving || !selectedClient) return;
    setSaving(true);
    try {
      const perDogPrices: Record<string, number> = {};
      for (const id of selectedDogs) {
        const raw = Number.parseFloat((dogPrices[id] ?? "").replace(/,/g, ""));
        perDogPrices[id] = raw;
      }
      const payload: CreateWalkInput = {
        clientId: selectedClient.id,
        dogIds: selectedDogs,
        scheduledAt: selectedTime,
        durationMinutes: duration,
        notes: notes || undefined,
        perDogPrices,
      };
      await addWalk(payload);
      navigation.goBack();
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "message" in e ? String((e as { message?: string }).message) : "";
      Alert.alert("Error", msg || "Could not schedule walk.");
    } finally {
      setSaving(false);
    }
  };

  const layoutAnimationKey = useMemo(
    () =>
      [
        selectedClientId ?? "",
        selectedDogs.join(","),
        monthDate.getTime(),
        walks.length,
        selectedClient && selectedDogs.length > 0 ? "1" : "0",
        selectedClient && selectedClientActiveDogs.length > 1 ? "1" : "0",
      ].join("|"),
    [
      selectedClientId,
      selectedDogs.join(","),
      monthDate,
      walks.length,
      selectedClient,
      selectedDogs.length,
      selectedClientActiveDogs.length,
    ],
  );

  return (
    <View style={s.safe}>
      <View style={{ height: insets.top, backgroundColor: colors.greenDeep }} />

      <WalkFormCloseHeader title="Schedule Walk" onClose={() => navigation.goBack()} styles={s} />

      <FormKeyboardScrollView
        ref={scrollRef}
        layoutAnimationKey={layoutAnimationKey}
        style={{ flex: 1 }}
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        smoothKeyboardHide
        extraHeight={100}
        extraScrollHeight={48}>
        <AddWalkClientSection
          styles={s}
          schedulableClients={schedulableClients}
          selectedClient={selectedClient}
          selectedClientId={selectedClientId}
          clientMatch={clientMatch}
          onSelectClient={selectClient}
        />

        <AddWalkDogsSection
          styles={s}
          dogs={selectedClientActiveDogs}
          selectedDogIds={selectedDogs}
          onToggleDog={toggleDog}
        />

        {selectedClient && selectedDogs.length > 0 ? (
          <WalkPricingFields
            dogs={selectedClientActiveDogs.filter((d) => selectedDogs.includes(d.id))}
            priceInputs={dogPrices}
            onPriceChange={(dogId, value) => setDogPrices((prev) => ({ ...prev, [dogId]: value }))}
          />
        ) : null}

        <WalkScheduleFields
          walks={walks}
          selectedTime={selectedTime}
          monthDate={monthDate}
          duration={duration}
          customDuration={customDuration}
          notes={notes}
          timePicked={hasPickedTime}
          onSelectedTimeChange={setSelectedTime}
          onMonthDateChange={setMonthDate}
          onDurationChange={setDuration}
          onCustomDurationChange={setCustomDuration}
          onNotesChange={setNotes}
          onPickDate={() => setHasPickedDate(true)}
          onPickTime={() => setHasPickedTime(true)}
          onPickDuration={() => setHasPickedDuration(true)}
          onNotesFocus={() => {
            setTimeout(() => {
              const v = scrollRef.current as { update?: () => void } | null;
              v?.update?.();
            }, 100);
          }}
        />

        {selectedClient && selectedDogs.length > 0 ? (
          <WalkPricingTotalBar
            dogs={selectedClientActiveDogs.filter((d) => selectedDogs.includes(d.id))}
            priceInputs={dogPrices}
          />
        ) : null}

        <TouchableOpacity
          style={[s.saveFullBtn, (!canSave || saving) && { opacity: 0.4 }]}
          onPress={handleSave}
          disabled={!canSave || saving}>
          {saving ? <ActivityIndicator color="white" /> : <Text style={s.saveFullBtnText}>Schedule Walk</Text>}
        </TouchableOpacity>
      </FormKeyboardScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.greenDeep,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
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
  clientPending: {
    fontSize: 12,
    color: colors.greenDefault,
    marginBottom: 8,
    marginTop: -4,
  },

  borderedCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },

  clientRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  clientRowActive: { backgroundColor: colors.greenDeep },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  clientInitial: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#252522",
    alignItems: "center",
    justifyContent: "center",
  },
  clientInitialActive: { backgroundColor: colors.greenDeep },
  clientInitialText: { fontSize: 15, fontWeight: "600", color: colors.textMuted },
  clientName: { fontSize: 14, fontWeight: "600", color: colors.text, marginBottom: 2 },
  clientMeta: { fontSize: 12, color: colors.textSecondary },
  emptyClients: { paddingHorizontal: 14, paddingVertical: 16 },
  emptyClientsTitle: { fontSize: 14, fontWeight: "600", color: colors.textMuted, marginBottom: 4 },
  emptyClientsText: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.textMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: { backgroundColor: colors.greenDeep, borderColor: colors.greenDeep },

  saveFullBtn: {
    marginTop: 28,
    backgroundColor: colors.greenDeep,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
  },
  saveFullBtnText: { fontSize: 15, fontWeight: "700", color: "white" },
});
