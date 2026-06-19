-- CreateEnum
CREATE TYPE "MessageChannel" AS ENUM ('WHATSAPP');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'TEMPLATE', 'MEDIA');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('RECEIVED', 'QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('OPEN', 'PENDING', 'CLOSED');

-- CreateTable
CREATE TABLE "clinic_whatsapp_channels" (
    "id" TEXT NOT NULL,
    "phone_number_id" TEXT NOT NULL,
    "waba_id" TEXT,
    "display_phone_number" TEXT,
    "access_token" TEXT,
    "verify_token" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "clinic_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_whatsapp_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "channel" "MessageChannel" NOT NULL DEFAULT 'WHATSAPP',
    "contact_phone" TEXT NOT NULL,
    "contact_name" TEXT,
    "patient_id" TEXT,
    "lead_id" TEXT,
    "status" "ConversationStatus" NOT NULL DEFAULT 'OPEN',
    "assigned_user_id" TEXT,
    "last_message_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "direction" "MessageDirection" NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "body" TEXT,
    "media_url" TEXT,
    "status" "MessageStatus" NOT NULL,
    "external_id" TEXT,
    "error_reason" TEXT,
    "sent_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clinic_whatsapp_channels_phone_number_id_key" ON "clinic_whatsapp_channels"("phone_number_id");

-- CreateIndex
CREATE UNIQUE INDEX "clinic_whatsapp_channels_clinic_id_key" ON "clinic_whatsapp_channels"("clinic_id");

-- CreateIndex
CREATE INDEX "conversations_clinic_id_status_idx" ON "conversations"("clinic_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_clinic_id_channel_contact_phone_key" ON "conversations"("clinic_id", "channel", "contact_phone");

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "messages_external_id_idx" ON "messages"("external_id");

-- AddForeignKey
ALTER TABLE "clinic_whatsapp_channels" ADD CONSTRAINT "clinic_whatsapp_channels_clinic_id_fkey" FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
