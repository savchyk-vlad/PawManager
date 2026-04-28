import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  LayoutAnimation,
  UIManager,
  Dimensions,
} from "react-native";
import {
  isScheduledWalkPastEndTime,
  isWalkLateToStart,
} from "../../lib/missedWalksService";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  CompositeNavigationProp,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { differenceInMinutes, parseISO, isValid, isSameDay } from "date-fns";
import { useAppStore } from "../../store";
import { useAuthStore } from "../../store/authStore";
import { RootStackParamList, TabParamList } from "../../navigation";
import { Walk } from "../../types";
import {
  countUnpaidDoneWalkRecords,
  walkCharge,
} from "../../lib/walkMetrics";
import { FloatingActionButton } from "../../components/FloatingActionButton";
import { colors } from "../../theme";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardStats } from "./components/DashboardStats";
import { DashboardActions } from "./components/DashboardActions";
import { TodayWalksSection } from "./components/TodayWalksSection";
import { DashboardEmptyState } from "./components/DashboardEmptyState";
import { ScheduleCard } from "./components/ScheduleCard";
import { ActiveWalkCard } from "./components/ActiveWalkCard";
import { CompletedWalkCard } from "./components/CompletedWalkCard";
import { MissedAlertCard } from "./components/MissedAlertCard";
import { UpNextCard } from "./components/UpNextCard";

type HomeNav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, "Walks">,
  NativeStackNavigationProp<RootStackParamList>
>;

function parseWalkDate(iso: string | undefined): Date | null {
  if (!iso) return null;
  const t = parseISO(iso);
  return isValid(t) ? t : null;
}

/** True if this walk's scheduled time falls on the same local calendar day as `day`. */
function isWalkOnLocalDay(iso: string | undefined, day: Date) {
  const t = parseWalkDate(iso);
  if (!t) return false;
  return isSameDay(t, day);
}

/** Today's non-done walks: order by how close the scheduled time is to now (next / most recent first). */
function sortByClosestToNow(walks: Walk[], nowMs: number) {
  return [...walks].sort((a, b) => {
    const at = parseWalkDate(a.scheduledAt)?.getTime() ?? 0;
    const bt = parseWalkDate(b.scheduledAt)?.getTime() ?? 0;
    return Math.abs(at - nowMs) - Math.abs(bt - nowMs);
  });
}

/** Completed walks: newest finish first (then scheduled time as tie-break). */
function sortDoneWalksByFinishedAtDesc(walks: Walk[]) {
  return [...walks].sort((a, b) => {
    const fa = a.finishedAt ? new Date(a.finishedAt).getTime() : 0;
    const fb = b.finishedAt ? new Date(b.finishedAt).getTime() : 0;
    if (fb !== fa) return fb - fa;
    const sa = parseWalkDate(a.scheduledAt)?.getTime() ?? 0;
    const sb = parseWalkDate(b.scheduledAt)?.getTime() ?? 0;
    return sb - sa;
  });
}

const MAX_COMPLETED_PREVIEW = 5;
const SCREEN_W = Dimensions.get("window").width;

