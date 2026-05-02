import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, ScrollView, ActivityIndicator, Alert, Platform, useWindowDimensions } from "react-native";
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
import { useThemeColors } from "../../theme";
import { DOG_DETAIL_TAB_KEYS, DogDetailTabKey } from "./components/DogDetailTabs";
import { DogDetailHero } from "./components/DogDetailHero";
import { DogDetailTabBar } from "./components/DogDetailTabBar";
import { DogDetailProfileTab } from "./components/DogDetailProfileTab";
import { DogDetailVetTab } from "./components/DogDetailVetTab";
import { DogDetailWalksTab } from "./components/DogDetailWalksTab";
import { createDogDetailScreenStyles } from "./dogDetailScreen.styles";

type Route = RouteProp<RootStackParamList, "DogDetail">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function DogDetailScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createDogDetailScreenStyles(colors), [colors]);
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const { clients, walks, removeDogFromClient } = useAppStore();
  const [tab, setTab] = useState<DogDetailTabKey>("profile");
  const [walkShowCount, setWalkShowCount] = useState(6);
  const [removing, setRemoving] = useState(false);
  const pagerRef = useRef<ScrollView>(null);
  const allowDelete = route.params.allowDelete !== false;
  const allowEdit = route.params.allowDelete !== false;

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
    if (!allowDelete) return;
    if (removing) return;
    Alert.alert("Remove dog?", `${dog.name} will be removed from this client.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const deletingClientId = client.id;
          const deletingDogId = dog.id;
          try {
            setRemoving(true);
            navigation.goBack();
            await removeDogFromClient(deletingClientId, deletingDogId);
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
        allowEdit={allowEdit}
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
          onDeleteDog={allowDelete ? handleDeleteDog : undefined}
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
          allowOpenWalks={allowEdit}
        />
      </ScrollView>
    </View>
  );
}
