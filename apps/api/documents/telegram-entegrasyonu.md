# Telegram Entegrasyonu — B2B Multi-Tenant Klinik Sistemi (NestJS)

> **Amaç:** B2B sistemdeki her kliniğin Telegram ile **kendi hesabıyla** entegre olabilmesi.
> **Mod:** Hibrit — klinik isterse **Bot** (BotFather token), isterse **kendi telefon numarasıyla kullanıcı hesabı** (MTProto) bağlanabilir.
> **Yön:** Giden bildirim (klinik → hasta) **ve** iki yönlü sohbet.

---

## İçindekiler

1. [Temel Karar: Bot API mı, MTProto mu?](#1-temel-karar-bot-api-mı-mtproto-mu)
2. [Genel Mimari (Multi-Tenant)](#2-genel-mimari-multi-tenant)
3. [Veritabanı Şeması](#3-veritabanı-şeması)
4. [Ortak Soyutlama (Strateji Deseni)](#4-ortak-soyutlama-strateji-deseni)
5. [Bot API Entegrasyonu](#5-bot-api-entegrasyonu)
6. [MTProto (Kullanıcı Hesabı) Entegrasyonu](#6-mtproto-kullanıcı-hesabı-entegrasyonu)
7. [Güvenlik](#7-güvenlik)
8. [Rate Limit ve Hata Yönetimi](#8-rate-limit-ve-hata-yönetimi)
9. [Test](#9-test)
10. [Kurulum Kontrol Listesi](#10-kurulum-kontrol-listesi)
11. [Kaynaklar](#11-kaynaklar)

---

## 1. Temel Karar: Bot API mı, MTProto mu?

Telegram'ın iki ayrı API'si var ve bu ikisi **birbirinden tamamen farklı** çalışır. Hibrit yaklaşımda kliniğe iki seçenek de sunulur; ancak farkları ekibe ve müşteriye net anlatılmalı.

| Kriter | **Bot API** (Telegraf) | **MTProto / Kullanıcı Hesabı** (GramJS) |
|---|---|---|
| Kimlik | Klinik adına bir **bot** (`@klinikadi_bot`) | Kliniğin **gerçek telefon numarası** |
| Token alımı | BotFather'dan token | `my.telegram.org`'dan `api_id` + `api_hash`, sonra telefonla giriş |
| Kime mesaj atılabilir | **Sadece botu önce başlatan** (`/start` diyen) kullanıcılara | Numaranın rehberindeki/etkileşimdeki herkese (pratikte daha serbest) |
| Kurulum zorluğu | Düşük | Yüksek (kod doğrulama, 2FA, session yönetimi) |
| ToS / Ban riski | Düşük (resmi, amaçlanan kullanım) | **Yüksek** — otomasyon kullanıcı hesaplarında risklidir, numara banlanabilir |
| İki yönlü sohbet | Webhook veya long-polling | Kalıcı TCP bağlantısı + event handler |
| Ölçeklenme | Çok kolay (stateless HTTP) | Zor (klinik başına canlı oturum/bağlantı) |
| Önerilen kullanım | **Varsayılan** — çoğu klinik için | Numarayla zorunlu özel senaryolar |

> ⚠️ **Önemli uyarı (müşteriye iletilmeli):** MTProto ile kullanıcı hesabı otomasyonu Telegram'ın hizmet şartlarına aykırı kullanımda **kalıcı numara banına** yol açabilir. Toplu/spam mesaj kesinlikle önerilmez. Bot API her zaman tercih edilen yoldur; MTProto'yu yalnızca kliniğin kendi numarasından bireysel iletişim zorunluysa öner.

**Pratik öneri:** Sistemde varsayılanı **Bot API** yap. MTProto'yu "gelişmiş / numara ile bağlan" seçeneği olarak, ek onay ekranıyla sun.

---

## 2. Genel Mimari (Multi-Tenant)

Her klinik bir **tenant**. Entegrasyon kayıtları klinik bazında tutulur ve çalışma anında ilgili kliniğin kimlik bilgileriyle (token veya session) işlem yapılır.

```
                          ┌─────────────────────────────┐
   Telegram Sunucuları    │        NestJS Uygulaması     │
                          │                              │
  ┌──────────────┐        │   TelegramModule             │
  │ Bot Webhook  │──HTTP──▶│   ├─ WebhookController       │
  │ (klinik bazlı│        │   │   /telegram/bot/:clinicId │
  │  secret path)│        │   ├─ TelegramService (facade) │
  └──────────────┘        │   │   ├─ BotApiStrategy       │
                          │   │   └─ MtprotoStrategy      │
  ┌──────────────┐        │   ├─ ProviderRegistry         │
  │ MTProto TCP  │◀──TCP──▶│   │   (clinicId → client)    │
  │ (kalıcı bağ.)│        │   └─ Crypto (token/session   │
  └──────────────┘        │       şifreleme)             │
                          │                              │
                          │   PostgreSQL  ◀── şifreli    │
                          │   (clinic_telegram_accounts) │
                          └─────────────────────────────┘
```

**Akışlar:**

- **Giden mesaj:** İş katmanı → `TelegramService.sendMessage(clinicId, chatId, text)` → kliniğin provider tipine göre `BotApiStrategy` veya `MtprotoStrategy` → Telegram.
- **Gelen mesaj (Bot):** Telegram → klinik bazlı webhook URL → `WebhookController` → `clinicId` çözümlenir → ilgili klinik konuşmasına yazılır.
- **Gelen mesaj (MTProto):** Uygulama açılışında her aktif MTProto kliniği için `TelegramClient` başlatılır → `NewMessage` event'i → aynı konuşma katmanı.

> **Çoklu instance / ölçekleme notu:** Bot API stateless olduğu için yatay ölçeklenir. MTProto canlı bağlantı gerektirdiğinden, çok sayıda MTProto kliniği varsa bunları ayrı bir **worker servisinde** (tek instance veya sticky paylaştırma ile) çalıştır; tüm web instance'larında aynı session'ı paralel açma — Telegram aynı session'ın çoklu eşzamanlı kullanımını sevmez.

---

## 3. Veritabanı Şeması

```sql
CREATE TYPE telegram_provider AS ENUM ('bot_api', 'mtproto');
CREATE TYPE telegram_status   AS ENUM ('pending', 'active', 'error', 'revoked');

CREATE TABLE clinic_telegram_accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    provider        telegram_provider NOT NULL,
    status          telegram_status   NOT NULL DEFAULT 'pending',

    -- Bot API alanları (şifreli saklanır)
    bot_token_enc   TEXT,            -- AES-256-GCM ile şifreli BotFather token
    bot_username    TEXT,
    webhook_secret  TEXT,            -- her klinik için rastgele secret_token

    -- MTProto alanları (şifreli saklanır)
    phone_number    TEXT,
    mtproto_session_enc TEXT,        -- AES-256-GCM ile şifreli StringSession

    -- Ortak
    last_error      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (clinic_id, provider)
);

-- Hasta ↔ Telegram eşlemesi (kime mesaj atılacağını bilmek için)
CREATE TABLE telegram_contacts (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id      UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id     UUID REFERENCES patients(id),
    telegram_chat_id  BIGINT NOT NULL,   -- Bot API: chat.id | MTProto: user id
    telegram_username TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (clinic_id, telegram_chat_id)
);
```

> **`api_id` / `api_hash` nerede?** MTProto'da bunlar **uygulama (B2B sistem) genelinde tek** olabilir ve `.env`'de tutulur — kliniğe ait değildir, geliştirici hesabına aittir. Kliniğe ait olan sadece `phone_number` ve giriş sonrası üretilen `session`'dır.

---

## 4. Ortak Soyutlama (Strateji Deseni)

İş katmanı, kliniğin hangi sağlayıcıyı kullandığını bilmemeli. Tek bir arayüz üzerinden çağrı yapılır.

```typescript
// telegram/interfaces/telegram-provider.interface.ts
export interface SendMessageInput {
  clinicId: string;
  chatId: string | number;
  text: string;
  // opsiyonel: replyToMessageId, parseMode, vb.
}

export interface IncomingMessage {
  clinicId: string;
  provider: 'bot_api' | 'mtproto';
  chatId: string;
  fromUsername?: string;
  text: string;
  raw: unknown;
}

export interface TelegramStrategy {
  readonly provider: 'bot_api' | 'mtproto';
  sendMessage(input: SendMessageInput): Promise<{ messageId: number | string }>;
  sendDocument(input: SendMessageInput & { fileUrl: string }): Promise<void>;
}
```

```typescript
// telegram/telegram.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { BotApiStrategy } from './strategies/bot-api.strategy';
import { MtprotoStrategy } from './strategies/mtproto.strategy';
import { TelegramAccountsRepository } from './telegram-accounts.repository';
import { SendMessageInput, TelegramStrategy } from './interfaces/telegram-provider.interface';

@Injectable()
export class TelegramService {
  constructor(
    private readonly accounts: TelegramAccountsRepository,
    private readonly botApi: BotApiStrategy,
    private readonly mtproto: MtprotoStrategy,
  ) {}

  private async resolveStrategy(clinicId: string): Promise<TelegramStrategy> {
    const account = await this.accounts.findActive(clinicId);
    if (!account) throw new BadRequestException('Klinik için aktif Telegram entegrasyonu yok');
    return account.provider === 'bot_api' ? this.botApi : this.mtproto;
  }

  async sendMessage(input: SendMessageInput) {
    const strategy = await this.resolveStrategy(input.clinicId);
    return strategy.sendMessage(input);
  }
}
```

---

## 5. Bot API Entegrasyonu

> SDK: **`telegraf`** (v4.x) + **`nestjs-telegraf`** (v2.9.x). Multi-tenant senaryoda `nestjs-telegraf`'in tek-bot dekoratör modeli yetersiz kalır; bu yüzden **bot örneklerini çalışma anında dinamik** oluşturup webhook'ları tek bir controller'da topluyoruz. (Tek bir kurumsal bot kullanacak olsaydın `nestjs-telegraf`'in dekoratörlü modeli yeterdi.)

### 5.1 Kurulum

```bash
npm install telegraf
# (Tek kurumsal bot kullanılacaksa ayrıca: npm install nestjs-telegraf)
```

### 5.2 Klinik bot bağlama (token kaydı + webhook kurulumu)

```typescript
// telegram/strategies/bot-api.strategy.ts
import { Injectable, Logger } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from '../crypto.service';
import { TelegramAccountsRepository } from '../telegram-accounts.repository';
import { SendMessageInput, TelegramStrategy } from '../interfaces/telegram-provider.interface';

@Injectable()
export class BotApiStrategy implements TelegramStrategy {
  readonly provider = 'bot_api' as const;
  private readonly logger = new Logger(BotApiStrategy.name);
  // clinicId → Telegraf instance önbelleği (gönderim için tekrar oluşturmamak adına)
  private readonly bots = new Map<string, Telegraf>();

  constructor(
    private readonly config: ConfigService,
    private readonly crypto: CryptoService,
    private readonly accounts: TelegramAccountsRepository,
  ) {}

  /** Klinik token'ını kaydeder, doğrular ve webhook'u kurar. */
  async connectClinic(clinicId: string, botToken: string) {
    const bot = new Telegraf(botToken);

    // 1) Token geçerli mi?
    const me = await bot.telegram.getMe();

    // 2) Klinik bazlı gizli webhook yolu + secret_token üret
    const webhookSecret = randomBytes(24).toString('hex');
    const baseUrl = this.config.getOrThrow<string>('PUBLIC_BASE_URL');
    const url = `${baseUrl}/telegram/bot/${clinicId}`;

    // 3) Webhook'u kur (secret_token başlığı sahte istekleri eler)
    await bot.telegram.setWebhook(url, { secret_token: webhookSecret });

    // 4) Şifreli sakla
    await this.accounts.upsertBotAccount({
      clinicId,
      botTokenEnc: this.crypto.encrypt(botToken),
      botUsername: me.username,
      webhookSecret,
      status: 'active',
    });

    return { username: me.username };
  }

  private async getBot(clinicId: string): Promise<Telegraf> {
    if (this.bots.has(clinicId)) return this.bots.get(clinicId)!;
    const account = await this.accounts.findActive(clinicId);
    const token = this.crypto.decrypt(account.botTokenEnc);
    const bot = new Telegraf(token);
    this.bots.set(clinicId, bot);
    return bot;
  }

  async sendMessage({ clinicId, chatId, text }: SendMessageInput) {
    const bot = await this.getBot(clinicId);
    const msg = await bot.telegram.sendMessage(chatId, text);
    return { messageId: msg.message_id };
  }

  async sendDocument({ clinicId, chatId, fileUrl }: SendMessageInput & { fileUrl: string }) {
    const bot = await this.getBot(clinicId);
    await bot.telegram.sendDocument(chatId, { url: fileUrl });
  }
}
```

### 5.3 Gelen mesajlar — tek webhook controller (multi-tenant)

Tüm kliniklerin botları aynı endpoint'e, ama farklı `:clinicId` yoluna update gönderir. `secret_token` başlığı doğrulanır.

```typescript
// telegram/webhook.controller.ts
import { Controller, Post, Param, Body, Headers, ForbiddenException, HttpCode } from '@nestjs/common';
import { Update } from 'telegraf/types';
import { TelegramAccountsRepository } from './telegram-accounts.repository';
import { IncomingMessageHandler } from './incoming-message.handler';

@Controller('telegram')
export class TelegramWebhookController {
  constructor(
    private readonly accounts: TelegramAccountsRepository,
    private readonly handler: IncomingMessageHandler,
  ) {}

  @Post('bot/:clinicId')
  @HttpCode(200)
  async onBotUpdate(
    @Param('clinicId') clinicId: string,
    @Headers('x-telegram-bot-api-secret-token') secret: string,
    @Body() update: Update,
  ) {
    const account = await this.accounts.findActive(clinicId);
    if (!account || account.webhookSecret !== secret) {
      throw new ForbiddenException(); // sahte istek
    }

    if ('message' in update && update.message && 'text' in update.message) {
      await this.handler.handle({
        clinicId,
        provider: 'bot_api',
        chatId: String(update.message.chat.id),
        fromUsername: update.message.from?.username,
        text: update.message.text,
        raw: update,
      });
    }
    return { ok: true }; // Telegram 200 bekler
  }
}
```

> **Webhook vs Long-Polling:** Üretimde **webhook** kullan (HTTPS zorunlu, geçerli sertifika). Yerel geliştirmede webhook için `ngrok`/`cloudflared` tüneli aç ya da geçici olarak long-polling (`bot.launch()`) kullan. Aynı bot için ikisini aynı anda kullanma.

---

## 6. MTProto (Kullanıcı Hesabı) Entegrasyonu

> SDK: **`telegram`** (GramJS, v2.26.x). `api_id`/`api_hash` `my.telegram.org/apps`'ten alınır ve **uygulama genelinde** `.env`'de tutulur. Her klinik kendi telefonuyla giriş yapar; sonuç bir **StringSession**'dır ve şifreli saklanır.

### 6.1 Kurulum

```bash
npm install telegram
```

```env
# .env
TELEGRAM_API_ID=1234567
TELEGRAM_API_HASH=abcdef0123456789abcdef0123456789
```

### 6.2 İki adımlı giriş akışı (telefon → kod → 2FA)

MTProto girişi etkileşimlidir: telefon numarasıyla kod istenir, klinik SMS/Telegram'dan gelen kodu girer, gerekirse 2FA şifresi sorulur. Bunu **iki uçlu (stateful) bir akışla** yönet: `start` ve `confirm`.

```typescript
// telegram/strategies/mtproto.strategy.ts
import { Injectable } from '@nestjs/common';
import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { ConfigService } from '@nestjs/config';
import { CryptoService } from '../crypto.service';
import { TelegramAccountsRepository } from '../telegram-accounts.repository';
import { SendMessageInput, TelegramStrategy } from '../interfaces/telegram-provider.interface';

@Injectable()
export class MtprotoStrategy implements TelegramStrategy {
  readonly provider = 'mtproto' as const;
  private readonly clients = new Map<string, TelegramClient>();      // aktif (giriş yapılmış) istemciler
  private readonly pending = new Map<string, { client: TelegramClient; phoneCodeHash: string }>();

  constructor(
    private readonly config: ConfigService,
    private readonly crypto: CryptoService,
    private readonly accounts: TelegramAccountsRepository,
  ) {}

  private newClient(session = ''): TelegramClient {
    return new TelegramClient(
      new StringSession(session),
      Number(this.config.getOrThrow('TELEGRAM_API_ID')),
      this.config.getOrThrow('TELEGRAM_API_HASH'),
      { connectionRetries: 5 },
    );
  }

  /** Adım 1: Telefona doğrulama kodu gönder. */
  async startLogin(clinicId: string, phoneNumber: string) {
    const client = this.newClient();
    await client.connect();
    const { phoneCodeHash } = await client.sendCode(
      {
        apiId: Number(this.config.getOrThrow('TELEGRAM_API_ID')),
        apiHash: this.config.getOrThrow('TELEGRAM_API_HASH'),
      },
      phoneNumber,
    );
    this.pending.set(clinicId, { client, phoneCodeHash });
    await this.accounts.upsertMtprotoAccount({ clinicId, phoneNumber, status: 'pending' });
    return { codeSent: true };
  }

  /** Adım 2: Kullanıcının girdiği kodu (ve gerekirse 2FA şifresini) doğrula, session'ı kaydet. */
  async confirmLogin(clinicId: string, phoneNumber: string, code: string, password?: string) {
    const ctx = this.pending.get(clinicId);
    if (!ctx) throw new Error('Önce startLogin çağrılmalı (kod süresi dolmuş olabilir)');
    const { client, phoneCodeHash } = ctx;

    try {
      await client.invoke(
        new Api.auth.SignIn({ phoneNumber, phoneCodeHash, phoneCode: code }),
      );
    } catch (e: any) {
      // 2FA (bulut şifresi) açıksa SESSION_PASSWORD_NEEDED döner
      if (e.errorMessage === 'SESSION_PASSWORD_NEEDED') {
        if (!password) throw new Error('2FA şifresi gerekli');
        await client.signInWithPassword(
          {
            apiId: Number(this.config.getOrThrow('TELEGRAM_API_ID')),
            apiHash: this.config.getOrThrow('TELEGRAM_API_HASH'),
          },
          { password: async () => password, onError: (err) => { throw err; } },
        );
      } else {
        throw e;
      }
    }

    const session = (client.session as StringSession).save();
    await this.accounts.upsertMtprotoAccount({
      clinicId,
      phoneNumber,
      mtprotoSessionEnc: this.crypto.encrypt(session),
      status: 'active',
    });
    this.pending.delete(clinicId);
    this.clients.set(clinicId, client);
    this.registerIncoming(clinicId, client); // gelen mesaj dinleyici
    return { connected: true };
  }

  async sendMessage({ clinicId, chatId, text }: SendMessageInput) {
    const client = await this.getClient(clinicId);
    const res = await client.sendMessage(chatId.toString(), { message: text });
    return { messageId: res.id };
  }

  async sendDocument({ clinicId, chatId, fileUrl }: SendMessageInput & { fileUrl: string }) {
    const client = await this.getClient(clinicId);
    await client.sendFile(chatId.toString(), { file: fileUrl });
  }

  private async getClient(clinicId: string): Promise<TelegramClient> {
    if (this.clients.has(clinicId)) return this.clients.get(clinicId)!;
    const account = await this.accounts.findActive(clinicId);
    const session = this.crypto.decrypt(account.mtprotoSessionEnc);
    const client = this.newClient(session);
    await client.connect();
    this.clients.set(clinicId, client);
    this.registerIncoming(clinicId, client);
    return client;
  }

  /** Gelen mesajlar için canlı dinleyici (iki yönlü sohbet). */
  private registerIncoming(clinicId: string, client: TelegramClient) {
    const { NewMessage } = require('telegram/events');
    client.addEventHandler(async (event: any) => {
      const msg = event.message;
      if (!msg?.message) return;
      // handler.handle({ clinicId, provider: 'mtproto', chatId: String(msg.chatId), text: msg.message, raw: event });
    }, new NewMessage({}));
  }
}
```

### 6.3 Uygulama açılışında MTProto oturumlarını ayağa kaldırma

Canlı bağlantı gerektiği için, aktif MTProto klinikleri uygulama (veya worker) başlangıcında bağlanmalı.

```typescript
// telegram/mtproto.bootstrap.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { MtprotoStrategy } from './strategies/mtproto.strategy';
import { TelegramAccountsRepository } from './telegram-accounts.repository';

@Injectable()
export class MtprotoBootstrap implements OnModuleInit {
  private readonly logger = new Logger(MtprotoBootstrap.name);
  constructor(
    private readonly accounts: TelegramAccountsRepository,
    private readonly mtproto: MtprotoStrategy,
  ) {}

  async onModuleInit() {
    const active = await this.accounts.findAllActiveByProvider('mtproto');
    for (const acc of active) {
      try {
        await this.mtproto['getClient'](acc.clinicId); // bağlan + dinleyici kur
        this.logger.log(`MTProto bağlandı: klinik ${acc.clinicId}`);
      } catch (e) {
        this.logger.error(`MTProto bağlanamadı: ${acc.clinicId}`, e as Error);
      }
    }
  }
}
```

> **Ölçekleme uyarısı:** Aynı StringSession'ı birden fazla process'te aynı anda bağlama. Çok instance'lı ortamda MTProto bağlantılarını **tek bir worker servisine** topla; web instance'ları gönderim isteklerini bu worker'a (kuyruk/RPC ile) iletsin.

---

## 7. Güvenlik

**Token ve session şifreleme.** `bot_token` ve `mtproto_session` veritabanında **asla düz metin** tutulmaz. AES-256-GCM ile şifrele; anahtarı `.env`/secret manager'da sakla.

```typescript
// telegram/crypto.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class CryptoService {
  private readonly key: Buffer;
  constructor(config: ConfigService) {
    // 32 byte (64 hex karakter) anahtar
    this.key = Buffer.from(config.getOrThrow<string>('TELEGRAM_ENC_KEY'), 'hex');
  }

  encrypt(plain: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, enc]).toString('base64');
  }

  decrypt(payload: string): string {
    const buf = Buffer.from(payload, 'base64');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const enc = buf.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
  }
}
```

Diğer güvenlik kuralları:

- **Webhook doğrulama:** Bot webhook'unda `secret_token` başlığını mutlaka kontrol et (Bölüm 5.3). Klinik bazlı yol (`/bot/:clinicId`) + secret birlikte kullanılır.
- **HTTPS zorunlu:** Telegram webhook yalnızca geçerli sertifikalı HTTPS kabul eder.
- **Yetkilendirme:** `connectClinic` / `startLogin` gibi uçlar yalnızca o kliniğin yetkili kullanıcısına açık olmalı (B2B auth guard).
- **En az yetki:** MTProto session bir tam kullanıcı oturumudur — sızması kliniğin Telegram hesabının ele geçmesi demektir. Erişimi sıkı logla ve gerektiğinde `auth.logOut` ile iptal et.
- **ToS uyumu:** Toplu/istenmeyen mesaj gönderimini engelle; özellikle MTProto'da hız sınırla ve onay (opt-in) zorunlu kıl.

---

## 8. Rate Limit ve Hata Yönetimi

Telegram limitleri (yaklaşık): bot, tek sohbete saniyede ~1 mesaj; toplu gönderimde saniyede ~30 mesaj; aynı gruba dakikada ~20 mesaj. Aşıldığında `429` + `retry_after` döner.

- **Kuyruk kullan:** Giden mesajları doğrudan değil, bir kuyruk (BullMQ/Redis) üzerinden gönder. Klinik bazlı throttle uygula.
- **429 yönetimi:** `retry_after` saniyesi kadar bekleyip tekrar dene (exponential backoff).
- **Kalıcı hatalar:** `403 Forbidden: bot was blocked by the user` → kullanıcı botu engellemiş; contact'ı pasifle. `chat not found` → geçersiz `chatId`.
- **Bot API "start" kısıtı:** Bot, kullanıcı `/start` demeden ona mesaj atamaz. Akışta önce hastayı bota yönlendiren bir **deep link** (`https://t.me/<bot>?start=<token>`) üret; hasta başlattığında `chat_id`'yi `telegram_contacts`'a kaydet.

```typescript
// Basit 429 retry örneği
async function withRetry<T>(fn: () => Promise<T>, max = 3): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (e: any) {
      const retryAfter = e?.response?.parameters?.retry_after;
      if (retryAfter && i < max) {
        await new Promise((r) => setTimeout(r, (retryAfter + 1) * 1000));
        continue;
      }
      throw e;
    }
  }
}
```

---

## 9. Test

- **Bot API:** Test botu oluştur, webhook'u bir tünel (ngrok) arkasından kur, `secret_token` doğrulamasını ve gelen/giden akışı doğrula. Birim testlerde `bot.telegram` mock'lanır.
- **MTProto:** Tek seferlik `confirmLogin` ile geçerli bir StringSession üret, testte `.env`'den oku. Gerçek hesapla otomatik test yaparken hız sınırına ve ban riskine dikkat; tercihen ayrı bir test numarası kullan.
- **Strateji katmanı:** `TelegramService.sendMessage` için her iki provider'ı mock'layıp doğru strategy'nin seçildiğini test et.

```typescript
it('bot_api kliniğinde BotApiStrategy seçilir', async () => {
  accounts.findActive.mockResolvedValue({ provider: 'bot_api' });
  await service.sendMessage({ clinicId: 'c1', chatId: 1, text: 'merhaba' });
  expect(botApi.sendMessage).toHaveBeenCalled();
  expect(mtproto.sendMessage).not.toHaveBeenCalled();
});
```

---

## 10. Kurulum Kontrol Listesi

**Ortak**
- [ ] `TELEGRAM_ENC_KEY` (64 hex) üretildi ve secret manager'a kondu
- [ ] `PUBLIC_BASE_URL` HTTPS olarak ayarlandı
- [ ] `clinic_telegram_accounts` ve `telegram_contacts` tabloları oluşturuldu

**Bot API yolu**
- [ ] `telegraf` kuruldu
- [ ] Klinik BotFather'dan token aldı → `connectClinic` ile kaydedildi, `getMe` doğrulandı
- [ ] Webhook `secret_token` ile kuruldu, `/telegram/bot/:clinicId` çalışıyor
- [ ] Hasta deep-link ile botu başlatıyor, `chat_id` kaydediliyor

**MTProto yolu**
- [ ] `telegram` (GramJS) kuruldu
- [ ] `TELEGRAM_API_ID` / `TELEGRAM_API_HASH` `my.telegram.org`'tan alındı
- [ ] `startLogin` → `confirmLogin` (kod + opsiyonel 2FA) akışı UI'da var
- [ ] StringSession şifreli saklanıyor
- [ ] Açılışta `MtprotoBootstrap` aktif oturumları bağlıyor
- [ ] Çoklu instance'ta MTProto tek worker'da çalışıyor
- [ ] Müşteri ToS/ban riski konusunda bilgilendirildi

---

## 11. Kaynaklar

- Telegram Bot API (resmi): https://core.telegram.org/bots/api
- Telegram MTProto / Client API (resmi): https://core.telegram.org/api
- Telegraf.js dokümantasyonu: https://telegraf.js.org/
- nestjs-telegraf (npm): https://www.npmjs.com/package/nestjs-telegraf
- GramJS dokümantasyonu (authorization): https://gram.js.org/getting-started/authorization
- GramJS (`telegram` npm paketi): https://www.npmjs.com/package/telegram
- API ID / API hash alma: https://my.telegram.org/apps
