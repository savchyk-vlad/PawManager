import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { Client } from "../../../types";
import { useThemeColors } from "../../../theme";
import { createPaymentsSectionsStyles } from "../paymentsSections.styles";
import { currency } from "../paymentsUtils";

type Props = {
  averagePerWalk: number;
  topClient: { client: Client; total: number } | null;
  busiestDay: string | null;
};

export function PaymentsInsightsSection({
  averagePerWalk,
  topClient,
  busiestDay,
}: Props) {
  const colors = useThemeColors();
  const st = useMemo(() => createPaymentsSectionsStyles(colors), [colors]);
  return (
    <>
      <View style={[st.sectionRow, st.sectionRowPaid]}>
        <View style={st.insightsHeadingRow}>
          <Text style={st.sectionLabel}>Revenue insights</Text>
        </View>
      </View>

      <View style={st.insightsCard}>
        <View style={st.insightRow}>
          <Text style={st.insightLabel}>Avg per walk</Text>
          <Text style={st.insightValue}>{currency(averagePerWalk)}</Text>
        </View>
        <View style={st.insightRow}>
          <Text style={st.insightLabel}>Top client</Text>
          <Text style={st.insightValue}>
            {topClient
              ? `${topClient.client.name} · ${currency(topClient.total)}`
              : "—"}
          </Text>
        </View>
        <View style={st.insightRow}>
          <Text style={st.insightLabel}>Busiest day</Text>
          <Text style={st.insightValue}>{busiestDay ?? "—"}</Text>
        </View>
      </View>
    </>
  );
}
