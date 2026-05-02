import React, {useCallback, useEffect, useState, useMemo} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { useThemeColors, type ThemeColors } from "../../../theme";
import { Walk } from "../../../types";

export type FutureWalkDayGroup = {
  dayKey: string;
  dayLabel: string;
  walks: Walk[];
};

type Props = {
  groups: FutureWalkDayGroup[];
  renderScheduleWalk: (walk: Walk) => React.ReactNode;
};

function Chevron({ up, stroke }: { up: boolean; stroke: string }) {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
      <Path
        d={
          up
            ? "M18 15l-6-6-6 6"
            : "M6 9l6 6 6-6"
        }
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function FutureWalksAccordion({ groups, renderScheduleWalk }: Props) {
  const colors = useThemeColors();
  const s = useMemo(() => createFuturewalksaccordionStyles(colors), [colors]);
  const [open, setOpen] = useState(false);
  const total = groups.reduce((n, g) => n + g.walks.length, 0);

  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((o) => !o);
  }, []);

  if (total === 0) return null;

  return (
    <View style={s.card}>
      <TouchableOpacity
        style={s.cardHeader}
        onPress={toggle}
        activeOpacity={0.78}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`Future walks, ${total} scheduled`}>
        <Text style={s.headerTitle}>Future walks</Text>
        <View style={s.headerRight}>
          <View style={s.countBadge}>
            <Text style={s.countBadgeText}>{total}</Text>
          </View>
          <Chevron up={open} stroke={colors.textMuted} />
        </View>
      </TouchableOpacity>

      {open ? (
        <View style={s.body}>
          {groups
            .filter((g) => g.walks.length > 0)
            .map((g) => (
            <View key={g.dayKey}>
              <Text style={s.dateLabel}>{g.dayLabel}</Text>
              {g.walks.map((w) => (
                <View key={w.id}>{renderScheduleWalk(w)}</View>
              ))}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function createFuturewalksaccordionStyles(colors: ThemeColors) {
  return StyleSheet.create({
  card: {
    marginTop: 20,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  cardHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceHigh,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.greenSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.greenText,
  },
  body: {
    paddingBottom: 4,
  },
  dateLabel: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 4,
    fontSize: 10,
    fontWeight: "500",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.09 * 10,
  },
});
}
