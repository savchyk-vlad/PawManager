import React from 'react';
import { useFormLayoutAnimationKey } from '../hooks/useFormLayoutAnimation';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { FormField } from './FormField';
import { Walk } from '../types';
import {
  useSettingsStore,
  WALK_DURATION_PRESETS,
} from '../store/settingsStore';
import { useWalkScheduling } from '../hooks/useWalkScheduling';
import { ScheduleCalendar } from './ScheduleCalendar';
import { TimeSlotsCarousel } from './TimeSlotsCarousel';
import { colors } from '../theme';

type Props = {
  walks: Walk[];
  selectedTime: string;
  monthDate: Date;
  duration: number;
  customDuration: string;
  notes: string;
  timePicked?: boolean;
  onSelectedTimeChange: (value: string) => void;
  onMonthDateChange: (value: Date) => void;
  onDurationChange: (value: number) => void;
  onCustomDurationChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  excludeWalkId?: string;
  onPickDate?: () => void;
  onPickTime?: () => void;
  onPickDuration?: () => void;
  notesLabel?: string;
  notesPlaceholder?: string;
  onNotesFocus?: () => void;
};

export function WalkScheduleFields({
  walks,
  selectedTime,
  monthDate,
  duration,
  customDuration,
  notes,
  timePicked = true,
  onSelectedTimeChange,
  onMonthDateChange,
  onDurationChange,
  onCustomDurationChange,
  onNotesChange,
  excludeWalkId,
  onPickDate,
  onPickTime,
  onPickDuration,
  notesLabel = 'NOTES (OPTIONAL)',
  notesPlaceholder = 'Special instructions, gate codes…',
  onNotesFocus,
}: Props) {
  const preferredDuration = useSettingsStore((s) => s.defaultWalkDuration);

  const { slots, calendarCells, takenSlotKeys, takenByDayMs } = useWalkScheduling({
    walks,
    selectedTime,
    monthDate,
    duration,
    excludeWalkId,
    onSelectedTimeChange,
  });

  useFormLayoutAnimationKey(`${monthDate.getTime()}-${slots.length}`);

  return (
    <>
      <Text style={s.sectionLabel}>TIME</Text>
      <ScheduleCalendar
        monthDate={monthDate}
        selectedTime={selectedTime}
        calendarCells={calendarCells}
        takenByDayMs={takenByDayMs}
        onMonthDateChange={onMonthDateChange}
        onSelectedTimeChange={onSelectedTimeChange}
        onPickDate={onPickDate}
      />
      <TimeSlotsCarousel
        slots={slots}
        selectedTime={selectedTime}
        takenSlotKeys={takenSlotKeys}
        onSelectedTimeChange={onSelectedTimeChange}
        onPickTime={onPickTime}
        showRequiredHint={!timePicked}
      />
      {slots.length === 0 && (
        <Text style={s.shiftEmptyHint}>
          Nothing fits inside your shift with this duration. Choose a shorter walk or widen shift
          hours in Settings.
        </Text>
      )}

      <Text style={s.sectionLabel}>DURATION</Text>
      <Text style={s.durationPrefHint}>
        Your usual length (Settings): {preferredDuration} min
      </Text>
      <View style={s.segRow}>
        {WALK_DURATION_PRESETS.map((d) => (
          <TouchableOpacity
            key={d}
            style={[
              s.seg,
              duration === d && s.segActive,
              d === preferredDuration && s.segPreferred,
            ]}
            onPress={() => {
              onDurationChange(d);
              onCustomDurationChange('');
              onPickDuration?.();
            }}
          >
            <Text style={[s.segText, duration === d && s.segTextActive]}>{d} min</Text>
          </TouchableOpacity>
        ))}
      </View>
      {(() => {
        const parsed = Number.parseInt(customDuration, 10);
        const isCustomDurationActive =
          Number.isFinite(parsed) &&
          parsed > 0 &&
          !(WALK_DURATION_PRESETS as readonly number[]).includes(parsed) &&
          duration === parsed;
        return (
      <View style={s.customDurationRow}>
        <FormField
          layout="inline"
          label=""
          value={customDuration}
          onChangeText={(t) => {
            const cleaned = t.replace(/\D/g, '');
            onCustomDurationChange(cleaned);
            if (cleaned.length === 0) return;
            const n = parseInt(cleaned, 10);
            if (Number.isFinite(n) && n > 0) {
              onDurationChange(n);
              onPickDuration?.();
            }
          }}
          placeholder="Custom duration"
          keyboardType="number-pad"
          autoCapitalize="none"
          style={[s.customDurationField, isCustomDurationActive && s.customDurationFieldActive]}
          inputStyle={[s.customDurationInput, isCustomDurationActive && s.customDurationInputActive]}
        />
      </View>
        );
      })()}

      <Text style={s.sectionLabel}>{notesLabel}</Text>
      <View style={s.card}>
        <TextInput
          style={s.notesInput}
          placeholder={notesPlaceholder}
          placeholderTextColor={colors.textMuted}
          value={notes}
          onChangeText={onNotesChange}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          blurOnSubmit={false}
          onFocus={onNotesFocus}
        />
      </View>
    </>
  );
}

const s = StyleSheet.create({
  sectionLabel: {
    fontSize: 11, fontWeight: '600', letterSpacing: 1.2,
    color: colors.textMuted, marginBottom: 8, marginTop: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  segRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  durationPrefHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 10,
    letterSpacing: 0.15,
  },
  seg: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: colors.surface, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  segPreferred: {
    borderColor: 'rgba(92, 175, 114, 0.45)',
  },
  segActive: { backgroundColor: colors.greenDeep, borderColor: colors.greenDefault },
  segText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  segTextActive: { color: colors.greenDefault, fontWeight: '600' },
  customDurationRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  customDurationField: {
    flex: 1,
    marginVertical: 0,
    paddingVertical: 0,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  customDurationFieldActive: {
    borderColor: colors.greenDefault,
    backgroundColor: colors.greenDeep,
  },
  customDurationInput: {
    fontSize: 14,
    color: colors.textSecondary,
    paddingVertical: 0,
  },
  customDurationInputActive: {
    color: colors.greenDefault,
    fontWeight: '600',
  },
  notesInput: {
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: colors.text, minHeight: 72,
    textAlignVertical: 'top',
  },
  shiftEmptyHint: {
    fontSize: 12,
    color: colors.amberDefault,
    marginTop: 4,
    marginBottom: 4,
    lineHeight: 17,
  },
});
