# 01 — Veri Modeli

Çekirdek finans varlıkları. Tutarlar **bigint, kuruş (minor unit)** olarak saklanır. Tüm tablolar
`tenant_id` taşır (multi-tenant). Kod örnekleri PostgreSQL + TypeScript.

## 1. Diyagram (özet ilişkiler)

```
Tenant ──< AccountingPeriod
Tenant ──< Account (hesap planı, ağaç)
Tenant ──< Party (cari: hasta/tedarikçi/personel)
Tenant ──< FinancialEvent ──1:1── JournalEntry ──< JournalLine >── Account
                                                         └────────> Party (alt defter)
Tenant ──< Invoice ──< InvoiceLine
Tenant ──< CashBankAccount ──< CashBankTransaction
Tenant ──< Payment (tahsilat/ödeme) ──< PaymentAllocation >── Invoice
Tenant ──< NegotiableInstrument (çek/senet)
Tenant ──< Product (stok) ──< StockMovement
Tenant ──< FixedAsset ──< DepreciationSchedule
```

## 2. Çekirdek değişmez kayıt: FinancialEvent

Her ekonomik olay önce buraya yazılır (append-only). Posting bunu okur.

```typescript
type FinancialEventType =
  | 'SALES_INVOICE_ISSUED'      // satış faturası / hizmet faturası
  | 'SALES_INVOICE_CANCELLED'
  | 'PURCHASE_INVOICE_RECEIVED' // alış faturası
  | 'PAYMENT_RECEIVED'          // tahsilat (kasa/banka/POS)
  | 'PAYMENT_MADE'              // ödeme
  | 'INSTRUMENT_RECEIVED'       // çek/senet alındı
  | 'INSTRUMENT_GIVEN'
  | 'INSTRUMENT_CLEARED'        // tahsil edildi / ödendi
  | 'STOCK_IN'                  // stok girişi
  | 'STOCK_OUT'                 // tüketim / satış maliyeti
  | 'EXPENSE_RECORDED'          // doğrudan gider (faturasız/masraf)
  | 'PAYROLL_ACCRUED'           // bordro tahakkuku
  | 'DEPRECIATION'              // amortisman
  | 'FX_REVALUATION'            // kur değerleme
  | 'MANUAL_JOURNAL'            // elle açılan fiş
  | 'OPENING_BALANCE'           // açılış fişi
  | 'PERIOD_CLOSING';           // dönem kapama
```

```sql
CREATE TABLE financial_event (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL,
  branch_id     UUID,
  type          TEXT NOT NULL,
  occurred_at   TIMESTAMPTZ NOT NULL,        -- ekonomik olayın tarihi (vergi tarihi)
  payload       JSONB NOT NULL,              -- olaya özgü veri (aşağıda)
  source_module TEXT NOT NULL,               -- 'invoicing' | 'cash-bank' | ...
  source_ref_id UUID,                        -- ilgili Invoice/Payment id
  created_by    UUID NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  -- NOT: bu tablo asla UPDATE/DELETE edilmez
);
CREATE INDEX ON financial_event (tenant_id, occurred_at);
CREATE INDEX ON financial_event (source_ref_id);
```

## 3. Hesap planı: Account

Detaylı içerik `02-hesap-plani.md`. Tablo:

```sql
CREATE TABLE account (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL,
  code        TEXT NOT NULL,                 -- '120.01.0001' gibi
  name        TEXT NOT NULL,
  parent_id   UUID REFERENCES account(id),
  -- hesap karakteri
  type        TEXT NOT NULL,                 -- ASSET|LIABILITY|EQUITY|REVENUE|EXPENSE
  normal_side TEXT NOT NULL,                 -- 'DEBIT' | 'CREDIT'
  is_postable BOOLEAN NOT NULL DEFAULT true, -- sadece yaprak hesaplara fiş atılır
  requires_party BOOLEAN NOT NULL DEFAULT false, -- alt defter zorunlu mu (120/320 gibi)
  currency    TEXT,                          -- döviz hesabıysa
  is_active   BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (tenant_id, code)
);
```

## 4. Cari hesap: Party

Hasta/müşteri, tedarikçi ve personel tek modelde; rol(ler) ile ayrışır.

