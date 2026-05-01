import { Platform } from 'react-native';

export const BACKGROUND_TASK_ID = 'pawmanager-background-task';

/** @deprecated Use `BACKGROUND_TASK_ID` (expo-background-task). */
export const BACKGROUND_FETCH_TASK = BACKGROUND_TASK_ID;

type TaskManagerNS = typeof import('expo-task-manager');
type BackgroundTaskNS = typeof import('expo-background-task');

let taskManager: TaskManagerNS | null = null;
let BackgroundTask: BackgroundTaskNS | null = null;

if (Platform.OS !== 'web') {
  try {
    taskManager = require('expo-task-manager') as TaskManagerNS;
    BackgroundTask = require('expo-background-task') as BackgroundTaskNS;

    taskManager.defineTask(BACKGROUND_TASK_ID, async () =>
      BackgroundTask!.BackgroundTaskResult.Success,
    );
  } catch {
    taskManager = null;
    BackgroundTask = null;
  }
}

export async function registerBackgroundTaskAsync(): Promise<void> {
  if (Platform.OS === 'web' || !taskManager || !BackgroundTask) return;
  try {
    const status = await BackgroundTask.getStatusAsync();
    if (status === BackgroundTask.BackgroundTaskStatus.Restricted) return;

    const registered = await taskManager.isTaskRegisteredAsync(BACKGROUND_TASK_ID);
    if (registered) return;

    await BackgroundTask.registerTaskAsync(BACKGROUND_TASK_ID, {
      minimumInterval: 15,
    });
  } catch {
    /* unsupported or not linked */
  }
}

/** @deprecated Use `registerBackgroundTaskAsync` (expo-background-task). */
export const registerBackgroundFetchAsync = registerBackgroundTaskAsync;
