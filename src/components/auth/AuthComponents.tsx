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
import { auth } from "../../screens/auth/authTheme";

const dc = auth.colors;
const dr = auth.radius;

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
        <ActivityIndicator color="#0A1A0F" />
      ) : (
        <Text style={s.primaryBtnLabel}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

export function OAuthButton({
  label,
  onPress,
  loading,
  icon,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      style={[s.oauthBtn, loading && { opacity: 0.7 }]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.85}>
      {loading ? (
        <ActivityIndicator color={dc.text} size="small" />
      ) : (
        <>
          {icon}
          <Text style={s.oauthLabel}>{label}</Text>
        </>
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

export function GoogleButton({
  onPress,
  loading,
}: {
  onPress: () => void;
  loading?: boolean;
}) {
  return (
    <OAuthButton
      label="Continue with Google"
      onPress={onPress}
      loading={loading}
      icon={
        <Svg width={22} height={22} viewBox="0 0 24 24">
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
      }
    />
  );
}

export function AppleButton({
  onPress,
  loading,
}: {
  onPress: () => void;
  loading?: boolean;
}) {
  return (
    <OAuthButton
      label="Continue with Apple"
      onPress={onPress}
      loading={loading}
      icon={
        <Svg
          width={24}
          height={24}
          viewBox="0 0 24 24"
          accessibilityLabel="Apple logo">
          <Path
            d="M22 17.607c-.786 2.28-3.139 6.317-5.563 6.361-1.608.031-2.125-.953-3.963-.953-1.837 0-2.412.923-3.932.983-2.572.099-6.542-5.827-6.542-10.995 0-4.747 3.308-7.1 6.198-7.143 1.55-.028 3.014 1.045 3.959 1.045.949 0 2.727-1.29 4.596-1.101.782.033 2.979.315 4.389 2.377-3.741 2.442-3.158 7.549.858 9.426zm-5.222-17.607c-2.826.114-5.132 3.079-4.81 5.531 2.612.203 5.118-2.725 4.81-5.531z"
            fill={dc.text}
          />
        </Svg>
      }
    />
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
    backgroundColor: dc.accent,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  primaryBtnLabel: { fontSize: 15, fontWeight: "700", color: "#0A1A0F" },

  oauthBtn: {
    height: 56,
    borderRadius: dr.md,
    backgroundColor: dc.bg3,
    borderWidth: 1,
    borderColor: dc.borderMd,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
  },
  oauthLabel: { fontSize: 14, fontWeight: "600", color: dc.text },
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
    backgroundColor: dc.bg2,
    borderWidth: 1,
    borderColor: dc.borderMd,
    paddingHorizontal: 14,
    fontSize: 15,
    color: dc.text,
  },
  inputFocused: { borderColor: dc.accent },

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
    backgroundColor: "rgba(240,85,85,0.10)",
    borderRadius: dr.sm,
    borderWidth: 1,
    borderColor: "rgba(240,85,85,0.22)",
    padding: 12,
    marginBottom: 4,
  },
  errorText: { color: dc.red, fontSize: 13, fontWeight: "600" },
});
