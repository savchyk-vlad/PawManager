import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FormField } from "../../../components/FormField";
import { Dog } from "../../../types";
import { EDIT_DOG_EMOJIS } from "../editDogConstants";

type Styles = Record<string, object>;

export function EditDogBasicsStep({
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
      <FormField
        label="Name"
        value={draft.name}
        onChangeText={(t) => setDraft({ ...draft, name: t })}
        placeholder="Buddy"
      />
      <View style={styles.divider} />
      <FormField
        label="Breed"
        value={draft.breed}
        onChangeText={(t) => setDraft({ ...draft, breed: t })}
        placeholder="Mixed"
      />
      <View style={styles.divider} />
      <Text style={styles.fieldLabel}>Emoji</Text>
      <View style={styles.emojiRow}>
        {EDIT_DOG_EMOJIS.map((em) => (
          <TouchableOpacity
            key={em}
            style={[styles.emojiChip, draft.emoji === em && styles.emojiChipOn]}
            onPress={() => setDraft({ ...draft, emoji: em })}>
            <Text style={{ fontSize: 26 }}>{em}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
