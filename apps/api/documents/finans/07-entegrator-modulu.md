# 07 — Entegratör Modülü (e-Belge & Beyanname)

Bu modül **opsiyonel ve pluggable**'dır. Resmî e-belge gönderimi ve beyanname/e-defter dışa aktarımı
burada yapılır. **Kapalıyken sistem önmuhasebe + fiş üretimi seviyesinde tam çalışır** — bu, kapsam
kararının teknik karşılığıdır.

## 1. Tasarım: Port & Adapter (hexagonal)

Çekirdek (önmuhasebe + muhasebe) entegratörü **bilmez**; yalnızca bir **port** (interface) tanır.
Logo, Uyumsoft, GİB portalı, Mikro vb. birer **adapter**'dır.

```typescript
// ports/e-invoice.port.ts
interface EInvoicePort {
  issue(doc: EDocumentRequest): Promise<EDocumentResult>;   // e-Fatura/e-Arşiv/e-SMM kes
  cancel(uuid: string, reason: string): Promise<void>;
  getStatus(uuid: string): Promise<EDocumentStatus>;
  checkMailbox(taxId: string): Promise<{ isEInvoiceUser: boolean; alias?: string }>;
}

// ports/filing-export.port.ts
interface FilingExportPort {
  exportLedger(periodId: string): Promise<EDefterPackage>;   // e-Defter (XBRL-GL)
  exportVatReturn(periodId: string): Promise<VatReturnData>; // KDV beyan verisi
  exportMuhtasar(periodId: string): Promise<MuhtasarData>;
}
```

```typescript
// Çekirdek sadece portu çağırır; adapter yoksa NoopAdapter devrede.
class IntegrationService {
  constructor(private einvoice: EInvoicePort = new NoopEInvoiceAdapter()) {}
}
```

**NoopAdapter (fallback):** Entegratör kapalıyken belge `documentType: 'INTERNAL'` olarak üretilir,
ETTN/UUID atanmaz, dış gönderim yapılmaz; fiş ve defter normal oluşur. Kullanıcıya "e-belge entegrasyonu
kapalı — bu iç belgedir" bilgisi gösterilir.

## 2. e-Belge türleri ve hangi durumda hangisi

| Belge | Ne zaman | Klinik karşılığı |
|-------|----------|------------------|
| **e-Fatura** | Alıcı da e-Fatura mükellefi | Anlaşmalı kurum/şirket hastalara |
| **e-Arşiv Fatura** | Alıcı mükellef değil (nihai tüketici) | **Bireysel hastalara (poliklinik)** |
| **e-SMM** (Serbest Meslek Makbuzu) | Serbest meslek erbabı | **Muayenehane (hekim) tahsilatı** |
| **e-İrsaliye** | Mal sevkiyatı | Genelde klinikte nadir (malzeme transferi) |
| **e-Müstahsil** | Müstahsilden alım | Klinikte yok denecek kadar az |

**Belge türü seçim kuralı:**
```typescript
function resolveDocumentType(tenant, party): DocumentType {
  if (tenant.legalType === 'SERBEST_MESLEK') return 'E_SMM';
  if (party.isEInvoiceUser) return 'E_FATURA';
  return 'E_ARSIV'; // bireysel hasta
}
```

## 3. Belge yaşam döngüsü

```
Invoice (DRAFT) → issue() → entegratör → ETTN/UUID + durum (QUEUED/SENT/ACCEPTED/REJECTED)
                                           │
                       webhook/poll ile durum güncelle → Invoice.status, einvoiceUuid
İptal: cancel() (e-Arşiv: belirli süre; e-Fatura: red/iade senaryosu)
```

Gönderim **asenkron ve kuyruklu** olmalı (entegratör/GİB yavaş veya down olabilir). Idempotency key =
Invoice id. Hata durumunda retry + dead-letter.

```typescript
interface EDocumentRequest {
  type: DocumentType;
  invoiceId: string;
  issueDate: string;
  seller: PartyTaxInfo;
  buyer: PartyTaxInfo;       // TCKN/VKN, ad, adres
  lines: Array<{ name: string; qty: number; unitPrice: number;
                 vatRate: number; vatAmount: number; withholding?: WithholdingInfo }>;
  totals: { net: number; vat: number; withholding?: number; payable: number };
  currency: string;
  note?: string;
}
```

## 4. Logo özelinde notlar

Logo entegrasyonu pratikte iki şekilde olur:
1. **Logo'nun e-belge/entegratör servisleri** (e-Logo / Logo İşbaşı vb.) → REST/SOAP API ile belge kes.
2. **Logo ERP'ye veri aktarımı** → fiş/cari/fatura verisini Logo'ya import (LogoObjects/XML/REST).

Senin mimarinde Logo bir `EInvoicePort` (belge) ve/veya `FilingExportPort` (defter/beyan) adapter'ı
olarak konumlanır. Çekirdek kodun Logo'ya bağımlı olmamalı; tüm Logo'ya özgü alanlar adapter içinde
map'lenir. Logo'nun beklediği alan adları (cari kodu, hesap kodu eşleşmesi, KDV kodları) bir
**mapping config** ile yönetilir.

```typescript
// adapters/logo/mapping.ts
interface LogoMapping {
  accountCodeMap: Record<string, string>;   // bizim 600.04 → Logo hesap kodu
  vatCodeMap: Record<string, string>;       // 10 → Logo KDV kodu
  partyCodeMap: (party: Party) => string;    // cari kod üretimi
}
```

## 5. Hata ve mutabakat senaryoları

- **Belge kesildi ama fiş atılmadı / tam tersi:** Invoice ve JournalEntry aynı `FinancialEvent`'e bağlı
  olduğundan tutarlılık korunur; entegratör gönderimi ayrı bir "outbound" durumudur, muhasebeyi bloklamaz.
- **Entegratör reddetti (REJECTED):** Invoice `ISSUED` kalır ama `einvoiceStatus=REJECTED`; kullanıcı
  düzeltip yeniden gönderir. Muhasebe fişi gerekiyorsa storno + yeni.
- **GİB/entegratör down:** Kuyruk birikir, fiş ve önmuhasebe etkilenmez (fallback prensibi).

## 6. Özet: modülerlik garantisi

| Senaryo | e-Belge | Fiş/Defter | Beyanname |
|---------|---------|------------|-----------|
| Entegratör **açık** | Entegratörden kesilir | ERP üretir | Veri ERP'den, beyan entegratörde |
| Entegratör **kapalı** | İç belge (INTERNAL) | ERP üretir | ERP export → mali müşavir |

Çekirdek hiçbir senaryoda entegratöre **zorunlu bağımlı** değildir. Sonraki dosya: `08-girdi-cikti-ozeti.md`.
