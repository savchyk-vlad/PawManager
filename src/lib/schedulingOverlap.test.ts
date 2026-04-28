import test from 'node:test';
import assert from 'node:assert/strict';
import { getTakenSlotKeysForDay, rangesOverlap } from './schedulingOverlap';
import { Walk } from '../types';

function makeWalk(partial: Partial<Walk>): Walk {
  return {
    id: partial.id ?? 'w1',
    clientId: partial.clientId ?? 'c1',
    dogIds: partial.dogIds ?? ['d1'],
    scheduledAt: partial.scheduledAt ?? '2026-04-27T09:00:00',
    durationMinutes: partial.durationMinutes ?? 30,
    status: partial.status ?? 'scheduled',
    paymentStatus: partial.paymentStatus ?? 'unpaid',
    ...partial,
  };
}

test('rangesOverlap handles touching vs intersecting ranges', () => {
  assert.equal(rangesOverlap(0, 10, 10, 20), false);
  assert.equal(rangesOverlap(0, 10, 9, 20), true);
  assert.equal(rangesOverlap(10, 20, 0, 11), true);
});

test('taken slot keys include any slot overlapping scheduled duration', () => {
  const walks: Walk[] = [
    makeWalk({
      id: 'busy',
      scheduledAt: '2026-04-27T09:00:00',
      durationMinutes: 60, // 09:00-10:00
      status: 'scheduled',
    }),
  ];
  const dayIso = '2026-04-27T00:00:00';
  const slotIsos = [
    '2026-04-27T08:30:00',
    '2026-04-27T09:00:00',
    '2026-04-27T09:30:00',
    '2026-04-27T10:00:00',
  ];

  const taken = getTakenSlotKeysForDay({
    walks,
    dayIso,
    slotIsos,
    selectedDurationMinutes: 30,
  });

  assert.equal(taken.has('8:30'), false);
  assert.equal(taken.has('9:0'), true);
  assert.equal(taken.has('9:30'), true);
  assert.equal(taken.has('10:0'), false);
});

test('excludeWalkId keeps current edited walk slot available', () => {
  const walk = makeWalk({
    id: 'current',
    scheduledAt: '2026-04-27T11:00:00',
    durationMinutes: 30,
  });
  const taken = getTakenSlotKeysForDay({
    walks: [walk],
    dayIso: '2026-04-27T00:00:00',
    slotIsos: ['2026-04-27T11:00:00'],
    selectedDurationMinutes: 30,
    excludeWalkId: 'current',
  });

  assert.equal(taken.has('11:0'), false);
});
