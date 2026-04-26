import { create } from 'zustand';

export type WalkDuration = 15 | 30 | 45 | 60;
export type ReminderTiming = 15 | 30 | 60;

interface SettingsState {
  businessName: string;
  defaultWalkDuration: WalkDuration;
  defaultRate: number;
  reminderTiming: ReminderTiming;
  dailySummaryEnabled: boolean;
  unpaidReminderEnabled: boolean;

  setBusinessName: (name: string) => void;
  setDefaultWalkDuration: (duration: WalkDuration) => void;
  setDefaultRate: (rate: number) => void;
  setReminderTiming: (timing: ReminderTiming) => void;
  setDailySummaryEnabled: (enabled: boolean) => void;
  setUnpaidReminderEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  businessName: '',
  defaultWalkDuration: 30,
  defaultRate: 25,
  reminderTiming: 30,
  dailySummaryEnabled: true,
  unpaidReminderEnabled: true,

  setBusinessName: (businessName) => set({ businessName }),
  setDefaultWalkDuration: (defaultWalkDuration) => set({ defaultWalkDuration }),
  setDefaultRate: (defaultRate) => set({ defaultRate }),
  setReminderTiming: (reminderTiming) => set({ reminderTiming }),
  setDailySummaryEnabled: (dailySummaryEnabled) => set({ dailySummaryEnabled }),
  setUnpaidReminderEnabled: (unpaidReminderEnabled) => set({ unpaidReminderEnabled }),
}));
