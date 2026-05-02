import React, { useState, useRef, useMemo } from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
  StyleProp,
  ViewStyle,
  TextStyle,
  ColorValue,
} from 'react-native';
import { useThemeColors } from '../theme';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  placeholderTextColor?: ColorValue;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'words' | 'sentences' | 'characters';
  autoCorrect?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  returnKeyType?: ReturnKeyTypeOptions;
  secureTextEntry?: boolean;
  editable?: boolean;
  textAlignVertical?: 'auto' | 'top' | 'bottom' | 'center';
  onBlur?: () => void;
  onFocus?: () => void;
  onSubmitEditing?: () => void;
  /**
   * 'stacked' (default): label above input, full-width.
   * 'inline': label on the left, input takes the remaining space on the right.
   */
  layout?: 'stacked' | 'inline';
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  /** When true, shows a red asterisk after the label. */
  required?: boolean;
}

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  placeholderTextColor,
  keyboardType = 'default',
  autoCapitalize = 'words',
  autoCorrect = true,
  multiline,
  numberOfLines,
  returnKeyType,
  secureTextEntry,
  editable,
  textAlignVertical,
  onBlur,
  onFocus,
  onSubmitEditing,
  layout = 'stacked',
  style,
  inputStyle,
  required = false,
}: FormFieldProps) {
  const colors = useThemeColors();
  const f = useMemo(
    () =>
      StyleSheet.create({
        stackedContainer: {
          paddingHorizontal: 14,
          paddingVertical: 12,
        },
        rowContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: 44,
          paddingVertical: 10,
          gap: 8,
        },
        labelRow: {
          flexDirection: 'row',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: 6,
        },
        labelRowInline: {
          marginBottom: 0,
          width: 56,
          flexShrink: 0,
        },
        label: {
          fontSize: 12,
          fontWeight: '600',
          letterSpacing: 0.8,
          color: colors.textMuted,
          textTransform: 'uppercase',
        },
        labelInline: {
          fontSize: 13,
          letterSpacing: 0,
          textTransform: 'none',
          flexShrink: 1,
        },
        /** Required indicator only — solid red asterisk (sibling Text, not nested, avoids measure bugs). */
        labelRequiredAsterisk: {
          color: colors.redDefault,
          fontSize: 14,
          fontWeight: '700',
          marginLeft: 2,
          lineHeight: 14,
        },
        inputStacked: {
          fontSize: 16,
          color: colors.textSecondary,
        },
        inputInline: {
          flex: 1,
          fontSize: 16,
          color: colors.text,
        },
      }),
    [colors]
  );
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const isInline = layout === 'inline';

  return (
    <View style={[isInline ? f.rowContainer : f.stackedContainer, style]} collapsable={false}>
      {label.trim().length > 0 ? (
        <View style={[f.labelRow, isInline && f.labelRowInline]} collapsable={false}>
          <Text style={[f.label, isInline && f.labelInline]}>{label}</Text>
          {required ? <Text style={f.labelRequiredAsterisk}>*</Text> : null}
        </View>
      ) : null}
      <TextInput
        ref={inputRef}
        style={[
          isInline ? f.inputInline : f.inputStacked,
          !isInline && focused && { color: colors.text },
          inputStyle,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor ?? colors.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        multiline={multiline}
        numberOfLines={numberOfLines}
        returnKeyType={returnKeyType}
        secureTextEntry={secureTextEntry}
        editable={editable}
        textAlignVertical={textAlignVertical}
        onFocus={() => { setFocused(true); onFocus?.(); }}
        onBlur={() => { setFocused(false); onBlur?.(); }}
        onSubmitEditing={onSubmitEditing}
      />
    </View>
  );
}
