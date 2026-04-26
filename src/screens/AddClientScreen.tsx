import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { FormKeyboardScrollView } from '../components/FormKeyboardScrollView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store';
import { useAuthStore } from '../store/authStore';
import { Dog } from '../types';

const C = {
  bg: '#141412',
  card: '#1D1D1A',
  border: 'rgba(255,255,255,0.07)',
  borderInput: 'rgba(255,255,255,0.12)',
  green: '#2A5730',
  greenText: '#5CAF72',
  text: '#FFFFFF',
  textSub: '#8BA890',
  textMuted: '#606058',
  red: '#E04040',
};

const DOG_EMOJIS = ['🐕', '🦮', '🐩', '🐾', '🦴', '🐶', '🐕‍🦺'];

function Field({
  label, value, onChangeText, placeholder, keyboardType, autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'phone-pad' | 'numeric';
  autoCapitalize?: 'none' | 'words' | 'sentences';
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={f.group}>
      <Text style={f.label}>{label}</Text>
      <TextInput
        style={[f.input, focused && f.inputFocused]}
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

type DogForm = { name: string; breed: string; emoji: string };

export default function AddClientScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const addClient = useAppStore((s) => s.addClient);
  const { user } = useAuthStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [dogs, setDogs] = useState<DogForm[]>([{ name: '', breed: '', emoji: '🐕' }]);
  const [saving, setSaving] = useState(false);

  const canSave = name.trim() && dogs.every((d) => d.name.trim());

  const addDog = () => setDogs((prev) => [...prev, { name: '', breed: '', emoji: '🐕' }]);

  const updateDog = (i: number, field: keyof DogForm, val: string) => {
    setDogs((prev) => prev.map((d, idx) => idx === i ? { ...d, [field]: val } : d));
  };

  const removeDog = (i: number) => {
    if (dogs.length === 1) return;
    setDogs((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    if (!canSave || saving || !user) return;
    setSaving(true);
    try {
      const newDogs: Dog[] = dogs.map((d) => ({
        id: '',
        name: d.name.trim(),
        breed: d.breed.trim() || 'Unknown',
        age: 0,
        weight: 0,
        emoji: d.emoji,
        traits: [],
        vet: '',
        vetPhone: '',
        medical: '',
        keyLocation: '',
      }));
      await addClient(
        { name: name.trim(), phone: phone.trim(), address: address.trim(), pricePerWalk: parseFloat(price) || 0, dogs: newDogs },
        user.id,
      );
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not save client. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[s.safe, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={20} color={C.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>New Client</Text>
        <TouchableOpacity
          style={[s.saveBtn, (!canSave || saving) && { opacity: 0.4 }]}
          onPress={handleSave}
          disabled={!canSave || saving}
        >
          {saving ? <ActivityIndicator size="small" color="white" /> : <Text style={s.saveBtnText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <FormKeyboardScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[s.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        smoothKeyboardHide
      >
        {/* Client info */}
        <Text style={s.sectionLabel}>CLIENT INFO</Text>
        <View style={s.card}>
          <Field label="Full Name" value={name} onChangeText={setName} placeholder="Jane Smith" />
          <View style={s.cardDivider} />
          <Field label="Phone" value={phone} onChangeText={setPhone} placeholder="(555) 000-0000" keyboardType="phone-pad" autoCapitalize="none" />
          <View style={s.cardDivider} />
          <Field label="Address" value={address} onChangeText={setAddress} placeholder="123 Main St, City" autoCapitalize="sentences" />
          <View style={s.cardDivider} />
          <Field label="Price per Walk ($)" value={price} onChangeText={setPrice} placeholder="25" keyboardType="numeric" autoCapitalize="none" />
        </View>

        {/* Dogs */}
        <Text style={s.sectionLabel}>DOGS</Text>
        {dogs.map((dog, i) => (
          <View key={i} style={[s.card, { marginBottom: 10 }]}>
            {/* Emoji row */}
            <View style={s.emojiRow}>
              <Text style={s.emojiLabel}>ICON</Text>
              <View style={s.emojiGrid}>
                {DOG_EMOJIS.map((e) => (
                  <TouchableOpacity
                    key={e}
                    style={[s.emojiChip, dog.emoji === e && s.emojiChipActive]}
                    onPress={() => updateDog(i, 'emoji', e)}
                  >
                    <Text style={{ fontSize: 20 }}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={s.cardDivider} />
            <Field
              label="Dog Name"
              value={dog.name}
              onChangeText={(v) => updateDog(i, 'name', v)}
              placeholder="Buddy"
            />
            <View style={s.cardDivider} />
            <Field
              label="Breed"
              value={dog.breed}
              onChangeText={(v) => updateDog(i, 'breed', v)}
              placeholder="Golden Retriever"
            />

            {dogs.length > 1 && (
              <>
                <View style={s.cardDivider} />
                <TouchableOpacity style={s.removeDogBtn} onPress={() => removeDog(i)}>
                  <Ionicons name="trash-outline" size={15} color={C.red} />
                  <Text style={s.removeDogText}>Remove dog</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ))}

        <TouchableOpacity style={s.addDogBtn} onPress={addDog}>
          <Ionicons name="add" size={18} color={C.greenText} />
          <Text style={s.addDogText}>Add another dog</Text>
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity
          style={[s.saveFullBtn, !canSave && { opacity: 0.4 }]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <Text style={s.saveFullBtnText}>Add Client</Text>
        </TouchableOpacity>
      </FormKeyboardScrollView>
    </View>
  );
}

const f = StyleSheet.create({
  group: { paddingHorizontal: 14, paddingVertical: 12 },
  label: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.8,
    color: C.textMuted, marginBottom: 6, textTransform: 'uppercase',
  },
  input: {
    fontSize: 15, color: C.text,
    borderBottomWidth: 0,
    paddingVertical: 0,
  },
  inputFocused: { color: '#FFFFFF' },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  closeBtn: {
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

  content: { padding: 16 },

  sectionLabel: {
    fontSize: 11, fontWeight: '600', letterSpacing: 1.2,
    color: C.textMuted, marginBottom: 8, marginTop: 20,
  },

  card: { backgroundColor: C.card, borderRadius: 14, overflow: 'hidden' },
  cardDivider: { height: StyleSheet.hairlineWidth, backgroundColor: C.border, marginHorizontal: 14 },

  emojiRow: { paddingHorizontal: 14, paddingVertical: 12 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 4 },
  emojiLabel: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.8,
    color: C.textMuted, marginBottom: 8, textTransform: 'uppercase',
  },
  emojiChip: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#252522',
    alignItems: 'center', justifyContent: 'center',
  },
  emojiChipActive: { backgroundColor: '#243E2A', borderWidth: 1.5, borderColor: '#3D7C47' },

  removeDogBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  removeDogText: { fontSize: 13, color: C.red, fontWeight: '500' },

  addDogBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 14, justifyContent: 'center',
    backgroundColor: C.card, borderRadius: 14,
    marginBottom: 4,
  },
  addDogText: { fontSize: 14, fontWeight: '600', color: C.greenText },

  saveFullBtn: {
    marginTop: 24,
    backgroundColor: C.green,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
  },
  saveFullBtnText: { fontSize: 15, fontWeight: '700', color: 'white' },
});
