// /pages/content/index.ts
import type { SearchEngine, KeyboardShortcut } from '@/types/search';

/**
 * Keyboard shortcut manager - handles global keyboard shortcuts
 */
class KeyboardShortcutManager {
  private engines: SearchEngine[] = [];
  private shortcuts: Map<string, SearchEngine> = new Map();

  constructor() {
    this.init();
  }

  /**
   * Initialize the manager
   */
  private async init() {
    // Load search engines
    await this.loadEngines();

    // Setup keyboard listener
    this.setupKeyboardListener();

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync' && changes['search-engines-storage-key']) {
        this.engines = changes['search-engines-storage-key'].newValue || [];
        this.updateShortcuts();
      }
    });
  }

  /**
   * Load search engines from storage
   */
  private async loadEngines() {
    try {
      const result = await chrome.storage.sync.get([
        'search-engines-storage-key',
      ]);
      this.engines = result['search-engines-storage-key'] || [];
      this.updateShortcuts();
    } catch (error) {
      console.error('Failed to load search engines:', error);
      this.engines = [];
    }
  }

  /**
   * Update shortcuts mapping
   */
  private updateShortcuts() {
    this.shortcuts.clear();

    this.engines
      .filter((engine) => engine.enabled && engine.keyboardShortcut)
      .forEach((engine) => {
        const key = this.shortcutToString(engine.keyboardShortcut!);
        this.shortcuts.set(key, engine);
      });

    console.log(`Updated ${this.shortcuts.size} keyboard shortcuts`);
  }

  /**
   * Convert shortcut to string key for mapping
   */
  private shortcutToString(shortcut: KeyboardShortcut): string {
    const modifiers = [...shortcut.modifiers].sort().join('+');
    return `${modifiers}+${shortcut.key.toLowerCase()}`;
  }

  /**
   * Setup global keyboard listener
   */
  private setupKeyboardListener() {
    document.addEventListener('keydown', (e) => {
      // Only handle shortcuts when not in an input/textarea/select
      const target = e.target as HTMLElement;
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      // Build shortcut from event
      const modifiers: string[] = [];
      if (e.ctrlKey) modifiers.push('ctrl');
      if (e.altKey) modifiers.push('alt');
      if (e.shiftKey) modifiers.push('shift');
      if (e.metaKey) modifiers.push('meta');

      // Require at least one modifier
      if (modifiers.length === 0) return;

      const key = e.key.toLowerCase();
      const shortcutKey = [...modifiers.sort(), key].join('+');

      // Check if we have a matching shortcut
      const engine = this.shortcuts.get(shortcutKey);
      if (!engine) return;

      // Prevent default behavior
      e.preventDefault();
      e.stopPropagation();

      // Get selected text
      const selectedText = window.getSelection()?.toString().trim();
      if (!selectedText) return;

      // Perform search
      this.performSearch(engine, selectedText);
    });
  }

  /**
   * Perform search with selected text
   */
  private async performSearch(engine: SearchEngine, query: string) {
    const searchUrl = engine.url.replace('%s', encodeURIComponent(query));

    try {
      // Open in new tab
      await chrome.runtime.sendMessage({
        action: 'openSearchTab',
        url: searchUrl,
      });
    } catch (error) {
      console.error('Failed to open search tab:', error);
      // Fallback: open in current window
      window.open(searchUrl, '_blank');
    }
  }
}

// Initialize Keyboard Shortcut Manager
new KeyboardShortcutManager();

// ==================== PLATFORM CATALOG BRIDGE ====================

/**
 * Platform Catalog Bridge - Communication between web page and extension
 * Used to add platforms from web catalog to extension
 */

// Allowed origins - for security
const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'https://rept.in',
  'https://right-click-search.ibrahimuzun.com'
]);

// Message types that try to communicate with extension
const BRIDGE_MESSAGE_TYPES = new Set(['RCS_BRIDGE_HANDSHAKE', 'RCS_ADD_ENGINES', 'RCS_GET_ENGINES', 'RCS_REMOVE_ENGINE']);

