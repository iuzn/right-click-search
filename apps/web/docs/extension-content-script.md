# Extension Content Script Integration

This document explains the changes needed in the Chrome Extension's content script part.

## Content Script Implementation

**Reference: PLATFORM.md lines 531-559**

### 1. Origin Allowlist

```typescript
// content/index.ts
const ALLOWED_ORIGINS = new Set([
  "https://your-production-domain.com",
  "http://localhost:3000",
  "https://your-staging-domain.com",
]);
```

### 2. Message Listener

```typescript
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  const data = event.data;
  if (!data || typeof data !== "object") return;

  // Security: Origin check
  if (!ALLOWED_ORIGINS.has(event.origin)) return;

  // Handshake
  if (data.type === "RCS_BRIDGE_HANDSHAKE") {
    window.postMessage(
      {
        type: "RCS_BRIDGE_ACK",
        extVersion: chrome.runtime.getManifest().version,
      },
      event.origin
    );
    return;
  }

  // Engine addition
  if (data.type === "RCS_ADD_ENGINES") {
    chrome.runtime.sendMessage(
      {
        type: "RCS_ADD_ENGINES",
        engines: data.engines,
        requestId: data.requestId,
      },
      (resp) => {
        const ok = resp?.ok ?? false;
        window.postMessage(
          {
            type: "RCS_RESULT",
            requestId: data.requestId,
            ok,
            message: resp?.message,
          },
          event.origin
        );
      }
    );
  }
});
```

## Background Script Implementation

**Reference: PLATFORM.md lines 564-631**

### Message Handler

```typescript
// background/index.ts
import type { EngineInput } from "@/types/search";

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "RCS_ADD_ENGINES") {
    (async () => {
      try {
        const { engines } = msg as { engines: EngineInput[] };

        // 1) Validate
        const valid = engines.filter(
          (e) =>
            typeof e.title === "string" &&
            /%s/.test(e.url) &&
            Array.isArray(e.contexts) &&
            e.contexts.length > 0
        );

        // 2) Read existing
        const { engines: existing = [] } = await chrome.storage.sync.get([
          "search-engines-storage-key",
        ]);

        // 3) Merge by url pattern + context combo
        const key = (e: EngineInput) =>
          `${e.url}::${e.contexts.sort().join(",")}`;
        const map = new Map<string, EngineInput>();

        existing.forEach((e: EngineInput) => map.set(key(e), e));
        valid.forEach((e) => map.set(key(e), { ...map.get(key(e)), ...e }));

        const merged = Array.from(map.values());
        await chrome.storage.sync.set({ "search-engines-storage-key": merged });

        // 4) Rebuild context menus
        await rebuildContextMenus(merged);

        sendResponse({ ok: true });
      } catch (e: any) {
        sendResponse({ ok: false, message: e?.message || "merge failed" });
      }
    })();
    return true; // async response
  }
});
```

## Security Notes

1. **Origin Allowlist**: Only accept messages from allowed origins
2. **Validation**: URL pattern must contain `%s`, contexts must not be empty
3. **Duplicate Prevention**: Merge using URL + context combination
4. **Error Handling**: Catch all errors and notify user

## Testing Checklist

- [ ] Handshake completes successfully
- [ ] Platform addition message transmitted correctly
- [ ] Context menus are updated
- [ ] Duplicate platforms are not added
- [ ] Error message shown in timeout case
- [ ] Messages from wrong origin are rejected
