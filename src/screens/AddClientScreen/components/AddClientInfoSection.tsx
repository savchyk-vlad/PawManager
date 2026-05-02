import React from "react";
import { View, Text } from "react-native";
import type { ClientAddress } from "../../../types";
import { FormField } from "../../../components/FormField";
import { ClientAddressFormFields } from "../../../components/ClientAddressFormFields";

type Styles = {
  sectionLabel: object;
  card: object;
  cardDivider: object;
  rateHint: object;
};

export function AddClientInfoSection({
  styles,
  name,
  phone,
  address,
  keyLocation,
  price,
  onChangeName,
  onChangePhone,
  onChangeAddress,
  onChangeKeyLocation,
  onChangePrice,
  defaultRatePlaceholder,
  defaultRateHintFragment,
}: {
  styles: Styles;
  name: string;
  phone: string;
  address: ClientAddress;
  keyLocation: string;
  price: string;
  onChangeName: (t: string) => void;
  onChangePhone: (t: string) => void;
  onChangeAddress: (patch: Partial<ClientAddress>) => void;
  onChangeKeyLocation: (t: string) => void;
  onChangePrice: (t: string) => void;
  defaultRatePlaceholder: string;
  defaultRateHintFragment: string;
}) {
  return (
    <>
      <Text style={styles.sectionLabel}>CLIENT INFO</Text>
      <View style={styles.card}>
        <FormField label="Full Name" required value={name} onChangeText={onChangeName} placeholder="Jane Smith" />
        <View style={styles.cardDivider} />
        <FormField
          label="Phone"
          required
          value={phone}
          onChangeText={onChangePhone}
          placeholder="(555) 000-0000"
          keyboardType="phone-pad"
          autoCapitalize="none"
        />
        <View style={styles.cardDivider} />
        <ClientAddressFormFields
          styles={{ divider: styles.cardDivider }}
          address={address}
          onChange={onChangeAddress}
        />
        <View style={styles.cardDivider} />
        <FormField
          label="Key location"
          value={keyLocation}
          onChangeText={onChangeKeyLocation}
          placeholder="Lockbox, door code…"
          autoCapitalize="sentences"
        />
        <View style={styles.cardDivider} />
        <FormField
          label="Price per Walk ($)"
          value={price}
          onChangeText={onChangePrice}
          placeholder={defaultRatePlaceholder}
          keyboardType="numeric"
          autoCapitalize="none"
        />
        <Text style={styles.rateHint}>
          Starts from your default rate ({defaultRateHintFragment} per walk in Settings). Override when this client pays a
          different amount.
        </Text>
      </View>
    </>
  );
}