```typescript
interface Party {
  id: string;
  tenantId: string;
  type: 'INDIVIDUAL' | 'COMPANY';
  roles: Array<'CUSTOMER' | 'PATIENT' | 'SUPPLIER' | 'EMPLOYEE'>;
  name: string;
  // Vergi kimliği
  taxNumber?: string;       // VKN (kurum)
  nationalId?: string;      // TCKN (gerçek kişi)
  taxOffice?: string;       // vergi dairesi
  // e-belge için
  eInvoiceMailbox?: string; // e-Fatura mükellefi ise GB etiketi/posta kutusu
  isEInvoiceUser?: boolean;
  // muhasebe bağı
  receivableAccountId?: string; // genelde 120
  payableAccountId?: string;    // genelde 320
  address?: Address;
  contact?: Contact;
}
```

> **Klinik notu:** Hasta = `CUSTOMER + PATIENT` rolü. Hasta cari bakiyesi (kalan tedavi borcu/taksit)
> finans tarafında 120 Alıcılar alt defterinde tutulur; klinik/tedavi verisi (anamnez, plan) ayrı bir
> **klinik modülde** durur ve buraya yalnızca `partyId` ile bağlanır. Finans modülü tıbbi veri tutmaz.

## 5. Yevmiye fişi: JournalEntry + JournalLine

```sql
CREATE TABLE journal_entry (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL,
  period_id    UUID NOT NULL REFERENCES accounting_period(id),
  entry_no     BIGINT,                       -- POSTED olunca atanır, boşluksuz sıralı
  entry_date   DATE NOT NULL,
  description  TEXT,
  status       TEXT NOT NULL DEFAULT 'DRAFT',-- DRAFT | POSTED | REVERSED
  event_id     UUID UNIQUE REFERENCES financial_event(id), -- idempotentlik
  reversed_by  UUID REFERENCES journal_entry(id),
  created_by   UUID NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE journal_line (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id    UUID NOT NULL REFERENCES journal_entry(id) ON DELETE CASCADE,
  account_id  UUID NOT NULL REFERENCES account(id),
  party_id    UUID REFERENCES party(id),     -- alt defter (120/320 satırlarında zorunlu)
  debit       BIGINT NOT NULL DEFAULT 0,     -- kuruş
  credit      BIGINT NOT NULL DEFAULT 0,     -- kuruş
  currency    TEXT NOT NULL DEFAULT 'TRY',
  fx_rate     NUMERIC(18,6),                 -- döviz ise
  debit_try   BIGINT,                        -- TRY karşılığı (raporlama)
  credit_try  BIGINT,
  line_desc   TEXT,
  CONSTRAINT debit_xor_credit CHECK (
    (debit = 0 OR credit = 0)                -- bir satır ya borç ya alacak
  )
);
```

**Değişmez kural (DB seviyesinde doğrula):** Bir `journal_entry` POSTED olurken
`SUM(debit) = SUM(credit)` olmalı (denge). Aksi halde reddet.

## 6. Fatura: Invoice + InvoiceLine

```typescript
interface Invoice {
  id: string;
  tenantId: string;
  direction: 'SALES' | 'PURCHASE';
  // belge türü (entegratör tarafıyla eşleşir, bkz 07)
  documentType: 'E_FATURA' | 'E_ARSIV' | 'E_SMM' | 'E_MUSTAHSIL' | 'INTERNAL';
  partyId: string;
  invoiceNo?: string;        // entegratörden veya iç numaratörden
  issueDate: string;         // vergi tarihi
  currency: string;
  lines: InvoiceLine[];
  // toplamlar (kuruş)
  netTotal: number;          // matrah
  vatTotal: number;          // hesaplanan KDV
  withholdingTotal?: number; // tevkifat/stopaj
  grandTotal: number;        // ödenecek
  status: 'DRAFT' | 'ISSUED' | 'CANCELLED';
  einvoiceUuid?: string;     // entegratör ETTN
}

interface InvoiceLine {
  id: string;
  productOrServiceId?: string;
  description: string;       // 'İmplant tedavisi', 'Panoramik film'...
  quantity: number;
  unitPriceMinor: number;
  discountMinor?: number;
  vatRate: number;           // 0 | 1 | 10 | 20 (sağlık hizmeti genelde 10)
  vatAmountMinor: number;
  withholdingCode?: string;  // tevkifat kodu (varsa)
  netAmountMinor: number;
}
```

