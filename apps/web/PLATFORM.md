# Platform Catalog & Admin Panel Specification

The following document outlines a single-page web application based on **Next.js** that integrates end-to-end with your existing **Chrome Extension**. By following this document, you can set up the application, manage cards (Google, GitHub, LinkedIn, ChatGPT, Claude, Amazon etc.), allow users to add selected items to the extension with one click, and handle all visual/metadata management through **Supabase**.

> Note: We assume your extension already has capabilities such as text and image contexts, URL patterns with %s placeholder, Chrome Storage sync, Manifest V3, and real-time context menu updates; these features are detailed in the README referenced in the documentation.

---

## 0) TL;DR – Goal & Result

- **Single Page Web App (Next.js)**

  Users select platforms from cards that can be filtered by categories (Search, Code, AI, Social, Shopping...). Cards contain **icon**, **name**, **URL pattern** (with %s placeholder for extension).

- **"Add to Extension" one click**

  Page sends "engine" objects to extension via `window.postMessage` → content-script → background flow; extension writes to **chrome.storage.sync** and updates **context menus**.

- **Supabase**
  - **Admin Panel** (only your password/email): Platform CRUD + icon upload (Supabase Storage).
  - **Catalog Reading**: Read-only with public RLS; client lists with anonymous key.
  - **Feedback**: Redirect users to GitHub Issues (no form).

- **UI**: Tailwind CSS grid + Framer Motion animated cards; search & filter & multi-select; smart "Extension not found" warning.
- **Security**: Origin allowlist, schema validation, RLS, rate-limit, XSS protections.

---

## 1) Architecture Overview

### 1.1 Components

- **Next.js Web App**
  - `/` : Catalog (single page)
  - `/admin` : Admin panel (single user login)
- **Supabase (Postgres + Storage)**
  - Tables: `platforms`, `categories` (optional), `admins`
  - Storage: `icons` bucket (public read + write only admin)
- **Chrome Extension (existing)**
  - **Context menus** with "engine" structure that searches based on text/image selection
  - **URL pattern with `%s`** for search term placement
  - **chrome.storage.sync** for persistent/cross-device sync settings
  - **Import/Export**, **Hotkeys** etc. advanced UX features (use when needed).
- **Integration Bridge**
  - **Page → Content Script**: `window.postMessage` (handshake + message protocol)
  - **Content Script → Background**: `chrome.runtime.sendMessage`
  - **Background**: merge engines, write to storage, update menu (prevent duplicates)

### 1.2 Data Flow (summary)

1. User selects card(s) → "Add to Extension".
2. Page sends `ADD_ENGINES` package via `window.postMessage`.
3. Content script validates origin, forwards to background.
4. Background validates engines, merges to **chrome.storage.sync** and rebuilds **context menus**.
5. Success/failure result sent back to page; toast/feedback shown in UI.

---

## 2) Data Model

### 2.1 Platform Schema (Supabase)

```sql
-- 1) Tables
create table if not exists public.platforms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  category text not null,                 -- "search" | "code" | "ai" | "social" | "shopping" | ...
  url_pattern text not null,              -- %s required (for extension)
  context text[] not null default '{selection}', -- ['selection'] | ['image'] | ['selection','image']
  icon_url text,                          -- Supabase Storage public URL
  tags text[] default '{}',
  featured boolean default false,
  supports_prefill boolean default true,  -- false for those not supporting %s (e.g. some AI tools)
  enabled boolean default true,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null
);

-- 2) updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at=now(); return new;
end $$;

drop trigger if exists platforms_set_updated_at on public.platforms;
create trigger platforms_set_updated_at before update on public.platforms
for each row execute function public.set_updated_at();

```

### 2.2 RLS Policies

```sql
-- Enable RLS
alter table public.platforms enable row level security;
alter table public.admins enable row level security;

-- Catalog: anonymous read access (only enabled=true)
create policy "platforms_public_read"
on public.platforms
for select
using (enabled = true);

-- Write access only for users with admin email
-- (Signed in via Supabase Auth and admins.email == auth.email())
create policy "platforms_admin_write"
on public.platforms
for all
using (exists (select 1 from public.admins a where a.email = auth.email()))
with check (exists (select 1 from public.admins a where a.email = auth.email()));

-- Admin listing: only admin can see their own record
create policy "admins_self_read"
on public.admins
for select
using (email = auth.email());

```

> Setup note: You only need to add your email to the admins table once using service role (e.g. Supabase SQL Editor or script).

