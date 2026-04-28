import { create } from "zustand";

export type WalkDuration = 15 | 30 | 45 | 60;
export type ReminderTiming = 15 | 30 | 60;

/** Same options as Settings → Default walk duration (scheduling forms should use this list). */
export const WALK_DURATION_PRESETS: readonly WalkDuration[] = [15, 30, 45, 60];

interface SettingsState {
  businessName: string;
  defaultWalkDuration: WalkDuration;
  defaultRate: number;
  reminderTiming: ReminderTiming;
  /** When true, walk reminder pills show "Off" selected. */
  walkReminderOff: boolean;
  /** Master switch: when false, no notification types fire (sub-preferences are kept). */
  notificationsEnabled: boolean;
  dailySummaryEnabled: boolean;
  unpaidReminderEnabled: boolean;
  /** Length 7, Mon–Sun */
  workingDays: boolean[];
  /** Stored as 24h HH:mm */
  shiftStart: string;
  shiftEnd: string;

  setBusinessName: (name: string) => void;
  setDefaultWalkDuration: (duration: WalkDuration) => void;
  setDefaultRate: (rate: number) => void;
  setReminderTiming: (timing: ReminderTiming) => void;
  setWalkReminderOff: (off: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDailySummaryEnabled: (enabled: boolean) => void;
  setUnpaidReminderEnabled: (enabled: boolean) => void;
  setWorkingDays: (days: boolean[]) => void;
  setShiftStart: (t: string) => void;
  setShiftEnd: (t: string) => void;
  resetToDefaults: () => void;
}

const DEFAULT_WORKING_DAYS: boolean[] = [
  true,
  true,
  true,
  true,
  true,
  false,
  false,
];

const initialWorkingDays = (): boolean[] => [...DEFAULT_WORKING_DAYS];

export const useSettingsStore = create<SettingsState>((set) => ({
  businessName: "",
  defaultWalkDuration: 30,
  defaultRate: 25,
  reminderTiming: 30,
  walkReminderOff: false,
  notificationsEnabled: true,
  dailySummaryEnabled: true,
  unpaidReminderEnabled: true,
  workingDays: initialWorkingDays(),
  shiftStart: "08:00",
  shiftEnd: "18:00",

  setBusinessName: (businessName) => set({ businessName }),
  setDefaultWalkDuration: (defaultWalkDuration) => set({ defaultWalkDuration }),
  setDefaultRate: (defaultRate) => set({ defaultRate }),
  setReminderTiming: (reminderTiming) => set({ reminderTiming }),
  setWalkReminderOff: (walkReminderOff) => set({ walkReminderOff }),
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
  setDailySummaryEnabled: (dailySummaryEnabled) => set({ dailySummaryEnabled }),
  setUnpaidReminderEnabled: (unpaidReminderEnabled) =>
    set({ unpaidReminderEnabled }),
  setWorkingDays: (workingDays) => set({ workingDays }),
  setShiftStart: (shiftStart) => set({ shiftStart }),
  setShiftEnd: (shiftEnd) => set({ shiftEnd }),
  resetToDefaults: () =>
    set({
      businessName: "",
      defaultWalkDuration: 30,
      defaultRate: 25,
      reminderTiming: 30,
      walkReminderOff: false,
      notificationsEnabled: true,
      dailySummaryEnabled: true,
      unpaidReminderEnabled: true,
      workingDays: initialWorkingDays(),
      shiftStart: "08:00",
      shiftEnd: "18:00",
    }),
}));
