import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  PanGestureHandler,
  State,
  type PanGestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Rect } from "react-native-svg";
import { useThemeColors, radius } from "../theme";

const METHODS = [
  { key: "cash", name: "Cash", desc: "In-person payment" },
  { key: "cash_app", name: "Cash App", desc: "$cashtag transfer" },
  { key: "venmo", name: "Venmo", desc: "@username transfer" },
  { key: "zelle", name: "Zelle", desc: "Bank-to-bank transfer" },
  { key: "card", name: "Card", desc: "Credit or debit" },
  { key: "other", name: "Other", desc: "PayPal, Apple Pay, etc." },
] as const;

type MethodKey = (typeof METHODS)[number]["key"];
const DISMISS_THRESHOLD = 100;
const CLOSED_Y = 700;
const ICON_SIZE = 22;

function PaymentMethodIcon({ method }: { method: MethodKey }) {
  const colors = useThemeColors();
  if (method === "card") {
    return (
      <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
        <Path
          d="M22 3c.53 0 1.039.211 1.414.586s.586.884.586 1.414v14c0 .53-.211 1.039-.586 1.414s-.884.586-1.414.586h-20c-.53 0-1.039-.211-1.414-.586s-.586-.884-.586-1.414v-14c0-.53.211-1.039.586-1.414s.884-.586 1.414-.586h20zm1 8h-22v8c0 .552.448 1 1 1h20c.552 0 1-.448 1-1v-8zm-15 5v1h-5v-1h5zm13-2v1h-3v-1h3zm-10 0v1h-8v-1h8zm-10-6v2h22v-2h-22zm22-1v-2c0-.552-.448-1-1-1h-20c-.552 0-1 .448-1 1v2h22z"
          fill="#4C8DFF"
        />
      </Svg>
    );
  }
  if (method === "cash") {
    return (
      <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
        <Path
          d="M12.164 7.165c-1.15.191-1.702 1.233-1.231 2.328.498 1.155 1.921 1.895 3.094 1.603 1.039-.257 1.519-1.252 1.069-2.295-.471-1.095-1.784-1.827-2.932-1.636zm1.484 2.998l.104.229-.219.045-.097-.219c-.226.041-.482.035-.719-.027l-.065-.387c.195.03.438.058.623.02l.125-.041c.221-.109.152-.387-.176-.453-.245-.054-.893-.014-1.135-.552-.136-.304-.035-.621.356-.766l-.108-.239.217-.045.104.229c.159-.026.345-.036.563-.017l.087.383c-.17-.021-.353-.041-.512-.008l-.06.016c-.309.082-.21.375.064.446.453.105.994.139 1.208.612.173.385-.028.648-.36.774zm10.312 1.057l-3.766-8.22c-6.178 4.004-13.007-.318-17.951 4.454l3.765 8.22c5.298-4.492 12.519-.238 17.952-4.454zm-2.803-1.852c-.375.521-.653 1.117-.819 1.741-3.593 1.094-7.891-.201-12.018 1.241-.667-.354-1.503-.576-2.189-.556l-1.135-2.487c.432-.525.772-1.325.918-2.094 3.399-1.226 7.652.155 12.198-1.401.521.346 1.13.597 1.73.721l1.315 2.835zm2.843 5.642c-6.857 3.941-12.399-1.424-19.5 5.99l-4.5-9.97 1.402-1.463 3.807 8.406-.002.007c7.445-5.595 11.195-1.176 18.109-4.563.294.648.565 1.332.684 1.593z"
          fill={colors.greenDefault}
        />
      </Svg>
    );
  }
  if (method === "cash_app") {
    return (
      <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 512 512">
        <Rect x={0} y={0} width={512} height={512} rx={104} fill="#00d632" />
        <Path
          d="m339.5 190.1c4 4 10.7 4 14.4 0l20-20.8c4.2-4 4-11.2-.5-15.6-15.7-13.7-34.1-24.2-53.9-30.8l6.3-30.5c1.4-6.7-3.6-12.9-10.3-12.9h-38.8c-5 .1-9.3 3.6-10.3 8.5l-5.6 27.1c-51.6 2.6-95.4 28.9-95.4 82.6 0 46.5 36.2 66.4 74.4 80.2 36.2 13.8 55.3 18.9 55.3 38.3 0 20-19.1 31.7-47.3 31.7-25.7 0-52.6-8.6-73.4-29.5-4.1-4.1-10.7-4.1-14.7 0L138.2 340c-4.2 4.3-4.2 11.1 0 15.4 16.8 16.6 38.2 28.6 62.5 35.3l-5.9 28.6c-1.4 6.7 3.5 12.8 10.2 12.9l38.9.3c5.1 0 9.4-3.5 10.4-8.5l5.6-27.2c62.1-4.2 99.9-38.4 99.9-88.3 0-46-37.7-65.4-83.4-81.2-26.1-9.7-48.7-16.4-48.7-36.3 0-19.4 21.1-27.1 42.2-27.1 26.9 0 52.8 11.1 69.7 26.4z"
          fill="#fff"
        />
      </Svg>
    );
  }
  if (method === "venmo") {
    return (
      <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 516 516">
        <Rect y={0} x={0} rx={61} height={516} width={516} fill="#3396cd" />
        <Path
          d="M385.16 105c11.1 18.3 16.08 37.17 16.08 61 0 76-64.87 174.7-117.52 244H163.5L115.3 121.65l105.3-10 25.6 205.17C270 278 299.43 217 299.43 175.44c0-22.77-3.9-38.25-10-51z"
          fill="#fff"
        />
      </Svg>
    );
  }
  if (method === "zelle") {
    return (
      <Image
        source={require("../assets/payments/zelle-icon.png")}
        style={{ width: ICON_SIZE, height: ICON_SIZE, borderRadius: 5 }}
        resizeMode="contain"
      />
    );
  }
  return <Text style={{ fontSize: 16 }}>💬</Text>;
}

