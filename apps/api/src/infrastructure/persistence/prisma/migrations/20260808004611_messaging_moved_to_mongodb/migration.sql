-- Messaging bounded-context'i MongoDB'ye taşındı (bkz. documents/messaging-microservice.md).
--
-- ⚠️ ÖN KOŞUL: Bu migration UYGULANMADAN ÖNCE veri Mongo'ya taşınmış ve doğrulanmış
-- olmalıdır:
--     cd apps/api && pnpm migrate:messaging-mongo
-- Aksi halde yazışma geçmişi ve kanal kimlik bilgileri geri dönüşsüz silinir.
--
-- Klinik ilişkileri (FK) kaldırılıyor; messaging tarafında clinicId düz string olarak
-- taşınır ve klinik silindiğinde temizlik event ile yürür.

-- DropForeignKey
ALTER TABLE "clinic_ai_agent_configs" DROP CONSTRAINT "clinic_ai_agent_configs_clinic_id_fkey";

-- DropForeignKey
ALTER TABLE "clinic_instagram_channels" DROP CONSTRAINT "clinic_instagram_channels_clinic_id_fkey";

-- DropForeignKey
ALTER TABLE "clinic_telegram_channels" DROP CONSTRAINT "clinic_telegram_channels_clinic_id_fkey";

-- DropForeignKey
ALTER TABLE "clinic_whatsapp_channels" DROP CONSTRAINT "clinic_whatsapp_channels_clinic_id_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_conversation_id_fkey";

-- DropTable
DROP TABLE "clinic_ai_agent_configs";

-- DropTable
DROP TABLE "clinic_instagram_channels";

-- DropTable
DROP TABLE "clinic_telegram_channels";

-- DropTable
DROP TABLE "clinic_whatsapp_channels";

-- DropTable
DROP TABLE "conversations";

-- DropTable
DROP TABLE "messages";

-- DropEnum
DROP TYPE "AiProvider";

-- DropEnum
DROP TYPE "ConversationStatus";

-- DropEnum
DROP TYPE "MessageChannel";

-- DropEnum
DROP TYPE "MessageDirection";

-- DropEnum
DROP TYPE "MessageStatus";

-- DropEnum
DROP TYPE "MessageType";

-- DropEnum
DROP TYPE "TelegramChannelStatus";

-- DropEnum
DROP TYPE "TelegramProvider";