## 7. Kasa / Banka / POS

```typescript
interface CashBankAccount {
  id: string;
  tenantId: string;
  kind: 'CASH' | 'BANK' | 'POS';   // 100 Kasa | 102 Banka | 108 POS
  name: string;
  currency: string;
  ledgerAccountId: string;          // bağlı muhasebe hesabı
  iban?: string;
  posProvider?: string;             // POS ise (PAX entegrasyonuyla bağlanır)
  posCommissionRate?: number;       // komisyon oranı
}

interface CashBankTransaction {
  id: string;
  accountId: string;
  direction: 'IN' | 'OUT';
  amountMinor: number;
  valueDate: string;
  partyId?: string;
  description: string;
  paymentId?: string;               // bir tahsilat/ödemeye bağlıysa
}
```

## 8. Tahsilat / Ödeme ve eşleştirme

```typescript
interface Payment {
  id: string;
  tenantId: string;
  direction: 'RECEIPT' | 'DISBURSEMENT'; // tahsilat | ödeme
  partyId: string;
  method: 'CASH' | 'BANK_TRANSFER' | 'POS_CARD' | 'CHEQUE' | 'PROMISSORY_NOTE';
  amountMinor: number;
  date: string;
  cashBankAccountId?: string;            // nakit/banka/POS ise
  instrumentId?: string;                 // çek/senet ise
  allocations: PaymentAllocation[];      // hangi faturalara mahsup
}

interface PaymentAllocation {
  invoiceId: string;
  amountMinor: number;                   // bu faturaya düşen kısım
}
```

> **Taksit (diş kliniğinde çok yaygın):** Bir tedavi planı için `InstallmentPlan` { invoiceId,
> schedule: [{dueDate, amountMinor, status}] } tutulur. Her vade geldiğinde beklenen tahsilat; ödeme
> geldikçe `PaymentAllocation` ile kapatılır. Bu önmuhasebe verisidir; muhasebede 120'nin alt
> defterinde yaşar.

## 9. Çek / Senet

```typescript
interface NegotiableInstrument {
  id: string;
  tenantId: string;
  kind: 'CHEQUE' | 'PROMISSORY_NOTE';      // çek | senet
  position: 'RECEIVED' | 'GIVEN';          // alınan (101/121) | verilen (321/103)
  amountMinor: number;
  dueDate: string;
  drawer?: string;                          // keşideci
  bank?: string;
  serialNo?: string;
  status: 'PORTFOLIO' | 'ENDORSED' | 'AT_BANK_FOR_COLLECTION'
        | 'CLEARED' | 'BOUNCED' | 'RETURNED';
}
```

## 10. Stok / Sarf malzeme

```typescript
interface Product {
  id: string;
  tenantId: string;
  kind: 'CONSUMABLE' | 'TRADE_GOOD' | 'SERVICE'; // sarf | ticari mal | hizmet
  code: string;
  name: string;
  unit: string;                  // adet, ml, kutu
  vatRate: number;
  trackStock: boolean;           // hizmet ise false
  costMethod: 'FIFO' | 'WEIGHTED_AVG';
  inventoryAccountId?: string;   // 150/153
  expenseAccountId?: string;     // tüketimde 740/770
}

interface StockMovement {
  id: string;
  productId: string;
  direction: 'IN' | 'OUT';
  quantity: number;
  unitCostMinor: number;
  reason: 'PURCHASE' | 'CONSUMPTION' | 'ADJUSTMENT' | 'WASTE';
  refId?: string;                // fatura/iş emri
  movedAt: string;
}
```

## 11. Sabit kıymet / Amortisman

```typescript
interface FixedAsset {
  id: string;
  tenantId: string;
  name: string;                  // 'Diş ünitesi', 'Panoramik röntgen'
  acquisitionDate: string;
  acquisitionCostMinor: number;
  usefulLifeYears: number;
  method: 'STRAIGHT_LINE' | 'DECLINING_BALANCE';
  assetAccountId: string;        // 255 Demirbaşlar / 253 Tesis-Makine
  accumDepAccountId: string;     // 257 / 256 Birikmiş Amortisman
  depExpenseAccountId: string;   // 730/740/770
}
```

Sonraki dosya: `02-hesap-plani.md`.