type Props = {
  visible: boolean;
  walkTitle: string;
  walkSubtitle: string;
  amountLabel: string;
  onClose: () => void;
  onConfirm: (paymentMethod: string) => void;
};

export function MarkPaidSheet({
  visible,
  walkTitle,
  walkSubtitle,
  amountLabel,
  onClose,
  onConfirm,
}: Props) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const isDismissingRef = useRef(false);
  const sheetMaxHeight = Math.min(windowHeight * 0.92, windowHeight - insets.top - 8);
  const keyboardLift = Platform.OS === "ios" ? keyboardHeight : 0;
  const otherInputRef = useRef<TextInput>(null);
  /** Reserve space for drag handle so ScrollView gets a bounded height and can scroll above the keyboard. */
  const scrollMaxHeight = sheetMaxHeight - 28;
  const [selected, setSelected] = useState<MethodKey | null>(null);
  const [otherText, setOtherText] = useState("");
  const openY = useRef(new Animated.Value(CLOSED_Y)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const sheetScrollRef = useRef<ScrollView>(null);
  const clampedDragY = useRef(
    dragY.interpolate({
      inputRange: [-1, 0, CLOSED_Y * 2],
      outputRange: [0, 0, CLOSED_Y * 2],
    }),
  ).current;
  const sheetY = useRef(Animated.add(openY, clampedDragY)).current;
  const overlayOpacity = useRef(
    sheetY.interpolate({
      inputRange: [0, CLOSED_Y],
      outputRange: [1, 0],
      extrapolate: "clamp",
    }),
  ).current;

  const isReady = useMemo(() => {
    if (!selected) return false;
    if (selected !== "other") return true;
    return otherText.trim().length > 0;
  }, [selected, otherText]);

  const confirmText = useMemo(() => {
    if (!selected) return "Confirm payment";
    if (selected === "other") {
      const custom = otherText.trim();
      return custom.length > 0 ? `Confirm - ${custom}` : "Confirm payment";
    }
    const method = METHODS.find((m) => m.key === selected)?.name ?? "Payment";
    return `Confirm - ${method}`;
  }, [selected, otherText]);

  const submit = () => {
    if (!isReady || !selected) return;
    const method =
      selected === "other"
        ? otherText.trim()
        : METHODS.find((m) => m.key === selected)?.name ?? "Other";
    onConfirm(method);
    setSelected(null);
    setOtherText("");
  };

  const close = () => {
    setSelected(null);
    setOtherText("");
    onClose();
  };

  useEffect(() => {
    if (!visible) return;
    isDismissingRef.current = false;
    openY.setValue(CLOSED_Y);
    dragY.setValue(0);
    Animated.spring(openY, {
      toValue: 0,
      damping: 22,
      stiffness: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, openY, dragY]);

  useEffect(() => {
    const showEvt = "keyboardDidShow";
    const hideEvt = "keyboardDidHide";
    const subShow = Keyboard.addListener(showEvt, (e) => {
      if (isDismissingRef.current) return;
      setKeyboardHeight(e.endCoordinates.height);
      if (selected === "other") {
        requestAnimationFrame(() => {
          sheetScrollRef.current?.scrollToEnd({ animated: true });
        });
      }
    });
    const subHide = Keyboard.addListener(hideEvt, () => {
      if (isDismissingRef.current) return;
      setKeyboardHeight(0);
    });
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, [selected]);

  useEffect(() => {
    if (!visible || selected !== "other") return;
    requestAnimationFrame(() => {
      sheetScrollRef.current?.scrollToEnd({ animated: true });
      otherInputRef.current?.focus();
    });
    const id = setTimeout(() => {
      sheetScrollRef.current?.scrollToEnd({ animated: true });
    }, 280);
    return () => clearTimeout(id);
  }, [visible, selected]);

  const dismiss = (fromY = 0) => {
    isDismissingRef.current = true;
    Keyboard.dismiss();
    openY.setValue(fromY);
    dragY.setValue(0);
    Animated.timing(openY, {
      toValue: CLOSED_Y,
      duration: 260,
      useNativeDriver: true,
    }).start(() => {
      openY.setValue(CLOSED_Y);
      setKeyboardHeight(0);
      close();
    });
  };

  const onGestureEvent = Animated.event([{ nativeEvent: { translationY: dragY } }], {
    useNativeDriver: true,
  });

  const onHandlerStateChange = (e: PanGestureHandlerStateChangeEvent) => {
    const { state, translationY, velocityY } = e.nativeEvent;
    if (state !== State.END && state !== State.CANCELLED) return;
    const clampedTy = Math.max(0, translationY);
    if (clampedTy > DISMISS_THRESHOLD || velocityY > 500) {
      dismiss(clampedTy);
      return;
    }
    Animated.spring(dragY, {
      toValue: 0,
      damping: 20,
      stiffness: 260,
      useNativeDriver: true,
    }).start();
  };

  const s = useMemo(
    () =>
      StyleSheet.create({
        root: { flex: 1, justifyContent: "flex-end" },
        overlay: { backgroundColor: "rgba(0,0,0,0.55)" },
        sheet: {
          backgroundColor: colors.surface,
          alignSelf: "stretch",
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          paddingBottom: 30,
        },
        sheetScroll: {
          flexShrink: 1,
        },
        sheetScrollContent: {
          paddingBottom: 8,
        },
        handle: {
          width: 36,
          height: 4,
          borderRadius: 2,
          backgroundColor: "rgba(255,255,255,0.18)",
          alignSelf: "center",
          marginTop: 10,
        },
        header: { paddingHorizontal: 20, paddingTop: 18 },
        title: { fontSize: 17, fontWeight: "700", color: colors.text, letterSpacing: -0.3 },
        sub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
        amountRow: {
          marginHorizontal: 20,
          marginTop: 14,
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderRadius: radius.sm,
          backgroundColor: colors.greenSubtle,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.greenBorder,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        },
        amountLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: "500" },
        amountValue: { fontSize: 20, fontWeight: "700", color: colors.greenDefault, letterSpacing: -0.5 },
        sectionLabel: {
          fontSize: 12,
          fontWeight: "600",
          letterSpacing: 0.7,
          textTransform: "uppercase",
          color: colors.textMuted,
          paddingTop: 20,
          paddingBottom: 8,
          paddingHorizontal: 20,
        },
        radioList: { paddingHorizontal: 16, gap: 6 },
        radioItem: {
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          paddingHorizontal: 14,
          paddingVertical: 13,
          backgroundColor: colors.surfaceHigh,
          borderRadius: radius.sm,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        radioItemActive: {
          borderColor: colors.greenBorder,
          backgroundColor: colors.greenSubtle,
        },
        circle: {
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 1.5,
          borderColor: colors.border,
          alignItems: "center",
          justifyContent: "center",
        },
        circleActive: {
          borderColor: colors.greenDefault,
          backgroundColor: colors.greenDefault,
        },
        dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#111210", opacity: 0 },
        dotActive: { opacity: 1 },
        iconWrap: {
          width: 38,
          height: 38,
          borderRadius: 10,
          backgroundColor: colors.surfaceExtra,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          alignItems: "center",
          justifyContent: "center",
        },
        iconTxt: { fontSize: 16 },
        brandImageIcon: { width: ICON_SIZE, height: ICON_SIZE, borderRadius: 5 },
        methodInfo: { flex: 1 },
        methodName: { fontSize: 15, fontWeight: "500", color: colors.text },
        methodDesc: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
        otherWrap: { paddingHorizontal: 16, paddingTop: 8 },
        otherInput: {
          backgroundColor: colors.surfaceHigh,
          borderRadius: radius.sm,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          color: colors.text,
          fontSize: 14,
          paddingHorizontal: 14,
          paddingVertical: 11,
        },
        actions: { paddingHorizontal: 16, paddingTop: 20, gap: 10 },
        confirmBtn: {
          backgroundColor: colors.greenDefault,
          borderRadius: radius.md,
          paddingVertical: 15,
          alignItems: "center",
        },
        confirmTxt: { fontSize: 16, fontWeight: "700", color: "#0e1a10", letterSpacing: -0.2 },
        cancelBtn: { paddingVertical: 12, alignItems: "center" },
        cancelTxt: { fontSize: 15, fontWeight: "500", color: colors.textMuted },
      }),
    [colors]
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={() => dismiss()}>
      <View style={s.root}>
        <Animated.View style={[StyleSheet.absoluteFillObject, s.overlay, { opacity: overlayOpacity }]}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => {
              Keyboard.dismiss();
              dismiss();
            }}
          />
        </Animated.View>
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          activeOffsetY={[0, 8]}
          failOffsetX={[-12, 12]}
        >
          <Animated.View
            style={[
              s.sheet,
              {
                paddingBottom: Math.max(30, insets.bottom + 12),
                  marginBottom: keyboardLift,
                transform: [{ translateY: sheetY }],
                maxHeight: sheetMaxHeight,
              },
            ]}
          >
            <View style={s.handle} />
            <ScrollView
              ref={sheetScrollRef}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              showsVerticalScrollIndicator={false}
              bounces={false}
              nestedScrollEnabled
              contentContainerStyle={s.sheetScrollContent}
              style={[s.sheetScroll, { maxHeight: scrollMaxHeight }]}>
                <View style={s.header}>
                  <Text style={s.title}>Mark as Paid</Text>
                  <Text style={s.sub}>{walkTitle}</Text>
                  <Text style={s.sub}>{walkSubtitle}</Text>
                </View>

                <View style={s.amountRow}>
                  <Text style={s.amountLabel}>Total collected</Text>
                  <Text style={s.amountValue}>{amountLabel}</Text>
                </View>

                <Text style={s.sectionLabel}>How were you paid?</Text>

                <View style={s.radioList}>
                  {METHODS.map((method) => {
                    const active = selected === method.key;
                    return (
                      <TouchableOpacity
                        key={method.key}
                        style={[s.radioItem, active && s.radioItemActive]}
                        activeOpacity={0.82}
                        onPress={() => setSelected(method.key)}
                      >
                        <View style={s.iconWrap}>
                          <PaymentMethodIcon method={method.key} />
                        </View>
                        <View style={s.methodInfo}>
                          <Text style={s.methodName}>{method.name}</Text>
                          <Text style={s.methodDesc}>{method.desc}</Text>
                        </View>
                        <View style={[s.circle, active && s.circleActive]}>
                          <View style={[s.dot, active && s.dotActive]} />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {selected === "other" ? (
                  <View style={s.otherWrap}>
                    <TextInput
                      ref={otherInputRef}
                      style={s.otherInput}
                      placeholder="e.g. PayPal, Apple Pay..."
                      placeholderTextColor={colors.textMuted}
                      value={otherText}
                      onChangeText={setOtherText}
                      maxLength={40}
                      autoFocus
                      returnKeyType="done"
                      blurOnSubmit={false}
                      onFocus={() =>
                        requestAnimationFrame(() => {
                          sheetScrollRef.current?.scrollToEnd({ animated: true });
                        })
                      }
                    />
                  </View>
                ) : null}

                <View style={s.actions}>
                  <TouchableOpacity
                    style={[s.confirmBtn, !isReady && { opacity: 0.35 }]}
                    activeOpacity={0.85}
                    disabled={!isReady}
                    onPress={() => {
                      Keyboard.dismiss();
                      submit();
                    }}
                  >
                    <Text style={s.confirmTxt}>{confirmText}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.cancelBtn} activeOpacity={0.82} onPress={() => dismiss()}>
                    <Text style={s.cancelTxt}>Cancel</Text>
                  </TouchableOpacity>
                </View>
            </ScrollView>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </Modal>
  );
}
