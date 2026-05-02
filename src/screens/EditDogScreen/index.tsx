import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Keyboard,
  Platform,
  useWindowDimensions,
} from "react-native";
import { FormKeyboardScrollView } from "../../components/FormKeyboardScrollView";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "../../store";
import { useAuthStore } from "../../store/authStore";
import { RootStackParamList } from "../../navigation";
import { Dog, DogTraitType } from "../../types";
import { useThemeColors, type ThemeColors } from "../../theme";
import {
  EDIT_DOG_FOOTER_SCROLL_PADDING,
  EDIT_DOG_STEPS,
  EDIT_DOG_TRAITS_EXTRA_HEIGHT,
  EDIT_DOG_TRAITS_EXTRA_SCROLL,
} from "./editDogConstants";
import { EditDogBasicsStep } from "./components/EditDogBasicsStep";
import { EditDogPhysicalStep } from "./components/EditDogPhysicalStep";
import { EditDogTraitsStep } from "./components/EditDogTraitsStep";
import { EditDogVetNotesStep } from "./components/EditDogVetNotesStep";

type Route = RouteProp<RootStackParamList, "EditDog">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

function stripId(d: Dog): Omit<Dog, "id"> {
  const { id: _id, ...rest } = d;
  return rest;
}

function emptyDog(): Omit<Dog, "id"> {
  return {
    name: "",
    breed: "",
    emoji: "🐕",
    age: 0,
    weight: 0,
    traits: [],
    vet: "",
    vetPhone: "",
    medical: "",
  };
}

