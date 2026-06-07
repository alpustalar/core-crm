# Hotelbeds API Suite — Derlenmiş Dökümantasyon

> Kaynak: https://developer.hotelbeds.com/documentation/
> Derleme tarihi: 2026-06-04

---

## İçindekiler

1. [Getting Started — Başlangıç](#getting-started)
2. [Hotels — Booking API](#hotels-booking-api)
   - [Workflow / Booking Akışı](#booking-workflow)
   - [Rate Comments & CheckRate](#rate-comments-checkrate)
3. [Hotels — Content API](#hotels-content-api)
   - [Nasıl Kullanılır](#content-api-kullanim)
4. [Hotels — Cache API](#hotels-cache-api)
5. [Activities API](#activities-api)
6. [Transfers API](#transfers-api)
7. [API Referans Linkleri](#api-referans)

---

## 1. Getting Started — Başlangıç {#getting-started}

**Kaynak:** https://developer.hotelbeds.com/documentation/getting-started/

### Üç Adımda Başlangıç

#### Adım 1: API Key Kayıt

https://developer.hotelbeds.com/register adresinden kayıt olarak API Key & Secret alınır.
Kayıt sonrası üç API suite için birer key verilir: **Hotel, Activities, Transfers**.

#### Adım 2: Kimlik Doğrulama (Authentication)

Her request'te iki header gönderilmesi zorunludur:
- `Api-key`: API anahtarınız
- `X-Signature`: SHA256 hash (hex formatında) = `SHA256(apiKey + secret + timestamp_seconds)`

**Bash ile örnek:**

```bash
apiKey="yourApiKey"
secret="yourSecret"
curl -i \
  -X GET \
  -H 'Accept:application/json' \
  -H 'Api-key:'$apiKey'' \
  -H 'X-Signature:'$(echo -n ${apiKey}${secret}$(date +%s)|sha256sum|awk '{ print $1}')'' \
  https://api.test.hotelbeds.com/hotel-api/1.0/status
```

#### Adım 3: Test Ortamında Deneme

- **Test endpoint:** `https://api.test.hotelbeds.com`
- Production ile aynı sunucular; gerçek rezervasyon veya kredi kartı işlemi yapılmaz.
- Postman koleksiyonu: environment'taki `{{Api-key}}` ve `{{secret}}` değişkenlerini doldurun; X-Signature otomatik hesaplanır.

> **Not:** Kayıt sonrası alınan API key'ler yalnızca evaluation ortamı içindir ve günlük **50 request** kotasıyla sınırlıdır. Kota aşımında `403` hatası döner.

---

## 2. Hotels — Booking API {#hotels-booking-api}

**Kaynak:** https://developer.hotelbeds.com/documentation/hotels/booking-api/

Booking API; hotel arama, rezervasyon onaylama, rezervasyon listesi, iptal ve değişiklik işlemlerini kapsar.
Content API ile birlikte çalışır (görsel, açıklama, tesis bilgileri için).

### Üç Ana Metod

| Metod | Endpoint | Açıklama |
|---|---|---|
| Availability | `POST /hotels` | Oda müsaitliği sorgulama |
| CheckRate | `POST /checkrates` | RECHECK tipli rate'ler için güncel fiyat/müsaitlik |
| Bookings | `POST/GET/PUT/DELETE /bookings` | Rezervasyon oluştur, listele, detay, değiştir, iptal et |

**Fiyatlar finaldir** — supplement ve discount'lar dahil, ek hesaplama gerekmez.

---

### Booking Workflow {#booking-workflow}

**Kaynak:** https://developer.hotelbeds.com/documentation/hotels/booking-api/workflow/

#### Genel Akış

```
Availability Request (/hotels)
        ↓
  rateType == RECHECK?
     ↓ Yes              ↓ No
CheckRate Request    Book directly
  (/checkrates)
        ↓
  Booking Request (/bookings)
```

#### 1. Availability Request — Örnek

```json
{
  "stay": {
    "checkIn": "2021-06-15",
    "checkOut": "2021-06-16"
  },
  "occupancies": [
    {
      "rooms": 1,
      "adults": 2,
      "children": 0
    }
  ],
  "hotels": {
    "hotel": [3424, 168]
  }
}
```

#### 2. Availability Response — Özet

Response; hotel listesi + her otel için room/rate kombinasyonları içerir.
Her rate'in kritik alanları:

| Alan | Açıklama |
|---|---|
| `rateKey` | Bir rate'in benzersiz ID'si; booking'te kullanılır |
| `rateType` | `RECHECK` veya `BOOKABLE` |
| `net` | Net fiyat (USD) |
| `boardCode` | `BB`, `RO`, `HB` vb. |
| `cancellationPolicies` | İptal koşulları ve tarihler |

#### 3. CheckRate Request (RECHECK tipli rate'ler için)

```bash
curl --location --request POST 'https://api.test.hotelbeds.com/hotel-api/1.0/checkrates' \
  --header 'Api-key: yourApiKey' \
  --header 'X-Signature: yourXSignature' \
  --header 'Accept: application/json' \
  --header 'Accept-Encoding: gzip' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "rooms": [
      {
        "rateKey": "20210615|20210616|W|59|3424|DBL.ST|ID_B2B_26|BB||1~2~0||N@05~~2608a~-321744190~N~~~..."
      }
    ]
  }'
```

CheckRate sonrasında `rateType` `BOOKABLE` olarak döner.

#### 4. Booking Request

```bash
curl --location --request POST 'https://api.test.hotelbeds.com/hotel-api/1.0/bookings' \
  --header 'Api-key: yourApiKey' \
  --header 'X-Signature: yourXSignature' \
  --header 'Accept: application/json' \
  --header 'Accept-Encoding: gzip' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "holder": {
      "name": "Booking",
      "surname": "Test"
    },
    "rooms": [{
      "rateKey": "20210615|20210616|W|59|3424|DBL.ST|...",
      "paxes": [
        {"roomId": 1, "type": "AD", "name": "First Adult Name", "surname": "Surname"},
        {"roomId": 1, "type": "AD", "name": "Second Adult Name", "surname": "Surname"}
      ]
    }],
    "clientReference": "IntegrationAgency",
    "remark": "Booking remarks here.",
    "tolerance": 2.00
  }'
```

---

### Rate Comments & CheckRate {#rate-comments-checkrate}

**Kaynak:** https://developer.hotelbeds.com/documentation/hotels/booking-api/workflow/

- Availability response'unda bazı rate'ler `rateCommentsId` içerir (örn. `"256|24524|3"`).
- Bu ID ile Content API'deki `ratecommentdetails` operasyonu çağrılarak açıklama alınabilir.
- CheckRate response'unda `rateComments` alanı daha zengin içerik döner (issues, facilities, contract comments birleşimi).

**rateComments içeriği şu kaynaklardan gelir:**
- `<issues>` — COVID, kapalı havuz vb. uyarılar
- `<facilities>` (voucher=true olanlar) — check-in saati, park, depozit vb.
- Contract comments (ratecommentsid ile alınabilir)

> `AvailabilityRS`'ten tam rateComment açıklaması alınamaz; bunun için CheckRate kullanın.

---

## 3. Hotels — Content API {#hotels-content-api}

**Kaynak:** https://developer.hotelbeds.com/documentation/hotels/content-api/

Otel portföyüne ait statik bilgileri sağlar: görseller, açıklamalar, kategoriler, tesisler, vb.

### Nasıl Kullanılır {#content-api-kullanim}

**Kaynak:** https://developer.hotelbeds.com/documentation/hotels/content-api/how-use-content-api/

#### Temel İlkeler

- Content API **gerçek zamanlı (real-time)** kullanılmamalıdır — bu durumda kimlik bilgileri bloke edilebilir.
- Önerilen yaklaşım: **periyodik batch process** → yerel veritabanına kayıt → gerektiğinde DB'den okuma.

#### İlk Yükleme (Initial Load)

HBX Group portföyü ~**173.000 otel** içerir.
`from` / `to` parametreleriyle sayfalı çekim yapılır (max 1000 otel/request):

```
GET https://api.test.hotelbeds.com/hotel-content-api/1.0/hotels?fields=all&language=ENG&from=1&to=1000
GET https://api.test.hotelbeds.com/hotel-content-api/1.0/hotels?fields=all&language=ENG&from=1001&to=2000
...
```

**Tam ilk yükleme için gereken toplam request sayısı (1 dil):**

| Operasyon | Request Sayısı |
|---|---|
| Hotels | 173 |
| Destinations | 5 |
| Rooms | 3 |
| Chains | 2 |
| Terminals | 2 |
| RateComments (opsiyonel ama önerilen) | 100 |
| Diğerleri (Countries, Boards, vb.) | ~11 |
| **Toplam** | **~297** |

4 QPS limitle ~75 saniyede tamamlanır (veri işleme süresi hariç).
Her dil için bu süreç tekrarlanmalıdır.

#### Günlük Güncelleme (Differential Update)

```
GET https://api.test.hotelbeds.com/hotel-content-api/1.0/hotels?fields=all&language=ENG&from=1&to=1000&lastUpdateTime=2024-01-15
```

`lastUpdateTime` parametresiyle yalnızca değişen oteller alınır (~3.000 otel/gün = 3 request).

---

## 4. Hotels — Cache API {#hotels-cache-api}

**Kaynak:** https://developer.hotelbeds.com/documentation/hotels/cache-api/

Tüm fiyat ve müsaitliklere dosya formatında toplu erişim sağlar.
Alt bölümler:

- **Workflows** — Cache API kullanım akışları
- **Operations** — Mevcut operasyonlar
- **File Specification** — Dosya formatı detayları
- **Internal Inventory Process** — Valuation, Tax Breakdown, Combinable Offers, Frees, Supplements & Discounts hesaplama
- **External Inventory Process**
- **Best Practices / FAQ / Conventions**

**API Reference:** https://developer.hotelbeds.com/documentation/hotels/cache-api/api-reference/

---

## 5. Activities API {#activities-api}

**Kaynak:** https://developer.hotelbeds.com/documentation/activities/

### Booking API

- **Overview:** https://developer.hotelbeds.com/documentation/activities/booking-api/overview/
- **Availability:** Aktivite arama — Search Filters, Availability operasyonları
- **Booking / Post-booking:** Booking Confirm, Preconfirm & Reconfirm, Booking List, Booking Details, Cancel
- **Details / CheckRate:** Detail Simple and Full Request

### Content API

- **Overview:** https://developer.hotelbeds.com/documentation/activities/content-api/overview/
- Operasyonlar: Countries, Destinations, Currencies, Languages, Segments
- Content Simple & Multi Request

### Cache API

- **Overview:** https://developer.hotelbeds.com/documentation/activities/cache-api/overview/
- Portfolio endpoint

### Knowledge Base

- Knowledge Base, Certification Process, Activities Questions
- ACTRED (Activities Content Redesign)
- Cancellation Policies, Booking Flow, Cache Build
- API Errors, Voucher Generation

---

## 6. Transfers API {#transfers-api}

**Kaynak:** https://developer.hotelbeds.com/documentation/transfers/

### Booking API

- **Overview:** https://developer.hotelbeds.com/documentation/transfers/booking-api/overview/
- **Availability:**
  - Availability Simple: https://developer.hotelbeds.com/documentation/transfers/booking-api/search-availability/availability-simple/
  - Availability Multi: https://developer.hotelbeds.com/documentation/transfers/booking-api/search-availability/availability-multi/
- **Booking / Post-booking:** Booking Request, Booking Detail, Booking Cancellation, Booking List

### Cache API (Content)

- **Locations:** Hotels, Countries, Destinations, Terminals
- **Masters:** Categories, Vehicles, Transfer Types, Currencies, Languages
- **API Reference:** https://developer.hotelbeds.com/documentation/transfers/content-api/api-reference/

### Knowledge Base

- API Errors, Certification Process
- Pickup Time Possibilities
- Cache Build, Transfer Between Terminals
- New Optional Extras Confirmations RQ Examples

---

## 7. API Referans Linkleri {#api-referans}

| API | Referans URL |
|---|---|
| Hotels Booking API | https://developer.hotelbeds.com/documentation/hotels/booking-api/api-reference/ |
| Hotels Content API | https://developer.hotelbeds.com/documentation/hotels/content-api/api-reference/ |
| Hotels Cache API | https://developer.hotelbeds.com/documentation/hotels/cache-api/api-reference/ |
| Hotels CDS API | https://developer.hotelbeds.com/documentation/hotels/cds-api/cds-api-reference/ |
| Activities Booking API | https://developer.hotelbeds.com/documentation/activities/booking-api/api-reference/ |
| Activities Content API | https://developer.hotelbeds.com/documentation/activities/content-api/api-reference/ |
| Activities Cache API | https://developer.hotelbeds.com/documentation/activities/cache-api/api-reference/ |
| Transfers Booking API | https://developer.hotelbeds.com/documentation/transfers/booking-api/ |
| Transfers Cache API | https://developer.hotelbeds.com/documentation/transfers/content-api/api-reference/ |

### Test & Prod Endpoint'ler

| Ortam | Base URL |
|---|---|
| Test | `https://api.test.hotelbeds.com` |
| Production | `https://api.hotelbeds.com` |

### Ortak Request Headers

```
Api-key: <your_api_key>
X-Signature: <SHA256(apiKey + secret + unix_timestamp)>
Accept: application/json
Accept-Encoding: gzip
Content-Type: application/json
```

---

*Derleme: Claude (Cowork) — Kaynak: developer.hotelbeds.com*
