import React, {useEffect, useRef, useMemo} from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { format, isSameDay, parseISO } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { isScheduledWalkPastEndTime, isWalkLateToStart } from "../../../lib/missedWalksService";
import { WalkListCard } from "../../../components/WalkListCard";
import { Walk, Client } from "../../../types";
import { useThemeColors, type ThemeColors } from "../../../theme";

type Props = {
  selectedDate: Date | null;
  screenW: number;
  carouselDays: Date[];
  walks: Walk[];
  clients: Client[];
  openHours: Record<string, boolean>;
  onToggleHour: (hourLabel: string) => void;
  onMoveSelectedDay: (delta: -1 | 1) => void;
  getDogsText: (walk: Walk) => string;
  onWalkPress: (walk: Walk) => void;
};

export function ScheduleDayCarouselSection({
  selectedDate,
  screenW,
  carouselDays,
  walks,
  clients,
  openHours,
  onToggleHour,
  onMoveSelectedDay,
  getDogsText,
  onWalkPress,
}: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createScheduledaycarouselsectionStyles(colors), [colors]);
  const dayCarouselRef = useRef<ScrollView>(null);
  const isSwipeLockedRef = useRef(false);

  useEffect(() => {
    dayCarouselRef.current?.scrollTo({ x: screenW, animated: false });
  }, [screenW, selectedDate, carouselDays[1]?.getTime()]);

  const statusUi = (walk: Walk) => {
    const missed = walk.status === "scheduled" && isScheduledWalkPastEndTime(walk);
    const overdue = walk.status === "scheduled" && isWalkLateToStart(walk);
    if (walk.status === "done") return { label: "Done", pill: styles.statusDone, avatar: styles.avatarGreen };
    if (walk.status === "in_progress") return { label: "Active", pill: styles.statusActive, avatar: styles.avatarGreen };
    if (walk.status === "cancelled") return { label: "Canceled", pill: styles.statusCanceled, avatar: styles.avatarAmber };
    if (missed) return { label: "Missed", pill: styles.statusMissed, avatar: styles.avatarAmber };
    if (overdue) return { label: "Waiting", pill: styles.statusUpcoming, avatar: styles.avatarAmber };
    return { label: "Upcoming", pill: styles.statusUpcoming, avatar: styles.avatarAmber };
  };

  if (selectedDate == null) {
    return (
      <View style={styles.walksCarouselWrap}>
        <ScrollView contentContainerStyle={styles.walksContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.dayLabel}>Select a day</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>Tap a day to see walks</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.walksCarouselWrap}>
      <ScrollView
        ref={dayCarouselRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScrollBeginDrag={() => {
          if (isSwipeLockedRef.current) {
            dayCarouselRef.current?.scrollTo({ x: screenW, animated: false });
          }
        }}
        onMomentumScrollBegin={() => {
          isSwipeLockedRef.current = true;
        }}
        onMomentumScrollEnd={(e) => {
          if (!isSwipeLockedRef.current) return;
          const page = Math.round(e.nativeEvent.contentOffset.x / screenW);
          if (page === 0) onMoveSelectedDay(-1);
          if (page === 2) onMoveSelectedDay(1);
          requestAnimationFrame(() => {
            dayCarouselRef.current?.scrollTo({ x: screenW, animated: false });
            isSwipeLockedRef.current = false;
          });
        }}>
        {carouselDays.map((day) => {
          const dayWalks = walks
            .filter((w) => isSameDay(parseISO(w.scheduledAt), day))
            .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
          const dayGroups = (() => {
            const groups = new Map<string, Walk[]>();
            dayWalks.forEach((walk) => {
              const d = parseISO(walk.scheduledAt);
              const key = format(d, "h:mm a");
              const existing = groups.get(key) ?? [];
              existing.push(walk);
              groups.set(key, existing);
            });
            return Array.from(groups.entries()).map(([hourLabel, walksInHour]) => ({
              hourLabel,
              walks: walksInHour,
            }));
          })();
          const statusRank: Record<Walk["status"], number> = {
            in_progress: 0,
            scheduled: 1,
            done: 2,
            cancelled: 3,
          };

          return (
            <ScrollView
              key={format(day, "yyyy-MM-dd")}
              style={{ width: screenW }}
              contentContainerStyle={styles.walksContent}
              showsVerticalScrollIndicator={false}>
              <Text style={styles.dayLabel}>{format(day, "EEEE · MMM d")}</Text>
              {dayWalks.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>🐾</Text>
                  <Text style={styles.emptyText}>No walks scheduled</Text>
                </View>
              ) : (
                <View style={styles.accordion}>
                  {dayGroups.map((group, i) => {
                    const open = !!openHours[group.hourLabel];
                    const groupedWalks = [...group.walks].sort((a, b) => {
                      const sr = statusRank[a.status] - statusRank[b.status];
                      if (sr !== 0) return sr;
                      return a.scheduledAt.localeCompare(b.scheduledAt);
                    });
                    const byStatus = {
                      in_progress: groupedWalks.filter((w) => w.status === "in_progress"),
                      missed: groupedWalks.filter((w) => w.status === "scheduled" && isScheduledWalkPastEndTime(w)),
                      scheduled: groupedWalks.filter((w) => w.status === "scheduled" && !isScheduledWalkPastEndTime(w)),
                      done: groupedWalks.filter((w) => w.status === "done"),
                      cancelled: groupedWalks.filter((w) => w.status === "cancelled"),
                    };
                    const statusBadges = [
                      byStatus.in_progress.length > 0 ? { key: "in_progress", label: "Active", style: styles.statusBadgeActive } : null,
                      byStatus.scheduled.length > 0 ? { key: "scheduled", label: "Scheduled", style: styles.statusBadgeScheduled } : null,
                      byStatus.missed.length > 0 ? { key: "missed", label: "Missed", style: styles.statusBadgeMissed } : null,
                      byStatus.done.length > 0 ? { key: "done", label: "Done", style: styles.statusBadgeDone } : null,
                      byStatus.cancelled.length > 0 ? { key: "cancelled", label: "Canceled", style: styles.statusBadgeCanceled } : null,
                    ].filter(Boolean) as Array<{ key: string; label: string; style: object }>;
                    const statusSections = [
                      { key: "in_progress", title: "Active", walks: byStatus.in_progress },
                      { key: "scheduled", title: "Scheduled", walks: byStatus.scheduled },
                      { key: "missed", title: "Missed", walks: byStatus.missed },
                      { key: "done", title: "Done", walks: byStatus.done },
                      { key: "cancelled", title: "Canceled", walks: byStatus.cancelled },
                    ].filter((s) => s.walks.length > 0);
                    return (
                      <View key={group.hourLabel}>
                        <TouchableOpacity
                          style={[styles.accHour, i === dayGroups.length - 1 && !open && styles.accHourLast]}
                          activeOpacity={0.85}
                          onPress={() => onToggleHour(group.hourLabel)}>
                          <View style={styles.hourLeft}>
                            <Text style={styles.hourTime}>{group.hourLabel}</Text>
                            <View style={styles.hourStatusBadgesRow}>
                              {statusBadges.map((badge) => (
                                <View key={badge.key} style={[styles.statusBadge, badge.style]}>
                                  <Text style={styles.statusBadgeText}>{badge.label}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                          <View style={styles.hourRight}>
                            <Text style={styles.hourCountText}>
                              {group.walks.length} walk{group.walks.length === 1 ? "" : "s"}
                            </Text>
                            <Ionicons
                              name="chevron-down"
                              size={14}
                              color={colors.textMuted}
                              style={[styles.chevronIcon, open && styles.chevronOpen]}
                            />
                          </View>
                        </TouchableOpacity>
                        {open && (
                          <View style={styles.hourBody}>
                            {statusSections.map((section, si) => (
                              <View key={section.key}>
                                <View style={styles.statusSectionHeader}>
                                  <Text style={styles.statusSectionTitle}>{section.title}</Text>
                                  <Text style={styles.statusSectionCount}>{section.walks.length}</Text>
                                </View>
                                {section.walks.map((walk) => {
                                  const client = clients.find((c) => c.id === walk.clientId);
                                  const dogs = getDogsText(walk);
                                  const ui = statusUi(walk);
                                  return (
                                    <WalkListCard
                                      key={walk.id}
                                      title={dogs}
                                      meta={`${format(parseISO(walk.scheduledAt), "h:mm a")} · ${walk.durationMinutes} min · ${client?.name ?? "Client"}`}
                                      initials={dogs
                                        .split(" ")
                                        .map((x) => x[0])
                                        .join("")
                                        .slice(0, 2)
                                        .toUpperCase()}
                                      statusLabel={ui.label}
                                      avatarStyle={ui.avatar}
                                      statusStyle={ui.pill}
                                      isLast
                                      onPress={() => onWalkPress(walk)}
                                    />
                                  );
                                })}
                                {si < statusSections.length - 1 && <View style={styles.statusSectionDivider} />}
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          );
        })}
      </ScrollView>
    </View>
  );
}

function createScheduledaycarouselsectionStyles(colors: ThemeColors) {
  return StyleSheet.create({
  walksCarouselWrap: { flex: 1 },
  walksContent: { paddingHorizontal: 10, paddingBottom: 14 },
  dayLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  accordion: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: "hidden",
  },
  accHour: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.05)",
    backgroundColor: colors.surfaceHigh,
  },
  accHourLast: { borderBottomWidth: 0 },
  hourLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  hourTime: { minWidth: 62, fontSize: 12, fontWeight: "600", color: colors.text },
  hourStatusBadgesRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap", flex: 1 },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.10)",
  },
  statusBadgeText: { fontSize: 10, fontWeight: "800", color: colors.text },
  statusBadgeActive: { backgroundColor: colors.greenDeep },
  statusBadgeScheduled: { backgroundColor: "rgba(240,160,48,0.22)" },
  statusBadgeMissed: { backgroundColor: "rgba(255,255,255,0.10)" },
  statusBadgeDone: { backgroundColor: "rgba(61,124,71,0.20)" },
  statusBadgeCanceled: { backgroundColor: "rgba(224,64,64,0.18)" },
  hourRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  hourCountText: { fontSize: 11, color: colors.textSecondary, fontWeight: "500" },
  chevronIcon: {},
  chevronOpen: { transform: [{ rotate: "180deg" }] },
  hourBody: {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.05)",
    paddingVertical: 4,
  },
  statusSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 4,
  },
  statusSectionTitle: { fontSize: 10, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase" },
  statusSectionCount: { fontSize: 10, fontWeight: "700", color: colors.textMuted },
  statusSectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginHorizontal: 14,
    marginTop: 4,
  },
  avatarGreen: { backgroundColor: colors.greenDeep, borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(126,203,90,0.2)" },
  avatarAmber: { backgroundColor: colors.amberDeep, borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(240,160,48,0.2)" },
  statusDone: { backgroundColor: colors.greenDeep, color: colors.greenDefault },
  statusUpcoming: { backgroundColor: colors.amberDeep, color: colors.amberText },
  statusMissed: { backgroundColor: colors.surfaceHigh, color: colors.textMuted },
  statusActive: { backgroundColor: colors.greenDeep, color: colors.greenText },
  statusCanceled: { backgroundColor: colors.redDeep, color: colors.redText },
  emptyState: { alignItems: "center", paddingVertical: 32 },
  emptyIcon: { fontSize: 28, marginBottom: 8, opacity: 0.35 },
  emptyText: { fontSize: 13, color: colors.textMuted },
});
}
