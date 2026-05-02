import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, TextStyle, ViewStyle } from 'react-native';
import { useThemeColors } from '../theme';

type Props = {
  title: string;
  meta: string;
  initials: string;
  statusLabel: string;
  onPress: () => void;
  isLast?: boolean;
  avatarStyle?: ViewStyle;
  statusStyle?: TextStyle;
};

export function WalkListCard({
  title,
  meta,
  initials,
  statusLabel,
  onPress,
  isLast = false,
  avatarStyle,
  statusStyle,
}: Props) {
  const colors = useThemeColors();
  const s = useMemo(
    () =>
      StyleSheet.create({
        walkCard: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          minHeight: 56,
          paddingHorizontal: 12,
          paddingVertical: 12,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        walkCardLast: { borderBottomWidth: 0 },
        avatar: {
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: colors.greenDeep,
          alignItems: 'center',
          justifyContent: 'center',
        },
        avatarText: { color: colors.greenText, fontSize: 12, fontWeight: '700' },
        walkInfo: { flex: 1, minWidth: 0 },
        walkName: { color: colors.text, fontSize: 15, fontWeight: '600' },
        walkMeta: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
        statusPill: {
          fontSize: 11,
          fontWeight: '700',
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 999,
          overflow: 'hidden',
        },
      }),
    [colors],
  );
  return (
    <TouchableOpacity
      style={[s.walkCard, isLast && s.walkCardLast]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[s.avatar, avatarStyle]}>
        <Text style={s.avatarText}>{initials}</Text>
      </View>
      <View style={s.walkInfo}>
        <Text style={s.walkName} numberOfLines={1}>
          {title}
        </Text>
        <Text style={s.walkMeta}>{meta}</Text>
      </View>
      <Text style={[s.statusPill, statusStyle]}>{statusLabel}</Text>
    </TouchableOpacity>
  );
}
