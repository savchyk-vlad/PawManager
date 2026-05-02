import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { DangerZoneAction } from "../../../components/DangerZoneAction";
import { Client, Dog } from "../../../types";
import { formatClientAddressSingleLine, formatClientAddressMultiline } from "../../../lib/clientAddress";
import { Row } from "./Row";

type FontSet = {
  regular: string;
  medium: string;
  semi: string;
  bold: string;
};

type Styles = Record<string, object>;

const NOT_PROVIDED = "not provided";

export function DogDetailProfileTab({
  dog,
  client,
  font,
  styles,
  onDeleteDog,
  removing,
  screenW,
}: {
  dog: Dog;
  client: Client;
  font: FontSet;
  styles: Styles;
  onDeleteDog?: () => void;
  removing: boolean;
  screenW: number;
}) {
  return (
    <View style={[styles.page, { width: screenW }]}>
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator={false}>
        {client.keyLocation || dog.medical ? (
          <>
            <Text style={[styles.secTitle, { fontFamily: font.semi }]}>Walker notes</Text>
            {client.keyLocation ? (
              <View style={styles.alertCard}>
                <Text style={styles.alertIcon}>⚠</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.ik, { fontFamily: font.semi, marginBottom: 6 }]}>Client notes</Text>
                  <Text style={[styles.alertBody, { fontFamily: font.regular }]}>
                    {client.keyLocation}
                  </Text>
                </View>
              </View>
            ) : null}
            {dog.medical ? (
              <View style={[styles.alertCard, { marginTop: client.keyLocation ? 10 : 0 }]}>
                <Text style={styles.alertIcon}>⚠</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.alertTitle, { fontFamily: font.bold }]}>Medical notes</Text>
                  <Text style={[styles.alertBody, { fontFamily: font.regular }]}>
                    {dog.medical}
                  </Text>
                </View>
              </View>
            ) : null}
          </>
        ) : null}

        <Text style={[styles.secTitle, { fontFamily: font.semi }]}>Details</Text>
        <View style={styles.infoCard}>
          <Row
            label="Breed"
            value={dog.breed || "Breed not provided"}
            font={font}
            notProvidedToken={NOT_PROVIDED}
            styles={styles}
          />
          <Row
            label="Age"
            value={dog.age > 0 ? `${dog.age} years` : "Age not provided"}
            font={font}
            notProvidedToken={NOT_PROVIDED}
            styles={styles}
          />
          <Row
            label="Weight"
            value={dog.weight > 0 ? `${dog.weight} lbs` : "Weight not provided"}
            font={font}
            notProvidedToken={NOT_PROVIDED}
            styles={styles}
            last
          />
        </View>

        <Text style={[styles.secTitle, { fontFamily: font.semi }]}>Owner</Text>
        <View style={styles.infoCard}>
          <Row label="Name" value={client.name} font={font} notProvidedToken={NOT_PROVIDED} styles={styles} />
          {client.phone ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${client.phone.replace(/[^0-9+]/g, "")}`)}>
              <View style={styles.infoRow}>
                <Text style={[styles.ik, { fontFamily: font.regular }]}>Phone</Text>
                <Text style={[styles.ivLink, { fontFamily: font.medium }]}>{client.phone}</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <Row
              label="Phone"
              value="Phone not provided"
              font={font}
              notProvidedToken={NOT_PROVIDED}
              styles={styles}
            />
          )}
          {formatClientAddressSingleLine(client.address).trim() ? (
            <TouchableOpacity
              onPress={() => {
                const addr = encodeURIComponent(formatClientAddressSingleLine(client.address).trim());
                Linking.openURL(`maps://maps.google.com/maps?daddr=${addr}`);
              }}>
              <View style={styles.infoRow}>
                <Text style={[styles.ik, { fontFamily: font.regular }]}>Address</Text>
                <Text style={[styles.ivLink, { fontFamily: font.medium }]} numberOfLines={3}>
                  {`${formatClientAddressMultiline(client.address)} →`}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <Row
              label="Address"
              value="Address not provided"
              font={font}
              notProvidedToken={NOT_PROVIDED}
              styles={styles}
            />
          )}
          <Row
            label="Key location"
            value={client.keyLocation || "Key location not provided"}
            font={font}
            notProvidedToken={NOT_PROVIDED}
            styles={styles}
            last
          />
        </View>

        {onDeleteDog ? (
          <DangerZoneAction
            buttonText="Delete dog"
            onPress={onDeleteDog}
            disabled={removing}
            labelStyle={styles.dangerZoneLabelPad}
            style={styles.dangerZoneButtonPad}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}
