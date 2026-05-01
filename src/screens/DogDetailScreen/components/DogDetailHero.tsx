import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Dog } from "../../../types";
import { RootStackParamList } from "../../../navigation";
import { colors } from "../../../theme";
import { traitPillStyle } from "../dogDetailUtils";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type FontSet = {
  regular: string;
  medium: string;
  semi: string;
  bold: string;
};

type Styles = Record<string, object>;

export function DogDetailHero({
  paddingTop,
  dog,
  clientId,
  navigation,
  font,
  styles,
  allowEdit = true,
}: {
  paddingTop: number;
  dog: Dog;
  clientId: string;
  navigation: Nav;
  font: FontSet;
  styles: Styles;
  allowEdit?: boolean;
}) {
  return (
    <View style={[styles.hero, { paddingTop }]}>
      <View style={styles.heroTopRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={16} color="#FFFFFF" />
        </TouchableOpacity>
        {allowEdit ? (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() =>
              navigation.navigate("EditDog", {
                clientId,
                dogId: dog.id,
              })
            }>
            <Text style={[styles.editBtnText, { fontFamily: font.semi }]}>
              Edit
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      <View style={styles.dogRow}>
        <View style={styles.dogCircle}>
          <Text style={{ fontSize: 24 }}>{dog.emoji || "🐕"}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.dogName, { fontFamily: font.bold }]}>
            {dog.name}
          </Text>
          <Text style={[styles.dogBreed, { fontFamily: font.regular }]}>
            {dog.breed || "Breed not provided"}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Text style={[styles.metaPillText]}>
                {dog.age > 0 ? `${dog.age} yr` : "Age not provided"}
              </Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={[styles.metaPillText]}>
                {dog.weight > 0 ? `${dog.weight} lb` : "Weight not provided"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {dog.traits.length > 0 && (
        <View style={styles.traitRow}>
          {dog.traits.map((t, index) => {
            const st = traitPillStyle(t.type);
            return (
              <View
                key={`${t.label}-${index}`}
                style={[styles.trait, { backgroundColor: st.bg }]}>
                <Text
                  style={[
                    styles.traitText,
                    { color: st.color, fontFamily: font.medium },
                  ]}>
                  {t.type === "positive" ? "✓" : t.type === "red" ? "!" : "⚠"}{" "}
                  {t.label}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
