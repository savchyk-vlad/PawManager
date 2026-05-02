import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { useThemeColors } from "../../../theme";
import { createPaymentsSectionsStyles } from "../paymentsSections.styles";
import { currency } from "../paymentsUtils";

export type PaymentsTotals = {
  outstanding: number;
  collected: number;
  totalBilled: number;
  unpaidClients: number;
  unpaidWalkCount: number;
  collectionRate: number;
};

type Props = {
  totals: PaymentsTotals;
  paidWalkCount: number;
  monthWalkCount: number;
};

export function PaymentsSummaryGrid({
  totals,
  paidWalkCount,
  monthWalkCount,
}: Props) {
  const colors = useThemeColors();
  const st = useMemo(() => createPaymentsSectionsStyles(colors), [colors]);
  return (
    <View style={st.summaryGrid}>
      <View style={[st.summaryCard, st.summaryCardAccent]}>
        <Text style={[st.summaryLabel, st.summaryCardAccentLabel]}>Outstanding</Text>
        <Text style={[st.summaryValue, st.summaryValueAmber]}>
          {currency(totals.outstanding)}
        </Text>
        <Text style={[st.summaryMeta, st.summaryCardAccentMeta]}>
          {totals.unpaidWalkCount} walk{totals.unpaidWalkCount === 1 ? "" : "s"}{" "}
          · {totals.unpaidClients} client{totals.unpaidClients === 1 ? "" : "s"}
        </Text>
      </View>

      <View style={st.summaryCard}>
        <Text style={st.summaryLabel}>Collected</Text>
        <Text style={[st.summaryValue, st.summaryValueGreen]}>
          {currency(totals.collected)}
        </Text>
        <Text style={st.summaryMeta}>
          {paidWalkCount} walk{paidWalkCount === 1 ? "" : "s"} paid
        </Text>
      </View>

      <View style={st.summaryCard}>
        <Text style={st.summaryLabel}>Total billed</Text>
        <Text style={st.summaryValue}>{currency(totals.totalBilled)}</Text>
        <Text style={st.summaryMeta}>
          {monthWalkCount} walk{monthWalkCount === 1 ? "" : "s"}
        </Text>
      </View>

      <View style={st.summaryCard}>
        <Text style={st.summaryLabel}>Collection rate</Text>
        <Text style={[st.summaryValue, st.summaryValueGreen]}>
          {totals.collectionRate}%
        </Text>
        <Text style={st.summaryMeta}>this month</Text>
      </View>
    </View>
  );
}
