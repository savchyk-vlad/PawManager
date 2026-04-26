import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, Linking, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store';
import { RootStackParamList } from '../navigation';

type Route = RouteProp<RootStackParamList, 'ActiveWalk'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function ActiveWalkScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { walks, clients, startWalk, finishWalk } = useAppStore();

  const walk = walks.find((w) => w.id === route.params.walkId);
  if (!walk) return null;

  const client = clients.find((c) => c.id === walk.clientId);
  if (!client) return null;
  const dogs = client.dogs.filter((d) => walk.dogIds.includes(d.id));
  const dog = dogs[0];
  const dogNames = dogs.map((d) => d.name).join(' & ');
  const dogEmoji = dog?.emoji ?? '🐕';

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (walk.status !== 'scheduled') return;

    startWalk(walk.id).catch((error: Error) => {
      Alert.alert('Error', error.message);
      navigation.goBack();
    });
  }, [navigation, startWalk, walk.id, walk.status]);

  useEffect(() => {
    const startedAt = walk.startedAt;
    if (!startedAt) {
      setElapsed(0);
      return;
    }

    const updateElapsed = () => {
      const startedAtMs = new Date(startedAt).getTime();
      setElapsed(Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000)));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [walk.startedAt]);

  const handleFinish = () => {
    Alert.alert(
      'Finish walk?',
      `Duration: ${formatTime(elapsed)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          onPress: async () => {
            try {
              await finishWalk(walk.id);
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', error?.message ?? 'Could not finish walk.');
            }
          },
        },
      ]
    );
  };

  const notesText = [
    dog?.keyLocation && `Key: ${dog.keyLocation}`,
    dog?.medical && dog.medical,
    dog?.vet && `Vet: ${dog.vet}${dog.vetPhone ? ` (${dog.vetPhone})` : ''}`,
  ].filter(Boolean).join('\n');

  return (
    <LinearGradient
      colors={['#2A5730', '#3D7C47', '#5AA065']}
      locations={[0, 0.6, 1]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <View style={{ paddingTop: insets.top, flex: 1 }}>
        <ScrollView
          contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Top bar */}
          <View style={s.topBar}>
            <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={16} color="white" />
              <Text style={s.backText}>Back</Text>
            </TouchableOpacity>
            <Text style={s.inProgressLabel}>WALK IN PROGRESS</Text>
            <View style={{ width: 72 }} />
          </View>

          {/* Dog avatar */}
          <View style={s.avatarCircle}>
            <Text style={{ fontSize: 40 }}>{dogEmoji}</Text>
          </View>

          {/* Dog info */}
          <Text style={s.dogName}>{dogNames}</Text>
          <Text style={s.dogSub}>
            {client.name}{dog?.breed ? ` · ${dog.breed}` : ''}
          </Text>

          {/* Timer */}
          <View style={s.timerBlock}>
            <Text style={s.timer}>{formatTime(elapsed)}</Text>
            <Text style={s.timerSub}>of {walk.durationMinutes} min walk</Text>
          </View>

          {/* Action buttons */}
          <View style={s.actionsRow}>
            <TouchableOpacity
              style={s.actionBtn}
              onPress={() => client.phone && Linking.openURL(`tel:${client.phone}`)}
            >
              <Ionicons name="call-outline" size={20} color="white" />
              <Text style={s.actionLabel}>Call Owner</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.actionBtn}
              onPress={() => {
                const addr = encodeURIComponent(client.address);
                Linking.openURL(`maps://maps.google.com/maps?daddr=${addr}`);
              }}
            >
              <Ionicons name="location-outline" size={20} color="white" />
              <Text style={s.actionLabel}>Navigate</Text>
            </TouchableOpacity>
          </View>

          {/* Walker notes */}
          {notesText.length > 0 && (
            <View style={s.notesCard}>
              <Text style={s.notesLabel}>WALKER NOTES</Text>
              <Text style={s.notesText}>{notesText}</Text>
            </View>
          )}

          {/* Finish button */}
          <TouchableOpacity style={s.finishBtn} onPress={handleFinish}>
            <Text style={s.finishBtnText}>Finish Walk</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 12 },

  topBar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 999,
  },
  backText: { fontSize: 13, fontWeight: '500', color: 'white' },
  inProgressLabel: {
    fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.5,
  },

  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginTop: 16, marginBottom: 12,
  },

  dogName: {
    fontSize: 28, fontWeight: '700', color: 'white',
    textAlign: 'center', letterSpacing: -0.5,
  },
  dogSub: {
    fontSize: 14, color: 'rgba(255,255,255,0.8)',
    textAlign: 'center', marginTop: 4,
  },

  timerBlock: { alignItems: 'center', paddingVertical: 28 },
  timer: {
    fontSize: 52, fontWeight: '300', color: 'white',
    letterSpacing: 2,
  },
  timerSub: {
    fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4,
  },

  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center', gap: 6,
  },
  actionLabel: { fontSize: 13, fontWeight: '600', color: 'white' },

  notesCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  notesLabel: {
    fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8,
  },
  notesText: {
    fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 20,
  },

  finishBtn: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
  },
  finishBtnText: {
    fontSize: 16, fontWeight: '700', color: '#2A5730',
  },
});
