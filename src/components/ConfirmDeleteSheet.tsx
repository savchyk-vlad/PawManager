import React, { useRef, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Animated,
} from 'react-native';
import {
  PanGestureHandler,
  State,
  type PanGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../theme';

export type DeleteSheetRow = {
  label: string;
  value: string;
  danger?: boolean;
};

type Props = {
  visible: boolean;
  title: string;
  subtitle: string;
  rows?: DeleteSheetRow[];
  confirmLabel?: string;
  loading?: boolean;
  /** danger = trash + red (delete). leave = exit icon + amber (sign out). */
  visualVariant?: 'danger' | 'leave';
  onConfirm: () => void;
  onCancel: () => void;
};

const DISMISS_THRESHOLD = 100;
const CLOSED_Y = 700;

export function ConfirmDeleteSheet({
  visible,
  title,
  subtitle,
  rows = [],
  confirmLabel = 'Delete',
  loading = false,
  visualVariant = 'danger',
  onConfirm,
  onCancel,
}: Props) {
  const colors = useThemeColors();
  const amber = colors.amberDefault;
  const insets = useSafeAreaInsets();
  const isLeave = visualVariant === 'leave';

  const s = useMemo(
    () =>
      StyleSheet.create({
        root: {
          flex: 1,
          justifyContent: 'flex-end',
        },
        overlay: {
          backgroundColor: 'rgba(0,0,0,0.65)',
        },
        sheet: {
          backgroundColor: '#1D1D1A',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: 'rgba(255,255,255,0.09)',
          borderBottomWidth: 0,
        },
        handleWrap: {
          alignItems: 'center',
          paddingTop: 12,
          paddingBottom: 8,
        },
        handleBar: {
          width: 36,
          height: 4,
          borderRadius: 2,
          backgroundColor: 'rgba(255,255,255,0.14)',
        },
        body: {
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingTop: 8,
          paddingBottom: 20,
        },
        iconWrap: {
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: 'rgba(224,64,64,0.1)',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: 'rgba(224,64,64,0.3)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        },
        iconWrapLeave: {
          backgroundColor: 'rgba(240,160,48,0.12)',
          borderColor: 'rgba(240,160,48,0.35)',
        },
        title: {
          fontSize: 19,
          fontWeight: '700',
          color: '#FFFFFF',
          letterSpacing: -0.3,
          marginBottom: 8,
          textAlign: 'center',
        },
        subtitle: {
          fontSize: 14,
          color: '#8BA890',
          lineHeight: 21,
          textAlign: 'center',
        },
        dangerBox: {
          marginHorizontal: 20,
          marginBottom: 20,
          backgroundColor: 'rgba(224,64,64,0.07)',
          borderRadius: 14,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: 'rgba(224,64,64,0.22)',
          overflow: 'hidden',
        },
        dangerHeader: {
          paddingHorizontal: 16,
          paddingVertical: 10,
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1.2,
          color: 'rgba(224,64,64,0.55)',
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: 'rgba(224,64,64,0.15)',
        },
        dangerRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 11,
        },
        dangerLabel: { fontSize: 14, color: '#606058' },
        dangerValue: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
        dangerValueWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
        dangerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E04040' },
        dangerValueRed: { fontSize: 14, fontWeight: '700', color: '#E04040' },
        dangerDivider: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: 'rgba(224,64,64,0.15)',
          marginHorizontal: 16,
        },
        actions: { paddingHorizontal: 20, gap: 10 },
        btnDelete: {
          backgroundColor: 'rgba(224,64,64,0.18)',
          borderRadius: 14,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: 'rgba(224,64,64,0.45)',
          paddingVertical: 15,
          alignItems: 'center',
        },
        btnDeleteText: {
          fontSize: 16,
          fontWeight: '700',
          color: '#E87070',
          letterSpacing: -0.2,
        },
        btnLeave: {
          backgroundColor: 'rgba(240,160,48,0.16)',
          borderRadius: 14,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: 'rgba(240,160,48,0.42)',
          paddingVertical: 15,
          alignItems: 'center',
        },
        btnLeaveText: {
          fontSize: 16,
          fontWeight: '700',
          color: amber,
          letterSpacing: -0.2,
        },
        btnCancel: {
          backgroundColor: '#252522',
          borderRadius: 14,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: 'rgba(255,255,255,0.07)',
          paddingVertical: 14,
          alignItems: 'center',
        },
        btnCancelText: { fontSize: 16, color: 'rgba(255,255,255,0.45)' },
      }),
    [amber]
  );

  // openY drives the slide-in/out animation (CLOSED_Y → 0 on open, back on dismiss)
  const openY = useRef(new Animated.Value(CLOSED_Y)).current;
  // dragY is updated natively via Animated.event while the user drags
  const dragY = useRef(new Animated.Value(0)).current;

  // Clamp: never let the sheet go above its open position
  const clampedDragY = useRef(
    dragY.interpolate({ inputRange: [-1, 0, CLOSED_Y * 2], outputRange: [0, 0, CLOSED_Y * 2] }),
  ).current;

  // Combined: open offset + drag offset
  const sheetY = useRef(Animated.add(openY, clampedDragY)).current;

  // Overlay fades in/out with the sheet position — free, no extra state
  const overlayOpacity = useRef(
    sheetY.interpolate({ inputRange: [0, CLOSED_Y], outputRange: [1, 0], extrapolate: 'clamp' }),
  ).current;

  useEffect(() => {
    if (visible) {
      openY.setValue(CLOSED_Y);
      dragY.setValue(0);
      Animated.spring(openY, {
        toValue: 0,
        damping: 22,
        stiffness: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const dismiss = (fromY = 0) => {
    // Start dismiss from current drag position so motion is continuous
    openY.setValue(fromY);
    dragY.setValue(0);
    Animated.timing(openY, {
      toValue: CLOSED_Y,
      duration: 260,
      useNativeDriver: true,
    }).start(() => {
      openY.setValue(CLOSED_Y);
      onCancel();
    });
  };

  // Runs on the native thread — no JS bridge for every frame
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: dragY } }],
    { useNativeDriver: true },
  );

  const onHandlerStateChange = (e: PanGestureHandlerStateChangeEvent) => {
    const { state, translationY, velocityY } = e.nativeEvent;
    if (state !== State.END && state !== State.CANCELLED) return;

    const clampedTy = Math.max(0, translationY);
    if (clampedTy > DISMISS_THRESHOLD || velocityY > 500) {
      dismiss(clampedTy);
    } else {
      // Snap back
      Animated.spring(dragY, {
        toValue: 0,
        damping: 20,
        stiffness: 260,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={() => dismiss()}>
      <View style={s.root}>
        <Animated.View style={[StyleSheet.absoluteFill, s.overlay, { opacity: overlayOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={loading ? undefined : () => dismiss()} />
        </Animated.View>

        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          enabled={!loading}
          activeOffsetY={[0, 8]}
          failOffsetX={[-12, 12]}
        >
          <Animated.View
            style={[
              s.sheet,
              { paddingBottom: Math.max(insets.bottom, 16), transform: [{ translateY: sheetY }] },
            ]}
          >
            <View style={s.handleWrap}>
              <View style={s.handleBar} />
            </View>

            <View style={s.body}>
              <View style={[s.iconWrap, isLeave && s.iconWrapLeave]}>
                <Ionicons
                  name={isLeave ? 'exit-outline' : 'trash-outline'}
                  size={24}
                  color={isLeave ? amber : '#C05A5A'}
                />
              </View>
              <Text style={s.title}>{title}</Text>
              <Text style={s.subtitle}>{subtitle}</Text>
            </View>

            {rows.length > 0 && (
              <View style={s.dangerBox}>
                <Text style={s.dangerHeader}>WILL BE DELETED</Text>
                {rows.map((row, i) => (
                  <React.Fragment key={row.label}>
                    {i > 0 && <View style={s.dangerDivider} />}
                    <View style={s.dangerRow}>
                      <Text style={s.dangerLabel}>{row.label}</Text>
                      {row.danger ? (
                        <View style={s.dangerValueWrap}>
                          <View style={s.dangerDot} />
                          <Text style={s.dangerValueRed}>{row.value}</Text>
                        </View>
                      ) : (
                        <Text style={s.dangerValue}>{row.value}</Text>
                      )}
                    </View>
                  </React.Fragment>
                ))}
              </View>
            )}

            <View style={s.actions}>
              <TouchableOpacity
                style={[
                  isLeave ? s.btnLeave : s.btnDelete,
                  loading && { opacity: 0.55 },
                ]}
                onPress={onConfirm}
                disabled={loading}
                activeOpacity={0.82}
              >
                {loading ? (
                  <ActivityIndicator color={isLeave ? amber : '#E87070'} />
                ) : (
                  <Text style={isLeave ? s.btnLeaveText : s.btnDeleteText}>{confirmLabel}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={s.btnCancel}
                onPress={() => dismiss()}
                disabled={loading}
                activeOpacity={0.82}
              >
                <Text style={s.btnCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </Modal>
  );
}
