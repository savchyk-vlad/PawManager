import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { format, isValid, parseISO } from "date-fns";
import { enUS } from "date-fns/locale";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme";
import { Walk } from "../types";
import { findOverlappingWalk } from "../lib/schedulingOverlap";

type Props = {
  valueIso: string;
  onChange: (iso: string) => void;
  onOpen?: () => void;
  walks?: Walk[];
  durationMinutes?: number;
  excludeWalkId?: string;
  getConflictLabel?: (walk: Walk) => { title: string; subtitle?: string };
  getConflictDetails?: (walk: Walk) => {
    client?: string;
    dogs?: Array<{ emoji?: string; name: string }>;
  };
};

const ROW_H = 36;
const WHEEL_VIEW_H = ROW_H * 5;
const WHEEL_PAD = ROW_H * 2;

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const AMPM = ["AM", "PM"] as const;

function safeDateFromIso(iso: string): Date {
  if (!iso?.trim()) return new Date();
  const d = parseISO(iso);
  return isValid(d) ? d : new Date();
}

/** Keep calendar day from `baseIso`, replace clock from `picked`. */
export function mergeTimeIntoIso(baseIso: string, picked: Date): string {
  const base = safeDateFromIso(baseIso);
  const next = new Date(base);
  next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
  return next.toISOString();
}

function to24h(h12: number, ap: 0 | 1): number {
  if (ap === 0) return h12 === 12 ? 0 : h12;
  return h12 === 12 ? 12 : h12 + 12;
}

function fromDateToParts(d: Date): {
  hIdx: number;
  mIdx: number;
  apIdx: 0 | 1;
} {
  const h24 = d.getHours();
  const apIdx = (h24 >= 12 ? 1 : 0) as 0 | 1;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const hIdx = HOURS.indexOf(h12 as (typeof HOURS)[number]);
  return {
    hIdx: hIdx >= 0 ? hIdx : 0,
    mIdx: d.getMinutes(),
    apIdx,
  };
}

function partsToDate(
  baseIso: string,
  hIdx: number,
  mIdx: number,
  apIdx: 0 | 1,
): Date {
  const h12 = HOURS[Math.max(0, Math.min(HOURS.length - 1, hIdx))]!;
  const minute = MINUTES[Math.max(0, Math.min(59, mIdx))]!;
  const base = safeDateFromIso(baseIso);
  const d = new Date(base);
  d.setHours(to24h(h12, apIdx), minute, 0, 0);
  return d;
}

type ColProps = {
  labels: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  modalVisible: boolean;
};

