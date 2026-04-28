import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, type ViewStyle } from 'react-native';
import { colors } from '../theme';

type Props = {
  emoji?: string;
  text: string;
  ctaLabel?: string;
  onCta?: () => void;
  style?: ViewStyle;
};

export function EmptyPlaceholder({ emoji = '🐾', text, ctaLabel, onCta, style }: Props) {
  return (
    <View style={[s.box, style]}>
      <Text style={s.emoji}>{emoji}</Text>
      <Text style={s.text}>{text}</Text>
      {ctaLabel && onCta && (
        <TouchableOpacity style={s.cta} onPress={onCta} activeOpacity={0.8}>
          <Text style={s.ctaText}>{ctaLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  box: {
    backgroundColor: colors.surfaceExtra,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  emoji: { fontSize: 32, marginBottom: 8 },
  text: { fontSize: 14, color: 'rgba(255,255,255,0.35)', textAlign: 'center' },
  cta: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(92,175,114,0.4)',
    backgroundColor: 'rgba(92,175,114,0.08)',
  },
  ctaText: { fontSize: 14, fontWeight: '600', color: '#5CAF72' },
});
