-- Kliniğin Telegram kanal config'i (messaging) — Clinic'ten ayrıştırılmış satellite.
-- Hibrit: provider=BOT_API (token+webhook) veya MTPROTO (numarayla kullanıcı hesabı).
-- Token/session TokenCipherService ile şifreli saklanır.
CREATE TYPE "TelegramProvider" AS ENUM ('BOT_API', 'MTPROTO');
CREATE TYPE "TelegramChannelStatus" AS ENUM ('PENDING', 'ACTIVE', 'ERROR', 'REVOKED');

CREATE TABLE "clinic_telegram_channels" (
    "id" TEXT NOT NULL,
    "provider" "TelegramProvider" NOT NULL,
    "status" "TelegramChannelStatus" NOT NULL DEFAULT 'PENDING',
    "bot_token_enc" TEXT,
    "bot_username" TEXT,
    "webhook_secret" TEXT,
    "phone_number" TEXT,
    "mtproto_session_enc" TEXT,
    "last_error" TEXT,
    "clinic_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_telegram_channels_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "clinic_telegram_channels_clinic_id_provider_key" ON "clinic_telegram_channels"("clinic_id", "provider");

ALTER TABLE "clinic_telegram_channels" ADD CONSTRAINT "clinic_telegram_channels_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
