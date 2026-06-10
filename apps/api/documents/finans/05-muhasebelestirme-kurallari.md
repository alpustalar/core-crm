# 05 — Muhasebeleştirme Kuralları (Posting Rules Engine)

Bu, sistemin kalbidir: bir `FinancialEvent`'i alıp **çift taraflı yevmiye fişine** çeviren motor.
Hedef: önmuhasebede iş yapan kullanıcı muhasebe bilmesin; fiş otomatik ve deterministik üretilsin.

## 1. Motor tasarımı

```typescript
interface PostingContext {
  tenant: { id: string; legalType: 'SERBEST_MESLEK' | 'KURUM' };
  accounts: AccountResolver;     // koddan account_id çözer (alt hesap dahil)
  period: AccountingPeriod;
}

interface PostingRule<T = unknown> {
  eventType: FinancialEventType;
  build(event: FinancialEvent & { payload: T }, ctx: PostingContext): DraftJournalEntry;
}

interface DraftJournalEntry {
  date: string;
  description: string;
  lines: Array<{
    accountCode: string;   // '120', '600.04', '391'...
    partyId?: string;      // 120/320 için zorunlu
    debit?: number;        // kuruş
    credit?: number;
    desc?: string;
  }>;
}
```

**Akış:**
```
FinancialEvent → ruleRegistry[event.type].build(event, ctx) → validate(denge, party) → persist (DRAFT)
              → (onay/otomatik) → POST (entry_no ata, ledger'a yansıt)
```

**Değişmez kurallar:**
- `Σdebit === Σcredit` değilse fişi reddet.
- Aynı `eventId` için ikinci fiş üretme (unique constraint).
- Hesap kodu yapraksa (`is_postable`) işle; değilse hata.
- Tutarlar kuruş (integer).

## 2. Kural kataloğu (olay → fiş şablonu)

> Notasyon: **B** = Borç, **A** = Alacak. Hesap kodları TDHP; alt hesaplar tenant'a göre çözülür.
> Oranlar örnektir (sağlık hizmeti KDV %10, serbest meslek stopaj %20) — `06-vergi.md`'den parametrik gelir.

### 2.1 Satış / Hizmet Faturası — `SALES_INVOICE_ISSUED`

**KURUM (poliklinik), normal hasta:**
```
B 120 Alıcılar (party=hasta)            grandTotal
  A 600.xx Yurtiçi Satışlar                         netTotal
  A 391 Hesaplanan KDV                              vatTotal
```

**SERBEST MESLEK (muayenehane), e-SMM, ödeyen işletme ise stopajlı:**
```
B 120 Alıcılar (party)                  net + KDV − stopaj   (tahsil edilecek)
B 193 Peşin Ödenen Vergiler (stopaj)    stopaj                (gelir vergisi mahsubu)
  A 600 Serbest Meslek Hasılatı                     net
  A 391 Hesaplanan KDV                              vatTotal
```
> Stopaj yalnızca ödeyen bir **vergi sorumlusu (şirket/kurum)** ise yapılır; nihai tüketici hastada
> stopaj olmaz. Kural `ctx.tenant.legalType` + `party.type/role` ile dallanır.

**Sağlık turizmi (yabancı hasta, KDV istisna):**
```
B 120 Alıcılar (party)                  netTotal
  A 601 Yurtdışı Satışlar                           netTotal     (KDV %0 / istisna)
```

### 2.2 Satış Faturası İptali — `SALES_INVOICE_CANCELLED`
Orijinal fişin **storno**'su (borç/alacak ters). Yeni `entry`, `reverses` orijinali işaret eder.

### 2.3 Alış Faturası — `PURCHASE_INVOICE_RECEIVED`

**Sarf malzeme/stoklu alış:**
```
B 150 İlk Madde ve Malzeme              netTotal
B 191 İndirilecek KDV                   vatTotal
  A 320 Satıcılar (party=tedarikçi)                 grandTotal
```

**Gider niteliğinde alış (kira, elektrik, danışmanlık):**
```
B 770/760/740 ilgili gider              netTotal
B 191 İndirilecek KDV                   vatTotal
  A 320 Satıcılar (party)                           grandTotal
```

### 2.4 Tahsilat — `PAYMENT_RECEIVED`

**Nakit:**
```
B 100 Kasa                              amount
  A 120 Alıcılar (party)                            amount
```

**Banka havalesi:**
```
B 102 Bankalar                          amount
  A 120 Alıcılar (party)                            amount
```

**POS / kredi kartı (komisyonlu):**
```
# 1) Çekim anı
B 108 Diğer Hazır Değerler (POS)        amount
  A 120 Alıcılar (party)                            amount
# 2) Bankaya komisyon kesilerek geçiş (ayrı olay/işlem)
B 102 Bankalar                          amount − komisyon
B 653 Komisyon Giderleri                komisyon
  A 108 Diğer Hazır Değerler (POS)                  amount
```

