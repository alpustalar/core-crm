# 02 — Hesap Planı (TDHP + Klinik)

Türkiye'de muhasebe **Tek Düzen Hesap Planı (TDHP)** üzerine kuruludur. Hesaplar 7 ana sınıfa ayrılır.
Aşağıda klinik bir işletmenin fiilen kullanacağı hesaplar listelenir. Sistem, tenant açılışında bu
şablonu kopyalayıp özelleştirilebilir bir `account` ağacı üretmeli.

## 1. Hesap sınıfları

| Sınıf | Aralık | Tür | Normal bakiye |
|-------|--------|-----|---------------|
| 1 Dönen Varlıklar | 100–199 | ASSET | Borç (DEBIT) |
| 2 Duran Varlıklar | 200–299 | ASSET | Borç |
| 3 Kısa Vadeli Yab. Kaynaklar | 300–399 | LIABILITY | Alacak (CREDIT) |
| 4 Uzun Vadeli Yab. Kaynaklar | 400–499 | LIABILITY | Alacak |
| 5 Öz Kaynaklar | 500–599 | EQUITY | Alacak |
| 6 Gelir Tablosu Hesapları | 600–699 | REVENUE/EXPENSE | değişir |
| 7 Maliyet Hesapları | 700–799 | EXPENSE | Borç |

## 2. Klinik için fiilen kullanılan hesaplar

### Dönen varlıklar (1)
| Kod | Ad | Not |
|-----|-----|-----|
| 100 | Kasa | Nakit. Para birimi başına alt hesap (100.01 TL, 100.02 USD) |
| 101 | Alınan Çekler | Portföydeki müşteri çekleri |
| 102 | Bankalar | Banka hesapları (102.01 X Bankası…) |
| 103 | Verilen Çekler ve Ödeme Emirleri (-) | |
| 108 | Diğer Hazır Değerler | **POS'tan gelen, henüz bankaya geçmemiş tutar** (kredi kartı slip) |
| 120 | Alıcılar | **Hasta/müşteri cari** — alt defter `party` zorunlu |
| 121 | Alacak Senetleri | Alınan senetler |
| 126 | Verilen Depozito ve Teminatlar | Kira depozitosu vb. |
| 127 | Diğer Ticari Alacaklar | POS blokeli alacak, anlaşmalı kurum alacağı |
| 153 | Ticari Mallar | (Satılan ürün varsa) |
| 150 | İlk Madde ve Malzeme | **Sarf malzeme stoğu** |
| 159 | Verilen Sipariş Avansları | |
| 191 | İndirilecek KDV | Alışlardaki KDV |
| 193 | Peşin Ödenen Vergiler ve Fonlar | Geçici vergi, stopaj alacağı |
| 196 | Personel Avansları | |

### Duran varlıklar (2)
| Kod | Ad | Not |
|-----|-----|-----|
| 253 | Tesis, Makine ve Cihazlar | Diş üniteleri, röntgen, otoklav |
| 254 | Taşıtlar | |
| 255 | Demirbaşlar | Mobilya, bilgisayar, küçük cihaz |
| 256 | Birikmiş Amortismanlar (-) | 253/254 için |
| 257 | Birikmiş Amortismanlar (-) | 255 için |
| 260 | Haklar | Yazılım lisansları, marka |
| 268 | Birikmiş Amortismanlar (-) | maddi olmayan için |

### Kısa vadeli yabancı kaynaklar (3)
| Kod | Ad | Not |
|-----|-----|-----|
| 320 | Satıcılar | **Tedarikçi cari** — alt defter `party` zorunlu |
| 321 | Borç Senetleri | Verilen senetler |
| 329 | Diğer Ticari Borçlar | |
| 335 | Personele Borçlar | Net ücret borcu |
| 336 | Diğer Çeşitli Borçlar | |
| 360 | Ödenecek Vergi ve Fonlar | Stopaj (GV/KV), damga |
| 361 | Ödenecek Sosyal Güvenlik Kesintileri | SGK işçi+işveren |
| 391 | Hesaplanan KDV | Satışlardaki KDV |
| 360.xx | Ödenecek KDV (Devir/391-191 sonrası) | beyan sonucu (genelde 360 altı veya 191/391 mahsubu) |
| 340 | Alınan Sipariş Avansları | Hastadan alınan ön ödeme/avans |

### Öz kaynaklar (5)
| Kod | Ad |
|-----|-----|
| 500 | Sermaye |
| 570 | Geçmiş Yıllar Kârları |
| 580 | Geçmiş Yıllar Zararları (-) |
| 590 | Dönem Net Kârı |
| 591 | Dönem Net Zararı (-) |

