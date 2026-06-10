# 06 — Vergi (KDV, Tevkifat, Stopaj, Gelir/Kurumlar)

Vergi mantığı **parametrik** olmalı: oranlar koda gömülmez, tenant/tarih bazlı tabloda durur. Mevzuat
sık değişir; bir SMMM/YMM ile doğrulanmalı. Aşağıdaki oranlar 2025/2026 itibarıyla referanstır.

## 1. KDV (Katma Değer Vergisi)

| Oran | Nerede | Klinikte |
|------|--------|----------|
| %20 | Genel | Çoğu mal/genel hizmet alımları |
| %10 | İndirimli (sağlık, ilaç vb.) | **Diş/sağlık hizmeti satışı genelde %10** (eskiden %8 idi, yükseltildi) |
| %1 | Çok düşük | Bazı temel kalemler |
| %0 / istisna | İhracat, sağlık turizmi | Türkiye'de yerleşik olmayan yabancı hastaya verilen sağlık hizmeti |

**Model:**
```typescript
interface VatRateConfig { code: '0'|'1'|'10'|'20'; rate: number; validFrom: string; validTo?: string; }
// Hizmet/ürün başına vatRate; fatura kaleminde hesaplanır (bkz 03 computeLine).
```

**KDV beyanı (aylık):** `Hesaplanan KDV (391) − İndirilecek KDV (191)`.
- 391 > 191 → **Ödenecek KDV** (360).
- 191 > 391 → **Devreden KDV** (190), sonraki aya taşınır.
- Beyanname (KDV1) entegratöre/mali müşavire bu özetle gider (bkz 07).

> **Önemli:** Sağlık hizmetinin KDV'li mi istisna mı olduğu, hizmetin kim tarafından kime verildiğine
> bağlıdır (ruhsatlı kuruluş/hekim, hasta tipi). Kuralı `customerType` + `serviceType` ile parametrize et.

## 2. Tevkifat (KDV tevkifatı / kısmi tevkifat)

Bazı hizmet alımlarında KDV'nin bir kısmını alıcı, satıcı yerine doğrudan vergi dairesine öder.
Klinikte tipik olarak **temizlik, özel güvenlik, danışmanlık, yapım işleri** alımında karşılaşılır.
Sağlık hizmeti *satışında* genelde tevkifat yoktur, ama *alımlarında* olabilir.

```typescript
interface WithholdingRule {
  code: string;          // GİB tevkifat kodu (ör. '601','617')
  serviceType: string;
  ratioNumerator: number;   // ör. 9
  ratioDenominator: number; // ör. 10  → 9/10 tevkifat
}
```
**Alışta tevkifatlı KDV fişi (örnek 9/10):**
```
B gider/stok        net
B 191 İnd. KDV       KDV × (1 − 9/10)      (alıcıda kalan kısım)
  A 320 Satıcılar    net + (KDV × 1/10)
  A 360 Ödenecek KDV (sorumlu sıfatıyla) KDV × 9/10
```

## 3. Gelir vergisi stopajı (serbest meslek — muayenehane)

Muayenehane e-SMM keserken, ödeyen taraf **vergi sorumlusu (şirket/kurum)** ise brüt üzerinden
**%20 gelir vergisi stopajı** keser ve hekim adına vergi dairesine yatırır.

```
Brüt hizmet: 10.000  → Stopaj %20 = 2.000 → Hekime ödenen 8.000 (+KDV ayrı)
```
- Hekim tarafında: 193 Peşin Ödenen Vergiler'e yazılır, yıllık beyanda mahsup edilir (bkz 05 §2.1).
- **Nihai tüketici hasta** öderse stopaj yapılmaz (kişi vergi sorumlusu değildir).

## 4. Kira stopajı (GVK 94)

İşyeri kirası bir gerçek kişiye ödeniyorsa, kiracı **%20 stopaj** keser (brütleştirme olabilir):
```
B 770 Kira Gideri                brüt kira
  A 102 Bankalar                            net ödenen
  A 360 Ödenecek Vergi (kira stopajı)       %20
```
Muhtasar beyanname ile beyan edilir.

## 5. Geçici (peşin) vergi ve yıllık beyan

| Yapı | Vergi | Beyan |
|------|-------|-------|
| **Muayenehane (serbest meslek/şahıs)** | Gelir vergisi, artan oranlı %15–%40 | Geçici vergi 3 aylık; yıllık Mart |
| **Poliklinik (şirket/kurum)** | Kurumlar vergisi %25 (2025) | Geçici vergi 3 aylık; yıllık Nisan |

ERP, gelir tablosundan **vergi matrahını** hesaplayıp geçici/yıllık beyana **veri** üretir; beyannameyi
entegratör/mali müşavir oluşturur. Kanunen kabul edilmeyen giderler (KKEG) ayrı işaretlenmeli.

## 6. Muhtasar ve Prim Hizmet Beyannamesi (MUHSGK)

Stopajlar (ücret GV stopajı, kira/serbest meslek stopajı) + SGK bildirimi birleşik beyandır. ERP'nin
bordro ve stopaj verileri (360/361 hareketleri) buraya kaynak olur.

## 7. Parametrik vergi tablosu (öneri)

```typescript
interface TaxParameter {
  tenantId: string;
  key: 'VAT_HEALTH' | 'WHT_SELF_EMPLOYMENT' | 'WHT_RENT' | 'CORP_TAX' | ...;
  rate: number;
  validFrom: string;
  validTo?: string;
}
```
Tüm hesaplamalar bu tablodan oran çeker; tarih bazlı versiyonlama ile geçmiş dönemler doğru hesaplanır.

## 8. Özet beyanname çıktıları (ERP → entegratör/mali müşavir)

| Beyan | Kaynak | Periyot |
|-------|--------|---------|
| KDV (KDV1) | 191/391 özeti | Aylık |
| Muhtasar+Prim (MUHSGK) | 360/361, bordro | Aylık |
| Geçici Vergi | Gelir tablosu | 3 aylık |
| Yıllık GV / Kurumlar | Yıllık mali tablo | Yıllık |
| BA/BS formları | Fatura toplamları (limit üstü) | Aylık (gerekirse) |

Sonraki dosya: `07-entegrator-modulu.md`.
