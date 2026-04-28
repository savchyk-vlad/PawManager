import React from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { Walk } from "../../../types";
import { colors } from "../../../theme";
import { DashboardEmptyState } from "./DashboardEmptyState";

type Props = {
  screenWidth: number;
  refreshing: boolean;
  onRefresh: () => void;
  activeWalks: Walk[];
  overdueWalks: Walk[];
  upNextWalks: Walk[];
  visibleMissed: Walk[];
  allUpcoming: Walk[];
  styles: any;
  renderActiveWalk: (walk: Walk) => React.ReactNode;
  renderScheduleWalk: (walk: Walk) => React.ReactNode;
  renderUpNextWalk: (walk: Walk) => React.ReactNode;
  renderMissedAlert: (walks: Walk[]) => React.ReactNode;
};

export function TodayWalksSection({
  screenWidth,
  refreshing,
  onRefresh,
  activeWalks,
  overdueWalks,
  upNextWalks,
  visibleMissed,
  allUpcoming,
  styles,
  renderActiveWalk,
  renderScheduleWalk,
  renderUpNextWalk,
  renderMissedAlert,
}: Props) {
  return (
    <ScrollView
      style={{ width: screenWidth }}
      contentContainerStyle={styles.body}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.greenText}
          colors={[colors.greenText]}
          progressBackgroundColor={colors.surface}
        />
      }>
      {activeWalks.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>
            {activeWalks.length === 1 ? "Active walk" : "Active walks"}
          </Text>
          <View style={styles.activeWalksList}>
            {activeWalks.map((w) => (
              <View key={w.id} style={styles.activeWalkItem}>
                {renderActiveWalk(w)}
              </View>
            ))}
          </View>
        </>
      )}

      {overdueWalks.length > 0 && (
        <>
          <Text style={[styles.sectionLabel, activeWalks.length > 0 && { marginTop: 4 }]}>
            Overdue
          </Text>
          {overdueWalks.map((w) => renderScheduleWalk(w))}
        </>
      )}

      {upNextWalks.length > 0 && (
        <>
          <Text
            style={[
              styles.sectionLabel,
              (activeWalks.length > 0 || overdueWalks.length > 0) && { marginTop: 4 },
            ]}>
            Up next (30 min)
          </Text>
          {upNextWalks.map((w) => renderUpNextWalk(w))}
        </>
      )}

      {visibleMissed.length > 0 && (
        <>
          <Text
            style={[
              styles.sectionLabel,
              (overdueWalks.length > 0 || activeWalks.length > 0) && { marginTop: 4 },
            ]}>
            Missed
          </Text>
          {renderMissedAlert(visibleMissed)}
        </>
      )}

      {allUpcoming.length > 0 && (
        <>
          <Text
            style={[
              styles.sectionLabel,
              (overdueWalks.length > 0 ||
                visibleMissed.length > 0 ||
                activeWalks.length > 0) && { marginTop: 4 },
            ]}>
            Upcoming
          </Text>
          {allUpcoming.map((w) => renderScheduleWalk(w))}
        </>
      )}

      {overdueWalks.length === 0 &&
        upNextWalks.length === 0 &&
        allUpcoming.length === 0 &&
        visibleMissed.length === 0 &&
        activeWalks.length === 0 && (
          <DashboardEmptyState
            title="Today's walks"
            text="No walks scheduled today"
            styles={styles}
          />
        )}
    </ScrollView>
  );
}
