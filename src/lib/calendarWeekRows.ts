export type CalendarPadCell =
  | { type: 'empty' }
  | { type: 'day'; date: Date };

/** Pad with trailing empties so length is a multiple of `columns` (week rows stay full width). */
export function padCalendarToFullWeeks(
  cells: CalendarPadCell[],
  columns = 7,
): CalendarPadCell[] {
  const rest = cells.length % columns;
  if (rest === 0) return cells;
  const pad = columns - rest;
  const out: CalendarPadCell[] = [...cells];
  for (let i = 0; i < pad; i++) {
    out.push({ type: 'empty' });
  }
  return out;
}

export function chunkIntoRows<T>(items: T[], columns = 7): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += columns) {
    rows.push(items.slice(i, i + columns));
  }
  return rows;
}
