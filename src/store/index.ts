import { create } from 'zustand';
import { Walk, Client, Dog } from '../types';
import { fetchClients, createClient, deleteClient, updateClientFields, addDog, removeDog } from '../lib/clientsService';
import { createWalk, fetchWalks, markClientWalksPaid, updateWalk, CreateWalkInput } from '../lib/walksService';
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
  addDogToClient: (clientId: string, dog: Omit<Dog, 'id'>) => Promise<void>;
  removeDogFromClient: (clientId: string, dogId: string) => Promise<void>;
  removeClient: (clientId: string) => Promise<void>;

  // Walks — Supabase-backed
  startWalk: (walkId: string) => Promise<void>;
  finishWalk: (walkId: string, notes?: string) => Promise<void>;
  markClientPaid: (clientId: string) => Promise<void>;
  addWalk: (walk: CreateWalkInput) => Promise<void>;
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
    } catch (e: any) {
      set((s) => ({
        clients: s.clients.map((c) =>
          c.id === clientId ? { ...c, dogs: c.dogs.filter((d) => d.id !== tempDog.id) } : c
        ),
      }));
      throw e;
    }
  },

  removeDogFromClient: async (clientId, dogId) => {
    const prev = get().clients;
    set((s) => ({
      clients: s.clients.map((c) =>
        c.id === clientId ? { ...c, dogs: c.dogs.filter((d) => d.id !== dogId) } : c
      ),
    }));
    try {
      await removeDog(dogId);
    } catch (e: any) {
      set({ clients: prev });
      throw e;
    }
  },

  removeClient: async (clientId) => {
    const prev = get().clients;
    set((s) => ({ clients: s.clients.filter((c) => c.id !== clientId) }));
    try {
      await deleteClient(clientId);
    } catch (e: any) {
      set({ clients: prev, clientsError: e.message });
      throw e;
    }
  },

  startWalk: async (walkId) => {
    const prev = get().walks;
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
}));
