# WhatsApp Mesajlaşma + Klinik-Başına AI Asistanı — B2B Multi-Tenant (NestJS)

> **Amaç:** Her kliniğin **kendi WhatsApp numarasıyla** hastalarıyla iki yönlü yazışması ve isteğe bağlı olarak gelen mesajlara **kendi AI asistanıyla** otomatik yanıt verebilmesi.
> **Kanal:** WhatsApp Cloud API (Meta Graph API) — gönderim REST, gelen mesaj **webhook (push)**.
> **AI:** Anthropic Claude (varsayılan `claude-haiku-4-5`), klinik başına persona + anahtar; araçlarla hizmet/fiyat, müsaitlik, **randevu oluşturma** ve **insana devir**.

---

## İçindekiler

1. [Genel Mimari](#1-genel-mimari)
2. [Bounded Context'ler](#2-bounded-contextler)
3. [Gelen Mesaj Akışı (Inbound)](#3-gelen-mesaj-akışı-inbound)
4. [Giden Mesaj Akışı (Outbound)](#4-giden-mesaj-akışı-outbound)
5. [24 Saat Servis Penceresi](#5-24-saat-servis-penceresi)
6. [AI Otomatik Yanıt Akışı](#6-ai-otomatik-yanıt-akışı)
7. [AI Araçları (Function Calling)](#7-ai-araçları-function-calling)
8. [Guardrail'ler (Çift Yanıt / Döngü / Devir)](#8-guardraller)
9. [Konfigürasyon (Klinik AI Config)](#9-konfigürasyon-klinik-ai-config)
10. [Ortam Değişkenleri](#10-ortam-değişkenleri)
11. [Veritabanı](#11-veritabanı)
12. [Test](#12-test)
13. [Kurulum / Doğrulama Kontrol Listesi](#13-kurulum--doğrulama-kontrol-listesi)

---

## 1. Genel Mimari

```
Hasta WhatsApp ──(webhook push)──▶ WhatsappWebhookController
                                     └─▶ ReceiveInboundMessageCommand (outboxRun)
                                          ├─ Message (INBOUND) persist
                                          ├─ Conversation.recordInboundMessage() ──▶ MessageReceivedEvent
                                          └─ hasta eşleme (FindPatientByContactQuery)

MessageReceivedEvent ──▶ AiReplyListener (enabled guard) ──▶ MESSAGING_AI kuyruğu
                                                              └─▶ AiReplyProcessor (worker)
                                                                   ├─ guard'lar (config/atama/pencere/opt-out)
                                                                   ├─ IAiChatPort.generateReply (Anthropic + araçlar)
                                                                   ├─ SendMessageCommand (sistem ctx)
                                                                   └─ handoff ise RequestConversationHandoffCommand

SendMessageCommand ──▶ Message (OUTBOUND, QUEUED) ──▶ MESSAGING kuyruğu
                                                       └─▶ MessageDeliveryProcessor ──▶ MetaWhatsappChannelAdapter ──▶ Graph API
```

**Push, poll değil:** Meta'dan düzenli veri çekilmez. Gelen her mesaj/teslim durumu Meta tarafından imzalı bir **webhook** ile bize POST edilir; WebSocket yoktur.

---

## 2. Bounded Context'ler

`src/modules/messaging/` altında üç alt-bağlam:

| Alt-bağlam | Sorumluluk |
|---|---|
| **channel-config** | Klinik WhatsApp satellite'i (`ClinicWhatsappChannel`): phoneNumberId, şifreli accessToken, kalite/sağlık, business profile. Numara **klinik başına**. |
| **conversation** | Kanal-bağımsız çekirdek: `Conversation` (thread meta) + `Message` (gelen/giden) + webhook + kanal portu (`MessageChannelPort` → Meta adapter). |
| **ai-agent** | Klinik başına AI sohbet asistanı: `ClinicAiAgentConfig` satellite + AI portu/adapter + araçlar + listener/kuyruk. |

Modüller arası iletişim yalnız **CommandBus/QueryBus** üzerinden (CLAUDE kuralı). AI araçları başka modüllerin (treatment-package, provider, appointment, patient, user) query/command sınıflarını bus üzerinden dispatch eder; repo/handler inject etmez.

---

## 3. Gelen Mesaj Akışı (Inbound)

1. **Webhook doğrulama:** `GET /webhook` `hub.challenge`'ı düz string döner; `POST /webhook` Meta imzasını (`X-Hub-Signature-256`) **rawBody** üzerinden doğrular (`main.ts` `rawBody: true`).
2. `ReceiveInboundMessageCommand` (`outboxRun` — atomik):
   - **Idempotency:** `externalId` (WhatsApp message id) zaten varsa mevcut id döner; Meta aynı mesajı tekrar iletebilir. (`@@unique` + DB index.)
   - Hasta eşlemesi: her gelen mesajda `FindPatientByContactQuery(clinicId, contactPhone)` ile `patientId` çözülür (AI/CRM bağlamı).
   - `Message.createInbound()` persist + `Conversation.recordInboundMessage()` → **`MessageReceivedEvent`** raise edilir.
   - `detectOptIntent` ile "DUR/STOP" → `optOutMarketing()`, "BAŞLA" → `resumeMarketing()`.

`MessageReceivedEvent` outbox üzerinden güvenilir yayınlanır; AI turu buna abonedir.

---

## 4. Giden Mesaj Akışı (Outbound)

- `SendMessageCommand` → `Message.createOutbound()` (status **QUEUED**) persist → `MESSAGING` kuyruğuna `jobId=messaging:send:{messageId}` (idempotent).
- `MessageDeliveryProcessor` (worker, limiter) QUEUED mesajı `MetaWhatsappChannelAdapter` üzerinden Graph API'ye POST eder; başarıda **SENT** + externalId, son denemede de hata → **FAILED** (dead-letter).
- Kanal credential'ı (phoneNumberId + decrypted token) `GetWhatsappChannelCredentialsQuery` ile **klinik başına** çözülür. Credential yoksa adapter hata fırlatır → mesaj FAILED (global toggle değil, credential varlığı belirler).

---

## 5. 24 Saat Servis Penceresi

WhatsApp: kontaktan gelen son mesajdan itibaren **24 saat** boyunca serbest (session) metin gönderilebilir; pencere kapalıyken yalnız onaylı **şablon (HSM/TEMPLATE)** gönderilebilir.

- `Conversation.isWithinServiceWindow()` son inbound zamanına bakar.
- `SendMessageCommand` pencere kapalıyken TEXT/MEDIA'yı reddeder (yalnız TEMPLATE).
- **AI için sonuç:** AI her zaman gelen mesaja yanıt verir → gelen mesaj pencereyi açar → AI'ın serbest TEXT yanıtı geçerlidir, şablon gerekmez.

---

## 6. AI Otomatik Yanıt Akışı

1. **AiReplyListener** `@OnEvent(MessageReceivedEvent)` — kliniğin AI config'i etkin mi (hafif `GetAiAgentRuntimeConfigQuery` kontrolü) → etkinse `MESSAGING_AI` kuyruğuna `jobId=ai:reply:{messageId}` (idempotent). Etkin değilse kuyruğa hiç düşmez (queue spam önlenir).
2. **AiReplyProcessor** (worker, Anthropic-tier limiter):
   - Yazışmayı çöz; **guard'lar** geçilmezse atla (bkz. §8).
   - Runtime config'i çöz (decrypted `apiKey`, model, systemPrompt, maxTokens, replyOnlyWithinWindow).
   - Son ~20 mesajı çekip geçerli bir Anthropic sohbet dizisine çevirir (INBOUND→user, OUTBOUND→assistant; baştaki assistant atılır, ardışık aynı-rol birleştirilir).
   - `IAiChatPort.generateReply(...)` → metin + handoff bayrağı + kullanılan araçlar.
   - Metin varsa `SendMessageCommand`, handoff istendiyse `RequestConversationHandoffCommand` — hepsi **sistem context'i** (`ExecutionContextFactory.createInternal()` + `SYSTEM_ACTOR`) ile.

**Anthropic adapter** (`AnthropicChatAdapter`):
- Anahtar: klinik config'inden (decrypted) yoksa **platform fallback** `ENV.ANTHROPIC_API_KEY`; o da yoksa boş yanıt (no-op).
- **Manuel tool-use döngüsü** (araçlar `AiToolExecutor` → bus). Streaming yok, `max_tokens ~1024`, sistem prompt'ta `cache_control` (prompt caching), tur limiti 6.
- **Model-yetenek farkı:** Haiku adaptive thinking/`effort` desteklemediği için `thinking` parametresi **gönderilmez** (gönderilirse 400). Opus/Sonnet override edilirse ileri-iş olarak adaptive thinking eklenebilir.
- Test/fallback için `NoopAiChatAdapter` mevcuttur.

---

## 7. AI Araçları (Function Calling)

Tümü klinik-kapsamlı sistem context'i ile bus üzerinden çalışır (`AiToolExecutor`):

| Araç | Hedef | Açıklama |
|---|---|---|
| `get_clinic_services` | `FindTreatmentPackagesQuery` | Hizmet/paket adı + fiyat + seans sayısı. |
| `list_providers` | `FindAllProvidersQuery` + `FindOneWithIdOrEmailQuery` | Aktif doktorlar (id + ad). |
| `check_provider_availability` | `GetProviderAvailabilityQuery` | Doktorun çalışma günleri/saatleri + dolu slotlar. |
| `book_appointment` | `BookAppointmentCommand` | Randevu oluşturur (`externalSystem='WHATSAPP'`); telefon boşsa kontağın WhatsApp numarası. |
| `handoff_to_human` | (processor) `RequestConversationHandoffCommand` | Yazışmayı insana devreder (status OPEN→PENDING). |

> AI, randevu oluşturmadan önce hastadan doktor/tarih/saat/süre için **açık onay** almakla yönlendirilir (sistem prompt). Booking handler hasta adı+telefon alır; ayrı hasta kaydı oluşturmaz.

---

## 8. Guardrail'ler

Yalnız INBOUND tetikler (kendi giden mesajımıza tetiklenmez — event inbound-only). Processor şu durumlarda **atlar**:

- `!config.isEnabled` (config yok/pasif).
- `!conversation.isEligibleForAiReply()` → status ≠ OPEN (insan devraldı/devredildi: PENDING), `assignedUserId != null`, veya `marketingOptOut`.
- `replyOnlyWithinWindow && !isWithinServiceWindow()` (pencere kapalı — şablon gerekir).
- Geçmiş boşsa (gönderilecek metin yok).

**Çift yanıt:** `jobId=ai:reply:{messageId}` aynı mesaj için tek job. **Döngü:** araç tur limiti (6) + event inbound-only. **Devir:** handoff → OPEN→PENDING → sonraki mesajlarda AI susar. **Maliyet:** sistem prompt prompt-caching + son 20 mesaj sınırı + Haiku varsayılan.

---

## 9. Konfigürasyon (Klinik AI Config)

`ClinicAiAgentConfig` (1:1 Clinic satellite, messaging bounded-context):

| Alan | Açıklama |
|---|---|
| `isEnabled` | AI yanıtı açık/kapalı (varsayılan false). |
| `model` | Anthropic model (varsayılan `claude-haiku-4-5`). |
| `systemPrompt` | Klinik personası (boşsa güvenli varsayılan prompt). |
| `apiKey` | **Şifreli** (`TokenCipherService`); null → platform anahtarı. |
| `maxTokens` | Yanıt başı çıktı sınırı (boşsa 1024). |
| `replyOnlyWithinWindow` | Pencere dışıysa yanıtlama (varsayılan true). |

**HTTP** (`clinics/:clinicId/ai-agent`, AuthGuard): `GET` (maskeli — `hasApiKey`), `PATCH` (configure — anahtar gelirse şifrelenir), `POST enable`, `POST disable`.
- Public query (`GetClinicAiAgentConfigQuery`) anahtarı **asla** dönmez.
- Internal query (`GetAiAgentRuntimeConfigQuery`) decrypted anahtarı yalnız processor/adapter için döner; controller'a açılmaz.

---

## 10. Ortam Değişkenleri

```
# WhatsApp Cloud API (app-seviyesi)
WHATSAPP_APP_ID=
WHATSAPP_APP_SECRET=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=

# Anthropic (platform fallback — klinik kendi anahtarını bağlamazsa)
ANTHROPIC_API_KEY=
ANTHROPIC_DEFAULT_MODEL=claude-haiku-4-5
```

Joi'de AI anahtarları **zorunlu değil**; yalnız AI etkin bir klinik varsa runtime gerekir (klinik anahtarı yoksa fallback kullanılır).

---

## 11. Veritabanı

- `ClinicWhatsappChannel` (channel-config) — klinik numarası + credential.
- `Conversation` / `Message` (conversation) — thread + mesajlar; `Message.externalId` `@@unique` (webhook idempotency).
- `ClinicAiAgentConfig` (ai-agent) — migration `20260620120000_add_clinic_ai_agent_config`; `clinic_id` unique + Clinic'e `onDelete: Cascade`.

Şema dosyaları: `src/infrastructure/persistence/prisma/schema/messaging.prisma`.

---

## 12. Test

Co-located kalıcı `.spec` testleri:

- `clinic-ai-agent-config.entity.spec.ts` — create/enable/disable/updateSettings (apiKey korunması).
- `conversation.entity.spec.ts` — `isEligibleForAiReply` + `requestHumanHandoff`.
- `ai-reply.processor.spec.ts` — guard'lar (config yok/disabled/atanmış/opt-out/pencere kapalı/yazışma yok) + happy path (SendMessage) + handoff.
- `anthropic-chat.adapter.spec.ts` — anahtar yoksa no-op, düz metin, tool-use döngüsü (handoff yansıması).
- `whatsapp-ai-pipeline.integration.spec.ts` — **uçtan uca entegrasyon**: inbound webhook command → `MessageReceivedEvent` (outboxRun) → `AiReplyListener` → MESSAGING_AI → `AiReplyProcessor` → `SendMessageCommand` → MESSAGING → `MessageDeliveryProcessor` → kanal portu. Gerçek handler/listener/processor zinciri çalışır; yalnız sınırlar taklit edilir: TransactionManager (gerçek ALS `txStorage` + `EventEmitter2` ile event yayar), BullMQ kuyrukları (`.add()` processor'ı inline çağırır), Anthropic (`IAiChatPort`) ve Meta (`MessageChannelPort`) mock + in-memory repo'lar. Senaryolar: happy path (AI metni Meta'ya teslim + outbound SENT), pasif config (hiç yanıt yok), insana devir (outbound yok + yazışma PENDING).

> Olay→kuyruk zinciri async olduğundan (event emit + worker), entegrasyon testi etkiyi `waitFor(...)` ile yoklayarak bekler — bu, prod'daki gerçek async akışı yansıtır.

Çalıştırma: `pnpm jest src/modules/messaging`.

---

## 13. Kurulum / Doğrulama Kontrol Listesi

1. `cd apps/api && pnpm migrate:dev` + `pnpm prisma:generate`.
2. `pnpm jest src/modules/messaging` — tüm messaging + AI testleri yeşil.
3. `npx tsc -p tsconfig.json --noEmit` — AI/messaging tarafında 0 hata.
4. Klinik için: WhatsApp kanalı bağla (numara) → `clinics/:id/ai-agent` PATCH (anahtar + persona) → `POST enable`.
5. Meta test numarasından mesaj at → webhook (tünel) → `MESSAGING_AI` job → AI yanıtı; "randevu istiyorum" → book akışı; "yetkiliye bağlan" → handoff (atama sonrası AI susar).
