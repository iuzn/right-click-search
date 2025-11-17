import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { KeyboardShortcut, KeyboardModifier } from '@/types/search';

interface KeyboardShortcutRecorderProps {
  value?: KeyboardShortcut;
  onChange: (shortcut?: KeyboardShortcut) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Keyboard shortcut recorder component
 */
export function KeyboardShortcutRecorder({
  value,
  onChange,
  disabled = false,
  className,
}: KeyboardShortcutRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [tempShortcut, setTempShortcut] = useState<KeyboardShortcut>();
  const [isMac, setIsMac] = useState(false);

  // Detect platform
  useEffect(() => {
    setIsMac(navigator.platform.toLowerCase().includes('mac'));
  }, []);

  // Format shortcut for display
  const formatShortcut = useCallback(
    (shortcut?: KeyboardShortcut): string => {
      if (!shortcut) return 'Not set';

      const modifiers = shortcut.modifiers.map((mod) => {
        switch (mod) {
          case 'ctrl':
            return isMac ? '⌃' : 'Ctrl';
          case 'alt':
            return isMac ? '⌥' : 'Alt';
          case 'shift':
            return isMac ? '⇧' : 'Shift';
          case 'meta':
            return isMac ? '⌘' : 'Win';
          default:
            return mod;
        }
      });

      const key = shortcut.key.toUpperCase();
      return [...modifiers, key].join(isMac ? '' : '+');
    },
    [isMac],
  );

  // Handle keyboard events during recording
  useEffect(() => {
    if (!isRecording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Ignore modifier-only presses
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
        return;
      }

      const modifiers: KeyboardModifier[] = [];
      if (e.ctrlKey) modifiers.push('ctrl');
      if (e.altKey) modifiers.push('alt');
      if (e.shiftKey) modifiers.push('shift');
      if (e.metaKey) modifiers.push('meta');

      // Require at least one modifier
      if (modifiers.length === 0) {
        return;
      }

      const shortcut: KeyboardShortcut = {
        key: e.key.toLowerCase(),
        modifiers,
      };

      setTempShortcut(shortcut);
      setIsRecording(false);
      onChange(shortcut);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Stop recording on Escape
      if (e.key === 'Escape') {
        setIsRecording(false);
        setTempShortcut(undefined);
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [isRecording, onChange]);

  // Start recording
  const startRecording = () => {
    if (disabled) return;
    setIsRecording(true);
    setTempShortcut(undefined);
  };

  // Clear shortcut
  const clearShortcut = () => {
    if (disabled) return;
    onChange(undefined);
    setTempShortcut(undefined);
  };

  // Stop recording
  const stopRecording = () => {
    setIsRecording(false);
    setTempShortcut(undefined);
  };

  const displayText = isRecording
    ? 'Press keys...'
    : tempShortcut
      ? formatShortcut(tempShortcut)
      : formatShortcut(value);

  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400">
        Keyboard Shortcut
      </label>

      <div className="flex items-center gap-2">
        {/* Shortcut Display */}
        <div
          className={cn(
            'font-mono flex-1 rounded-lg border px-3 py-2 text-sm',
            'bg-white/50 text-neutral-900',
            'dark:bg-neutral-800/50 dark:text-neutral-100',
            'border-neutral-200/50 dark:border-neutral-700/50',
            'transition-all duration-200',
            isRecording && 'border-eb-500 ring-2 ring-eb-500/50',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          {displayText}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {isRecording ? (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              type="button"
              onClick={stopRecording}
              disabled={disabled}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg',
                'bg-red-500/10 text-red-600 hover:bg-red-500/20',
                'dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30',
                'transition-colors duration-200',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
              title="Stop recording"
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
            </motion.button>
          ) : (
            <>
              <button
                type="button"
                onClick={startRecording}
                disabled={disabled}
                className={cn(
                  'flex h-8 items-center gap-2 rounded-lg px-3 py-1 text-sm font-medium',
                  'bg-eb-600 text-white hover:bg-eb-700',
                  'dark:bg-eb-500 dark:text-neutral-900 dark:hover:bg-eb-600',
                  'transition-colors duration-200',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
                title="Record shortcut"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx={12} cy={12} r={3} />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06-.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
                Record
              </button>

              {(value || tempShortcut) && (
                <button
                  type="button"
                  onClick={clearShortcut}
                  disabled={disabled}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg',
                    'bg-neutral-500/10 text-neutral-600 hover:bg-neutral-500/20',
                    'dark:bg-neutral-500/20 dark:text-neutral-400 dark:hover:bg-neutral-500/30',
                    'transition-colors duration-200',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                  title="Clear shortcut"
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
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Recording Instructions */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            'rounded-lg border p-3 text-sm',
            'border-blue-500/20 bg-blue-500/10 text-blue-700',
            'dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300',
          )}
        >
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx={12} cy={12} r={10} />
              <path d="M12 6v6l4 2" />
            </svg>
            <span className="font-medium">Recording keyboard shortcut...</span>
          </div>
          <p className="mt-1 text-xs opacity-80">
            Press a combination of modifier keys (Ctrl/Cmd, Alt/Option, Shift) +
            a letter/number key. Press Escape to cancel.
          </p>
        </motion.div>
      )}
    </div>
  );
}
