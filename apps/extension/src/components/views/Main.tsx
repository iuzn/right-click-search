import { useVisibility } from '@/context/VisibilityContext';
import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { extensionId } from '@/lib/config';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useSearchEngines } from '@/hooks/useSearchEngines';
import { SearchEngineCard } from '@/components/search/SearchEngineCard';
import type { CreateSearchEngineParams } from '@/types/search';

export default function Main() {
  const isPopup =
    typeof window !== 'undefined' && window.location.href.includes('popup');

  // Get logo URL via Chrome API (required for content script)
  const logoUrl = isPopup
    ? '/logo.png'
    : typeof chrome !== 'undefined' && chrome.runtime?.getURL
      ? chrome.runtime.getURL('logo.png')
      : '/logo.png';

  const { isRootVisible, toggleRootVisibility } = isPopup
    ? { isRootVisible: true, toggleRootVisibility: () => {} }
    : useVisibility();
  const containerRef = useRef<HTMLDivElement>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<'selection' | 'image'>(
    'selection',
  );

  // Menu state
  const [showMenu, setShowMenu] = useState(false);

  // New engine animation state
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Click outside to close hook
  useClickOutside(
    isPopup,
    isRootVisible,
    () => toggleRootVisibility(false),
    extensionId,
  );

  // Search engines hook
  const {
    engines,
    isLoading,
    addEngine,
    updateEngine,
    removeEngine,
    toggleEngine,
    resetEngines,
    exportEngines,
    importEngines,
  } = useSearchEngines();

  const handleAddEngine = async () => {
    const newEngine: CreateSearchEngineParams = {
      title: activeTab === 'selection' ? 'New Text Search' : 'New Image Search',
      url:
        activeTab === 'selection'
          ? 'https://www.google.com/search?q=%s'
          : 'https://www.google.com/searchbyimage?image_url=%s',
      icon: activeTab === 'selection' ? '🔍' : '🖼️',
      iconType: 'emoji',
      enabled: true,
      isDefault: false,
      contexts: [activeTab],
    };

    const addedEngine = await addEngine(newEngine);
    setNewlyAddedId(addedEngine.id);
    setShowMenu(false);
    showNotification('Search engine added!', 'success');

    // Use timeout to focus on newly added engine's title input
    setTimeout(() => {
      const inputs = document.querySelectorAll('input[type="text"]');
      const lastTitleInput = inputs[inputs.length - 2] as HTMLInputElement; // Last added card's title input
      if (lastTitleInput) {
        lastTitleInput.focus();
        lastTitleInput.select();
      }
      // Clear newlyAddedId after animation completes
      setTimeout(() => setNewlyAddedId(null), 500);
    }, 100);
  };

  // Import handler
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await importEngines(file);
    if (result.success) {
      showNotification('Settings imported successfully!', 'success');
    } else {
      showNotification(`Import failed: ${result.error}`, 'error');
    }

    // Clear file input
    e.target.value = '';
  };

  // Export handler
  const handleExport = () => {
    exportEngines();
    setShowMenu(false);
    showNotification('Settings exported!', 'success');
  };

  // Delete search engine
  const handleDeleteEngine = async (id: string) => {
    await removeEngine(id);
    showNotification('Search engine deleted!', 'success');
  };

  // Notification helper
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Filter engines by active tab
  const filteredEngines = engines.filter((engine) =>
    engine.contexts.includes(activeTab),
  );

  // Reset scroll position when tab changes
  useEffect(() => {
    const scrollContainer = document.querySelector('[data-scroll-container]');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, [activeTab]);

  return (
    <>
      <div className="relative h-full">
        <div
          ref={containerRef}
          className={cn(
            'flex flex-col',
            isPopup && 'h-[600px] w-full bg-neutral-50 dark:bg-neutral-900',
            !isPopup && [
              'fixed right-6 top-6 z-[2147483647] h-[600px] w-[440px] rounded-2xl',
              'border border-neutral-200/50 bg-neutral-50/95 shadow-2xl shadow-neutral-900/20',
              'backdrop-blur-xl transition-all duration-500 ease-out',
              'dark:border-neutral-700/50 dark:bg-neutral-900/95 dark:shadow-neutral-900/60',
              isRootVisible
                ? 'translate-y-0 scale-100 opacity-100'
                : 'pointer-events-none -translate-y-[16px] scale-95 opacity-0',
            ],
          )}
        >
          {/* Header */}
          <div className="flex flex-shrink-0 flex-col border-b border-neutral-200/30 dark:border-neutral-700/30">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <img
                  src={logoUrl}
                  alt="Extension Logo"
                  className="h-10 w-10 rounded-xl object-contain"
                />
                <div>
                  <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Search Engines
                  </h1>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {filteredEngines.length}{' '}
                    {activeTab === 'selection' ? 'text' : 'image'} engine
                    {filteredEngines.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Hamburger Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className={cn(
                      'group flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200',
                      'hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50',
                    )}
                  >
                    <svg
                      className="h-5 w-5 text-neutral-600 transition-colors duration-200 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-100"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        'absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border',
                        'border-neutral-200/50 bg-white/95 shadow-xl backdrop-blur-xl',
                        'dark:border-neutral-700/50 dark:bg-neutral-800/95',
                      )}
                    >
                      <div className="p-1">
                        <button
                          onClick={handleExport}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm',
                            'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700',
                            'transition-colors duration-150',
                          )}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          Export
                        </button>

                        <label
                          className={cn(
                            'flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm',
                            'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700',
                            'transition-colors duration-150',
                          )}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          Import
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Close button (only for content view) */}
                {!isPopup && (
                  <button
                    onClick={() => toggleRootVisibility(false)}
                    className={cn(
                      'group flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200',
                      'hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50',
                    )}
                  >
                    <svg
                      className="h-4 w-4 text-neutral-500 transition-colors duration-200 group-hover:text-neutral-700 dark:text-neutral-400 dark:group-hover:text-neutral-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-t border-neutral-200/30 dark:border-neutral-700/30">
              <button
                onClick={() => setActiveTab('selection')}
                className={cn(
                  'flex-1 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                  activeTab === 'selection'
                    ? 'border-eb-600 text-eb-600 dark:border-eb-400 dark:text-eb-400'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100',
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Text Search
                </div>
              </button>
              <button
                onClick={() => setActiveTab('image')}
                className={cn(
                  'flex-1 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                  activeTab === 'image'
                    ? 'border-eb-600 text-eb-600 dark:border-eb-400 dark:text-eb-400'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100',
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Image Search
                </div>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Scrollable list */}
            <div
              className="flex-1 overflow-y-auto px-6 py-4 pb-24"
              data-scroll-container
            >
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-eb-600 dark:border-neutral-700 dark:border-t-eb-400" />
                    <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                      Loading...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEngines.map((engine) => (
                    <SearchEngineCard
                      key={engine.id}
                      engine={engine}
                      onUpdate={updateEngine}
                      onDelete={handleDeleteEngine}
                      onToggle={toggleEngine}
                      isNewlyAdded={newlyAddedId === engine.id}
                    />
                  ))}

                  {filteredEngines.length === 0 && (
                    <div className="py-12 text-center">
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        No {activeTab === 'selection' ? 'text' : 'image'} search
                        engines configured
                      </p>
                      <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                        Use the menu to add one
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddEngine}
          className={cn(
            'fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center',
            'rounded-full bg-eb-600 text-white shadow-2xl shadow-eb-600/30 dark:text-neutral-900',
            'dark:bg-eb-500 dark:shadow-eb-500/30',
            'hover:shadow-3xl transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-eb-500/50',
          )}
          title="Add Search Engine"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </motion.button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            'fixed left-1/2 top-6 z-[2147483648] -translate-x-1/2',
            'rounded-xl px-4 py-3 shadow-xl',
            'backdrop-blur-xl',
            notification.type === 'success'
              ? 'bg-green-500/90 text-white'
              : 'bg-red-500/90 text-white',
          )}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </motion.div>
      )}
    </>
  );
}
