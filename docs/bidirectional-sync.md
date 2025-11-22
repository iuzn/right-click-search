# Bidirectional Real-Time Sync

## Overview

Extension ve web sitesi arasında **iki yönlü gerçek zamanlı senkronizasyon** implementasyonu tamamlandı. Artık hem web sitesinden extension'a, hem de extension'dan web sitesine anında değişiklikler yansıyor.

## Sync Yönleri

### 1. Web Sitesi → Extension ✅ (Zaten Vardı)

Kullanıcı web sitesinde catalog'dan platform eklediğinde veya kaldırdığında:

```
Web Sitesi (useExtensionBridge)
  ↓ window.postMessage
Content Script
  ↓ chrome.runtime.sendMessage
Background Script
  ↓ chrome.storage.sync.set
Storage Updated ✅
```

### 2. Extension → Web Sitesi ✅ (YENİ)

Kullanıcı extension popup'tan arama motoru eklediğinde/sildiğinde/düzenlediğinde:

```
Extension Popup/Settings
  ↓ chrome.storage.sync.set
chrome.storage.onChanged event
  ↓
Background Script (notifyWebPagesOfChange)
  ↓ chrome.tabs.sendMessage (tüm tab'lara)
Content Script
  ↓ window.postMessage (RCS_ENGINES_UPDATE)
Web Sitesi (useExtensionBridge listener)
  ↓ setInstalledEngines
Web Sitesi UI Güncellendi ✅
```

## Implementation Detayları

### Background Script (`apps/extension/src/pages/background/index.ts`)

**Yeni Metod: `notifyWebPagesOfChange()`**

```typescript
private async notifyWebPagesOfChange() {
  // Get all open tabs
  const tabs = await chrome.tabs.query({});
  
  // Convert engines to catalog format
  const catalogEngines = this.engines.map((e) => ({
    title: e.title,
    url: e.url,
    icon: e.icon,
    contexts: e.contexts,
    tags: e.tags,
    source: e.isDefault ? 'default' : 'catalog',
  }));

  // Send to all tabs
  for (const tab of tabs) {
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'RCS_STORAGE_CHANGED',
        engines: catalogEngines,
      });
    }
  }
}
```

**Storage Change Listener:**

```typescript
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes['search-engines-storage-key']) {
    this.engines = changes['search-engines-storage-key'].newValue || [];
    this.queueMenuUpdate(() => this.createAllMenus());
    
    // 🔥 YENİ: Web sitelerine bildir
    this.notifyWebPagesOfChange();
  }
});
```

### Content Script (`apps/extension/src/pages/content/index.ts`)

**Yeni Listener: Background'dan gelen mesajları forward et**

```typescript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'RCS_STORAGE_CHANGED' && message.engines) {
    // Security: Only forward on allowed origins
    if (ALLOWED_ORIGINS.has(location.origin)) {
      window.postMessage({
        type: 'RCS_ENGINES_UPDATE',
        engines: message.engines,
      }, location.origin);
    }
  }
});
```

### Web Sitesi (`apps/web/src/hooks/useExtensionBridge.ts`)

**Zaten Var: `RCS_ENGINES_UPDATE` listener**

```typescript
// Engine list update (real-time sync)
if (e.data.type === "RCS_ENGINES_UPDATE") {
  setInstalledEngines(e.data.engines || []);
}
```

Web sitesi bu mesajı aldığında React state'i otomatik olarak güncellenir ve UI anında yenilenir.

## Kullanım Senaryoları

### Senaryo 1: Extension'dan Silme

1. Kullanıcı extension popup'ı açar
2. Bir arama motorunu siler
3. `chrome.storage.sync.set()` tetiklenir
4. Background script tüm açık tab'lara bildirim gönderir
5. Web sitesi açıksa, catalog sayfasında o platform anında "Install" butonuna döner ✨

### Senaryo 2: Extension'dan Ekleme

1. Kullanıcı extension ayarlarından yeni motor ekler
2. Storage güncellenir
3. Tüm açık tab'lar bilgilendirilir
4. Web sitesi açıksa, yeni eklenen platform anında "✓ Installed" olarak görünür ✨

### Senaryo 3: Birden Fazla Sekme

1. Kullanıcı 3 farklı sekmede catalog sayfasını açmış
2. Extension'dan bir değişiklik yapar
3. **Her 3 sekme de aynı anda güncellenir** 🚀

## Güvenlik

### Origin Kontrolü

Content script sadece izin verilen origin'lerde mesaj forward eder:

```typescript
const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'https://rept.in',
  'https://right-click-search.ibrahimuzun.com'
]);
```

### Error Handling

Background script tab'lara mesaj gönderirken hataları göz ardı eder (bazı tab'larda content script olmayabilir):

```typescript
chrome.tabs.sendMessage(tab.id, message, () => {
  if (chrome.runtime.lastError) {
    // Silently ignore
  }
});
```

## Test Etme

### Adım 1: Extension ve Web Sitesini Aç

1. Extension'ı Chrome'a yükle
2. Web sitesinde catalog sayfasını aç
3. Console'u aç (hem extension, hem web sitesi)

### Adım 2: Extension'dan Değişiklik Yap

1. Extension popup'ı aç
2. Bir platform ekle veya sil
3. Web sitesi console'unda şu mesajı gör:
   ```
   🔄 Forwarded storage change to web page: X engines
   ```
4. Web sitesi UI'ının anında güncellendiğini gözlemle

### Adım 3: Web Sitesinden Değişiklik Yap

1. Catalog'dan bir platform ekle
2. Extension popup'ını aç
3. Platform'un eklendiğini gör

## Performans Optimizasyonları

1. **Debouncing**: Storage değişikliklerinde debounce yok, çünkü kullanıcı genelde tek seferde bir işlem yapar
2. **Tab Filtering**: Gelecekte sadece catalog sayfası olan tab'lara mesaj gönderilebilir
3. **Error Suppression**: Content script olmayan tab'larda error sessizce göz ardı edilir

## Gelecek İyileştirmeler

- [ ] Sadece catalog sayfası olan tab'lara mesaj gönder (URL filter)
- [ ] Batch updates için debouncing ekle
- [ ] WebSocket alternatifi araştır (daha verimli olabilir)
- [ ] Sync conflict resolution stratejisi (son değişiklik kazanır)
