import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Dog } from "../../../types";

type Styles = {
  sectionLabel: object;
  borderedCard: object;
  clientRow: object;
  rowBorder: object;
  clientName: object;
  clientMeta: object;
  checkbox: object;
  checkboxActive: object;
};

export function AddWalkDogsSection({
  styles,
  dogs,
  selectedDogIds,
  onToggleDog,
}: {
  styles: Styles;
  dogs: Dog[];
  selectedDogIds: string[];
  onToggleDog: (dogId: string) => void;
}) {
  if (dogs.length <= 1) return null;

  return (
    <>
      <Text style={styles.sectionLabel}>DOGS</Text>
      <View style={styles.borderedCard}>
        {dogs.map((dog, i) => {
          const active = selectedDogIds.includes(dog.id);
          return (
            <TouchableOpacity
              key={dog.id}
              style={[styles.clientRow, i < dogs.length - 1 && styles.rowBorder]}
              onPress={() => onToggleDog(dog.id)}>
              <Text style={{ fontSize: 22, width: 36, textAlign: "center" }}>{dog.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.clientName}>{dog.name}</Text>
                <Text style={styles.clientMeta}>{dog.breed}</Text>
              </View>
              <View style={[styles.checkbox, active && styles.checkboxActive]}>
                {active && <Ionicons name="checkmark" size={14} color="white" />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}
