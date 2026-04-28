import { supabase } from './supabase';
import { Walk } from '../types';

/**
 * Postgres `TIMESTAMPTZ` / Supabase return ISO-8601 strings. Normalizing to `Date` → `toISOString()` keeps one
 * consistent Zulu form for `localeCompare` sorting and for `new Date` / `parseISO` across the app.
 */
function toCanonicalTimestamptzIso(value: string | null | undefined): string | undefined {
  if (value == null || value === '') return undefined;
  const ms = new Date(value).getTime();
  if (Number.isNaN(ms)) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[walksService] Unparseable timestamp from API, passing through:', value);
    }
    return value;
  }
  return new Date(ms).toISOString();
}

interface DbWalk {
  id: string;
  user_id: string;
  client_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: Walk['status'];
  payment_status: Walk['paymentStatus'];
  actual_duration_minutes: number | null;
  notes: string;
  started_at: string | null;
  finished_at: string | null;
  price_per_walk_override: number | string | null;
  per_dog_prices?: Record<string, unknown> | null;
  walk_dogs: { dog_id: string }[];
}

export interface CreateWalkInput {
  clientId: string;
  dogIds: string[];
  scheduledAt: string;
  durationMinutes: number;
  notes?: string;
  /** Optional uniform $/dog for every dog on the walk; ignored when `perDogPrices` is set. */
  pricePerWalkOverride?: number;
  /** Optional per-dog amounts; when set, overrides uniform override and client rate. */
  perDogPrices?: Record<string, number>;
}

