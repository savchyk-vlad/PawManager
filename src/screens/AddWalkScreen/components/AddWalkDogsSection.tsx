import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Dog } from "../../../types";

type Styles = {
  sectionLabel: object;
  borderedCard: object;
  borderedCardHeader: object;
  borderedCardHeaderLabel: object;
  dogsSectionPad?: object;
  clientRow: object;
  clientRowActive?: object;
  rowBorder: object;
  clientName: object;
  clientMeta: object;
};

export function AddWalkDogsSection({
  styles,
  clientName,
  dogs,
  selectedDogIds,
  onToggleDog,
}: {
  styles: Styles;
  clientName: string | null;
  dogs: Dog[];
  selectedDogIds: string[];
  onToggleDog: (dogId: string) => void;
}) {
  if (dogs.length === 0) return null;

  return (
    <>
      <Text style={styles.sectionLabel}>DOGS</Text>
      <View style={[styles.borderedCard, styles.dogsSectionPad]}>
        <View style={styles.borderedCardHeader}>
          <Text style={styles.borderedCardHeaderLabel}>
            {clientName ? `${clientName}'s dogs` : "Dogs"}
          </Text>
        </View>
        {dogs.map((dog, i) => {
          const active = selectedDogIds.includes(dog.id);
          return (
            <TouchableOpacity
              key={dog.id}
              style={[
                styles.clientRow,
                i < dogs.length - 1 && styles.rowBorder,
                active && styles.clientRowActive,
              ]}
              onPress={() => onToggleDog(dog.id)}>
              <Text style={{ fontSize: 22, width: 36, textAlign: "center" }}>{dog.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.clientName}>{dog.name}</Text>
                <Text style={styles.clientMeta}>{dog.breed}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}
