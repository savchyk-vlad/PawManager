import { create } from 'zustand';
import { Walk, Client, Dog } from '../types';
import {
  fetchClients,
  createClient,
  deleteClient,
  updateClientFields,
  addDog,
  removeDog,
  updateDogFields,
  updateDogProfile,
  replaceDogTraits,
} from '../lib/clientsService';
import {
  createWalk,
  fetchWalks,
  markClientWalksPaid,
  markClientWalksNoPay,
  updateWalk,
  CreateWalkInput,
} from '../lib/walksService';
import { useAuthStore } from './authStore';

function getCurrentUserId() {
  return useAuthStore.getState().user?.id ?? useAuthStore.getState().session?.user.id ?? null;
}

function getActiveWalkStartedAt(walks: Walk[]) {
  const activeWalk = walks.find((walk) => walk.status === 'in_progress' && walk.startedAt);
  return activeWalk?.startedAt ? new Date(activeWalk.startedAt).getTime() : null;
}

function getPrimaryActiveWalkId(walks: Walk[]) {
  const activeWalks = walks
    .filter((walk) => walk.status === 'in_progress')
    .sort((a, b) => (b.startedAt ?? '').localeCompare(a.startedAt ?? ''));

  return activeWalks[0]?.id ?? null;
}

interface AppState {
  walks: Walk[];
  clients: Client[];
  walksLoading: boolean;
  clientsLoading: boolean;
  walksError: string | null;
  clientsError: string | null;
  activeWalkId: string | null;
  activeWalkStartedAt: number | null;

  // Clients — Supabase-backed
  clearData: () => void;
  loadClients: (userId: string) => Promise<void>;
  loadWalks: (userId: string) => Promise<void>;
  addClient: (client: Omit<Client, 'id'>, userId: string) => Promise<void>;
  updateClient: (clientId: string, fields: { name: string; address: string; phone: string; pricePerWalk: number }) => Promise<void>;
  addDogToClient: (clientId: string, dog: Omit<Dog, 'id'>) => Promise<Dog>;
  updateDogOnClient: (
    clientId: string,
    dogId: string,
    fields: { name: string; breed: string; emoji: string }
  ) => Promise<void>;
  /** Create new dog or replace full profile + traits for existing dog. */
  saveDogComplete: (clientId: string, existingDogId: string | undefined, dog: Omit<Dog, 'id'>) => Promise<string>;
  removeDogFromClient: (clientId: string, dogId: string) => Promise<void>;
  removeClient: (clientId: string) => Promise<void>;

  // Walks — Supabase-backed
  startWalk: (walkId: string) => Promise<void>;
  finishWalk: (walkId: string, notes?: string) => Promise<void>;
  markClientPaid: (clientId: string) => Promise<void>;
  markWalkPaid: (walkId: string) => Promise<void>;
  markWalkNoPay: (walkId: string) => Promise<void>;
  markClientNoPay: (clientId: string) => Promise<void>;
  addWalk: (walk: CreateWalkInput) => Promise<void>;
  markMissedAsComplete: (walkId: string) => Promise<void>;
  cancelWalk: (walkId: string) => Promise<void>;
  rescheduleFromMissed: (walkId: string) => Promise<void>;
  updateScheduledWalk: (
    walkId: string,
    input: {
      scheduledAt: string;
      durationMinutes: number;
      notes?: string;
      /** Omit to leave unchanged; pass `null` to clear override. */
      pricePerWalkOverride?: number | null;
      /** Omit to leave unchanged; pass `null` to clear per-dog pricing. */
      perDogPrices?: Record<string, number> | null;
    },
  ) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  walks: [],
  clients: [],
  walksLoading: false,
  clientsLoading: false,
  walksError: null,
  clientsError: null,
  activeWalkId: null,
  activeWalkStartedAt: null,

  clearData: () => set({
    walks: [],
    clients: [],
    walksLoading: false,
    clientsLoading: false,
    walksError: null,
    clientsError: null,
    activeWalkId: null,
    activeWalkStartedAt: null,
  }),

