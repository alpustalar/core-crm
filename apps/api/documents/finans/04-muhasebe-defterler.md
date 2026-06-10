# 04 — Muhasebe: Defterler, Mizan, Mali Tablolar

Bu katman fişleri (journal entries) tutar ve resmî defter/raporları üretir. Hedef tam çift taraflı
muhasebe; resmî beyanname ve e-defter tarafı entegratöre devredilir ama **veriyi ERP üretir**.

## 1. Yevmiye Defteri (Journal)

Tüm fişlerin tarih sırasıyla kronolojik kaydı. Bir fiş:

```
Fiş No: 2026/000123        Tarih: 09.06.2026        Açıklama: Hasta X implant faturası
──────────────────────────────────────────────────────────────────────────────
Hesap                                    Borç           Alacak
120.01 Alıcılar / Hasta X            16.500,00
  600.04 Yurtiçi Satışlar/İmplant                      15.000,00
  391    Hesaplanan KDV (%10)                           1.500,00
──────────────────────────────────────────────────────────────────────────────
                                     16.500,00          16.500,00   ✓ denge
```

**Kurallar:**
- POSTED olurken `Σborç = Σalacak` (DB-level check).
- `entry_no` boşluksuz ve sıralı (tenant+dönem bazında). Taslakta numara yok; POSTED'da atanır.
- Onaylı fiş değişmez; düzeltme = storno (ters kayıt) + yeni fiş.

## 2. Defter-i Kebir (General Ledger)

Hesap bazında borç/alacak/bakiye dökümü. Yevmiyenin hesap eksenine göre yeniden gruplanmış hali.

```sql
-- Bir hesabın defter-i kebir hareketi
SELECT je.entry_date, je.entry_no, jl.line_desc,
       jl.debit, jl.credit,
       SUM(jl.debit - jl.credit) OVER (ORDER BY je.entry_date, je.entry_no) AS running_balance
FROM journal_line jl
JOIN journal_entry je ON je.id = jl.entry_id
WHERE jl.account_id = $1 AND je.status = 'POSTED'
  AND je.period_id = $2
ORDER BY je.entry_date, je.entry_no;
```

## 3. Mizan (Trial Balance)

Belirli tarih aralığında her hesabın **borç toplamı, alacak toplamı ve bakiyesi**. Muhasebenin sağlık
kontrolü: tüm hesapların borç toplamı = alacak toplamı olmalı.

```sql
SELECT a.code, a.name,
       SUM(jl.debit)  AS total_debit,
       SUM(jl.credit) AS total_credit,
       SUM(jl.debit - jl.credit) AS balance
FROM journal_line jl
JOIN journal_entry je ON je.id = jl.entry_id AND je.status = 'POSTED'
JOIN account a ON a.id = jl.account_id
WHERE je.tenant_id = $1 AND je.entry_date BETWEEN $2 AND $3
GROUP BY a.code, a.name
ORDER BY a.code;
```

Mizan türleri: kesin mizan (dönem sonu), geçici mizan (ara dönem), genel geçici mizan.

## 4. Mali Tablolar

### Bilanço (Balance Sheet)
Aktif (1+2) = Pasif (3+4+5). Hesap sınıflarının bakiyelerinden üretilir. Dönem kârı 590/591'e taşınır.

### Gelir Tablosu (Income Statement)
6xx hesaplarından: Brüt satış (600/601) − iadeler/iskontolar (610/611) = Net satış; − Satışların
maliyeti (740 yansıtması) = Brüt kâr; − faaliyet giderleri (760/770) = Faaliyet kârı; ± diğer
gelir/gider (642/653/689…) = Dönem kârı/zararı.

### Klinik yönetim raporları (mali tablo dışı, çok değerli)
- Tedavi türü bazında gelir & brüt marj (600.xx vs 740.xx)
- Hekim bazında üretilen ciro / hakediş
- Hasta tahsilat performansı, açık taksit riski
- Aylık nakit akışı (cash flow) projeksiyonu

## 5. Muhasebe Dönemi ve Kapanış

```typescript
type PeriodStatus = 'OPEN' | 'LOCKED' | 'CLOSED';
```

**Dönem sonu kapanış adımları (yıl sonu):**
1. Tüm bekleyen olayların fişe dönüştüğünü doğrula (kuyrukta `FinancialEvent` kalmasın).
2. Amortisman, kur değerleme, gider yansıtma (7→6) fişlerini üret.
3. Gelir/gider hesaplarını **690 Dönem Kârı/Zararı**'na devret.
4. 690 → 590/591; gerekirse 591/590 → 570/580.
5. Mizan dengesini doğrula, dönemi `CLOSED` yap.
6. Açılış fişi ile yeni dönemi başlat (bilanço hesapları devreder, gelir/gider sıfırlanır).

**Kilit kuralı:** `LOCKED`/`CLOSED` döneme yeni fiş atılamaz; yalnızca açık döneme storno ile düzeltilir.

## 6. e-Defter (yasal)

Yevmiye ve defter-i kebir, GİB'e **e-Defter (XBRL-GL)** olarak verilir. Bunu genelde **entegratör**
(Logo vb.) üretir/beratlar; ERP'nin görevi temiz, dengeli fiş verisini sağlamaktır. Entegratör modülü
e-Defter export'unu bir `FilingExportPort` arkasında sunar (bkz 07). Kapalıysa: fiş/defter raporları
PDF/Excel olarak dışa aktarılır, mali müşavir kendi sisteminde işler.

## 7. Bütünlük kontrolleri (test edilmeli)

- Her POSTED fiş dengeli (`Σborç=Σcredit`).
- `120`/`320` satırlarında `party_id` dolu (alt defter zorunluluğu).
- Mizan genel toplamı borç=alacak.
- Cari ekstre bakiyesi = defter-i kebir 120/320 alt hesap bakiyesi.
- Banka modülü bakiyesi = 102 defter-i kebir bakiyesi (mutabakat).
- Her `FinancialEvent` için en fazla 1 POSTED fiş (idempotentlik).

Sonraki dosya: `05-muhasebelestirme-kurallari.md`.
