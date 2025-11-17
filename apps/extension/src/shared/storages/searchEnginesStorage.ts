import {
  BaseStorage,
  createStorage,
  StorageType,
} from '@/shared/storages/base';
import type {
  SearchEngine,
  CreateSearchEngineParams,
  UpdateSearchEngineParams,
} from '@/types/search';
import { DEFAULT_SEARCH_ENGINES } from '@/lib/defaultSearchEngines';

/**
 * Search engines storage type - extended with CRUD operations
 */
type SearchEnginesStorage = BaseStorage<SearchEngine[]> & {
  add: (params: CreateSearchEngineParams) => Promise<SearchEngine>;
  update: (id: string, params: UpdateSearchEngineParams) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggleEnabled: (id: string) => Promise<void>;
  reset: () => Promise<void>;
};

/**
 * Create base storage
 */
const storage = createStorage<SearchEngine[]>(
  'search-engines-storage-key',
  DEFAULT_SEARCH_ENGINES,
  {
    storageType: StorageType.Sync,
    liveUpdate: true,
  },
);
 
const add = async (params: CreateSearchEngineParams): Promise<SearchEngine> => {
  const newEngine: SearchEngine = {
    ...params,
    id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await storage.set((current) => [...current, newEngine]);
  return newEngine;
};

/**
 * Update search engine
 */
const update = async (
  id: string,
  params: UpdateSearchEngineParams,
): Promise<void> => {
  await storage.set((current) =>
    current.map((engine) =>
      engine.id === id
        ? { ...engine, ...params, updatedAt: Date.now() }
        : engine,
    ),
  );
};

/**
 * Delete search engine
 */
const remove = async (id: string): Promise<void> => {
  await storage.set((current) => current.filter((engine) => engine.id !== id));
};

/**
 * Toggle search engine enabled
 */
const toggleEnabled = async (id: string): Promise<void> => {
  await storage.set((current) =>
    current.map((engine) =>
      engine.id === id
        ? { ...engine, enabled: !engine.enabled, updatedAt: Date.now() }
        : engine,
    ),
  );
};

/**
 * Reset all settings to default
 */
const reset = async (): Promise<void> => {
  await storage.set(DEFAULT_SEARCH_ENGINES);
};

/**
 * Search engines storage - with all CRUD operations
 */
const searchEnginesStorage: SearchEnginesStorage = {
  ...storage,
  add,
  update,
  remove,
  toggleEnabled,
  reset,
};

export default searchEnginesStorage;
