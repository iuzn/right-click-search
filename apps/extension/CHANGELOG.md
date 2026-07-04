# Changelog

All notable changes to the Right Click Search Extension will be documented in this file.

## [0.2.2] - 2026-07-04

### Fixed
- **Background Service Worker Race Condition**: Resolved an issue where the extension failed to perform searches on the very first browser launch. All Chrome event listeners (`chrome.runtime.onInstalled`, `chrome.contextMenus.onClicked`, `chrome.runtime.onMessage`, and `chrome.storage.onChanged`) are now registered synchronously at the entry point of the script before any asynchronous storage loading (`loadEngines()`) takes place, preventing missed events during fresh browser startups.

---

## [0.2.1] - 2026-01-16

### Added
- Keyboard shortcut recording and custom hotkey management.
- Multi-engine search support (tab-based organization for text vs. image searches).
- Floating Action Button (FAB) for quick additions.
- Inline edit and deletion confirmation.
- Syncing support between web catalog and extension storage.
