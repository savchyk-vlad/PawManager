import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@pawmanager/dismissed_missed_walk_ids_v1';

export async function getDismissedMissedIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export async function dismissMissedFromDashboard(walkId: string): Promise<void> {
  const s = await getDismissedMissedIds();
  s.add(walkId);
  await AsyncStorage.setItem(KEY, JSON.stringify([...s]));
}

/** Add many ids in one read/write so parallel calls cannot overwrite each other. */
export async function dismissManyMissedFromDashboard(walkIds: string[]): Promise<void> {
  if (walkIds.length === 0) return;
  const s = await getDismissedMissedIds();
  for (const id of walkIds) {
    s.add(id);
  }
  await AsyncStorage.setItem(KEY, JSON.stringify([...s]));
}