### 2.3 Extension "Engine" Object (Integration)

```tsx
type EngineContext = "selection" | "image";

export interface EngineInput {
  title: string; // Platform name (UI)
  url: string; // Pattern containing %s
  contexts: EngineContext[]; // ['selection'] | ['image'] | both
  icon?: string; // URL (optional)
  tags?: string[]; // Optional
  source?: "catalog"; // For tracking purposes (opt.)
}
```

> On the extension side, the selected text/image URL is placed in the appropriate location using the %s placeholder and a new tab opens; this behavior is compatible with the existing extension architecture.

---

## 3) Supabase Setup & Storage

1. **Create project**, get URL and anon key for `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...   # use only in Next.js API routes (server)
   ADMIN_EMAIL=you@domain.com

   ```

2. **Run SQL** (schema + RLS above).
3. Add your email to the `admins` table (with service role).
4. **Storage**: Create `icons` bucket → Public read; **Write** only admin (policy):

   ```sql
   create policy "icons_public_read" on storage.objects
   for select using (bucket_id = 'icons');

   create policy "icons_admin_write" on storage.objects
   for insert to authenticated
   with check (
     bucket_id = 'icons' and
     exists (select 1 from public.admins a where a.email = auth.email())
   );

   create policy "icons_admin_update_delete" on storage.objects
   for all to authenticated
   using (
     bucket_id = 'icons' and
     exists (select 1 from public.admins a where a.email = auth.email())
   );

   ```

---

## 4) Next.js Application

### 4.1 Kurulum

```bash
# Next.js (App Router) + Tailwind + TypeScript
npx create-next-app@latest catalog --ts --eslint
cd catalog

npm i @supabase/supabase-js framer-motion clsx zod
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

```

**`tailwind.config.ts`**

```tsx
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: { container: { center: true, padding: "1rem" } },
  },
  plugins: [],
} satisfies Config;
```

**`app/globals.css`** – standard Tailwind base/components/utilities + small reset.

### 4.2 Supabase Client (server & client)

**`lib/supabase/server.ts`**

```tsx
import { createClient } from "@supabase/supabase-js";

export const supabaseServer = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // server only!
    { auth: { persistSession: false } }
  );
```

**`lib/supabase/client.ts`**

```tsx
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### 4.3 Types and Helpers

**`types.ts`**

```tsx
export type Platform = {
  id: string;
  name: string;
  slug: string;
  category: string;
  url_pattern: string;
  context: ("selection" | "image")[];
  icon_url?: string;
  tags?: string[];
  featured?: boolean;
  supports_prefill?: boolean;
};

export type EngineContext = "selection" | "image";
export type EngineInput = {
  title: string;
  url: string;
  contexts: EngineContext[];
  icon?: string;
  tags?: string[];
  source?: "catalog";
};
```

**`utils/mapToEngine.ts`**

```tsx
import { Platform, EngineInput } from "@/types";

export function mapToEngine(p: Platform): EngineInput {
  return {
    title: p.name,
    url: p.url_pattern,
    contexts: p.context.length ? p.context : ["selection"],
    icon: p.icon_url,
    tags: p.tags ?? [],
    source: "catalog",
  };
}
```

### 4.4 Entegrasyon Hook’u: `useExtensionBridge`

This hook manages bidirectional messaging between the page and extension.

**Message Types**

```tsx
// page -> content script
type PageToExt =
  | { type: "RCS_BRIDGE_HANDSHAKE"; origin: string; version: 1 }
  | { type: "RCS_ADD_ENGINES"; engines: EngineInput[]; requestId: string };

// content script -> page
type ExtToPage =
  | { type: "RCS_BRIDGE_ACK"; extVersion: string }
  | { type: "RCS_RESULT"; requestId: string; ok: boolean; message?: string };
```

**`hooks/useExtensionBridge.ts`**

```tsx
import { useEffect, useRef, useState, useCallback } from "react";
import { EngineInput } from "@/types";

const ACK_TIMEOUT = 600;

