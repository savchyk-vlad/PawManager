import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { format } from "date-fns";
import { useThemeColors } from "../../../theme";
import { createPaymentsSectionsStyles } from "../paymentsSections.styles";
import { currency, MonthBar } from "../paymentsUtils";

type Props = {
  visibleMonth: Date;
  totalBilled: number;
  bars: MonthBar[];
  maxBarValue: number;
};

export function PaymentsMonthlyEarningsSection({
  visibleMonth,
  totalBilled,
  bars,
  maxBarValue,
}: Props) {
  const colors = useThemeColors();
  const st = useMemo(() => createPaymentsSectionsStyles(colors), [colors]);
  return (
    <>
      <View style={st.sectionRow}>
        <View style={st.insightsHeadingRow}>
          <Text style={st.sectionLabel}>Monthly earnings</Text>
        </View>
        <Text style={st.sectionMeta}>6 months</Text>
      </View>

      <View style={st.chartSection}>
        <View style={st.chartBody}>
          <View style={st.chartBars}>
            {bars.map((bar) => {
              const height = Math.max(4, (bar.total / maxBarValue) * 44);
              return (
                <View key={bar.label} style={st.barWrap}>
                  <View
                    style={[st.bar, { height }, bar.active && st.barActive]}
                  />
                  <Text
                    style={[st.barLabel, bar.active && st.barLabelActive]}>
                    {bar.shortLabel}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text style={st.chartFoot}>
            {format(visibleMonth, "MMMM")} total{" "}
            <Text style={st.chartFootAccent}>{currency(totalBilled)}</Text>
            {bars.some((b) => b.total > 0)
              ? " · tracked over last 6 months"
              : ""}
          </Text>
        </View>
      </View>
    </>
  );
}
