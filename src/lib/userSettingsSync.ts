import type { User } from "@supabase/supabase-js";
import { useSettingsStore } from "../store/settingsStore";
import type { WalkDuration, ReminderTiming } from "../store/settingsStore";

export const PAW_PREFS_VERSION = 1 as const;

export type PawPrefsStored = {
  v: typeof PAW_PREFS_VERSION;
  defaultRate: number;
  defaultWalkDuration: WalkDuration;
  reminderTiming: ReminderTiming;
  walkReminderOff: boolean;
  notificationsEnabled: boolean;
  dailySummaryEnabled: boolean;
  unpaidReminderEnabled: boolean;
};

function isWalkDuration(n: number): n is WalkDuration {
  return n === 15 || n === 30 || n === 45 || n === 60;
}

function isReminderTiming(n: number): n is ReminderTiming {
  return n === 15 || n === 30 || n === 60;
}

/** Build metadata payload for `auth.updateUser` from prefs + business name. */
export function buildMetadataPatch(
  existing: Record<string, unknown> | undefined,
  businessNameTrimmed: string,
  prefs: PawPrefsStored,
): Record<string, unknown> {
  return {
    ...(existing ?? {}),
    business_name: businessNameTrimmed,
    paw_prefs: prefs,
  };
}

/** Parse `user.user_metadata` into partial prefs for hydration. */
export function metadataToPrefsPatch(meta: User["user_metadata"]): Partial<PawPrefsStored> | null {
  if (!meta || typeof meta !== "object") return null;
  const raw = meta.paw_prefs;
  if (raw == null) return null;
  let obj: unknown = raw;
  if (typeof raw === "string") {
    try {
      obj = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;

  const out: Partial<PawPrefsStored> = {};

  if (typeof o.defaultRate === "number" && Number.isFinite(o.defaultRate) && o.defaultRate > 0) {
    out.defaultRate = o.defaultRate;
  }
  if (typeof o.defaultWalkDuration === "number" && isWalkDuration(o.defaultWalkDuration)) {
    out.defaultWalkDuration = o.defaultWalkDuration;
  }
  if (typeof o.reminderTiming === "number" && isReminderTiming(o.reminderTiming)) {
    out.reminderTiming = o.reminderTiming;
  }
  if (typeof o.walkReminderOff === "boolean") out.walkReminderOff = o.walkReminderOff;
  if (typeof o.notificationsEnabled === "boolean") {
    out.notificationsEnabled = o.notificationsEnabled;
  }
  if (typeof o.dailySummaryEnabled === "boolean") {
    out.dailySummaryEnabled = o.dailySummaryEnabled;
  }
  if (typeof o.unpaidReminderEnabled === "boolean") {
    out.unpaidReminderEnabled = o.unpaidReminderEnabled;
  }

  return Object.keys(out).length ? out : null;
}

/** Reset store to defaults, then apply `business_name` and saved prefs from Supabase Auth metadata. */
export function hydrateSettingsFromUser(user: User) {
  useSettingsStore.getState().resetToDefaults();
  const meta = user.user_metadata ?? {};
  const bn = businessNameFromMetadata(meta);
  const patch = metadataToPrefsPatch(meta);
  useSettingsStore.setState((s) => ({
    ...s,
    businessName: bn,
    ...(patch?.defaultRate != null ? { defaultRate: patch.defaultRate } : {}),
    ...(patch?.defaultWalkDuration != null
      ? { defaultWalkDuration: patch.defaultWalkDuration }
      : {}),
    ...(patch?.reminderTiming != null
      ? { reminderTiming: patch.reminderTiming }
      : {}),
    ...(patch?.walkReminderOff != null
      ? { walkReminderOff: patch.walkReminderOff }
      : {}),
    ...(patch?.notificationsEnabled != null
      ? { notificationsEnabled: patch.notificationsEnabled }
      : {}),
    ...(patch?.dailySummaryEnabled != null
      ? { dailySummaryEnabled: patch.dailySummaryEnabled }
      : {}),
    ...(patch?.unpaidReminderEnabled != null
      ? { unpaidReminderEnabled: patch.unpaidReminderEnabled }
      : {}),
  }));
}

export function businessNameFromMetadata(meta: User["user_metadata"]): string {
  const v = meta?.business_name;
  return typeof v === "string" ? v.trim() : "";
}

export function prefsFromStoreState(get: {
  defaultRate: number;
  defaultWalkDuration: WalkDuration;
  reminderTiming: ReminderTiming;
  walkReminderOff: boolean;
  notificationsEnabled: boolean;
  dailySummaryEnabled: boolean;
  unpaidReminderEnabled: boolean;
}): PawPrefsStored {
  return {
    v: PAW_PREFS_VERSION,
    defaultRate: get.defaultRate,
    defaultWalkDuration: get.defaultWalkDuration,
    reminderTiming: get.reminderTiming,
    walkReminderOff: get.walkReminderOff,
    notificationsEnabled: get.notificationsEnabled,
    dailySummaryEnabled: get.dailySummaryEnabled,
    unpaidReminderEnabled: get.unpaidReminderEnabled,
  };
}