export function useExtensionBridge() {
  const [connected, setConnected] = useState(false);
  const pending = useRef(
    new Map<string, (ok: boolean, msg?: string) => void>()
  );

  // Handshake
  useEffect(() => {
    let timeout = setTimeout(() => setConnected(false), ACK_TIMEOUT);
    const onMessage = (e: MessageEvent) => {
      if (e.source !== window || !e.data) return;
      if (e.data.type === "RCS_BRIDGE_ACK") {
        setConnected(true);
        clearTimeout(timeout);
      }
      if (e.data.type === "RCS_RESULT") {
        const fn = pending.current.get(e.data.requestId);
        if (fn) {
          fn(e.data.ok, e.data.message);
          pending.current.delete(e.data.requestId);
        }
      }
    };
    window.addEventListener("message", onMessage);
    window.postMessage(
      { type: "RCS_BRIDGE_HANDSHAKE", origin: location.origin, version: 1 },
      "*"
    );
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const addEngines = useCallback(async (engines: EngineInput[]) => {
    return new Promise<{ ok: boolean; message?: string }>((resolve) => {
      const requestId = crypto.randomUUID();
      pending.current.set(requestId, (ok, msg) =>
        resolve({ ok, message: msg })
      );
      window.postMessage({ type: "RCS_ADD_ENGINES", engines, requestId }, "*");
      setTimeout(() => {
        // timeout safety
        if (pending.current.has(requestId)) {
          pending.current.delete(requestId);
          resolve({ ok: false, message: "Extension did not respond" });
        }
      }, 2000);
    });
  }, []);

  return { connected, addEngines };
}
```

### 4.5 Home Page (Catalog)

**Features**

- Top: **search** (name/tags), right: **filters** (category, context).
- Grid: responsive, auto-fill; **multi-select**; bottom bar "Add N selected platforms to Extension".
- **Framer Motion** hover/appear animations.
- If extension **not connected**, sticky banner + "Install Extension" button (or Import JSON fallback).

**`app/page.tsx` (summary)**

> Note: Split into parts for easy reading; in real project, divide into components.

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { Platform } from "@/types";
import { mapToEngine } from "@/utils/mapToEngine";
import { useExtensionBridge } from "@/hooks/useExtensionBridge";
import clsx from "clsx";

export default function CatalogPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [ctx, setCtx] = useState<"all" | "selection" | "image">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { connected, addEngines } = useExtensionBridge();

  useEffect(() => {
    supabase
      .from("platforms")
      .select("*")
      .eq("enabled", true)
      .order("featured", { ascending: false })
      .order("name", { ascending: true })
      .then(({ data }) => setPlatforms(data ?? []));
  }, []);

  const filtered = useMemo(
    () =>
      platforms.filter((p) => {
        const matchQ =
          !q ||
          p.name.toLowerCase().includes(q.toLowerCase()) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q.toLowerCase()));
        const matchCat = cat === "all" || p.category === cat;
        const matchCtx = ctx === "all" || p.context.includes(ctx);
        return matchQ && matchCat && matchCtx;
      }),
    [platforms, q, cat, ctx]
  );

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const addSelected = async () => {
    const engines = filtered.filter((p) => selected.has(p.id)).map(mapToEngine);
    const res = await addEngines(engines);
    alert(res.ok ? "Added to extension!" : `Error: ${res.message}`);
    if (res.ok) setSelected(new Set());
  };

  return (
    <div className="container py-8">
      {!connected && (
        <div className="mb-4 rounded-lg border p-3 text-sm">
          Extension could not connect.{" "}
          <a
            className="underline"
            href="https://chrome.google.com/webstore/detail/..."
          >
            Install
          </a>{" "}
          or try again later.
        </div>
      )}

      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Search & Platform Catalog</h1>
        <div className="flex gap-2">
          <input
            placeholder="Search (name/tag)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-64 rounded-md border px-3 py-2 text-sm outline-none focus:ring"
          />
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="rounded-md border px-2 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="search">Search</option>
            <option value="code">Code</option>
            <option value="ai">AI</option>
            <option value="social">Social</option>
            <option value="shopping">Shopping</option>
          </select>
          <select
            value={ctx}
            onChange={(e) => setCtx(e.target.value as any)}
            className="rounded-md border px-2 py-2 text-sm"
          >
            <option value="all">All Contexts</option>
            <option value="selection">Text</option>
            <option value="image">Image</option>
          </select>
        </div>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
        {filtered.map((p) => (
          <li key={p.id}>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggle(p.id)}
              className={clsx(
                "group relative w-full rounded-xl border p-4 text-left transition",
                selected.has(p.id)
                  ? "border-indigo-500 ring-2 ring-indigo-200"
                  : "hover:border-slate-300"
              )}
            >
              <div className="mb-3 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.icon_url || "/placeholder.svg"}
                  alt=""
                  className="h-8 w-8 rounded-md"
                />
                <div className="min-w-0">
                  <div className="truncate font-medium">{p.name}</div>
                  <div className="truncate text-xs text-slate-500">
                    {p.url_pattern}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {p.context.map((c) => (
                  <span
                    key={c}
                    className="rounded bg-slate-100 px-2 py-0.5 text-xs"
                  >
                    {c}
                  </span>
                ))}
                {p.featured && (
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-xs">
                    featured
                  </span>
                )}
              </div>
              <div className="pointer-events-none absolute right-3 top-3 rounded-md border px-2 py-0.5 text-xs opacity-0 transition group-hover:opacity-100">
                Select
              </div>
            </motion.button>
          </li>
        ))}
      </ul>

      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-white/80 backdrop-blur">
          <div className="container flex items-center justify-between py-3">
            <div className="text-sm">{selected.size} platforms selected</div>
            <button
              onClick={addSelected}
              disabled={!connected}
              className="rounded-md bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
            >
              Add to Extension
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 4.6 Admin Panel (only you)

- **Auth**: Supabase Email+Password (or magic link). If logged-in user's email is **not** in `admins` table, auto logout.
- **CRUD**: Platform listing, inline editing, icon upload (Storage → write URL to `icon_url`).
- **Guard**: Token check + RLS on Server Actions / Route Handler.

> Alternatively, for the first version, you can use Supabase Table Editor instead of Admin Panel; add the panel when you need UI.

---

## 5) Chrome Extension Integration

The following code suggests minimal changes for the "bridge". Your extension already has functions like **context menu management, storage synchronization, import/export, keyboard shortcuts** (e.g., management in Popup, real-time sync, etc.). Therefore, we will merge the **additional engine addition** process through background into your standard data structure.

### 5.1 Content Script – `window.postMessage` dinleme

```tsx
// content/index.ts
const ALLOWED_ORIGINS = new Set([
  "https://yourdomain.com",
  "http://localhost:3000",
]);

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  const data = event.data;
  if (!data || typeof data !== "object") return;

  // security: origin check (event.origin exists in content script)
  if (!ALLOWED_ORIGINS.has(event.origin)) return;

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

### 5.2 Background (Service Worker) – storage merge + context menu refresh

```tsx
// background/index.ts
type EngineContext = "selection" | "image";
type EngineInput = {
  title: string;
  url: string;
  contexts: EngineContext[];
  icon?: string;
  tags?: string[];
  source?: string;
};

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "RCS_ADD_ENGINES") {
    (async () => {
      try {
        const { engines } = msg as { engines: EngineInput[] };
        // 1) validate
        const valid = engines.filter(
          (e) =>
            typeof e.title === "string" &&
            /%s/.test(e.url) &&
            Array.isArray(e.contexts) &&
            e.contexts.length > 0
        );

        // 2) read existing
        const { engines: existing = [] } = (await chrome.storage.sync.get([
          "engines",
        ])) as any;

        // 3) merge by url pattern + context combo
        const key = (e: EngineInput) =>
          `${e.url}::${e.contexts.sort().join(",")}`;
        const map = new Map<string, EngineInput>();
        existing.forEach((e: EngineInput) => map.set(key(e), e));
        valid.forEach((e) =>
          map.set(key(e), { ...map.get(key(e)), ...e } as EngineInput)
        );

        const merged = Array.from(map.values());
        await chrome.storage.sync.set({ engines: merged });

        // 4) rebuild context menus (according to your existing approach)
        await rebuildContextMenus(merged);

        sendResponse({ ok: true });
      } catch (e: any) {
        sendResponse({ ok: false, message: e?.message || "merge failed" });
      }
    })();
    return true; // async response
  }
});

async function rebuildContextMenus(engines: EngineInput[]) {
  await chrome.contextMenus.removeAll();
  // selection
  engines
    .filter((e) => e.contexts.includes("selection"))
    .forEach((e) => {
      chrome.contextMenus.create({
        id: `sel:${e.title}`,
        title: e.title,
        contexts: ["selection"],
      });
    });
  // image
  engines
    .filter((e) => e.contexts.includes("image"))
    .forEach((e) => {
      chrome.contextMenus.create({
        id: `img:${e.title}`,
        title: e.title,
        contexts: ["image"],
      });
    });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    const id = info.menuItemId.toString();
    const scope = id.startsWith("img:") ? "image" : "selection";
    const title = id.replace(/^img:|^sel:/, "");
    const eng = engines.find(
      (e) => e.title === title && e.contexts.includes(scope as any)
    );
    if (!eng) return;
    const q = scope === "image" ? info.srcUrl : info.selectionText || "";
    const url = eng.url.replace("%s", encodeURIComponent(q || ""));
    if (tab?.id) chrome.tabs.create({ url });
  });
}
```

> Note: The logic of "context menu" and "Chrome Storage API" integration aligns with your existing extension's "real-time synchronization" and menu management approach. If needed, you can add this message path with a small adapter to your own ContextMenuManager and searchEnginesStorage layers.

---

## 6) Initial Platform Seed Examples

> Warning: The URLs below are "web search" patterns that can work with %s. Since some AI tools (ChatGPT, Claude) don't provide reliable "prefill" query params, mark supports_prefill=false and for now just open the page.

```sql
-- example records
insert into public.platforms (name, slug, category, url_pattern, context, icon_url, tags, featured, supports_prefill) values
('Google Web', 'google-web', 'search', 'https://www.google.com/search?q=%s', '{selection}', null, '{google,web}', true, true),
('Google Images', 'google-images', 'search', 'https://www.google.com/search?tbm=isch&q=%s', '{image,selection}', null, '{google,images}', false, true),
('GitHub Code', 'github-code', 'code', 'https://github.com/search?type=code&q=%s', '{selection}', null, '{github,code}', true, true),
('GitHub Repos', 'github-repos', 'code', 'https://github.com/search?type=repositories&q=%s', '{selection}', null, '{github,repos}', false, true),
('Stack Overflow', 'stackoverflow', 'code', 'https://stackoverflow.com/search?q=%s', '{selection}', null, '{stack,dev}', false, true),
('MDN Web Docs', 'mdn', 'code', 'https://developer.mozilla.org/en-US/search?q=%s', '{selection}', null, '{docs,web}', false, true),
('NPM', 'npm', 'code', 'https://www.npmjs.com/search?q=%s', '{selection}', null, '{npm,packages}', false, true),
('LinkedIn', 'linkedin', 'social', 'https://www.linkedin.com/search/results/all/?keywords=%s', '{selection}', null, '{linkedin,people}', false, true),
('Twitter/X', 'x', 'social', 'https://twitter.com/search?q=%s&src=typed_query', '{selection}', null, '{twitter,x}', false, true),
('YouTube', 'youtube', 'search', 'https://www.youtube.com/results?search_query=%s', '{selection}', null, '{video}', false, true),
('Amazon', 'amazon', 'shopping', 'https://www.amazon.com/s?k=%s', '{selection}', null, '{amazon,shopping}', false, true),
('DuckDuckGo', 'ddg', 'search', 'https://duckduckgo.com/?q=%s', '{selection}', null, '{privacy,search}', false, true),
('Bing', 'bing', 'search', 'https://www.bing.com/search?q=%s', '{selection}', null, '{bing}', false, true),
('Reddit', 'reddit', 'social', 'https://www.reddit.com/search/?q=%s', '{selection}', null, '{reddit}', false, true),
('ArXiv', 'arxiv', 'ai', 'https://arxiv.org/search/?query=%s&searchtype=all', '{selection}', null, '{papers,ai}', false, true),
('Perplexity', 'perplexity', 'ai', 'https://www.perplexity.ai/search?q=%s', '{selection}', null, '{ai,qa}', false, true),
('ChatGPT', 'chatgpt', 'ai', 'https://chat.openai.com', '{selection}', null, '{ai}', false, false),
('Claude', 'claude', 'ai', 'https://claude.ai/new', '{selection}', null, '{ai}', false, false);

```

---

## 7) UI/UX Details

- **Grid**: For "Google-like" full appearance, `grid-cols-1 sm:2 md:3 xl:4 2xl:6` and minimum width `minmax(0,1fr)` per card is sufficient; container widths are centered with Tailwind **container**.
- **User flow**
  1. Search/filter →
  2. Select card(s) →
  3. "Add to Extension" →
  4. Success toast →
  5. (Optional) "Save selection to favorites" (future).
- **Accessibility**:
  - Cards accessible as `button`; `aria-pressed` for selected state.
  - Keyboard navigation (Tab/Shift+Tab), Enter to select.
- **Animation**:
  - Card hover `y:-2`, selected state highlight, grid entry animation `staggerChildren`.

---

## 8) Security & Reliability

- **Origin allowlist**: Content script processes messages only from **allowed origins**.
- **Schema validation**: `title/url/contexts` check on background side (you can use Zod).
- **Rate limit/backoff**: Short delay/queue for multiple engine addition calls.
- **XSS**: Platform names/tags are escaped in UI; URLs only in new tab, `noopener,noreferrer`.
- **RLS**: Public read, Admin write; Storage write only admin.
- **Extension not found**: JSON export fallback (can be made compatible with import flow in extension popup in the future). Since your extension supports import/export (popup menu), this second path also works.

---

## 9) Admin Panel Outline (Next.js)

- `/admin/login` → email/password (Supabase Auth)
- `/admin/platforms` → table, search, filter, **inline edit**, "New Platform", icon upload.
- After upload, get public URL and write to `icon_url` field.
- For platforms where "supports_prefill" field is **false**, small warning badge on catalog card ("No prefill – open & paste").

**Simple API Route Example** (`app/api/platforms/route.ts`)

```tsx
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const sb = supabaseServer();
  const { data, error } = await sb
    .from("platforms")
    .select("*")
    .eq("enabled", true);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
```

---

## 10) Test Plan

- **Unit**: `mapToEngine`, `merge` (background), messaging types.
- **E2E** (Playwright):
  - Extension installed scenario handshake → `connected=true`.
  - Select 3 platforms → "Add to Extension" → expected items created in context menu?
  - Duplication test (if same url/context added, stays single).
  - Extension not found scenario → banner showing?

---

## 11) Deployment & DevOps

- **Vercel** (recommended) – set `NEXT_PUBLIC_*` env vars.
- **Supabase revalidation**: **On-Demand Revalidation** after create/update in admin panel (Next 14+).
- **CORS**: Necessary settings for your catalog API (if cross-origin will be used).
- **Versioning**: DB migration script for platform seed changes.

---

## 12) Roadmap (Optional Advanced Features)

- **AI Tools Prefill**: Inject content-script into ChatGPT/Claude pages and auto-paste to textarea (platform-specific injector).
- **Collections**: Ready packages like "Frontend", "Data Science", "Recruiting" → add with one click.
- **User Favorites**: Local IndexedDB/Supabase user table.
- **Internationalization (i18n)**: en/tr language keys.

---

## 13) Debugging Tips

- If handshake not working: Check `ALLOWED_ORIGINS`, manifest `matches` and `all_frames` settings in content script.
- If context menu not visible: Confirm that re-setup is triggered in background after `chrome.contextMenus.removeAll`.
- If `%s` missing: URL validation added; show warning in UI.
- If storage not writing: Check `chrome.storage.sync` quota/limits and object sizes.

---

## 14) Appendix: Card Design Notes (Tailwind)

- Card body: `rounded-xl border p-4 hover:border-slate-300 transition`
- Selected state: `ring-2 ring-indigo-200 border-indigo-500`
- Icon size: `h-8 w-8 rounded-md` (64×64 PNG/SVG recommended in Storage)
- Grid: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4`

---

## 15) Appendix: Compatibility with Extension Architecture (Reference)

- Building blocks like **Text Selection / Image Selection contexts**, **multiple search engines**, **URL pattern = %s**, **real-time context menu updates**, **Import/Export**, **Hotkeys**, **TypeScript + React + Tailwind + Framer Motion + Manifest V3 + Chrome Storage** are natural extensions of this integration; the bridge above only adds "catalog → extension" data transfer.

---

# Setup Check-List (step by step)

1. **Supabase**
   - Run SQL schema + RLS
   - Add your email to `admins` table
   - Set up `icons` bucket and policies
2. **Next.js**
   - Enter env vars (`.env.local`)
   - Supabase client/server settings
   - Add catalog page and `useExtensionBridge` hook
3. **Extension**
   - Add `window.postMessage` listener and origin allowlist to content script
   - In background `RCS_ADD_ENGINES` → storage merge + context menu rebuild
4. **Seed**
   - Add example platform records
5. **Test**
   - Handshake → success
   - Add 3 platforms → menus created
   - No duplication
6. **Deployment**
   - Vercel deploy → add domain to allowlist
   - Set production Supabase URL/keys

---

By following this document, you can establish a seamless "add with one click" experience between the **single-page catalog** and **Chrome Extension**. Thanks to the **multi-engine configuration**, **context aware searches**, **storage sync** and **context menu** infrastructure already provided by your extension (architecture in README), we only need to add the bridge and solve content management with Supabase.

If you'd like, in the next step:

- Let's also sketch the minimal CRUD screens and icon upload form for the **Admin Panel**,
- or prepare a "P.o.C." of the **auto-paste to AI tools** (content-script injector) flow.
