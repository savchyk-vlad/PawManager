import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInputProps,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { design } from "../../theme";

const dc = design.colors;
const dr = design.radius;

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[s.primaryBtn, (loading || disabled) && { opacity: 0.7 }]}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.85}>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={s.primaryBtnLabel}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

interface SVGComponentProps {
  width?: number;
  height?: number;
  viewBox?: string;
  [key: string]: any;
}

const SVGComponent = (props: SVGComponentProps) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" {...props}>
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
);

export function GoogleButton({
  onPress,
  loading,
}: {
  onPress: () => void;
  loading?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[s.googleBtn, loading && { opacity: 0.7 }]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.85}>
      {loading ? (
        <ActivityIndicator color={dc.text} size="small" />
      ) : (
        <>
          <SVGComponent />
          <Text style={s.googleLabel}>Continue with Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export function FormLabel({
  text,
  optional,
}: {
  text: string;
  optional?: boolean;
}) {
  return (
    <View
      style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
      <Text style={s.formLabel}>{text}</Text>
      {optional && <Text style={s.formLabelOptional}> (optional)</Text>}
    </View>
  );
}

export function AuthInput(props: TextInputProps) {
  const [isFocused, setFocused] = useState(false);
  return (
    <TextInput
      {...props}
      style={[s.input, isFocused && s.inputFocused, props.style]}
      placeholderTextColor={dc.textMuted}
      onFocus={(e) => {
        setFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        props.onBlur?.(e);
      }}
    />
  );
}

export function OrDivider() {
  return (
    <View style={s.divider}>
      <View style={s.dividerLine} />
      <Text style={s.dividerText}>or</Text>
      <View style={s.dividerLine} />
    </View>
  );
}

export function BrandBlock() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <Text style={{ fontSize: 32 }}>🐾</Text>
      <Text style={s.wordmark}>PawManager</Text>
    </View>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <View style={s.errorBox}>
      <Text style={s.errorText}>{message}</Text>
    </View>
  );
}

export function FormField({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View>
      <FormLabel text={label} optional={optional} />
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  primaryBtn: {
    height: 56,
    borderRadius: dr.md,
    backgroundColor: dc.greenDeep,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  primaryBtnLabel: { fontSize: 15, fontWeight: "700", color: "#fff" },

  googleBtn: {
    height: 56,
    borderRadius: dr.md,
    backgroundColor: dc.bg,
    borderWidth: 1,
    borderColor: dc.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
  },
  googleLabel: { fontSize: 15, fontWeight: "500", color: dc.text },

  formLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: dc.textMuted,
  },
  formLabelOptional: {
    fontSize: 12,
    fontWeight: "400",
    color: dc.textMuted,
  },

  input: {
    height: 52,
    borderRadius: dr.sm,
    backgroundColor: dc.surfaceHigh,
    borderWidth: 1,
    borderColor: dc.border,
    paddingHorizontal: 14,
    fontSize: 15,
    color: dc.text,
  },
  inputFocused: { borderColor: dc.greenDeep },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    marginVertical: 16,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: dc.border },
  dividerText: {
    fontSize: 12,
    color: dc.textMuted,
    paddingHorizontal: 12,
  },

  pawBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: dc.greenDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: dc.text,
  },

  errorBox: {
    backgroundColor: dc.redSubtle,
    borderRadius: dr.sm,
    padding: 12,
    marginBottom: 4,
  },
  errorText: { color: dc.redDefault, fontSize: 13 },
});
