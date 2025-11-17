import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { IconType } from '@/types/search';

interface IconPickerProps {
  icon: string;
  iconType: IconType;
  onIconChange: (icon: string, iconType: IconType) => void;
  disabled?: boolean;
}

/**
 * Icon picker component - emoji or URL
 */
export function IconPicker({
  icon,
  iconType,
  onIconChange,
  disabled = false,
}: IconPickerProps) {
  const [mode, setMode] = useState<IconType>(iconType);

  const handleModeToggle = () => {
    const newMode = mode === 'emoji' ? 'url' : 'emoji';
    setMode(newMode);
    onIconChange(icon, newMode);
  };

  const handleIconChange = (newIcon: string) => {
    onIconChange(newIcon, mode);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Icon preview */}
      <div
        className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
          'border border-neutral-200/50 bg-neutral-50/50',
          'dark:border-neutral-700/50 dark:bg-neutral-800/50',
        )}
      >
        {mode === 'emoji' ? (
          <span className="text-lg">{icon || '📝'}</span>
        ) : (
          <img
            src={icon || '/icon-48.png'}
            alt="Icon"
            className="h-6 w-6 rounded object-contain"
            onError={(e) => {
              e.currentTarget.src = '/icon-48.png';
            }}
          />
        )}
      </div>

      {/* Icon input */}
      <input
        type="text"
        value={icon}
        onChange={(e) => handleIconChange(e.target.value)}
        disabled={disabled}
        placeholder={mode === 'emoji' ? '🎬 Emoji' : 'https://...'}
        className={cn(
          'flex-1 rounded-lg border border-neutral-200/50 bg-white/50 px-3 py-2 text-sm',
          'placeholder:text-neutral-400',
          'focus:border-eb-500 focus:outline-none focus:ring-2 focus:ring-eb-500/20',
          'dark:border-neutral-700/50 dark:bg-neutral-800/50 dark:text-neutral-100',
          'dark:focus:border-eb-400 dark:focus:ring-eb-400/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-200',
        )}
      />

      {/* Mode toggle button */}
      <button
        type="button"
        onClick={handleModeToggle}
        disabled={disabled}
        className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
          'border border-neutral-200/50 bg-white/50',
          'text-neutral-600 hover:bg-neutral-100/50 hover:text-neutral-900',
          'dark:border-neutral-700/50 dark:bg-neutral-800/50',
          'dark:text-neutral-400 dark:hover:bg-neutral-700/50 dark:hover:text-neutral-100',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-200',
        )}
        title={mode === 'emoji' ? 'Switch to URL' : 'Switch to Emoji'}
      >
        {mode === 'emoji' ? (
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
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
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
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
