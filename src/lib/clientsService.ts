import { supabase } from './supabase';
import { Client, Dog } from '../types';

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
  dog_traits: { label: string; type: 'positive' | 'warning' }[];
}

// ─── Mapping ────────────────────────────────────────────────────────────────

function mapDog(row: DbDog): Dog {
  return {
    id: row.id,
    name: row.name,
    breed: row.breed,
    age: row.age,
    weight: row.weight,
    emoji: row.emoji,
    vet: row.vet,
    vetPhone: row.vet_phone,
    medical: row.medical,
    keyLocation: row.key_location,
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

// ─── API ────────────────────────────────────────────────────────────────────

export async function fetchClients(userId: string): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select(`
      id, user_id, name, address, phone, price_per_walk,
      dogs (
        id, client_id, name, breed, age, weight, emoji,
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

    if (dog.traits.length > 0) {
      const { error: traitErr } = await supabase.from('dog_traits').insert(
        dog.traits.map((t) => ({ dog_id: dogRow.id, label: t.label, type: t.type }))
      );
      if (traitErr) throw new Error(traitErr.message);
    }
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

  if (dog.traits.length > 0) {
    const { error: traitErr } = await supabase.from('dog_traits').insert(
      dog.traits.map((t) => ({ dog_id: dogRow.id, label: t.label, type: t.type }))
    );
    if (traitErr) throw new Error(traitErr.message);
  }
  return { ...dog, id: dogRow.id };
}

export async function removeDog(dogId: string): Promise<void> {
  const { error } = await supabase.from('dogs').delete().eq('id', dogId);
  if (error) throw new Error(error.message);
}