  loadClients: async (userId) => {
    set({ clientsLoading: true, clientsError: null });
    try {
      const clients = await fetchClients(userId);
      set({ clients, clientsLoading: false });
    } catch (e: any) {
      set({ clientsError: e.message, clientsLoading: false });
    }
  },

  loadWalks: async (userId) => {
    set({ walksLoading: true, walksError: null });
    try {
      const walks = await fetchWalks(userId);
      set({
        walks,
        walksLoading: false,
        activeWalkId: getPrimaryActiveWalkId(walks),
        activeWalkStartedAt: getActiveWalkStartedAt(walks),
      });
    } catch (e: any) {
      set({ walksError: e.message, walksLoading: false });
    }
  },

  addClient: async (client, userId) => {
    // Optimistic insert with a temp id
    const tempId = `temp-${Date.now()}`;
    const optimistic: Client = { ...client, id: tempId, dogs: client.dogs.map((d, i) => ({ ...d, id: `temp-d-${i}` })) };
    set((s) => ({ clients: [...s.clients, optimistic] }));
    try {
      const created = await createClient(client, userId);
      // Replace optimistic entry with real one
      set((s) => ({ clients: s.clients.map((c) => c.id === tempId ? created : c) }));
    } catch (e: any) {
      // Roll back
      set((s) => ({ clients: s.clients.filter((c) => c.id !== tempId), clientsError: e.message }));
      throw e;
    }
  },

  updateClient: async (clientId, fields) => {
    set((s) => ({
      clients: s.clients.map((c) => c.id === clientId ? { ...c, ...fields } : c),
    }));
    try {
      await updateClientFields(clientId, fields);
    } catch (e: any) {
      const userId = getCurrentUserId();
      if (userId) await get().loadClients(userId);
      throw e;
    }
  },

  addDogToClient: async (clientId, dog) => {
    const tempDog: Dog = { ...dog, id: `temp-dog-${Date.now()}` };
    set((s) => ({
      clients: s.clients.map((c) =>
        c.id === clientId ? { ...c, dogs: [...c.dogs, tempDog] } : c
      ),
    }));
    try {
      const created = await addDog(clientId, dog);
      set((s) => ({
        clients: s.clients.map((c) =>
          c.id === clientId
            ? { ...c, dogs: c.dogs.map((d) => d.id === tempDog.id ? created : d) }
            : c
        ),
      }));
      return created;
    } catch (e: any) {
      set((s) => ({
        clients: s.clients.map((c) =>
          c.id === clientId ? { ...c, dogs: c.dogs.filter((d) => d.id !== tempDog.id) } : c
        ),
      }));
      throw e;
    }
  },

  updateDogOnClient: async (clientId, dogId, fields) => {
    const prev = get().clients;
    set((s) => ({
      clients: s.clients.map((c) =>
        c.id === clientId
          ? {
              ...c,
              dogs: c.dogs.map((d) => (d.id === dogId ? { ...d, ...fields } : d)),
            }
          : c
      ),
    }));
    try {
      await updateDogFields(dogId, fields);
    } catch (e: any) {
      set({ clients: prev, clientsError: e.message });
      throw e;
    }
  },

  saveDogComplete: async (clientId, existingDogId, dog) => {
    const traitsClean = dog.traits.filter((t) => t.label.trim().length > 0).map((t) => ({
      label: t.label.trim(),
      type: t.type,
    }));
    const payload: Omit<Dog, 'id'> = {
      ...dog,
      name: dog.name.trim(),
      breed: dog.breed.trim(),
      traits: traitsClean,
    };
    if (existingDogId) {
      const prev = get().clients;
      const merged: Dog = { ...payload, id: existingDogId };
      set((s) => ({
        clients: s.clients.map((c) =>
          c.id === clientId
            ? { ...c, dogs: c.dogs.map((d) => (d.id === existingDogId ? merged : d)) }
            : c
        ),
      }));
      try {
        await updateDogProfile(existingDogId, {
          name: payload.name,
          breed: payload.breed,
          emoji: payload.emoji,
          age: payload.age,
          weight: payload.weight,
          vet: payload.vet,
          vetPhone: payload.vetPhone,
          medical: payload.medical,
          keyLocation: payload.keyLocation,
        });
        await replaceDogTraits(existingDogId, traitsClean);
      } catch (e: any) {
        set({ clients: prev, clientsError: e.message });
        throw e;
      }
      return existingDogId;
    }
    const created = await get().addDogToClient(clientId, payload);
    return created.id;
  },

