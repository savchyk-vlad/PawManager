import React from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EmptyPlaceholder } from "../../../components/EmptyPlaceholder";
import { RootStackParamList } from "../../../navigation";
import { Dog } from "../../../types";
import { colors } from "../../../theme";
import { DogCard } from "./DetailPieces";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Styles = Record<string, object>;

export function ClientDetailDogsTab({
  activeDogs,
  clientId,
  navigation,
  styles,
}: {
  activeDogs: Dog[];
  clientId: string;
  navigation: Nav;
  styles: Styles;
}) {
  return (
    <ScrollView
      style={styles.tabPageScroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {activeDogs.length === 0 ? (
        <>
          <EmptyPlaceholder text="No dogs added yet" />
          <TouchableOpacity
            style={[styles.addDogFooter, { marginTop: 14 }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("EditDog", { clientId })}>
            <Ionicons name="add-outline" size={20} color={colors.greenDefault} />
            <Text style={styles.addDogFooterText}>Add first dog</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.card}>
            {activeDogs.map((dog, i) => (
              <React.Fragment key={dog.id}>
                <DogCard dog={dog} clientId={clientId} styles={styles} />
                {i < activeDogs.length - 1 ? <View style={styles.rowDivider} /> : null}
              </React.Fragment>
            ))}
          </View>
          <TouchableOpacity
            style={styles.addDogFooter}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("EditDog", { clientId })}>
            <Ionicons name="add-outline" size={20} color={colors.greenDefault} />
            <Text style={styles.addDogFooterText}>Add another dog</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}
