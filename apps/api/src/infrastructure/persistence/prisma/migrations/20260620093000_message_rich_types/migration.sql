-- AlterEnum: zengin gelen mesaj tipleri
ALTER TYPE "MessageType" ADD VALUE IF NOT EXISTS 'INTERACTIVE';
ALTER TYPE "MessageType" ADD VALUE IF NOT EXISTS 'LOCATION';
ALTER TYPE "MessageType" ADD VALUE IF NOT EXISTS 'CONTACTS';
ALTER TYPE "MessageType" ADD VALUE IF NOT EXISTS 'REACTION';
ALTER TYPE "MessageType" ADD VALUE IF NOT EXISTS 'UNSUPPORTED';

-- AlterTable: yapısal gövde + alıntı referansı
ALTER TABLE "messages" ADD COLUMN "payload" JSONB,
ADD COLUMN "reply_to_external_id" TEXT;
