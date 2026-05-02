import { format, isValid, parseISO } from 'date-fns';

export function formatWhen(iso: string | undefined) {
  if (!iso) return '—';
  const d = parseISO(iso);
  return isValid(d) ? format(d, "EEE, MMM d '.' h:mm a") : '—';
}
