// Storage adapter with fallback chain:
// expo-secure-store → AsyncStorage → in-memory (no crash in any environment)

const CHUNK_SIZE = 2000;
const memoryStore: Record<string, string> = {};

type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

function memoryAdapter(): StorageAdapter {
  return {
    getItem: (key: string) => Promise.resolve(memoryStore[key] ?? null),
    setItem: (key: string, value: string) => { memoryStore[key] = value; return Promise.resolve(); },
    removeItem: (key: string) => { delete memoryStore[key]; return Promise.resolve(); },
  };
}

function secureStoreAdapter(SecureStore: typeof import('expo-secure-store')): StorageAdapter {
  return {
    async getItem(key: string) {
      const n = await SecureStore.getItemAsync(`${key}_n`);
      if (!n) return null;
      let value = '';
      for (let i = 0; i < parseInt(n, 10); i++) {
        const chunk = await SecureStore.getItemAsync(`${key}_${i}`);
        if (chunk === null) return null;
        value += chunk;
      }
      return value;
    },
    async setItem(key: string, value: string) {
      const numChunks = Math.ceil(value.length / CHUNK_SIZE);
      await SecureStore.setItemAsync(`${key}_n`, String(numChunks));
      for (let i = 0; i < numChunks; i++) {
        await SecureStore.setItemAsync(`${key}_${i}`, value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
      }
    },
    async removeItem(key: string) {
      const n = await SecureStore.getItemAsync(`${key}_n`);
      if (!n) return;
      await SecureStore.deleteItemAsync(`${key}_n`);
      for (let i = 0; i < parseInt(n, 10); i++) {
        await SecureStore.deleteItemAsync(`${key}_${i}`);
      }
    },
  };
}

async function buildAdapter(): Promise<StorageAdapter> {
  // Try expo-secure-store
  try {
    const SecureStore = await import('expo-secure-store');
    await SecureStore.setItemAsync('__test__', '1');
    await SecureStore.deleteItemAsync('__test__');
    return secureStoreAdapter(SecureStore);
  } catch {}

  // Try AsyncStorage
  try {
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    await AsyncStorage.setItem('__test__', '1');
    await AsyncStorage.removeItem('__test__');
    return {
      getItem: (key: string) => AsyncStorage.getItem(key),
      setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
      removeItem: (key: string) => AsyncStorage.removeItem(key),
    };
  } catch {}

  // Fall back to memory (session won't survive app restarts, but app won't crash)
  console.warn('[storage] No persistent storage available — session will not survive app restarts');
  return memoryAdapter();
}

// Resolved once on first use, shared across all calls
let resolvedAdapter: StorageAdapter | null = null;
let resolving: Promise<StorageAdapter> | null = null;

async function getAdapter() {
  if (resolvedAdapter) return resolvedAdapter;
  if (!resolving) resolving = buildAdapter().then((a) => { resolvedAdapter = a; return a; });
  return resolving;
}

export const storage = {
  getItem:    async (key: string) => (await getAdapter()).getItem(key),
  setItem:    async (key: string, value: string) => (await getAdapter()).setItem(key, value),
  removeItem: async (key: string) => (await getAdapter()).removeItem(key),
};
