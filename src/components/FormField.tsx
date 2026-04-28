import React, { useState, useRef } from 'react';
import {
  Pressable,
  Text,
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
  StyleProp,
  ViewStyle,
  TextStyle,
  ColorValue,
} from 'react-native';
import { colors } from '../theme';

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
}: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const isInline = layout === 'inline';

  return (
    <Pressable
      style={[isInline ? f.rowContainer : f.stackedContainer, style]}
      onPress={() => inputRef.current?.focus()}
    >
      {label.trim().length > 0 ? (
        <Text style={[f.label, isInline && f.labelInline]}>{label}</Text>
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
    </Pressable>
  );
}

const f = StyleSheet.create({
  stackedContainer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  labelInline: {
    fontSize: 12,
    letterSpacing: 0,
    textTransform: 'none',
    marginBottom: 0,
    width: 44,
  },
  inputStacked: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  inputInline: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
});
