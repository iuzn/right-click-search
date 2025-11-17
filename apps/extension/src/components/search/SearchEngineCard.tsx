import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { IconPicker } from './IconPicker';
import { KeyboardShortcutRecorder } from './KeyboardShortcutRecorder';
import type {
  SearchEngine,
  UpdateSearchEngineParams,
  KeyboardShortcut,
} from '@/types/search';

interface SearchEngineCardProps {
  engine: SearchEngine;
  onUpdate: (id: string, params: UpdateSearchEngineParams) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  isNewlyAdded?: boolean;
}

/**
 * Search engine card - with inline editing
 */
export function SearchEngineCard({
  engine,
  onUpdate,
  onDelete,
  onToggle,
  isNewlyAdded = false,
}: SearchEngineCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(engine.title);
  const [url, setUrl] = useState(engine.url);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Save when exiting edit mode
  const handleBlur = () => {
    setIsEditing(false);
    if (title !== engine.title || url !== engine.url) {
      onUpdate(engine.id, { title, url });
    }
  };

  // Handle icon change
  const handleIconChange = (
    newIcon: string,
    newIconType: typeof engine.iconType,
  ) => {
    onUpdate(engine.id, { icon: newIcon, iconType: newIconType });
  };

  return (
    <motion.div
      initial={
        isNewlyAdded
          ? { opacity: 0, scale: 0.85, y: 20, filter: 'blur(10px)' }
          : false
      }
      animate={
        isNewlyAdded
          ? { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }
          : undefined
      }
      exit={{ opacity: 0, scale: 0.95, x: -20 }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94], // Natural cubic-bezier
        filter: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
      }}
      className={cn(
        'group relative min-h-[180px] rounded-2xl border p-6',
        'bg-white/95 backdrop-blur-xl',
        'border-neutral-200/50 shadow-lg shadow-neutral-900/5',
        'dark:border-neutral-700/50 dark:bg-neutral-800/95 dark:shadow-neutral-900/40',
        'transition-all duration-300',
        'hover:shadow-xl hover:shadow-neutral-900/10 dark:hover:shadow-neutral-900/60',
        !engine.enabled && 'opacity-60',
      )}
    >
      <div className="space-y-4">
        {/* Title Input */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsEditing(true)}
            onBlur={handleBlur}
            disabled={!engine.enabled}
            className={cn(
              'w-full rounded-lg border border-neutral-200/50 bg-white/50 px-3 py-2 text-sm',
              'placeholder:text-neutral-400',
              'focus:border-eb-500 focus:outline-none focus:ring-2 focus:ring-eb-500/20',
              'dark:border-neutral-700/50 dark:bg-neutral-800/50 dark:text-neutral-100',
              'dark:focus:border-eb-400 dark:focus:ring-eb-400/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-all duration-200',
            )}
          />
        </div>

        {/* URL Input */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
            URL Pattern{' '}
            <span className="text-neutral-400">(%s = search term)</span>
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => setIsEditing(true)}
            onBlur={handleBlur}
            disabled={!engine.enabled}
            placeholder="https://example.com/search?q=%s"
            className={cn(
              'font-mono w-full rounded-lg border border-neutral-200/50 bg-white/50 px-3 py-2 text-sm',
              'placeholder:text-neutral-400',
              'focus:border-eb-500 focus:outline-none focus:ring-2 focus:ring-eb-500/20',
              'dark:border-neutral-700/50 dark:bg-neutral-800/50 dark:text-neutral-100',
              'dark:focus:border-eb-400 dark:focus:ring-eb-400/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-all duration-200',
            )}
          />
        </div>

        {/* Keyboard Shortcut - Only for text search engines */}
        {engine.contexts.includes('selection') && (
          <KeyboardShortcutRecorder
            value={engine.keyboardShortcut}
            onChange={(shortcut) =>
              onUpdate(engine.id, { keyboardShortcut: shortcut })
            }
            disabled={!engine.enabled}
          />
        )}

        {/* Actions */}
        <div className="flex h-14 items-center justify-between border-t border-neutral-200/30 pt-4 dark:border-neutral-700/30">
          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => onToggle(engine.id)}
            className={cn(
              'relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200',
              engine.enabled
                ? 'bg-eb-600 dark:bg-eb-500'
                : 'bg-neutral-300 dark:bg-neutral-600',
            )}
          >
            <span className="sr-only">Enable engine</span>
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full shadow-lg transition-transform duration-200',
                engine.enabled
                  ? 'translate-x-6 bg-white dark:bg-neutral-900'
                  : 'translate-x-1 bg-white dark:bg-neutral-200',
              )}
            />
          </button>

          {/* Delete Button / Confirm UI */}
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Are you sure?
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    onDelete(engine.id);
                    setShowDeleteConfirm(false);
                  }}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg',
                    'bg-green-500/10 text-green-600 hover:bg-green-500/20',
                    'dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/30',
                    'transition-colors duration-200',
                  )}
                  title="Confirm delete"
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg',
                    'bg-neutral-500/10 text-neutral-600 hover:bg-neutral-500/20',
                    'dark:bg-neutral-500/20 dark:text-neutral-400 dark:hover:bg-neutral-500/30',
                    'transition-colors duration-200',
                  )}
                  title="Cancel delete"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium',
                'text-red-600 hover:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20',
                'transition-colors duration-200',
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
