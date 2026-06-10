# 08 — Girdi / Çıktı Özeti (Kontrol Listesi)

Sorunun özü: **"Neyin girdi/çıktısını tutmalıyım ki muhasebe ve önmuhasebe ERP üzerinden yürüsün?"**
Bu dosya, modül modül *ne yakalayacağını* (girdi) ve *ne üreteceğini* (çıktı) tek bakışta verir.
İmplementasyon önceliklendirmesi için MoSCoW (Must/Should/Could) eklendi.

## 1. Tutman gereken GİRDİLER (kayıt altına alınacak veri)

| # | Girdi | Neden | Öncelik |
|---|-------|-------|---------|
| 1 | **Cari kartlar** (hasta, tedarikçi, personel + vergi kimliği) | Tüm borç/alacak ve e-belge bunlara bağlanır | Must |
| 2 | **Hesap planı** (TDHP, klinik alt hesapları) | Çift taraflı kaydın iskeleti | Must |
| 3 | **Satış/hizmet faturaları** (kalem, KDV, tarih, tür) | Gelir tahakkuku, KDV, e-belge | Must |
| 4 | **Alış faturaları & masraflar** (gider/stok, KDV) | Gider/maliyet, indirilecek KDV | Must |
| 5 | **Tahsilat & ödemeler** (nakit/banka/POS/çek) + fatura eşleştirme | Cari bakiye, nakit durumu | Must |
| 6 | **Kasa/banka/POS hesapları ve hareketleri** | Likidite, mutabakat | Must |
| 7 | **Muhasebe dönemi & açılış bakiyeleri** | Defter sürekliliği | Must |
| 8 | **Stok/sarf malzeme** (giriş, tüketim, maliyet, lot/SKT) | Tedavi maliyeti, stok değeri | Should |
| 9 | **Taksit planları** (dental'de yaygın) | Açık alacak/vade takibi | Should |
| 10 | **Çek/senet portföyü** (durum, vade) | Alacak/borç enstrümanları | Should |
| 11 | **Sabit kıymetler & amortisman planı** | Duran varlık, dönem gideri | Should |
| 12 | **Bordro tahakkuk verisi** (brüt, kesinti, SGK) | Personel gideri, stopaj/SGK | Should |
| 13 | **Vergi parametreleri** (KDV/stopaj oranları, tarih bazlı) | Doğru hesaplama, geçmiş dönem | Must |
| 14 | **Tevkifat/stopaj kuralları** | Serbest meslek & belirli alımlar | Could |
| 15 | **Döviz kurları** (çok para birimi varsa) | Kur değerleme | Could |

## 2. Üretmen gereken ÇIKTILAR (rapor/belge/aktarım)

### Önmuhasebe çıktıları
- Cari ekstre & bakiye listesi & **yaşlandırma (aging)**
- Kasa defteri, banka mutabakatı, **günlük nakit durumu**
- POS tahsilat ↔ banka yatış eşleştirme
- Tahsilat raporu, **vadesi gelen/geçen taksitler**
- Çek/senet vade takvimi & portföy
- Stok hareket/değer raporu, kritik stok uyarısı
- Satış raporları: **tedavi türü / hekim / dönem bazında ciro ve marj**

### Muhasebe çıktıları
- **Yevmiye defteri** (kronolojik fişler)
- **Defter-i kebir** (hesap bazlı hareket)
- **Mizan** (geçici/kesin)
- **Bilanço** ve **Gelir Tablosu**
- Dönem kapanış fişleri (amortisman, yansıtma, K/Z devri)

### Vergi & resmî çıktılar (entegratöre/mali müşavire veri)
- KDV beyan özeti (191/391 → ödenecek/devreden)
- Muhtasar + Prim (MUHSGK) verisi
- Geçici vergi & yıllık beyan matrahı
- e-Belgeler: **e-Fatura / e-Arşiv / e-SMM** (entegratör açıksa)
- **e-Defter** paketi (entegratör üretir; ERP fiş verisini sağlar)
- BA/BS formları (gerekirse)

## 3. Minimum çalışır iskelet (MVP sırası)

Claude Code için önerilen inşa sırası:

1. **Hesap planı + dönem + Money/event altyapısı** (00, 01, 02)
2. **Cari modülü** (party) — herkesin bağlanacağı çekirdek
3. **Fatura (satış/alış) + posting rules** — gelir/gider tahakkuku (03, 05)
4. **Kasa/banka/POS + tahsilat/ödeme** — para hareketi ve mahsup (03, 05)
5. **Yevmiye/defter-i kebir/mizan** — muhasebe görünürlüğü (04)
6. **KDV/vergi parametreleri** (06)
7. **Stok, çek/senet, sabit kıymet, bordro** — kademeli (03, 05)
8. **Entegratör portu + Noop adapter**, sonra Logo adapter (07)
9. **Mali tablolar + dönem kapanış + beyan export** (04, 06)

Bu sırayla 1–5 tamamlandığında "önmuhasebe + otomatik fiş + temel defterler" çalışır hale gelir; bu da
kapsam kararındaki **fallback (entegratörsüz) modun** tam karşılığıdır.

## 4. Kabul kriterleri (done tanımı)

- [ ] Bir hizmet faturası kesince otomatik dengeli fiş oluşuyor (120/600/391).
- [ ] POS'tan tahsilat girince 108→102+653 akışı doğru işliyor.
- [ ] Cari ekstre bakiyesi = defter-i kebir 120 bakiyesi.
- [ ] Mizan borç toplamı = alacak toplamı.
- [ ] Entegratör kapalıyken tüm fiş/defter üretimi sürüyor (sadece e-belge yok).
- [ ] Dönem kilitliyken geçmişe fiş atılamıyor; düzeltme storno ile yapılıyor.
- [ ] KDV beyan özeti dönem 191/391'den doğru hesaplanıyor.

---

> **Hatırlatma:** Bu doküman teknik mimari rehberidir, mali müşavirlik tavsiyesi değildir. Hesap
> eşleşmeleri, KDV/stopaj oranları ve beyan kuralları mevzuata göre değişir; canlı kullanım öncesi bir
> SMMM/YMM ile doğrulanmalıdır.