> **Muayenehane (serbest meslek) notu:** Şahıs işletmesi/serbest meslekte sermaye yerine genelde
> **131/231 Ortaklardan Alacaklar / 331/431 Ortaklara Borçlar** ve işletme sahibinin çekişleri
> (özel/işletme ayrımı) kullanılır. Serbest meslek defterinde hasılat ve gider esas alınır; ERP yine
> aynı çift taraflı altyapıyı kullanır, sadece raporlama (serbest meslek kazanç defteri) farklıdır.

### Gelir tablosu (6)
| Kod | Ad | Not |
|-----|-----|-----|
| 600 | Yurtiçi Satışlar | **Tedavi/hizmet geliri** (alt: 600.01 muayene, 600.02 implant, 600.03 ortodonti…) |
| 601 | Yurtdışı Satışlar | **Sağlık turizmi hastaları** (KDV %0/istisna) |
| 602 | Diğer Gelirler | |
| 610 | Satıştan İadeler (-) | |
| 611 | Satış İskontoları (-) | |
| 642 | Faiz Gelirleri | |
| 653 | Komisyon Giderleri | **POS / banka komisyonu** |
| 656 | Kambiyo Zararları | |
| 646/656 | Kambiyo Kâr/Zarar | döviz işlemleri |
| 689 | Diğer Olağandışı Gider ve Zararlar | yuvarlama, ceza |
| 690 | Dönem Kârı veya Zararı | dönem sonu toplama |

### Maliyet/gider hesapları (7)
TDHP'de 7/A (fonksiyon esaslı) veya 7/B (çeşit esaslı) seçilir. Klinikte yaygın 7/A:

| Kod | Ad | Klinikte ne girer |
|-----|-----|-------------------|
| 740 | Hizmet Üretim Maliyeti | Doğrudan tedavi maliyeti: sarf tüketimi, hekim hakedişi, dış laboratuvar |
| 750 | Araştırma Geliştirme Giderleri | |
| 760 | Pazarlama, Satış ve Dağıtım Giderleri | Reklam, web, danışman |
| 770 | Genel Yönetim Giderleri | Kira, idari personel, elektrik/su, muhasebe, sigorta, atık bertarafı |
| 730/731 | Genel Üretim Giderleri | (kullanılırsa) |
| 7xx | Amortisman ve Tükenme Payları | ilgili gider hesabına yansıtılır |

> **Yansıtma hesapları (7/A):** 740/760/770'ın karşısında 741/761/771 yansıtma hesapları ile gelir
> tablosuna (6xx) aktarım yapılır. Dönem kapamada bu yansıtmalar 690'a taşınır.

## 3. Klinik özelinde önerilen alt hesap kırılımı

Raporlamayı anlamlı kılmak için gelir ve maliyeti **tedavi türü** bazında kır:

```
600 Yurtiçi Satışlar
 ├─ 600.01 Muayene / Kontrol
 ├─ 600.02 Dolgu / Restoratif
 ├─ 600.03 Endodonti (kanal)
 ├─ 600.04 Cerrahi / İmplant
 ├─ 600.05 Protez
 ├─ 600.06 Ortodonti
 └─ 600.07 Estetik / Beyazlatma

740 Hizmet Üretim Maliyeti
 ├─ 740.01 Sarf Malzeme Tüketimi
 ├─ 740.02 Dış Laboratuvar (protez/zirkonyum)
 ├─ 740.03 Hekim Hakedişi (hakediş usulü çalışılıyorsa)
 └─ 740.04 Sterilizasyon / Atık
```

Bu kırılım sayesinde "implantın brüt marjı", "ortodontinin maliyeti" gibi yönetim raporları üretilebilir.

## 4. Hesap karakterini koda gömme

Posting motoru, bir satırı borç mu alacak mı yazacağını `normal_side` üzerinden değil, **kuralın
kendisinden** alır (bkz 05). Ama mizan/rapor yönü için `type` ve `normal_side` gerekir:

```typescript
const ACCOUNT_NATURE: Record<string, { type: AccountType; normalSide: 'DEBIT' | 'CREDIT' }> = {
  '100': { type: 'ASSET',     normalSide: 'DEBIT'  },
  '120': { type: 'ASSET',     normalSide: 'DEBIT'  },
  '191': { type: 'ASSET',     normalSide: 'DEBIT'  },
  '320': { type: 'LIABILITY', normalSide: 'CREDIT' },
  '391': { type: 'LIABILITY', normalSide: 'CREDIT' },
  '360': { type: 'LIABILITY', normalSide: 'CREDIT' },
  '600': { type: 'REVENUE',   normalSide: 'CREDIT' },
  '740': { type: 'EXPENSE',   normalSide: 'DEBIT'  },
  '770': { type: 'EXPENSE',   normalSide: 'DEBIT'  },
  // ...
};
```

Sonraki dosya: `03-onmuhasebe.md`.
