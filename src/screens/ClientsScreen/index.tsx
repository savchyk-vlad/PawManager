import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
} from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppStore } from "../../store";
import { RootStackParamList } from "../../navigation";
import { useThemeColors, type ThemeColors } from "../../theme";
import { FloatingActionButton } from "../../components/FloatingActionButton";
import {
  ClientsSearchHeader,
  ClientsFilterMode,
} from "./components/ClientsSearchHeader";
import { ClientsPagedLists } from "./components/ClientsPagedLists";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ClientsScreen() {
  const colors = useThemeColors();
  const s = useMemo(() => createIndexStyles(colors), [colors]);
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const { clients, walks } = useAppStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ClientsFilterMode>("all");
  const pagerRef = useRef<ScrollView>(null);

  const baseList = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? clients.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.dogs.some(
              (d) => !d.isDeleted && d.name.toLowerCase().includes(q),
            ),
        )
      : [...clients];
  }, [clients, query]);

  const displayedAll = baseList;

  const displayedUnpaid = useMemo(
    () =>
      baseList.filter((c) =>
        walks.some(
          (w) =>
            w.clientId === c.id &&
            w.paymentStatus === "unpaid" &&
            w.status === "done",
        ),
      ),
    [baseList, walks],
  );

  const selectFilter = useCallback(
    (key: ClientsFilterMode) => {
      setFilter(key);
      const x = key === "all" ? 0 : screenW;
      pagerRef.current?.scrollTo({ x, animated: true });
    },
    [screenW],
  );

  const onPagerScrollEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      const page = Math.round(e.nativeEvent.contentOffset.x / screenW);
      setFilter(page === 0 ? "all" : "unpaid");
    },
    [screenW],
  );

  useEffect(() => {
    const x = filter === "all" ? 0 : screenW;
    pagerRef.current?.scrollTo({ x, animated: false });
  }, [screenW]);

  const emptyTextAll = query.trim() ? "No clients found" : "No clients yet";
  const emptyTextUnpaid = query.trim()
    ? "No clients found"
    : "No unpaid clients";

  const clientsListLayoutKey = useMemo(
    () =>
      [
        clients.length > 0 ? "tabs" : "notabs",
        query,
        filter,
        displayedAll.length,
        displayedUnpaid.length,
      ].join("|"),
    [
      clients.length,
      query,
      filter,
      displayedAll.length,
      displayedUnpaid.length,
    ],
  );

  return (
    <View style={s.safe}>
      <View style={{ height: insets.top, backgroundColor: colors.greenDeep }} />

      <ClientsSearchHeader
        styles={s}
        query={query}
        onChangeQuery={setQuery}
        filter={filter}
        onSelectFilter={selectFilter}
      />

      <ClientsPagedLists
        pagerRef={pagerRef}
        screenW={screenW}
        scrollEnabled={clients.length > 0}
        clientsListLayoutKey={clientsListLayoutKey}
        displayedAll={displayedAll}
        displayedUnpaid={displayedUnpaid}
        walks={walks}
        emptyTextAll={emptyTextAll}
        emptyTextUnpaid={emptyTextUnpaid}
        onMomentumScrollEnd={onPagerScrollEnd}
        styles={s}
      />

      <FloatingActionButton
        label="Add client"
        onPress={() => navigation.navigate("AddClient")}
      />
    </View>
  );
}

function createIndexStyles(colors: ThemeColors) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.77,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.35)",
    marginBottom: 10,
  },

  searchWrap: {
    backgroundColor: colors.greenDeep,
    paddingHorizontal: 14,
    paddingTop: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.bg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchField: { flex: 1, paddingHorizontal: 0, paddingVertical: 0 },
  searchFieldInput: {
    fontSize: 14,
    color: colors.textMuted,
    paddingVertical: 0,
  },

  page: {
    flex: 1,
    minHeight: 0,
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: colors.greenDeep,
    gap: 4,
  },
  tab: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 12,
    alignItems: "center",
    position: "relative",
  },
  tabText: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.4)" },
  tabTextActive: { color: colors.greenDefault },
  tabLine: {
    position: "absolute",
    bottom: 0,
    left: 8,
    right: 8,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.greenDefault,
  },

  listContent: { padding: 12, paddingBottom: 100 },

  /* Card */
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: "hidden",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 12,
    backgroundColor: colors.surfaceHigh,
  },

  /* Avatar */
  avatarWrap: { position: "relative", width: 46, height: 46, flexShrink: 0 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "700", color: colors.text },
  dot: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.greenDefault,
    borderWidth: 2,
    borderColor: colors.surface,
  },

  /* Name + chips */
  cardMid: { flex: 1, minWidth: 0 },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceHigh,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  chipEmoji: { fontSize: 11 },
  chipText: { fontSize: 12, color: colors.textMuted, fontWeight: "500" },
  noDog: { fontSize: 12, color: colors.textMuted },

  /* Payment column */
  payCol: { alignItems: "flex-end", flexShrink: 0, paddingTop: 2 },
  unpaidAmt: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.redDefault,
    lineHeight: 20,
  },
  paidLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    lineHeight: 20,
  },
  priceWalk: { fontSize: 12, color: colors.textMuted, marginTop: 1 },

  /* Divider */
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: 0,
  },

  /* Bottom bar */
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 0,
  },
  bottomLeft: { flexDirection: "row", alignItems: "center", gap: 5, flex: 1 },
  bottomIcon: { fontSize: 12 },
  bottomMeta: { fontSize: 12, color: colors.textMuted },
  bottomSep: {
    width: StyleSheet.hairlineWidth,
    height: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginHorizontal: 10,
  },
  bottomMid: { flexDirection: "row", alignItems: "center", flex: 1 },
  allPaidText: { fontSize: 12, color: colors.textMuted },
  unpaidMeta: { fontSize: 12, color: colors.textMuted },

  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: "rgba(92,175,114,0.35)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  callText: { fontSize: 12, fontWeight: "600", color: colors.greenDefault },

  /* Empty */
  empty: { alignItems: "center", paddingTop: 80 },
  emptyText: { fontSize: 14, color: colors.textMuted },
});
}
