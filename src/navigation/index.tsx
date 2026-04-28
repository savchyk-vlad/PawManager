import React, { useEffect } from "react";
import {
  NavigationContainer,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  View,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from "react-native";
import { colors, design } from "../theme";
import { useAppStore } from "../store";
import Svg, {
  Path,
  Rect,
  Line,
  Circle,
  G,
  Ellipse,
} from "react-native-svg";

import DashboardScreen from "../screens/DashboardScreen";
import ClientsScreen from "../screens/ClientsScreen";
import ClientDetailScreen from "../screens/ClientDetailScreen";
import ScheduleScreen from "../screens/ScheduleScreen";
import PaymentsScreen from "../screens/PaymentsScreen";
import ActiveWalkScreen from "../screens/ActiveWalkScreen";
import AddWalkScreen from "../screens/AddWalkScreen";
import EditWalkScreen from "../screens/EditWalkScreen";
import AddClientScreen from "../screens/AddClientScreen";
import EditClientScreen from "../screens/EditClientScreen";
import DogDetailScreen from "../screens/DogDetailScreen";
import EditDogScreen from "../screens/EditDogScreen";
import SettingsScreen from "../screens/SettingsScreen";
import SubscriptionsScreen from "../screens/SubscriptionsScreen";
import HelpFAQScreen from "../screens/HelpFAQScreen";
import FeedbackScreen from "../screens/FeedbackScreen";
import AuthNavigator from "./AuthNavigator";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabase";

export type TabParamList = {
  Clients: undefined;
  Schedule: undefined;
  Walks: undefined;
  Payments: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  ClientDetail: { clientId: string };
  DogDetail: { clientId: string; dogId: string };
  /** Omit dogId to add a new dog for the client. */
  EditDog: { clientId: string; dogId?: string };
  ActiveWalk: { walkId: string };
  EditWalk: { walkId: string };
  AddWalk: { preselectedDateIso?: string } | undefined;
  AddClient: undefined;
  EditClient: { clientId: string };
  Subscriptions: undefined;
  HelpFAQ: undefined;
  Feedback: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const STROKE = {
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

/** Dual paw “trail” icon — inactive: muted white strokes; active: accent + indicator dot (matches supplied SVG art). */
function WalkTrailTabIcon({
  size,
  focused,
}: {
  size: number;
  focused: boolean;
}) {
  const strokeColor = focused ? colors.greenDefault :colors.textMuted;
  const paw = {
    ...STROKE,
    stroke: strokeColor,
    strokeWidth: 3,
    fill: "none" as const,
  };

  /** Larger than other tab icons (~2× vector size); paw pairs use a higher scale so they read clearly. */
  const dim = Math.round(size * 1.8);
  const pawScale = 0.72;

  const PawShapes = () => (
    <>
      <Ellipse cx="0" cy="14" rx="14" ry="11" {...paw} />
      <G transform="rotate(-20 -13 2)">
        <Ellipse cx="-13" cy="2" rx="6" ry="7" {...paw} />
      </G>
      <Ellipse cx="-5" cy="-6" rx="6" ry="7" {...paw} />
      <Ellipse cx="5" cy="-6" rx="6" ry="7" {...paw} />
      <G transform="rotate(20 13 2)">
        <Ellipse cx="13" cy="2" rx="6" ry="7" {...paw} />
      </G>
    </>
  );

  return (
    <Svg
      width={dim}
      height={dim}
      viewBox="-32 -26 64 68"
      accessibilityRole="image"
      accessibilityLabel="Walks">
      <G transform={`translate(-18,8) rotate(-15) scale(${pawScale})`}>
        <PawShapes />
      </G>
      <G transform={`translate(18,-4) rotate(15) scale(${pawScale})`}>
        <PawShapes />
      </G>
    </Svg>
  );
}

function TabIcon({
  name,
  color,
  size,
  focused,
}: {
  name: string;
  color: string;
  size: number;
  focused?: boolean;
}) {
  const s = { ...STROKE, stroke: color, strokeWidth: 1.75 };
  switch (name) {
    case "Walks":
      return <WalkTrailTabIcon size={size} focused={focused ?? false} />;
    case "Clients":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" {...s} />
          <Circle cx="9" cy="7" r="4" {...s} />
          <Path d="M23 21v-2a4 4 0 00-3-3.87" {...s} />
          <Path d="M16 3.13a4 4 0 010 7.75" {...s} />
        </Svg>
      );
    case "Schedule":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" {...s} />
          <Line x1="16" y1="2" x2="16" y2="6" {...s} />
          <Line x1="8" y1="2" x2="8" y2="6" {...s} />
          <Line x1="3" y1="10" x2="21" y2="10" {...s} />
        </Svg>
      );
    case "Payments":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="1" y="4" width="22" height="16" rx="2" ry="2" {...s} />
          <Line x1="1" y1="10" x2="23" y2="10" {...s} />
        </Svg>
      );
    case "Settings":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" {...s} />
          <Circle cx="12" cy="7" r="4" {...s} />
        </Svg>
      );
    default:
      return null;
  }
}

const TAB_LABELS: Record<keyof TabParamList, string> = {
  Clients: "Clients",
  Schedule: "Schedule",
  Walks: "Walks",
  Payments: "Payments",
  Settings: "Profile",
};

function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Walks"
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarIcon: ({ focused, size }) => (
          <TabIcon
            name={route.name}
            focused={focused}
            color={focused ? colors.greenDefault : colors.textMuted}
            size={size}
          />
        ),
        tabBarLabel: TAB_LABELS[route.name],
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.bg,
          position: "relative",
          height: 82,
          paddingBottom: 12,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.greenDefault,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
        },
      })}>
      <Tab.Screen name="Clients" component={ClientsScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Walks" component={DashboardScreen} />
      <Tab.Screen name="Payments" component={PaymentsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="ClientDetail" component={ClientDetailScreen} />
      <Stack.Screen
        name="DogDetail"
        component={DogDetailScreen}
        options={{
          contentStyle: { backgroundColor: design.colors.surface },
        }}
      />
      <Stack.Screen name="ActiveWalk" component={ActiveWalkScreen} />
      <Stack.Screen name="EditWalk" component={EditWalkScreen} />
      <Stack.Screen name="AddWalk" component={AddWalkScreen} />
      <Stack.Screen name="AddClient" component={AddClientScreen} />
      <Stack.Screen name="EditClient" component={EditClientScreen} />
      <Stack.Screen name="EditDog" component={EditDogScreen} />
      <Stack.Screen
        name="Subscriptions"
        component={SubscriptionsScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="HelpFAQ"
        component={HelpFAQScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{ animation: "slide_from_right" }}
      />
    </Stack.Navigator>
  );
}

export default function Navigation() {
  const { session, loading, setSession } = useAuthStore();
  const loadClients = useAppStore((s) => s.loadClients);
  const loadWalks = useAppStore((s) => s.loadWalks);
  const clearData = useAppStore((s) => s.clearData);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      clearData();
      return;
    }

    loadClients(userId);
    loadWalks(userId);
  }, [session?.user?.id]);

  /** Re-run missed-walk sweep when app returns to foreground (tighter than ~15m BackgroundFetch alone). */
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") {
        void loadWalks(userId);
      }
    });
    return () => sub.remove();
  }, [session?.user?.id, loadWalks]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.bg,
        }}>
        <ActivityIndicator color={colors.greenDefault} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
