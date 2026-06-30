# AI Asistanı Araç Genişletme Yol Haritası — Randevu + Sağlık Turizmi (Otel & Transfer)

> **Amaç:** Klinik-başına AI sohbet asistanının (WhatsApp / Telegram / Instagram) randevu yeteneklerini güçlendirmek ve **sağlık turizmi** akışını (klinik çevresindeki otellerde rezervasyon + havalimanı/otel transferi) sohbet üzerinden uçtan uca yürütebilmesini sağlamak.
>
> **Bağlam:** AI araçları `AiToolExecutor` içinde `CommandBus`/`QueryBus`'a bağlanır (cross-module kuralı: yalnız hedef modülün query/command sınıfı dispatch edilir). Tanımlar `ai-tool.definitions.ts`, yürütme `ai-tool-executor.service.ts`.
>
> **Durum (2026-06-26):** HotelBeds otel + transfer **domain handler'ları yazılmış** (search/book/cancel mevcut). Eksik olan iki şey: (1) bu handler'ların AI asistanına araç olarak bağlanması, (2) klinik-başına otel/transfer konfigürasyonu (hangi oteller, hangi havalimanı).

---

## İçindekiler

1. [Mevcut Durum Envanteri](#1-mevcut-durum-envanteri)
2. [BÖLÜM A — Randevu Senaryoları](#bölüm-a--randevu-senaryoları)
3. [BÖLÜM B — Sağlık Turizmi: Otel & Transfer](#bölüm-b--sağlık-turizmi-otel--transfer)
4. [Öncelik Sırası](#4-öncelik-sırası)

---

## 1. Mevcut Durum Envanteri

### Randevu AI araçları (mevcut)
`get_clinic_services`, `list_providers`, `get_provider_details`, `check_provider_availability`, `book_appointment`, `cancel_appointment`, `reschedule_appointment`, `get_patient_appointments`, `get_patient_packages`, `register_lead`, `handoff_to_human`.

### Otel/Transfer handler'ları (mevcut — AI'a BAĞLI DEĞİL)
Modül: `src/modules/crm/health-tourism/`

| Alan | Command | Query |
|---|---|---|
| **Hotel** | `book-hotel`, `cancel-hotel-booking`, `sync-hotel-content` | `search-hotels`, `get-hotel-bookings`, `get-hotel-booking-by-id` |
| **Transfer** | `book-transfer`, `cancel-transfer-booking` | `search-transfer-availability`, `get-transfer-bookings`, `get-transfer-booking-by-id` |

HotelBeds HTTP servisleri, repository'ler, entity'ler, exception'lar, env anahtarları (`HOTELBEDS_HOTEL_API_KEY/SECRET`, `HOTELBEDS_TRANSFER_API_KEY/SECRET`) hazır.

### Tespit edilen altyapı boşlukları
- **Klinik-başına sağlık-turizmi config'i yok.** `destinationCode`, yakın `hotelCodes[]`, havalimanı `IATA` kodu, klinik GPS/pickup adresi hiçbir yerde tutulmuyor → AI neyi arayacağını bilemez.
- **`AiToolContext` `leadId` ve `email` taşımıyor.** Otel/transfer rezervasyonu `patientId` **veya** `leadId`'ye bağlanabilir; transfer `holderEmail` **zorunlu**. Misafir (hasta kaydı olmayan) yazışmalarda lead'e bağlama ve e-posta toplama gerekecek.

---

## BÖLÜM A — Randevu Senaryoları

### A1. `suggest_appointment_slots` — Akıllı boş slot önerisi ⭐ (yüksek öncelik)
**Sorun:** Şu an AI, `check_provider_availability`'den dönen `occupiedSlots` JSON'unu kendi işleyip boş slot hesaplıyor → LLM aritmetiği = yanlış saat/çakışma riski.
**Çözüm:** Handler hazır boş slotları dönsün.
- **Girdi:** `providerId`, `date` (YYYY-MM-DD), `durationMinutes`
- **Çıktı:** `["14:00","14:30","15:00"]` (klinik yerel saatinde, sunmaya hazır)
- **Uygulama:** Yeni query `GetProviderOpenSlotsQuery` — çalışma saatleri − dolu slotlar farkını `durationMinutes` adımıyla hesaplar. `get-provider-availability` mantığı yeniden kullanılır.

### A2. Booking'te timezone'u handler'a taşı ⭐ (yüksek öncelik, A1 ile birlikte)
**Sorun:** AI'ya "İstanbul 15:00 → UTC ISO" çevirisi bırakılıyor (`...T12:00:00.000Z`), kırılgan.
**Çözüm:** `book_appointment` / `reschedule_appointment` **yerel tarih+saat** alsın (`date: "2026-06-25"`, `time: "15:00"`); handler `TimeZone` VO (`src/domain/value-objects/timezone.vo.ts`) ile klinik saat dilimine göre UTC'ye çevirsin. LLM'den zaman dilimi matematiği istemeyi tamamen eler.
- Not: A1 çıktısı da yerel saat döndüğünden A2 ile uçtan uca tutarlı olur.

### A3. `confirm_appointment` — Hatırlatmaya "EVET/geliyorum" yanıtı
- `confirm-appointment` **komutu zaten var**, sadece AI aracı + executor metodu eklenecek (PENDING→CONFIRMED).
- Sahiplik: `loadOwnedAppointment` pattern'i (yalnız yazışmadaki hastanın randevusu).

### A4. (Backlog) `find_earliest_slot` — Doktor fark etmeksizin en erken boş
- Hasta "yarın bir randevu" diyor, doktoru umursamıyor → tüm uygun doktorlar arası en erken boş slot. Dolulukta dönüşümü artırır.

### A5. (Backlog) Erteleme sırasında doktor değişimi
- Mevcut `reschedule` doktoru sabit tutuyor. Opsiyonel `newProviderId` ile "Dr. X dolu, aynı saatte Dr. Y müsait" senaryosu.

### A6. (Backlog) `join_waitlist` — Bekleme listesi
- İstenen slot dolu → "boşalınca haber ver". Yeni hafif tablo + iptal event'inde tetikleme. (Daha büyük iş.)

### A7. (Backlog) `get_clinic_info` — Adres/çalışma saati/yol tarifi
- Randevu dışı ama aynı sohbette sık sorulur; B bölümündeki transfer pickup adresi ile ortak config'ten beslenebilir.

---

## BÖLÜM B — Sağlık Turizmi: Otel & Transfer (ASIL SENARYO)

### B0. Önce: Klinik-Başına Sağlık-Turizmi Config'i (ön koşul) ⭐
Yeni satellite (öneri): `ClinicHealthTourismConfig` (1:1 clinic), `organization/clinic` veya `health-tourism` altında.

| Alan | Açıklama |
|---|---|
| `destinationCode` | HotelBeds şehir/bölge kodu (ör. İstanbul) — otel araması bu kapsamda |
| `nearbyHotelCodes[]` | Klinik çevresi **curated otel allowlist'i** ("birkaç otel") |
| `airportIata` | Transfer için varış havalimanı (ör. `IST`) |
| `clinicLocationType` + `clinicLocationCode` | Transfer hedefi (ATLAS otel kodu / GPS koordinat) |
| `pickupAddress` | Klinik adresi (transfer + `get_clinic_info` ortak) |
| `defaultCurrency`, `serviceFeePolicy` | Fiyat gösterimi + markup |

> **Neden ön koşul:** "Kliniğin etrafındaki birkaç otel" ifadesi curated bir liste demek. Bu config olmadan AI tüm şehirdeki binlerce oteli arar — istenmeyen davranış.

### B1. HotelBeds `rateKey` akışı — kritik mimari not
HotelBeds **iki adımlı ve stateful**: `search` → her oda-fiyatı için opak bir `rateKey` döner → `book` o **birebir `rateKey`**'i geri ister. İki tasarım seçeneği:

- **(Önerilen) Kısa token haritası:** Search sonuçları Redis'e `searchToken → rateKey` olarak yazılır (kısa TTL, ör. 15 dk). AI'a kısa `optionId` döneriz; book'ta onu `rateKey`'e çözeriz. LLM uzun opak string taşımaz → hata/halüsinasyon riski düşer.
- **(Basit v1) Doğrudan `rateKey`:** Search çıktısında `rateKey`'i döner, AI book'ta echo eder. Hızlı ama LLM'in uzun string'i bozma riski var.

### B2. Otel araçları (eklenecek)

| Araç | Girdi (AI'dan) | Config'ten enjekte | Handler |
|---|---|---|---|
| `search_hotels` | `checkIn`, `checkOut`, `adults`, `children?`, `rooms?` | `destinationCode` / `nearbyHotelCodes` | `SearchHotelsQuery` |
| `book_hotel` | `optionId`(rateKey), `holderName`, `holderSurname`, oda-pax | `patientId`/`leadId` (context) | `BookHotelCommand` → `reference` |
| `get_hotel_bookings` | — (yalnız context hastası) | `patientId` | `GetHotelBookingsQuery` |
| `cancel_hotel_booking` | `bookingReference` | sahiplik doğrulaması | `CancelHotelBookingCommand` |

- **Sahiplik:** İptal/listede yalnız yazışmadaki `patientId`/`leadId`'ye bağlı rezervasyonlar (randevudaki `loadOwnedAppointment` muadili `loadOwnedBooking`).
- **holder:** Hasta kaydından isim çekilir; misafirde sorulur.

### B3. Transfer araçları (eklenecek)
Tipik akış: **havalimanı (IATA) → otel/klinik**, uçuş bilgisiyle.

| Araç | Girdi (AI'dan) | Config'ten enjekte | Handler |
|---|---|---|---|
| `search_transfers` | `direction`(ARRIVAL/DEPARTURE), `flightCode`, `date`, `time`, `adults`, `children?` | `airportIata`, `clinicLocationType/Code` (veya otel kodu) | `SearchTransferAvailabilityQuery` |
| `book_transfer` | `optionId`(rateKey), `flightCode`, `holderName/Surname`, `holderEmail`, `holderPhone` | `patientId`/`leadId` | `BookTransferCommand` → `reference` |
| `get_transfer_bookings` | — (context hastası) | `patientId` | `GetTransferBookingsQuery` |
| `cancel_transfer_booking` | `bookingReference` | sahiplik | `CancelTransferBookingCommand` |

- **`holderEmail` zorunlu** (HotelBeds transfer şartı) → misafirde AI e-posta sormalı. `AiToolContext`'e `email` eklemeyi değerlendir.
- Uçuş kodu (`FLIGHT`/`ARRIVAL` + kod) hastadan toplanır.

### B4. Context genişletmesi (ön koşul, küçük)
`AiToolContext`'e ekle: `leadId: string | null`, `contactEmail: string | null`.
- Inbound mesaj eşlemesinde hasta yoksa lead çözümü; otel/transfer rezervasyonunu lead'e bağlamak için.

### B5. Birleşik akış (uçtan uca, AI orkestrasyonu)
Tipik sağlık-turizmi yolculuğu — araçlar atomik kalır, AI sırayı kurar:
```
register_lead → search_hotels → book_hotel → search_transfers → book_transfer → book_appointment
```
AI sistem prompt'una bu akışın "önerilen sıra" olduğu (zorunlu değil) yazılır.

### B6. Fiyat & güven sınırları (guardrail)
- AI yalnız **satış fiyatı** (net + serviceFee) gösterir; net maliyet/markup sızdırılmaz.
- Rezervasyon **iptal koşulları** (HotelBeds cancellation policy) book öncesi hastaya özetlenir.
- Book yalnız hastanın **açık onayından** sonra (randevudaki gibi).

---

## 4. Öncelik Sırası

| # | İş | Boyut | Bağımlılık |
|---|---|---|---|
| 1 | **A1 + A2** (slot önerisi + timezone handler'a) | Orta | — |
| 2 | **A3** (confirm aracı) | Küçük | komut hazır |
| 3 | **B0** (klinik sağlık-turizmi config satellite) | Orta | — (B'nin ön koşulu) |
| 4 | **B4** (context: leadId + email) | Küçük | — |
| 5 | **B2** (otel araçları + rateKey token haritası B1) | Orta-Büyük | B0, B4 |
| 6 | **B3** (transfer araçları) | Orta-Büyük | B0, B4 |
| 7 | A4–A7, B5 prompt, B6 guardrail | Değişken | yukarıdakiler |

---

## 5. Kilitlenen Kararlar (2026-06-26)

- **Sıra:** Önce **A1 + A2** (randevu slot önerisi + timezone'u handler'a) → sonra **A3** (confirm) → sonra **BÖLÜM B** (otel & transfer). Gerekçe: randevudaki "LLM'e zaman/slot aritmetiği yaptırma" riski en kısa yoldan kapatılır, ardından asıl senaryoya geçilir.
- **Otel kapsamı:** **allowlist öncelikli hibrit** — klinik config'inde `nearbyHotelCodes[]` doluysa yalnız o oteller aranır; boşsa `destinationCode` ile şehir geneline düşülür. (B0 config + B2 `search_hotels` buna göre yazılır.)
- **rateKey:** **Redis kısa-token haritası** — `search` sonuçları Redis'e `searchToken → rateKey` (kısa TTL) yazılır; AI'a kısa `optionId` döner, `book`'ta rateKey'e çözülür. LLM opak string taşımaz. (B1'in önerilen seçeneği onaylandı.)
- **B0 config konumu:** Açık bırakıldı — yeni `ClinicHealthTourismConfig` satellite vs. mevcut klinik config'ine alan ekleme; B'ye geçerken netleştirilecek.

---

## 6. Uygulama Günlüğü

### A1 + A2 — TAMAMLANDI (2026-06-26)

**A1 — `suggest_appointment_slots`:**
- Yeni query `GetProviderOpenSlotsQuery` (appointment) — `GetProviderAvailabilityQuery` çıktısından (çalışma saatleri − mola − dolu − geçmiş) `durationMinutes` adımıyla hazır boş slotları üretir. Çıktı: yerel `time` ("HH:mm") + UTC `start` + `durationMinutes`.
- AI aracı `suggest_appointment_slots(providerId, date, durationMinutes)` → slot saatleri listesi. Executor `suggestSlots`.
- Test: `get-provider-open-slots.handler.spec.ts` (4 test) — mola/dolu/past dışlama + UTC karşılığı + çalışma-dışı gün.

**A2 — booking timezone'u handler katmanına alındı:**
- `book_appointment` ve `reschedule_appointment` araçları artık **yerel `date` + `time`** (HH:mm, klinik saati) alıyor (eski ISO-UTC `startTime`/`newStartTime` kaldırıldı). Executor `DateTimeManager.fromLocalDateTime` ile klinik timezone'una göre UTC'ye çevirir → LLM zaman dilimi matematiği yapmaz.
- Klinik timezone'u yeni `GetClinicTimezoneQuery` (clinic) ile bus üzerinden çözülür. Shared `BookAppointmentDto`/`StaffRescheduleDto` (web FE de kullanıyor) **değiştirilmedi**; çeviri yalnız AI sınırında.

**🔴 Yan bulgu — sistem-geneli timezone bug'ı bulundu ve düzeltildi:**
- Prisma `TimeZone` enum'u altçizgi biçimi saklıyor (`Europe_Istanbul`) ama dayjs/Intl IANA (`Europe/Istanbul`) ister → `DateTimeManager`'ın **her default-tz metodu runtime'da `Invalid time zone specified` ile patlıyordu** (toDateKey, addMinutes, availability, booking dahil; jest ile doğrulandı).
- Düzeltme: `DateTimeManager.toIana()` normalizer (ilk `_`→`/`, şehir içi `_` korunur, IANA'ya dokunmaz) eklendi ve tüm `dayjs.tz`/`dayjs().tz` çağrıları buradan geçirildi. Test: `date-time.manager.spec.ts` (8 test, tüm enum değerleri Intl-geçerli).

**Durum:** Dokunulan/yeni dosyalarda tsc 0; 12 yeni test yeşil.

### A3 — `confirm_appointment` — TAMAMLANDI (2026-06-26)
- AI aracı `confirm_appointment(appointmentId)` + executor `confirmAppointment` → mevcut `ConfirmAppointmentCommand` (PENDING→CONFIRMED). Sahiplik `loadOwnedAppointment` ile doğrulanır. Senaryo: hatırlatmaya "geliyorum/onaylıyorum" yanıtı.
- Not: confirm handler düz policy check yapıyor (systemBypass yok) ama `SYSTEM_ACTOR.capabilities:['*']` geçiriyor — reschedule ile aynı, AI'dan sorunsuz çalışır.
- ai-agent suite: 24/24 yeşil.

### B0 — ClinicHealthTourismConfig satellite — TAMAMLANDI (2026-06-26)
Klinik-başına sağlık-turizmi config'i (B'nin ön koşulu). **Karar:** yeni satellite (kod tabanı konvansiyonu). **Alanlar (onaylanan tam set):** isEnabled, destinationCode, nearbyHotelCodes[], airportIata, clinicLocationType/Code, pickupAddress, serviceFeePercent (Decimal), defaultCurrency (TRY/USD/EUR/GBP, default EUR).
- **Schema+migration:** `health-tourism.prisma` model + Clinic geri-ilişki; elle migration `20260626120000_add_clinic_health_tourism_config` (⚠️ **DB'ye uygulanmadı** — `pnpm migrate:dev`/`prisma migrate deploy` gerek). `prisma:generate` çalıştırıldı → `ClinicHealthTourismConfig` zod tipi hazır.
- **Modül:** `crm/health-tourism/config/` — entity (allowlist-öncelikli `effectiveHotelScope` getter + sayı→Decimal çevirim), repo split (command/query) + token'lar, ConfigureClinicHealthTourismCommand + GetClinicHealthTourismConfigQuery (gizli alan yok → AI runtime de bunu kullanır), controller (`health-tourism/clinics/:clinicId/config` GET+PATCH), HealthTourismModule'e wire.
- **Shared:** `@shared/modules/health-tourism` configure schema/type/dto + HealthTourismConfigResponse interface + barrel'lar.
- Test: entity spec 6 test (effectiveHotelScope hibrit + Decimal). Dokunulan dosyalarda tsc 0.

### B4 — AiToolContext genişletme — TAMAMLANDI (2026-06-27)
- `AiToolContext` + `AiReplyRequest`'e `leadId: string | null` eklendi; processor (`conversation.leadId`) → iki adapter (anthropic/gemini) → executor zincirine plumb edildi. Misafir (patientId yok) otel/transfer rezervasyonu lead'e bağlanır. (Email context'e EKLENMEDİ — booking araçları holder bilgisini input olarak alır.)

### B2 — Otel araçları (search/book/get/cancel) — TAMAMLANDI (2026-06-27)
- **4 AI aracı:** `search_hotels`, `book_hotel`, `get_hotel_bookings`, `cancel_hotel_booking` (executor + tanımlar). Mevcut hotel query/command'lara bus üzerinden bağlanır.
- **Kapsam (B0 kararı):** `search_hotels` → `GetClinicHealthTourismConfigQuery` → allowlist (`nearbyHotelCodes`) öncelikli, yoksa `destinationCode`. Config kapalı/yapılandırılmamışsa arama yapılmaz.
- **rateKey Redis token (B1):** her rate için kısa `optionId` (`ht_xxxxxxxx`) üretilip `RedisService.setHotelRateOption` ile mühürlenir (TTL 15dk); opak `rateKey` LLM'e sızmaz, `book_hotel` optionId'yi çözer. Yeni `REDIS_KEYS.HOTEL.RATE_OPTION` + RedisService metodları (transfer deseni gibi). RedisModule → AiChatModule import.
- **Sahiplik & bağlama:** book/get/cancel yazışmanın patientId (öncelik) veya leadId kapsamında; cancel sahiplik doğrular. Pax: ilk yetişkin = holder, kalanlar aynı soyadla doldurulur (v1).
- Test: `ai-tool-executor.hotel.spec.ts` (5 test: tokenizasyon/rateKey gizliliği, misafir→lead, süre dolması, sahiplik reddi, config kapalı).

**⚠️ generated-zod olayı (çözüldü):** B0'daki `prisma:generate`, tracked ama stale generated-zod dosyalarını şemayla yeniden senkladı. Bir ara `git checkout` ile committed (daha eski) hale geri alma denemesi tutarsız (Frankenstein) durum + 61 hata yarattı; **çözüm: temiz `prisma:generate` tekrar çalıştırıldı → tsc 0**. generated-zod artık şema-doğru ve ClinicHealthTourismConfig dahil tutarlı.

**Durum:** tsc 0; messaging 36 suite / 176 test yeşil (bu turda +5 otel testi).

### B3 — Transfer araçları (search/book/get/cancel) — TAMAMLANDI (2026-06-27)
- **4 AI aracı:** `search_transfers`, `book_transfer`, `get_transfer_bookings`, `cancel_transfer_booking`. Mevcut transfer query/command'lara bus ile bağlı.
- **Yön & kapsam:** `search_transfers(direction, date, time, adults, ...)` — ARRIVAL = havalimanı(IATA, config.airportIata) → klinik(config.clinicLocationType/Code), DEPARTURE tersi. Config eksikse (airport/clinic location) arama yapılmaz.
- **rateKey Redis token:** her rate için kısa `optionId` (`tr_xxxxxxxx`) → `RedisService.setTransferRateOption` (yeni `REDIS_KEYS.TRANSFER.RATE_OPTION`). `book_transfer` optionId'yi çözer; opak rateKey LLM'e sızmaz.
- **book_transfer:** optionId + holderName/Surname/**Email/Phone** (zorunlu) + **flightCode** (uçuş no → transferDetails[type:FLIGHT, direction]). patientId-öncelikli yoksa leadId; clinicId set. **cancel** `reference` ile çalışır (hotel'den farklı — internal id değil), sahiplik doğrulamalı.
- Test: `ai-tool-executor.transfer.spec.ts` (5 test: tokenizasyon/rateKey gizliliği, config eksik, misafir→lead + uçuş detayı, zorunlu alan, sahiplik reddi).

### B5 + B6 — Sistem prompt akış + guardrail — TAMAMLANDI (2026-06-27)
- `HEALTH_TOURISM_DIRECTIVE` (`ai-chat.constants.ts`) `buildSystemPrompt`'a eklendi (LANGUAGE_DIRECTIVE gibi her zaman uygulanır; sistem prompt cache'lendiği için token maliyeti minimal).
- **B5 akış:** hasta şehir dışından geliyorsa / konaklama-transfer sorarsa otel+transfer araçları sunulur; önerilen sıra kayıt → otel → transfer → randevu (zorunlu değil). Klinik hizmeti sunmuyorsa araçlar zaten "aktif değil" döndüğü için yanlış vaat olmaz.
- **B6 guardrail:** yalnız araçtan dönen satış fiyatı söylenir (maliyet/kâr kırılımı yok, fiyat uydurma yok); rezervasyondan ÖNCE iptal koşulları özetlenir; yalnız açık onaydan sonra book.

**Durum (BÖLÜM B backend TAMAM):** tsc 0 (kalan 2 hata `quantity.vo.ts`'de — kullanıcının devam eden VO düzenlemesi, benim değil); messaging 37 suite / 181 test yeşil.

**Sırada:**
1. **B7 — Ödeme/tahsilat** (aşağıda planlandı; kullanıcı kararı: iki link iyzico + Stripe).
2. ⚠️ **B0 migration DB'ye uygulanmadı** — `pnpm prisma migrate deploy`.
3. **Frontend:** klinik health-tourism config ekranı (`@shared/modules/health-tourism` configure DTO + HealthTourismConfigResponse hazır) + messages/inbox UI (hâlâ yok).
4. (Opsiyonel) randevu backlog: A4 find_earliest_slot, A5 reschedule-with-provider, A6 waitlist, A7 get_clinic_info.

---

## BÖLÜM B7 — Otel/Transfer Ödeme & Tahsilat (PLANLANDI, kod yok — 2026-06-27)

> **Bağlam (bulgu):** HotelBeds **bedbank/kredi modeli** — book çağrısı yalnız `holder`+`rooms`(rateKey) gönderir, **kart/paymentData YOK**; klinik kendi kredi limitiyle **net fiyattan** rezerve eder, HotelBeds kliniğe fatura keser. Yani hasta kartını HotelBeds'e vermez. Aynısı transfer için de geçerli. **Sorun:** hasta yine de kliniğe **satış fiyatını** (net + `serviceFeePercent`) ödemeli — mevcut AI akışında bu tahsilat adımı YOK → klinik maliyeti + iptal riskini üstlenir.
>
> **Kullanıcı kararı (2026-06-27):** Hastaya **iki ödeme linki** gönderilir — biri **iyzico**, biri **Stripe**. **Stripe entegrasyonu yapılacak** (şu an yok — şemada yalnız yorum `// Stripe Connect`). Ayrı faz olarak planlandı, kod sonra.

### B7.0 Mevcut durum envanteri
- **iyzico:** `finance/pos/virtual` altında `init-checkout-form` (+ `handle-payment-callback`, `refund-payment`, `cancel-payment`) var. ⚠️ `init-checkout-form.response` şu an `{}` (stub/yarım) — bitirilmesi gerekebilir.
- **Stripe:** YOK. SDK yok, env yok, adapter yok. Şemada `ClinicPaymentGateway` satellite (per-clinic, şu an `iyzicoSubMerchantKey`) + yorumlu `stripeAccountId` (Stripe Connect öngörülmüş).
- **Para birimi:** HotelBeds genelde EUR; iyzico TRY-merkezli; Stripe çok-para. Hastaya hangi para biriminde çekileceği netleşmeli.

### B7.1 Mimari — sağlayıcı-bağımsız ödeme linki (router deseni)
`PaymentLinkPort` (domain) → 2 adapter: `IyzicoPaymentLinkAdapter` (mevcut init-checkout-form sarmalanır) + **`StripePaymentLinkAdapter` (YENİ)**. ChannelRouter/AiChatRouter deseni. Her booking için **ikisi birden** link üretilir.
- **Stripe mekanizması:** **Checkout Session** (`mode: payment`, dinamik tutar + metadata{bookingId, provider:'hotel'|'transfer'} + expiry) → dönen `url` = link. SDK: `stripe` paketi. Env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- **Webhook:** `finance/stripe/webhook` (raw body + `Stripe-Signature` doğrulama) → `checkout.session.completed` → ödeme tamamlandı.
- **iyzico:** mevcut `handle-payment-callback` zinciri kullanılır.

### B7.2 İki-link akışı & mutabakat (reconciliation)
- Yeni `BookingPayment` kaydı: bookingRef, amount, currency, iyzicoSessionId+url, stripeSessionId+url, status (PENDING/PAID/EXPIRED/REFUNDED), paidProvider.
- AI/komut **iki linki birden** üretir, kanaldan (WhatsApp/Telegram/IG) hastaya gönderir.
- Hasta **birini** öder → o sağlayıcının webhook/callback'i → payment PAID → booking onay/finalize → **diğer link iptal/expire** (Stripe: `expire` session; iyzico: yok say).
- **Idempotency:** ikisi de ödenirse ikincisini otomatik **refund**. Çift-çekim koruması.

### B7.3 Zamanlama — AÇIK KARAR (öneri: payment-first)
- **(Öneri) Payment-first:** rateKey/option Redis'te tutulur → iki link üret → ödeme gelince HotelBeds book → persist. İptal riski yok. ⚠️ rateKey ~15 dk geçerli; ödeme gecikirse: HotelBeds RECHECK rate ile yeniden doğrula ya da nazikçe başarısız + (gerekirse) refund.
- **(Alt) Book-first:** önce book sonra link; basit ama hasta ödemezse klinik HotelBeds maliyeti + iptal ücretini üstlenir.
- Karar B7'ye başlarken netleşecek (rateKey expiry + iptal politikası nedeniyle payment-first öneriliyor).

### B7.4 Tutar, para birimi, muhasebe
- **Satış tutarı** = `totalNet × (1 + serviceFeePercent/100)`, booking para biriminde. iyzico TRY ister → kur dönüşümü kararı (EUR mı çekilsin, TRY'ye mi çevrilsin). Stripe çok-para destekler.
- **Finans defteri:** ödeme + HotelBeds maliyeti `finance-ledger`/accounting'e işlenir (net = maliyet, tahsilat = gelir, marj = serviceFee). Bkz. finans entegrasyonu hafızası.

### B7.5 İptal → iade
- `cancel_hotel_booking` / `cancel_transfer_booking` iptal politikasına göre **refund** tetikler (iyzico refund-payment / Stripe refund). Ücretsiz iptal penceresi dışında kısmi/sıfır iade.

### B7.6 Açık kararlar — KİLİTLENDİ (2026-06-27)
1. **Stripe anahtar modeli:** **v1 platform-tek-hesap** (clinic metadata). Stripe Connect (submerchant muadili) sonraki iterasyon.
2. **Zamanlama:** **payment-first** (kesin). Ödeme alınmadan HotelBeds'e rezervasyon açılmaz.
3. **Para birimi:** **iyzico = TRY** (yurt içi), **Stripe = EUR/USD** (yurt dışı). İki link birden sunulur; konuşmada hangisinin nereden ödeyene olduğu açıkça belirtilir. Kur kaynağı: v1 statik env (`FX_<CUR>_TRY`); canlı feed sonra.
4. **Kapsam:** B7 hem otel hem transfer'i kapsar (tek akış, `BookingPaymentType` ile ayrılır).

---

## B7 — UYGULANDI (2026-06-27)

**Mimari:** Ödeme-önce (payment-first) saga. `book_hotel`/`book_transfer` AI araçları artık rezervasyonu HEMEN açmaz — `InitiateBookingPaymentCommand` ile **iki ödeme linki** (iyzico TRY + Stripe EUR/USD) üretip döner. Hasta birini ödeyince webhook → `ConfirmBookingPaymentCommand` → intent'i HotelBeds'e replay eder (`BookHotelCommand`/`BookTransferCommand`) → diğer linki expire eder.

**Yeni dosyalar:**
- **Ödeme linki altyapısı** (`src/infrastructure/payment/links/`): `payment-link.port.ts` (`IPaymentLinkProvider` + tokenlar), `fx-rate.port.ts`; adapter'lar `iyzico-payment-link.adapter.ts` (mevcut `IIyzicoProvider`'ı sarmalar, callback'i booking callback'ine yönlendirir), `stripe-payment-link.adapter.ts` (Checkout Session + expire + refund), `stripe-client.factory.ts` (lazy SDK + webhook imza), `static-env-fx-rate.provider.ts`; `payment-link.module.ts`.
- **BookingPayment bounded context** (`crm/health-tourism/booking-payment/`): entity (durum makinesi PENDING→PAID→BOOKED|FAILED; EXPIRED; REFUNDED; çift-çekim korumalı), `booking-payment.contracts.ts` (BookingIntent discriminated union + Props), repo split (command/query) + tokenlar + module, `InitiateBookingPaymentCommand`+handler (sale = net×(1+fee%), FX→TRY, iki link, graceful degrade), `ConfirmBookingPaymentCommand`+handler (saga), `HandleBookingPaymentIyzicoCallbackCommand`+handler (retrieveCheckoutForm doğrulaması), `GetBookingPaymentQuery`, controller'lar (`stripe-webhook.controller.ts` rawBody+imza, `booking-payment-iyzico.controller.ts` callback), modüller.
- **Schema:** `BookingPayment` model + `BookingPaymentType`/`Status`/`Provider` enum'ları (health-tourism.prisma); migration `20260627120000_add_booking_payment` (⚠️ **DB'ye uygulanmadı**).
- **Env:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `FX_EUR_TRY`/`FX_USD_TRY`/`FX_GBP_TRY`. Route'lar: `health-tourism/booking-payments/{iyzico/callback, stripe/webhook}`.
- **AI:** executor `bookHotel`/`bookTransfer` → InitiateBookingPayment (iki link + `renderPaymentLinks`); tool tanımları + `HEALTH_TOURISM_DIRECTIVE` ödeme-önce/iki-link talimatıyla güncellendi. `BookHotelCommand`/`BookTransferCommand`'a `__responseType` eklendi.

**Test:** booking-payment entity (8) + initiate handler (4) + confirm handler (4) + FX provider (5) + güncellenen executor hotel/transfer (10) — hepsi yeşil. messaging 37 suite/181 test yeşil; tsc 0 (yalnız kullanıcının `quantity.vo` WIP'i hariç).

**Kalan / takip:**
1. ⚠️ **Migration DB'ye uygulanmadı** — `pnpm prisma migrate deploy`.
2. **rateKey expiry:** payment-first'te rateKey ~15 dk, Stripe session min 30 dk. Ödeme gecikip book başarısız olursa handler FAILED işaretler + **otomatik iade** eder (recheck-rate ile yenileme sonraki iterasyon).
3. **Ödeme sonrası bildirim:** webhook book sonrası hastaya kanaldan otomatik "rezervasyonunuz oluştu" mesajı YOK (BookingPayment.conversationId tutuluyor; messaging outbound köprüsü sonra).
4. **FX canlı feed** (TCMB/exchangerate) + **Stripe Connect** (per-clinic settlement) sonraki iterasyon.
5. **Muhasebe köprüsü — TAHSİLAT BAĞLANDI (2026-06-27):** Confirm handler BOOKED sonrası `EnsurePartyForPatientCommand` + `RecordFinancialEventCommand(PAYMENT_RECEIVED, method:POS_CARD, amount=tryAmount, dedupeKey:booking-payment-received:{id})` (handle-payment-callback deseni). **Tutar her zaman tryAmount** (Stripe EUR ödense bile defter TRY → tek para birimi tutarlı; FX kar/zarar v1'de yok sayıldı). **Yalnız patient** (lead/misafir → atlanır, convert-lead sonrası); köprü hatası booking'i bozmaz; idempotent. **Henüz bağlanmayan:** HotelBeds **maliyeti/borcu** (bedbank kredi → HotelBeds kliniğe fatura kesince `PURCHASE_INVOICE_RECEIVED` ile alış akışında işlenmeli, booking anında çift-sayım riski nedeniyle yazılmadı); **iade ters-muhasebesi** (PAYMENT_MADE) — finans tarafında `PAYMENT_MADE` posting kuralı henüz YOK, eklenince bağlanacak.

### ⏸️ DURAKLATILDI (2026-06-28) — büyük "Patient ikiye ayırma" refactor'ü için ara verildi
**HotelBeds booking tarafında NEREDE KALDIK:** Backend büyük ölçüde tamam — B0–B6 (config, otel/transfer araçları, rateKey token, prompt guardrail) + B7 (payment-first iki-link iyzico/Stripe + webhook + confirm saga) + (a) iptal→iade + (b) ödeme sonrası AI bildirim/HSM + tahsilat muhasebe köprüsü. **Refactor bitince buradan devam edilecek tek kalan iş = (c) aşağıda.**

### (c) HotelBeds MALİYET/BORÇ KÖPRÜSÜ + İADE TERS-MUHASEBESİ — PLANLANDI (kod yok)
Para akışı (kullanıcı doğruladı): müşteri → **bize** satış (iyzico TRY / Stripe EUR-USD, kart hosted sayfada — PCI dışı); biz → **HotelBeds**'e net (bedbank kredi/ekstre); komisyon = satış − net. Eksik muhasebe bacakları:
1. **HotelBeds maliyeti/borcu:** BOOKED olunca kliniğin HotelBeds'e **net kadar borcu** (payable) + maliyet kaydı. Bedbank kredi modeli → HotelBeds ekstreyle fatura kesince `PURCHASE_INVOICE_RECEIVED` ile alış akışında işlenmeli. ⚠️ Booking anında yazılırsa ekstre gelince **çift-sayım riski** → karar: ya booking anında payable + ekstrede mahsup, ya da yalnız ekstrede. Finans tarafıyla netleştir.
2. **İade ters-muhasebesi:** iptal→iade `PAYMENT_MADE` ekonomik olayı yazmalı; ⚠️ finans tarafında **`PAYMENT_MADE` posting kuralı YOK** (yalnız PaymentReceivedRule var) → önce o kural eklenmeli, sonra ConfirmBookingPayment refund + RefundBookingPayment buna bağlanmalı.
3. (Opsiyonel) penalty-aware kısmi iade (HotelBeds iptal cezası mahsubu — şu an klinik üstleniyor), çok-dilli HSM şablonu.

**Karar gereken (c başlarken):** PAYMENT_MADE + purchase/payable posting kurallarını önce finans tarafında mı ekleyelim, yoksa booking-payment tarafını event/olay üretecek şekilde hazırlayıp finans kuralları gelince mi bağlayalım.

### (b) ÖDEME SONRASI MÜŞTERİ BİLDİRİMİ — KODLANDI (2026-06-28)
Ödeme onaylanıp rezervasyon BOOKED olunca müşteriye mesajlaşma kanalından onay gider. Confirm handler (booking-payment) → `SendBookingConfirmationCommand` (messaging/ai-agent) bus ile dispatch (conversationId yoksa atlanır; non-fatal). Handler (AiReplyProcessor deseni): conversation + runtime config + son 20 mesaj geçmişi yükler. **Karar 1 — AI üretir (konuşma dilinde):** pencere içi / Telegram / IG'de `IAiChatPort.generateReply` ile, geçmişin sonuna "[SİSTEM] ödeme onaylandı, rezervasyon oluştu, kısa onay yaz" talimatı eklenerek; LANGUAGE_DIRECTIVE dili korur. AI config kapalı/yoksa iki-dilli fallback metin. **Karar 2 — pencere dışı HSM:** WhatsApp + 24s pencere KAPALIYSA serbest metin reddedileceğinden `SendTemplateMessageCommand` (onaylı `booking_confirmation` şablonu, değişkenler [özet, referans]). ⚠️ Şablonun Meta'da onaylı olması gerekir (yoksa gönderim hatası — loglanır); çok-dilli HSM sonra. Test: send-booking-confirmation.handler.spec (5: pencere-içi AI, pencere-dışı HSM, Telegram AI, fallback, yazışma yok).

### (a) İPTAL → İADE AKIŞI — KODLANDI (2026-06-27)
AI `cancel_hotel_booking`/`cancel_transfer_booking` araçları HotelBeds iptalinden sonra ödemeyi otomatik iade eder. Yeni `RefundBookingPaymentCommand(bookingId)`+handler: `findByBookingId` ile BookingPayment'ı bulur (dahili rezervasyon id; hotel→bookingId, transfer→matched item.id), `paidProvider` adapter'ından iade eder (iyzico→tryAmount/TRY, Stripe→saleAmount/saleCurrency, `paidProviderRef` ile), `markRefunded`. Yalnız BOOKED durumda; ödeme kaydı yoksa (B7 öncesi) veya hata varsa iptal akışını bozmadan geçer (AI "iade için ekip iletişime geçecek" der). **v1: tam satış iadesi** (HotelBeds iptal cezası mahsubu YOK — cezayı şu an klinik üstlenir; penalty-aware kısmi iade sonra). Ters-muhasebe (PAYMENT_MADE) finans kuralı eklenince bağlanacak. Test: refund-booking-payment.handler.spec (4).
