# 00 — Mimari

## 1. Temel ilke: Event-sourced muhasebeleştirme

Finans modülünün omurgası şu ayrımdır:

- **Ekonomik olay (financial event):** İşletmede gerçekleşen, para/değer etkisi olan her şey. Örnek:
  "hastaya tedavi faturası kesildi", "POS'tan tahsilat alındı", "tedarikçiye ödeme yapıldı",
  "sarf malzeme stoğa girdi", "ay sonu amortisman".
- **Muhasebe fişi (journal entry):** Bir ekonomik olayın TDHP hesaplarına çift taraflı yansıması.

**Kural:** Fiş, olayın *türevidir*. Önce olayı kalıcı (immutable) olarak yaz, sonra posting rules ile
fişi üret. Bu sayede:

1. Entegratör modülü kapalıyken bile her şey çalışır (olay + fiş yeterli).
2. Posting kuralı değişirse fişler yeniden üretilebilir (olaylar bozulmaz).
3. Denetim izi (audit trail) doğal olarak oluşur.

```
Domain işlemi → FinancialEvent (immutable) → PostingRule → JournalEntry (fiş) → Ledger
```

## 2. Katmanlar

### Katman 1 — Önmuhasebe (operasyonel)
Kullanıcının günlük çalıştığı katman. Burada muhasebe hesabı görünmez; kullanıcı "fatura kes",
"tahsilat al", "stok gir" der. Modüller: Cari, Kasa/Banka/POS, Fatura, Stok, Tahsilat/Ödeme, Çek/Senet.
Her aksiyon bir `FinancialEvent` doğurur. Detay: `03-onmuhasebe.md`.

### Katman 2 — Muhasebeleştirme (posting)
`FinancialEvent` → `JournalEntry`. Olay tipine göre fiş şablonu seçilir, hesaplar ve borç/alacak
tutarları doldurulur. Bu katman **saf fonksiyon** gibi tasarlanır: aynı olay + aynı kural = aynı fiş.
Detay: `05-muhasebelestirme-kurallari.md`.

### Katman 3 — Muhasebe (ledger)
Fişlerin tutulduğu, defterlerin/mizanın/mali tabloların üretildiği resmî katman. Yevmiye, defter-i
kebir, mizan, dönem kapanışı, bilanço, gelir tablosu. Detay: `04-muhasebe-defterler.md`.

### Katman 4 — Entegratör (opsiyonel, pluggable)
e-Fatura/e-Arşiv/e-SMM gönderimi ve beyanname/defter dışa aktarımı. Bir **adapter interface**
arkasındadır; Logo, Uyumsoft, GİB portalı vb. birer implementasyondur. **Kapalıyken sistem
önmuhasebe + fiş üretimi seviyesinde tam fonksiyoneldir.** Detay: `07-entegrator-modulu.md`.

## 3. Modülerlik sözleşmesi (önemli kapsam kararı)

| Mod | Açık modüller | Davranış |
|-----|---------------|----------|
| **Tam (entegratörlü)** | 1+2+3+4 | e-belge entegratörden kesilir, beyanname verisi dışa aktarılır |
| **Fallback (entegratörsüz)** | 1+2+3 | Belgeler taslak/iç fiş olarak üretilir, fişler ve defterler oluşur; e-belge ve resmî gönderim yok |
| **Minimum** | 1+2 | Cari/kasa görünür, fiş üretilir; defter/mizan raporları opsiyonel |

Bu yüzden Katman 4 hiçbir zaman alt katmanların **zorunlu bağımlılığı** olmamalı. Entegrasyon bir
**çıkış kanalı (outbound port)** olarak modellenir.

## 4. Çapraz kesen (cross-cutting) konular

### 4.1 Çoklu kiracı (multi-tenant) ve çoklu şube
- Her kayıt `tenantId` (işletme) taşır; çok şubeli klinikler için `branchId`.
- Hesap planı, dönem, numaratörler tenant bazında izole.
- Muayenehane mi poliklinik mi? → `tenant.legalType: 'SERBEST_MESLEK' | 'KURUM'`. Bu, fatura türünü
  (e-SMM vs e-Fatura), stopaj davranışını ve vergi rejimini belirler.