  removeDogFromClient: async (clientId, dogId) => {
    const prevClients = get().clients;
    const prevWalks = get().walks;
    const affectedScheduledWalkIds = prevWalks
      .filter((walk) => walk.status === 'scheduled' && walk.dogIds.includes(dogId))
      .map((walk) => walk.id);

    set((s) => ({
      clients: s.clients.map((c) =>
        c.id === clientId
          ? {
              ...c,
              dogs: c.dogs.map((d) =>
                d.id === dogId ? { ...d, isDeleted: true } : d
              ),
            }
          : c
      ),
      walks: s.walks.map((walk) =>
        affectedScheduledWalkIds.includes(walk.id)
          ? { ...walk, status: 'cancelled' as const }
          : walk
      ),
    }));
    try {
      if (affectedScheduledWalkIds.length > 0) {
        await Promise.all(
          affectedScheduledWalkIds.map((walkId) => updateWalk(walkId, { status: 'cancelled' }))
        );
      }
      await removeDog(dogId);
    } catch (e: any) {
      set({ clients: prevClients, walks: prevWalks, clientsError: e.message });
      throw e;
    }
  },

  removeClient: async (clientId) => {
    try {
      await deleteClient(clientId);
      set((s) => {
        const nextClients = s.clients.filter((c) => c.id !== clientId);
        const nextWalks = s.walks.filter((w) => w.clientId !== clientId);
        return {
          clients: nextClients,
          walks: nextWalks,
          activeWalkId: getPrimaryActiveWalkId(nextWalks),
          activeWalkStartedAt: getActiveWalkStartedAt(nextWalks),
        };
      });
    } catch (e: any) {
      set({ clientsError: e.message });
      throw e;
    }
  },

  startWalk: async (walkId) => {
    const prev = get().walks;
    const target = prev.find((w) => w.id === walkId);
    if (!target) throw new Error('Walk not found.');
    if (target.status !== 'scheduled') {
      throw new Error('Only scheduled walks can be started from here.');
    }
    const startedAt = new Date().toISOString();

    set((state) => ({
      activeWalkId: walkId,
      activeWalkStartedAt: new Date(startedAt).getTime(),
      walks: state.walks.map((walk) =>
        walk.id === walkId
          ? { ...walk, status: 'in_progress', startedAt }
          : walk
      ),
    }));

    try {
      await updateWalk(walkId, { status: 'in_progress', startedAt, finishedAt: null });
    } catch (e: any) {
      set({
        walks: prev,
        activeWalkId: getPrimaryActiveWalkId(prev),
        activeWalkStartedAt: getActiveWalkStartedAt(prev),
        walksError: e.message,
      });
      throw e;
    }
  },

  finishWalk: async (walkId, notes) => {
    const prev = get().walks;
    const walkToFinish = prev.find((walk) => walk.id === walkId);
    const startedAt = walkToFinish?.startedAt ? new Date(walkToFinish.startedAt).getTime() : null;
    const finishedAt = new Date().toISOString();
    const actualMins = startedAt ? Math.round((Date.now() - startedAt) / 60000) : undefined;

    set((state) => ({
      activeWalkId: null,
      activeWalkStartedAt: null,
      walks: state.walks.map((walk) =>
        walk.id === walkId
          ? {
              ...walk,
              status: 'done',
              finishedAt,
              actualDurationMinutes: actualMins,
              notes: notes ?? walk.notes,
            }
          : walk
      ),
    }));

    try {
      await updateWalk(walkId, {
        status: 'done',
        finishedAt,
        actualDurationMinutes: actualMins ?? null,
        notes: notes ?? prev.find((walk) => walk.id === walkId)?.notes ?? '',
      });
    } catch (e: any) {
      set({
        walks: prev,
        activeWalkId: getPrimaryActiveWalkId(prev),
        activeWalkStartedAt: getActiveWalkStartedAt(prev),
        walksError: e.message,
      });
      throw e;
    }
  },

