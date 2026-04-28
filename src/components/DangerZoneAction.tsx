import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

type DangerZoneActionProps = {
  title?: string;
  buttonText: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
};

export function DangerZoneAction({
  title = 'Danger zone',
  buttonText,
  onPress,
  disabled,
  style,
  labelStyle,
}: DangerZoneActionProps) {
  return (
    <>
      <Text style={[s.label, labelStyle]}>{title}</Text>
      <TouchableOpacity
        style={[s.button, disabled && { opacity: 0.45 }, style]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.85}
      >
        <Ionicons name="trash-outline" size={16} color={colors.redText} />
        <Text style={s.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </>
  );
}

const s = StyleSheet.create({
  label: {
    marginTop: 18,
    marginBottom: 8,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#7E8579',
  },
  button: {
    marginTop: 0,
    backgroundColor: 'rgba(226,75,74,0.12)',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(226,75,74,0.35)',
  },
  buttonText: { color: '#F09595', fontSize: 14, fontWeight: '600' },
});