### 4.2 Muhasebe dönemi (period)
- `AccountingPeriod` { tenantId, year, status: OPEN | LOCKED | CLOSED }.
- Kilitli/kapalı döneme fiş atılamaz. Geçmişe dönük düzeltme = ters kayıt (storno), silme değil.

### 4.3 Değişmezlik (immutability) ve düzeltme
- Onaylanmış (`POSTED`) fiş **silinmez/değiştirilmez**. Düzeltme için **storno fişi** (ters kayıt) +
  yeni doğru fiş. Taslak (`DRAFT`) fişler değiştirilebilir.

### 4.4 Audit trail
- Her finansal kayıt: `createdBy`, `createdAt`, `updatedBy`, `updatedAt`, `sourceEventId`.
- `FinancialEvent` tablosu append-only; hiçbir zaman update edilmez (yalnızca yeni olay eklenir).

### 4.5 Para ve yuvarlama
- Tutarlar **tam sayı, minor unit (kuruş)** olarak saklanır (ör. 12,50 TL → `1250`). Float kullanma.
- Para birimi alanı her tutarla birlikte (`amountMinor`, `currency`). Döviz işlemlerde `exchangeRate`
  ve TRY karşılığı ayrıca tutulur.
- KDV/yuvarlama hesapları "banker's rounding" yerine mevzuata uygun (genelde 2 hane, yarı yukarı)
  yapılır; yuvarlama farkı için ayrı hesap (ör. 397/679/689) ayrılır.

### 4.6 Numaralandırma (numaratörler)
- Fiş no, fatura no, makbuz no tenant + dönem + tür bazında **boşluksuz, sıralı** üretilir
  (yasal gereklilik). Concurrency için DB-level sequence veya `SELECT ... FOR UPDATE` ile kilit.

### 4.7 İdempotentlik
- Posting işlemi idempotent olmalı: bir `FinancialEvent` için en fazla bir `JournalEntry`. `eventId`
  üzerine unique constraint koy.

## 5. Önerilen modül/paket yapısı (kod)

```
src/
  accounting/
    chart-of-accounts/      # hesap planı (02)
    journal/                # fiş, yevmiye (04)
    ledger/                 # defter-i kebir, mizan (04)
    periods/                # dönem yönetimi
    reports/                # mizan, bilanço, gelir tablosu (04)
    posting/                # posting rules engine (05)
      rules/                # olay tipi başına kural
  preaccounting/            # önmuhasebe (03)
    parties/                # cari hesaplar (hasta, tedarikçi, personel)
    cash-bank/              # kasa, banka, POS
    invoicing/              # satış/alış faturaları
    inventory/              # stok / sarf malzeme
    receivables/            # tahsilat, taksit, çek/senet
  tax/                      # vergi hesaplama (06)
  integration/             # entegratör portu + adapter'lar (07)
    ports/                  # EInvoicePort, FilingExportPort (interface)
    adapters/               # logo/, gib/, uyumsoft/
  shared/
    money/                  # Money value object, yuvarlama
    events/                 # FinancialEvent altyapısı
    audit/
```

## 6. Akış örneği (uçtan uca)

Hastaya implant tedavisi faturalanıyor, %50'si POS'tan peşin alınıyor:

1. **Önmuhasebe:** `Invoice` oluşturulur (hizmet kalemi, KDV %10). → `FinancialEvent: SALES_INVOICE_ISSUED`.
2. **Posting:** Kural `120 Alıcılar (borç) / 600 Yurtiçi Satışlar + 391 Hesaplanan KDV (alacak)` fişi üretir.
3. **Önmuhasebe:** POS tahsilatı girilir. → `FinancialEvent: PAYMENT_RECEIVED (POS)`.
4. **Posting:** `108/102 Banka POS (borç) + 653 Komisyon Gideri (borç) / 120 Alıcılar (alacak)`.
5. **Ledger:** Fişler yevmiyeye yazılır, cari (120) bakiyesi güncellenir, mizana yansır.
6. **Entegratör (açıksa):** Fatura e-Arşiv/e-Fatura olarak kesilir; kapalıysa iç fatura + fiş ile kalır.

Sonraki dosya: `01-veri-modeli.md`.