  markClientPaid: async (clientId) => {
    const prev = get().walks;
    set((state) => ({
      walks: state.walks.map((walk) =>
        walk.clientId === clientId && walk.paymentStatus === 'unpaid' && walk.status === 'done'
          ? { ...walk, paymentStatus: 'paid' }
          : walk
      ),
    }));

    try {
      await markClientWalksPaid(clientId);
    } catch (e: any) {
      set({ walks: prev, walksError: e.message });
      throw e;
    }
  },

  markWalkPaid: async (walkId) => {
    const prev = get().walks;
    const target = prev.find((walk) => walk.id === walkId);
    if (!target) throw new Error('Walk not found.');
    if (target.status !== 'done') throw new Error('Only completed walks can be marked paid.');
    if (target.paymentStatus !== 'unpaid') return;

    set((state) => ({
      walks: state.walks.map((walk) =>
        walk.id === walkId ? { ...walk, paymentStatus: 'paid' } : walk
      ),
    }));

    try {
      await updateWalk(walkId, { paymentStatus: 'paid' });
    } catch (e: any) {
      set({ walks: prev, walksError: e.message });
      throw e;
    }
  },

  markWalkNoPay: async (walkId) => {
    const prev = get().walks;
    const target = prev.find((walk) => walk.id === walkId);
    if (!target) throw new Error('Walk not found.');
    if (target.status !== 'done') throw new Error('Only completed walks can be marked no pay.');
    if (target.paymentStatus !== 'unpaid') return;

    set((state) => ({
      walks: state.walks.map((walk) =>
        walk.id === walkId ? { ...walk, paymentStatus: 'no_pay' } : walk
      ),
    }));

    try {
      await updateWalk(walkId, { paymentStatus: 'no_pay' });
    } catch (e: any) {
      set({ walks: prev, walksError: e.message });
      throw e;
    }
  },

  markClientNoPay: async (clientId) => {
    const prev = get().walks;
    set((state) => ({
      walks: state.walks.map((walk) =>
        walk.clientId === clientId && walk.paymentStatus === 'unpaid' && walk.status === 'done'
          ? { ...walk, paymentStatus: 'no_pay' }
          : walk
      ),
    }));

    try {
      await markClientWalksNoPay(clientId);
    } catch (e: any) {
      set({ walks: prev, walksError: e.message });
      throw e;
    }
  },

  addWalk: async (walk) => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('You must be signed in to schedule a walk.');

    const tempId = `temp-w-${Date.now()}`;
    const optimistic: Walk = {
      id: tempId,
      clientId: walk.clientId,
      dogIds: walk.dogIds,
      scheduledAt: walk.scheduledAt,
      durationMinutes: walk.durationMinutes,
      status: 'scheduled',
      paymentStatus: 'unpaid',
      notes: walk.notes,
      ...(walk.perDogPrices != null && Object.keys(walk.perDogPrices).length > 0
        ? { perDogPrices: walk.perDogPrices, pricePerWalkOverride: undefined }
        : walk.pricePerWalkOverride != null && Number.isFinite(walk.pricePerWalkOverride)
          ? { pricePerWalkOverride: walk.pricePerWalkOverride }
          : {}),
    };

    set((state) => ({ walks: [...state.walks, optimistic] }));

