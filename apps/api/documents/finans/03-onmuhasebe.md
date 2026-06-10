# 03 — Önmuhasebe Modülleri

Önmuhasebe = işletmenin günlük operasyonel finans katmanı. Kullanıcı burada muhasebe hesabı görmez;
"fatura kes, tahsilat al, stok gir" der. **Her aksiyon bir `FinancialEvent` üretir** ve muhasebeleştirme
katmanına gider (bkz 05). Bu dosya her modülün girdi/çıktısını ve ürettiği olayı tanımlar.

---

## 1. Cari Hesaplar (Parties)

**Amaç:** Hasta/müşteri, tedarikçi ve personelin bakiyesini, hareketlerini ve borç/alacak durumunu tutmak.

**Girdi:** Party kaydı (kimlik, vergi no/TCKN, iletişim, e-fatura mükellefiyeti), açılış bakiyesi.

**Çıktı / raporlar:**
- Cari ekstre (hesap hareket dökümü)
- Yaşlandırma (aging): 0-30 / 31-60 / 61-90 / 90+ gün vadesi geçmiş alacaklar
- Bakiye listesi (borçlu/alacaklı cariler)

**Olay üretmez** (sadece master data); bakiye, ilgili fatura/tahsilat olaylarından türetilir.

**Klinik notu:** Hasta carisi 120'nin alt defteridir. Hastanın tedavi planı/taksiti önmuhasebede
yaşar; muhasebeye sadece tahakkuk eden (faturalanan) tutar girer. Faturalanmamış tedavi planı bir
muhasebe kaydı değildir (yalnızca beklenen gelir / teklif).

---

## 2. Kasa / Banka / POS

**Amaç:** Nakit, banka ve POS hareketlerini izlemek, bakiye ve mutabakat.

**Girdi:**
- Kasa giriş/çıkış (nakit tahsilat, kasadan ödeme, kasa-banka transfer)
- Banka hareketi (havale/EFT, masraf, faiz) — ideal olarak banka ekstresi import (MT940/CSV)
- POS tahsilatı (kredi kartı) — **PAX/POS entegrasyonundan otomatik beslenebilir**

**Ürettiği olaylar:** `PAYMENT_RECEIVED`, `PAYMENT_MADE` (yöntem CASH/BANK/POS), kasa-banka virmanı için
`MANUAL_JOURNAL` veya özel transfer olayı.

**POS özel akışı (önemli):**
```
Kredi kartı çekildi (PAX)
  → 108 Diğer Hazır Değerler / POS borç  (slip tutarı)
Banka komisyonu kesip parayı yatırdı
  → 102 Bankalar borç + 653 Komisyon Gideri borç / 108 POS alacak
```
POS komisyonu ve valör (paranın bankaya geçme tarihi) ayrı izlenmeli; çoğu klinikte "bugün çekilen,
2 gün sonra yatan" akışı vardır.

**Çıktı / raporlar:** Kasa defteri, banka ekstre/mutabakat, günlük nakit durumu (cash position),
POS tahsilat–banka yatış eşleştirme raporu.

---

## 3. Faturalama (Invoicing)

**Amaç:** Satış (hizmet/tedavi) ve alış faturalarını oluşturmak, KDV/tevkifat hesaplamak, e-belge
tarafına (entegratör) hazır veri üretmek.

**Satış faturası girdi:** partyId, tarih, kalemler (hizmet/ürün, miktar, birim fiyat, KDV oranı),
iskonto, belge türü (e-Fatura/e-Arşiv/e-SMM — tenant tipine ve alıcıya göre otomatik seçilir, bkz 07).

**Hesaplama:**
```typescript
function computeLine(line: InvoiceLineInput): InvoiceLine {
  const gross = line.quantity * line.unitPriceMinor;
  const net = gross - (line.discountMinor ?? 0);
  const vat = Math.round(net * line.vatRate / 100);   // sağlık hizmeti genelde %10
  return { ...line, netAmountMinor: net, vatAmountMinor: vat };
}
// Fatura toplamı: netTotal = Σ net ; vatTotal = Σ vat ; grandTotal = netTotal + vatTotal - withholding
```

**Ürettiği olay:** `SALES_INVOICE_ISSUED` / `PURCHASE_INVOICE_RECEIVED`, iptalde `..._CANCELLED`.

**Çıktı:** Fatura listesi, KDV özeti, satış raporları (tedavi türü bazında, hekim bazında), entegratöre
gönderim kuyruğu.

