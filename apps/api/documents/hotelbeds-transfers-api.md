# Hotelbeds Transfers API — Tam Dokümantasyon

> **Kaynak:** https://developer.hotelbeds.com/documentation/transfers/
> **Postman Collection:** https://elements.getpostman.com/redirect?entityId=12951338-b2fd794c-b8ca-4dbd-a8b3-f6e586ba863a&entityType=collection

---

## İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Authentication (Kimlik Doğrulama)](#authentication)
3. [Base URL'ler](#base-urls)
4. [Booking API](#booking-api)
   - [Availability Simple](#availability-simple)
   - [Availability Multi](#availability-multi)
   - [Booking Request (Confirm)](#booking-request)
   - [Booking Detail](#booking-detail)
   - [Booking Cancellation](#booking-cancellation)
   - [Booking List](#booking-list)
5. [Cache API](#cache-api)
   - [Hotels](#cache-hotels)
   - [Countries](#cache-countries)
   - [Destinations](#cache-destinations)
   - [Terminals](#cache-terminals)
   - [Categories](#cache-categories)
   - [Vehicles](#cache-vehicles)
   - [Transfer Types](#cache-transfer-types)
   - [Currencies](#cache-currencies)
   - [Languages](#cache-languages)
6. [Knowledge Base](#knowledge-base)
   - [Pickup Time Mantığı](#pickup-time)
   - [Transfer Between Terminals](#transfer-between-terminals)
   - [Optional Extras](#optional-extras)
   - [Cache Build Stratejileri](#cache-build)
   - [API Errors](#api-errors)
   - [Certification Process](#certification-process)

---

## Genel Bakış

HBX Group Transfers API Suite, transfer hizmetlerini rezerve etmek, içerik indirmek ve statik verilerle çalışmak için kullanılır. API üç ana bölümden oluşur:

- **Booking API** (`transfer-api`): Gerçek zamanlı müsaitlik, rezervasyon onayı ve post-booking işlemleri.
- **Cache API** (`transfer-cache-api`): Statik içerik — rotalar, oteller, terminaller, araç tipleri, dövizler vb.
- **Knowledge Base**: Entegrasyon rehberi, hata kodları, sertifikasyon süreci.

### Kod Tipleri

API şu konum kodu tiplerini destekler:

| Kod Tipi | Açıklama |
|----------|----------|
| `IATA` | Havaalanı standart kodu (önerilen) |
| `ATLAS` | HB özel otel kodları (önerilen) |
| `GPS` | Enlem/boylam koordinatları (adres gerektirir) |
| `PORT` | HB özel liman kodları |
| `STATION` | HB özel istasyon kodları |
| `GIATA` | GIATA otel kodları |

> **Önemli:** XML2 API'sinden farklı olarak bu API'de **shopping cart** konsepti yoktur. Sepet yönetimi client tarafında yapılmalıdır.

---

## Authentication

Her istekte şu HTTP headerları gönderilmelidir:

```
Api-key: {YOUR_API_KEY}
X-Signature: {SIGNATURE}
Accept: application/json
Content-Type: application/json
```

`X-Signature` = SHA256(`Api-key` + `Secret` + `Unix timestamp (saniye)`)

---

## Base URL'ler

| Ortam | Base URL |
|-------|----------|
| TEST | `https://api.test.hotelbeds.com` |
| LIVE | `https://api.hotelbeds.com` |

---

## Booking API

### Availability Simple

Tek yön veya gidiş-dönüş için gerçek zamanlı müsaitlik sorgular.

**Endpoint:**
```
GET /transfer-api/1.0/availability/{language}/from/{fromType}/{fromCode}/to/{toType}/{toCode}/{outboundDate}/{outboundTime}/{adults}/{children}/{infants}
```

**Round-trip için:**
```
GET /transfer-api/1.0/availability/{language}/from/{fromType}/{fromCode}/to/{toType}/{toCode}/{outboundDate}/{outboundTime}/{adults}/{children}/{infants}/return/{returnDate}/{returnTime}
```

**Path Parametreleri:**

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| `language` | String | E | Dil kodu (ör: `en`, `es`) |
| `fromType` | String | E | Kaynak konum tipi: `IATA`, `ATLAS`, `GPS`, `PORT`, `STATION` |
| `fromCode` | String | E | Kaynak konum kodu |
| `toType` | String | E | Hedef konum tipi |
| `toCode` | String | E | Hedef konum kodu |
| `outboundDate` | Date | E | Gidiş tarihi: `YYYY-MM-DD` |
| `outboundTime` | Time | E | Saat: `HH:mm` |
| `adults` | Int | E | Yetişkin sayısı (≥1) |
| `children` | Int | E | Çocuk sayısı |
| `infants` | Int | E | Bebek sayısı |
| `returnDate` | Date | K | Dönüş tarihi (round-trip) |
| `returnTime` | Time | K | Dönüş saati (round-trip) |

**Query Parametreleri:**

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| `ages` | String | K | Çocuk/bebek yaşları, virgülle ayrılmış |

**GPS kullanımı için fromCode formatı:**
```
GPS:{latitude},{longitude}
```
GPS kullanırken `pickupInformation` objesini de confirmation requestinde sağlamanız gerekir.

**Örnek İstek (tek yön, havaalanından otele):**
```
GET /transfer-api/1.0/availability/en/from/IATA/BCN/to/ATLAS/57/2026-06-15/10:30/2/1/0?ages=8
```

**Örnek İstek (gidiş-dönüş):**
```
GET /transfer-api/1.0/availability/en/from/IATA/BCN/to/ATLAS/57/2026-06-15/10:30/2/0/0/return/2026-06-22/16:00
```

**Response Parametreleri:**

| Alan | Tip | Açıklama |
|------|-----|----------|
| `services` | Array | Müsait transfer hizmetleri listesi |
| `services[].id` | Int | Servis ID |
| `services[].direction` | String | `DEPARTURE` veya `ARRIVAL` |
| `services[].transferType` | String | `SHARED`, `PRIVATE`, `SHUTTLE` |
| `services[].vehicle` | Object | Araç bilgisi |
| `services[].vehicle.code` | String | Araç kodu |
| `services[].vehicle.name` | String | Araç adı |
| `services[].category` | Object | Kategori bilgisi |
| `services[].category.code` | String | Kategori kodu |
| `services[].category.name` | String | Kategori adı |
| `services[].adults` | Int | Yetişkin kapasitesi |
| `services[].children` | Int | Çocuk kapasitesi |
| `services[].infants` | Int | Bebek kapasitesi |
| `services[].price` | Object | Fiyat bilgisi |
| `services[].price.totalAmount` | Double | Toplam tutar |
| `services[].price.netAmount` | Double | Net tutar |
| `services[].price.currencyId` | String | Para birimi |
| `services[].rateKey` | String | **Rezervasyon için kullanılacak anahtar** |
| `services[].pickupInformation` | Object | Alış noktası bilgisi |
| `services[].pickupInformation.from` | Object | Kaynak bilgisi |
| `services[].pickupInformation.from.code` | String | Kaynak kodu |
| `services[].pickupInformation.from.type` | String | Kaynak tipi |
| `services[].pickupInformation.to` | Object | Hedef bilgisi |
| `services[].pickupInformation.date` | String | Alış tarihi |
| `services[].pickupInformation.time` | String | Alış saati (null olabilir) |
| `services[].pickupInformation.pickup` | Object | Detaylı alış noktası |
| `services[].pickupInformation.pickup.checkPickup` | Object | Alış saati kontrolü |
| `services[].pickupInformation.pickup.checkPickup.mustCheckPickupTime` | Boolean | True ise müşteri siteyi kontrol etmeli |
| `services[].pickupInformation.pickup.checkPickup.url` | String | Kontrol URL'i |
| `services[].pickupInformation.pickup.checkPickup.hoursBeforeConsulting` | Int | Kaç saat önce kontrol edilmeli |
| `services[].cancellationPolicies` | Array | İptal politikaları |
| `services[].cancellationPolicies[].amount` | Double | İptal ücreti |
| `services[].cancellationPolicies[].from` | String | Bu tarihten itibaren geçerli (ISO 8601) |
| `services[].content` | Object | Statik içerik |
| `services[].content.images` | Array | Görsel listesi |
| `services[].content.transferRemarks` | Array | Önemli notlar |
| `services[].factsheetId` | Int | İçerik kart numarası |
| `services[].extras` | Array | Opsiyonel ekstralar |
| `services[].extras[].code` | String | Extra kodu |
| `services[].extras[].name` | String | Extra adı |
| `services[].extras[].type` | String | Extra tipi |
| `services[].extras[].price` | Double | Extra fiyatı |
| `services[].extras[].minUnits` | Int | Minimum birim |
| `services[].extras[].maxUnits` | Int | Maksimum birim |
| `services[].extras[].required` | Boolean | Zorunlu mu |

> **Önemli:** `rateKey` değeri değişkendir. Konfirmasyondan önce yeni bir availability yapılmalıdır.

---

### Availability Multi

Birden fazla rotayı tek istekte sorgular (en fazla 100 rota). Cache'leme için tasarlanmıştır.

**Endpoint:**
```
POST /transfer-api/1.0/availability/{language}
```

**Request Body:**
```json
{
  "language": "en",
  "transfers": [
    {
      "from": {
        "type": "IATA",
        "code": "BCN"
      },
      "to": {
        "type": "ATLAS",
        "code": "57"
      },
      "outbound": {
        "date": "2026-06-15",
        "time": "10:30"
      },
      "paxes": {
        "adults": 2,
        "children": 0,
        "infants": 0
      }
    },
    {
      "from": {
        "type": "ATLAS",
        "code": "57"
      },
      "to": {
        "type": "IATA",
        "code": "BCN"
      },
      "outbound": {
        "date": "2026-06-22",
        "time": "16:00"
      },
      "paxes": {
        "adults": 2,
        "children": 0,
        "infants": 0
      }
    }
  ]
}
```

**Request Parametreleri:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `language` | String | E | Dil kodu |
| `transfers` | Array | E | Sorgulanacak transfer listesi (max 100) |
| `transfers[].from.type` | String | E | Kaynak tipi |
| `transfers[].from.code` | String | E | Kaynak kodu |
| `transfers[].to.type` | String | E | Hedef tipi |
| `transfers[].to.code` | String | E | Hedef kodu |
| `transfers[].outbound.date` | String | E | Tarih: `YYYY-MM-DD` |
| `transfers[].outbound.time` | String | E | Saat: `HH:mm` |
| `transfers[].paxes.adults` | Int | E | Yetişkin sayısı |
| `transfers[].paxes.children` | Int | K | Çocuk sayısı |
| `transfers[].paxes.infants` | Int | K | Bebek sayısı |

Response formatı Availability Simple ile aynıdır.

---

### Booking Request

Seçilen transferi onaylar (rezervasyon oluşturur).

**Endpoint:**
```
POST /transfer-api/1.0/bookings/{language}
```

**Request Body:**
```json
{
  "language": "en",
  "holder": {
    "name": "John",
    "surname": "Doe",
    "email": "john.doe@example.com",
    "phone": "+16543245812"
  },
  "transfers": [
    {
      "rateKey": "ARRIVAL|IATA|BCN|ATLAS|57|2026-06-15|10:00|...",
      "transferDetails": [
        {
          "type": "FLIGHT",
          "direction": "ARRIVAL",
          "code": "IB1234",
          "companyName": "Iberia"
        }
      ],
      "extras": [
        {
          "units": "1",
          "code": "T05"
        }
      ]
    }
  ],
  "clientReference": "MY-BOOKING-001",
  "welcomeMessage": "Welcome Mr. Doe",
  "remark": "Özel notlar (max 2000 karakter)"
}
```

**Request Parametreleri:**

| Alan | Tip | Zorunlu | Açıklama |
|------|-----|---------|----------|
| `language` | String | E | Dil kodu |
| `holder.name` | String | E | Yolcu adı |
| `holder.surname` | String | E | Yolcu soyadı |
| `holder.email` | String | E | E-posta |
| `holder.phone` | String | E | Telefon |
| `transfers[].rateKey` | String | E | Availability'den alınan rateKey |
| `transfers[].transferDetails` | Array | E | Uçuş/tren/gemi bilgisi |
| `transfers[].transferDetails[].type` | String | E | `FLIGHT`, `CRUISE`, `TRAIN` |
| `transfers[].transferDetails[].direction` | String | E | `ARRIVAL` veya `DEPARTURE` |
| `transfers[].transferDetails[].code` | String | E | Uçuş/sefer numarası (max 7 karakter) |
| `transfers[].transferDetails[].companyName` | String | K | Şirket adı (gemi için önerilir, max 100 karakter) |
| `transfers[].extras` | Array | K | Opsiyonel ekstralar |
| `transfers[].extras[].units` | String | E | Birim sayısı |
| `transfers[].extras[].code` | String | E | Extra kodu |
| `transfers[].pickupInformation` | Object | GPS için E | GPS transferlerinde adres bilgisi |
| `transfers[].pickupInformation.name` | String | K | Otel/konum adı |
| `transfers[].pickupInformation.address` | String | K | Adres |
| `transfers[].pickupInformation.town` | String | K | Şehir |
| `transfers[].pickupInformation.country` | String | K | Ülke |
| `transfers[].pickupInformation.zip` | String | K | Posta kodu |
| `clientReference` | String | K | Müşteri referans numarası |
| `welcomeMessage` | String | K | Karşılama mesajı |
| `remark` | String | K | Not (max 2000 karakter) |

**transferDetails terminal tiplerine göre gereklilik:**

| Terminal Tipi | `type` değeri | `code` | `companyName` |
|---------------|---------------|--------|---------------|
| IATA (Havaalanı) | `FLIGHT` | Zorunlu (max 7) | Opsiyonel |
| STATION (Tren) | `TRAIN` | Zorunlu (max 7) | Opsiyonel (max 100) |
| PORT (Liman) | `CRUISE` | Zorunlu | Kesinlikle önerilir (max 100) |

**Terminal-to-Terminal transferlerde:**

Hem ARRIVAL hem DEPARTURE için iki ayrı `transferDetail` öğesi gereklidir:
```json
"transferDetails": [
  { "type": "CRUISE", "direction": "ARRIVAL", "code": "GRANDIOSA", "companyName": "MSC" },
  { "type": "FLIGHT", "direction": "DEPARTURE", "code": "XR1234", "companyName": null }
]
```

**Response (Booking Confirmation):**

| Alan | Tip | Açıklama |
|------|-----|----------|
| `RS.bookings[0].reference` | String | Rezervasyon referans no. Format: `XXX-XXXXXX` |
| `RS.bookings[0].creationDate` | Date | Oluşturma tarihi `YYYY-MM-DD` |
| `RS.bookings[0].status` | String | `CONFIRMED`, `CANCELLED`, `MODIFIED` |
| `RS.bookings[0].holder` | Object | Ana yolcu bilgisi |
| `RS.bookings[0].transfers` | Array | Onaylanan transferler |
| `RS.bookings[0].transfers[].id` | Int | Transfer servis ID |
| `RS.bookings[0].transfers[].direction` | String | `DEPARTURE` veya `ARRIVAL` |
| `RS.bookings[0].transfers[].status` | String | `CONFIRMED` veya `CANCELLED` |
| `RS.bookings[0].transfers[].transferType` | String | `SHARED`, `PRIVATE` |
| `RS.bookings[0].transfers[].vehicle` | Object | Araç bilgisi |
| `RS.bookings[0].transfers[].pickupInformation` | Object | Alış bilgisi |
| `RS.bookings[0].transfers[].pickupInformation.date` | String | Alış tarihi |
| `RS.bookings[0].transfers[].pickupInformation.time` | String | Alış saati |
| `RS.bookings[0].transfers[].pickupInformation.pickup.checkPickup` | Object | Alış saati kontrolü |
| `RS.bookings[0].transfers[].price.totalAmount` | Double | Toplam fiyat |
| `RS.bookings[0].transfers[].price.currencyId` | String | Para birimi |
| `RS.bookings[0].transfers[].cancellationPolicies` | Array | İptal politikaları |
| `RS.bookings[0].transfers[].content.transferRemarks` | Array | Önemli notlar |
| `RS.bookings[0].transfers[].extras` | Array | **(YENİ)** Onaylanan ekstralar |
| `RS.bookings[0].transfers[].extras[].amount` | Number | Extra toplam ücreti |
| `RS.bookings[0].transfers[].extras[].type` | String | Extra açıklaması (ör: "Pushchair") |
| `RS.bookings[0].transfers[].extras[].code` | String | Extra API kodu |
| `RS.bookings[0].transfers[].extras[].units` | Number | Birim sayısı |
| `RS.bookings[0].transfers[].links` | Array | İlgili aksiyonlar (iptal linki vb.) |
| `RS.bookings[0].totalAmount` | String | Toplam tutar |
| `RS.bookings[0].currency` | String | Para birimi |
| `RS.bookings[0].supplier.name` | String | Tedarikçi adı |
| `RS.bookings[0].invoiceCompany.code` | String | Fatura şirket kodu |

> **Voucher:** Konfirmasyon response'undaki `links` dizisinden voucher URL'i alınabilir.

---

### Booking Detail

Rezervasyon referans numarasıyla rezervasyon detaylarını getirir.

**Endpoint:**
```
GET /transfer-api/1.0/bookings/{language}/reference/{booking_reference}
```

**Path Parametreleri:**

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| `language` | String | E | Dil kodu |
| `booking_reference` | String | E | Rezervasyon referansı. Format: `XXX-XXXXXX` |

**Örnek:**
```
GET /transfer-api/1.0/bookings/en/reference/HBD-123456
```

Response formatı Booking Request response'u ile aynıdır. İptal edilmiş rezervasyonlarda yolcu adları silinir (sadece yolcu tipleri kalır).

---

### Booking Cancellation

Rezervasyon veya tek bir transfer servisini iptal eder.

**Endpoint:**
```
DELETE /transfer-api/1.0/bookings/{language}/reference/{booking_reference}
```

**Kısmi iptal (sadece bir servis):**
```
DELETE /transfer-api/1.0/bookings/{language}/reference/{booking_reference}/transfer/{transfer_id}
```

**Path Parametreleri:**

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| `language` | String | E | Dil kodu |
| `booking_reference` | String | E | Rezervasyon referansı |
| `transfer_id` | Int | K | Kısmi iptal için transfer ID |

**Response:**

| Alan | Tip | Açıklama |
|------|-----|----------|
| `RS.bookings[0].reference` | String | Rezervasyon referansı |
| `RS.bookings[0].status` | String | `CANCELLED` |
| `RS.bookings[0].cancellationAmount` | Double | Uygulanan iptal ücreti |

---

### Booking List

Belirtilen tarih aralığındaki rezervasyonların listesini getirir.

**Endpoint:**
```
GET /transfer-api/1.0/bookings/{language}?fromDate={fromDate}&toDate={toDate}&dateType={dateType}&offset={offset}&limit={limit}
```

**Örnek:**
```
GET /transfer-api/1.0/bookings/en?fromDate=2026-01-01&toDate=2026-01-31&dateType=FROM_DATE&offset=1&limit=100
```

**Query Parametreleri:**

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| `language` | String | E | Dil kodu |
| `fromDate` | Date | E | Başlangıç tarihi |
| `toDate` | Date | E | Bitiş tarihi |
| `dateType` | String | E | Filtre tipi (ör: `FROM_DATE`, `CREATION_DATE`) |
| `offset` | String | H | Sayfalama başlangıç pozisyonu |
| `limit` | String | H | Sayfa başına sonuç sayısı |

> **Not:** Maksimum tarih aralığı 31 gündür.

**Response:** Booking Detail'e kıyasla daha özet bilgi döner (tam içerik için Booking Detail kullanın).

| Alan | Tip | Açıklama |
|------|-----|----------|
| `RS.bookings[].reference` | String | Rezervasyon referansı |
| `RS.bookings[].creationDate` | Date | Oluşturma tarihi |
| `RS.bookings[].status` | String | `CONFIRMED`, `CANCELLED`, `MODIFIED` |
| `RS.bookings[].holder` | Object | Ana yolcu |
| `RS.bookings[].transfers[].status` | String | Transfer durumu |
| `RS.bookings[].transfers[].transferType` | String | Transfer tipi |
| `RS.bookings[].transfers[].pickupInformation` | Object | Alış bilgisi |
| `RS.bookings[].transfers[].price` | Object | Fiyat bilgisi |
| `RS.bookings[].transfers[].cancellationPolicies` | Array | İptal politikaları |

---

## Cache API

> **Base URL:** `https://api.hotelbeds.com/transfer-cache-api/1.0/`
> **Test URL:** `https://api.test.hotelbeds.com/transfer-cache-api/1.0/`

**Genel Notlar:**
- Tüm istekler GET'tir.
- `fields` ve `language` parametreleri zorunludur.
- `fields=ALL` tüm alanları döndürür.
- Sayfalama için `offset` ve `limit` kullanılır.
- Maksimum limit: 1000 kayıt/sorgu.
- Maksimum filtre: 10 öğe/istek.
- Toplam kayıt sayısı response header'ında `X-Total-Count` ile döner.

---

### Cache Hotels

Otel portföyünü getirir.

**Endpoint:**
```
GET /transfer-cache-api/1.0/hotels
```

**Query Parametreleri:**

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| `fields` | String | E | Virgülle ayrılmış alanlar veya `ALL` |
| `language` | String | E | ISO 639-1 dil kodu (ör: `en`) |
| `countryCodes` | String | H | Virgülle ayrılmış ISO 3166 ülke kodları |
| `destinationCodes` | String | H | Virgülle ayrılmış ATLAS destinasyon kodları |
| `codes` | String | H | Virgülle ayrılmış ATLAS otel kodları |
| `giataCodes` | String | H | Virgülle ayrılmış GIATA otel kodları |
| `offset` | int | H | Sayfalama başlangıcı |
| `limit` | int | H | Sayfa başına kayıt |

**Örnek:**
```
GET /transfer-cache-api/1.0/hotels?fields=ALL&language=en&destinationCodes=BCN
```

**Response Parametreleri:**

| Alan | Tip | Açıklama |
|------|-----|----------|
| `code` | String | ATLAS otel kodu |
| `name` | String | Otel adı |
| `category` | String | Otel kategorisi |
| `description` | String | Otel açıklaması |
| `countryCode` | String | ISO 3166 ülke kodu |
| `destinationCode` | String | ATLAS destinasyon kodu |
| `city` | String | Şehir adı |
| `coordinates.latitude` | Float | Enlem |
| `coordinates.longitude` | Float | Boylam |
| `address` | String | Otel adresi |
| `postalCode` | String | Posta kodu |
| `chainCode` | String | Zincir kodu |

---

### Cache Countries

Ülke portföyünü getirir.

**Endpoint:**
```
GET /transfer-cache-api/1.0/locations/countries
```

**Query Parametreleri:**

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| `fields` | String | E | Alanlar veya `ALL` |
| `language` | String | E | ISO 639-1 dil kodu |
| `codes` | String | H | Virgülle ayrılmış ISO 3166 ülke kodları |
| `offset` | int | H | Sayfalama başlangıcı |
| `limit` | int | H | Sayfa başına kayıt |

**Örnek:**
```
GET /transfer-cache-api/1.0/locations/countries?fields=ALL&language=en&codes=ES,US
```

**Response:**
```json
[
  { "code": "ES", "name": "Spain" },
  { "code": "US", "name": "United States" }
]
```

---

### Cache Destinations

Destinasyon portföyünü getirir.

**Endpoint:**
```
GET /transfer-cache-api/1.0/locations/destinations
```

**Query Parametreleri:**

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| `fields` | String | E | Alanlar veya `ALL` |
| `language` | String | E | ISO 639-1 dil kodu |
| `countryCode` | String | H | ISO 3166 ülke kodu |
| `codes` | String | H | Destinasyon kodları |
| `offset` | int | H | Sayfalama başlangıcı |
| `limit` | int | H | Sayfa başına kayıt |

**Örnek:**
```
GET /transfer-cache-api/1.0/locations/destinations?fields=ALL&language=es&countryCodes=ES&codes=MAD,BCN,PMI
```

**Response:**
```json
[
  { "code": "BCN", "name": "Barcelona", "countryCode": "ES", "language": "ENG" },
  { "code": "MAD", "name": "Madrid", "countryCode": "ES", "language": "ENG" }
]
```

---

### Cache Terminals

Terminal portföyünü getirir (havaalanları, limanlar, tren istasyonları).

**Endpoint:**
```
GET /transfer-cache-api/1.0/locations/terminals
```

**Query Parametreleri:**

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| `fields` | String | E | Alanlar veya `ALL` |
| `language` | String | E | ISO 639-1 dil kodu |
| `codes` | String | H | Terminal kodları |
| `offset` | int | H | Sayfalama başlangıcı |
| `limit` | int | H | Sayfa başına kayıt |

**Örnek:**
```
GET /transfer-cache-api/1.0/locations/terminals?fields=ALL&language=en&codes=BCN,MAD
```

**Response Parametreleri:**

| Alan | Tip | Açıklama |
|------|-----|----------|
| `code` | String | Terminal kodu |
| `content.type` | String | Terminal tipi (`A`=Havaalanı, `P`=Liman, `T`=Tren) |
| `content.description` | String | Terminal adı/açıklaması |
| `countryCode` | String | Ülke kodu |
| `coordinates.latitude` | Float | Enlem |
| `coordinates.longitude` | Float | Boylam |
| `language` | String | Dil kodu |

**Örnek Response:**
```json
{
  "code": "BCN",
  "content": { "type": "A", "description": "Barcelona, Aeropuerto El Prat" },
  "countryCode": "ES",
  "coordinates": { "latitude": 41.297475, "longitude": 2.083318 },
  "language": "CAS"
}
```

---

### Cache Categories

Transfer kategorisi portföyünü getirir (Economy, Standard, Premium, Luxury vb.).

**Endpoint:**
```
GET /transfer-cache-api/1.0/masters/categories
```

**Query Parametreleri:**

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| `fields` | String | E | Alanlar veya `ALL` |
| `language` | String | E | ISO 639-1 dil kodu |
| `codes` | String | H | Kategori kodları |
| `offset` | int | H | Sayfalama |
| `limit` | int | H | Limit |

**Örnek:**
```
GET /transfer-cache-api/1.0/masters/categories?fields=ALL&language=en
```

**Response Parametreleri:**

| Alan | Tip | Açıklama |
|------|-----|----------|
| `masterTransferTypeCode` | String | Bağlı transfer tipi kodu |
| `masterCategoryCode` | String | Kategori kodu |
| `name` | String | Kategori adı |
| `description` | String | Açıklama |

**Mevcut Kategoriler:**

| Kod | Ad |
|-----|----|
| `ECO` | Economy |
| `ECON` | Economy |
| `EPL` | Employee |
| `EXPRS` | Express |
| `LXR` | Luxury |
| `PRM` | Premium |
| `PRMEWT` | Premium Extended Wait Time |
| `SPCL` | Special |
| `STND` | Standard |
| `STNDEWT` | Standard Extended Wait Time |

---

### Cache Vehicles

Araç portföyünü getirir.

**Endpoint:**
```
GET /transfer-cache-api/1.0/masters/vehicles
```

**Query Parametreleri:** (Categories ile aynı yapı)

**Response Parametreleri:**

| Alan | Tip | Açıklama |
|------|-----|----------|
| `masterTransferTypeCode` | String | Transfer tipi kodu |
| `masterCategoryCode` | String | Kategori kodu |
| `masterVehicleCode` | String | Araç kodu |
| `name` | String | Araç adı |
| `description` | String | Açıklama |

---

### Cache Transfer Types

Transfer tiplerini getirir.

**Endpoint:**
```
GET /transfer-cache-api/1.0/masters/transferTypes
```

**Query Parametreleri:** (Categories ile aynı yapı)

**Response:**

| Kod | Ad | Açıklama |
|-----|----|----------|
| `PRVT` | Private | Sürücülü özel araç |
| `SHRD` | Shared - Shuttle | Diğer yolcularla paylaşımlı |
| `SHTL` | Shuttle | Önceden belirlenmiş frekans ve rotalar |

---

### Cache Currencies

Para birimi portföyünü getirir.

**Endpoint:**
```
GET /transfer-cache-api/1.0/currencies
```

**Query Parametreleri:**

| Parametre | Tip | Zorunlu | Açıklama |
|-----------|-----|---------|----------|
| `fields` | String | E | Alanlar veya `ALL` |
| `language` | String | E | Dil kodu |
| `codes` | String | H | ISO 4217 döviz kodları |
| `offset` | int | H | Sayfalama |
| `limit` | int | H | Limit |

**Örnek:**
```
GET /transfer-cache-api/1.0/currencies?fields=ALL&language=en
```

**Response:**
```json
[
  { "code": "EUR", "name": "Euro" },
  { "code": "GBP", "name": "United Kingdom Pound" },
  { "code": "USD", "name": "US Dollar" }
]
```

---

### Cache Languages

Dil portföyünü getirir.

**Endpoint:**
```
GET /transfer-cache-api/1.0/languages
```

**Query Parametreleri:** (Currencies ile aynı yapı, `codes` yerine dil kodları)

---

## Knowledge Base

### Pickup Time Mantığı

Alış saati hesabı **yönüne ve terminal tipine** göre değişir.

**Genel Kurallar:**

1. **Airport/Train Station → Hotel/Port/Train/Airport:**
   Uçuş/tren **varış saati** sağlanmalıdır. API pickup time'ı **değiştirmez**, aynı saati döndürür.

2. **Hotel → Airport/Train Station:**
   Uçuş/tren **kalkış saati** sağlanmalıdır. Pickup time **otomatik hesaplanır** (yolcunun zamanında ulaşması için geriye doğru).

3. **Hotel → Port:**
   İstenen pickup saati sağlanır. API hesaplama **yapmaz**.

4. **Port → Hotel/Airport:**
   Geminin varış saati sağlanır. Actual pickup time **istendiği gibi döner**.

**Tam Tablo:**

| fromType | toType | Sağlanacak Saat | Dönen Pickup Time |
|----------|--------|-----------------|-------------------|
| ATLAS | IATA | Uçuş Kalkışı | Hesaplanır |
| ATLAS | TRAIN | Tren Kalkışı | Hesaplanır |
| ATLAS | PORT | İstenen Alış Saati | İstenen gibi |
| GPS | IATA | Uçuş Kalkışı | Hesaplanır |
| GPS | TRAIN | Tren Kalkışı | Hesaplanır |
| GPS | PORT | İstenen Alış Saati | İstenen gibi |
| IATA | ATLAS | Uçuş Varışı | Varış saati |
| IATA | GPS | Uçuş Varışı | Varış saati |
| IATA | TRAIN | Uçuş Varışı | Varış saati |
| IATA | PORT | Uçuş Varışı | Varış saati |
| TRAIN | ATLAS | Tren Varışı | Varış saati |
| TRAIN | GPS | Tren Varışı | Varış saati |
| TRAIN | IATA | Tren Varışı | Varış saati |
| PORT | ATLAS | Gemi Varışı | İstenen gibi |
| PORT | GPS | Gemi Varışı | İstenen gibi |
| PORT | IATA | Gemi Varışı | İstenen gibi |

**Desteklenmeyen Rotalar:**
- IATA → IATA (havaalanından havaalanına)
- PORT → PORT
- STATION → STATION

**Pickup Time Null Durumu:**

```
IF services[x].pickupInformation.time == null:
  IF services[x].pickupInformation.pickup.checkPickup.mustCheckPickupTime == true:
    → Müşteriye şunu göster:
      "The pickup time will be provided at {url} {hoursBeforeConsulting} hours before departure."
    → Bu bilgi voucherda da gösterilmeli.
  ELSE:
    → transferRemarks içinde alternati açıklama bulunur (telefon numarası vb.)
```

---

### Transfer Between Terminals

Terminal tipinden terminal tipine transferler kural dışıdır:
- ❌ IATA → IATA
- ❌ PORT → PORT
- ❌ STATION → STATION

Terminal-to-terminal transferlerde `transferDetails` içinde iki öğe gönderilir: biri `ARRIVAL` (gelen taraf), diğeri `DEPARTURE` (giden taraf).

**PORT → IATA Örneği:**
```json
{
  "rateKey": "DEPARTURE|PORT|278|IATA|MIA|...",
  "transferDetails": [
    { "type": "CRUISE", "direction": "ARRIVAL", "code": "TEST11", "companyName": null },
    { "type": "FLIGHT", "direction": "DEPARTURE", "code": "XR1234", "companyName": null }
  ]
}
```

**IATA → PORT Örneği:**
```json
{
  "rateKey": "ARRIVAL|IATA|MIA|PORT|278|...",
  "transferDetails": [
    { "type": "FLIGHT", "direction": "ARRIVAL", "code": "XR1234", "companyName": null },
    { "type": "CRUISE", "direction": "DEPARTURE", "code": "TEST11", "companyName": null }
  ]
}
```

---

### Optional Extras

Konfirmasyonda opsiyonel ekstralar eklenebilir. Tüm mevcut kodlar: https://github.com/llucvives-svg/Transfer-Optional-Extras.git

**One Way - ATLAS koda:**
```json
{
  "language": "en",
  "holder": { "name": "John", "surname": "Doe", "email": "...", "phone": "..." },
  "transfers": [
    {
      "rateKey": "ARRIVAL|IATA|BCN|ATLAS|57|...",
      "transferDetails": [
        { "type": "FLIGHT", "direction": "ARRIVAL", "code": "XR1234", "companyName": "TBC" }
      ],
      "extras": [
        { "units": "1", "code": "T05" }
      ]
    }
  ],
  "clientReference": "REF-001"
}
```

**Round Trip:**
```json
{
  "transfers": [
    {
      "rateKey": "ARRIVAL|PORT|277|ATLAS|189097|...",
      "transferDetails": [{ "type": "CRUISE", "direction": "ARRIVAL", "code": "GRANDIOSA", "companyName": "MSC" }],
      "extras": [{ "units": "1", "code": "T04" }]
    },
    {
      "rateKey": "DEPARTURE|ATLAS|189097|PORT|277|...",
      "transferDetails": [{ "type": "CRUISE", "direction": "DEPARTURE", "code": "GRANDIOSA", "companyName": "MSC" }],
      "extras": [{ "units": "1", "code": "T04" }]
    }
  ]
}
```

**GPS Hedefli (pickupInformation zorunlu):**
```json
{
  "transfers": [
    {
      "rateKey": "ARRIVAL|STATION|930|ATLAS~GPS|1009~41.39347,2.16286|...",
      "transferDetails": [{ "type": "TRAIN", "direction": "ARRIVAL", "code": "1222", "companyName": "AVE" }],
      "pickupInformation": {
        "name": "Hotel Name",
        "address": "Street name",
        "town": "Barcelona",
        "country": "Spain",
        "zip": "08001"
      },
      "extras": [{ "units": "1", "code": "T12" }]
    }
  ]
}
```

---

### Cache Build Stratejileri

Cache API aylık güncellenmelidir. **Mutlaka cache'lenmesi gereken veriler:**

- Language mapping kodları
- Destination mapping (ülkeler → destinasyonlar)
- Currency mapping
- IATA havaalanı kodları
- Atlas otel kodları (kullanılıyorsa)
- GPS verileri (kullanılıyorsa)
- Rota kombinasyonları

**Strateji 1 — Minimum Cache (Canlı Müsaitlik):**
1. İlgilenilen destinasyonlardaki otel ve terminal kodlarını depola.
2. Müşteri seçim yapar → canlı availability çek → sonuçları göster.
3. Onayla.

**Strateji 2 — Tam Rota Cache + Canlı Müsaitlik:**
1. Otel ve terminal kodlarını depola.
2. Tüm rota kombinasyonlarını çekerek DB'ye kaydet.
3. Müşteri seçim yapar → canlı availability (güncel rateKey için).
4. Onayla.

**Strateji 3 — Tam Cache (Her Şey Cache'li):**
1. Otel/terminal kodları.
2. Tüm rota kombinasyonlarını çek.
3. Her 100 rota için Availability Multi isteği yap → içeriği cache'le.
4. Müşteri arama yapar → cache'den göster.
5. Müşteri seçim yapar → **tek bir canlı availability** (geçerli rateKey ve güncel veri için).
6. Onayla.

**Pratik Cache Akışı:**
```
1. GET /transfer-cache-api/1.0/locations/destinations?destinationCodes=PMI&offset=1&limit=1000
   → Tüm kayıtlar için X-Total-Count header'ına bak

2. Elde edilen rota kodlarını max 100'lük gruplar halinde:
   POST /transfer-api/1.0/availability/{language}
   → İçerikleri cache'le

3. Müşteri seçim yaptığında → canlı availability → onay
```

---

### API Errors

**HTTP Durum Kodları:**

| Kod | Açıklama |
|-----|----------|
| 200 OK | Başarılı |
| 201 CREATED | Kaynak başarıyla oluşturuldu |
| 400 BAD REQUEST | Geçersiz istek. Zorunlu alanları ve format kontrol edin |
| 401 UNAUTHORIZED | Geçersiz veya süresi dolmuş auth token |
| 403 FORBIDDEN | Erişim reddedildi (hesap pasif veya kota aşıldı) |
| 404 NOT FOUND | Kaynak bulunamadı |
| 406 NOT ACCEPTABLE | Kabul edilebilir format yok |
| 409 CONFLICT | Kaynakla çakışma (iptal edilemeyen rezervasyon vb.) |
| 415 UNSUPPORTED MEDIA TYPE | Content-Type desteklenmiyor (`application/json` kullanın) |
| 500 INTERNAL SERVER ERROR | Beklenmeyen hata, tekrar deneyin |
| 502 BAD GATEWAY | Upstream server geçersiz yanıt |
| 503 SERVICE UNAVAILABLE | Servis geçici olarak kullanılamıyor |
| 596 SERVICE NOT FOUND | Geçersiz endpoint URL |

**Genel Hata Kodları:**

| Kod | HTTP | Açıklama |
|-----|------|----------|
| E_REQUEST_INVALID | 400 | Geçersiz JSON/XML |
| E_REQUEST_PASTDATE | 400 | Tarih geçmişte |
| E_REQUEST_ATLEASTONEADULT | 400 | En az bir yetişkin gerekli |
| E_REQUEST_INVALIDTERMINALCODE | 400 | Geçersiz terminal kodu |
| E_REQUEST_GPSCOORDINATES | 400 | Geçersiz GPS koordinatları |
| E_REQUEST_ATLASCODE | 400 | Geçersiz ATLAS kodu |
| E_REQUEST_INVALIDDATEFORMAT | 400 | Geçersiz tarih formatı (beklenen: YYYY-MM-DDThh:mm:ss) |
| E_REQUEST_ADULTSDONTMATCH | 400 | Yetişkin sayısı paxes ile uyuşmuyor |
| E_REQUEST_CHILDRENDONTMATCH | 400 | Çocuk sayısı uyuşmuyor |
| E_REQUEST_AGESDONTMATCH | 400 | Çocuk/bebek sayısı yaşlarla uyuşmuyor |
| E_REQUEST_SAMEFROMTO | 400 | Kaynak ve hedef aynı olamaz |

**Konfirmasyon Hata Kodları:**

| Kod | HTTP | Açıklama |
|-----|------|----------|
| E_CONFIRMATION_DUPLICATEDSERVICES | 500 | Tekrarlanan servisler |
| E_CONFIRMATION_WRONGLANGUAGE | 500 | Dil tutarsızlığı |
| E_CONFIRMATION_PAXESDONOTMATCH | 500 | Yolcu yaşları uyuşmuyor |
| E_CONFIRMATION_INVALIDRATEKEY | 500 | RateKey değişti, yeniden availability çekin |
| E_CONFIRMATION_NOTRESPONDING | 500 | Sistem yanıt vermiyor, tekrar deneyin |
| E_CONFIRMATION_EMPTYTRANSFERS | 400 | Onaylanacak transfer yok |
| E_CONFIRMATION_INSUFFICIENTSEATS | 400 | Yolcular için yeterli kapasite yok |
| E_CONFIRMATION_RATEKEYHASH | 400 | RateKey değiştirilmiş |
| E_CONFIRMATION_RATEKEYCREDENTIALS | 400 | Geçersiz rateKey kimlik bilgileri |

**Booking Hata Kodları:**

| Kod | HTTP | Açıklama |
|-----|------|----------|
| E_BOOKING_NOTFOUND | 400 | Rezervasyon bulunamadı |
| E_BOOKING_GETBOOKINGERROR | 500 | Rezervasyon alınamadı |
| E_BOOKING_CANCELLATIONERROR | 409 | İptal hatası |

---

### Certification Process

Live ortama geçmeden önce sertifikasyon gereklidir. İletişim: **integrations.btb@hbxgroup.com**

**Sertifikasyon Öncesi Gerekenler:**
- Entegrasyon beklentisi ve iş modeli
- Doğrudan entegrasyon mu, IT developer/platform üzerinden mi
- Uygulanan operasyonların listesi
- Geliştirme bilgileri (URL, kullanıcı, şifre)
- Hotelbeds ticari anlaşması (Live credentials için zorunlu)
- Dolu checklist: https://github.com/llucvives-svg/TransferCheckList.git

**Sertifikasyon Test Adımları:**

| Test | Açıklama |
|------|----------|
| TEST 1 | Sadece DEPARTURE — Hotel Sistina (Atlas: 5643) → Rome Ciampino (IATA: CIA). `mustCheckPickupTime=true` olan servis seç, onayla, voucher üret, iptal et. |
| TEST 2 | Round Trip — Barcelona Universal (Atlas: 57) → Port of Barcelona (PORT: 277). IN + OUT isteği, onayla, voucher üret, iptal et. |
| TEST 3 | Sadece ARRIVAL — Hotel Hilton Barcelona (Atlas: 651) → Sants terminal (STATION: 930). |
| TEST 4 | Extras ile — Hotel Barcelona Universal (Atlas: 57) → El Prat (IATA: BCN). En az bir opsiyonel extra ile onayla. |

**Voucherde Zorunlu Bilgiler:**
- Rezervasyon referansı
- Onay tarihi
- Servis tarihi/saati
- Ana yolcu adı
- Yolcu dağılımı
- Nereden/Nereye
- Alış tarihi ve saati
- Servis adı (araç + kategori)
- Servis açıklaması
- Uçuş/tren/gemi bilgisi
- Alış açıklaması (CONTRACT remark)
- `mustCheckPickupTime=true` ise: checkpickup.com bilgisi
- Opsiyonel extras (varsa)
- Acil durum telefonu
- Supplier adı

---

## Hızlı Başlangıç Akışı

```
1. [Cache API] Destinasyon/otel/terminal kodlarını çek ve depola.
   GET /transfer-cache-api/1.0/locations/destinations
   GET /transfer-cache-api/1.0/locations/terminals
   GET /transfer-cache-api/1.0/hotels

2. [Booking API] Müsaitlik sorgula.
   GET /transfer-api/1.0/availability/en/from/IATA/BCN/to/ATLAS/57/2026-06-15/10:30/2/0/0

3. [Booking API] Müşteriyi seçer → hemen önce taze availability çek (geçerli rateKey için).

4. [Booking API] Rezervasyonu onayla.
   POST /transfer-api/1.0/bookings/en
   Body: { holder, transfers[{rateKey, transferDetails}], clientReference }

5. [Booking API] Referansı sakla, voucher linkini müşteriye sun.

6. [Booking API] Gerekirse iptal et.
   DELETE /transfer-api/1.0/bookings/en/reference/{reference}
```

---

## Önemli Notlar

- `rateKey` sorgular arasında değişebilir. Konfirmasyondan hemen önce yeni availability çekilmelidir.
- Cache API maksimum 10 filtre öğesi ve 1000 sonuç/sorgu destekler.
- Availability Multi maksimum 100 rota kabul eder.
- Booking List maksimum 31 günlük tarih aralığı destekler.
- GPS kullanıldığında konfirmasyonda `pickupInformation` gönderilmelidir.
- `mustCheckPickupTime=true` ise bu bilgi hem onay öncesinde müşteriye gösterilmeli hem vouchera eklenmeli.
- `transferRemarks` (özellikle `CONTRACT` tipi) her zaman müşteriye gösterilmeli ve vouchera dahil edilmelidir.
- Terminal-to-terminal transferlerde aynı tipteki terminallerden-terminale (IATA→IATA vb.) destek yoktur.
