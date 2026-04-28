import test from 'node:test';
import assert from 'node:assert/strict';
import { padCalendarToFullWeeks, chunkIntoRows, CalendarPadCell } from './calendarWeekRows';

// ── padCalendarToFullWeeks ───────────────────────────────────────────────────

test('padCalendarToFullWeeks leaves array unchanged when already full weeks', () => {
  const cells: CalendarPadCell[] = Array.from({ length: 7 }, (_, i) => ({
    type: 'day',
    date: new Date(2026, 3, i + 1),
  }));
  const result = padCalendarToFullWeeks(cells);
  assert.equal(result.length, 7);
});

test('padCalendarToFullWeeks pads to next multiple of 7', () => {
  const cells: CalendarPadCell[] = Array.from({ length: 5 }, (_, i) => ({
    type: 'day',
    date: new Date(2026, 3, i + 1),
  }));
  const result = padCalendarToFullWeeks(cells);
  assert.equal(result.length, 7);
  assert.equal(result[5].type, 'empty');
  assert.equal(result[6].type, 'empty');
});

test('padCalendarToFullWeeks pads a partial second week', () => {
  const cells: CalendarPadCell[] = Array.from({ length: 10 }, (_, i) => ({
    type: 'day',
    date: new Date(2026, 3, i + 1),
  }));
  const result = padCalendarToFullWeeks(cells);
  assert.equal(result.length, 14);
});

test('padCalendarToFullWeeks does not mutate the input array', () => {
  const cells: CalendarPadCell[] = [{ type: 'day', date: new Date(2026, 3, 1) }];
  padCalendarToFullWeeks(cells);
  assert.equal(cells.length, 1);
});

test('padCalendarToFullWeeks respects custom column count', () => {
  const cells: CalendarPadCell[] = Array.from({ length: 3 }, () => ({ type: 'empty' as const }));
  const result = padCalendarToFullWeeks(cells, 5);
  assert.equal(result.length, 5);
});

// ── chunkIntoRows ────────────────────────────────────────────────────────────

test('chunkIntoRows splits 7 items into one row of 7', () => {
  const items = [1, 2, 3, 4, 5, 6, 7];
  const rows = chunkIntoRows(items);
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0], items);
});

test('chunkIntoRows splits 14 items into two rows', () => {
  const items = Array.from({ length: 14 }, (_, i) => i);
  const rows = chunkIntoRows(items);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].length, 7);
  assert.equal(rows[1].length, 7);
});

test('chunkIntoRows last row may be shorter than column count', () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8];
  const rows = chunkIntoRows(items);
  assert.equal(rows.length, 2);
  assert.equal(rows[1].length, 1);
});

test('chunkIntoRows returns empty array for empty input', () => {
  assert.deepEqual(chunkIntoRows([]), []);
});

test('chunkIntoRows respects custom column count', () => {
  const items = [1, 2, 3, 4, 5];
  const rows = chunkIntoRows(items, 2);
  assert.equal(rows.length, 3);
  assert.deepEqual(rows[0], [1, 2]);
  assert.deepEqual(rows[2], [5]);
});
