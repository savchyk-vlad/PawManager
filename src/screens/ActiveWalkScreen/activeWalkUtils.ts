import { format, isValid, parseISO } from 'date-fns';
import { Walk } from '../../types';

export function formatWhen(iso: string | undefined) {
  if (!iso) return '—';
  const d = parseISO(iso);
  return isValid(d) ? format(d, "EEE, MMM d '.' h:mm a") : '—';
}

export function paymentLabelAndColors(
  status: Walk['paymentStatus'],
): { label: string; fg: string; bg: string } {
  if (status === 'paid') {
    return { label: 'Paid', fg: '#D1FAE5', bg: 'rgba(16, 185, 129, 0.22)' };
  }
  if (status === 'no_pay') {
    return { label: 'No pay', fg: 'rgba(255,255,255,0.75)', bg: 'rgba(255,255,255,0.1)' };
  }
  return { label: 'Unpaid', fg: '#FCD34D', bg: 'rgba(245, 158, 11, 0.2)' };
}
