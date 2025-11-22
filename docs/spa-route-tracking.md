# Extension Permissions ve Özellikler Hakkında

## Mevcut İzinler

Extension sadece temel işlevsellik için gereken minimum izinleri kullanıyor:

- **`storage`**: Kullanıcının arama motorları ayarlarını saklamak için
- **`contextMenus`**: Sağ tıklama menüsü öğelerini oluşturmak için
- **`tabs`**: Yeni sekmede arama sonuçlarını açmak için
- **`activeTab`**: Aktif sekmede seçili metin veya resim URL'si almak için

## SPA Route Tracking Durumu

**❌ KULLANILMIYOR VE GEREKLİ DEĞİL**

SPA route tracking özelliği bu extension'ın işlevselliği için gerekli değildir çünkü:

1. Extension sadece kullanıcı sağ tıkladığında veya klavye kısayolu kullandığında çalışır
2. Sayfa değişikliklerini takip etmeye gerek yoktur
3. `webNavigation` izni gizlilik açısından hassas bir izindir ve gereksiz kullanılmamalıdır
4. Ek izin kullanıcıya ekstra onay gerektiriyor

### Neden Kaldırıldı?

- **Gizlilik**: Kullanıcıların tüm gezinti geçmişini takip edebilme yetkisi gerekmektedir
- **Güvenlik**: Chrome Web Store'da gereksiz izinler red gerekçesi olabilir
- **Performans**: Her sayfa değişikliğinde event listener çalıştırmaya gerek yok
- **Basitlik**: Extension'ın temel amacı right-click search'tür

## Content Script İletişimi

Extension'ın web sayfaları ile iletişimi için content script kullanılmaktadır:

### Ne zaman yüklenir?
- `document_end` safhasında, sayfa DOM'u hazır olduğunda
- Sadece kullanıcı extension'ı yüklediğinde
- Tüm URL'lerde (`<all_urls>`)

### Ne yapar?
1. **Klavye Kısayolları**: Seçili metinle klavye kısayolu çalıştırma
2. **Platform Catalog Bridge**: Web sitesi ile extension arasında güvenli iletişim
   - Sadece izin verilen origin'lerden mesaj kabul eder
   - `ALLOWED_ORIGINS`: localhost:3000, rept.in, right-click-search.ibrahimuzun.com

### Content Script'in Injection Sorunları

Eğer content script bazı sayfalarda çalışmıyorsa:

#### Olası Nedenler:
1. **Özel Protokoller**: `chrome://`, `chrome-extension://`, `about:` gibi sayfalarda content script çalışmaz
2. **CSP (Content Security Policy)**: Bazı siteler çok katı CSP politikaları kullanır
3. **Same-Origin Sorunları**: İframe içindeki sayfalarda sorun yaşanabilir

#### Çözümler:
1. Extension sadece normal web sayfalarında (`http://`, `https://`) çalışmalıdır
2. Content script injection hatalarını yakalamak için:
   ```typescript
   chrome.runtime.sendMessage(..., (response) => {
     if (chrome.runtime.lastError) {
       console.log('Content script not available:', chrome.runtime.lastError.message);
       return;
     }
   });
   ```

## Platform Catalog Entegrasyonu

Extension'ın web sitesi ile iletişimi **postMessage API** kullanarak yapılır:

### Güvenlik:
- Origin kontrolü yapılır
- Sadece belirli message type'ları kabul edilir
- Extension versiyonu handshake'te paylaşılır

### Mesaj Tipleri:
- `RCS_BRIDGE_HANDSHAKE`: Extension'ın varlığını kontrol et
- `RCS_GET_ENGINES`: Mevcut motorları al
- `RCS_ADD_ENGINES`: Yeni motor ekle
- `RCS_REMOVE_ENGINE`: Motor sil

## Best Practices

1. ✅ **Minimum İzinler**: Sadece gerekli izinleri kullan
2. ✅ **Origin Kontrolü**: Her external mesajı doğrula
3. ✅ **Error Handling**: Content script injection hatalarını yakala
4. ✅ **Sequential Updates**: Menu güncellemelerini sırayla yap (mutex/queue pattern)
5. ✅ **Gizlilik**: Kullanıcı verilerini toplamayı minimumda tut
