import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { View, ScrollView, Platform, useWindowDimensions, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppStore } from "../../store";
import { RootStackParamList } from "../../navigation";
import { ConfirmDeleteSheet } from "../../components/ConfirmDeleteSheet";
import { walkCharge } from "../../lib/walkMetrics";
import { getInitials } from "../../lib/utils";
import { useThemeColors } from "../../theme";
import { CLIENT_DETAIL_TABS, ClientDetailTab } from "./components/ClientDetailTabs";
import { ClientDetailTabBar } from "./components/ClientDetailTabBar";
import { ClientDetailHeader } from "./components/ClientDetailHeader";
import { ClientDetailDogsTab } from "./components/ClientDetailDogsTab";
import { ClientDetailWalksTab } from "./components/ClientDetailWalksTab";
import { ClientDetailInfoTab } from "./components/ClientDetailInfoTab";
import { createClientDetailScreenStyles } from "./clientDetailScreen.styles";
import { formatClientAddressSingleLine } from "../../lib/clientAddress";

type Route = RouteProp<RootStackParamList, "ClientDetail">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ClientDetailScreen() {
  const colors = useThemeColors();
  const s = useMemo(() => createClientDetailScreenStyles(colors), [colors]);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const { clients, walks, removeClient } = useAppStore();
  const [tab, setTab] = useState<ClientDetailTab>("Dogs");
  const [removingClient, setRemovingClient] = useState(false);
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const pagerRef = useRef<ScrollView>(null);

  const client = clients.find((c) => c.id === route.params.clientId);

  const selectTab = useCallback(
    (t: ClientDetailTab) => {
      setTab(t);
      const i = CLIENT_DETAIL_TABS.indexOf(t);
      pagerRef.current?.scrollTo({ x: i * screenW, animated: true });
    },
    [screenW],
  );

  const onPagerScrollEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      const page = Math.round(e.nativeEvent.contentOffset.x / screenW);
      if (page >= 0 && page < CLIENT_DETAIL_TABS.length) {
        setTab(CLIENT_DETAIL_TABS[page]);
      }
    },
    [screenW],
  );

  useEffect(() => {
    const i = CLIENT_DETAIL_TABS.indexOf(tab);
    pagerRef.current?.scrollTo({ x: i * screenW, animated: false });
  }, [screenW]);

  if (!client) return null;
  const activeDogs = client.dogs.filter((d) => !d.isDeleted);

  const clientWalks = walks
    .filter((w) => w.clientId === client.id)
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));

  const totalEarned = clientWalks
    .filter((w) => w.status === "done")
    .reduce((sum, w) => sum + walkCharge(w, client), 0);

  const unpaidDoneWalks = clientWalks.filter(
    (w) => w.status === "done" && w.paymentStatus === "unpaid",
  );
  const unpaidCount = unpaidDoneWalks.length;
  const unpaidTotal = unpaidDoneWalks.reduce(
    (sum, w) => sum + walkCharge(w, client),
    0,
  );

  const initials = getInitials(client.name);
  const handleDeleteClient = () => {
    if (removingClient) return;
    setShowDeleteSheet(true);
  };

  const confirmDeleteClient = async () => {
    const deletingClientId = client.id;
    try {
      setRemovingClient(true);
      setShowDeleteSheet(false);
      navigation.goBack();
      await removeClient(deletingClientId);
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Could not delete client.",
      );
    } finally {
      setRemovingClient(false);
    }
  };

  const openPayments = () =>
    navigation.navigate("Tabs", { screen: "Payments" });

  return (
    <View style={[s.safe, { paddingBottom: insets.bottom }]}>
      <View style={{ height: insets.top, backgroundColor: colors.greenDeep }} />

      <ClientDetailHeader
        clientId={client.id}
        clientName={client.name}
        dogSubtitle={activeDogs.map((d) => d.name).join(" & ")}
        initials={initials}
        phone={client.phone}
        addressForMaps={formatClientAddressSingleLine(client.address)}
        styles={s}
        onBack={() => navigation.goBack()}
        onEdit={() =>
          navigation.navigate("EditClient", { clientId: client.id })
        }
      />

      <ClientDetailTabBar tab={tab} onSelectTab={selectTab} styles={s} />

      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={Platform.OS === "android"}
        style={{ flex: 1, backgroundColor: colors.bg }}
        onMomentumScrollEnd={onPagerScrollEnd}>
        <View style={[s.tabPage, { width: screenW }]}>
          <ClientDetailDogsTab
            activeDogs={activeDogs}
            clientId={client.id}
            navigation={navigation}
            styles={s}
          />
        </View>
        <View style={[s.tabPage, { width: screenW }]}>
          <ClientDetailWalksTab
            clientWalks={clientWalks}
            client={client}
            styles={s}
          />
        </View>
        <View style={[s.tabPage, { width: screenW }]}>
          <ClientDetailInfoTab
            client={client}
            clientWalkCount={clientWalks.length}
            totalEarned={totalEarned}
            unpaidCount={unpaidCount}
            unpaidTotal={unpaidTotal}
            removingClient={removingClient}
            styles={s}
            onOpenPayments={openPayments}
            onDeleteClient={handleDeleteClient}
          />
        </View>
      </ScrollView>

      <ConfirmDeleteSheet
        visible={showDeleteSheet}
        title={`Remove ${client.name}?`}
        subtitle={`${client.name}'s profile, walk history, and payment records will be permanently deleted. This cannot be undone.`}
        confirmLabel="Yes, remove client"
        loading={removingClient}
        onConfirm={confirmDeleteClient}
        onCancel={() => setShowDeleteSheet(false)}
        rows={[
          {
            label: "Client profile",
            value: [client.name, ...activeDogs.map((d) => d.name)].join(" + "),
          },
          {
            label: "Walks",
            value: `${clientWalks.length} walk${
              clientWalks.length !== 1 ? "s" : ""
            }`,
          },
          ...(unpaidCount > 0
            ? [
                {
                  label: "Outstanding balance",
                  value: `$${unpaidTotal.toFixed(2)} unpaid`,
                  danger: true,
                },
              ]
            : []),
        ]}
      />
    </View>
  );
}
