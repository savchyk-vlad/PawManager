import type { ClientAddress } from '../types';

export function emptyClientAddress(): ClientAddress {
  return { line1: '', line2: '', city: '', state: '', postal: '' };
}

export function normalizeClientAddress(a: ClientAddress): ClientAddress {
  return {
    line1: a.line1.trim(),
    line2: a.line2.trim(),
    city: a.city.trim(),
    state: a.state.trim(),
    postal: a.postal.trim(),
  };
}

/** Single line for maps URLs and compact rows. */
export function formatClientAddressSingleLine(a: ClientAddress): string {
  const n = normalizeClientAddress(a);
  const street = [n.line1, n.line2].filter(Boolean).join(', ');
  const cityPart = [n.city, n.state].filter(Boolean).join(', ');
  const tail = [cityPart, n.postal].filter(Boolean).join(' ').trim();
  const head = street;
  if (head && tail) return `${head}, ${tail}`;
  return head || tail;
}

/** Two lines for detail screens. */
export function formatClientAddressMultiline(a: ClientAddress): string {
  const n = normalizeClientAddress(a);
  const lineStreet = [n.line1, n.line2].filter(Boolean).join(', ');
  const lineCity = [n.city, n.state, n.postal].filter(Boolean).join(', ');
  return [lineStreet, lineCity].filter(Boolean).join('\n');
}

export function listMissingClientRequiredFields(
  name: string,
  phone: string,
  address: ClientAddress,
): string[] {
  const missing: string[] = [];
  if (!name.trim()) missing.push('full name');
  if (!phone.trim()) missing.push('phone number');
  else if (!/\d/.test(phone)) missing.push('a phone number with at least one digit');

  const n = normalizeClientAddress(address);
  if (!n.line1) missing.push('street address');
  if (!n.city) missing.push('city');
  if (!n.state) missing.push('state');
  if (!n.postal) missing.push('ZIP code');
  else if (!/\d/.test(n.postal)) missing.push('a valid ZIP code');

  return missing;
}

export function clientRequiredFieldsSatisfied(name: string, phone: string, address: ClientAddress): boolean {
  return listMissingClientRequiredFields(name, phone, address).length === 0;
}
