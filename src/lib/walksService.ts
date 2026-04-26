import { supabase } from './supabase';
import { Walk } from '../types';

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
  walk_dogs: { dog_id: string }[];
}

export interface CreateWalkInput {
  clientId: string;
  dogIds: string[];
  scheduledAt: string;
  durationMinutes: number;
  notes?: string;
}

function mapWalk(row: DbWalk): Walk {
  return {
    id: row.id,
    clientId: row.client_id,
    dogIds: (row.walk_dogs ?? []).map((entry) => entry.dog_id),
    scheduledAt: row.scheduled_at,
    durationMinutes: row.duration_minutes,
    status: row.status,
    paymentStatus: row.payment_status,
    actualDurationMinutes: row.actual_duration_minutes ?? undefined,
    notes: row.notes || undefined,
    startedAt: row.started_at ?? undefined,
    finishedAt: row.finished_at ?? undefined,
  };
}

export async function fetchWalks(userId: string): Promise<Walk[]> {
  const { data, error } = await supabase
    .from('walks')
    .select(`
      id, user_id, client_id, scheduled_at, duration_minutes, status, payment_status,
      actual_duration_minutes, notes, started_at, finished_at,
      walk_dogs ( dog_id )
    `)
    .eq('user_id', userId)
    .order('scheduled_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as DbWalk[]).map(mapWalk);
}

export async function createWalk(input: CreateWalkInput, userId: string): Promise<Walk> {
  const { data: walkRow, error: walkError } = await supabase
    .from('walks')
    .insert({
      user_id: userId,
      client_id: input.clientId,
      scheduled_at: input.scheduledAt,
      duration_minutes: input.durationMinutes,
      status: 'scheduled',
      payment_status: 'unpaid',
      notes: input.notes ?? '',
    })
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
  }>
): Promise<void> {
  const payload: Record<string, unknown> = {};

  if (fields.status !== undefined) payload.status = fields.status;
  if (fields.paymentStatus !== undefined) payload.payment_status = fields.paymentStatus;
  if (fields.actualDurationMinutes !== undefined) payload.actual_duration_minutes = fields.actualDurationMinutes;
  if (fields.notes !== undefined) payload.notes = fields.notes;
  if (fields.startedAt !== undefined) payload.started_at = fields.startedAt;
  if (fields.finishedAt !== undefined) payload.finished_at = fields.finishedAt;

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
