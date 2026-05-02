import React from 'react';
import { View } from 'react-native';
import type { ClientAddress } from '../types';
import { FormField } from './FormField';

type Styles = {
  divider: object;
};

type Props = {
  styles: Styles;
  address: ClientAddress;
  onChange: (patch: Partial<ClientAddress>) => void;
};

export function ClientAddressFormFields({ styles, address, onChange }: Props) {
  return (
    <>
      <FormField
        label="Street address"
        required
        value={address.line1}
        onChangeText={(t) => onChange({ line1: t })}
        placeholder="123 Main St"
      />
      <View style={styles.divider} />
      <FormField
        label="Apt, suite, unit (optional)"
        value={address.line2}
        onChangeText={(t) => onChange({ line2: t })}
        placeholder="Apt 4B"
        autoCapitalize="words"
      />
      <View style={styles.divider} />
      <FormField
        label="City"
        required
        value={address.city}
        onChangeText={(t) => onChange({ city: t })}
        placeholder="Seattle"
      />
      <View style={styles.divider} />
      <FormField
        label="State"
        required
        value={address.state}
        onChangeText={(t) => onChange({ state: t })}
        placeholder="WA"
        autoCapitalize="characters"
        autoCorrect={false}
      />
      <View style={styles.divider} />
      <FormField
        label="ZIP code"
        required
        value={address.postal}
        onChangeText={(t) => onChange({ postal: t })}
        placeholder="98101"
        keyboardType="numbers-and-punctuation"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </>
  );
}