    try {
      await createWalk(walk, userId);
      await get().loadWalks(userId);
    } catch (e: any) {
      set((state) => ({
        walks: state.walks.filter((entry) => entry.id !== tempId),
        walksError: e.message,
      }));
      throw e;
    }
  },

  markMissedAsComplete: async (walkId) => {
    const prev = get().walks;
    const walk = prev.find((w) => w.id === walkId);
    if (!walk || walk.status !== 'scheduled') {
      throw new Error('Walk not found.');
    }
    const finishedAt = new Date().toISOString();
    const actualMins = walk.durationMinutes;
    set((state) => ({
      walks: state.walks.map((w) =>
        w.id === walkId
          ? { ...w, status: 'done' as const, finishedAt, actualDurationMinutes: actualMins }
          : w
      ),
    }));
    const userId = getCurrentUserId();
    try {
      await updateWalk(walkId, {
        status: 'done',
        finishedAt,
        actualDurationMinutes: actualMins,
        notes: walk.notes ?? '',
      });
      if (userId) await get().loadWalks(userId);
    } catch (e: any) {
      set({ walks: prev, walksError: e.message });
      throw e;
    }
  },

  cancelWalk: async (walkId) => {
    const prev = get().walks;
    set((state) => ({
      walks: state.walks.map((w) => (w.id === walkId ? { ...w, status: 'cancelled' as const } : w)),
    }));
    const userId = getCurrentUserId();
    try {
      await updateWalk(walkId, { status: 'cancelled' });
      if (userId) await get().loadWalks(userId);
    } catch (e: any) {
      set({ walks: prev, walksError: e.message });
      throw e;
    }
  },

  rescheduleFromMissed: async (walkId) => {
    const prev = get().walks;
    const walk = prev.find((w) => w.id === walkId);
    if (!walk || walk.status !== 'scheduled') {
      throw new Error('Walk not found.');
    }
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Not signed in.');
    const when = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    set((state) => ({
      walks: state.walks.map((w) =>
        w.id === walkId
          ? {
              ...w,
              status: 'scheduled' as const,
              scheduledAt: when,
              startedAt: undefined,
              finishedAt: undefined,
            }
          : w
      ),
    }));

    try {
      await updateWalk(walkId, {
        status: 'scheduled',
        scheduledAt: when,
        startedAt: null,
        finishedAt: null,
      });
      await get().loadWalks(userId);
    } catch (e: any) {
      set({ walks: prev, walksError: e.message });
      throw e;
    }
  },

  updateScheduledWalk: async (walkId, input) => {
    const prev = get().walks;
    const w = prev.find((x) => x.id === walkId);
    if (!w) throw new Error('Walk not found.');
    if (w.status !== 'scheduled') {
      throw new Error('Only scheduled walks can be edited. Complete or cancel this walk if it is already in progress or finished.');
    }
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Not signed in.');

    set((state) => ({
      walks: state.walks.map((x) =>
        x.id === walkId
          ? {
              ...x,
              scheduledAt: input.scheduledAt,
              durationMinutes: input.durationMinutes,
              notes: input.notes,
              ...(input.pricePerWalkOverride !== undefined ||
              input.perDogPrices !== undefined
                ? input.perDogPrices != null &&
                  Object.keys(input.perDogPrices).length > 0
                  ? {
                      perDogPrices: input.perDogPrices,
                      pricePerWalkOverride: undefined,
                    }
                  : {
                      perDogPrices: undefined,
                      pricePerWalkOverride:
                        input.pricePerWalkOverride === null ||
                        input.pricePerWalkOverride === undefined
                          ? undefined
                          : input.pricePerWalkOverride,
                    }
                : {}),
            }
          : x
      ),
    }));

    try {
      await updateWalk(walkId, {
        scheduledAt: input.scheduledAt,
        durationMinutes: input.durationMinutes,
        notes: input.notes ?? '',
        ...(input.pricePerWalkOverride !== undefined
          ? { pricePerWalkOverride: input.pricePerWalkOverride }
          : {}),
        ...(input.perDogPrices !== undefined ? { perDogPrices: input.perDogPrices } : {}),
      });
      await get().loadWalks(userId);
    } catch (e: any) {
      set({ walks: prev, walksError: e.message });
      throw e;
    }
  },
}));
