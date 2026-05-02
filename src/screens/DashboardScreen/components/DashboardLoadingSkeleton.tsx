import React, {useEffect, useRef, useMemo} from "react";
import { Animated, ScrollView, StyleSheet, View } from "react-native";
import { useThemeColors, radius, type ThemeColors } from "../../../theme";

type Props = {
  insetTop: number;
  screenWidth: number;
};

export function DashboardLoadingSkeleton({
  insetTop,
  screenWidth,
}: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createDashboardloadingskeletonStyles(colors), [colors]);

  function SkeletonBlock({
    width,
    height,
    style,
  }: {
    width: number | string;
    height: number;
    style?: any;
  }) {
    return <View style={[styles.block, { width, height }, style]} />;
  }

  function ScheduleSkeletonCard() {
    return (
      <View style={styles.scheduleCard}>
        <View style={styles.timeCol}>
          <SkeletonBlock width={56} height={24} />
          <SkeletonBlock width={28} height={12} style={{ marginTop: 6 }} />
        </View>
        <View style={styles.vDivider} />
        <View style={{ flex: 1 }}>
          <SkeletonBlock width="58%" height={22} />
          <SkeletonBlock width="72%" height={13} style={{ marginTop: 10 }} />
          <SkeletonBlock width={92} height={12} style={{ marginTop: 12 }} />
        </View>
      </View>
    );
  }

  function ActiveSkeletonCard() {
    return (
      <View style={styles.activeCard}>
        <View style={styles.activeTopRow}>
          <View style={styles.emojiStack}>
            <SkeletonBlock width={36} height={36} style={styles.emojiBubble} />
            <SkeletonBlock
              width={36}
              height={36}
              style={[styles.emojiBubble, styles.emojiBubbleOffset]}
            />
          </View>
          <View style={{ flex: 1 }}>
            <SkeletonBlock width="48%" height={18} />
            <SkeletonBlock width="42%" height={14} style={{ marginTop: 10 }} />
          </View>
          <SkeletonBlock width={18} height={18} style={{ borderRadius: 9 }} />
        </View>
        <SkeletonBlock width="100%" height={6} style={styles.progressTrack} />
      </View>
    );
  }

  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.safe, { opacity }]}>
      <View style={{ height: insetTop, backgroundColor: colors.greenDeep }} />
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <SkeletonBlock width={96} height={30} />
          <View style={styles.headerStatsRight}>
            <View style={styles.headerStat}>
              <SkeletonBlock width={58} height={22} />
              <SkeletonBlock width={82} height={12} style={{ marginTop: 6 }} />
            </View>
            <View style={styles.headerStat}>
              <SkeletonBlock width={58} height={22} />
              <SkeletonBlock width={52} height={12} style={{ marginTop: 6 }} />
            </View>
          </View>
        </View>

        <View style={styles.tabsWrap}>
          <View style={styles.tabColumn}>
            <View style={styles.tabRow}>
              <SkeletonBlock width={72} height={16} />
              <SkeletonBlock width={20} height={18} style={styles.badge} />
            </View>
            <SkeletonBlock width={74} height={2} style={styles.tabLine} />
          </View>

          <View style={styles.tabColumn}>
            <View style={styles.tabRow}>
              <SkeletonBlock width={74} height={16} />
              <SkeletonBlock width={20} height={18} style={styles.badge} />
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ width: screenWidth, flex: 1 }}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}>
        <SkeletonBlock width={138} height={11} style={{ marginBottom: 6 }} />
        <ActiveSkeletonCard />
        <SkeletonBlock width={126} height={11} style={{ marginTop: 8, marginBottom: 2 }} />
        <ScheduleSkeletonCard />
        <ScheduleSkeletonCard />
        <SkeletonBlock width={94} height={11} style={{ marginTop: 8, marginBottom: 2 }} />
        <ScheduleSkeletonCard />
      </ScrollView>
    </Animated.View>
  );
}

function createDashboardloadingskeletonStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    backgroundColor: colors.greenDeep,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 0,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerStatsRight: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 20,
  },
  headerStat: {
    alignItems: "flex-end",
  },
  tabsWrap: {
    flexDirection: "row",
    gap: 24,
  },
  tabColumn: {
    paddingTop: 11,
    paddingBottom: 11,
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badge: {
    borderRadius: 9,
  },
  tabLine: {
    marginTop: 9,
    borderRadius: 1,
  },
  body: {
    padding: 14,
    paddingBottom: 100,
    gap: 12,
  },
  block: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
  },
  activeCard: {
    backgroundColor: colors.greenDeep,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.greenBorder,
  },
  activeTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  emojiStack: {
    width: 52,
    height: 42,
    position: "relative",
  },
  emojiBubble: {
    position: "absolute",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  emojiBubbleOffset: {
    left: 16,
    top: 6,
  },
  progressTrack: {
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  scheduleCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "stretch",
    gap: 16,
  },
  timeCol: {
    width: 58,
    alignItems: "flex-start",
  },
  vDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
});
}
