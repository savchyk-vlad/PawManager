import React, { useMemo } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Client, Dog, Walk } from "../../../types";
import { useThemeColors, type ThemeColors } from "../../../theme";
import { effectivePricePerWalk } from "../../../lib/walkMetrics";
import { formatClientAddressSingleLine, formatClientAddressMultiline } from "../../../lib/clientAddress";
import { ActiveWalkTopBar } from "./ActiveWalkTopBar";

type Props = {
  walk: Walk;
  client: Client;
  dogs: Dog[];
  isScheduled: boolean;
  isInProgress: boolean;
  elapsedLabel: string;
  scheduleWhen: string;
  isLateToStart: boolean;
  endTimeLabel: string;
  notesText: string;
  billingTotal: number;
  billingUsesPerDog: boolean;
  billingDogCount: number;
  walkPerDogMap: Record<string, number> | undefined;
  topInset: number;
  bottomInset: number;
  onBack: () => void;
  onEdit: () => void;
  onStartWalk: () => void;
  onFinishWalk: () => void;
  onOpenDog: (dogId: string) => void;
};

function parseElapsedSeconds(label: string): number {
  const parts = label.split(":");
  if (parts.length !== 2) return 0;
  const m = Number.parseInt(parts[0] ?? "0", 10);
  const s = Number.parseInt(parts[1] ?? "0", 10);
  if (!Number.isFinite(m) || !Number.isFinite(s)) return 0;
  return Math.max(0, m * 60 + s);
}

