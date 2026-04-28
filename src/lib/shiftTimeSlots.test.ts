import test from 'node:test';
import assert from 'node:assert/strict';
import { minutesFromHHmm, buildWalkTimeSlots } from './shiftTimeSlots';

// ── minutesFromHHmm ──────────────────────────────────────────────────────────

test('minutesFromHHmm converts start of day', () => {
  assert.equal(minutesFromHHmm('00:00'), 0);
});

test('minutesFromHHmm converts a mid-day time', () => {
  assert.equal(minutesFromHHmm('13:30'), 13 * 60 + 30);
});

test('minutesFromHHmm converts end of day', () => {
  assert.equal(minutesFromHHmm('23:59'), 23 * 60 + 59);
});

test('minutesFromHHmm returns null for bad format', () => {
  assert.equal(minutesFromHHmm('9:00 AM'), null);
  assert.equal(minutesFromHHmm(''), null);
  assert.equal(minutesFromHHmm('25:00'), null);
  assert.equal(minutesFromHHmm('08:60'), null);
});

test('minutesFromHHmm trims surrounding whitespace', () => {
  assert.equal(minutesFromHHmm(' 08:00 '), 8 * 60);
});

// ── buildWalkTimeSlots ───────────────────────────────────────────────────────

const DAY = new Date('2026-04-27T00:00:00');

test('buildWalkTimeSlots returns empty array when walk cannot fit inside shift', () => {
  // 30-min walk, shift is only 20 minutes
  const slots = buildWalkTimeSlots(DAY, '09:00', '09:20', 30);
  assert.equal(slots.length, 0);
});

test('buildWalkTimeSlots produces correct number of 30-min slots', () => {
  // 08:00–10:00 = 120 min; 30-min walk → slots at 08:00, 08:30, 09:00, 09:30 = 4
  const slots = buildWalkTimeSlots(DAY, '08:00', '10:00', 30);
  assert.equal(slots.length, 4);
});

test('buildWalkTimeSlots first slot matches shift start', () => {
  const slots = buildWalkTimeSlots(DAY, '09:00', '11:00', 30);
  assert.ok(slots[0].label.startsWith('9:00'));
});

test('buildWalkTimeSlots last slot ends exactly at shift end', () => {
  // 09:00–11:00, 30-min walk → last start slot at 10:30
  const slots = buildWalkTimeSlots(DAY, '09:00', '11:00', 30);
  const last = slots[slots.length - 1];
  assert.ok(last.label.startsWith('10:30'));
});

test('buildWalkTimeSlots falls back to 06:00–22:00 when end ≤ start', () => {
  // 10:00–08:00 is invalid → fallback 6:00–22:00, 30-min walk
  const fallback = buildWalkTimeSlots(DAY, '10:00', '08:00', 30);
  const normal   = buildWalkTimeSlots(DAY, '06:00', '22:00', 30);
  assert.equal(fallback.length, normal.length);
});

test('buildWalkTimeSlots slot isos are valid ISO strings', () => {
  const slots = buildWalkTimeSlots(DAY, '08:00', '09:00', 30);
  for (const s of slots) {
    assert.ok(!isNaN(Date.parse(s.iso)), `invalid iso: ${s.iso}`);
  }
});