export default function DashboardScreen() {
  const navigation = useNavigation<HomeNav>();
  const { walks, clients, loadWalks, loadClients } = useAppStore();
  const { session } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"schedule" | "completed">(
    "schedule",
  );
  const [showAllCompleted, setShowAllCompleted] = useState(false);
  const pagerRef = useRef<ScrollView>(null);

  const switchTab = useCallback((tab: "schedule" | "completed") => {
    setActiveTab(tab);
    pagerRef.current?.scrollTo({
      x: tab === "completed" ? SCREEN_W : 0,
      animated: true,
    });
  }, []);

  const now = new Date();
  const nowMs = now.getTime();
  const userId = session?.user?.id;

  useFocusEffect(
    useCallback(() => {
      if (userId) void loadWalks(userId);
    }, [userId, loadWalks]),
  );

  const onRefresh = useCallback(async () => {
    if (!userId) return;
    setRefreshing(true);
    try {
      await Promise.all([loadWalks(userId), loadClients(userId)]);
    } finally {
      setRefreshing(false);
    }
  }, [userId, loadWalks, loadClients]);

  const todayWalks = walks
    .filter(
      (w) => isWalkOnLocalDay(w.scheduledAt, now) && w.status !== "cancelled",
    )
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  const earnedToday = todayWalks
    .filter((w) => w.status === "done")
    .reduce((sum, w) => {
      const c = clients.find((cl) => cl.id === w.clientId);
      return sum + walkCharge(w, c);
    }, 0);

  const unpaidDoneWalks = walks.filter(
    (w) => w.paymentStatus === "unpaid" && w.status === "done",
  );
  const totalUnpaid = unpaidDoneWalks.reduce((sum, w) => {
    const c = clients.find((cl) => cl.id === w.clientId);
    return sum + walkCharge(w, c);
  }, 0);
  const unpaidWalkCount = countUnpaidDoneWalkRecords(walks);

  // In-progress walks: own section (not under "Upcoming"); include all actives, not only "today" by schedule
  const activeWalks = walks
    .filter((w) => w.status === "in_progress")
    .sort((a, b) => (b.startedAt ?? "").localeCompare(a.startedAt ?? ""));

  // Scheduled today (overdue + upcoming)
  const scheduledToday = sortByClosestToNow(
    todayWalks.filter((w) => w.status === "scheduled"),
    nowMs,
  );
  const overdueWalks = scheduledToday.filter((w) => isWalkLateToStart(w));
  const upcomingToday = scheduledToday.filter(
    (w) => !isWalkLateToStart(w) && !isScheduledWalkPastEndTime(w),
  );
  const upNextWalks = upcomingToday.filter((w) => {
    const t = parseWalkDate(w.scheduledAt);
    if (!t) return false;
    const minsUntil = differenceInMinutes(t, now);
    return minsUntil >= 0 && minsUntil <= 30;
  });
  const upNextIds = new Set(upNextWalks.map((w) => w.id));
  const upcomingTodayRegular = upcomingToday.filter(
    (w) => !upNextIds.has(w.id),
  );

  const allUpcoming = upcomingTodayRegular;

  // Overdue-expired: scheduled walks whose entire window has passed
  const visibleMissed = walks
    .filter((w) => isScheduledWalkPastEndTime(w))
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));

  // Completed today
  const doneTodayWalks = sortDoneWalksByFinishedAtDesc(
    todayWalks.filter((w) => w.status === "done"),
  );
  const shownCompleted = showAllCompleted
    ? doneTodayWalks
    : doneTodayWalks.slice(0, MAX_COMPLETED_PREVIEW);
  const hiddenCount = doneTodayWalks.length - MAX_COMPLETED_PREVIEW;

  const toggleShowAllCompleted = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAllCompleted((v) => !v);
  }, []);

  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const insets = useSafeAreaInsets();

  return (
    <View style={s.safe}>
      <DashboardHeader insetTop={insets.top} styles={s}>
        <DashboardStats
          doneTodayCount={doneTodayWalks.length}
          earnedToday={earnedToday}
          totalUnpaid={totalUnpaid}
          unpaidWalkCount={unpaidWalkCount}
          onPressPayments={() => navigation.navigate("Payments")}
          styles={s}
        />

        <DashboardActions
          activeTab={activeTab}
          completedCount={doneTodayWalks.length}
          onSwitchTab={switchTab}
          styles={s}
        />
      </DashboardHeader>

      {/* Horizontal pager — swipe between Schedule and Completed */}
      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
        onMomentumScrollEnd={(e) => {
          const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
          setActiveTab(page === 0 ? "schedule" : "completed");
        }}>
        {/* Page 0 — Schedule */}
        <TodayWalksSection
          screenWidth={SCREEN_W}
          refreshing={refreshing}
          onRefresh={onRefresh}
          activeWalks={activeWalks}
          overdueWalks={overdueWalks}
          upNextWalks={upNextWalks}
          visibleMissed={visibleMissed}
          allUpcoming={allUpcoming}
          styles={s}
          renderActiveWalk={(walk) => <ActiveWalkCard walk={walk} />}
          renderScheduleWalk={(walk) => (
            <ScheduleCard key={walk.id} walk={walk} />
          )}
          renderUpNextWalk={(walk) => (
            <UpNextCard key={walk.id} walk={walk} parseWalkDate={parseWalkDate} />
          )}
          renderMissedAlert={(walks) => (
            <MissedAlertCard walks={walks} parseWalkDate={parseWalkDate} />
          )}
        />

        {/* Page 1 — Completed */}
        <ScrollView
          style={{ width: SCREEN_W }}
          contentContainerStyle={s.body}
          showsVerticalScrollIndicator={false}>
          {doneTodayWalks.length === 0 ? (
            <DashboardEmptyState
              title="Completed today"
              text="No completed walks today"
              styles={s}
            />
          ) : (
            <>
              <Text style={s.sectionLabel}>
                Today's walks · {doneTodayWalks.length} completed
              </Text>
              <View style={s.completedCardsStack}>
                {shownCompleted.map((w) => (
                  <CompletedWalkCard key={w.id} walk={w} parseWalkDate={parseWalkDate} />
                ))}
              </View>

              {hiddenCount > 0 && (
                <TouchableOpacity
                  style={s.completedExpandRow}
                  onPress={toggleShowAllCompleted}
                  activeOpacity={0.78}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: showAllCompleted }}
                  accessibilityLabel={
                    showAllCompleted
                      ? "Collapse completed walks list"
                      : `Show ${hiddenCount} more completed walks`
                  }>
                  <Text style={s.completedExpandText}>
                    {showAllCompleted
                      ? "Show less"
                      : `Show ${hiddenCount} more walk${hiddenCount !== 1 ? "s" : ""}`}
                  </Text>
                  <Ionicons
                    name={showAllCompleted ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={colors.greenText}
                  />
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>
      </ScrollView>

      <FloatingActionButton
        label="Add walk"
        onPress={() => navigation.navigate("AddWalk")}
      />
    </View>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  header: {
    backgroundColor: colors.greenDeep,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 0,
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 20,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.greenDeep,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(91,175,114,0.2)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  statNum: { fontSize: 20, fontWeight: "600", color: colors.text },
  statLbl: { fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 },

  activeWalksList: {
    gap: 12,
  },
  activeWalkItem: {
    width: "100%",
  },

  tabsWrap: {
    flexDirection: "row",
    backgroundColor: colors.greenDeep,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  tab: {
    paddingTop: 2,
    paddingBottom: 11,
    marginRight: 20,
    position: "relative",
  },
  tabText: { fontSize: 13, fontWeight: "500", color: "rgba(255,255,255,0.4)" },
  tabTextActive: { color: colors.greenText },
  tabLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.greenText,
  },
  tabBadge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tabBadgeActive: { backgroundColor: "rgba(107,191,122,0.15)" },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.4)",
  },
  tabBadgeTextActive: { color: colors.greenText },

  // Body
  body: {
    backgroundColor: colors.bg,
    padding: 14,
    paddingBottom: 100,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.07 * 11,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.35)",
    marginBottom: 2,
  },

  completedCardsStack: {
    gap: 12,
    marginTop: 8,
  },
  completedExpandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(110,222,160,0.18)",
  },
  completedExpandText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.greenText,
  },
});