export function ActiveWalkMainView({
  walk,
  client,
  dogs,
  isScheduled,
  isInProgress,
  elapsedLabel,
  scheduleWhen,
  isLateToStart,
  endTimeLabel,
  notesText,
  billingTotal,
  billingUsesPerDog,
  billingDogCount,
  walkPerDogMap,
  topInset,
  bottomInset,
  onBack,
  onEdit,
  onStartWalk,
  onFinishWalk,
  onOpenDog,
}: Props) {
  const colors = useThemeColors();
  const s = useMemo(() => createActiveWalkMainViewStyles(colors), [colors]);

  function Card({
    title,
    children,
    last,
  }: {
    title: string;
    children: React.ReactNode;
    last?: boolean;
  }) {
    return (
      <View style={[s.card, last && s.cardLast]}>
        <View style={s.cardHead}>
          <Text style={s.cardHeadText}>{title}</Text>
        </View>
        {children}
      </View>
    );
  }

  function Row({
    label,
    value,
    empty,
    last,
  }: {
    label: string;
    value: string;
    empty?: boolean;
    last?: boolean;
  }) {
    return (
      <View style={[s.row, last && s.rowLast]}>
        <Text style={s.rl}>{label}</Text>
        <Text style={[s.rv, empty && s.rvEmpty]} numberOfLines={2}>
          {value}
        </Text>
      </View>
    );
  }

  const plannedSeconds = Math.max(1, walk.durationMinutes) * 60;
  const elapsedSeconds = isInProgress ? parseElapsedSeconds(elapsedLabel) : 0;
  const overtime = isInProgress && elapsedSeconds > plannedSeconds;
  const progressPct = isInProgress
    ? Math.min((elapsedSeconds / plannedSeconds) * 100, 100)
    : 0;

  const notesDisplay = useMemo(() => {
    const trimmed = notesText.trim();
    return trimmed.length > 0 ? trimmed : "No notes added…";
  }, [notesText]);

  return (
    <View style={[s.safe, { paddingTop: topInset }]}>
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: bottomInset + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <ActiveWalkTopBar isScheduled={isScheduled} onBack={onBack} onEdit={onEdit} />

        {isInProgress ? (
          <View style={s.timerSection}>
            <Text style={s.timer}>{elapsedLabel}</Text>
            <Text style={s.timerSub}>{walk.durationMinutes} min walk</Text>
            <View style={s.progressWrap}>
              <View
                style={[
                  s.progressBar,
                  {
                    width: `${progressPct}%`,
                    backgroundColor: overtime ? colors.redDefault : colors.greenDefault,
                  },
                ]}
              />
            </View>
          </View>
        ) : null}

        <View style={s.actions}>
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() =>
              client.phone &&
              Linking.openURL(`tel:${client.phone.replace(/[^0-9+]/g, "")}`)
            }
            activeOpacity={0.85}
          >
            <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
            <Text style={s.actionTxt}>Call Owner</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.actionBtn, !formatClientAddressSingleLine(client.address).trim() && { opacity: 0.45 }]}
            disabled={!formatClientAddressSingleLine(client.address).trim()}
            onPress={() => {
              const line = formatClientAddressSingleLine(client.address).trim();
              if (!line) return;
              const addr = encodeURIComponent(line);
              Linking.openURL(`maps://maps.google.com/maps?daddr=${addr}`);
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
            <Text style={s.actionTxt}>Navigate</Text>
          </TouchableOpacity>
        </View>

        {isScheduled && (
          <TouchableOpacity style={s.primaryBtn} onPress={onStartWalk} activeOpacity={0.85}>
            <Text style={s.primaryBtnText}>Start walk</Text>
          </TouchableOpacity>
        )}
        {isInProgress && (
          <TouchableOpacity style={s.primaryBtn} onPress={onFinishWalk} activeOpacity={0.85}>
            <Text style={s.primaryBtnText}>Finish walk</Text>
          </TouchableOpacity>
        )}

        <Card title="Schedule">
          <Row label="When" value={scheduleWhen} />
          <Row label="Planned duration" value={`${walk.durationMinutes} min`} last />
        </Card>

        {isScheduled && isLateToStart && (
          <View style={s.lateNotice}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.amberDefault} />
            <Text style={s.lateNoticeText}>
              Waiting to start. You can start before the window ends ({endTimeLabel}).
            </Text>
          </View>
        )}

        <Card title="Client information">
          <Row label="Name" value={client.name} />
          <Row
            label="Phone"
            value={client.phone.trim() || "—"}
            empty={!client.phone.trim()}
          />
          <Row
            label="Address"
            value={formatClientAddressMultiline(client.address).trim() || "—"}
            empty={!formatClientAddressSingleLine(client.address).trim()}
            last
          />
        </Card>

        <Card title="Dogs in this walk">
          {dogs.length > 0 ? (
            dogs.map((d, i) => (
              <TouchableOpacity
                key={d.id}
                style={[s.dogRow, i < dogs.length - 1 && s.dogRowBorder]}
                onPress={() => onOpenDog(d.id)}
                activeOpacity={0.75}
              >
                <View style={s.dogAvatar}>
                  <Text style={{ fontSize: 18 }}>{d.emoji}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.dogName} numberOfLines={1}>
                    {d.name}
                  </Text>
                  <Text style={s.dogBreed} numberOfLines={1}>
                    {d.breed || "Breed not provided"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={s.notesContent}>
              <Text style={s.rvEmpty}>—</Text>
            </View>
          )}
        </Card>

        <Card title="Notes">
          <View style={s.notesContent}>
            <Text style={[s.notesText, notesText.trim().length === 0 && s.notesTextEmpty]}>
              {notesDisplay}
            </Text>
          </View>
        </Card>

        <Card title="Total price" last>
          <View style={s.priceBlock}>
            <Text style={s.priceAmount}>
              ${billingTotal.toFixed(2)} <Text style={s.priceAmountSub}>total</Text>
            </Text>
            {billingUsesPerDog
              ? dogs.map((d) => (
                  <Text key={d.id} style={s.priceBreakdown}>
                    {d.name}: ${(walkPerDogMap?.[d.id] ?? client.pricePerWalk).toFixed(2)}
                  </Text>
                ))
              : (
                <Text style={s.priceBreakdown}>
                  ${effectivePricePerWalk(walk, client).toFixed(2)} × {billingDogCount} dog
                  {billingDogCount === 1 ? "" : "s"}
                </Text>
              )}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

function createActiveWalkMainViewStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingTop: 10 },

  timerSection: {
    paddingHorizontal: 24,
    paddingTop: 6,
    paddingBottom: 16,
    alignItems: "center",
  },
  timer: {
    fontSize: 58,
    fontWeight: "300",
    color: colors.text,
    letterSpacing: -3,
    fontVariant: ["tabular-nums"],
  },
  timerSub: { fontSize: 12, color: colors.textMuted, marginTop: 5 },
  progressWrap: {
    marginTop: 12,
    height: 3,
    width: "100%",
    maxWidth: 260,
    backgroundColor: colors.surface,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressBar: { height: 3, borderRadius: 999 },

  actions: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  actionBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    gap: 7,
  },
  actionTxt: { fontSize: 12, color: colors.textSecondary, fontWeight: "500" },

  primaryBtn: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 34,
    backgroundColor: colors.greenDeep,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.greenBorder,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnText: { fontSize: 15, fontWeight: "600", color: colors.greenText },

  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: "hidden",
  },
  cardLast: { marginBottom: 0 },
  cardHead: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: colors.surfaceHigh,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  cardHeadText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: colors.textMuted,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.05)",
    gap: 12,
  },
  rowLast: { borderBottomWidth: 0 },
  rl: { fontSize: 13, color: colors.textMuted },
  rv: { fontSize: 13, color: colors.text, fontWeight: "600", flexShrink: 1, textAlign: "right" },
  rvEmpty: { color: "#3e3e38", fontWeight: "400" },

  dogRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  dogRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255,255,255,0.05)" },
  dogAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceHigh,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dogName: { fontSize: 14, color: colors.text, fontWeight: "600" },
  dogBreed: { fontSize: 12, color: colors.textMuted, marginTop: 1 },

  notesContent: { paddingHorizontal: 14, paddingVertical: 12 },
  notesText: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  notesTextEmpty: { color: colors.textMuted, fontStyle: "italic" },

  priceBlock: { paddingHorizontal: 14, paddingVertical: 12 },
  priceAmount: { fontSize: 22, fontWeight: "700", color: colors.greenText, letterSpacing: -0.5 },
  priceAmountSub: { fontSize: 13, color: colors.textMuted, fontWeight: "400" },
  priceBreakdown: { fontSize: 12, color: colors.textMuted, marginTop: 3 },

  lateNotice: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(240,160,48,0.10)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(240,160,48,0.22)",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  lateNoticeText: { flex: 1, fontSize: 12, color: colors.textSecondary, lineHeight: 16 },
});
}
