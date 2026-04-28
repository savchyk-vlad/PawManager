import { supabase } from './supabase';
import { Client, Dog, DogTraitType } from '../types';

// ─── Row shapes returned by Supabase ───────────────────────────────────────

interface DbClient {
  id: string;
  user_id: string;
  name: string;
  address: string;
  phone: string;
  price_per_walk: number;
  dogs: DbDog[];
}

interface DbDog {
  id: string;
  client_id: string;
  name: string;
  breed: string;
  age: number;
  weight: number;
  emoji: string;
  vet: string;
  vet_phone: string;
  medical: string;
  key_location: string;
  is_deleted: boolean;
  dog_traits: { label: string; type: DogTraitType }[];
}

// ─── Mapping ────────────────────────────────────────────────────────────────

function mapDog(row: DbDog): Dog {
  const normalizedBreed = row.breed === 'Unknown' ? '' : row.breed;
  return {
    id: row.id,
    name: row.name,
    breed: normalizedBreed,
    age: row.age,
    weight: row.weight,
    emoji: row.emoji,
    vet: row.vet,
    vetPhone: row.vet_phone,
    medical: row.medical,
    keyLocation: row.key_location,
    isDeleted: row.is_deleted ?? false,
    traits: row.dog_traits ?? [],
  };
}

function mapClient(row: DbClient): Client {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    phone: row.phone,
    pricePerWalk: Number(row.price_per_walk),
    dogs: (row.dogs ?? []).map(mapDog),
  };
}

function isDogTraitTypeConstraintError(error: unknown): boolean {
  const e = error as { code?: string; message?: string; details?: string } | null;
  const blob = `${e?.message ?? ''} ${e?.details ?? ''}`.toLowerCase();
  return e?.code === '23514' || blob.includes('dog_traits_type_check');
}

async function insertDogTraits(
  dogId: string,
  traits: { label: string; type: DogTraitType }[],
): Promise<void> {
  if (traits.length === 0) return;
  const cleaned = traits.map((t) => ({ dog_id: dogId, label: t.label.trim(), type: t.type }));
  const { error } = await supabase.from('dog_traits').insert(cleaned);
  if (!error) return;
  if (!isDogTraitTypeConstraintError(error)) {
    throw new Error(error.message);
  }
  throw new Error(
    'High risk traits require DB migration 005 (dog_traits red type). Please run the latest Supabase migrations and try again.'
  );
}

// ─── API ────────────────────────────────────────────────────────────────────

export async function fetchClients(userId: string): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select(`
      id, user_id, name, address, phone, price_per_walk,
      dogs (
        id, client_id, name, breed, age, weight, emoji, is_deleted,
        vet, vet_phone, medical, key_location,
        dog_traits ( label, type )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as DbClient[]).map(mapClient);
}

export async function createClient(
  client: Omit<Client, 'id'>,
  userId: string,
): Promise<Client> {
  // 1. Insert client row
  const { data: clientRow, error: clientErr } = await supabase
    .from('clients')
    .insert({
      user_id: userId,
      name: client.name,
      address: client.address,
      phone: client.phone,
      price_per_walk: client.pricePerWalk,
    })
    .select('id')
    .single();

  if (clientErr) throw new Error(clientErr.message);
  const clientId: string = clientRow.id;

  // 2. Insert dogs + traits
  for (const dog of client.dogs) {
    const { data: dogRow, error: dogErr } = await supabase
      .from('dogs')
      .insert({
        client_id: clientId,
        name: dog.name,
        breed: dog.breed,
        age: dog.age,
        weight: dog.weight,
        emoji: dog.emoji,
        vet: dog.vet,
        vet_phone: dog.vetPhone,
        medical: dog.medical,
        key_location: dog.keyLocation,
      })
      .select('id')
      .single();

    if (dogErr) throw new Error(dogErr.message);

    await insertDogTraits(dogRow.id, dog.traits);
  }

  // 3. Re-fetch the full client to get generated IDs back
  const clients = await fetchClients(userId);
  const created = clients.find((c) => c.id === clientId);
  if (!created) throw new Error('Client created but could not be fetched');
  return created;
}

export async function deleteClient(clientId: string): Promise<void> {
  const { error } = await supabase.from('clients').delete().eq('id', clientId);
  if (error) throw new Error(error.message);
}

export async function updateClientFields(
  clientId: string,
  fields: { name: string; address: string; phone: string; pricePerWalk: number },
): Promise<void> {
  const { error } = await supabase
    .from('clients')
    .update({
      name: fields.name,
      address: fields.address,
      phone: fields.phone,
      price_per_walk: fields.pricePerWalk,
    })
    .eq('id', clientId);
  if (error) throw new Error(error.message);
}

/** Updates dog fields that can be changed from the client profile editor. */
export async function updateDogFields(
  dogId: string,
  fields: { name: string; breed: string; emoji: string }
): Promise<void> {
  const { error } = await supabase
    .from('dogs')
    .update({
      name: fields.name,
      breed: fields.breed,
      emoji: fields.emoji,
    })
    .eq('id', dogId);
  if (error) throw new Error(error.message);
}

export type DogProfilePayload = {
  name: string;
  breed: string;
  emoji: string;
  age: number;
  weight: number;
  vet: string;
  vetPhone: string;
  medical: string;
  keyLocation: string;
};

/** Full dog row update (wizard / dedicated dog editor). */
export async function updateDogProfile(dogId: string, fields: DogProfilePayload): Promise<void> {
  const { error } = await supabase
    .from('dogs')
    .update({
      name: fields.name,
      breed: fields.breed,
      emoji: fields.emoji,
      age: Math.max(0, Math.round(fields.age)),
      weight: Number(fields.weight) >= 0 ? Number(fields.weight) : 0,
      vet: fields.vet,
      vet_phone: fields.vetPhone,
      medical: fields.medical,
      key_location: fields.keyLocation,
    })
    .eq('id', dogId);
  if (error) throw new Error(error.message);
}

/** Replaces all traits for a dog (delete + insert). */
export async function replaceDogTraits(
  dogId: string,
  traits: { label: string; type: DogTraitType }[],
): Promise<void> {
  const { error: delErr } = await supabase.from('dog_traits').delete().eq('dog_id', dogId);
  if (delErr) throw new Error(delErr.message);
  await insertDogTraits(dogId, traits);
}

export async function addDog(clientId: string, dog: Omit<Dog, 'id'>): Promise<Dog> {
  const { data: dogRow, error: dogErr } = await supabase
    .from('dogs')
    .insert({
      client_id: clientId,
      name: dog.name,
      breed: dog.breed,
      age: dog.age,
      weight: dog.weight,
      emoji: dog.emoji,
      vet: dog.vet,
      vet_phone: dog.vetPhone,
      medical: dog.medical,
      key_location: dog.keyLocation,
    })
    .select('id')
    .single();
  if (dogErr) throw new Error(dogErr.message);

  await insertDogTraits(dogRow.id, dog.traits);
  return { ...dog, id: dogRow.id };
}

export async function removeDog(dogId: string): Promise<void> {
  const { error } = await supabase
    .from('dogs')
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq('id', dogId);
  if (error) throw new Error(error.message);
}
