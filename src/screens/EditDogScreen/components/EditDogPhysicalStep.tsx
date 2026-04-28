import React from "react";
import { View } from "react-native";
import { FormField } from "../../../components/FormField";
import { Dog } from "../../../types";

type Styles = Record<string, object>;

export function EditDogPhysicalStep({
  draft,
  setDraft,
  ageStr,
  weightStr,
  styles,
}: {
  draft: Omit<Dog, "id">;
  setDraft: React.Dispatch<React.SetStateAction<Omit<Dog, "id"> | null>>;
  ageStr: string;
  weightStr: string;
  styles: Styles;
}) {
  return (
    <View style={styles.card}>
      <FormField
        label="Age (years)"
        value={ageStr}
        onChangeText={(t) => {
          const n = parseInt(t.replace(/\D/g, ""), 10);
          setDraft({ ...draft, age: t === "" ? 0 : Number.isFinite(n) ? n : draft.age });
        }}
        placeholder="0"
        keyboardType="number-pad"
        autoCapitalize="none"
      />
      <View style={styles.divider} />
      <FormField
        label="Weight (lbs)"
        value={weightStr}
        onChangeText={(t) => {
          const cleaned = t.replace(/[^\d.]/g, "");
          const n = parseFloat(cleaned);
          setDraft({
            ...draft,
            weight: cleaned === "" ? 0 : Number.isFinite(n) ? n : draft.weight,
          });
        }}
        placeholder="0"
        keyboardType="decimal-pad"
        autoCapitalize="none"
      />
    </View>
  );
}
