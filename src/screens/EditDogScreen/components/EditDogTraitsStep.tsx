import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FormField } from "../../../components/FormField";
import { Dog, DogTraitType } from "../../../types";
import { useThemeColors } from "../../../theme";

type Styles = Record<string, object>;

export function EditDogTraitsStep({
  draft,
  styles,
  updateTrait,
  addTraitRow,
  removeTraitRow,
}: {
  draft: Omit<Dog, "id">;
  styles: Styles;
  updateTrait: (index: number, patch: Partial<{ label: string; type: DogTraitType }>) => void;
  addTraitRow: () => void;
  removeTraitRow: (index: number) => void;
}) {
  const colors = useThemeColors();
  return (
    <View style={styles.card}>
      <Text style={styles.hint}>Add short notes like “friendly with cats” or “pulls on leash”.</Text>
      {draft.traits.map((tr, index) => (
        <View key={index}>
          {index > 0 && <View style={styles.divider} />}
          <View style={styles.traitRow}>
            <View style={{ flex: 1 }}>
              <FormField
                label={`Trait ${index + 1}`}
                value={tr.label}
                onChangeText={(t) => updateTrait(index, { label: t })}
                placeholder="Label"
              />
            </View>
            <TouchableOpacity style={styles.trashBtn} onPress={() => removeTraitRow(index)}>
              <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeChip, tr.type === "positive" && styles.typeChipOn]}
              onPress={() => updateTrait(index, { type: "positive" })}>
              <Text style={[styles.typeChipText, tr.type === "positive" && styles.typeChipTextOn]}>Positive</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeChip, tr.type === "warning" && styles.typeChipOnWarn]}
              onPress={() => updateTrait(index, { type: "warning" })}>
              <Text style={[styles.typeChipText, tr.type === "warning" && styles.typeChipTextOnWarn]}>Warning</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeChip, tr.type === "red" && styles.typeChipOnRed]}
              onPress={() => updateTrait(index, { type: "red" })}>
              <Text style={[styles.typeChipText, tr.type === "red" && styles.typeChipTextOnRed]}>High risk</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.addTrait} onPress={addTraitRow}>
        <Ionicons name="add-circle-outline" size={22} color={colors.greenDefault} />
        <Text style={styles.addTraitText}>Add trait</Text>
      </TouchableOpacity>
    </View>
  );
}
