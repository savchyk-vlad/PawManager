import React, { useMemo, useState } from "react";
import {
  Alert,
  LayoutAnimation,
  Platform,
  ScrollView,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { format, isSameMonth, startOfMonth } from "date-fns";
import { useThemeColors } from "../../theme";
import { useAppStore } from "../../store";
import { Client, Walk } from "../../types";
import { walkCharge, walkDogCount } from "../../lib/walkMetrics";
import { RootStackParamList } from "../../navigation";
import { MarkPaidSheet } from "../../components/MarkPaidSheet";
import { PaymentsScreenHeader } from "./components/PaymentsScreenHeader";
import { PaymentsSummaryGrid } from "./components/PaymentsSummaryGrid";
import { PaymentsMonthlyEarningsSection } from "./components/PaymentsMonthlyEarningsSection";
import { PaymentsUnpaidSection } from "./components/PaymentsUnpaidSection";
import { PaymentsPaidThisMonthSection } from "./components/PaymentsPaidThisMonthSection";
import { PaymentsInsightsSection } from "./components/PaymentsInsightsSection";
import { createPaymentsScreenStyles } from "./paymentsScreen.styles";
import {
  ClientPaymentsEntry,
  currency,
  dogNamesForWalk,
  monthBars,
  PaidWalkEntry,
  sortByScheduleAsc,
  sortByScheduleDesc,
  walkDate,
} from "./paymentsUtils";
import { SHOW_PAYMENTS_MONTHLY_AND_INSIGHTS } from "./paymentsConstants";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function PaymentsScreen() {
  const colors = useThemeColors();
  const paymentsScreenStyles = useMemo(
    () => createPaymentsScreenStyles(colors),
    [colors],
  );
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { walks, clients, markWalkPaid } = useAppStore();
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [paySheetWalk, setPaySheetWalk] = useState<{
    walk: Walk;
    client: Client;
  } | null>(null);
  const monthWalks = useMemo(
    () =>
      walks.filter(
        (walk) =>
          walk.status === "done" &&
          isSameMonth(walkDate(walk), visibleMonth) &&
          walk.paymentStatus !== "no_pay",
      ),
    [walks, visibleMonth],
  );

  const unpaidByClient = useMemo(() => {
    return clients
      .map((client) => {
        const clientWalks = sortByScheduleAsc(
          monthWalks.filter(
            (walk) =>
              walk.clientId === client.id && walk.paymentStatus === "unpaid",
          ),
        );
        if (clientWalks.length === 0) return null;

        const total = clientWalks.reduce(
          (sum, walk) => sum + walkCharge(walk, client),
          0,
        );
        const walkCount = clientWalks.reduce(
          (sum, walk) => sum + walkDogCount(walk),
          0,
        );
        return { client, walks: clientWalks, total, walkCount };
      })
      .filter((entry): entry is ClientPaymentsEntry => entry !== null)
      .sort((a, b) => b.total - a.total);
  }, [clients, monthWalks]);

  const paidWalks = useMemo(() => {
    return sortByScheduleDesc(
      monthWalks.filter((walk) => walk.paymentStatus === "paid"),
    )
      .map((walk) => {
        const client = clients.find((entry) => entry.id === walk.clientId);
        if (!client) return null;
        return {
          walk,
          client,
          amount: walkCharge(walk, client),
          dogLabel: dogNamesForWalk(walk, client),
        };
      })
      .filter((entry): entry is PaidWalkEntry => entry !== null);
  }, [clients, monthWalks]);

  const totals = useMemo(() => {
    const outstanding = unpaidByClient.reduce((sum, entry) => sum + entry.total, 0);
    const collected = paidWalks.reduce((sum, entry) => sum + entry.amount, 0);
    const totalBilled = outstanding + collected;
    const unpaidClients = unpaidByClient.length;
    const unpaidWalkCount = unpaidByClient.reduce(
      (sum, entry) => sum + entry.walkCount,
      0,
    );
    const collectionRate =
      totalBilled > 0 ? Math.round((collected / totalBilled) * 100) : 0;

    return {
      outstanding,
      collected,
      totalBilled,
      unpaidClients,
      unpaidWalkCount,
      collectionRate,
    };
  }, [paidWalks, unpaidByClient]);

  const bars = useMemo(() => {
    if (!SHOW_PAYMENTS_MONTHLY_AND_INSIGHTS) return [];
    return monthBars(visibleMonth, walks, clients);
  }, [visibleMonth, walks, clients]);

  const maxBarValue = useMemo(() => {
    if (bars.length === 0) return 1;
    return Math.max(...bars.map((bar) => bar.total), 1);
  }, [bars]);

  const paidClientsThisMonth = new Set(paidWalks.map((entry) => entry.client.id)).size;

  const averagePerWalk = useMemo(() => {
    if (!SHOW_PAYMENTS_MONTHLY_AND_INSIGHTS) return 0;
    return monthWalks.length > 0 ? totals.totalBilled / monthWalks.length : 0;
  }, [monthWalks, totals.totalBilled]);

  const topClient = useMemo(() => {
    if (!SHOW_PAYMENTS_MONTHLY_AND_INSIGHTS) return null;
    const byClient = clients
      .map((client) => {
        const total = monthWalks
          .filter((walk) => walk.clientId === client.id)
          .reduce((sum, walk) => sum + walkCharge(walk, client), 0);
        return { client, total };
      })
      .filter((entry) => entry.total > 0)
      .sort((a, b) => b.total - a.total);
    return byClient[0] ?? null;
  }, [clients, monthWalks]);

  const busiestDay = useMemo(() => {
    if (!SHOW_PAYMENTS_MONTHLY_AND_INSIGHTS) return null;
    if (monthWalks.length === 0) return null;
    const dayMap = new Map<string, number>();
    monthWalks.forEach((walk) => {
      const key = format(walkDate(walk), "EEEE");
      dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
    });
    return [...dayMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  }, [monthWalks]);

  const toggleClient = (clientId: string) => {
    if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedClientId((prev) => (prev === clientId ? null : clientId));
  };

  const selectMonth = (value: Date) => {
    setExpandedClientId(null);
    setVisibleMonth(startOfMonth(value));
  };

  const handleMarkWalkPaid = (walk: Walk, client: Client) => {
    setPaySheetWalk({ walk, client });
  };

  const handleConfirmPaidWithMethod = async (paymentMethod: string) => {
    if (!paySheetWalk) return;
    try {
      await markWalkPaid(paySheetWalk.walk.id, paymentMethod);
      setPaySheetWalk(null);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message ?? "Could not mark this walk as paid.",
      );
    }
  };

  return (
    <View style={paymentsScreenStyles.screen}>
      <View style={{ height: insets.top, backgroundColor: colors.greenDeep }} />
      <PaymentsScreenHeader
        visibleMonth={visibleMonth}
        onSelectPeriod={selectMonth}
        onExportPress={() =>
          Alert.alert("Export PDF", "PDF export isn't available in this build yet.")
        }
      />
      <ScrollView
        style={paymentsScreenStyles.scroll}
        contentContainerStyle={paymentsScreenStyles.content}
        showsVerticalScrollIndicator={false}>
        <PaymentsSummaryGrid
          totals={totals}
          paidWalkCount={paidWalks.length}
          monthWalkCount={monthWalks.length}
        />

        {SHOW_PAYMENTS_MONTHLY_AND_INSIGHTS ? (
          <PaymentsMonthlyEarningsSection
            visibleMonth={visibleMonth}
            totalBilled={totals.totalBilled}
            bars={bars}
            maxBarValue={maxBarValue}
          />
        ) : null}

        <PaymentsUnpaidSection
          monthLabel={format(visibleMonth, "MMMM yyyy")}
          unpaidByClient={unpaidByClient}
          expandedClientId={expandedClientId}
          navigation={navigation}
          onToggleClient={toggleClient}
          onMarkWalkPaid={handleMarkWalkPaid}
        />

        <PaymentsPaidThisMonthSection
          monthLabel={format(visibleMonth, "MMMM yyyy")}
          paidWalks={paidWalks}
          collectedTotal={totals.collected}
          paidClientsThisMonth={paidClientsThisMonth}
          navigation={navigation}
        />

        {SHOW_PAYMENTS_MONTHLY_AND_INSIGHTS ? (
          <PaymentsInsightsSection
            averagePerWalk={averagePerWalk}
            topClient={topClient}
            busiestDay={busiestDay}
          />
        ) : null}
      </ScrollView>
      <MarkPaidSheet
        visible={paySheetWalk != null}
        walkTitle={
          paySheetWalk ? dogNamesForWalk(paySheetWalk.walk, paySheetWalk.client) : ""
        }
        walkSubtitle={
          paySheetWalk
            ? format(walkDate(paySheetWalk.walk), "MMM d, h:mm a")
            : ""
        }
        amountLabel={
          paySheetWalk
            ? currency(walkCharge(paySheetWalk.walk, paySheetWalk.client))
            : "$0.00"
        }
        onClose={() => setPaySheetWalk(null)}
        onConfirm={handleConfirmPaidWithMethod}
      />
    </View>
  );
}
