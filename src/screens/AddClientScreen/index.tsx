import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Alert, Text } from "react-native";
import { FormKeyboardScrollView } from "../../components/FormKeyboardScrollView";
import { ClientFormScreenHeader } from "../../components/ClientFormScreenHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAppStore } from "../../store";
import { useAuthStore } from "../../store/authStore";
import { useSettingsStore } from "../../store/settingsStore";
import { colors } from "../../theme";
import { AddClientInfoSection } from "./components/AddClientInfoSection";

function formatRateInput(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "";
  return String(n);
}

export default function AddClientScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const addClient = useAppStore((s) => s.addClient);
  const { user } = useAuthStore();
  const defaultRate = useSettingsStore((s) => s.defaultRate);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState(() => formatRateInput(useSettingsStore.getState().defaultRate));
  const [saving, setSaving] = useState(false);

  const canSave = Boolean(name.trim());

  const handleSave = async () => {
    if (!canSave || saving || !user) return;
    setSaving(true);
    try {
      await addClient(
        {
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          pricePerWalk: parseFloat(price) || 0,
          dogs: [],
        },
        user.id,
      );
      navigation.goBack();
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e ? String((e as { message?: string }).message) : "";
      Alert.alert("Error", msg || "Could not save client. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const defaultHint = formatRateInput(defaultRate);

  return (
    <View style={s.safe}>
      <View style={{ height: insets.top, backgroundColor: colors.greenDeep }} />

      <ClientFormScreenHeader
        title="New Client"
        onClose={() => navigation.goBack()}
        onSave={handleSave}
        canSave={canSave}
        saving={saving}
        styles={s}
      />

      <FormKeyboardScrollView
        layoutAnimationKey={saving ? "saving" : "idle"}
        style={{ flex: 1 }}
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        smoothKeyboardHide>
        <AddClientInfoSection
          styles={s}
          name={name}
          phone={phone}
          address={address}
          price={price}
          onChangeName={setName}
          onChangePhone={setPhone}
          onChangeAddress={setAddress}
          onChangePrice={setPrice}
          defaultRatePlaceholder={defaultHint}
          defaultRateHintFragment={defaultHint}
        />

        <TouchableOpacity style={[s.saveFullBtn, !canSave && { opacity: 0.4 }]} onPress={handleSave} disabled={!canSave}>
          <Text style={s.saveFullBtnText}>Add Client</Text>
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
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: colors.greenDeep,
    borderRadius: 999,
  },
  saveBtnText: { fontSize: 13, fontWeight: "600", color: "white" },

  content: { padding: 16 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    color: colors.textMuted,
    marginBottom: 8,
    marginTop: 20,
  },

  card: { backgroundColor: colors.surface, borderRadius: 14, overflow: "hidden" },
  rateHint: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 15,
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 4,
    letterSpacing: 0.1,
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: 14,
  },

  saveFullBtn: {
    marginTop: 24,
    backgroundColor: colors.greenDeep,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
  },
  saveFullBtnText: { fontSize: 15, fontWeight: "700", color: "white" },
});
