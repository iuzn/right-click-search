import { useEffect, useState } from 'react';
import searchEnginesStorage from '@/shared/storages/searchEnginesStorage';
import type {
  SearchEngine,
  CreateSearchEngineParams,
  UpdateSearchEngineParams,
} from '@/types/search';

/**
 * Custom hook for search engines management
 */
export function useSearchEngines() {
  const [engines, setEngines] = useState<SearchEngine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from storage and listen for changes
  useEffect(() => {
    const loadEngines = async () => {
      const data = await searchEnginesStorage.get();
      setEngines(data);
      setIsLoading(false);
    };

    loadEngines();

    // Listen for storage changes
    const unsubscribe = searchEnginesStorage.subscribe(() => {
      const snapshot = searchEnginesStorage.getSnapshot();
      if (snapshot) {
        setEngines(snapshot);
      }
    });

    return unsubscribe;
  }, []);

  // Add new search engine
  const addEngine = async (params: CreateSearchEngineParams) => {
    return await searchEnginesStorage.add(params);
  };

  // Update search engine
  const updateEngine = async (id: string, params: UpdateSearchEngineParams) => {
    await searchEnginesStorage.update(id, params);
  };

  // Delete search engine
  const removeEngine = async (id: string) => {
    await searchEnginesStorage.remove(id);
  };

  // Toggle search engine enabled/disabled
  const toggleEngine = async (id: string) => {
    await searchEnginesStorage.toggleEnabled(id);
  };

  // Reset settings
  const resetEngines = async () => {
    await searchEnginesStorage.reset();
  };

  // JSON export
  const exportEngines = () => {
    const dataStr = JSON.stringify(engines, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `search-engines-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // JSON import
  const importEngines = async (
    file: File,
  ): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);

          // Basit validasyon
          if (!Array.isArray(data)) {
            resolve({ success: false, error: 'Invalid format: not an array' });
            return;
          }

          // Check if each item has required fields
          const isValid = data.every(
            (item) =>
              item.id &&
              item.title &&
              item.url &&
              typeof item.enabled === 'boolean',
          );

          if (!isValid) {
            resolve({ success: false, error: 'Invalid engine data structure' });
            return;
          }

          await searchEnginesStorage.set(data);
          resolve({ success: true });
        } catch (error) {
          resolve({
            success: false,
            error: error instanceof Error ? error.message : 'Parse error',
          });
        }
      };

      reader.onerror = () => {
        resolve({ success: false, error: 'Failed to read file' });
      };

      reader.readAsText(file);
    });
  };

  return {
    engines,
    isLoading,
    addEngine,
    updateEngine,
    removeEngine,
    toggleEngine,
    resetEngines,
    exportEngines,
    importEngines,
  };
}
