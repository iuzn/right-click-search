import React, { createContext, useContext, useEffect, useState } from 'react';
import { extensionId } from '@/lib/config';
import visibilityStorage from '@/shared/storages/visibilityStorage';

interface VisibilityContextType {
  isRootVisible: boolean;
  toggleRootVisibility: (isVisible?: boolean) => void;
}

const VisibilityContext = createContext<VisibilityContextType | undefined>(
  undefined,
);

export function VisibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isRootVisible, setIsRootVisible] = useState(false);

  const updateVisibility = (newState: boolean) => {
    const root = document.getElementById(extensionId + '-content-view-root');

    setIsRootVisible(newState);
    if (root) {
      root.style.visibility = newState ? 'visible' : 'hidden';
    }
  };

  // Initial state and storage change listener
  useEffect(() => {
    const init = async () => {
      try {
        const state = await visibilityStorage.get();
        updateVisibility(state);
      } catch (error) {
        console.error('Error loading visibility state:', error);
      }
    };

    init();

    // Storage change listener
    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (changes['visibility-storage-key']) {
        const newValue = changes['visibility-storage-key'].newValue;
        updateVisibility(newValue);
      }
    };

    chrome.storage.local.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.local.onChanged.removeListener(handleStorageChange);
    };
  }, []);
 

  const toggleRootVisibility = async (isVisible?: boolean) => {
    try {
      const newState = isVisible ?? !isRootVisible;
      await visibilityStorage.set(newState);
      updateVisibility(newState);
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  return (
    <VisibilityContext.Provider value={{ isRootVisible, toggleRootVisibility }}>
      {children}
    </VisibilityContext.Provider>
  );
}

export const useVisibility = () => {
  const context = useContext(VisibilityContext);
  if (!context) {
    throw new Error('useVisibility must be used within a VisibilityProvider');
  }
  return context;
};