export default function EditDogScreen() {
  const colors = useThemeColors();
  const s = useMemo(() => createIndexStyles(colors), [colors]);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const { clientId, dogId } = route.params;
  const clients = useAppStore((s) => s.clients);
  const saveDogComplete = useAppStore((s) => s.saveDogComplete);
  const loadClients = useAppStore((s) => s.loadClients);
  const userId = useAuthStore((s) => s.session?.user?.id);

  const client = clients.find((c) => c.id === clientId);
  const existingDog = dogId ? client?.dogs.find((d) => d.id === dogId) : undefined;

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Omit<Dog, "id"> | null>(null);
  const [saving, setSaving] = useState(false);
  const [keyboardBottomInset, setKeyboardBottomInset] = useState(0);
  const pagerRef = React.useRef<ScrollView>(null);

  useEffect(() => {
    if (!client) return;
    if (dogId && !existingDog) {
      Alert.alert("Dog not found", undefined, [{ text: "OK", onPress: () => navigation.goBack() }]);
      return;
    }
    setDraft(existingDog ? stripId(existingDog) : emptyDog());
  }, [client?.id, dogId, existingDog]);

  useEffect(() => {
    const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const subShow = Keyboard.addListener(showEvt, (e) => {
      setKeyboardBottomInset(e.endCoordinates.height);
    });
    const subHide = Keyboard.addListener(hideEvt, () => setKeyboardBottomInset(0));

    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  const title = useMemo(() => (dogId ? "Edit dog" : "Add dog"), [dogId]);

  const ageStr = draft != null ? (draft.age === 0 ? "" : String(draft.age)) : "";
  const weightStr = draft != null ? (draft.weight === 0 ? "" : String(draft.weight)) : "";

  const canNext = (s: number) => {
    if (draft == null) return false;
    if (s === 0) return draft.name.trim().length > 0;
    return true;
  };

  const goNext = () => {
    if (!canNext(step)) return;
    if (step < EDIT_DOG_STEPS.length - 1) setStep((x) => x + 1);
  };

  const goBack = () => {
    if (step > 0) setStep((x) => x - 1);
  };

  const handleSave = async () => {
    if (draft == null || !canNext(0) || saving) return;
    setSaving(true);
    try {
      const age = parseInt(String(draft.age), 10);
      const weight = parseFloat(String(draft.weight));
      const normalized: Omit<Dog, "id"> = {
        ...draft,
        age: Number.isFinite(age) && age >= 0 ? age : 0,
        weight: Number.isFinite(weight) && weight >= 0 ? weight : 0,
      };
      await saveDogComplete(clientId, dogId, normalized);
      if (userId) await loadClients(userId);
      navigation.goBack();
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    pagerRef.current?.scrollTo({ x: step * screenW, animated: true });
  }, [step, screenW]);

  const updateTrait = (index: number, patch: Partial<{ label: string; type: DogTraitType }>) => {
    setDraft((d) => {
      if (!d) return d;
      const traits = [...d.traits];
      traits[index] = { ...traits[index], ...patch };
      return { ...d, traits };
    });
  };

  const addTraitRow = () => {
    setDraft((d) =>
      d ? { ...d, traits: [...d.traits, { label: "", type: "positive" as const }] } : d,
    );
  };

  const removeTraitRow = (index: number) => {
    setDraft((d) => (d ? { ...d, traits: d.traits.filter((_, i) => i !== index) } : d));
  };

  if (!client || draft === null) {
    return (
      <View style={[s.safe, { paddingTop: insets.top, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator color={colors.greenDefault} />
      </View>
    );
  }

  const isLast = step === EDIT_DOG_STEPS.length - 1;

  const footerSafePad = keyboardBottomInset > 0 ? 12 : insets.bottom + 12;

  const onPagerScrollEnd = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / screenW);
    if (page >= 0 && page < EDIT_DOG_STEPS.length) setStep(page);
  };

  return (
    <View style={[s.safe, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{title}</Text>
        <TouchableOpacity
          style={[s.headerSaveBtn, (!canNext(0) || saving) && { opacity: 0.45 }]}
          onPress={handleSave}
          disabled={!canNext(0) || saving}>
          {saving ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Text style={s.headerSaveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={s.progressWrap}>
        {EDIT_DOG_STEPS.map((_, i) => (
          <View key={i} style={[s.dot, i === step && s.dotActive]} />
        ))}
      </View>
      <Text style={s.stepLabel}>{EDIT_DOG_STEPS[step]}</Text>

      <View style={s.body}>
        <ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
          onMomentumScrollEnd={onPagerScrollEnd}
          keyboardShouldPersistTaps="handled">
          {EDIT_DOG_STEPS.map((_, pageIndex) => (
            <View key={pageIndex} style={{ width: screenW }}>
              <FormKeyboardScrollView
                layoutAnimationKey={`${step}-${pageIndex}`}
                style={{ flex: 1 }}
                contentContainerStyle={[
                  s.content,
                  {
                    paddingBottom:
                      EDIT_DOG_FOOTER_SCROLL_PADDING +
                      insets.bottom +
                      8 +
                      (pageIndex === 2 && keyboardBottomInset > 0 ? 24 : 0),
                  },
                ]}
                showsVerticalScrollIndicator={false}
                smoothKeyboardHide
                keyboardOpeningTime={pageIndex === 2 ? 280 : 250}
                extraScrollHeight={
                  pageIndex === 2 ? EDIT_DOG_TRAITS_EXTRA_SCROLL : 56
                }
                extraHeight={pageIndex === 2 ? EDIT_DOG_TRAITS_EXTRA_HEIGHT : 75}>
                {pageIndex === 0 && <EditDogBasicsStep draft={draft} setDraft={setDraft} styles={s} />}
                {pageIndex === 1 && (
                  <EditDogPhysicalStep
                    draft={draft}
                    setDraft={setDraft}
                    ageStr={ageStr}
                    weightStr={weightStr}
                    styles={s}
                  />
                )}
                {pageIndex === 2 && (
                  <EditDogTraitsStep
                    draft={draft}
                    styles={s}
                    updateTrait={updateTrait}
                    addTraitRow={addTraitRow}
                    removeTraitRow={removeTraitRow}
                  />
                )}
                {pageIndex === 3 && <EditDogVetNotesStep draft={draft} setDraft={setDraft} styles={s} />}
              </FormKeyboardScrollView>
            </View>
          ))}
        </ScrollView>

        <View
          style={[
            s.footer,
            {
              bottom: keyboardBottomInset,
              paddingBottom: footerSafePad,
            },
          ]}>
          {step > 0 ? (
            <TouchableOpacity style={s.secondaryBtn} onPress={goBack}>
              <Text style={s.secondaryBtnText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }} />
          )}
          {isLast ? (
            <TouchableOpacity
              style={[s.primaryBtn, (!canNext(0) || saving) && { opacity: 0.45 }]}
              onPress={handleSave}
              disabled={!canNext(0) || saving}>
              {saving ? (
                <ActivityIndicator color={colors.text} size="small" />
              ) : (
                <Text style={s.primaryBtnText}>Save</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[s.primaryBtn, !canNext(step) && { opacity: 0.45 }]}
              onPress={goNext}
              disabled={!canNext(step)}>
              <Text style={s.primaryBtnText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

function createIndexStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, position: "relative" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },
  headerSaveBtn: {
    minWidth: 56,
    height: 36,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  headerSaveText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.greenDefault,
  },
  progressWrap: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  dotActive: {
    backgroundColor: colors.greenDefault,
    width: 22,
  },
  stepLabel: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.6,
    color: colors.textMuted,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  content: { paddingHorizontal: 16 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: "hidden",
    marginBottom: 12,
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginLeft: 14 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    color: colors.textMuted,
    textTransform: "uppercase",
    paddingHorizontal: 14,
    paddingTop: 12,
    marginBottom: 8,
  },
  emojiRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  emojiChip: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "transparent",
  },
  emojiChipOn: {
    borderColor: colors.greenDefault,
    backgroundColor: "rgba(92,175,114,0.12)",
  },
  hint: {
    fontSize: 13,
    color: colors.textSecondary,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },
  traitRow: { flexDirection: "row", alignItems: "flex-start", gap: 4 },
  trashBtn: { paddingTop: 18, paddingRight: 10 },
  typeRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  typeChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "transparent",
  },
  typeChipOn: { backgroundColor: "rgba(159,225,203,0.18)", borderColor: "rgba(159,225,203,0.28)" },
  typeChipOnWarn: { backgroundColor: "rgba(239,159,39,0.18)", borderColor: "rgba(239,159,39,0.28)" },
  typeChipOnRed: { backgroundColor: "rgba(226,75,74,0.18)", borderColor: "rgba(226,75,74,0.28)" },
  typeChipText: { fontSize: 13, color: colors.textMuted, fontWeight: "600" },
  typeChipTextOn: { color: "#9FE1CB" },
  typeChipTextOnWarn: { color: "#FAC775" },
  typeChipTextOnRed: { color: "#F09595" },
  addTrait: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  addTraitText: { fontSize: 15, fontWeight: "600", color: colors.greenDefault },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  secondaryBtnText: { fontSize: 16, fontWeight: "600", color: colors.textSecondary },
  primaryBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: colors.greenDeep,
  },
  primaryBtnText: { fontSize: 16, fontWeight: "700", color: colors.text },
});
}
