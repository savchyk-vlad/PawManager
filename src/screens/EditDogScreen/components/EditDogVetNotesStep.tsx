import React from "react";
import { View } from "react-native";
import { FormField } from "../../../components/FormField";
import { Dog } from "../../../types";

type Styles = Record<string, object>;

export function EditDogVetNotesStep({
  draft,
  setDraft,
  styles,
}: {
  draft: Omit<Dog, "id">;
  setDraft: React.Dispatch<React.SetStateAction<Omit<Dog, "id"> | null>>;
  styles: Styles;
}) {
  return (
    <View style={styles.card}>
      <FormField label="Vet" value={draft.vet} onChangeText={(t) => setDraft({ ...draft, vet: t })} placeholder="Clinic name" />
      <View style={styles.divider} />
      <FormField
        label="Vet phone"
        value={draft.vetPhone}
        onChangeText={(t) => setDraft({ ...draft, vetPhone: t })}
        placeholder="(555) 000-0000"
        keyboardType="phone-pad"
        autoCapitalize="none"
      />
      <View style={styles.divider} />
      <FormField
        label="Medical notes"
        value={draft.medical}
        onChangeText={(t) => setDraft({ ...draft, medical: t })}
        placeholder="Allergies, meds…"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
      <View style={styles.divider} />
      <FormField
        label="Key location"
        value={draft.keyLocation}
        onChangeText={(t) => setDraft({ ...draft, keyLocation: t })}
        placeholder="Lockbox, door code…"
      />
    </View>
  );
}
