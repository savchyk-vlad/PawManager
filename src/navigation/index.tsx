import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { useAppStore } from '../store';

import DashboardScreen from '../screens/DashboardScreen';
import ClientsScreen from '../screens/ClientsScreen';
import ClientDetailScreen from '../screens/ClientDetailScreen';
import ScheduleScreen from '../screens/ScheduleScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import ActiveWalkScreen from '../screens/ActiveWalkScreen';
import AddWalkScreen from '../screens/AddWalkScreen';
import AddClientScreen from '../screens/AddClientScreen';
import EditClientScreen from '../screens/EditClientScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AuthNavigator from './AuthNavigator';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

export type RootStackParamList = {
  Tabs: undefined;
  ClientDetail: { clientId: string };
  ActiveWalk: { walkId: string };
  AddWalk: undefined;
  AddClient: undefined;
  EditClient: { clientId: string };
};

export type TabParamList = {
  Dashboard: undefined;
  Clients: undefined;
  Schedule: undefined;
  Payments: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ACTIVE = '#5CAF72';
const TAB_INACTIVE = '#606058';
const TAB_BG = '#1D1D1A';
/** Matches Dashboard (and tab scene) so safe areas / gaps never flash default white. */
const TAB_SCENE_BG = '#141412';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconsName; inactive: IoniconsName }> = {
  Dashboard: { active: 'home', inactive: 'home-outline' },
  Clients:   { active: 'people', inactive: 'people-outline' },
  Schedule:  { active: 'calendar', inactive: 'calendar-outline' },
  Payments:  { active: 'cash', inactive: 'cash-outline' },
  Settings:  { active: 'person', inactive: 'person-outline' },
};

const TAB_LABELS: Record<string, string> = {
  Dashboard: 'Home',
  Clients: 'Clients',
  Schedule: 'Schedule',
  Payments: 'Payments',
  Settings: 'Profile',
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        /** Avoid default white behind tab screens + home-indicator gap. */
        sceneStyle: { backgroundColor: TAB_SCENE_BG },
        tabBarIcon: ({ focused, size }) => {
          const icons = TAB_ICONS[route.name];
          return (
            <Ionicons
              name={focused ? icons.active : icons.inactive}
              size={size}
              color={focused ? TAB_ACTIVE : TAB_INACTIVE}
            />
          );
        },
        tabBarLabel: TAB_LABELS[route.name],
        tabBarStyle: {
          backgroundColor: TAB_BG,
          borderTopWidth: 1,
          borderTopColor: TAB_SCENE_BG,
          height: 82,
          paddingBottom: 12,
          paddingTop: 10,
        },
        tabBarActiveTintColor: TAB_ACTIVE,
        tabBarInactiveTintColor: TAB_INACTIVE,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Clients" component={ClientsScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
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
        contentStyle: { backgroundColor: TAB_SCENE_BG },
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="ClientDetail" component={ClientDetailScreen} />
      <Stack.Screen name="ActiveWalk" component={ActiveWalkScreen} />
      <Stack.Screen name="AddWalk" component={AddWalkScreen} />
      <Stack.Screen name="AddClient" component={AddClientScreen} />
      <Stack.Screen name="EditClient" component={EditClientScreen} />
    </Stack.Navigator>
  );
}

export default function Navigation() {
  const { session, loading, setSession } = useAuthStore();
  const loadClients = useAppStore((s) => s.loadClients);
  const loadWalks = useAppStore((s) => s.loadWalks);
  const clearData = useAppStore((s) => s.clearData);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
