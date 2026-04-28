import React from "react";
import { View, Text } from "react-native";
import { FormField } from "../../../components/FormField";

type Styles = {
  sectionLabel: object;
  card: object;
  divider: object;
};

export function EditClientInfoSection({
  styles,
  name,
  phone,
  address,
  price,
  onChangeName,
  onChangePhone,
  onChangeAddress,
  onChangePrice,
}: {
  styles: Styles;
  name: string;
  phone: string;
  address: string;
  price: string;
  onChangeName: (t: string) => void;
  onChangePhone: (t: string) => void;
  onChangeAddress: (t: string) => void;
  onChangePrice: (t: string) => void;
}) {
  return (
    <>
      <Text style={styles.sectionLabel}>CLIENT INFO</Text>
      <View style={styles.card}>
        <FormField label="Full Name" value={name} onChangeText={onChangeName} placeholder="Jane Smith" />
        <View style={styles.divider} />
        <FormField
          label="Phone"
          value={phone}
          onChangeText={onChangePhone}
          placeholder="(555) 000-0000"
          keyboardType="phone-pad"
          autoCapitalize="none"
        />
        <View style={styles.divider} />
        <FormField
          label="Address"
          value={address}
          onChangeText={onChangeAddress}
          placeholder="123 Main St"
          autoCapitalize="sentences"
        />
        <View style={styles.divider} />
        <FormField
          label="Price per Walk ($)"
          value={price}
          onChangeText={onChangePrice}
          placeholder="25"
          keyboardType="numeric"
          autoCapitalize="none"
        />
      </View>
    </>
  );
}