function parsePerDogPrices(raw: unknown): Record<string, number> | undefined {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const n = typeof v === 'number' ? v : Number(v);
    if (Number.isFinite(n) && n >= 0) out[k] = n;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function mapWalk(row: DbWalk): Walk {
  const rawOverride = row.price_per_walk_override;
  const overrideNum =
    rawOverride != null && rawOverride !== ''
      ? Number(rawOverride)
      : undefined;
  const perDog = parsePerDogPrices(row.per_dog_prices);
  return {
    id: row.id,
    clientId: row.client_id,
    dogIds: (row.walk_dogs ?? []).map((entry) => entry.dog_id),
    scheduledAt: toCanonicalTimestamptzIso(row.scheduled_at) ?? row.scheduled_at,
    durationMinutes: row.duration_minutes,
    status: row.status,
    paymentStatus: row.payment_status,
    ...(perDog != null
      ? { perDogPrices: perDog }
      : {
          pricePerWalkOverride:
            overrideNum != null && Number.isFinite(overrideNum) && overrideNum >= 0
              ? overrideNum
              : undefined,
        }),
    actualDurationMinutes: row.actual_duration_minutes ?? undefined,
    notes: row.notes || undefined,
    startedAt: toCanonicalTimestamptzIso(row.started_at),
    finishedAt: toCanonicalTimestamptzIso(row.finished_at),
  };
}

export async function fetchWalks(userId: string): Promise<Walk[]> {
  const { data, error } = await supabase
    .from('walks')
    .select(`
      id, user_id, client_id, scheduled_at, duration_minutes, status, payment_status,
      actual_duration_minutes, notes, started_at, finished_at, price_per_walk_override,
      per_dog_prices,
      walk_dogs ( dog_id )
    `)
    .eq('user_id', userId)
    .order('scheduled_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as DbWalk[]).map(mapWalk);
}

export async function createWalk(input: CreateWalkInput, userId: string): Promise<Walk> {
  if (!input.scheduledAt) {
    throw new Error('scheduledAt is required.');
  }
  const t = new Date(input.scheduledAt).getTime();
  if (Number.isNaN(t)) {
    throw new Error('scheduledAt is not a valid time.');
  }
  const scheduledAtIso = new Date(t).toISOString();
  const insertPayload: Record<string, unknown> = {
    user_id: userId,
    client_id: input.clientId,
    scheduled_at: scheduledAtIso,
    duration_minutes: input.durationMinutes,
    status: 'scheduled',
    payment_status: 'unpaid',
    notes: input.notes ?? '',
  };

  const perDog =
    input.perDogPrices != null &&
    Object.keys(input.perDogPrices).length > 0
      ? input.perDogPrices
      : undefined;
  if (perDog != null) {
    insertPayload.per_dog_prices = perDog;
    insertPayload.price_per_walk_override = null;
  } else if (
    input.pricePerWalkOverride != null &&
    Number.isFinite(input.pricePerWalkOverride) &&
    input.pricePerWalkOverride >= 0
  ) {
    insertPayload.price_per_walk_override = input.pricePerWalkOverride;
    insertPayload.per_dog_prices = null;
  }

  const { data: walkRow, error: walkError } = await supabase
    .from('walks')
    .insert(insertPayload)
    .select('id')
    .single();

  if (walkError) throw new Error(walkError.message);

  if (input.dogIds.length > 0) {
    const { error: dogsError } = await supabase
      .from('walk_dogs')
      .insert(input.dogIds.map((dogId) => ({ walk_id: walkRow.id, dog_id: dogId })));

    if (dogsError) throw new Error(dogsError.message);
  }

  const walks = await fetchWalks(userId);
  const created = walks.find((walk) => walk.id === walkRow.id);
  if (!created) throw new Error('Walk created but could not be fetched');
  return created;
}

export async function updateWalk(
  walkId: string,
  fields: Partial<{
    status: Walk['status'];
    paymentStatus: Walk['paymentStatus'];
    actualDurationMinutes: number | null;
    notes: string;
    startedAt: string | null;
    finishedAt: string | null;
    /** ISO-8601; sets `scheduled_at` (e.g. reschedule a missed walk). */
    scheduledAt: string;
    durationMinutes: number;
    /** Set to `null` to clear override and use client profile rate again. */
    pricePerWalkOverride: number | null;
    /** Set to `null` to clear per-dog pricing. */
    perDogPrices: Record<string, number> | null;
  }>
): Promise<void> {
  const payload: Record<string, unknown> = {};

  if (fields.status !== undefined) payload.status = fields.status;
  if (fields.paymentStatus !== undefined) payload.payment_status = fields.paymentStatus;
  if (fields.actualDurationMinutes !== undefined) payload.actual_duration_minutes = fields.actualDurationMinutes;
  if (fields.notes !== undefined) payload.notes = fields.notes;
  if (fields.startedAt !== undefined) payload.started_at = fields.startedAt;
  if (fields.finishedAt !== undefined) payload.finished_at = fields.finishedAt;
  if (fields.durationMinutes !== undefined) {
    if (fields.durationMinutes < 1) throw new Error('durationMinutes must be at least 1.');
    payload.duration_minutes = fields.durationMinutes;
  }
  if (fields.scheduledAt !== undefined) {
    const ms = new Date(fields.scheduledAt).getTime();
    if (Number.isNaN(ms)) throw new Error('scheduledAt is not a valid time.');
    payload.scheduled_at = new Date(ms).toISOString();
  }
  if (fields.pricePerWalkOverride !== undefined) {
    if (fields.pricePerWalkOverride === null) {
      payload.price_per_walk_override = null;
    } else if (
      Number.isFinite(fields.pricePerWalkOverride) &&
      fields.pricePerWalkOverride >= 0
    ) {
      payload.price_per_walk_override = fields.pricePerWalkOverride;
    }
  }

  if (fields.perDogPrices !== undefined) {
    if (fields.perDogPrices === null) {
      payload.per_dog_prices = null;
    } else if (Object.keys(fields.perDogPrices).length > 0) {
      payload.per_dog_prices = fields.perDogPrices;
      payload.price_per_walk_override = null;
    }
  }

  const { error } = await supabase.from('walks').update(payload).eq('id', walkId);
  if (error) throw new Error(error.message);
}

export async function markClientWalksPaid(clientId: string): Promise<void> {
  const { error } = await supabase
    .from('walks')
    .update({ payment_status: 'paid' })
    .eq('client_id', clientId)
    .eq('payment_status', 'unpaid')
    .eq('status', 'done');

  if (error) throw new Error(error.message);
}

/** Marks completed, still-unpaid walks as not expecting payment (complimentary, etc.). */
export async function markClientWalksNoPay(clientId: string): Promise<void> {
  const { error } = await supabase
    .from('walks')
    .update({ payment_status: 'no_pay' })
    .eq('client_id', clientId)
    .eq('payment_status', 'unpaid')
    .eq('status', 'done');

  if (error) throw new Error(error.message);
}
