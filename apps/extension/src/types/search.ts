/**
 * Search engine icon type
 */
export type IconType = 'emoji' | 'url';

/**
 * Context menu contexts
 */
export type ContextType = 'selection' | 'image' | 'link' | 'page';

/**
 * Keyboard shortcut modifiers
 */
export type KeyboardModifier = 'ctrl' | 'alt' | 'shift' | 'meta';

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  key: string;
  modifiers: KeyboardModifier[];
  description?: string;
}

/**
 * Search engine interface
 */
export interface SearchEngine {
  id: string;
  title: string;
  url: string;
  icon: string;
  iconType: IconType;
  enabled: boolean;
  isDefault: boolean;
  contexts: ContextType[];
  keyboardShortcut?: KeyboardShortcut;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Search engine creation parameters
 */
export type CreateSearchEngineParams = Omit<
  SearchEngine,
  'id' | 'createdAt' | 'updatedAt'
>;

/**
 * Search engine update parameters
 */
export type UpdateSearchEngineParams = Partial<
  Omit<SearchEngine, 'id' | 'isDefault' | 'createdAt'>
>;
