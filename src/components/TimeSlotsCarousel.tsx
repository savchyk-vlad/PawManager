import React, { useRef, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { parseISO } from 'date-fns';
import { colors } from '../theme';

const CHIP_WIDTH = 86;
const CHIP_GAP = 8;

type Props = {
  slots: { label: string; iso: string }[];
  selectedTime: string;
  takenSlotKeys: Set<string>;
  onSelectedTimeChange: (value: string) => void;
  onPickTime?: () => void;
  showRequiredHint?: boolean;
};

export function TimeSlotsCarousel({
  slots,
  selectedTime,
  takenSlotKeys,
  onSelectedTimeChange,
  onPickTime,
  showRequiredHint = false,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const activeIdx = slots.findIndex(
      (slot) =>
        slot.iso === selectedTime ||
        new Date(selectedTime).getTime() === new Date(slot.iso).getTime()
    );
    if (activeIdx > 1) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          x: Math.max(0, (activeIdx - 1) * (CHIP_WIDTH + CHIP_GAP)),
          animated: false,
        });
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={s.timeCarouselWrap}>
      {showRequiredHint && (
        <Text style={s.requiredHint}>Tap a time slot to continue</Text>
      )}
      <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.timeSlotsWrap}>
        {slots.map((slot) => {
          const when = parseISO(slot.iso);
          const slotKey = `${when.getHours()}:${when.getMinutes()}`;
          const taken = takenSlotKeys.has(slotKey);
          const active =
            slot.iso === selectedTime || new Date(selectedTime).getTime() === new Date(slot.iso).getTime();
          return (
            <TouchableOpacity
              key={slot.iso}
              style={[s.timeChip, active && s.timeChipActive, taken && s.timeChipTaken]}
              onPress={() => {
                if (taken) return;
                onSelectedTimeChange(slot.iso);
                onPickTime?.();
              }}
              disabled={taken}
            >
              <Text style={[s.timeChipText, active && s.timeChipTextActive]}>
                {slot.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  timeCarouselWrap: { marginBottom: 16 },
  requiredHint: {
    fontSize: 11, color: '#F0A030', fontWeight: '500',
    marginBottom: 8, letterSpacing: 0.2,
  },
  timeSlotsWrap: { flexDirection: 'row', gap: 8, paddingRight: 8 },
  timeChip: {
    minWidth: 86,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  timeChipActive: { backgroundColor: colors.greenDeep, borderColor: colors.greenDefault },
  timeChipTaken: { opacity: 0.5, borderColor: 'rgba(240,160,48,0.35)' },
  timeChipText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  timeChipTextActive: { color: colors.greenDefault, fontWeight: '600' },
});
