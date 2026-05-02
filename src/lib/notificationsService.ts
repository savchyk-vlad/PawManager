import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Client, Walk } from "../types";
import { upsertUserPushToken } from "./pushTokensService";

const WALK_REMINDER_TYPE = "walk-reminder";

let notificationsConfigured = false;

function walkReminderBody(walk: Walk, clients: Client[]): string {
  const client = clients.find((entry) => entry.id === walk.clientId);
  const dogNames =
    client?.dogs
      .filter((dog) => walk.dogIds.includes(dog.id))
      .map((dog) => dog.name.trim())
      .filter(Boolean) ?? [];

  if (dogNames.length === 0) {
    return `You have a walk in 30 minutes.`;
  }

  if (dogNames.length === 1) {
    return `${dogNames[0]}'s walk starts in 30 minutes.`;
  }

  return `${dogNames.join(", ")} walk starts in 30 minutes.`;
}

function reminderIdentifier(walkId: string): string {
  return `${WALK_REMINDER_TYPE}:${walkId}`;
}


function expoProjectId(): string | undefined {
  const easProjectId =
    Constants.easConfig?.projectId ||
    (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId;

  return typeof easProjectId === "string" && easProjectId.trim()
    ? easProjectId
    : undefined;
}

export function configureNotifications(): void {
  if (notificationsConfigured) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  notificationsConfigured = true;
}

export async function hasNotificationPermissionAsync(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const current = await Notifications.getPermissionsAsync();
  return (
    current.granted ||
    current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

export async function requestNotificationsPermissionAsync(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  const currentGranted = await hasNotificationPermissionAsync();
  if (currentGranted) {
    return true;
  }

  const next = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });

  return next.granted || next.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function syncExpoPushTokenAsync(
  userId: string,
  requestIfNeeded: boolean,
): Promise<string | null> {
  if (!userId || Platform.OS === "web") return null;

  const hasPermission = requestIfNeeded
    ? await requestNotificationsPermissionAsync()
    : await hasNotificationPermissionAsync();

  if (!hasPermission) return null;

  const projectId = expoProjectId();
  const tokenResponse = projectId
    ? await Notifications.getExpoPushTokenAsync({ projectId })
    : await Notifications.getExpoPushTokenAsync();

  const token = tokenResponse.data?.trim();
  if (!token) return null;

  await upsertUserPushToken(userId, token);
  return token;
}

export async function syncWalkReminderNotificationsAsync(params: {
  walks: Walk[];
  clients: Client[];
  notificationsEnabled: boolean;
  walkReminderOff: boolean;
}): Promise<void> {
  if (Platform.OS === "web") return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const reminderIds = scheduled
    .filter((entry) => entry.content.data?.type === WALK_REMINDER_TYPE)
    .map((entry) => entry.identifier);

  if (reminderIds.length > 0) {
    await Promise.all(reminderIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
  }

  if (!params.notificationsEnabled || params.walkReminderOff) return;

  const granted = await hasNotificationPermissionAsync();
  if (!granted) return;

  const now = Date.now();
  const reminderLeadMs = 30 * 60 * 1000;
  const candidateWalks = params.walks
    .filter((walk) => walk.status === "scheduled")
    .map((walk) => ({
      walk,
      triggerAt: new Date(walk.scheduledAt).getTime() - reminderLeadMs,
    }))
    .filter((entry) => Number.isFinite(entry.triggerAt) && entry.triggerAt > now);

  for (const { walk, triggerAt } of candidateWalks) {
    // eslint-disable-next-line no-await-in-loop
    await Notifications.scheduleNotificationAsync({
      identifier: reminderIdentifier(walk.id),
      content: {
        title: "Walk reminder",
        body: walkReminderBody(walk, params.clients),
        sound: "default",
        data: {
          type: WALK_REMINDER_TYPE,
          walkId: walk.id,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(triggerAt),
      },
    });
  }
}