function WheelColumn({
  labels,
  selectedIndex,
  onChange,
  modalVisible,
}: ColProps) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!modalVisible) return;
    const y = selectedIndex * ROW_H;
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y, animated: false });
    });
  }, [modalVisible, selectedIndex]);

  return (
    <ScrollView
      ref={scrollRef}
      style={wheel.col}
      contentContainerStyle={wheel.colContent}
      showsVerticalScrollIndicator={false}
      snapToInterval={ROW_H}
      decelerationRate="normal"
      onMomentumScrollEnd={(e) => {
        const y = e.nativeEvent.contentOffset.y;
        let idx = Math.round(y / ROW_H);
        idx = Math.max(0, Math.min(labels.length - 1, idx));
        if (idx !== selectedIndex) onChange(idx);
      }}>
      {labels.map((label, i) => {
        const dist = Math.abs(i - selectedIndex);
        const style = dist === 0 ? wheel.selected : wheel.text;
        return (
          <View key={i} style={wheel.cell}>
            <Text style={style} numberOfLines={1}>
              {label}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

export function WalkTimePicker({
  valueIso,
  onChange,
  onOpen,
  walks,
  durationMinutes,
  excludeWalkId,
  getConflictLabel,
  getConflictDetails,
}: Props) {
  const displayDate = useMemo(() => safeDateFromIso(valueIso), [valueIso]);
  const label = format(displayDate, "h:mm a", { locale: enUS });

  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [pending, setPending] = useState(displayDate);

  useEffect(() => {
    if (!modalVisible) return;
    setPending(displayDate);
  }, [modalVisible, displayDate]);

  const parts = useMemo(() => fromDateToParts(pending), [pending]);

  const hourLabels = useMemo(() => HOURS.map(String), []);
  const minuteLabels = useMemo(
    () => MINUTES.map((m) => String(m).padStart(2, "0")),
    [],
  );
  const ampmLabels = useMemo(() => [...AMPM], []);

  const setH = useCallback(
    (hIdx: number) =>
      setPending((p) => {
        const pr = fromDateToParts(p);
        return partsToDate(valueIso, hIdx, pr.mIdx, pr.apIdx);
      }),
    [valueIso],
  );
  const setM = useCallback(
    (mIdx: number) =>
      setPending((p) => {
        const pr = fromDateToParts(p);
        return partsToDate(valueIso, pr.hIdx, mIdx, pr.apIdx);
      }),
    [valueIso],
  );
  const setAp = useCallback(
    (apIdx: 0 | 1) =>
      setPending((p) => {
        const pr = fromDateToParts(p);
        return partsToDate(valueIso, pr.hIdx, pr.mIdx, apIdx);
      }),
    [valueIso],
  );

  const commitInstant = useCallback(
    (iso: string) => {
      onChange(iso);
      onOpen?.();
    },
    [onChange, onOpen],
  );

  const openModal = useCallback(() => {
    onOpen?.();
    setModalVisible(true);
  }, [onOpen]);

  const closeModal = useCallback(() => setModalVisible(false), []);

  const confirmModal = useCallback(() => {
    commitInstant(mergeTimeIntoIso(valueIso, pending));
    setModalVisible(false);
  }, [commitInstant, valueIso, pending]);

  const pendingIso = useMemo(
    () => mergeTimeIntoIso(valueIso, pending),
    [valueIso, pending],
  );
  const conflict = useMemo(() => {
    if (!walks || !durationMinutes) return null;
    return findOverlappingWalk({
      walks,
      startIso: pendingIso,
      durationMinutes,
      excludeWalkId,
    });
  }, [walks, durationMinutes, pendingIso, excludeWalkId]);
  const conflictLabel = useMemo(() => {
    if (!conflict) return null;
    if (getConflictLabel) return getConflictLabel(conflict);
    const when = safeDateFromIso(conflict.scheduledAt);
    const title = "This time is already taken";
    const subtitle = `${format(when, "h:mm a", { locale: enUS })} · ${conflict.durationMinutes} min`;
    return { title, subtitle };
  }, [conflict, getConflictLabel]);

  const conflictDetails = useMemo(() => {
    if (!conflict || !getConflictDetails) return null;
    return getConflictDetails(conflict);
  }, [conflict, getConflictDetails]);

  const doneDisabled = Boolean(conflict);

  return (
    <View style={s.wrap}>
      <TouchableOpacity
        style={s.trigger}
        onPress={openModal}
        activeOpacity={0.7}>
        <Text style={s.triggerLabel}>Pick time</Text>
        <View style={s.triggerValueRow}>
          <Text style={s.triggerValue}>{label}</Text>
          <Ionicons
            name="time-outline"
            size={20}
            color={colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={closeModal}>
        <View
          style={[
            s.modalRoot,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
          ]}>
          <Pressable style={s.backdropFill} onPress={closeModal} />

          <View style={s.outerFrame}>
            <View style={s.dialog}>
              <Text style={s.modalTitle}>Pick time</Text>

              {conflictLabel && (
                <View style={s.conflictWrap}>
                  <View style={s.conflictTitleWrap}>
                    <Text style={s.conflictTitle}>{conflictLabel.title}</Text>
                  </View>
                  {conflictDetails ? (
                    <View style={s.conflictInfoCard}>
                      <View style={s.conflictGrid}>
                      {conflictDetails.client ? (
                        <View style={s.conflictRow}>
                          <Text style={s.conflictKey}>Client</Text>
                          <Text style={s.conflictVal} numberOfLines={1}>
                            {conflictDetails.client}
                          </Text>
                        </View>
                      ) : null}
                      {conflictDetails.dogs && conflictDetails.dogs.length > 0 ? (
                        <View style={s.conflictRow}>
                          <Text style={s.conflictKey}>
                            {conflictDetails.dogs.length > 1 ? "Dogs" : "Dog"}
                          </Text>
                          <View style={s.conflictDogsVal}>
                            {conflictDetails.dogs.slice(0, 3).map((d, i) => (
                              <View key={`${d.name}-${i}`} style={s.conflictDogChip}>
                                {d.emoji ? (
                                  <Text style={s.conflictDogEmoji}>{d.emoji}</Text>
                                ) : null}
                                <Text style={s.conflictDogName} numberOfLines={1}>
                                  {d.name}
                                </Text>
                              </View>
                            ))}
                            {conflictDetails.dogs.length > 3 ? (
                              <Text style={s.conflictDogMore}>
                                +{conflictDetails.dogs.length - 3}
                              </Text>
                            ) : null}
                          </View>
                        </View>
                      ) : null}
                      {conflict ? (
                        <>
                          <View style={s.conflictRow}>
                            <Text style={s.conflictKey}>Scheduled</Text>
                            <Text style={s.conflictVal} numberOfLines={1}>
                              {format(safeDateFromIso(conflict.scheduledAt), "h:mm a", { locale: enUS })}
                            </Text>
                          </View>
                          <View style={s.conflictRow}>
                            <Text style={s.conflictKey}>Duration</Text>
                            <Text style={s.conflictVal} numberOfLines={1}>
                              {conflict.durationMinutes} min
                            </Text>
                          </View>
                        </>
                      ) : null}
                      </View>
                    </View>
                  ) : conflictLabel.subtitle ? (
                    <View style={s.conflictInfoCard}>
                      <Text style={s.conflictSubtitle}>{conflictLabel.subtitle}</Text>
                    </View>
                  ) : null}
                </View>
              )}

              <View style={s.pickerWrap}>
                <View style={s.pickerStage}>
                  <View
                    style={[
                      s.pickerHighlight,
                      { top: (WHEEL_VIEW_H - 44) / 2 },
                    ]}
                    pointerEvents="none"
                  />
                  <View style={s.pickerCols}>
                    <WheelColumn
                      labels={hourLabels}
                      selectedIndex={parts.hIdx}
                      onChange={setH}
                      modalVisible={modalVisible}
                    />
                    <Text style={s.psep}>:</Text>
                    <WheelColumn
                      labels={minuteLabels}
                      selectedIndex={parts.mIdx}
                      onChange={setM}
                      modalVisible={modalVisible}
                    />
                    <WheelColumn
                      labels={ampmLabels}
                      selectedIndex={parts.apIdx}
                      onChange={(i) => setAp(i as 0 | 1)}
                      modalVisible={modalVisible}
                    />
                  </View>
                </View>
              </View>

              <View style={s.actions}>
                <TouchableOpacity
                  style={s.btnSecondary}
                  onPress={closeModal}
                  activeOpacity={0.85}>
                  <Text style={s.btnSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.btnPrimary, doneDisabled && { opacity: 0.45 }]}
                  onPress={confirmModal}
                  activeOpacity={0.88}
                  disabled={doneDisabled}>
                  <Text style={s.btnPrimaryText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const wheel = StyleSheet.create({
  col: {
    flex: 1,
    height: WHEEL_VIEW_H,
    maxWidth: 88,
  },
  colContent: {
    paddingVertical: WHEEL_PAD,
  },
  cell: {
    height: ROW_H,
    justifyContent: "center",
    alignItems: "center",
  },
  selected: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.greenDefault,
  },
  text: {
    fontSize: 15,
    fontWeight: "400",
    color: colors.textMuted,
  },
});

const s = StyleSheet.create({
  wrap: { marginBottom: 12 },
  modalRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backdropFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  outerFrame: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: "rgba(14,14,12,0.55)",
    zIndex: 1,
  },
  dialog: {
    width: "100%",
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
    paddingTop: 16,
    paddingBottom: 16,
  },
  conflictWrap: {
    marginTop: 10,
    marginHorizontal: 14,
    marginBottom: 2,
    borderRadius: 12,
  },
  conflictTitleWrap: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.greenDeep,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(92, 175, 114, 0.35)",
  },
  conflictTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.greenDefault,
  },
  conflictSubtitle: {
    fontSize: 12,
    fontWeight: "400",
    color: colors.textSecondary,
  },
  conflictInfoCard: {
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  conflictGrid: {
    gap: 8,
  },
  conflictRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  conflictKey: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  conflictVal: {
    flexShrink: 1,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
    textAlign: "right",
  },
  conflictDogsVal: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  conflictDogChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.10)",
    maxWidth: 160,
  },
  conflictDogEmoji: { fontSize: 12 },
  conflictDogName: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  conflictDogMore: { fontSize: 12, color: colors.textMuted, fontWeight: "600" },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.3,
    textAlign: "center",
    paddingHorizontal: 18,
  },
  modalHint: {
    textAlign: "center",
    fontSize: 11,
    color: colors.textMuted,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  pickerWrap: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  pickerStage: {
    height: WHEEL_VIEW_H,
    position: "relative",
  },
  pickerHighlight: {
    position: "absolute",
    left: 14,
    right: 14,
    height: 44,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    zIndex: 0,
  },
  pickerCols: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: WHEEL_VIEW_H,
    zIndex: 1,
  },
  psep: {
    fontSize: 20,
    fontWeight: "500",
    color: colors.greenDefault,
    flexShrink: 0,
    paddingBottom: 2,
    marginHorizontal: -4,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  triggerLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },
  triggerValueRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  triggerValue: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 18,
    marginTop: 6,
  },
  btnSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  btnSecondaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  btnPrimary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: colors.greenDeep,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.greenBorder,
  },
  btnPrimaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.greenText,
  },
});
