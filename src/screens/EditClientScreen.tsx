import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store';
import { RootStackParamList } from '../navigation';
import { Dog } from '../types';

type Route = RouteProp<RootStackParamList, 'EditClient'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const C = {
  bg: '#141412',
  card: '#1D1D1A',
  border: 'rgba(255,255,255,0.07)',
  green: '#2A5730',
  greenText: '#5CAF72',
  text: '#FFFFFF',
  textSub: '#8BA890',
  textMuted: '#606058',
  red: '#E04040',
  redBg: 'rgba(224,64,64,0.10)',
};

const DOG_EMOJIS = ['🐕', '🦮', '🐩', '🐾', '🐶', '🐕‍🦺', '🦴'];

function Field({
  label, value, onChangeText, placeholder, keyboardType, autoCapitalize,
}: {
  label: string; value: string; onChangeText: (t: string) => void;
  placeholder?: string; keyboardType?: 'default' | 'phone-pad' | 'numeric';
  autoCapitalize?: 'none' | 'words' | 'sentences';
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={f.group}>
      <Text style={f.label}>{label}</Text>
      <TextInput
        style={[f.input, focused && { color: C.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.textMuted}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'words'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

type DogDraft = { id: string; name: string; breed: string; emoji: string; isNew: boolean };

export default function EditClientScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insets = useSafeAreaInsets();
  const { clients, updateClient, addDogToClient, removeDogFromClient, removeClient } = useAppStore();

  const client = clients.find((c) => c.id === route.params.clientId);
  if (!client) return null;

  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(client.phone);
  const [address, setAddress] = useState(client.address);
  const [price, setPrice] = useState(String(client.pricePerWalk));
  const [dogs, setDogs] = useState<DogDraft[]>(
    client.dogs.map((d) => ({ id: d.id, name: d.name, breed: d.breed, emoji: d.emoji, isNew: false }))
  );
  const [removedDogIds, setRemovedDogIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const canSave = name.trim() && dogs.filter((d) => !removedDogIds.includes(d.id)).every((d) => d.name.trim());

  const addDogDraft = () => {
    setDogs((prev) => [...prev, {
      id: `new-${Date.now()}`, name: '', breed: '', emoji: '🐕', isNew: true,
    }]);
  };

  const updateDog = (id: string, field: keyof DogDraft, val: string) => {
    setDogs((prev) => prev.map((d) => d.id === id ? { ...d, [field]: val } : d));
  };

  const markRemoved = (id: string) => {
    if (dogs.find((d) => d.id === id)?.isNew) {
      setDogs((prev) => prev.filter((d) => d.id !== id));
    } else {
      setRemovedDogIds((prev) => [...prev, id]);
    }
  };

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      // 1. Update client fields
      await updateClient(client.id, {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        pricePerWalk: parseFloat(price) || 0,
      });

      // 2. Remove deleted dogs
      for (const dogId of removedDogIds) {
        await removeDogFromClient(client.id, dogId);
      }

      // 3. Add new dogs
      for (const draft of dogs.filter((d) => d.isNew && !removedDogIds.includes(d.id))) {
        const newDog: Omit<Dog, 'id'> = {
          name: draft.name.trim(),
          breed: draft.breed.trim() || 'Unknown',
          emoji: draft.emoji,
          age: 0, weight: 0, traits: [],
          vet: '', vetPhone: '', medical: '', keyLocation: '',
        };
        await addDogToClient(client.id, newDog);
      }

      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = () => {
    Alert.alert(
      'Remove client?',
      `${client.name} and all their data will be permanently deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeClient(client.id);
              navigation.navigate('Tabs');
            } catch (e: any) {
              Alert.alert('Error', e?.message ?? 'Could not delete client.');
            }
          },
        },
      ]
    );
  };

  const activeDogs = dogs.filter((d) => !removedDogIds.includes(d.id));

  return (
    <View style={[s.safe, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={20} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Edit Client</Text>
        <TouchableOpacity
          style={[s.saveBtn, (!canSave || saving) && { opacity: 0.4 }]}
          onPress={handleSave}
          disabled={!canSave || saving}
        >
          {saving
            ? <ActivityIndicator size="small" color="white" />
            : <Text style={s.saveBtnText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Client info */}
        <Text style={s.sectionLabel}>CLIENT INFO</Text>
        <View style={s.card}>
          <Field label="Full Name" value={name} onChangeText={setName} placeholder="Jane Smith" />
          <View style={s.divider} />
          <Field label="Phone" value={phone} onChangeText={setPhone} placeholder="(555) 000-0000" keyboardType="phone-pad" autoCapitalize="none" />
          <View style={s.divider} />
          <Field label="Address" value={address} onChangeText={setAddress} placeholder="123 Main St" autoCapitalize="sentences" />
          <View style={s.divider} />
          <Field label="Price per Walk ($)" value={price} onChangeText={setPrice} placeholder="25" keyboardType="numeric" autoCapitalize="none" />
        </View>

        {/* Dogs */}
        <Text style={s.sectionLabel}>DOGS</Text>
        {activeDogs.map((dog) => (
          <View key={dog.id} style={[s.card, { marginBottom: 10 }]}>
            {/* Emoji picker */}
            <View style={s.emojiRow}>
              <Text style={s.emojiLabel}>ICON</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
                  {DOG_EMOJIS.map((e) => (
                    <TouchableOpacity
                      key={e}
                      style={[s.emojiChip, dog.emoji === e && s.emojiChipActive]}
                      onPress={() => updateDog(dog.id, 'emoji', e)}
                    >
                      <Text style={{ fontSize: 20 }}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            <View style={s.divider} />
            <Field label="Dog Name" value={dog.name} onChangeText={(v) => updateDog(dog.id, 'name', v)} placeholder="Buddy" />
            <View style={s.divider} />
            <Field label="Breed" value={dog.breed} onChangeText={(v) => updateDog(dog.id, 'breed', v)} placeholder="Golden Retriever" />
            <View style={s.divider} />
            <TouchableOpacity style={s.removeRow} onPress={() => markRemoved(dog.id)}>
              <Ionicons name="trash-outline" size={15} color={C.red} />
              <Text style={s.removeText}>Remove dog</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={s.addDogBtn} onPress={addDogDraft}>
          <Ionicons name="add" size={18} color={C.greenText} />
          <Text style={s.addDogText}>Add another dog</Text>
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity
          style={[s.saveFullBtn, (!canSave || saving) && { opacity: 0.4 }]}
          onPress={handleSave}
          disabled={!canSave || saving}
        >
          {saving
            ? <ActivityIndicator color="white" />
            : <Text style={s.saveFullBtnText}>Save Changes</Text>}
        </TouchableOpacity>

        {/* Delete client */}
        <TouchableOpacity style={s.deleteBtn} onPress={handleDeleteClient}>
          <Ionicons name="trash-outline" size={16} color={C.red} />
          <Text style={s.deleteBtnText}>Remove Client</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const f = StyleSheet.create({
  group: { paddingHorizontal: 14, paddingVertical: 12 },
  label: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.8,
    color: C.textMuted, marginBottom: 6, textTransform: 'uppercase',
  },
  input: { fontSize: 15, color: C.textSub },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.card, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: '600', color: C.text },
  saveBtn: {
    paddingHorizontal: 16, paddingVertical: 7,
    backgroundColor: C.green, borderRadius: 999,
  },
  saveBtnText: { fontSize: 13, fontWeight: '600', color: 'white' },

  content: { padding: 16 },

  sectionLabel: {
    fontSize: 11, fontWeight: '600', letterSpacing: 1.2,
    color: C.textMuted, marginBottom: 8, marginTop: 20,
  },

  card: { backgroundColor: C.card, borderRadius: 14, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: C.border, marginHorizontal: 14 },

  emojiRow: { paddingHorizontal: 14, paddingVertical: 12 },
  emojiLabel: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.8,
    color: C.textMuted, marginBottom: 8, textTransform: 'uppercase',
  },
  emojiChip: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#252522', alignItems: 'center', justifyContent: 'center',
  },
  emojiChipActive: { backgroundColor: '#243E2A', borderWidth: 1.5, borderColor: '#3D7C47' },

  removeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  removeText: { fontSize: 13, color: C.red, fontWeight: '500' },

  addDogBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 14, backgroundColor: C.card, borderRadius: 14, marginBottom: 4,
  },
  addDogText: { fontSize: 14, fontWeight: '600', color: C.greenText },

  saveFullBtn: {
    marginTop: 24, backgroundColor: C.green,
    borderRadius: 14, paddingVertical: 17, alignItems: 'center',
  },
  saveFullBtnText: { fontSize: 15, fontWeight: '700', color: 'white' },

  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 16, paddingVertical: 16,
    backgroundColor: C.redBg, borderRadius: 14,
  },
  deleteBtnText: { fontSize: 15, fontWeight: '600', color: C.red },
});
