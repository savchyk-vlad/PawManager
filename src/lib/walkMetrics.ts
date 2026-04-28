import { isSameDay, parseISO } from 'date-fns';
import { Client, Walk } from '../types';

export function walkDogCount(walk: Walk): number {
  return Math.max(1, new Set(walk.dogIds).size);
}

function perDogPricingActive(walk: Walk): boolean {
  const m = walk.perDogPrices;
  return m != null && typeof m === 'object' && Object.keys(m).length > 0;
}

/**
 * Total billable amount for this walk.
 * Uses `perDogPrices` when set (sum over unique dogs on the walk),
 * otherwise uniform client rate or `pricePerWalkOverride` × dog count.
 */
export function walkCharge(walk: Walk, client: Client | undefined): number {
  if (perDogPricingActive(walk)) {
    const map = walk.perDogPrices!;
    const base = client?.pricePerWalk ?? 0;
    let sum = 0;
    for (const dogId of new Set(walk.dogIds)) {
      const v = map[dogId];
      sum += v != null && Number.isFinite(v) && v >= 0 ? v : base;
    }
    return sum;
  }
  const unit = effectivePricePerWalk(walk, client);
  return unit * walkDogCount(walk);
}

/**
 * Uniform $/dog when the walk uses client rate or a single override.
 * When `perDogPrices` is set, returns the average per dog (total ÷ dog count) for compact display.
 */
export function effectivePricePerWalk(walk: Walk, client: Client | undefined): number {
  if (perDogPricingActive(walk)) {
    const n = walkDogCount(walk);
    if (n <= 0) return client?.pricePerWalk ?? 0;
    return walkCharge(walk, client) / n;
  }
  const o = walk.pricePerWalkOverride;
  if (o != null && Number.isFinite(o) && o >= 0) return o;
  return client?.pricePerWalk ?? 0;
}

export function countUnpaidDoneWalkRecords(walks: Walk[]): number {
  return walks.filter((w) => w.status === 'done' && w.paymentStatus === 'unpaid').length;
}

export function calcEarnedToday(walks: Walk[], clients: Client[], now: Date): number {
  return walks
    .filter((w) => w.status === 'done' && isSameDay(parseISO(w.scheduledAt), now))
    .reduce((sum, w) => {
      const c = clients.find((cl) => cl.id === w.clientId);
      return sum + walkCharge(w, c);
    }, 0);
}
