import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Text } from "react-native";
import { FormKeyboardScrollView } from "../../components/FormKeyboardScrollView";
import { ClientFormScreenHeader } from "../../components/ClientFormScreenHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppStore } from "../../store";
import { useAuthStore } from "../../store/authStore";
import { RootStackParamList } from "../../navigation";
import { colors } from "../../theme";
import { EditClientInfoSection } from "./components/EditClientInfoSection";

type Route = RouteProp<RootStackParamList, "EditClient">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function EditClientScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { clients, updateClient, loadClients } = useAppStore();
  const userId = useAuthStore((s) => s.session?.user?.id);

  const client = clients.find((c) => c.id === route.params.clientId);
  if (!client) return null;

  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(client.phone);
  const [address, setAddress] = useState(client.address);
  const [price, setPrice] = useState(String(client.pricePerWalk));
  const [saving, setSaving] = useState(false);

  const canSave = Boolean(name.trim());

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await updateClient(client.id, {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        pricePerWalk: parseFloat(price) || 0,
      });

      if (userId) {
        await loadClients(userId);
      }

      navigation.goBack();
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e ? String((e as { message?: string }).message) : "";
      Alert.alert("Error", msg || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[s.safe, { paddingTop: insets.top }]}>
      <ClientFormScreenHeader
        title="Edit Client"
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
        <EditClientInfoSection
          styles={s}
          name={name}
          phone={phone}
          address={address}
          price={price}
          onChangeName={setName}
          onChangePhone={setPhone}
          onChangeAddress={setAddress}
          onChangePrice={setPrice}
        />

        <TouchableOpacity
          style={[s.saveFullBtn, (!canSave || saving) && { opacity: 0.4 }]}
          onPress={handleSave}
          disabled={!canSave || saving}>
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={s.saveFullBtnText}>Save Changes</Text>
          )}
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
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
  divider: {
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