**Klinik özel durumlar:**
- **Sağlık turizmi (yabancı hasta):** KDV %0 / istisna → belge türü ve KDV ayrı; gelir 601'e.
- **Muayenehane → e-SMM:** Serbest meslek makbuzu; üzerinde **stopaj (%20 GV)** ve KDV görünür.
- **Anlaşmalı kurum/sigorta:** Hasta yerine kuruma faturalama; cari = kurum.

---

## 4. Stok / Sarf Malzeme

**Amaç:** Sarf malzeme giriş/çıkışını, maliyeti ve tüketimi izlemek.

**Girdi:** Alış faturasından stok girişi (miktar, birim maliyet), tüketim (tedavi/iş emrinde kullanım),
sayım/düzeltme, fire/zayi.

**Ürettiği olaylar:** `STOCK_IN`, `STOCK_OUT` (tüketim → 740 maliyet), `STOCK_OUT` (fire → 689/770).

**Maliyet yöntemi:** FIFO veya ağırlıklı ortalama (`Product.costMethod`). Tüketim maliyeti bu yöntemle
hesaplanır.

**Çıktı:** Stok kartı/hareket, stok değer raporu, kritik stok (minimum seviye) uyarısı, dönem tüketim
raporu. Diş kliniğinde implant/greft gibi yüksek değerli, lot/seri ve son kullanma tarihi (SKT) izlenen
kalemler için **lot & SKT takibi** önemlidir.

---

## 5. Tahsilat / Ödeme ve Taksit

**Amaç:** Faturalara karşılık para tahsil/ödeme ve faturalarla eşleştirme (mahsup).

**Girdi:** Payment (yön, yöntem, tutar, kasa/banka), allocations (hangi faturaya ne kadar).

**Taksit planı (dental'de kritik):**
```typescript
interface InstallmentPlan {
  invoiceId: string;
  schedule: Array<{ no: number; dueDate: string; amountMinor: number;
                    paidMinor: number; status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' }>;
}
```
Vade geldikçe beklenen tahsilat raporlanır; ödeme geldikçe ilgili taksit kapatılır. Plan önmuhasebe
verisidir; muhasebe yalnızca **faturalanmış tutarı** (120) ve gelen **tahsilatı** (100/102/108) görür.

**Ürettiği olay:** `PAYMENT_RECEIVED` / `PAYMENT_MADE`.

**Çıktı:** Tahsilat raporu, vadesi gelen/geçen taksitler, tahsilat performansı.

---

## 6. Çek / Senet

**Amaç:** Alınan/verilen çek ve senetlerin yaşam döngüsü.

**Durum geçişleri:**
```
RECEIVED → PORTFOLIO → (ENDORSED ciro | AT_BANK_FOR_COLLECTION tahsile) → CLEARED | BOUNCED
GIVEN    → (ödenmeyi bekler) → CLEARED | RETURNED
```

**Ürettiği olaylar:** `INSTRUMENT_RECEIVED` (101/121'e), `INSTRUMENT_GIVEN` (103/321'e),
`INSTRUMENT_CLEARED` (tahsil/ödeme → 102/100).

**Çıktı:** Çek/senet portföyü, vade takvimi, banka tahsile verilenler, karşılıksız (bounced) takibi.

---

## 7. Gider / Masraf (faturasız veya basit gider)

**Amaç:** Fatura akışına girmeyen doğrudan giderleri (küçük masraf, fiş, dekont) kaydetmek.

**Girdi:** Gider türü, tutar, KDV (varsa indirilebilir), ödeme yöntemi.

**Ürettiği olay:** `EXPENSE_RECORDED`. (Posting: ilgili 770/760/740 borç + 191 KDV / 100/102 alacak.)

**Çıktı:** Gider raporu (tür ve dönem bazında), gider–bütçe karşılaştırması.

---

## Ortak prensip

Her önmuhasebe aksiyonu, kullanıcının gördüğü dilde ("tahsilat aldım") gerçekleşir; arka planda
**deterministik bir `FinancialEvent`** doğar. Muhasebe fişi bu olaydan üretilir — kullanıcı muhasebe
bilmek zorunda değildir. Bu, "önmuhasebeyi herkes yapsın, muhasebe otomatik oluşsun" hedefinin temelidir.

Sonraki dosya: `04-muhasebe-defterler.md`.
