// /pages/background/index.ts
import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';
import 'webextension-polyfill';
import type { SearchEngine } from '@/types/search';
import { DEFAULT_SEARCH_ENGINES } from '@/lib/defaultSearchEngines';

reloadOnUpdate('pages/background');
reloadOnUpdate('pages/content/style.scss');

// ==================== CONTEXT MENU MANAGER ====================

/**
 * Context Menu manager - dynamically manages search engines
 */
class ContextMenuManager {
  private engines: SearchEngine[] = [];

  constructor() {
    this.init();
  }

  /**
   * Initialize the manager
   */
  private async init() {
    // Load settings from storage
    await this.loadEngines();

    // Create menus on initial startup
    await this.createAllMenus();

    // Recreate menus when extension is installed or updated
    chrome.runtime.onInstalled.addListener(() => {
      this.createAllMenus();
    });

    // Listen for menu clicks
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      this.handleMenuClick(info, tab);
    });

    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // Open search tab
      if (message.action === 'openSearchTab' && message.url) {
        chrome.tabs.create({ url: message.url });
        sendResponse({ success: true });
        return;
      }

      // Platform Catalog Bridge - Add engines from web catalog
      if (message.type === 'RCS_ADD_ENGINES') {
        this.handleAddEngines(message.engines, message.requestId)
          .then((result) => sendResponse(result))
          .catch((error) =>
            sendResponse({ ok: false, message: error.message }),
          );
        return true; // async response
      }
    });

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'sync' && changes['search-engines-storage-key']) {
        this.engines = changes['search-engines-storage-key'].newValue || [];
        this.updateAllMenus();
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

      // Load and save defaults if no data exists in storage
      if (
        !result['search-engines-storage-key'] ||
        result['search-engines-storage-key'].length === 0
      ) {
        this.engines = DEFAULT_SEARCH_ENGINES;
        await chrome.storage.sync.set({
          'search-engines-storage-key': DEFAULT_SEARCH_ENGINES,
        });
        console.log('Default search engines loaded and saved');
      } else {
        this.engines = result['search-engines-storage-key'];
      }
    } catch (error) {
      console.error('Failed to load search engines:', error);
      this.engines = DEFAULT_SEARCH_ENGINES;
    }
  }

  /**
   * Create all menus
   */
  private async createAllMenus() {
    // First remove existing menus
    await chrome.contextMenus.removeAll();

    // Filter enabled engines
    const enabledEngines = this.engines.filter((engine) => engine.enabled);

    // Group engines by context type
    const selectionEngines = enabledEngines.filter((engine) =>
      engine.contexts.includes('selection'),
    );
    const imageEngines = enabledEngines.filter((engine) =>
      engine.contexts.includes('image'),
    );

    // Handle selection context engines
    if (selectionEngines.length > 1) {
      // Multiple selection engines - create submenu
      chrome.contextMenus.create({
        id: 'search-text-parent',
        title: 'Search',
        contexts: ['selection'],
      });
      selectionEngines.forEach((engine) => {
        this.createMenu(engine, 'search-text-parent', ['selection']);
      });
    } else if (selectionEngines.length === 1) {
      // Single selection engine - create directly
      this.createMenu(selectionEngines[0], undefined, ['selection']);
    }

    // Handle image context engines
    if (imageEngines.length > 1) {
      // Multiple image engines - create submenu
      chrome.contextMenus.create({
        id: 'search-image-parent',
        title: 'Search Image',
        contexts: ['image'],
      });
      imageEngines.forEach((engine) => {
        this.createMenu(engine, 'search-image-parent', ['image']);
      });
    } else if (imageEngines.length === 1) {
      // Single image engine - create directly
      this.createMenu(imageEngines[0], undefined, ['image']);
    }

    console.log(
      `Created ${selectionEngines.length} text search and ${imageEngines.length} image search menu items`,
    );
  }

  /**
   * Create a single menu item
   */
  private createMenu(
    engine: SearchEngine,
    parentId?: string,
    contexts?: string[],
  ) {
    try {
      chrome.contextMenus.create({
        id: engine.id,
        parentId: parentId, // Add parent ID if provided
        title: engine.title,
        // @ts-ignore - Chrome API type definition is very strict, array works at runtime
        contexts: contexts || engine.contexts, // Use provided contexts or engine's contexts
      });
    } catch (error) {
      console.error(`Failed to create menu for ${engine.id}:`, error);
    }
  }

  /**
   * Update all menus
   */
  private async updateAllMenus() {
    await this.createAllMenus();
  }

  /**
   * Handle menu click event
   */
  private handleMenuClick(
    info: chrome.contextMenus.OnClickData,
    tab?: chrome.tabs.Tab,
  ) {
    const engine = this.engines.find((e) => e.id === info.menuItemId);
    if (!engine) return;

    let searchUrl: string | null = null;

    // Image search
    if (info.mediaType === 'image' && info.srcUrl) {
      searchUrl = engine.url.replace('%s', encodeURIComponent(info.srcUrl));
    }
    // Text search
    else if (info.selectionText) {
      searchUrl = engine.url.replace(
        '%s',
        encodeURIComponent(info.selectionText),
      );
    }

    // Open in new tab
    if (searchUrl) {
      chrome.tabs.create({ url: searchUrl });
    }
  }

  /**
   * Handle adding engines from Platform Catalog
   */
  private async handleAddEngines(engines: any[], requestId: string) {
    try {
      console.log('📥 Adding engines from catalog:', engines);

      // 1) Validate engines
      const validEngines = engines.filter(
        (e) =>
          typeof e.title === 'string' &&
          typeof e.url === 'string' &&
          /%s/.test(e.url) &&
          Array.isArray(e.contexts) &&
          e.contexts.length > 0,
      );

      if (validEngines.length === 0) {
        return { ok: false, message: 'No valid engines provided' };
      }

      // 2) Load existing engines
      const result = await chrome.storage.sync.get([
        'search-engines-storage-key',
      ]);
      const existing: SearchEngine[] =
        result['search-engines-storage-key'] || [];

      // 3) Convert catalog engines to SearchEngine format
      const newEngines: SearchEngine[] = validEngines.map((e) => ({
        id: `catalog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: e.title,
        url: e.url,
        icon: e.icon || '🔍',
        iconType: 'emoji' as const,
        enabled: true,
        isDefault: false,
        contexts: e.contexts,
        tags: e.tags,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));

      // 4) Merge (deduplicate by URL + context combo)
      const merged = [...existing];
      for (const newEngine of newEngines) {
        const isDuplicate = existing.some(
          (e) =>
            e.url === newEngine.url &&
            JSON.stringify(e.contexts.sort()) ===
              JSON.stringify(newEngine.contexts.sort()),
        );
        if (!isDuplicate) {
          merged.push(newEngine);
        }
      }

      // 5) Save to storage
      await chrome.storage.sync.set({ 'search-engines-storage-key': merged });

      // 6) Update context menus
      this.engines = merged;
      await this.updateAllMenus();

      console.log(
        `✅ Added ${newEngines.length} engines (${merged.length} total)`,
      );

      return {
        ok: true,
        message: `${newEngines.length} platforms added`,
      };
    } catch (error: any) {
      console.error('❌ Failed to add engines:', error);
      return {
        ok: false,
        message: error?.message || 'Unknown error',
      };
    }
  }
}

// Initialize Context Menu Manager
new ContextMenuManager();

export {};
