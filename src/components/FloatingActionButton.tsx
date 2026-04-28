import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
};

export function FloatingActionButton({ label, onPress, style }: Props) {
  return (
    <TouchableOpacity style={[s.btn, style]} onPress={onPress} activeOpacity={0.88}>
      <Ionicons name="add-circle" size={18} color={colors.greenDefault} />
      <Text style={s.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  btn: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.greenDeep,
    borderWidth: 1,
    borderColor: colors.greenBorder,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  label: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.15,
  },
});