// Listen for messages from web page
window.addEventListener('message', (event) => {
  // Only accept messages from the same window
  if (event.source !== window) return;

  const data = event.data;
  if (!data || typeof data !== 'object') return;

  // Ignore postMessage traffic for other purposes
  if (!BRIDGE_MESSAGE_TYPES.has(data.type)) return;

  // Security: Origin validation
  if (!ALLOWED_ORIGINS.has(event.origin)) {
    if (import.meta.env.DEV) {
      console.debug('Ignored RCS bridge message from unauthorized origin:', event.origin);
    }
    return;
  }

  // Handshake - Web page is checking extension's existence
  if (data.type === 'RCS_BRIDGE_HANDSHAKE') {
    // Confirm extension's existence
    window.postMessage(
      {
        type: 'RCS_BRIDGE_ACK',
        extVersion: chrome.runtime.getManifest().version,
      },
      event.origin
    );
    console.log('✅ Platform Catalog handshake successful');
    return;
  }

  // Get engines - Return current engines to web catalog
  if (data.type === 'RCS_GET_ENGINES') {
    console.log('📤 Catalog requesting current engines');

    // Forward to background script
    chrome.runtime.sendMessage(
      {
        type: 'RCS_GET_ENGINES',
        requestId: data.requestId,
      },
      (response) => {
        // Send engines back to web page
        window.postMessage(
          {
            type: 'RCS_ENGINES_UPDATE',
            engines: response?.engines || [],
            requestId: data.requestId,
          },
          event.origin
        );

        console.log(`✅ Sent ${response?.engines?.length || 0} engines to catalog`);
      }
    );
    return;
  }

  // Add engines - Handle engines coming from web catalog
  if (data.type === 'RCS_ADD_ENGINES') {
    console.log('📥 Received engines from catalog:', data.engines);

    // Forward to background script
    chrome.runtime.sendMessage(
      {
        type: 'RCS_ADD_ENGINES',
        engines: data.engines,
        requestId: data.requestId,
      },
      (response) => {
        const ok = response?.ok ?? false;

        // Send result back to web page
        window.postMessage(
          {
            type: 'RCS_RESULT',
            requestId: data.requestId,
            ok,
            message: response?.message,
          },
          event.origin
        );

        if (ok) {
          // Also send updated engines list
          chrome.runtime.sendMessage(
            { type: 'RCS_GET_ENGINES' },
            (enginesResponse) => {
              window.postMessage(
                {
                  type: 'RCS_ENGINES_UPDATE',
                  engines: enginesResponse?.engines || [],
                },
                event.origin
              );
            }
          );
        }

        console.log(ok ? '✅ Engines added successfully' : '❌ Failed to add engines');
      }
    );
    return;
  }

  // Remove engine - Handle engine removal from web catalog
  if (data.type === 'RCS_REMOVE_ENGINE') {
    console.log('🗑️ Removing engine:', data.url);

    // Forward to background script
    chrome.runtime.sendMessage(
      {
        type: 'RCS_REMOVE_ENGINE',
        url: data.url,
        requestId: data.requestId,
      },
      (response) => {
        const ok = response?.ok ?? false;

        // Send result back to web page
        window.postMessage(
          {
            type: 'RCS_RESULT',
            requestId: data.requestId,
            ok,
            message: response?.message,
          },
          event.origin
        );

        if (ok) {
          // Also send updated engines list
          chrome.runtime.sendMessage(
            { type: 'RCS_GET_ENGINES' },
            (enginesResponse) => {
              window.postMessage(
                {
                  type: 'RCS_ENGINES_UPDATE',
                  engines: enginesResponse?.engines || [],
                },
                event.origin
              );
            }
          );
        }

        console.log(ok ? '✅ Engine removed successfully' : '❌ Failed to remove engine');
      }
    );
  }
});

// Listen for messages from background script (Extension → Website sync)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Storage changed - forward to web page
  if (message.type === 'RCS_STORAGE_CHANGED' && message.engines) {
    // Check if we're on an allowed origin
    if (ALLOWED_ORIGINS.has(location.origin)) {
      window.postMessage(
        {
          type: 'RCS_ENGINES_UPDATE',
          engines: message.engines,
        },
        location.origin
      );
    }
  }
});

console.log('🔌 Platform Catalog Bridge initialized');

export { };
