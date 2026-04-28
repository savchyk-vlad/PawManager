import test from 'node:test';
import assert from 'node:assert/strict';
import {
  jsWeekdayToWorkingIndex,
  isUserWorkingDay,
  nearestWorkingDay,
  snapToNearestWorkingDay,
} from './workingDays';

// Mon–Fri on, Sat–Sun off
const WEEKDAYS: boolean[] = [true, true, true, true, true, false, false];
// Only Wednesday on
const WED_ONLY: boolean[] = [false, false, true, false, false, false, false];

// ── jsWeekdayToWorkingIndex ──────────────────────────────────────────────────

test('jsWeekdayToWorkingIndex maps Sunday (0) to index 6', () => {
  assert.equal(jsWeekdayToWorkingIndex(0), 6);
});

test('jsWeekdayToWorkingIndex maps Monday (1) to index 0', () => {
  assert.equal(jsWeekdayToWorkingIndex(1), 0);
});

test('jsWeekdayToWorkingIndex maps Saturday (6) to index 5', () => {
  assert.equal(jsWeekdayToWorkingIndex(6), 5);
});

// ── isUserWorkingDay ─────────────────────────────────────────────────────────

test('isUserWorkingDay returns true for Mon–Fri with weekday schedule', () => {
  const mon = new Date(2026, 3, 27); // Monday April 27
  assert.equal(isUserWorkingDay(mon, WEEKDAYS), true);
});

test('isUserWorkingDay returns false for Saturday with weekday schedule', () => {
  const sat = new Date(2026, 4, 2); // Saturday May 2
  assert.equal(isUserWorkingDay(sat, WEEKDAYS), false);
});

test('isUserWorkingDay returns false for Sunday with weekday schedule', () => {
  const sun = new Date(2026, 4, 3); // Sunday May 3
  assert.equal(isUserWorkingDay(sun, WEEKDAYS), false);
});

// ── nearestWorkingDay ────────────────────────────────────────────────────────

test('nearestWorkingDay steps forward to next working day', () => {
  // Friday May 1 → step forward → Monday May 4
  const fri = new Date(2026, 4, 1);
  const result = nearestWorkingDay(fri, 1, WEEKDAYS);
  assert.equal(result.getDay(), 1); // Monday
});

test('nearestWorkingDay steps backward to previous working day', () => {
  // Monday April 27 → step back → Friday April 24
  const mon = new Date(2026, 3, 27);
  const result = nearestWorkingDay(mon, -1, WEEKDAYS);
  assert.equal(result.getDay(), 5); // Friday
});

test('nearestWorkingDay returns start when no working day found within maxSteps', () => {
  const allOff: boolean[] = [false, false, false, false, false, false, false];
  const start = new Date('2026-04-27');
  const result = nearestWorkingDay(start, 1, allOff, 3);
  assert.deepEqual(result.toDateString(), start.toDateString());
});

// ── snapToNearestWorkingDay ──────────────────────────────────────────────────

test('snapToNearestWorkingDay returns same day when already a working day', () => {
  const mon = new Date(2026, 3, 27); // Monday April 27
  const result = snapToNearestWorkingDay(mon, WEEKDAYS);
  assert.equal(result.toDateString(), mon.toDateString());
});

test('snapToNearestWorkingDay snaps Sunday to nearest weekday', () => {
  const sun = new Date(2026, 4, 3); // Sunday May 3
  const result = snapToNearestWorkingDay(sun, WEEKDAYS);
  // Distance to Friday May 1 (dist 2) vs Monday May 4 (dist 1); Monday is closer
  assert.equal(result.getDay(), 1); // Monday
});

test('snapToNearestWorkingDay snaps Saturday to nearest weekday', () => {
  const sat = new Date(2026, 4, 2); // Saturday May 2
  const result = snapToNearestWorkingDay(sat, WEEKDAYS);
  // Fri May 1 (dist 1) vs Mon May 4 (dist 2) → Friday wins
  assert.equal(result.getDay(), 5); // Friday
});

test('snapToNearestWorkingDay works with sparse schedule', () => {
  const thu = new Date(2026, 3, 30); // Thursday April 30, not Wednesday
  const result = snapToNearestWorkingDay(thu, WED_ONLY);
  assert.equal(result.getDay(), 3); // Wednesday
});
