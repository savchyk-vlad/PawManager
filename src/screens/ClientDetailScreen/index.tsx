import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Platform,
  useWindowDimensions,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppStore } from "../../store";
import { RootStackParamList } from "../../navigation";
import { ConfirmDeleteSheet } from "../../components/ConfirmDeleteSheet";
import { walkCharge } from "../../lib/walkMetrics";
import { getInitials } from "../../lib/utils";
import { colors } from "../../theme";
import { CLIENT_DETAIL_TABS, ClientDetailTab } from "./components/ClientDetailTabs";
import { ClientDetailTabBar } from "./components/ClientDetailTabBar";
import { ClientDetailHeader } from "./components/ClientDetailHeader";
import { ClientDetailDogsTab } from "./components/ClientDetailDogsTab";
import { ClientDetailWalksTab } from "./components/ClientDetailWalksTab";
import { ClientDetailInfoTab } from "./components/ClientDetailInfoTab";

type Route = RouteProp<RootStackParamList, "ClientDetail">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ClientDetailScreen() {
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
        clientName={client.name}
        dogSubtitle={activeDogs.map((d) => d.name).join(" & ")}
        initials={initials}
        phone={client.phone}
        address={client.address}
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

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: { backgroundColor: colors.greenDeep, paddingHorizontal: 16, paddingBottom: 18 },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 10,
    marginBottom: 16,
    minHeight: 44,
  },

  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  headerBody: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
    minWidth: 0,
  },

  headerTextCol: {
    flex: 1,
    minWidth: 0,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  avatarLg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarLgText: { fontSize: 18, fontWeight: "700", color: "white" },
  clientName: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    letterSpacing: -0.3,
    textAlign: "right",
  },
  clientSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.65)",
    marginTop: 2,
    textAlign: "right",
  },

  infoStatsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  infoStatBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNum: { fontSize: 19, fontWeight: "700", color: colors.text, marginBottom: 2 },
  statLbl: { fontSize: 10, color: colors.textMuted },

  actionsRow: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  actionLabel: { fontSize: 13, fontWeight: "600", color: "white" },

  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.greenDeep,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  tabItem: { flex: 1, alignItems: "center", paddingVertical: 13 },
  tabLabel: { fontSize: 14, fontWeight: "500", color: "rgba(255,255,255,0.45)" },
  tabLabelActive: { color: "white", fontWeight: "600" },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    height: 2,
    width: 24,
    borderRadius: 1,
    backgroundColor: colors.greenDefault,
  },

  tabPage: {
    flex: 1,
    minHeight: 0,
  },
  tabPageScroll: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  content: { padding: 16, paddingBottom: 56 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
  },

  dogListItem: {
    overflow: "hidden",
  },
  dogCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
  },
  dogAvatarLg: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "#252820",
    alignItems: "center",
    justifyContent: "center",
  },
  dogName: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 2 },
  dogBreed: { fontSize: 13, color: colors.textSecondary },
  dogMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  dogStatStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  dogStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  dogStatAmber: { backgroundColor: "rgba(240,160,48,0.1)" },
  dogStatTxt: { fontSize: 11, fontWeight: "500", color: colors.textMuted },

  traitRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  trait: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  traitText: { fontSize: 12, fontWeight: "500" },

  dogInfoBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: 14,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  infoKey: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  infoVal: {
    fontSize: 14,
    color: colors.text,
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
    lineHeight: 20,
  },

  walkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  walkDate: { fontSize: 13, fontWeight: "600", color: colors.text, marginBottom: 3 },
  walkMeta: { fontSize: 12, color: colors.textSecondary },
  walkRight: { flexDirection: "row", alignItems: "center", gap: 10, marginLeft: 10 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 11, fontWeight: "600" },
  paymentBadge: {
    alignSelf: "flex-start",
    marginTop: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  paymentBadgeText: { fontSize: 10, fontWeight: "700" },

  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: 14,
  },
  paymentsBtn: {
    marginTop: 14,
    backgroundColor: colors.greenDeep,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexDirection: "row",
  },
  paymentsBtnText: { color: "white", fontSize: 14, fontWeight: "700" },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: "center" },
  emptyDogs: { paddingTop: 32, alignItems: "center", gap: 16 },
  addDogCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  addDogCtaText: { fontSize: 16, fontWeight: "600", color: colors.greenDefault },
  addDogFooter: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
  },
  addDogFooterText: { fontSize: 15, fontWeight: "600", color: colors.greenDefault },
});
