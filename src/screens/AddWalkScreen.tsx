import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store';
import { Client, Dog } from '../types';
import { RootStackParamList } from '../navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const C = {
  bg: '#141412',
  card: '#1D1D1A',
  border: 'rgba(255,255,255,0.07)',
  green: '#2A5730',
  greenText: '#5CAF72',
  amber: '#F0A030',
  text: '#FFFFFF',
  textSub: '#8BA890',
  textMuted: '#606058',
  selected: '#243E2A',
  selectedBorder: '#3D7C47',
};

const DURATIONS = [20, 30, 45, 60];

function timeSlots() {
  const now = new Date();
  const slots: { label: string; iso: string }[] = [];
  const rounded = new Date(now);
  rounded.setSeconds(0, 0);
  rounded.setMinutes(Math.ceil(rounded.getMinutes() / 15) * 15);
  for (let i = 0; i < 6; i++) {
    const d = new Date(rounded.getTime() + i * 30 * 60000);
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    slots.push({ label: `${h12}:${m} ${ampm}`, iso: d.toISOString() });
  }
  return slots;
}

export default function AddWalkScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { clients, addWalk } = useAppStore();

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedDogs, setSelectedDogs] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>(new Date().toISOString());
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const slots = timeSlots();

  const toggleDog = (dogId: string) => {
    setSelectedDogs((prev) =>
      prev.includes(dogId) ? prev.filter((id) => id !== dogId) : [...prev, dogId]
    );
  };

  const selectClient = (client: Client) => {
    setSelectedClient(client);
    setSelectedDogs(client.dogs.map((d) => d.id));
  };

  const canSave = selectedClient && selectedDogs.length > 0;

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await addWalk({
        clientId: selectedClient.id,
        dogIds: selectedDogs,
        scheduledAt: selectedTime,
        durationMinutes: duration,
        notes: notes || undefined,
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not schedule walk.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[s.safe, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="close" size={20} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Schedule Walk</Text>
        <TouchableOpacity
          style={[s.saveBtn, (!canSave || saving) && { opacity: 0.4 }]}
          onPress={handleSave}
          disabled={!canSave || saving}
        >
          {saving ? <ActivityIndicator size="small" color="white" /> : <Text style={s.saveBtnText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled">

        {/* Client */}
        <Text style={s.sectionLabel}>CLIENT</Text>
        <View style={s.card}>
          {clients.map((client, i) => {
            const active = selectedClient?.id === client.id;
            return (
              <TouchableOpacity
                key={client.id}
                style={[
                  s.clientRow,
                  i < clients.length - 1 && s.rowBorder,
                  active && s.clientRowActive,
                ]}
                onPress={() => selectClient(client)}
              >
                <View style={[s.clientInitial, active && s.clientInitialActive]}>
                  <Text style={[s.clientInitialText, active && { color: C.greenText }]}>
                    {client.name[0]}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.clientName}>{client.name}</Text>
                  <Text style={s.clientMeta}>
                    {client.dogs.map((d) => d.name).join(', ')} · ${client.pricePerWalk}
                  </Text>
                </View>
                {active && <Ionicons name="checkmark-circle" size={20} color={C.greenText} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Dogs */}
        {selectedClient && selectedClient.dogs.length > 1 && (
          <>
            <Text style={s.sectionLabel}>DOGS</Text>
            <View style={s.card}>
              {selectedClient.dogs.map((dog: Dog, i) => {
                const active = selectedDogs.includes(dog.id);
                return (
                  <TouchableOpacity
                    key={dog.id}
                    style={[s.clientRow, i < selectedClient.dogs.length - 1 && s.rowBorder]}
                    onPress={() => toggleDog(dog.id)}
                  >
                    <Text style={{ fontSize: 22, width: 36, textAlign: 'center' }}>{dog.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.clientName}>{dog.name}</Text>
                      <Text style={s.clientMeta}>{dog.breed}</Text>
                    </View>
                    <View style={[s.checkbox, active && s.checkboxActive]}>
                      {active && <Ionicons name="checkmark" size={14} color="white" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Time */}
        <Text style={s.sectionLabel}>TIME</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 0 }}>
            {slots.map((slot) => {
              const active = slot.iso === selectedTime ||
                (selectedTime && new Date(selectedTime).getTime() === new Date(slot.iso).getTime());
              return (
                <TouchableOpacity
                  key={slot.iso}
                  style={[s.timeChip, selectedTime === slot.iso && s.timeChipActive]}
                  onPress={() => setSelectedTime(slot.iso)}
                >
                  <Text style={[s.timeChipText, selectedTime === slot.iso && s.timeChipTextActive]}>
                    {slot.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Duration */}
        <Text style={s.sectionLabel}>DURATION</Text>
        <View style={s.segRow}>
          {DURATIONS.map((d) => (
            <TouchableOpacity
              key={d}
              style={[s.seg, duration === d && s.segActive]}
              onPress={() => setDuration(d)}
            >
              <Text style={[s.segText, duration === d && s.segTextActive]}>{d} min</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes */}
        <Text style={s.sectionLabel}>NOTES (OPTIONAL)</Text>
        <View style={s.card}>
          <TextInput
            style={s.notesInput}
            placeholder="Special instructions, gate codes…"
            placeholderTextColor={C.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[s.saveFullBtn, (!canSave || saving) && { opacity: 0.4 }]}
          onPress={handleSave}
          disabled={!canSave || saving}
        >
          {saving ? <ActivityIndicator color="white" /> : <Text style={s.saveFullBtnText}>Schedule Walk</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.card,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '600', color: C.text },
  saveBtn: {
    paddingHorizontal: 16, paddingVertical: 7,
    backgroundColor: C.green, borderRadius: 999,
  },
  saveBtnText: { fontSize: 13, fontWeight: '600', color: 'white' },

  content: { padding: 16, paddingBottom: 48 },

  sectionLabel: {
    fontSize: 11, fontWeight: '600', letterSpacing: 1.2,
    color: C.textMuted, marginBottom: 8, marginTop: 20,
  },

  card: {
    backgroundColor: C.card,
    borderRadius: 14,
    overflow: 'hidden',
  },

  clientRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 14, gap: 12,
  },
  clientRowActive: { backgroundColor: C.selected },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  clientInitial: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#252522',
    alignItems: 'center', justifyContent: 'center',
  },
  clientInitialActive: { backgroundColor: C.selected },
  clientInitialText: { fontSize: 15, fontWeight: '600', color: C.textMuted },
  clientName: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 2 },
  clientMeta: { fontSize: 12, color: C.textSub },

  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5, borderColor: C.textMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: C.green, borderColor: C.green },

  timeChip: {
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: C.card, borderRadius: 10,
    borderWidth: 1, borderColor: C.border,
  },
  timeChipActive: { backgroundColor: C.selected, borderColor: C.selectedBorder },
  timeChipText: { fontSize: 13, fontWeight: '500', color: C.textSub },
  timeChipTextActive: { color: C.greenText, fontWeight: '600' },

  segRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  seg: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: C.card, alignItems: 'center',
    borderWidth: 1, borderColor: C.border,
  },
  segActive: { backgroundColor: C.selected, borderColor: C.selectedBorder },
  segText: { fontSize: 13, fontWeight: '500', color: C.textSub },
  segTextActive: { color: C.greenText, fontWeight: '600' },

  notesInput: {
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: C.text, minHeight: 72,
    textAlignVertical: 'top',
  },

  saveFullBtn: {
    marginTop: 28,
    backgroundColor: C.green,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
  },
  saveFullBtnText: { fontSize: 15, fontWeight: '700', color: 'white' },
});
