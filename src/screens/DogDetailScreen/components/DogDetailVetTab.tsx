import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Dog } from "../../../types";
import { colors } from "../../../theme";
import { Row } from "./Row";

type FontSet = {
  regular: string;
  medium: string;
  semi: string;
  bold: string;
};

type Styles = Record<string, object>;

const NOT_PROVIDED = "not provided";

export function DogDetailVetTab({
  dog,
  font,
  styles,
  screenW,
}: {
  dog: Dog;
  font: FontSet;
  styles: Styles;
  screenW: number;
}) {
  return (
    <View style={[styles.page, { width: screenW }]}>
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.secTitle, { fontFamily: font.semi }]}>Veterinarian</Text>
        <View style={styles.infoCard}>
          <View style={styles.vetRow}>
            <View style={styles.vetIcon}>
              <Ionicons name="pulse" size={18} color={colors.greenDefault} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={[styles.vetName, { fontFamily: font.semi }, !dog.vet?.trim() && { color: colors.textMuted }]}
                numberOfLines={2}>
                {dog.vet?.trim() || "Vet not provided"}
              </Text>
              <Text
                style={[
                  styles.vetMeta,
                  { fontFamily: font.regular },
                  !dog.vetPhone?.trim() && { color: colors.textMuted },
                ]}
                numberOfLines={2}>
                {dog.vetPhone?.trim() || "Vet phone not provided"}
              </Text>
            </View>
            {dog.vetPhone ? (
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => Linking.openURL(`tel:${dog.vetPhone.replace(/[^0-9+]/g, "")}`)}>
                <Text style={[styles.callBtnText, { fontFamily: font.semi }]}>Call</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <Text style={[styles.secTitle, { fontFamily: font.semi }]}>Allergies & conditions</Text>
        {dog.medical ? (
          <View style={[styles.alertCard, styles.alertDanger]}>
            <Text style={styles.alertIcon}>🚨</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.alertTitleDanger, { fontFamily: font.bold }]}>Medical</Text>
              <Text style={[styles.alertBodyDanger, { fontFamily: font.regular }]}>{dog.medical}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.infoCard}>
            <Row
              label="Medical notes"
              value="Medical notes not provided"
              font={font}
              notProvidedToken={NOT_PROVIDED}
              styles={styles}
              last
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
