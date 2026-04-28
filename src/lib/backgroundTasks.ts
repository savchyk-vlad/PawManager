import { Platform } from 'react-native';

export const BACKGROUND_FETCH_TASK = 'pawmanager-background-fetch';

type TaskManagerNS = typeof import('expo-task-manager');
type BackgroundFetchNS = typeof import('expo-background-fetch');

let taskManager: TaskManagerNS | null = null;
let backgroundFetch: BackgroundFetchNS | null = null;

if (Platform.OS !== 'web') {
  try {
    taskManager = require('expo-task-manager') as TaskManagerNS;
    backgroundFetch = require('expo-background-fetch') as BackgroundFetchNS;

    taskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
      return backgroundFetch!.BackgroundFetchResult.NoData;
    });
  } catch {
    taskManager = null;
    backgroundFetch = null;
  }
}

export async function registerBackgroundFetchAsync(): Promise<void> {
  if (Platform.OS === 'web' || !taskManager || !backgroundFetch) return;
  try {
    const registered = await taskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    if (registered) return;
    await backgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 15 * 60, // 15 min (iOS may defer further)
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch {
    /* unsupported or not linked */
  }
}
