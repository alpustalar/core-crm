-- AlterTable: WhatsApp kanal — Cloud API register + token ömrü alanları
ALTER TABLE "clinic_whatsapp_channels" ADD COLUMN "registration_pin" TEXT,
ADD COLUMN "registered_at" TIMESTAMP(3),
ADD COLUMN "token_expires_at" TIMESTAMP(3);
