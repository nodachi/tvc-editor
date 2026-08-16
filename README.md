# Kanal Editör — TV Kanal Listesi Düzenleyici

Mobil öncelikli, tamamen tarayıcı tabanlı (sunucusuz) .sdx / .xml / .json TV kanal listesi düzenleyici.
5.000+ kanalı düşük RAM'li Android cihazlarda bile takılmadan listelemek için sanallaştırılmış
liste (react-window) kullanır. Tüm düzenlemeler cihazda IndexedDB'ye otomatik kaydedilir.

## Özellikler

- **.sdx / .xml / .json** okuma ve yazma, format tespiti otomatik
- Akıllı **.sdx ayrıştırma**: sınırlayıcılı (delimiter) formatları otomatik algılar; sınırlayıcı
  yoksa (fixed-width / bozuk birleşik metin) sezgisel ayrıştırma + **manuel sütun ayarlayıcı**
  (kayan çubukla isim alanının başlangıç/bitiş noktasını canlı önizlemeyle ayarlama) sunar
- Kırık/parçalanmış isimleri (ör. "TRT Worl" + rakamlar + "d" → "TRT World") otomatik onarmaya
  çalışan bir sözlük tabanlı düzeltme adımı içerir — %100 garanti değildir, bu yüzden manuel
  düzeltme her zaman mümkündür
- Çoklu seçim (checkbox veya satıra uzun basma), toplu taşıma/silme, otomatik yeniden numaralama
- Sınırsıza yakın (50 adım) Geri Al / Yinele
- "Orijinale Sıfırla" — tüm değişiklikleri iptal edip dosyanın ilk hâline döner
- Sekme/tarayıcı kapansa/çökse bile son oturumu algılayıp devam etme seçeneği sunar
- Türkçe / İngilizce arayüz, Karanlık / Aydınlık tema
- PWA — çevrimdışı çalışır, ana ekrana eklenebilir

## Yerelde çalıştırma

```bash
npm install
npm run dev
```

## Vercel'e yayınlama (senin akışın)

1. Bu klasörü bir GitHub deposuna yükle (bu README dahil tüm dosyalarla).
2. Vercel → **New Project** → GitHub deposunu seç.
3. Framework Preset: **Vite** (Vercel otomatik algılar).
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy'a bas. Ekstra ortam değişkeni gerekmez, tamamen istemci taraflı çalışır.

## .sdx ayrıştırma hakkında önemli not

`.sdx` formatı Vestel/uydu alıcı üreticilerine göre değişen, resmi olarak belgelenmemiş bir
formattır. Uygulama önce satır içindeki sınırlayıcıyı (`|`, `;`, `,`, Tab) otomatik tespit etmeye
çalışır; bulamazsa sezgisel (heuristic) ayrıştırmaya geçer ve şüpheli satırları ⚠ ile işaretler.

Kendi dosyanda isimler hâlâ yanlış geliyorsa:
1. Uygulamadaki uyarı kutusundan **"Kanal adı eksik/bozuk mu görünüyor?"** panelini aç.
2. Kayan çubuklarla isim alanının başlangıç/bitiş sütununu örnek satırlar üzerinde canlı
   önizlemeyle ayarla, "Bu ayarla yeniden ayrıştır" de.
3. Tek tek kanallar için her zaman satıra dokunup manuel düzeltme yapabilirsin — hiçbir veri
   kaybolmaz, orijinal ham satır her kanalda saklanır.

Gerçek `.sdx` dosyanın tam bir örneğini paylaşırsan, o cihaz/yazılıma özel sabit sütun düzenini
uygulamaya varsayılan olarak gömebilirim.

## Klasör yapısı

```
src/
  App.jsx              → durum yönetimi, geri al/yinele, otomatik kayıt
  parser.js            → sdx/xml/json ayrıştırma ve dışa aktarma
  db.js                → Dexie (IndexedDB) katmanı
  i18n.js               → TR/EN metinler
  components/          → UI bileşenleri (liste, toolbar, modaller)
```
