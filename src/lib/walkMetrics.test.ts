import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calcEarnedToday,
  countUnpaidDoneWalkRecords,
  effectivePricePerWalk,
  walkCharge,
  walkDogCount,
} from './walkMetrics';
import { Client, Walk } from '../types';
import { emptyClientAddress } from './clientAddress';

function makeWalk(partial: Partial<Walk>): Walk {
  return {
    id: partial.id ?? 'w1',
    clientId: partial.clientId ?? 'c1',
    dogIds: partial.dogIds ?? ['d1'],
    scheduledAt: partial.scheduledAt ?? '2026-04-27T09:00:00.000Z',
    durationMinutes: partial.durationMinutes ?? 30,
    status: partial.status ?? 'scheduled',
    paymentStatus: partial.paymentStatus ?? 'unpaid',
    ...partial,
  };
}

test('walkDogCount counts unique dog ids with floor of one', () => {
  assert.equal(walkDogCount(makeWalk({ dogIds: ['a', 'a', 'b'] })), 2);
  assert.equal(walkDogCount(makeWalk({ dogIds: [] })), 1);
});

test('walkCharge uniform rate multiplies by unique dog count', () => {
  const client = {
    id: 'c1',
    name: 'A',
    address: emptyClientAddress(),
    phone: '',
    pricePerWalk: 25,
    keyLocation: '',
    dogs: [],
  } satisfies Client;
  const walk = makeWalk({ dogIds: ['d1', 'd2', 'd2'] });
  assert.equal(walkCharge(walk, client), 50);
});

test('walkCharge sums per-dog rates', () => {
  const client = {
    id: 'c1',
    name: 'A',
    address: emptyClientAddress(),
    phone: '',
    pricePerWalk: 100,
    keyLocation: '',
    dogs: [],
  } satisfies Client;
  const walk = makeWalk({
    dogIds: ['d1', 'd2'],
    perDogPrices: { d1: 18, d2: 22 },
  });
  assert.equal(walkCharge(walk, client), 40);
});

test('walkCharge falls back to client rate for dogs missing from perDogPrices map', () => {
  const client = {
    id: 'c1',
    name: 'A',
    address: emptyClientAddress(),
    phone: '',
    pricePerWalk: 30,
    keyLocation: '',
    dogs: [],
  } satisfies Client;
  const walk = makeWalk({
    dogIds: ['d1', 'd2'],
    perDogPrices: { d1: 25 },
  });
  assert.equal(walkCharge(walk, client), 55);
});

test('countUnpaidDoneWalkRecords counts only done + unpaid records', () => {
  const walks: Walk[] = [
    makeWalk({ id: 'a', status: 'done', paymentStatus: 'unpaid' }),
    makeWalk({ id: 'b', status: 'done', paymentStatus: 'paid' }),
    makeWalk({ id: 'c', status: 'scheduled', paymentStatus: 'unpaid' }),
  ];
  assert.equal(countUnpaidDoneWalkRecords(walks), 1);
});

test('effectivePricePerWalk uses override when set (uniform)', () => {
  const client = {
    id: 'c1',
    name: 'A',
    address: emptyClientAddress(),
    phone: '',
    pricePerWalk: 20,
    keyLocation: '',
    dogs: [],
  } satisfies Client;
  assert.equal(
    effectivePricePerWalk(makeWalk({ pricePerWalkOverride: 35 }), client),
    35,
  );
  assert.equal(effectivePricePerWalk(makeWalk({}), client), 20);
});

test('calcEarnedToday respects price override on a walk', () => {
  const clients: Client[] = [
    { id: 'c1', name: 'A', address: emptyClientAddress(), phone: '', pricePerWalk: 20, keyLocation: '', dogs: [] },
  ];
  const now = new Date('2026-04-27T12:00:00.000Z');
  const walks: Walk[] = [
    makeWalk({
      clientId: 'c1',
      dogIds: ['d1'],
      status: 'done',
      scheduledAt: '2026-04-27T08:00:00.000Z',
      pricePerWalkOverride: 50,
    }),
  ];
  assert.equal(calcEarnedToday(walks, clients, now), 50);
});

test('calcEarnedToday sums per-dog pricing', () => {
  const clients: Client[] = [
    { id: 'c1', name: 'A', address: emptyClientAddress(), phone: '', pricePerWalk: 10, keyLocation: '', dogs: [] },
  ];
  const now = new Date('2026-04-27T12:00:00.000Z');
  const walks: Walk[] = [
    makeWalk({
      clientId: 'c1',
      dogIds: ['d1', 'd2'],
      status: 'done',
      scheduledAt: '2026-04-27T08:00:00.000Z',
      perDogPrices: { d1: 15, d2: 25 },
    }),
  ];
  assert.equal(calcEarnedToday(walks, clients, now), 40);
});

test('calcEarnedToday sums done-today walk charges by client price', () => {
  const clients: Client[] = [
    { id: 'c1', name: 'A', address: emptyClientAddress(), phone: '', pricePerWalk: 20, keyLocation: '', dogs: [] },
    { id: 'c2', name: 'B', address: emptyClientAddress(), phone: '', pricePerWalk: 30, keyLocation: '', dogs: [] },
  ];
  const now = new Date('2026-04-27T12:00:00.000Z');
  const walks: Walk[] = [
    makeWalk({
      id: 'w1',
      clientId: 'c1',
      dogIds: ['d1', 'd2'],
      status: 'done',
      scheduledAt: '2026-04-27T08:00:00.000Z',
    }),
    makeWalk({
      id: 'w2',
      clientId: 'c2',
      dogIds: ['d3'],
      status: 'done',
      scheduledAt: '2026-04-27T09:00:00.000Z',
    }),
    makeWalk({
      id: 'w3',
      clientId: 'c2',
      dogIds: ['d4'],
      status: 'done',
      scheduledAt: '2026-04-28T09:00:00.000Z',
    }),
  ];

  assert.equal(calcEarnedToday(walks, clients, now), 70);
});
