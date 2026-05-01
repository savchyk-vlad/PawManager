import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type DashboardTab = "schedule" | "completed";

type Props = {
  activeTab: DashboardTab;
  scheduledCount: number;
  completedCount: number;
  onSwitchTab: (tab: DashboardTab) => void;
  styles: any;
};

export function DashboardActions({
  activeTab,
  scheduledCount,
  completedCount,
  onSwitchTab,
  styles,
}: Props) {
  return (
    <View style={styles.tabsWrap}>
      <TouchableOpacity style={styles.tab} onPress={() => onSwitchTab("schedule")}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={[styles.tabText, activeTab === "schedule" && styles.tabTextActive]}>
            Scheduled
          </Text>
          {scheduledCount > 0 && (
            <View style={[styles.tabBadge, activeTab === "schedule" && styles.tabBadgeActive]}>
              <Text
                style={[
                  styles.tabBadgeText,
                  activeTab === "schedule" && styles.tabBadgeTextActive,
                ]}>
                {scheduledCount}
              </Text>
            </View>
          )}
        </View>
        {activeTab === "schedule" && <View style={styles.tabLine} />}
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} onPress={() => onSwitchTab("completed")}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={[styles.tabText, activeTab === "completed" && styles.tabTextActive]}>
            Completed
          </Text>
          {completedCount > 0 && (
            <View style={[styles.tabBadge, activeTab === "completed" && styles.tabBadgeActive]}>
              <Text
                style={[
                  styles.tabBadgeText,
                  activeTab === "completed" && styles.tabBadgeTextActive,
                ]}>
                {completedCount}
              </Text>
            </View>
          )}
        </View>
        {activeTab === "completed" && <View style={styles.tabLine} />}
      </TouchableOpacity>
    </View>
  );
}