**Avans/ön ödeme (henüz fatura yok):**
```
B 100/102                               amount
  A 340 Alınan Sipariş Avansları (party)            amount
```

### 2.5 Ödeme — `PAYMENT_MADE`
```
B 320 Satıcılar (party)                 amount
  A 100/102                                          amount
```

### 2.6 Çek/Senet alındı — `INSTRUMENT_RECEIVED`
```
B 101 Alınan Çekler  (veya 121 Alacak Senetleri)    amount
  A 120 Alıcılar (party)                             amount
```
**Tahsil edildi — `INSTRUMENT_CLEARED` (alınan):**
```
B 102 Bankalar                          amount
  A 101/121                                          amount
```
**Verilen çek/senet — `INSTRUMENT_GIVEN`:**
```
B 320 Satıcılar (party)                 amount
  A 103 Verilen Çekler / 321 Borç Senetleri          amount
```

### 2.7 Stok tüketimi — `STOCK_OUT (CONSUMPTION)`
```
B 740.01 Hizmet Üretim Maliyeti / Sarf  cost
  A 150 İlk Madde ve Malzeme                          cost
```
**Fire/zayi — `STOCK_OUT (WASTE)`:**
```
B 689 Diğer Olağandışı Gider (veya 770)  cost
  A 150                                               cost
```

### 2.8 Doğrudan gider (faturasız/masraf) — `EXPENSE_RECORDED`
```
B 770/760/740 ilgili gider              net
B 191 İndirilecek KDV (varsa)           vat
  A 100/102                                          total
```

### 2.9 Bordro tahakkuku — `PAYROLL_ACCRUED`
```
B 770 Genel Yönetim Gid. / Personel (brüt)    brüt ücret
B 770 İşveren SGK payı                          işveren SGK
  A 335 Personele Borçlar                                   net ödenecek
  A 360 Ödenecek Vergi ve Fonlar (GV stopaj + damga)        kesintiler
  A 361 Ödenecek SGK (işçi+işveren)                          SGK toplam
```
> Bordro hesaplaması ayrı bir İK/bordro modülünde yapılır; finans yalnızca **tahakkuk fişini** alır.
> Net ödeme yapıldığında `PAYMENT_MADE`: B 335 / A 102.

### 2.10 Amortisman — `DEPRECIATION`
```
B 770/740 Amortisman Gideri             dönem amortismanı
  A 257/256 Birikmiş Amortismanlar                  dönem amortismanı
```

### 2.11 Kur değerleme — `FX_REVALUATION`
```
# Lehte
B ilgili döviz hesabı / A 646 Kambiyo Kârları
# Aleyhte
B 656 Kambiyo Zararları / A ilgili döviz hesabı
```

### 2.12 Açılış — `OPENING_BALANCE`
Dönem başı bilanço bakiyelerini tek bir açılış fişiyle yükler (aktifler borç, pasif/özkaynak alacak).

### 2.13 Elle fiş — `MANUAL_JOURNAL`
Kullanıcı/muhasebeci serbest fiş girer; motor sadece dengeyi ve hesap geçerliliğini doğrular.

## 3. KDV mahsubu (dönem sonu) — `PERIOD_CLOSING` parçası
```
B 391 Hesaplanan KDV (dönem toplamı)
  A 191 İndirilecek KDV (dönem toplamı)
  A 360 Ödenecek KDV            (391 > 191 ise fark = ödenecek)
# 191 > 391 ise devreden KDV (190) oluşur, sonraki döneme aktarılır.
```

## 4. Kural tablosu (hızlı referans)

| Olay | Borç | Alacak |
|------|------|--------|
| Satış faturası (kurum) | 120 | 600 + 391 |
| Satış (serbest meslek, stopajlı) | 120 + 193 | 600 + 391 |
| Sağlık turizmi | 120 | 601 |
| Alış (stok) | 150 + 191 | 320 |
| Alış (gider) | 770/760/740 + 191 | 320 |
| Tahsilat nakit/banka | 100/102 | 120 |
| Tahsilat POS | 108 → (102+653) | 120 → 108 |
| Avans alındı | 100/102 | 340 |
| Ödeme | 320 | 100/102 |
| Çek/senet alındı | 101/121 | 120 |
| Çek/senet tahsil | 102 | 101/121 |
| Çek/senet verildi | 320 | 103/321 |
| Stok tüketimi | 740 | 150 |
| Masraf | 770/760/740 + 191 | 100/102 |
| Bordro tahakkuk | 770 | 335 + 360 + 361 |
| Amortisman | 770/740 | 256/257 |
| KDV mahsubu | 391 | 191 + 360 |

## 5. Test yaklaşımı

Her kural için **golden test**: örnek olay → beklenen fiş satırları (hesap, borç, alacak). Snapshot
karşılaştırması. Ayrıca property test: üretilen her fiş dengeli, 120/320 satırında party var, tutarlar
non-negative integer.

Sonraki dosya: `06-vergi.md`.
