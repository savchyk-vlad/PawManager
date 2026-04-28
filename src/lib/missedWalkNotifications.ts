import * as Notifications from 'expo-notifications';
import { Client } from '../types';
import { Walk } from '../types';

function firstDogName(walk: Walk, clients: Client[]): string {
  const client = clients.find((c) => c.id === walk.clientId);
  if (!client) return 'Your dog';
  const dog = client.dogs.find((d) => walk.dogIds.includes(d.id));
  return dog?.name ?? 'Your dog';
}

/**
 * Fire an immediate local notification for each walk id that is newly missed (after sweep).
 */
export async function notifyWalksBecameMissed(
  walks: Walk[],
  newMissedIds: string[],
  clients: Client[],
): Promise<void> {
  if (newMissedIds.length === 0) return;
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    if (req.status !== 'granted') return;
  }

  for (const id of newMissedIds) {
    const walk = walks.find((w) => w.id === id);
    if (!walk) continue;
    const name = firstDogName(walk, clients);
    // eslint-disable-next-line no-await-in-loop
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Missed walk',
        body: `${name}'s walk was missed. Open the app to log or cancel.`,
        data: { walkId: walk.id, action: 'MISSED_REVIEW' },
      },
      trigger: null,
    });
  }
}
