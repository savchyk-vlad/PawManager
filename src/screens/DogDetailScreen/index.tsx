import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { format, parseISO, isValid } from "date-fns";
import { useAppStore } from "../../store";
import { RootStackParamList } from "../../navigation";
import { walkCharge } from "../../lib/walkMetrics";
import { colors, radius } from "../../theme";
import { DOG_DETAIL_TAB_KEYS, DogDetailTabKey } from "./components/DogDetailTabs";
import { DogDetailHero } from "./components/DogDetailHero";
import { DogDetailTabBar } from "./components/DogDetailTabBar";
import { DogDetailProfileTab } from "./components/DogDetailProfileTab";
import { DogDetailVetTab } from "./components/DogDetailVetTab";
import { DogDetailWalksTab } from "./components/DogDetailWalksTab";

type Route = RouteProp<RootStackParamList, "DogDetail">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const HERO_BG = colors.greenDeep;

export default function DogDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const { clients, walks, removeDogFromClient } = useAppStore();
  const [tab, setTab] = useState<DogDetailTabKey>("profile");
  const [walkShowCount, setWalkShowCount] = useState(6);
  const [removing, setRemoving] = useState(false);
  const pagerRef = useRef<ScrollView>(null);

  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  const client = clients.find((c) => c.id === route.params.clientId);
  const dog = client?.dogs.find((d) => d.id === route.params.dogId);

  const dogWalks = useMemo(() => {
    if (!client || !dog) return [];
    return walks
      .filter(
        (w) =>
          w.clientId === client.id &&
          w.dogIds.includes(dog.id) &&
          w.status === "done",
      )
      .sort((a, b) => {
        const fa = a.finishedAt ? new Date(a.finishedAt).getTime() : 0;
        const fb = b.finishedAt ? new Date(b.finishedAt).getTime() : 0;
        return fb - fa;
      });
  }, [client, dog, walks]);

  const walkStats = useMemo(() => {
    if (dogWalks.length === 0) {
      return { totalEarned: 0, avgMin: 0, firstLabel: "—" };
    }
    const totalEarned = dogWalks.reduce((sum, w) => sum + walkCharge(w, client!), 0);
    const mins = dogWalks.map((w) => w.actualDurationMinutes ?? w.durationMinutes);
    const avgMin = Math.round(mins.reduce((a, b) => a + b, 0) / mins.length);
    let earliest: Date | null = null;
    for (const w of dogWalks) {
      const t = parseISO(w.scheduledAt);
      if (isValid(t) && (!earliest || t < earliest)) earliest = t;
    }
    const firstLabel = earliest ? format(earliest, "MMM d, yyyy") : "—";
    return { totalEarned, avgMin, firstLabel };
  }, [dogWalks, client]);

  const selectTab = useCallback(
    (key: DogDetailTabKey) => {
      setTab(key);
      const i = DOG_DETAIL_TAB_KEYS.indexOf(key);
      pagerRef.current?.scrollTo({ x: i * screenW, animated: true });
    },
    [screenW],
  );

  const onPagerScrollEnd = useCallback(
    (e: { nativeEvent: { contentOffset: { x: number } } }) => {
      const page = Math.round(e.nativeEvent.contentOffset.x / screenW);
      if (page >= 0 && page < DOG_DETAIL_TAB_KEYS.length) {
        setTab(DOG_DETAIL_TAB_KEYS[page]);
      }
    },
    [screenW],
  );

  useEffect(() => {
    const i = DOG_DETAIL_TAB_KEYS.indexOf(tab);
    pagerRef.current?.scrollTo({ x: i * screenW, animated: false });
  }, [screenW]);

  if (!fontsLoaded || !client || !dog) {
    return (
      <View style={[styles.loader, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.greenDeep} size="large" />
      </View>
    );
  }

  const font = {
    regular: "DMSans_400Regular",
    medium: "DMSans_500Medium",
    semi: "DMSans_600SemiBold",
    bold: "DMSans_700Bold",
  };

  const visibleWalks = dogWalks.slice(0, walkShowCount);

  const handleDeleteDog = () => {
    if (removing) return;
    Alert.alert("Remove dog?", `${dog.name} will be removed from this client.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setRemoving(true);
            await removeDogFromClient(client.id, dog.id);
            navigation.goBack();
          } catch (e) {
            Alert.alert(
              "Error",
              e instanceof Error ? e.message : "Could not remove dog.",
            );
          } finally {
            setRemoving(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.safe, { paddingBottom: insets.bottom }]}>
      <DogDetailHero
        paddingTop={insets.top + 4}
        dog={dog}
        clientId={client.id}
        navigation={navigation}
        font={font}
        styles={styles}
      />

      <DogDetailTabBar tab={tab} onSelectTab={selectTab} font={font} styles={styles} />

      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={Platform.OS === "android"}
        style={{ flex: 1, backgroundColor: colors.bg }}
        onMomentumScrollEnd={onPagerScrollEnd}>
        <DogDetailProfileTab
          dog={dog}
          client={client}
          font={font}
          styles={styles}
          onDeleteDog={handleDeleteDog}
          removing={removing}
          screenW={screenW}
        />
        <DogDetailVetTab dog={dog} font={font} styles={styles} screenW={screenW} />
        <DogDetailWalksTab
          dogWalks={dogWalks}
          visibleWalks={visibleWalks}
          walkShowCount={walkShowCount}
          onLoadMore={() => setWalkShowCount((n) => n + 8)}
          walkStats={walkStats}
          client={client}
          font={font}
          styles={styles}
          screenW={screenW}
          navigation={navigation}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg,
  },

  hero: {
    backgroundColor: HERO_BG,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  editBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.18)",
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
  },
  dogRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dogCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dogName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.3,
    marginBottom: 2,
    lineHeight: 18,
  },
  dogBreed: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    marginBottom: 7,
  },
  metaRow: { flexDirection: "row", gap: 5 },
  metaPill: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 5,
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  metaPillText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.5)",
  },
  traitRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  trait: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  traitText: { fontSize: 12, fontWeight: "500" },

  tabs: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingTop: 14,
    paddingBottom: 12,
    alignItems: "center",
    justifyContent: "flex-start",
    position: "relative",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textMuted,
  },
  tabTextActive: { color: colors.text },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    width: 28,
    height: 2.5,
    backgroundColor: colors.greenDefault,
    borderRadius: 2,
  },

  page: { flex: 1, minHeight: 0 },
  pageScroll: { flex: 1, backgroundColor: colors.bg },
  pageContent: { paddingBottom: 32 },

  secTitle: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: 10,
    paddingHorizontal: 20,
    marginTop: 18,
  },

  alertCard: {
    marginHorizontal: 20,
    marginBottom: 4,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderTopRightRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
    borderBottomLeftRadius: radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.amberDefault,
    backgroundColor: colors.amberSubtle,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  alertDanger: {
    borderLeftColor: colors.redDefault,
    backgroundColor: colors.redSubtle,
    marginHorizontal: 20,
    marginBottom: 4,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderTopRightRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
    borderBottomLeftRadius: radius.sm,
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  alertIcon: { fontSize: 16, marginTop: 1 },
  alertTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.amberText,
    marginBottom: 4,
  },
  alertBody: {
    fontSize: 13,
    color: colors.amberText,
    lineHeight: 20,
  },
  alertTitleDanger: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.redText,
    marginBottom: 4,
  },
  alertBodyDanger: {
    fontSize: 13,
    color: "#A32D2D",
    lineHeight: 20,
  },

  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginHorizontal: 20,
    overflow: "hidden",
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  ik: { fontSize: 14, color: colors.textMuted },
  iv: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
    marginLeft: 12,
  },
  ivLink: {
    fontSize: 14,
    color: "#8BD09C",
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
    marginLeft: 12,
  },

  vetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  vetIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.greenSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  vetName: { fontSize: 15, fontWeight: "600", color: colors.text },
  vetMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  callBtn: {
    marginLeft: "auto",
    backgroundColor: colors.greenSubtle,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  callBtnText: { fontSize: 13, fontWeight: "600", color: colors.text },

  walkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  walkRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  walkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  walkDate: { fontSize: 14, color: colors.text, fontWeight: "500", flex: 1 },
  walkDur: { fontSize: 13, color: colors.textMuted },
  walkAmt: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 36,
    textAlign: "right",
  },

  loadMore: {
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 4,
  },
  loadMoreText: {
    fontSize: 13,
    color: colors.greenDefault,
    fontWeight: "500",
  },
  dangerZoneLabelPad: {
    paddingHorizontal: 20,
  },
  dangerZoneButtonPad: {
    marginHorizontal: 20,
  },
});
